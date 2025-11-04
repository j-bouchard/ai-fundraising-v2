# Security & Privacy Overview
## Resin AI Fundraising Assistant

**Last Updated:** November 4, 2025  
**Version:** 1.0

---

## Executive Summary

Your donor data security is our top priority. This document explains how we protect your Salesforce data when using AI-powered fundraising insights.

**Platform Compatibility:**
- ✅ Salesforce NPSP (Nonprofit Success Pack)
- ✅ Salesforce Nonprofit Cloud
- ✅ Works with both platforms seamlessly

**Key Principles:**
- ✅ Your data stays in your control
- ✅ Industry-standard encryption and authentication
- ✅ No training on your data
- ✅ Transparent data handling
- ✅ You can revoke access anytime

---

## How Your Data Flows

```
Your Salesforce → Secure API → Our MCP Server → AI Processing → Results to You
     (OAuth)      (Encrypted)    (Cloudflare)     (Anthropic)    (Your Device)
  (NPSP or NC)                  (Auto-detects)
```

### What This Means:
1. **Salesforce Connection:** We use OAuth 2.0 (the same secure method used by trusted apps like Gmail mobile)
2. **Platform Detection:** Our system automatically detects whether you're using NPSP or Nonprofit Cloud and adapts accordingly
3. **Data Transmission:** All data is encrypted in transit using TLS 1.2+
4. **Processing:** Data is temporarily processed to generate insights, then discarded
5. **Storage:** We don't store your donor data—only connection credentials (encrypted)

---

## AI Model & Data Usage

### We Use Claude (by Anthropic)

**What Anthropic Does:**
- Processes your queries to generate fundraising insights
- Uses data only for your immediate request
- **Does NOT train on your data**
- **Does NOT retain your data** after processing
- Complies with SOC 2 Type II, HIPAA, GDPR

**From Anthropic's Enterprise Privacy Policy:**
> "Anthropic does not train Claude on customer data submitted via our API. Your prompts and outputs are not used to improve our models."

**Learn more:** [anthropic.com/privacy](https://www.anthropic.com/privacy)

### What Data Goes to the AI?

**We Send:**
- Donor names and giving history (for prioritization)
- Opportunity and engagement data (for recommendations)
- Campaign and program information (for context)
- Contact and Account information
- Tasks and activities (for relationship tracking)

**Standard Objects We Access (NPSP & Nonprofit Cloud):**
- **Contacts** - Donor information, relationships, engagement history
- **Accounts** - Organizational donors, household accounts
- **Opportunities** - Gifts, pledges, grant opportunities
- **Campaigns & Campaign Members** - Campaign tracking and participation
- **Tasks & Activities** - Follow-ups, touches, stewardship actions
- **Notes & Attachments** - Context for donor relationships (when relevant)

**NPSP-Specific Objects:**
- **Relationships** - Constituent relationships (NPSP)
- **Affiliations** - Organizational connections (NPSP)
- **General Accounting Units (GAUs)** - Fund designation tracking (NPSP)
- **Engagement Plans** - Donor cultivation workflows (NPSP)

**Nonprofit Cloud-Specific Objects:**
- **Gift Transactions** - Individual gift records and payment processing
- **Gift Commitments** - Pledges, recurring gifts, and future commitments
- **Giving Commitments** - Multi-year pledges and commitment schedules
- **Designations** - Fund allocations and restricted giving
- **Funds** - Restricted and designated fund tracking
- **Deliverables** - Program outcomes and impact tracking
- **Indicators** - Success metrics and KPIs
- **Program Engagements** - Participant tracking and service delivery
- **Disbursements** - Grant and scholarship distributions

**We DON'T Send:**
- Social Security Numbers
- Credit card numbers
- Bank account information
- Personal phone numbers (when possible)
- Any fields marked as sensitive in your Salesforce

---

## Security Measures

### 1. Authentication & Authorization

**OAuth 2.0 with PKCE:**
- You log in with your Salesforce credentials (we never see them)
- We receive a secure token that expires and can be revoked
- Your Salesforce admin can revoke access anytime
- Each user connects with their own credentials (user-level security)

**Flexible Permissions:**
- Our platform can read and write to all standard Salesforce objects needed for fundraising operations
- **Default Access:** Contacts, Accounts, Opportunities, Campaigns, Tasks, Campaign Members, Activities
- **Write Operations:** Creating and updating records (Tasks, Opportunities, Contacts, Campaign Members)
- **Configurable Limits:** We can restrict access to specific objects at your organization's request
- **What We Never Access:** Financial records (payroll, accounting), HR data (personnel files, benefits), payment processing data (credit cards, bank accounts), system administration settings

### 2. Data Protection

**Encryption:**
- **In Transit:** TLS 1.2+ encryption for all data transmission
- **At Rest:** AES-256 encryption for stored credentials in Cloudflare KV
- **Processing:** Data encrypted in memory during AI processing

**Customizable Data Access:**
- **Default Configuration:** We access standard fundraising objects (Contacts, Opportunities, Campaigns, etc.)
- **Custom Restrictions:** You can request limitations on specific objects or fields
- **Field-Level Control:** Respect your Salesforce field-level security settings (where implemented)
- **Opt-In for Sensitive Data:** Some features may require additional permissions - we'll always ask first
- **Examples of Restrictions:** Exclude specific custom objects, limit access to certain record types, restrict certain campaigns or programs

**Data Minimization:**
- We only access the data needed for your specific query
- We send aggregated/summarized data to the AI when possible
- We use donor IDs instead of names in prompts where feasible

**No Long-Term Storage:**
- We don't store your donor data in our databases
- AI processing is ephemeral (data discarded after response)
- Only logs of interactions are kept (see Logging section)

### 3. Infrastructure Security

**Cloudflare Workers:**
- Enterprise-grade infrastructure with 99.9%+ uptime
- DDoS protection and web application firewall
- Automatic security updates
- Serverless architecture (no persistent servers to compromise)

**Multi-Tenant Isolation:**
- Each organization's credentials are isolated in separate storage
- No cross-contamination between organizations
- Logical separation enforced at the application layer

---

## Logging & Monitoring

### What We Log:
- Timestamp of each interaction
- User who made the request
- Type of query/recipe used
- Response time
- Whether the request succeeded or failed

### What We DON'T Log:
- Full donor data from responses
- Personal identifying information
- Sensitive field values

### Log Retention:
- Logs stored for 90 days for quality improvement
- Logs are encrypted at rest
- You can request deletion of your logs anytime

### Purpose:
- Troubleshooting and support
- Performance monitoring
- Improving AI recommendations based on usage patterns

---

## Compliance & Standards

### Industry Standards:
- **SOC 2 Type II** (via Cloudflare infrastructure)
- **GDPR Compliant** (data processing agreements available)
- **CCPA Compliant** (California privacy rights respected)

### Nonprofit-Specific Considerations:
- **Donor Privacy:** We respect the AFP Code of Ethics and AFP Donor Bill of Rights
- **Data Stewardship:** Your organization remains the data controller
- **Transparency:** Donors can request to know how their data is used

---

## Your Rights & Controls

### You Can:
- ✅ **Revoke Access** anytime through Salesforce Connected Apps settings
- ✅ **Request Data Deletion** of any logs we've stored
- ✅ **View Audit Logs** of all interactions with your data
- ✅ **Export Your Data** (though we don't store it long-term)
- ✅ **Customize Permissions** by requesting restrictions on specific objects or fields
- ✅ **Limit Data Access** by adjusting Salesforce field-level security and our access configuration

### Permission Customization Process:
1. **During Onboarding:** Tell us which objects or fields you want excluded
2. **Anytime After:** Email us to add or remove restrictions
3. **We Document:** Your custom permissions are saved in our system
4. **We Verify:** Regular audits ensure restrictions are properly enforced

### We Cannot:
- ❌ Access your Salesforce without your explicit OAuth consent
- ❌ Share your data with third parties (except Anthropic for AI processing)
- ❌ Use your data to train AI models
- ❌ Access your data after you revoke permissions
- ❌ Override restrictions you've requested

---

## Permission Management & Governance

### Standard Access (Default Configuration)

Our platform is designed for comprehensive fundraising operations and works with both **NPSP (Nonprofit Success Pack)** and **Nonprofit Cloud**. By default we can access:

**Read & Write:**
- **Contacts & Accounts:** Donor information, relationships, and engagement
- **Opportunities:** Gifts, pledges, and pipeline management
- **Campaigns & Campaign Members:** Campaign tracking and donor participation
- **Tasks & Activities:** Follow-ups, stewardship touches, and donor interactions

**NPSP-Specific (when applicable):**
- **Relationships & Affiliations:** Constituent and organizational connections
- **General Accounting Units (GAUs):** Fund designation and allocation
- **Engagement Plans:** Cultivation and stewardship workflows
- **Household Accounts:** NPSP household model

**Nonprofit Cloud-Specific (when applicable):**
- **Gift Transactions:** Individual gift records and payment processing
- **Gift Commitments:** Pledges, recurring gifts, and payment schedules
- **Giving Commitments:** Multi-year pledges and commitment tracking
- **Designations:** Fund allocations and restricted giving
- **Funds:** Restricted and designated fund tracking
- **Deliverables & Indicators:** Program outcomes and impact metrics
- **Program Engagements:** Participant tracking and service delivery
- **Disbursements:** Grant and scholarship distributions
- **Awards:** Recognition and donor acknowledgments

**What This Enables:**
- Donor prioritization and segmentation (both platforms)
- Gift tracking and analysis (both platforms)
- Automated task creation for follow-ups (both platforms)
- Email drafting with donor context (both platforms)
- Conversational data entry (both platforms)
- NPSP-specific cultivation workflows
- Nonprofit Cloud program impact tracking

### Objects We Never Access

**Excluded by Design:**
- ❌ **Financial/Accounting Objects:** Payroll data, expense records, accounting entries
- ❌ **HR Data:** Employee records, benefits, personnel files, performance reviews
- ❌ **Payment Processing:** Credit card information, bank accounts, payment gateway data
- ❌ **System Administration:** User management, security settings, API configurations
- ❌ **Unrelated Business Objects:** Inventory, manufacturing, custom objects outside fundraising

### Custom Restrictions Available

**Upon Request, We Can:**
- Exclude specific custom objects (e.g., Board Member custom object)
- Limit access to certain record types (e.g., only Individual donors, not Organizations)
- Restrict specific campaigns or programs (e.g., exclude sensitive research programs)
- Block access to custom fields containing sensitive data
- Implement read-only access for specific objects

**Example Restriction Scenarios:**

**Scenario 1: Sensitive Research Program**
- Organization conducts medical research with strict privacy requirements
- Restriction: Exclude all Opportunities/Contacts tagged with "Research Program"
- Result: AI never sees or processes research participant data

**Scenario 2: Board Member Privacy**
- Organization has Board Members as Contacts but wants extra privacy
- Restriction: Exclude Contacts where "Board_Member__c = true"
- Result: AI recommendations never include Board Members

**Scenario 3: Major Gift Confidentiality**
- Organization wants to limit AI access to gifts over $100K
- Restriction: Filter Opportunities over $100K from AI processing
- Result: Strategic major gifts handled manually, not through AI

### How to Request Restrictions

1. **During Setup:** Discuss your requirements with our team during onboarding
2. **After Onboarding:** Email joebouchard@resin.team with your request
3. **We Implement:** Configuration changes typically completed within 2 business days
4. **We Test:** Verify restrictions work as intended before re-enabling
5. **We Document:** Your custom permissions stored securely and reviewed regularly

---

## Data Handling by Feature

### Daily Priority Reports:
- **Data Used:** Donor giving history, recency, frequency, monetary value
- **Processing:** AI analyzes patterns and generates prioritization
- **Retention:** Report is delivered to you, no copy stored by us
- **Third-Party:** Processed by Claude (Anthropic) per their privacy policy

### Slack Bot Queries:
- **Data Used:** Real-time Salesforce data based on your query
- **Processing:** AI generates response based on current data
- **Retention:** Interaction logged (metadata only), donor data not retained
- **Third-Party:** Processed by Claude (Anthropic)

### Email Drafting:
- **Data Used:** Donor gift history, name, and context
- **Processing:** AI drafts email based on your instructions
- **Retention:** Draft is returned to you, not stored by us
- **Third-Party:** Processed by Claude (Anthropic)

### Conversational Data Entry:
- **Data Used:** Your natural language input
- **Processing:** AI parses and creates Salesforce records
- **Retention:** Transaction logged, but data stored only in your Salesforce
- **Third-Party:** Processed by Claude (Anthropic)

---

## What Happens If...?

### Our System is Compromised?
- Credentials are encrypted (attacker would need encryption keys)
- We immediately revoke all OAuth tokens
- We notify all affected organizations within 72 hours
- We coordinate with Salesforce to reset connections

### Anthropic Has a Data Breach?
- Your data is ephemeral (not stored by Anthropic)
- Anthropic has never had a customer data breach
- Anthropic maintains comprehensive security certifications

### You Leave Our Service?
- Revoke OAuth access in Salesforce (takes effect immediately)
- Request deletion of any stored logs (completed within 30 days)
- No ongoing access to your Salesforce

### A User Leaves Your Organization?
- Deactivate their Salesforce user (they lose access automatically)
- Or remove their OAuth token from Salesforce Connected Apps

---

## Testing & Demos

### For Demonstrations:
- We use completely synthetic data (fake donors, fake organizations)
- No real donor information is used in public demos
- Test environments are separate from production

### For Pilot Programs:
- We recommend starting with a test Salesforce sandbox
- Once comfortable, connect to production with real data
- We provide step-by-step security setup guidance

---

## Questions & Transparency

### How to Review Your Security:

**In Salesforce:**
1. Setup → Apps → Connected Apps → Manage Connected Apps
2. Find "Resin AI Fundraising Assistant"
3. View permissions, active sessions, and user access
4. Revoke access anytime with one click

**Ask Us:**
- Request our full security documentation
- Schedule a security review call with our team
- Review our data processing agreement (DPA)
- Ask any questions: joebouchard@resin.team

### Regular Security Reviews:
- We conduct quarterly security audits
- We update this document as our practices evolve
- We notify you of any material changes to data handling

---

## Contact & Support

**Security Questions:** joebouchard@resin.team  
**General Support:** joebouchard@resin.team  
**Privacy Requests:** joebouchard@resin.team

**Response Time:**
- Security incidents: < 4 hours
- General questions: < 24 hours
- Privacy requests: < 5 business days

---

## Document Version

**Version:** 1.0  
**Last Updated:** November 4, 2025  
**Next Review:** February 4, 2026

We review and update this document quarterly or whenever our security practices change materially.

---

## Additional Resources

- [Anthropic Privacy Policy](https://www.anthropic.com/privacy)
- [Anthropic Security](https://www.anthropic.com/security)
- [Cloudflare Security](https://www.cloudflare.com/trust-hub/)
- [Salesforce OAuth Documentation](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_flows.htm)
- [AFP Donor Bill of Rights](https://afpglobal.org/donor-bill-rights)

---

**Your donor relationships are built on trust. We take that responsibility seriously.**
