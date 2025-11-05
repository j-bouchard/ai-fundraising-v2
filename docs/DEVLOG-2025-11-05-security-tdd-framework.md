# Security Claims Validator - TDD Framework

**Location:** `tools/security/`

## Overview

We built a comprehensive Test-Driven Development (TDD) framework for validating 24 security claims across Resin Cloudflare Workers deployments. The framework separates test definitions from implementations, enabling incremental development of security tests without breaking existing functionality. Each claim follows a consistent pattern: define the test, implement it in a modular file, and verify with pytest.

## Problem Statement

We needed a way to:
1. **Validate multiple security claims** across Cloudflare Workers deployments (resin, evergreen, etc.)
2. **Track progress incrementally** without all-or-nothing implementation pressure
3. **Maintain code organization** following Python best practices in a monorepo environment
4. **Run as a DevOps tool** that can be executed on-demand or via cron, independent of Cloudflare runtime

Previous approaches attempted to put this in the Workers runtime (`mcp/resin/`), but security validation is fundamentally a local development/auditing concern that doesn't belong in production code.

## Architecture Decisions

### 1. Monorepo Module Independence

**Decision:** Create `tools/security/` as a completely independent Python module with its own `pyproject.toml`, virtual environment, and dependencies.

**Why this matters in a monorepo:**
- `mcp/resin/` has its own Node.js/TypeScript dependencies and deployment routines
- `tools/security/` has Python dependencies and different release cycles
- Each module can be deployed, versioned, and updated independently
- Prevents dependency conflicts (e.g., conflicting package versions)

**Implementation:**
```
tools/security/
├── .venv/                    # Independent virtual environment
├── pyproject.toml            # Separate project config
├── uv.lock                   # Reproducible lock file
└── .gitignore                # Local .venv excluded
```

Running `uv sync` in `tools/security/` creates `.venv/` locally, completely isolated from the rest of the monorepo.

### 2. Test vs. Implementation Separation

**Decision:** Separate test definitions (what to test) from implementations (how to test).

**Test Definition Layer (claim_tests.py):**
```python
def test_log_what_logged(self) -> Tuple[ValidationStatus, str]:
    """Test: Appropriate logging - timestamp, user, query type, response time"""
    from implementations.logging_implementations import LoggingImplementations
    impl = LoggingImplementations(self.worker_url, self.api_key)
    return impl.test_log_what_logged()
```

**Benefits:**
- ✅ Tests can be skipped with `@pytest.mark.skip()` without removing code
- ✅ All 24 test methods exist immediately (clear roadmap)
- ✅ Tests raise `NotImplementedError` until implemented
- ✅ Framework is self-documenting about what's pending

### 3. Modular Implementation Files

**Decision:** One implementation file per claim **category**, not one per claim.

**Categories:**
- `logging_implementations.py` - 3 logging tests
- `encryption_implementations.py` (pending) - 3 encryption tests
- `auth_implementations.py` (pending) - 3 authentication tests
- `api_implementations.py` (pending) - 3 API security tests
- (Additional files as needed for data handling, infrastructure)

**Why grouping by category:**
- ✅ Related tests share utility functions
- ✅ Easier to understand domain-specific logic
- ✅ Manageable file sizes (not 24 separate files)
- ✅ Natural organization matching test categories

### 4. Flexible Import Paths

**Decision:** Use try/except pattern to support both direct execution and package-level imports.

```python
# In implementations/logging_implementations.py
try:
    # When imported from tests via sys.path manipulation
    from claim_tests import ValidationStatus
except ImportError:
    # When imported normally as a package
    from ..claim_tests import ValidationStatus
```

**Why this pattern:**
- ✅ Same code works from `pytest` and direct execution
- ✅ No special pytest plugins needed
- ✅ Flexible import path resolution
- ✅ Future-proof for package distribution

## Core Concepts

### ValidationStatus Enum

```python
class ValidationStatus(Enum):
    PASS = "✅ PASS"           # Test passed
    FAIL = "❌ FAIL"           # Test failed - security issue found
    WARN = "⚠️ WARNING"        # Test passed but with warnings
    PENDING = "⏳ PENDING"     # Test not yet implemented
    MANUAL = "👤 MANUAL"       # Requires manual human review
```

**Usage pattern:**
```python
def test_log_what_logged(self) -> Tuple[ValidationStatus, str]:
    # Return both status and human-readable details
    return (ValidationStatus.PASS, "All metadata fields present in logs")
```

### ClaimTester Class

```python
class ClaimTester:
    def __init__(self, worker_url: str, api_key: str):
        self.worker_url = worker_url
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "Resin-SecurityValidator/1.0"
        })
```

**24 test methods organized by category:**

| Category | Tests | Count |
|----------|-------|-------|
| Authentication | OAuth PKCE, No Credentials, User-Level | 3 |
| Encryption | TLS Transit, AES-256 Rest, Memory Processing | 3 |
| Data Handling | Ephemeral, No Training, Minimization, No SSNs/Cards | 4 |
| Infrastructure | DDoS Protection, Uptime, Serverless, Multi-tenant | 4 |
| Compliance | SOC2, GDPR, CCPA, AFP | 4 |
| Logging | What Logged, 90-day Retention, Audit Trail | 3 |
| API Security | Rate Limiting, Input Validation, CORS Headers | 3 |

### Multi-Worker Deployments

**Configuration in deployments.yaml:**
```yaml
deployments:
  resin:
    url: https://resin.mpazbot.workers.dev
    api_key_env: RESIN_API_KEY
  evergreen:
    url: https://evergreen.mpazbot.workers.dev
    api_key_env: EVERGREEN_API_KEY
```

**Enables multi-client testing:**
```bash
# Test resin deployment
RESIN_API_KEY="..." ./scripts/security/validate-deployment.sh resin

# Test evergreen deployment
EVERGREEN_API_KEY="..." ./scripts/security/validate-deployment.sh evergreen
```

## Detailed Implementation

### Security Claim Implementation: test_log_what_logged

The first implemented test validates that logs contain proper metadata without exposing sensitive data.

**What it checks:**
1. Log structure (timestamp, level, message required)
2. Metadata presence (requestId, endpoint, method, statusCode, durationMs)
3. Sensitive data patterns (SSN, credit cards, API keys, passwords, emails, phones, IPs, names)

**Implementation in logging_implementations.py:**

```python
SENSITIVE_PATTERNS = {
    "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
    "credit_card": r"\b\d{13,19}\b",
    "api_key": r"(api[_-]?key|bearer|authorization)...",
    "password": r"(password|passwd|pwd)...",
    "email": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\...",
    "phone": r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
    "pii_names": r"(first_name|last_name|full_name|name)...",
    "ip_address": r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
}
```

**Return values:**
- ✅ `PASS` - All metadata present, no sensitive data detected
- ⚠️ `WARN` - Missing some metadata fields (allowed up to 20% absence)
- ❌ `FAIL` - Sensitive data found in logs (security issue)
- ⏳ `WARN` - No logs available (can't verify yet)

## Usage Examples

### Running All Tests

```bash
cd tools/security
uv run pytest tests/test_claim_tests.py -v
```

**Output:**
```
============================= test session starts ==============================
...
tests/test_claim_tests.py::TestComplianceClaims::test_compliance_soc2 PASSED
tests/test_claim_tests.py::TestLoggingClaims::test_log_what_logged PASSED
...
======================== 11 passed, 19 skipped in 0.35s ========================
```

### Running Specific Test Category

```bash
# Run only logging tests
uv run pytest tests/test_claim_tests.py::TestLoggingClaims -v

# Run only encryption tests (currently all skipped)
uv run pytest tests/test_claim_tests.py::TestEncryptionClaims -v
```

### DevOps Validation Script

```bash
# Validate resin worker
RESIN_API_KEY="your-key" ./scripts/security/validate-deployment.sh resin

# Outputs: docs/reports/resin-security-2025-11-05.md
```

### Implementing a New Security Test

**Step 1: Remove skip marker in tests/test_claim_tests.py:**
```python
# Before
@pytest.mark.skip("Not yet implemented")
def test_enc_tls_transit(self, tester):
    status, details = tester.test_enc_tls_transit()
    assert status in (ValidationStatus.PASS, ValidationStatus.FAIL)

# After (just remove the decorator)
def test_enc_tls_transit(self, tester):
    status, details = tester.test_enc_tls_transit()
    assert status in (ValidationStatus.PASS, ValidationStatus.FAIL)
```

**Step 2: Create implementation file if needed:**
```python
# tools/security/implementations/encryption_implementations.py

try:
    from claim_tests import ValidationStatus
except ImportError:
    from ..claim_tests import ValidationStatus

class EncryptionImplementations:
    def __init__(self, worker_url: str, api_key: str):
        self.worker_url = worker_url
        self.api_key = api_key

    def test_enc_tls_transit(self) -> Tuple[ValidationStatus, str]:
        """Test: TLS 1.2+ encryption for data in transit"""
        # Implementation here
        # Check TLS version from socket
        # Verify HSTS headers
        # Return (ValidationStatus.PASS, "TLS 1.3 detected") or similar
        pass
```

**Step 3: Update claim_tests.py:**
```python
def test_enc_tls_transit(self) -> Tuple[ValidationStatus, str]:
    """Test: TLS 1.2+ encryption for data in transit"""
    from implementations.encryption_implementations import EncryptionImplementations
    impl = EncryptionImplementations(self.worker_url, self.api_key)
    return impl.test_enc_tls_transit()
```

**Step 4: Run test to verify:**
```bash
uv run pytest tests/test_claim_tests.py::TestEncryptionClaims::test_enc_tls_transit -v
```

**Step 5: Iterate until test passes:**
- Refine implementation based on test failures
- Add helper methods as needed
- Verify with real worker deployments

## Test Results

**Current Status: 11 passed, 19 skipped**

```
✅ Compliance Tests (4)
  - test_compliance_soc2
  - test_compliance_gdpr
  - test_compliance_ccpa
  - test_compliance_afp
  (Return MANUAL status - require human review of documentation)

✅ Logging Tests (1 of 3)
  - test_log_what_logged ← First implementation
  - test_log_retention_90 (pending)
  - test_log_audit_trail (pending)

✅ Infrastructure Tests (6)
  - ClaimTester initialization tests
  - run_all_tests() framework tests

⏳ Pending Implementation (19 tests)
  - Authentication (3)
  - Encryption (3)
  - Data Handling (4)
  - Infrastructure (4 main tests)
  - API Security (3)
```

## Best Practices

### ✅ Do

- **Use `@pytest.mark.skip()`** to mark unimplemented tests instead of removing code
- **Group by category** - Put related tests in the same implementation file
- **Return both status and details** - Help future debuggers understand what happened
- **Test real deployments** - Always verify against actual worker endpoints with real API keys
- **Document the "why"** - Explain what security property we're validating
- **Use meaningful variable names** - `ssn_pattern`, `api_key_regex`, not `pattern1`
- **Test edge cases** - What happens when logs are empty? When there's no API key?

### ❌ Don't

- **Don't hardcode credentials** - Use environment variables and deployments.yaml
- **Don't accumulate too many tests without implementation** - Keep pending tests synchronized
- **Don't mix test definitions with implementations** - Keep them separate for clarity
- **Don't ignore the WARN status** - It means something could be better
- **Don't forget sensitive data patterns** - Always search for PII, credentials, tokens
- **Don't test in isolation** - Security tests need real endpoints and real data flows

## Implementation Roadmap

### Phase 1: Foundation (✅ Complete)
- [x] Set up monorepo module structure
- [x] Create ClaimTester class with all 24 methods
- [x] Implement ValidationStatus enum
- [x] Write pytest framework with 30 tests
- [x] Implement first test: test_log_what_logged
- [x] Create multi-worker deployment system

### Phase 2: Low-Hanging Fruit (⏳ Recommended Next)
- [ ] **API Security Tests** (easiest, high impact)
  - `test_api_cors_headers` - Check response headers
  - `test_api_rate_limit` - Test rate limiting
  - `test_api_input_validation` - Test with malicious inputs

- [ ] **Logging Tests** (medium, mostly framework done)
  - `test_log_retention_90` - Verify 90-day deletion
  - `test_log_audit_trail` - Verify audit accessibility

### Phase 3: Medium Complexity
- [ ] **Encryption Tests** (medium difficulty, high impact)
  - `test_enc_tls_transit` - Check TLS version and HSTS
  - `test_enc_aes256_rest` - Verify KV encryption
  - `test_enc_memory_processing` - Verify sensitive data clearing

### Phase 4: Infrastructure & Data
- [ ] **Infrastructure Tests**
  - `test_infra_cloudflare_ddos` - Query Cloudflare API
  - `test_infra_cloudflare_uptime` - Historical uptime
  - `test_infra_multi_tenant_isolation` - Cross-org access tests

- [ ] **Authentication Tests**
  - `test_auth_oauth_pkce` - OAuth flow verification
  - `test_auth_no_credentials` - Credential leak detection

- [ ] **Data Handling Tests**
  - `test_data_ephemeral` - Query logs for data retention
  - `test_data_no_ssns_cards` - Field filtering verification
  - `test_data_minimization` - API call analysis
  - `test_data_no_training` - DPA compliance

## Technical Insights

### Import Path Flexibility

The try/except pattern solves a critical problem in test frameworks:

```python
try:
    from claim_tests import ValidationStatus  # Works from pytest
except ImportError:
    from ..claim_tests import ValidationStatus  # Works from package import
```

**Why this matters:**
- Pytest manipulates `sys.path`, making relative imports work differently
- Package-level imports need proper relative paths (`..`)
- This pattern handles both without special configuration

### ValidationStatus Enum Equality

Initially, we hit a subtle bug where comparing `ValidationStatus.PASS` from different import paths failed, even though they looked the same. This is because Python creates separate enum instances for different imports.

**Solution:** Use a consistent import path throughout the codebase. The try/except pattern ensures this.

### DevOps Script Directory Navigation

The validate-deployment.sh script must navigate to tools/security/ before running uv commands:

```bash
cd "$REPO_ROOT/tools/security" && uv sync --quiet --extra test
cd "$REPO_ROOT/tools/security" && uv run python validator.py --worker "$WORKER"
```

Without this, `uv` can't find `pyproject.toml` and fails with "No pyproject.toml in current directory".

## Related Documentation

- **Security Framework README:** `tools/security/README.md` - Complete TDD workflow guide
- **Monorepo Overview:** `CLAUDE.md` - Multi-module architecture
- **Resin MCP Server:** `mcp/resin/CLAUDE.md` - Cloudflare Workers deployment
- **Deployment Configuration:** `tools/security/deployments.yaml` - Multi-worker setup

## Key Files

- `tools/security/claim_tests.py` - Core ClaimTester class
- `tools/security/implementations/logging_implementations.py` - First implementation
- `tools/security/tests/test_claim_tests.py` - 30 pytest tests
- `tools/security/validator.py` - DevOps report generator
- `scripts/security/validate-deployment.sh` - Shell wrapper
- `tools/security/pyproject.toml` - Independent project config

## Next Steps

1. **Implement API Security Tests** - Easiest entry point, check response headers
2. **Extend logging_implementations.py** - Implement 90-day retention and audit trail tests
3. **Create encryption_implementations.py** - Check TLS and HSTS headers
4. **Set up CI/CD integration** - Run security validation on each deployment
5. **Create dashboards** - Track security claim status over time
