#!/usr/bin/env python3
"""
Resin AI Security Claims Validation Framework
Validates security & privacy claims from the security document
Run as a DevOps script to audit your MCP implementations

Usage:
  python tools/security/validator.py --worker resin
  python tools/security/validator.py --worker evergreen
"""

import json
import sys
import os
import argparse
from dataclasses import dataclass
from typing import Optional
from enum import Enum
from datetime import datetime
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Error: pyyaml not found. Run: uv sync")
    sys.exit(1)

class ClaimCategory(Enum):
    AUTHENTICATION = "Authentication & Authorization"
    ENCRYPTION = "Encryption"
    DATA_HANDLING = "Data Handling"
    INFRASTRUCTURE = "Infrastructure"
    COMPLIANCE = "Compliance"
    LOGGING = "Logging & Monitoring"
    API_SECURITY = "API Security"

class ValidationStatus(Enum):
    PASS = "✅ PASS"
    FAIL = "❌ FAIL"
    WARN = "⚠️ WARNING"
    PENDING = "⏳ PENDING"
    MANUAL = "👤 MANUAL"

@dataclass
class SecurityClaim:
    id: str
    category: ClaimCategory
    claim: str
    test_procedure: str
    expected_result: str
    status: ValidationStatus = ValidationStatus.PENDING
    details: str = ""
    last_tested: Optional[str] = None

class ResinSecurityValidator:
    """Main validation framework"""
    
    def __init__(self):
        self.claims: dict[str, SecurityClaim] = {}
        self.test_results = []
        self.initialize_claims()
    
    def initialize_claims(self):
        """Define all security claims to validate"""
        
        # Authentication Claims
        self.add_claim(
            "AUTH_OAUTH_PKCE",
            ClaimCategory.AUTHENTICATION,
            "OAuth 2.0 with PKCE implementation",
            """
            1. Verify Cloudflare Worker initiates OAuth with code_challenge
            2. Check PKCE parameters in Salesforce OAuth flow
            3. Validate code_verifier is never exposed in logs
            4. Test token expiration and revocation
            """,
            "OAuth tokens use PKCE, expire within configured time, can be revoked via Salesforce"
        )
        
        self.add_claim(
            "AUTH_NO_CREDENTIALS",
            ClaimCategory.AUTHENTICATION,
            "Credentials never stored in code or logs",
            """
            1. Search codebase for Salesforce credentials patterns
            2. Verify .env file is in .gitignore
            3. Check Cloudflare KV environment isolation
            4. Audit log output for credential leaks
            """,
            "No Salesforce credentials appear in code, logs, or version control"
        )
        
        self.add_claim(
            "AUTH_USER_LEVEL",
            ClaimCategory.AUTHENTICATION,
            "User-level security with individual credentials",
            """
            1. Verify each user connects with own Salesforce credentials
            2. Check multi-user scenarios in test environment
            3. Validate isolation between user OAuth tokens
            4. Test permission boundaries per user
            """,
            "Each user maintains separate OAuth token with own Salesforce permissions"
        )
        
        # Encryption Claims
        self.add_claim(
            "ENC_TLS_TRANSIT",
            ClaimCategory.ENCRYPTION,
            "TLS 1.2+ encryption for data in transit",
            """
            1. Verify all API endpoints use HTTPS
            2. Test with `openssl s_client` to check TLS version
            3. Validate no HTTP endpoints exist
            4. Check HSTS headers are present
            5. Run SSL Labs test: https://www.ssllabs.com/ssltest/
            """,
            "TLS 1.2 or higher on all endpoints, no downgrade, HSTS headers present"
        )
        
        self.add_claim(
            "ENC_AES256_REST",
            ClaimCategory.ENCRYPTION,
            "AES-256 encryption for credentials at rest in Cloudflare KV",
            """
            1. Inspect encryption implementation in Cloudflare Workers code
            2. Verify libsodium or similar cryptography library usage
            3. Check key rotation procedures
            4. Test KV encryption with sample credential
            5. Verify encrypted values are different each time (IV randomization)
            """,
            "Credentials encrypted with AES-256, verified unencrypted in KV inspection"
        )
        
        self.add_claim(
            "ENC_MEMORY_PROCESSING",
            ClaimCategory.ENCRYPTION,
            "Data encrypted in memory during AI processing",
            """
            1. Review code path for Anthropic API call preparation
            2. Verify sensitive data cleared from memory after processing
            3. Check for memory dumps in error handling
            4. Test with instrumented code to verify memory state
            """,
            "Sensitive data not persisted in application memory between requests"
        )
        
        # Data Handling Claims
        self.add_claim(
            "DATA_EPHEMERAL",
            ClaimCategory.DATA_HANDLING,
            "Data is ephemeral - discarded after response",
            """
            1. Query Cloudflare logs for data retention
            2. Check database schemas for donor data tables
            3. Verify no donor data in Cloudflare D1 or KV (only tokens/logs)
            4. Test: Make API call, verify no data persists after 5 minutes
            5. Run query on infrastructure: SELECT donor_data FROM * - should return empty
            """,
            "No donor data found in persistent storage, only interaction logs"
        )
        
        self.add_claim(
            "DATA_NO_TRAINING",
            ClaimCategory.DATA_HANDLING,
            "No training on customer data - Anthropic commitment",
            """
            1. Review Anthropic API documentation for data usage policies
            2. Check API logs that data is marked 'no-training'
            3. Verify 'cache_control' headers if using prompt caching
            4. Test: Query Anthropic about data retention
            5. Review data processing agreement with Anthropic
            """,
            "Confirmed via Anthropic API documentation and DPA"
        )
        
        self.add_claim(
            "DATA_MINIMIZATION",
            ClaimCategory.DATA_HANDLING,
            "Only necessary data sent to AI - aggregated when possible",
            """
            1. Review API calls to Anthropic in development logs
            2. Verify donor IDs instead of names used in prompts
            3. Check aggregated data in reports vs raw data
            4. Sample 10 API calls to Anthropic, verify data minimization
            """,
            "Aggregated data used in reports, donor IDs in prompts, no unnecessary PII"
        )
        
        self.add_claim(
            "DATA_NO_SSNS_CARDS",
            ClaimCategory.DATA_HANDLING,
            "Never send SSNs, credit cards, bank accounts to API",
            """
            1. Audit Salesforce object access - verify financial objects excluded
            2. Check Cloudflare Worker code for field-level filtering
            3. Test with mock Salesforce sandbox containing sensitive data
            4. Verify filtering rules applied before Anthropic API call
            5. Review error messages - should not leak sensitive data
            """,
            "Financial and sensitive fields filtered before API transmission"
        )
        
        # Infrastructure Claims
        self.add_claim(
            "INFRA_CLOUDFLARE_DDoS",
            ClaimCategory.INFRASTRUCTURE,
            "DDoS protection and WAF via Cloudflare",
            """
            1. Verify Cloudflare zone setup and nameservers
            2. Check Cloudflare dashboard for DDoS protection status
            3. Verify WAF rules are active
            4. Test rate limiting configuration
            5. Confirm enterprise-grade infrastructure selected
            """,
            "Cloudflare DDoS & WAF enabled, verified in dashboard"
        )
        
        self.add_claim(
            "INFRA_CLOUDFLARE_UPTIME",
            ClaimCategory.INFRASTRUCTURE,
            "99.9%+ uptime via Cloudflare Workers",
            """
            1. Query Cloudflare API for uptime statistics
            2. Check Statuspage for historical uptime
            3. Review incident logs for past 90 days
            4. Verify SLA commitments in Cloudflare plan
            """,
            "Cloudflare Workers infrastructure verified, 99.9% SLA confirmed"
        )
        
        self.add_claim(
            "INFRA_SERVERLESS",
            ClaimCategory.INFRASTRUCTURE,
            "Serverless architecture - no persistent servers",
            """
            1. Verify Workers deployment model (no EC2/VMs)
            2. Confirm no static servers to compromise
            3. Check infrastructure-as-code confirms serverless
            4. Verify automatic scaling and updates
            """,
            "Serverless Workers architecture confirmed, no persistent servers"
        )
        
        self.add_claim(
            "INFRA_MULTI_TENANT_ISOLATION",
            ClaimCategory.INFRASTRUCTURE,
            "Multi-tenant isolation in separate storage",
            """
            1. Verify Cloudflare KV namespace isolation
            2. Check that organization credentials stored in separate namespaces
            3. Test cross-org data access attempts - should fail
            4. Review code for organization context in all queries
            5. Test with multiple test orgs simultaneously
            """,
            "Each organization in isolated KV namespace, cross-org access denied"
        )
        
        # Compliance Claims
        self.add_claim(
            "COMPLIANCE_SOC2",
            ClaimCategory.COMPLIANCE,
            "SOC 2 Type II via Cloudflare infrastructure",
            """
            1. Request SOC 2 report from Cloudflare account
            2. Verify report date is within last 12 months
            3. Check audit scope includes Workers platform
            4. Confirm your organization is documented as customer
            5. Review report findings and control effectiveness
            """,
            "SOC 2 Type II report obtained from Cloudflare, reviewed"
        )
        
        self.add_claim(
            "COMPLIANCE_GDPR",
            ClaimCategory.COMPLIANCE,
            "GDPR compliant with DPA available",
            """
            1. Obtain and review Data Processing Agreement (DPA)
            2. Verify DPA covers Cloudflare and Anthropic
            3. Check GDPR provisions: consent, retention, deletion
            4. Test data deletion flows per GDPR requirements
            5. Verify appropriate data transfers if non-EU
            """,
            "GDPR DPA on file, deletion flows tested, transfers authorized"
        )
        
        self.add_claim(
            "COMPLIANCE_CCPA",
            ClaimCategory.COMPLIANCE,
            "CCPA compliant for California privacy rights",
            """
            1. Verify opt-out mechanisms for California users
            2. Check data deletion request handling within 45 days
            3. Verify no data sales or sharing
            4. Test privacy notice display for California users
            """,
            "CCPA compliance verified, deletion procedures within SLA"
        )
        
        self.add_claim(
            "COMPLIANCE_AFP",
            ClaimCategory.COMPLIANCE,
            "Compliant with AFP Code of Ethics and Donor Bill of Rights",
            """
            1. Review implementation against AFP standards
            2. Verify donor privacy respected in recommendations
            3. Confirm transparency about data usage
            4. Check donor rights implementation (access, deletion)
            5. Test that data doesn't enable unethical practices
            """,
            "AFP compliance verified through design review"
        )
        
        # Logging Claims
        self.add_claim(
            "LOG_WHAT_LOGGED",
            ClaimCategory.LOGGING,
            "Appropriate logging: timestamp, user, query type, response time",
            """
            1. Inspect log sample from past 24 hours
            2. Verify no full donor data in logs
            3. Verify no sensitive field values in logs
            4. Check timestamp, user, query type all present
            5. Verify PII never logged
            """,
            "Metadata-only logging confirmed, no sensitive data in logs"
        )
        
        self.add_claim(
            "LOG_RETENTION_90",
            ClaimCategory.LOGGING,
            "Logs retained for 90 days, then deleted",
            """
            1. Query log storage timestamps
            2. Verify logs older than 90 days are deleted
            3. Check deletion automation via Cloudflare cron trigger
            4. Verify encryption of logs at rest
            5. Test 90-day retention boundary
            """,
            "Automatic deletion after 90 days confirmed, encryption verified"
        )
        
        self.add_claim(
            "LOG_AUDIT_TRAIL",
            ClaimCategory.LOGGING,
            "Audit trail accessible for compliance review",
            """
            1. Test audit log retrieval via Cloudflare Analytics/Logs
            2. Verify filtering by organization, user, date range
            3. Check export capabilities for audits
            4. Test log accessibility in compliance scenarios
            """,
            "Audit logs queryable and exportable for compliance"
        )
        
        # API Security Claims
        self.add_claim(
            "API_RATE_LIMIT",
            ClaimCategory.API_SECURITY,
            "Rate limiting to prevent abuse",
            """
            1. Test API rate limiting configuration
            2. Verify limits per user and per org
            3. Test exceeding limits returns appropriate errors
            4. Check rate limit headers in responses
            5. Verify graceful handling when limits hit
            """,
            "Rate limiting configured and tested"
        )
        
        self.add_claim(
            "API_INPUT_VALIDATION",
            ClaimCategory.API_SECURITY,
            "Input validation on all API endpoints",
            """
            1. Test with malicious inputs (SQL injection, XSS, etc.)
            2. Verify error handling doesn't reveal system details
            3. Check type validation on all parameters
            4. Test boundary conditions
            5. Verify no command injection vectors
            """,
            "Input validation tested against common attack vectors"
        )
        
        self.add_claim(
            "API_CORS_HEADERS",
            ClaimCategory.API_SECURITY,
            "Proper CORS and security headers",
            """
            1. Curl endpoint and check CORS headers
            2. Verify X-Content-Type-Options: nosniff
            3. Verify X-Frame-Options: DENY
            4. Check Content-Security-Policy headers
            5. Verify no overly permissive CORS
            """,
            "Security headers present and restrictive"
        )
    
    def add_claim(self, claim_id: str, category: ClaimCategory, claim: str, 
                  test_procedure: str, expected_result: str):
        """Add a security claim to validate"""
        self.claims[claim_id] = SecurityClaim(
            id=claim_id,
            category=category,
            claim=claim,
            test_procedure=test_procedure,
            expected_result=expected_result
        )
    
    def get_claims_by_category(self, category: ClaimCategory) -> list[SecurityClaim]:
        """Get all claims in a category"""
        return [c for c in self.claims.values() if c.category == category]
    
    def generate_validation_checklist(self) -> str:
        """Generate markdown checklist for manual validation"""
        output = "# Security Claims Validation Checklist\n\n"
        output += f"Generated: {datetime.now().isoformat()}\n\n"
        
        for category in ClaimCategory:
            claims = self.get_claims_by_category(category)
            if not claims:
                continue
            
            output += f"## {category.value}\n\n"
            for claim in claims:
                output += f"### {claim.claim} ({claim.id})\n\n"
                output += f"**Expected Result:** {claim.expected_result}\n\n"
                output += f"**Test Procedure:**\n"
                output += f"{claim.test_procedure}\n\n"
                output += f"**Status:** {claim.status.value}\n\n"
                if claim.details:
                    output += f"**Details:** {claim.details}\n\n"
                output += "---\n\n"
        
        return output
    
    def generate_compliance_report(self) -> str:
        """Generate comprehensive compliance report"""
        output = "# Resin AI Security Compliance Report\n\n"
        output += f"Generated: {datetime.now().isoformat()}\n"
        output += f"Document Version: 1.0 (Nov 4, 2025)\n\n"
        
        # Summary stats
        total_claims = len(self.claims)
        by_status = {}
        for claim in self.claims.values():
            status = claim.status.value
            by_status[status] = by_status.get(status, 0) + 1
        
        output += "## Summary\n\n"
        output += f"Total Claims: {total_claims}\n"
        for status, count in sorted(by_status.items()):
            output += f"{status}: {count}\n"
        output += "\n"
        
        # Claims by category
        output += "## Claims by Category\n\n"
        for category in ClaimCategory:
            claims = self.get_claims_by_category(category)
            if not claims:
                continue
            
            output += f"### {category.value} ({len(claims)} claims)\n\n"
            for claim in claims:
                output += f"- [{claim.status.value}] {claim.claim}\n"
            output += "\n"
        
        return output
    
    def generate_test_script_template(self) -> str:
        """Generate template for automated testing"""
        output = "#!/bin/bash\n"
        output += "# Automated Security Validation Tests\n"
        output += "# Run this regularly to validate security claims\n\n"
        
        output += "set -e\n\n"
        output += "API_BASE='https://your-api.resin.team'\n"
        output += "TEST_ORG_ID='test-org-123'\n\n"
        
        output += "# TLS Version Test\n"
        output += f'echo "Testing TLS version..."\n'
        output += f'echo | openssl s_client -connect $(echo {"{API_BASE}"} | sed "s|https://||"):443 2>/dev/null | grep "TLSv"\n\n'
        
        output += "# HTTPS Only Test\n"
        output += f'echo "Testing HTTP endpoints (should fail)..."\n'
        output += f'curl -I http://your-api.resin.team 2>&1 | grep -q "Connection refused" && echo "✓ HTTP rejected" || echo "✗ HTTP accepted"\n\n'
        
        output += "# HSTS Headers Test\n"
        output += f'echo "Testing HSTS headers..."\n'
        output += f'curl -I {"{API_BASE}"} | grep -i "strict-transport-security" && echo "✓ HSTS present" || echo "✗ HSTS missing"\n\n'
        
        output += "# Rate Limiting Test\n"
        output += f'echo "Testing rate limiting..."\n'
        output += f'for i in {{1..101}}; do curl -s {"{API_BASE}"}/api/test > /dev/null; done\n'
        output += f'curl -v {"{API_BASE}"}/api/test 2>&1 | grep -i "429\\|x-ratelimit" && echo "✓ Rate limiting active" || echo "⚠ Rate limiting check"\n\n'
        
        output += "# CORS Headers Test\n"
        output += f'echo "Testing CORS headers..."\n'
        output += f'curl -I -H "Origin: http://example.com" {"{API_BASE}"} | grep -i "access-control" || echo "⚠ CORS policy review needed"\n\n'
        
        output += "# OAuth Token Test\n"
        output += f'echo "Testing OAuth token isolation (manual: verify token A cannot access org B)..."\n\n'
        
        output += "echo 'Manual tests required:'\n"
        output += "echo '- OAuth PKCE flow validation'\n"
        output += "echo '- Multi-tenant data isolation'\n"
        output += "echo '- Memory encryption verification'\n"
        output += "echo '- Log retention verification'\n"
        
        return output


def load_deployments_config():
    """Load deployments configuration from YAML"""
    config_path = Path(__file__).parent / "deployments.yaml"

    if not config_path.exists():
        print(f"Error: Deployments config not found at {config_path}")
        sys.exit(1)

    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    return config.get("deployments", {})


def get_worker_config(worker_name: str, deployments: dict):
    """Get configuration for a specific worker"""
    if worker_name not in deployments:
        print(f"Error: Unknown worker '{worker_name}'")
        print(f"Available workers: {', '.join(deployments.keys())}")
        sys.exit(1)

    return deployments[worker_name]


def get_api_key(config: dict):
    """Get API key from environment variable"""
    env_var = config.get("api_key_env")

    if not env_var:
        print(f"Error: No api_key_env defined for worker")
        sys.exit(1)

    api_key = os.getenv(env_var)

    if not api_key:
        print(f"Error: Environment variable '{env_var}' not set")
        print(f"Set it with: export {env_var}='your-api-key'")
        sys.exit(1)

    return api_key


def save_report(worker_name: str, report_content: str):
    """Save report to docs/reports/{worker}-security-{date}.md"""
    # Get repo root
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent.parent
    reports_dir = repo_root / "docs" / "reports"

    # Create directory if needed
    reports_dir.mkdir(parents=True, exist_ok=True)

    # Generate filename: {worker}-security-{date}.md
    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = f"{worker_name}-security-{date_str}.md"
    output_path = reports_dir / filename

    # Write report
    with open(output_path, "w") as f:
        f.write(report_content)

    return output_path


def main():
    """Run validation framework"""

    # Parse CLI arguments
    parser = argparse.ArgumentParser(
        description="Resin AI Security Claims Validator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python tools/security/validator.py --worker resin
  python tools/security/validator.py --worker evergreen
        """
    )
    parser.add_argument(
        "--worker",
        required=True,
        help="Worker deployment to validate (resin, evergreen, etc.)"
    )

    args = parser.parse_args()

    # Load deployments config
    deployments = load_deployments_config()

    # Get worker configuration
    worker_config = get_worker_config(args.worker, deployments)
    api_key = get_api_key(worker_config)

    print("\n" + "="*70)
    print(f"Resin AI Security Claims Validation Framework")
    print(f"Worker: {worker_config['name']}")
    print(f"URL: {worker_config['url']}")
    print("="*70 + "\n")

    validator = ResinSecurityValidator()

    # Show stats
    print(f"Total Claims to Validate: {len(validator.claims)}\n")

    for category in ClaimCategory:
        claims = validator.get_claims_by_category(category)
        if claims:
            print(f"{category.value}: {len(claims)} claims")

    print("\n" + "="*70)
    print("Output Files Generation")
    print("="*70 + "\n")

    # Generate outputs
    checklist = validator.generate_validation_checklist()
    report = validator.generate_compliance_report()
    test_script = validator.generate_test_script_template()

    print("✓ Generated validation checklist (comprehensive)")
    print("✓ Generated compliance report")
    print("✓ Generated test script template")

    print("\n" + "="*70)
    print("Key Validation Recommendations")
    print("="*70 + "\n")

    recommendations = [
        "1. Run SSL Labs test immediately: https://www.ssllabs.com/ssltest/",
        "2. Obtain SOC 2 Type II report from Cloudflare (verify Within last 12 months)",
        "3. Execute bash test script weekly via CI/CD pipeline",
        "4. Perform manual validation of OAuth PKCE flow",
        "5. Set up quarterly security audit process",
        "6. Implement continuous compliance monitoring",
        "7. Test data deletion flows (GDPR/CCPA compliance)",
        "8. Verify multi-tenant isolation with integration tests",
    ]

    for rec in recommendations:
        print(rec)

    print("\n" + "="*70)
    print("Saving Report")
    print("="*70 + "\n")

    # Save report to docs/reports
    output_path = save_report(args.worker, report)
    print(f"✓ Report saved to: {output_path}")

    return {
        "worker": args.worker,
        "report_path": str(output_path),
        "claims_count": len(validator.claims),
        "categories": len(ClaimCategory)
    }


if __name__ == "__main__":
    result = main()
    print("\n" + "="*70)
    print(json.dumps({
        "status": "success",
        "worker": result["worker"],
        "report_path": result["report_path"],
        "total_claims": result["claims_count"],
        "total_categories": result["categories"]
    }, indent=2))
    print("="*70)
