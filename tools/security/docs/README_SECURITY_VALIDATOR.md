# Resin AI Security Claims Validator - Implementation Guide

## Quick Summary

You have 3 files to implement a comprehensive security validation sub-agent for your Resin AI MCP:

1. **`resin-security-validator.py`** - Core framework defining 24 security claims
2. **`security_validation_examples.py`** - 5 usage scenarios (weekly checks, pre-deploy gates, audit reports, etc.)
3. **`SECURITY_VALIDATION_INTEGRATION.md`** - Detailed integration instructions

These tools validate that your actual implementation matches the claims in your security document.

---

## The Problem You're Solving

Your security document makes assertions like:
- ✅ "We use TLS 1.2+ encryption"
- ✅ "OAuth 2.0 with PKCE implementation"
- ✅ "Ephemeral data processing"
- ✅ "SOC 2 Type II compliant"

But how do you **prove** these claims to customers, auditors, and compliance reviews? This validator does exactly that.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│         Your Main Resin AI Automation Workflow              │
│  (Daily reporting, opportunity scoring, email drafting)     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Invokes as sub-agent weekly/monthly
                   ▼
┌─────────────────────────────────────────────────────────────┐
│        Security Validation Sub-Agent                        │
│  (Validates 24 security claims from your document)          │
│                                                              │
│  • TLS version check                                        │
│  • HTTPS enforcement                                        │
│  • OAuth PKCE verification                                 │
│  • Multi-tenant isolation                                  │
│  • Data retention policies                                 │
│  • Encryption implementation                               │
│  • Compliance certifications                               │
│  • And 17 more...                                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Returns validation results
                   ▼
┌─────────────────────────────────────────────────────────────┐
│           Output Reports & Evidence                         │
│  • compliance_report.md (human-readable)                   │
│  • validation_checklist.md (procedures)                    │
│  • audit_report.md (customer-facing)                       │
│  • dashboard_metrics.json (monitoring)                     │
│  • test_results.json (machine-readable)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## What Gets Validated

### 7 Security Categories

| Category | Claims | Examples |
|----------|--------|----------|
| **Authentication** | 3 | OAuth PKCE, user-level security, no credential storage |
| **Encryption** | 3 | TLS 1.2+, AES-256 at rest, encrypted in memory |
| **Data Handling** | 4 | Ephemeral processing, no training, minimization, no PII |
| **Infrastructure** | 4 | DDoS protection, 99.9% uptime, serverless, isolation |
| **Compliance** | 4 | SOC 2, GDPR, CCPA, AFP standards |
| **Logging** | 3 | Appropriate logging, 90-day retention, audit trails |
| **API Security** | 3 | Rate limiting, input validation, security headers |

**Total: 24 claims** all mapped to specific test procedures and evidence requirements.

---

## Implementation Steps

### Step 1: Add Files to Your Project

```bash
# Copy to your Claude Code project
cp resin-security-validator.py ./claude_tools/
cp security_validation_examples.py ./scripts/
cp SECURITY_VALIDATION_INTEGRATION.md ./docs/
```

### Step 2: Integrate with Your Main Workflow

In your main Claude Code automation:

```python
from claude_tools.security_validator import SecurityValidator

def main():
    # Your existing Resin AI workflow code...
    
    # Add security validation as part of your workflow
    print("Running security compliance check...")
    validator = SecurityValidator(api_base="https://api.resin.team")
    results = validator.run_all_tests()
    
    # Generate and save reports
    report = validator.generate_markdown_report()
    with open("reports/security_validation.md", "w") as f:
        f.write(report)
    
    # Check for failures
    failures = [r for r in results if r.get("result") == "FAIL"]
    if failures:
        print(f"⚠️ {len(failures)} security validations failed!")
        for failure in failures:
            print(f"  - {failure['test']}: {failure.get('details')}")
    else:
        print("✅ All security validations passed")
```

### Step 3: Schedule Regular Runs

#### Option A: Weekly via GitHub Actions

```yaml
# .github/workflows/security-validation.yml
name: Security Validation

on:
  schedule:
    - cron: '0 2 * * MON'  # Every Monday at 2 AM UTC

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Security Validation
        run: python scripts/security_validation_examples.py --scenario all
      - name: Upload Reports
        uses: actions/upload-artifact@v2
        with:
          name: security-reports
          path: reports/
```

#### Option B: Monthly as Claude Code Task

```python
# scheduled in your task runner
from datetime import datetime

if datetime.now().day == 1:  # First of month
    print("Running monthly security validation...")
    subprocess.run(["python", "scripts/security_validation_examples.py", "--scenario", "all"])
```

### Step 4: Integrate with Monitoring

Push metrics to your monitoring system:

```python
from security_validation_examples import compliance_dashboard_data
import requests

# Send to Datadog, Grafana, or your monitoring platform
metrics = compliance_dashboard_data()
requests.post(
    "https://api.datadoghq.com/api/v1/series",
    json={
        "series": [
            {
                "metric": "resin.security.compliance_score",
                "points": [[int(datetime.now().timestamp()), metrics["compliance_scores"]["overall"]]],
                "type": "gauge"
            }
        ]
    }
)
```

---

## Usage Scenarios

### Weekly Compliance Check

Run automatically every Monday to spot security drift:

```bash
python security_validation_examples.py --scenario weekly
```

**Output:** Weekly report showing automated tests (TLS, HTTPS, headers) + manual tests needed.

### Pre-Deployment Security Gate

Blocks deployment if security validation fails:

```bash
python security_validation_examples.py --scenario pre-deploy --environment production
```

**Output:** PASS or FAIL - if FAIL, deployment is blocked.

```bash
# Example CI/CD integration
if ! python security_validation_examples.py --scenario pre-deploy --environment production; then
    echo "Security validation failed - deployment blocked"
    exit 1
fi
```

### Customer Audit Report

Generate audit-ready documentation for customers/prospects:

```bash
python security_validation_examples.py --scenario audit-report --output reports/
```

**Output:** Detailed 5-page audit report suitable for sharing with customers.

### Dashboard Metrics

Continuous compliance monitoring:

```bash
python security_validation_examples.py --scenario dashboard
```

**Output:** JSON with compliance scores, alerts, certification dates.

### Risk Assessment

Track whether security mitigations remain valid:

```bash
python security_validation_examples.py --scenario risk-assessment
```

**Output:** Risk matrix showing residual risk, last validation date, next validation needed.

---

## Validation Evidence Examples

### TLS 1.2+ Verification

```bash
# Automated test
echo | openssl s_client -connect api.resin.team:443 2>/dev/null | grep "TLSv"
# Output: TLSv1.3

# Result: ✅ PASS - claim verified
```

### Multi-Tenant Isolation Test

```
1. Create test org A with OAuth token A
2. Create test org B with OAuth token B
3. With token A, try to query org B data → 403 Forbidden ✅
4. With token B, try to query org A data → 403 Forbidden ✅
5. Result: ✅ PASS - isolation confirmed
```

### SOC 2 Verification

```
1. Download SOC 2 Type II report from Cloudflare account
2. Check report date: 2025-09-15 (within 12 months) ✅
3. Verify scope includes Cloudflare Workers ✅
4. Review audit findings: No critical issues ✅
5. Store in: compliance/soc2-type-ii-2025.pdf
6. Result: ✅ PASS - SOC 2 current
```

### Ephemeral Data Test

```
Procedure:
1. Query infrastructure for table: donor_data
   → SELECT COUNT(*) FROM donor_data LIMIT 1
   → Result: 0 rows ✅
   
2. Query logs for donor names
   → SELECT * FROM logs WHERE body LIKE '%John Doe%'
   → Result: No matches ✅
   
3. Test API call with known donor data
   → Make request, wait 5 minutes
   → Query again for that donor
   → Result: Not found ✅
   
Result: ✅ PASS - data is ephemeral
```

---

## Integration with Your Document

Your security document (Nov 4, 2025, v1.0) covers exactly what this validator tests:

| Document Section | Validator Component |
|------------------|-------------------|
| How Your Data Flows | OAuth + TLS validation |
| What Data Goes to the AI | Data handling tests |
| Security Measures | Encryption + Auth tests |
| Infrastructure Security | Cloudflare tests |
| Logging & Monitoring | Log retention tests |
| Compliance & Standards | SOC 2, GDPR, CCPA tests |
| Your Rights & Controls | Permission tests |

The validator essentially **proves every claim** in your security document.

---

## Deliverables Your Validator Produces

### For Customers/Auditors

- **`audit_report.md`** - Executive summary of validation results
- **`security_validation_report.md`** - Detailed technical findings
- **`compliance_evidence/`** - Supporting documentation (SOC 2, DPA, etc.)

### For Internal Use

- **`validation_checklist.md`** - Procedures to verify each claim
- **`test_results.json`** - Machine-parseable results
- **`dashboard_metrics.json`** - Compliance scoring over time
- **`risk_assessment.json`** - Risk matrix with residual risk

### For CI/CD Pipeline

- Exit codes for deployment gates
- JSON output for dashboards
- Automated alerts for failures

---

## Testing Your Validator

### Run Full Validation Suite

```bash
python resin-security-validator.py
```

Output shows all 24 claims organized by category.

### Generate Sample Reports

```bash
python security_validation_examples.py --scenario all --output reports/
```

Generates all 5 report types to `reports/` directory.

### Test Pre-Deploy Gate

```bash
python security_validation_examples.py --scenario pre-deploy --environment production
```

Exit code 0 = safe to deploy, Exit code 1 = blocked.

---

## Continuous Improvement

The validator is designed to evolve with your system:

### Add New Claims

```python
validator.add_claim(
    "CLAIM_ID",
    ClaimCategory.YOUR_CATEGORY,
    "Human-readable claim statement",
    """Test procedure steps""",
    "Expected result description"
)
```

### Update Test Procedures

As your infrastructure changes, update test procedures in the validator to stay current.

### Track Compliance Over Time

Store reports in version control to track compliance trends:

```bash
cp reports/security_validation.md docs/compliance/security_validation_2025-11-05.md
git add docs/compliance/
git commit -m "Security validation: 24/24 claims verified"
```

---

## FAQ

**Q: How often should I run validation?**
A: 
- **TLS/HTTPS/Headers**: Weekly (automated)
- **OAuth/Data Handling**: Monthly (mix of automated + manual)
- **Compliance Certs**: Quarterly (SOC 2 renewal cycle)
- **Full Audit**: Annually (or when security doc changes)

**Q: Can I automate all 24 claims?**
A: 
- 12 claims can be fully automated (TLS, HTTPS, headers, rate limiting, etc.)
- 12 claims are semi-automated or manual (OAuth flows, data minimization, etc.)
- The validator shows which are which

**Q: How do I use this for customer audits?**
A:
1. Run full validation suite
2. Generate customer audit report (`--scenario audit-report`)
3. Include in customer security questionnaire responses
4. Attach SOC 2 Type II report as evidence
5. Provide DPA for GDPR/CCPA verification

**Q: Does this replace a formal security audit?**
A:
- No, this is continuous internal validation
- A formal audit would be done by external security firm
- This provides evidence that internal validation is continuous

**Q: Can I share these reports with prospects?**
A:
- Yes! The audit report is designed to be customer-facing
- Include compliance scores, validated claims, certification dates
- Shows you take security seriously

---

## Next Steps

1. ✅ Copy the 3 files to your project
2. ✅ Customize API endpoint URLs for your system
3. ✅ Run initial validation: `python resin-security-validator.py`
4. ✅ Generate sample reports: `python security_validation_examples.py --scenario all`
5. ✅ Integrate into CI/CD pipeline
6. ✅ Schedule weekly/monthly runs
7. ✅ Generate first audit report
8. ✅ Set up monitoring dashboard

---

## Support & Customization

To customize the validator for your specific infrastructure:

1. **Update API endpoints** - Change `api_base` URLs
2. **Add custom tests** - Inherit `SecurityValidator` class
3. **Modify test procedures** - Edit claim definitions
4. **Add your standards** - Extend compliance categories
5. **Integrate with your tools** - Modify report generation

The framework is designed to be extended and adapted to your specific security posture.

---

## Summary

You now have a reusable framework to:
- ✅ Validate security claims automatically
- ✅ Generate compliance reports
- ✅ Block unsafe deployments
- ✅ Provide evidence to auditors
- ✅ Track security over time
- ✅ Monitor continuous compliance

All by invoking a single Claude Code sub-agent from your main workflows.
