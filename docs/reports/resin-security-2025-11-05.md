# Resin AI Security Compliance Report

Generated: 2025-11-05T07:58:50.781087
Document Version: 1.0 (Nov 4, 2025)

## Summary

Total Claims: 24
⏳ PENDING: 24

## Claims by Category

### Authentication & Authorization (3 claims)

- [⏳ PENDING] OAuth 2.0 with PKCE implementation
- [⏳ PENDING] Credentials never stored in code or logs
- [⏳ PENDING] User-level security with individual credentials

### Encryption (3 claims)

- [⏳ PENDING] TLS 1.2+ encryption for data in transit
- [⏳ PENDING] AES-256 encryption for credentials at rest in Cloudflare KV
- [⏳ PENDING] Data encrypted in memory during AI processing

### Data Handling (4 claims)

- [⏳ PENDING] Data is ephemeral - discarded after response
- [⏳ PENDING] No training on customer data - Anthropic commitment
- [⏳ PENDING] Only necessary data sent to AI - aggregated when possible
- [⏳ PENDING] Never send SSNs, credit cards, bank accounts to API

### Infrastructure (4 claims)

- [⏳ PENDING] DDoS protection and WAF via Cloudflare
- [⏳ PENDING] 99.9%+ uptime via Cloudflare Workers
- [⏳ PENDING] Serverless architecture - no persistent servers
- [⏳ PENDING] Multi-tenant isolation in separate storage

### Compliance (4 claims)

- [⏳ PENDING] SOC 2 Type II via Cloudflare infrastructure
- [⏳ PENDING] GDPR compliant with DPA available
- [⏳ PENDING] CCPA compliant for California privacy rights
- [⏳ PENDING] Compliant with AFP Code of Ethics and Donor Bill of Rights

### Logging & Monitoring (3 claims)

- [⏳ PENDING] Appropriate logging: timestamp, user, query type, response time
- [⏳ PENDING] Logs retained for 90 days, then deleted
- [⏳ PENDING] Audit trail accessible for compliance review

### API Security (3 claims)

- [⏳ PENDING] Rate limiting to prevent abuse
- [⏳ PENDING] Input validation on all API endpoints
- [⏳ PENDING] Proper CORS and security headers

