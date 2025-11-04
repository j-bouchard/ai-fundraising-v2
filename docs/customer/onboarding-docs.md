# Resin MCP Server - Implementation Guide

*For implementers building AI-powered Salesforce fundraising solutions*

## Overview

Resin is an MCP (Model Context Protocol) server that connects AI assistants to Salesforce fundraising data. End-users interact with their donor database through natural language conversations rather than navigating Salesforce reports or writing SOQL queries.

**What it does from user perspective:**
- Users ask questions like "Who are my top donors?" or "Show me lapsed donors from Q4"
- System translates questions into Salesforce queries automatically
- Results come back with context, enrichment, and recommended next steps
- Users can take action (create records, update contacts) through conversation

**How it fits into workflow:**
Instead of logging into Salesforce → navigating reports → exporting data → analyzing spreadsheets, users have a conversation. The AI assistant handles querying, filtering, formatting, and contextualizing results.

**Value provided:**
- Reduces time from "I have a question" to "I have an answer" from 10+ minutes to 30 seconds
- Surfaces insights users wouldn't find manually (trends, patterns, opportunities)
- Makes Salesforce data accessible to non-technical fundraisers
- Enables action without leaving the conversation (schedule follow-ups, generate emails)

---

## Section 1: Implementation Requirements

### Prerequisites for Your Salesforce Organization

**Salesforce edition & features:**
- Professional, Enterprise, or Unlimited edition (API access required)
- REST API enabled
- Connected Apps feature enabled
- Standard objects: Account, Contact, Opportunity (must be accessible)

**Data quality requirements:**
- Donor records (Contacts/Accounts) with giving history
- Opportunities with Amount, Stage, CloseDate populated
- Contact records with Email, Phone for outreach workflows
- Consistent use of standard fields (avoid empty critical fields)

**Custom fields (optional but recommended):**
- Wealth capacity indicators
- Engagement scores
- Custom donor segments/tags
- Last contact date tracking

**API rate limits:**
- System caches queries for 60 seconds to minimize API calls
- Typical usage: 100-200 API calls per user per day
- Ensure your Salesforce org has sufficient API quota

### Accounts & Permissions Setup

**Required Salesforce user permissions:**
- API Enabled
- View All Data (for full donor visibility) OR
- Read access to Accounts, Contacts, Opportunities
- Modify All Data (if users will create/update records) OR
- Create/Edit on specific objects

**Connected App setup:**
1. Navigate to Setup → Apps → App Manager
2. Create New Connected App:
   - App Name: "Resin AI Fundraising Assistant"
   - Contact Email: your-email@domain.com
   - Enable OAuth Settings: Yes
   - Callback URL: https://login.salesforce.com/services/oauth2/callback
   - Selected OAuth Scopes:
     - Full access (full)
     - Perform requests at any time (refresh_token, offline_access)
3. Save and note the Consumer Key (Client ID) and Consumer Secret
4. Wait 2-10 minutes for Connected App to propagate

**OAuth token generation:**
1. Use Salesforce Web Server OAuth flow to get a refresh token
2. Store refresh token securely (never expires unless explicitly revoked)
3. System will automatically handle access token refresh

### Configuration Checklist

- [ ] Salesforce Professional edition or higher with API access
- [ ] Connected App created with OAuth scopes configured
- [ ] OAuth refresh token generated and stored securely
- [ ] Test user account has API Enabled permission
- [ ] Test user can read Accounts, Contacts, Opportunities
- [ ] Standard fields (Amount, CloseDate, Email) are populated on test data
- [ ] Cloudflare Workers account set up (for deployment)
- [ ] API_KEY secret configured for authentication
- [ ] All Salesforce credentials stored as Cloudflare secrets

### Testing Implementation

**Step 1: Verify Salesforce connectivity**
```bash
curl https://resin.mpazbot.workers.dev/ready \
  -H "Authorization: Bearer your-api-key"
```
Expected: `{"status":"ready","salesforce":"connected"}`

**Step 2: Test a simple query**
Use MCP Inspector or Goose Desktop to connect to the server:
- Server URL: `https://resin.mpazbot.workers.dev/mcp`
- Auth: Bearer token in header
- Call tool: `run_soql` with query: `SELECT Id, Name FROM Contact LIMIT 5`
- Expected: JSON array with 5 contact records

**Step 3: Test natural language donor query**
- Call tool: `query_donors` with criteria: "donors who gave in the last year"
- Expected: List of contacts with recent giving history

**Step 4: Verify logging and metrics**
```bash
npx wrangler tail --format pretty
```
Expected: Structured JSON logs showing request flow, SOQL queries, response times

---

## Section 2: How It Works for End-Users

### What Your Users Can Do

**Scenario 1: Discover Top Donors**
- User asks: "Who are my top 10 donors this year?"
- System queries Opportunities with Amount > threshold, CloseDate in current year
- User receives: Ranked list with donor names, total giving, most recent gift date
- Example output:
  ```
  Top 10 Donors (2024):
  1. John Smith - $150,000 (last gift: Oct 15)
  2. Acme Foundation - $100,000 (last gift: Sept 3)
  ...
  ```

**Scenario 2: Identify Lapsed Donors**
- User asks: "Show me donors who haven't given in 18 months"
- System finds Contacts with last gift date > 18 months ago, previously gave >$1000
- User receives: List with names, last gift amount, last gift date, suggested re-engagement messaging
- Example output:
  ```
  Lapsed Donors (22 found):
  - Sarah Johnson | Last gift: $5,000 on March 2023 | Suggest: "Thank you for your 2023 support..."
  ```

**Scenario 3: Pipeline Review**
- User asks: "What's my Q1 pipeline status?"
- System aggregates Opportunities by Stage, filters to Q1 close dates
- User receives: Breakdown by stage, total value, at-risk opportunities flagged
- Example output:
  ```
  Q1 2025 Pipeline: $450,000
  - Prospecting: $80,000 (4 opportunities)
  - Proposal: $200,000 (3 opportunities) ⚠️ 2 overdue
  - Negotiation: $170,000 (2 opportunities)
  ```

### The Four-Step Workflow

**Step 1: Connect**
- What users do: Provide Salesforce instance URL and authorize access (one-time OAuth flow)
- What happens: System validates credentials, scans data structure, caches metadata
- First-time user question: "Do I need to give you my Salesforce password?"
  - Answer: No. OAuth flow never exposes your password. You authorize access through Salesforce's secure login page.

**Step 2: Ask**
- What users do: Type natural language questions about donors, opportunities, or relationships
- What they can ask about:
  - Donor discovery: "major donors," "lapsed donors," "first-time donors"
  - Giving patterns: "who gave more than $X," "donors in [sector/location]"
  - Pipeline analysis: "open opportunities," "gifts this quarter," "year-over-year trends"
  - Contact management: "tell me about [Donor Name]," "who works at [Company]"
- Examples:
  - "Show me donors who gave more than $10,000 last year"
  - "Get me all prospects in the technology sector"
  - "Find contacts at Acme Corp"
- What they get back: Formatted lists with names, amounts, dates, relationships, and context

**Step 3: Get Insights**
- What users see:
  - Ranked/sorted results (e.g., top donors by amount, lapsed donors by risk level)
  - Trend analysis (giving increasing/decreasing, engagement patterns)
  - Recommendations ("reach out to these 5 donors this week")
- Where insights come from:
  - Salesforce giving history (Opportunities, Campaigns)
  - Relationship data (Accounts, Contacts, custom fields)
  - Derived patterns (time since last gift, gift frequency, upgrade potential)
- How to use insights: System flags next steps like "Schedule follow-up," "Send thank-you," "Qualify for major gift conversation"

**Step 4: Take Action**
- What users can do:
  - Create new Opportunities: "Add a $50K opportunity for John Doe"
  - Update Contact info: "Change Jane's email to jane@newcompany.com"
  - Log activities: "Mark that I called Sarah yesterday"
  - Generate outreach: "Draft a thank-you email for Michael's recent gift"
- Where actions are logged: All changes write directly to Salesforce. Users can verify in Salesforce UI under Activity History, Opportunity records, etc.

### What Users Cannot Do

**Delete records** — System prevents deletions to avoid accidental data loss. Users must use Salesforce UI to delete.

**Bypass Salesforce permissions** — If a user can't see a record in Salesforce (due to sharing rules), they can't see it through the AI assistant either.

**Access encrypted fields** — Salesforce field-level encryption is respected. Encrypted fields return as masked.

**Execute arbitrary code** — Only pre-approved SOQL queries and record operations. No Apex execution or custom logic.

**Modify system configuration** — Users can't change query patterns, caching behavior, or Connected App settings.

---

## Section 3: Getting Users Started

### Day 1: First-Time User Setup

1. **Authorize Salesforce access** (5 minutes)
   - User clicks "Connect to Salesforce"
   - Redirects to Salesforce login page
   - User authorizes app permissions
   - System confirms connection successful

2. **Ask first question** (1 minute)
   - User types: "Show me my recent donors"
   - System returns donors who gave in last 90 days
   - User sees list with names, amounts, dates

3. **Take first action** (2 minutes)
   - User selects a donor from results
   - User asks: "Tell me more about [Donor Name]"
   - System returns full profile: giving history, contact info, relationships, recent activity

**Estimated time:** 8 minutes from zero to first successful insight

### Week 1: Core Workflows

- **Monday:** "Who should I reach out to this week?"
  - System identifies high-value donors not contacted in 30+ days
  - User schedules 3-5 outreach calls
  - Estimated time: 10 minutes

- **Wednesday:** "What's my pipeline for this month?"
  - System shows opportunities closing this month by stage
  - User identifies at-risk deals and plans follow-ups
  - Estimated time: 15 minutes

- **Friday:** "Show me year-over-year giving trends"
  - System compares this year's giving to last year
  - User identifies growth/decline areas for strategic planning
  - Estimated time: 10 minutes

---

## Section 4: Common Workflows & Patterns

### Workflow: Weekly Donor Outreach Planning

**Goal:** Identify 5-10 priority donors to contact this week

**Steps:**
1. User asks: "Who should I reach out to this week?"
2. System queries for:
   - Major donors (gave >$5K) not contacted in 30+ days
   - Lapsed donors (last gift 12-18 months ago) with re-engagement potential
   - Warm prospects (recent engagement, no gift yet)
3. System returns prioritized list with:
   - Donor name and contact info
   - Last interaction date
   - Giving history summary
   - Suggested talking points
4. User selects 5 donors and says: "Generate outreach emails for these contacts"
5. System drafts personalized emails referencing giving history and relationship context

**Expected result:** 5 ready-to-send emails in 10 minutes (vs. 60+ minutes manually researching and writing)

**Tips:**
- Run this workflow Monday morning for best results
- Focus on "warm" contacts (gave within 24 months) for higher response rates
- Review and personalize AI-generated emails before sending
- Log all outreach in Salesforce for future reference

### Workflow: Major Gift Qualification

**Goal:** Identify prospects ready for major gift conversations ($25K+)

**Steps:**
1. User asks: "Show me donors with major gift potential"
2. System queries for:
   - Donors who gave $10K+ in past 2 years
   - Contacts with wealth indicators (if available)
   - Engaged donors (multiple gifts or campaign participation)
3. System returns list with qualification scores based on:
   - Giving capacity (largest previous gift)
   - Engagement level (gift frequency, event attendance)
   - Recency (time since last gift)
4. User reviews top 10 prospects
5. User asks: "Create a briefing document for [Top Prospect]"
6. System generates:
   - Full giving history
   - Relationship timeline
   - Key talking points
   - Suggested ask amount

**Expected result:** 10 qualified prospects with briefing materials in 15 minutes

**Tips:**
- Filter by industry/sector if you have custom fields configured
- Cross-reference with wealth screening data if available
- Schedule qualification review monthly or quarterly
- Track qualification status in Salesforce custom field

### Workflow: Pipeline Management & Forecasting

**Goal:** Review open opportunities and update forecasts

**Steps:**
1. User asks: "Show me all open opportunities closing this quarter"
2. System returns opportunities grouped by:
   - Stage (Prospecting, Proposal, Negotiation, etc.)
   - Amount (total value per stage)
   - Close date (sorted by urgency)
3. User identifies at-risk deals (overdue close dates, stalled in stage)
4. User asks: "What's the status of [Opportunity Name]?"
5. System provides:
   - Current stage and amount
   - Days in current stage
   - Historical notes and activities
   - Contact information for decision-maker
6. User updates opportunities: "Move [Opportunity] to Proposal stage"

**Expected result:** Updated pipeline with clear next steps for each opportunity

**Tips:**
- Review pipeline weekly (Fridays work well)
- Flag opportunities stuck in stage >30 days for follow-up
- Update close dates proactively to keep forecast accurate
- Use Salesforce Chatter/Activities to log pipeline updates

---

## Section 5: Troubleshooting

### Common User Issues

**Problem: "Query returned no results" but I know the data exists**
- What causes it: Query criteria don't match Salesforce field values exactly (e.g., searching "Tech" when field says "Technology")
- How to fix it:
  - Check Salesforce UI for exact field values (picklist values, spelling)
  - Try broader query: "show all donors" then filter results
  - Verify field names match standard Salesforce objects (e.g., "Contact" not "Person")
- Prevention: Use standard Salesforce terminology; ask "show me examples" first

**Problem: "Permission denied" when trying to update a record**
- What causes it: User's Salesforce permissions don't allow editing that object/field
- How to fix it:
  - Check Salesforce profile permissions (Setup → Users → Profiles)
  - Verify object-level permissions (Read/Create/Edit)
  - Check field-level security for specific fields
  - Contact Salesforce admin to grant necessary permissions
- Prevention: Set up proper permissions during implementation (see Section 1)

**Problem: Generated email/outreach is too generic**
- What causes it: Insufficient context provided in request; missing data in Salesforce
- How to fix it:
  - Provide specific details: "Generate email for John Doe referencing his $25K September gift"
  - Add notes/context to Salesforce Contact record before generating
  - Review and personalize AI output before sending
- Prevention: Keep Salesforce records updated with notes, interactions, and relationship context

**Problem: Slow response times or timeouts**
- What causes it: Large result sets (>1000 records), complex queries, Salesforce API slowness
- How to fix it:
  - Narrow query scope: add date ranges, amount thresholds, or filters
  - Break complex questions into smaller queries
  - Check Salesforce performance (system status page)
  - Wait 60 seconds for cache to reset if repeating same query
- Prevention: Use specific queries rather than "show me everything"

### When Implementation Isn't Working

**Setup issue: "Missing OAuth env vars" error**
- What went wrong: Salesforce credentials not configured in Cloudflare secrets
- How to debug:
  - Run `npx wrangler secret list` to check configured secrets
  - Verify SF_CLIENT_ID, SF_CLIENT_SECRET, SF_REFRESH_TOKEN, SF_INSTANCE_URL, SF_DOMAIN are set
  - Check Cloudflare Workers logs: `npx wrangler tail --format pretty`
- Resolution:
  - Run `./set-secrets.sh` from mcp/resin directory
  - Manually set secrets: `echo "value" | npx wrangler secret put SECRET_NAME`
  - Redeploy: `npm run deploy`

**Setup issue: "/ready endpoint returns 'salesforce: disconnected'"**
- What went wrong: Salesforce credentials invalid or refresh token expired
- How to debug:
  - Test OAuth flow manually with Salesforce Workbench
  - Check Connected App is active (Setup → App Manager → verify status)
  - Verify refresh token was generated correctly (should start with "5Aep...")
  - Review Salesforce logs for API errors
- Resolution:
  - Regenerate refresh token using OAuth Web Server flow
  - Update SF_REFRESH_TOKEN secret
  - Test with `/ready` endpoint again

**Setup issue: Users can connect but queries fail**
- What went wrong: Salesforce permissions insufficient; field-level security blocking access
- How to debug:
  - Check user's profile in Salesforce (Setup → Users → click user → View Profile)
  - Test SOQL query directly in Salesforce Developer Console
  - Review error message in Cloudflare logs for specific permission errors
- Resolution:
  - Grant "View All Data" permission for full access OR
  - Grant object-level Read permissions for Account, Contact, Opportunity
  - Adjust field-level security for specific fields if needed

---

## Section 6: What You Should Tell Your Customers

### Key Points to Communicate

**What this can do for them:**
- "You'll spend less time navigating Salesforce reports and more time talking to donors. Ask questions in plain English and get answers in seconds."

**Time investment for getting started:**
- "Setup takes about 10 minutes. Authorize Salesforce access, ask your first question, and you're up and running. First week is learning which questions work best for your workflow."

**What Salesforce data quality requirements exist:**
- "The better your Salesforce data, the better the insights. Make sure donor records have emails, giving history is logged as Opportunities, and key fields (Amount, CloseDate) are filled in. We'll help you identify data gaps during setup."

**Privacy/data handling reassurance:**
- "Your Salesforce data stays in Salesforce. The system queries your org in real-time using secure OAuth authentication. No data is stored outside your Salesforce instance. You see exactly what your Salesforce permissions allow—nothing more, nothing less."

**Support and next steps:**
- "We'll walk you through first-time setup and your first few workflows. Ongoing support includes troubleshooting, query optimization, and adding custom fields or workflows as your needs evolve."

### Common Customer Questions

**Q: How is this different from Salesforce reports?**
A: Salesforce reports require you to know what fields to include, how to filter, and how to format results. This system lets you ask questions in plain English and get formatted, contextualized answers immediately. No clicking through report builders or exporting to Excel.

**Q: Will this change my Salesforce data?**
A: Only when you explicitly tell it to. You can create new records (Opportunities, Contacts) or update existing ones through conversation. The system never deletes data and logs all changes in Salesforce Activity History. You retain full control.

**Q: How secure is this?**
A: The system uses Salesforce's OAuth 2.0 authentication—the same security protocol used by major integrations. Your credentials are encrypted, API calls are over HTTPS, and the system respects all Salesforce permissions and field-level security. If you can't see data in Salesforce, you won't see it here either.

**Q: What if I need to customize this?**
A: We can add custom queries for specific donor segments, integrate additional data sources (wealth screening, event attendance), or create custom workflows (automated follow-up scheduling, campaign analytics). Customization depends on your Salesforce setup and specific needs—let's discuss your use case.

**Q: What happens if I hit Salesforce API limits?**
A: The system caches queries for 60 seconds to minimize API calls. Typical usage is 100-200 API calls per user per day—well under Salesforce's daily limits (15,000+ for most orgs). If you're running large batch operations, we can adjust caching or schedule queries during off-peak hours.

**Q: Can multiple team members use this at once?**
A: Yes. Each user connects with their own Salesforce credentials and sees data according to their permissions. This ensures proper access control and audit trails. You can have unlimited users as long as your Salesforce API quota supports it.

---

## Section 7: Operational Considerations

### What to Monitor

**Metrics that indicate health:**
- Response times: P95 should be <3 seconds for typical queries
- Error rates: <1% of requests should fail
- Salesforce API usage: Monitor daily API call consumption (Salesforce Setup → System Overview)
- Authentication failures: Should be near zero after initial setup

**Warning signs to watch for:**
- Increased response times (>5 seconds): Indicates large result sets or slow Salesforce performance
- Repeated authentication failures: Refresh token may have expired or Connected App is misconfigured
- High API call volume: Users may be running inefficient queries; optimize query patterns
- User reports of "no results" for known data: Check Salesforce permissions or field-level security

**How often to check:**
- Weekly: Review Cloudflare Analytics Engine metrics (request counts, response times)
- Monthly: Check Salesforce API usage trends (Setup → System Overview → API Usage)
- As needed: Monitor live logs during troubleshooting (`npx wrangler tail`)

### Known Limitations & Constraints

**What might cause slowdowns or failures:**
- Queries returning >1000 records (Salesforce governor limits): Narrow query scope with filters
- Complex SOQL joins across multiple objects: Break into separate queries
- Salesforce system maintenance windows: Check trust.salesforce.com for scheduled downtime
- Cloudflare Workers cold starts: First request after idle period may take 1-2 seconds

**Salesforce rate limits:**
- Daily API call limit depends on Salesforce edition (Professional: 15,000; Enterprise: 100,000+)
- 60-second query caching reduces redundant API calls
- Concurrent API call limit: 25 simultaneous requests per org

**Data volume considerations:**
- Optimal performance with <100,000 Contact records
- Large orgs (500K+ records) should use indexed fields (Id, Email, Name) in queries
- Aggregate queries (COUNT, SUM) are faster than returning full record sets

**Timing expectations:**
- Simple queries (<100 records): <1 second
- Complex queries (joins, filters, aggregates): 1-3 seconds
- Record creation/updates: 1-2 seconds
- OAuth token refresh (automatic): <500ms

### Best Practices

**How to structure data in Salesforce for best results:**
- Use standard Opportunity object for all giving history (not custom objects)
- Populate standard fields consistently: Amount, CloseDate, StageName
- Keep Contact.Email and Contact.Phone updated for outreach workflows
- Add custom fields for donor segments (Major Donor checkbox, Engagement Score number)
- Use Campaigns to track donor engagement and touchpoints

**Workflows that work well:**
- Weekly outreach planning: Identify 5-10 priority donors to contact
- Monthly pipeline review: Update opportunity stages and close dates
- Quarterly trend analysis: Compare year-over-year giving and identify growth areas
- Event-driven: "Show me all attendees from last week's gala who haven't donated yet"

**Patterns to avoid:**
- Open-ended queries: "Show me all data" → use specific filters instead
- Repeated identical queries: Leverage 60-second cache by grouping related questions
- Deleting records through other tools without logging: Breaks relationship context
- Bypassing system for record updates: Use AI assistant for consistency and audit trail

**Maintenance tasks:**
- Monthly: Review Salesforce data quality (missing emails, outdated contact info)
- Quarterly: Audit user permissions and remove inactive users
- Annually: Refresh OAuth tokens proactively (though they don't expire unless revoked)
- As needed: Update Connected App scopes if adding new capabilities

---

## Section 8: Support & Next Steps

### For Customers

**How to report issues:**
- First: Check troubleshooting section (Section 5) for common problems
- Next: Contact your implementation team with:
  - What you asked the system to do (exact question or command)
  - What you expected to happen
  - What actually happened (error message, unexpected results)
  - Your Salesforce username (for permission troubleshooting)

**Support process:**
- Tier 1: User issues (permissions, query help, data quality) - respond within 4 business hours
- Tier 2: System issues (authentication failures, slow performance) - respond within 2 business hours
- Tier 3: Critical outages (system down, data corruption) - respond within 1 hour

**What constitutes normal behavior vs problems:**
- Normal: Query takes 2-3 seconds, returns formatted list, includes context and recommendations
- Problem: Query times out (>10 seconds), returns error message, or returns empty results for known data
- Normal: Generated email references donor's giving history accurately
- Problem: Generated email contains factual errors or wrong donor information

### For You (Implementer)

**Resources for deeper technical understanding:**
- `mcp/resin/CLAUDE.md` - Complete technical documentation (architecture, deployment, testing)
- `mcp/resin/MONITORING.md` - Structured logging and metrics queries
- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- Model Context Protocol: https://modelcontextprotocol.io
- Salesforce SOQL Reference: https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta

**Monitoring and maintenance tasks:**
- Set up Cloudflare Analytics Engine queries for weekly performance reports
- Configure alerts for error rates >1% or P95 response times >5 seconds
- Schedule monthly Salesforce API usage review
- Keep OAuth credentials rotated annually (best practice, not required)

**When to escalate to technical support:**
- Authentication failures after verifying all credentials are correct
- Consistent query failures for specific object types (may indicate Salesforce API changes)
- Performance degradation without corresponding Salesforce system issues
- Suspected data integrity problems (wrong results, missing records)
- Need to add custom SOQL query patterns not covered by pre-built library

---

## Additional Resources

**Customer-facing quick start guide:**
- `docs/customer/product-info.md` - End-user getting started guide (4-step workflow: Connect, Ask, Insights, Act)

**Technical reference for implementers:**
- `mcp/resin/CLAUDE.md` - Architecture, deployment, testing, adding features
- `mcp/resin/MONITORING.md` - Observability, structured logging, metrics

**Deployment scripts:**
- `mcp/resin/set-secrets.sh` - Configure Cloudflare secrets from .env
- `scripts/devops/` - Deployment automation and CI/CD helpers

**Support contact:**
- GitHub issues: https://github.com/your-org/resin/issues (update with actual repo)
- Technical documentation: Model Context Protocol at https://modelcontextprotocol.io
