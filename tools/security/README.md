# Security Claims Validator - TDD Framework

A comprehensive Test-Driven Development (TDD) framework for validating security claims on Resin Cloudflare Workers deployments.

## Structure

Organized following Python best practices with tests and implementations in a single module:

```
tools/security/                          # Single cohesive module
├── claim_tests.py                        # Core: ClaimTester class with 24 test methods
├── deployments.yaml                     # Config: Multi-worker deployment definitions
├── validator.py                         # Script: DevOps security report generator
├── README.md                            # This file
├── __init__.py
├── tests/                               # Pytest tests (within the module)
│   ├── __init__.py
│   └── test_claim_tests.py              # 30 pytest tests (11 passing, 19 skipped)
└── implementations/                     # Implementation modules (organized by category)
    ├── __init__.py
    ├── logging_implementations.py       # Logging & monitoring (✅ 1/3 implemented)
    ├── encryption_implementations.py    # Encryption tests (⏳ Pending)
    ├── auth_implementations.py          # Authentication tests (⏳ Pending)
    └── api_implementations.py           # API security tests (⏳ Pending)
```

## Key Files

### [claim_tests.py](claim_tests.py)
- **ClaimTester** class: Main interface with 24 test methods (one per security claim)
- Each method returns: `Tuple[ValidationStatus, str]` (status, details)
- Currently:
  - 4 compliance tests: IMPLEMENTED (return MANUAL status)
  - 20 other tests: STUBBED (raise NotImplementedError)

### [tests/test_claim_tests.py](tests/test_claim_tests.py)
- Pytest tests for each claim (located in `tests/` within tools/security/)
- 30 total tests organized by category:
  - Authentication (3) - skipped, pending implementation
  - Encryption (3) - skipped, pending implementation
  - Data Handling (4) - skipped, pending implementation
  - Infrastructure (4) - skipped, pending implementation
  - Compliance (4) - ✅ all passing (manual verification)
  - Logging (3) - ✅ one implemented, two pending
  - API Security (3) - skipped, pending implementation
- Run with: `uv run pytest tools/security/tests/test_claim_tests.py -v`

### [tools/security/implementations/](implementations/)
Directory containing implementation modules organized by claim category:

#### [logging_implementations.py](implementations/logging_implementations.py)
- **LoggingImplementations** class: Implementations for logging claims
- Methods:
  - `test_log_what_logged()` - ✅ IMPLEMENTED
  - `test_log_retention_90()` - Stubbed (NotImplementedError)
  - `test_log_audit_trail()` - Stubbed (NotImplementedError)
- Features:
  - Sensitive data pattern detection (SSN, credit card, API key, email, phone, IP, etc.)
  - Log structure validation
  - Metadata presence verification (timestamp, requestId, endpoint, method, statusCode, durationMs)

### [validator.py](validator.py)
- DevOps script to generate security audit reports
- Usage: `./scripts/security/validate-deployment.sh resin`
- Outputs to: `docs/reports/{worker}-security-{date}.md`

## Test Results

```
11 passed, 19 skipped
```

- ✅ 4 Compliance tests (MANUAL - already implemented)
- ✅ 1 Logging test (LOG_WHAT_LOGGED - newly implemented)
- ✅ 6 Infrastructure tests (initialization, aggregation)
- ⏳ 19 tests waiting for implementation (SKIPPED)

## TDD Workflow - How to Implement a Test

### Step 1: Choose a Test
Pick an unimplemented test, e.g., `test_enc_tls_transit` for TLS verification

### Step 2: Remove Skip Marker
In [tests/test_claim_tests.py](tests/test_claim_tests.py), remove `@pytest.mark.skip()`:
```python
# Before
@pytest.mark.skip("Not yet implemented")
def test_enc_tls_transit(self, tester):
    ...

# After
def test_enc_tls_transit(self, tester):
    ...
```

### Step 3: Create Implementation Module
Create `tools/security/implementations/encryption_implementations.py` (or add to existing):
```python
from typing import Tuple
try:
    from claim_tests import ValidationStatus
except ImportError:
    from ..claim_tests import ValidationStatus

class EncryptionImplementations:
    def __init__(self, worker_url: str, api_key: str):
        self.worker_url = worker_url
        self.api_key = api_key

    def test_enc_tls_transit(self) -> Tuple[ValidationStatus, str]:
        """Actual TLS version check logic here"""
        # 1. Extract TLS version from socket
        # 2. Check HSTS headers
        # 3. Return (ValidationStatus.PASS, details) or (FAIL, error)
        pass
```

### Step 4: Update claim_tests.py
In [claim_tests.py](claim_tests.py), replace NotImplementedError with import:
```python
def test_enc_tls_transit(self) -> Tuple[ValidationStatus, str]:
    """Test: TLS 1.2+ encryption for data in transit"""
    from implementations.encryption_implementations import EncryptionImplementations
    impl = EncryptionImplementations(self.worker_url, self.api_key)
    return impl.test_enc_tls_transit()
```

### Step 5: Run Test
```bash
uv run pytest tools/security/tests/test_claim_tests.py::TestEncryptionClaims::test_enc_tls_transit -v
```

### Step 6: Iterate Until Green
Refine implementation until test passes.

## Running Tests

### Run all tests
```bash
uv run pytest tools/security/tests/test_claim_tests.py -v
```

### Run specific category
```bash
uv run pytest tools/security/tests/test_claim_tests.py::TestLoggingClaims -v
```

### Run single test
```bash
uv run pytest tools/security/tests/test_claim_tests.py::TestLoggingClaims::test_log_what_logged -v
```

### Show skipped tests
```bash
uv run pytest tools/security/tests/test_claim_tests.py -v --collect-only | grep "SKIPPED"
```

### Run with coverage
```bash
uv run pytest tools/security/tests/test_claim_tests.py --cov=tools.security
```

## Implementation Strategy

### Recommended Order (by difficulty & impact)

1. **API Security Tests** (easiest, high impact)
   - `test_api_cors_headers` - Check response headers
   - `test_api_rate_limit` - Make requests and check 429
   - `test_api_input_validation` - Test with malicious inputs

2. **Encryption Tests** (medium, high impact)
   - `test_enc_tls_transit` - Extract TLS version, check HSTS
   - `test_enc_aes256_rest` - Verify KV encryption
   - `test_enc_memory_processing` - Memory clearing verification

3. **Infrastructure Tests** (medium-hard)
   - `test_infra_cloudflare_ddos` - Query Cloudflare API
   - `test_infra_multi_tenant_isolation` - Cross-org access tests
   - `test_infra_cloudflare_uptime` - Historical uptime data

4. **Authentication Tests** (hard)
   - `test_auth_oauth_pkce` - OAuth flow verification
   - `test_auth_no_credentials` - Credential leak detection
   - `test_auth_user_level` - Multi-user isolation

5. **Data Handling Tests** (hard, requires Cloudflare integration)
   - `test_data_ephemeral` - Query logs for data retention
   - `test_data_no_ssns_cards` - Verify field filtering
   - `test_data_minimization` - Analyze API calls to Anthropic
   - `test_data_no_training` - Verify Anthropic DPA compliance

6. **Logging Tests** (medium, mostly implemented)
   - `test_log_retention_90` - Verify 90-day deletion
   - `test_log_audit_trail` - Test log filtering/export

## Architecture Decisions

### Python Best Practices - Separation of Concerns
- **Tests** in `tests/` directory (standard location for pytest)
- **Implementation code** in `tools/security/` and `tools/security/implementations/`
- **Core module** (`claim_tests.py`) in `tools/security/`
- **DevOps scripts** in `tools/security/` and `scripts/`

### Modular Implementation Files
- One file per claim **category** (not one per claim)
- Located in `tools/security/implementations/`
- Examples:
  - `implementations/logging_implementations.py`
  - `implementations/encryption_implementations.py`
  - `implementations/auth_implementations.py`
  - `implementations/api_implementations.py`
- All import `ValidationStatus` from `tools.security.claim_tests` for consistency

### Import Paths
- **In claim_tests.py:** `from tools.security.implementations.{module} import {Class}`
- **In implementation files:** `from tools.security.claim_tests import ValidationStatus`
- **In tests:** `from tools.security.claim_tests import ClaimTester, ValidationStatus, run_all_tests`

### Compliance Tests Are Manual
- 4 compliance tests return `ValidationStatus.MANUAL`
- These require human review (SOC 2 reports, DPAs, etc.)
- Not automated in TDD workflow

## Integration with validator.py Script

The DevOps script (`validator.py`) will eventually use `ClaimTester.run_all_tests()` to:
1. Run all implemented claims
2. Generate compliance report with PASS/FAIL/WARN/PENDING statuses
3. Save report to `docs/reports/`

```bash
# Generate report for resin worker
RESIN_API_KEY="your-key" ./scripts/security/validate-deployment.sh resin
# Output: docs/reports/resin-security-2025-11-05.md
```

## Current Implementation Status

| Claim | Status | File |
|-------|--------|------|
| **Compliance (4)** | ✅ MANUAL | claim_tests.py |
| **Logging: LOG_WHAT_LOGGED** | ✅ IMPLEMENTED | logging_implementations.py |
| **Logging: LOG_RETENTION_90** | ⏳ PENDING | logging_implementations.py |
| **Logging: LOG_AUDIT_TRAIL** | ⏳ PENDING | logging_implementations.py |
| **All others (17)** | ⏳ PENDING | Various |

## Next Steps

1. **Create auth_implementations.py** for authentication tests
2. **Create encryption_implementations.py** for encryption tests
3. **Create api_implementations.py** for API security tests
4. Implement infrastructure and data handling tests
5. Integrate with CI/CD pipeline for automated security audits

## Troubleshooting

### ImportError: No module named 'claim_tests'
Make sure you're running pytest from the project root:
```bash
uv run pytest tools/security/test_claim_tests.py
```

### ValidationStatus comparison fails
Ensure all files import `ValidationStatus` from `claim_tests.py`, not defining their own class.

### Tests not discovered
Check `pyproject.toml` has `testpaths = ["tests"]` - but we're using `tools/security/` instead. Update if needed or run tests directly:
```bash
uv run pytest tools/security/test_claim_tests.py
```

## References

- [pytest Documentation](https://docs.pytest.org/)
- [TDD Best Practices](https://en.wikipedia.org/wiki/Test-driven_development)
- [Security Testing Guide](https://owasp.org/www-project-testing-guide/)
