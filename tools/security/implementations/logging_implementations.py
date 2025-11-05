"""
Logging & Monitoring Security Claims - Implementations
Tests for claims: LOG_WHAT_LOGGED, LOG_RETENTION_90, LOG_AUDIT_TRAIL
"""

import json
import re
from typing import Tuple, Optional, List, Dict
import requests

# Import ValidationStatus from parent package using relative import
# Use ..claim_tests to go up to tools/security/ then import claim_tests
try:
    # When imported from tests
    from claim_tests import ValidationStatus
except ImportError:
    # When imported normally as a package
    from ..claim_tests import ValidationStatus


class LoggingImplementations:
    """
    Logging and monitoring security claim implementations
    """

    # Patterns for sensitive data that should NEVER appear in logs
    SENSITIVE_PATTERNS = {
        "ssn": r"\b\d{3}-\d{2}-\d{4}\b",  # SSN pattern
        "credit_card": r"\b\d{13,19}\b",  # Credit card
        "api_key": r"(api[_-]?key|bearer|authorization)\s*[:=]\s*['\"]?[a-zA-Z0-9\-_]{20,}['\"]?",
        "password": r"(password|passwd|pwd)\s*[:=]\s*['\"]?[^'\"]{6,}['\"]?",
        "email": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
        "phone": r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
        "pii_names": r"(first_name|last_name|full_name|name)\s*[:=]",
        "ip_address": r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
    }

    def __init__(self, worker_url: str, api_key: str):
        """
        Initialize logging tests

        Args:
            worker_url: Full URL to worker (e.g., https://resin.mpazbot.workers.dev)
            api_key: Bearer token for authentication
        """
        self.worker_url = worker_url
        self.api_key = api_key

    def test_log_what_logged(self) -> Tuple[ValidationStatus, str]:
        """
        Test: Appropriate logging - timestamp, user, query type, response time
        Verify logs contain metadata but NOT sensitive data

        Expected log format:
        {
            "timestamp": "2025-11-05T07:19:06.947781",
            "level": "info",
            "message": "Request completed",
            "context": {
                "requestId": "req_123...",
                "endpoint": "/health",
                "method": "GET"
            },
            "data": {
                "statusCode": 200,
                "durationMs": 11
            }
        }
        """
        try:
            # Query recent logs from worker
            logs = self._fetch_recent_logs(limit=50)

            if not logs:
                return (
                    ValidationStatus.WARN,
                    "No logs available for analysis. Ensure logging is enabled."
                )

            # Validate log structure and content
            validation = self._validate_log_structure(logs)
            if validation[0] != ValidationStatus.PASS:
                return validation

            # Check for sensitive data leaks
            sensitive_check = self._check_for_sensitive_data(logs)
            if sensitive_check[0] != ValidationStatus.PASS:
                return sensitive_check

            # Analyze metadata presence
            metadata_check = self._verify_metadata_presence(logs)

            return metadata_check

        except Exception as e:
            return (
                ValidationStatus.WARN,
                f"Log verification incomplete: {str(e)}. "
                "Ensure Cloudflare Workers logging is configured."
            )

    def test_log_retention_90(self) -> Tuple[ValidationStatus, str]:
        """
        Test: Logs retained for 90 days, then deleted
        Verify automatic deletion via Cloudflare cron trigger

        This test checks:
        1. Oldest logs are approximately 90 days old
        2. No logs older than 90 days exist
        3. Log deletion is automated
        """
        raise NotImplementedError(
            "90-day log retention verification not yet implemented. "
            "Need to: 1) Query log timestamps, "
            "2) Verify oldest log is ~90 days old, "
            "3) Confirm deletion automation"
        )

    def test_log_audit_trail(self) -> Tuple[ValidationStatus, str]:
        """
        Test: Audit trail accessible for compliance review
        Verify audit logs are queryable, exportable, and filterable

        Features to verify:
        1. Logs queryable by organization
        2. Logs queryable by user
        3. Logs queryable by date range
        4. Logs exportable for audits
        """
        raise NotImplementedError(
            "Audit trail verification not yet implemented. "
            "Need to: 1) Test log retrieval via Cloudflare Analytics, "
            "2) Verify filtering (org, user, date), "
            "3) Test export capabilities"
        )

    # ============================================================================
    # Helper Methods
    # ============================================================================

    def _fetch_recent_logs(self, limit: int = 50) -> List[Dict]:
        """
        Fetch recent logs from the worker

        For Cloudflare Workers, this would typically query:
        - Cloudflare Logpush API
        - Or tail logs via wrangler
        - Or Analytics Engine

        For now, we're stubbing this for testing.
        Real implementation would:
        1. Use Cloudflare API with account token
        2. Filter by worker name
        3. Get most recent N logs
        """
        # TODO: Implement actual Cloudflare log querying
        # This requires Cloudflare API credentials, not just the worker API key

        return []  # Placeholder

    def _validate_log_structure(self, logs: List[Dict]) -> Tuple[ValidationStatus, str]:
        """
        Validate log structure matches expected format

        Expected structure:
        - timestamp (ISO format)
        - level (info, warn, error)
        - message (string)
        - context (dict with requestId, endpoint, method)
        - data (dict with statusCode, durationMs)
        """
        required_fields = ["timestamp", "level", "message"]
        invalid_logs = []

        for i, log in enumerate(logs):
            missing_fields = [f for f in required_fields if f not in log]
            if missing_fields:
                invalid_logs.append((i, missing_fields))

        if invalid_logs:
            details = f"Found {len(invalid_logs)} logs with missing fields. Examples: "
            details += ", ".join([f"Log {i}: missing {', '.join(fields)}" for i, fields in invalid_logs[:3]])
            return (ValidationStatus.WARN, details)

        return (ValidationStatus.PASS, "Log structure valid")

    def _check_for_sensitive_data(self, logs: List[Dict]) -> Tuple[ValidationStatus, str]:
        """
        Check logs for sensitive data leaks

        Searches for patterns that indicate PII/credentials are being logged:
        - SSNs
        - Credit cards
        - API keys
        - Passwords
        - Emails
        - Phone numbers
        - Full names
        - IP addresses
        """
        leaked_patterns = {}
        found_sensitive = False

        for log in logs:
            log_str = json.dumps(log)

            for pattern_name, pattern in self.SENSITIVE_PATTERNS.items():
                if re.search(pattern, log_str, re.IGNORECASE):
                    if pattern_name not in leaked_patterns:
                        leaked_patterns[pattern_name] = 0
                    leaked_patterns[pattern_name] += 1
                    found_sensitive = True

        if found_sensitive:
            leaked_list = ", ".join([f"{name} ({count}x)" for name, count in leaked_patterns.items()])
            return (
                ValidationStatus.FAIL,
                f"SECURITY ISSUE: Found sensitive data in logs: {leaked_list}. "
                "Logs must not contain PII or credentials."
            )

        return (
            ValidationStatus.PASS,
            "No sensitive data detected in logs"
        )

    def _verify_metadata_presence(self, logs: List[Dict]) -> Tuple[ValidationStatus, str]:
        """
        Verify logs contain required metadata fields

        Required metadata:
        - timestamp: when the request occurred
        - requestId: unique identifier for tracing
        - endpoint: which endpoint was called
        - method: HTTP method (GET, POST, etc.)
        - statusCode: HTTP response code
        - durationMs: how long the request took
        """
        metadata_fields = {
            "timestamp": 0,
            "requestId": 0,
            "endpoint": 0,
            "method": 0,
            "statusCode": 0,
            "durationMs": 0,
        }

        for log in logs:
            # Check top-level fields
            if "timestamp" in log:
                metadata_fields["timestamp"] += 1

            # Check context object
            context = log.get("context", {})
            if "requestId" in context:
                metadata_fields["requestId"] += 1
            if "endpoint" in context:
                metadata_fields["endpoint"] += 1
            if "method" in context:
                metadata_fields["method"] += 1

            # Check data object
            data = log.get("data", {})
            if "statusCode" in data:
                metadata_fields["statusCode"] += 1
            if "durationMs" in data:
                metadata_fields["durationMs"] += 1

        # Calculate presence percentage
        total_logs = len(logs)
        missing_fields = [
            field for field, count in metadata_fields.items()
            if count < total_logs * 0.8  # Allow 20% missing (e.g., statusCode for logs without responses)
        ]

        if missing_fields:
            return (
                ValidationStatus.WARN,
                f"Some metadata fields missing from logs: {', '.join(missing_fields)}. "
                "Logs should include timestamp, requestId, endpoint, method, statusCode, durationMs."
            )

        return (
            ValidationStatus.PASS,
            f"All metadata fields present in {total_logs} logs. "
            "Metadata-only logging confirmed, no sensitive data in logs."
        )
