# Fundraising Assistant - Product Roadmap

**Version:** 3.2  
**Last Updated:** November 4, 2025  
**For:** Developer Onboarding & Build Planning  
**Status:** Pre-Launch - Validating with Pilot Users

---

## Executive Summary

We're building an AI fundraising strategist that helps nonprofit development teams prioritize donors and manage relationships more effectively. The product integrates with Salesforce (NPSP + Nonprofit Cloud) and delivers insights through multiple channels (starting with generated reports, expanding to Slack and web).

**Current State:**
- ✅ MCP server rewritten in TypeScript for Cloudflare
- ✅ Works with Goose for orchestration
- ✅ MCP should work with both NPSP and Nonprofit Cloud (needs testing with Nonprofit Cloud)
- ⚠️ Needs multi-tenant support and logging
- ⚠️ Needs automated delivery mechanisms

**Goal:**
- Get 3-5 orgs using daily prioritization consistently
- Validate product-market fit before scaling
- Build modular architecture entirely on Cloudflare (simpler, cheaper)

---

## Product Vision & Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              DELIVERY LAYER                     │
│                                                 │
│  Phase 1: Daily Report Generation (TBD method)  │
│  Phase 2: Slack Bot (Cloudflare Worker)        │
│  Phase 3: Web App (Cloudflare Pages)           │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│           ORCHESTRATION LAYER                   │
│                                                 │
│  Goose (AI Agent Framework)                     │
│  • Manages conversation state                   │
│  • Handles tool calling (MCP)                   │
│  • Loads and executes recipes                   │
│  • Routes between workflows                     │
│  • Generates daily priority reports             │
│                                                 │
│  Using: Claude Sonnet 4.5 as LLM               │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│           INTELLIGENCE LAYER                    │
│                                                 │
│  Goose Recipes (YAML + Markdown)                │
│  • recipes/fundraising_expert.yaml              │
│  • recipes/daily_prioritization.yaml            │
│  • recipes/email_drafter.yaml                   │
│  • recipes/donor_research.yaml                  │
│  • recipes/conversational_data_entry.yaml       │
│                                                 │
│  Each recipe = An AI agent with specific job    │
│  Written and maintained by: Product Lead        │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│           WRAPPER & LOGGING LAYER               │
│                                                 │
│  Goose Wrapper (Python)                         │
│  • Wraps all Goose calls                        │
│  • Logs inputs/outputs                          │
│  • Tracks performance metrics                   │
│  • Calls Cloudflare MCP via HTTP                │
│  • Sends logs to Cloudflare                     │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│         CLOUDFLARE INFRASTRUCTURE               │
│                                                 │
│  MCP Server (TypeScript) - Already built ✅     │
│  • OAuth to Salesforce                          │
│  • Execute SOQL queries                         │
│  • Create/Update records                        │
│  • Works with NPSP + Nonprofit Cloud            │
│  • Multi-tenant (per-org credentials)           │
│                                                 │
│  Logging Endpoint (TypeScript/JavaScript)       │
│  • Receives interaction logs                    │
│  • Stores in Cloudflare KV                      │
│  • 90-day retention                             │
│                                                 │
│  Storage: Cloudflare KV                         │
│  • Org credentials (encrypted)                  │
│  • Interaction logs                             │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│    SALESFORCE (NPSP + Nonprofit Cloud)          │
│    Customer's Data                              │
└─────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Stack (All Phases)
- **Infrastructure:** Cloudflare Workers (entire backend)
- **MCP Server:** TypeScript on Cloudflare Workers ✅ Already built
- **Orchestration:** Goose (AI agent framework)
- **LLM:** Claude Sonnet 4.5 (via Anthropic API)
- **Agents:** Goose recipes (YAML + markdown) - Written by product lead
- **Wrapper:** Python (calls Cloudflare MCP via HTTP)
- **Salesforce:** NPSP + Nonprofit Cloud (both supported)
- **Storage:** Cloudflare KV (credentials, logs)
- **Cron:** Cloudflare Cron Triggers

### Future Additions (Phase 3+)
- **Database:** Supabase PostgreSQL (for advanced org management)
- **Frontend:** Cloudflare Pages (for web app)
- **Monitoring:** Sentry (error tracking)

### Cost Structure
- **Phase 1:** $0/month (Cloudflare free tier)
- **Phase 2:** $5/month (Cloudflare paid tier if needed)
- **Phase 3:** $30-45/month (Cloudflare + Supabase)

---

## Responsibility Matrix

### Product Lead (You):
- ✅ Write all Goose recipes (YAML/markdown files)
- ✅ Define fundraising workflows and logic
- ✅ Test and iterate on prompts
- ✅ Manage pilot users
- ✅ Write security documentation
- ✅ Demo to prospects

### Developer:
- ✅ Multi-tenant Cloudflare MCP (add if not present)
- ✅ Test MCP with Nonprofit Cloud (verify compatibility)
- ✅ Goose wrapper with logging (Python, calls Cloudflare via HTTP)
- ✅ Cloudflare logging endpoint (receives and stores logs in KV)
- ✅ Daily report generation orchestration
- ✅ Slack integration (webhook handler in Cloudflare Worker)
- ✅ Admin log viewer (simple HTML + API endpoint)
- ✅ Deployment and configuration

---

## Phase 1: Validation & MVP (Weeks 1-6)

**Goal:** Get 3-5 orgs using daily donor prioritization consistently with full visibility into usage

### Week 1-2: Multi-Tenant MCP & Logging Infrastructure

#### 1. Multi-Tenant Cloudflare MCP

**Purpose:** Enable single MCP server to handle multiple orgs with isolated credentials

**What needs to be added to existing TypeScript MCP:**

**Org Credential Storage in KV:**
- Store each org's Salesforce credentials in Cloudflare KV
- Key format: `org:{org_id}:credentials`
- Value: JSON with encrypted credentials containing sf_client_id, sf_client_secret (encrypted), sf_refresh_token (encrypted), sf_instance_url, user_email, user_name, created_at

**Request Routing by Org:**
- Accept `org_id` via query parameter or header
- Look up org credentials from KV
- Connect to that org's Salesforce
- Execute MCP tool request
- Return result

**HTTP Endpoint Structure:**
- POST /mcp/tools - Execute MCP tool for specific org
- GET /mcp/health - Health check

**Success criteria:**
- Can handle 10 concurrent orgs
- Credentials isolated per org
- Salesforce connections properly managed
- <500ms latency per request

---

#### 2. Test MCP with Nonprofit Cloud

**Purpose:** Verify MCP server works with Nonprofit Cloud orgs (currently only tested with NPSP)

**Testing approach:**
1. Connect to Nonprofit Cloud sandbox
2. Run all existing SOQL queries
3. Document any objects/fields that don't exist in Nonprofit Cloud
4. Test create/update operations
5. Verify all MCP tools work correctly

**What we're checking:**
- Does current MCP query standard objects that work in both? (Contact, Opportunity, Task)
- Are there any NPSP-specific queries that will fail in Nonprofit Cloud?
- Do Nonprofit Cloud orgs structure data differently?

**Expected outcome:**
- MCP likely works fine with both (since it uses standard objects)
- Document any differences found
- Only add adaptive logic if testing reveals issues

**Success criteria:**
- All MCP queries work with Nonprofit Cloud sandbox
- Documentation of any differences between NPSP and Nonprofit Cloud
- Clear understanding of what (if anything) needs to change

---

#### 3. Goose Wrapper with Comprehensive Logging

**Purpose:** Wrap all Goose calls to capture inputs, outputs, and performance data, then send to Cloudflare

**Python Wrapper Script (goose_wrapper.py):**

**Core functionality:**
- Wraps every Goose recipe execution
- Calls Cloudflare MCP via HTTP (not local MCP)
- Captures: input query, output response, recipe used, timing, errors
- Sends structured logs to Cloudflare endpoint
- Returns results to calling function

**Data captured per interaction:**
- timestamp
- org_id
- user_id
- user_email
- recipe_used
- input
- output
- response_time_ms
- error (if any)
- source (daily_report, slack, goose_cli, web_app)

**How it connects to Cloudflare MCP:**
- Configures Goose to use Cloudflare MCP URL
- Passes org_id as parameter
- Handles authentication via API key

**Key features:**
- HTTP calls to Cloudflare MCP (not local stdio)
- Handles timeouts (2 min max)
- Retries on failure (1 retry with exponential backoff)
- Logs all interactions regardless of success/failure
- Doesn't fail main request if logging fails

**Files to create:**
- goose_wrapper.py - Main wrapper class
- config.py - Configuration for Cloudflare endpoints
- Unit tests for wrapper

**Success criteria:**
- Every Goose call is logged
- Logs include all required fields
- Failed calls are logged with error details
- No impact on user experience if logging fails
- Can handle 100 requests/day (Phase 1 volume)

---

#### 4. Cloudflare Logging Endpoint

**Purpose:** Receive and store all interaction logs from Goose wrapper

**Logging Endpoint:**
- POST /log - Receive log entries, validate required fields (org_id, timestamp), store in KV with 90-day TTL
- Key format: `log:{org_id}:{timestamp}`

**KV Namespaces:**

Configure KV namespaces:
- ORG_CREDENTIALS - Store org Salesforce credentials
- INTERACTION_LOGS - Store interaction logs

**API Endpoint to Retrieve Logs:**
- GET /logs?org_id=org_123&limit=50 - List logs for specific org, sort by timestamp descending, return as JSON array

**Success criteria:**
- Accepts 1000+ log requests/minute
- <50ms latency
- Handles malformed requests gracefully
- No data loss
- Can retrieve logs by org_id

---

### Week 3-4: Daily Report Generation & Testing

#### 5. Daily Priority Report Generation via Goose

**Purpose:** Generate daily donor prioritization reports using Goose orchestration

**How it works:**

**Product Lead Creates Recipe:**
- File: `recipes/daily_prioritization.yaml`
- Recipe defines the workflow for generating daily priorities
- Calls MCP tools to query Salesforce data
- Formats output as structured report

**Developer Builds Orchestration:**

**Option A: Manual Generation (Week 3-4):**
- Product lead runs: `goose session start --profile daily_prioritization`
- Goose executes recipe, calls Cloudflare MCP, generates report
- Save output as markdown/text file
- Manually send to pilot org (email, Slack DM, etc.)
- This validates the recipe works before automating

**Option B: Automated Generation (Week 5-6):**
- Python script calls Goose wrapper
- Script runs daily for each org
- Goose generates report using recipe
- Script saves report to file or sends to delivery channel (TBD)
- Logs all interactions

**Report Structure (defined in Goose recipe):**

```
DAILY DONOR PRIORITIES - [Date]
For: [Org Name]
Generated by: Resin AI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 IMMEDIATE PRIORITIES (Act This Week)

1. Sarah Johnson - Mid-Level Donor
   - Lifetime giving: $4,500
   - Last gift: 13 months ago (LAPSED)
   - Why now: In critical reactivation window
   - Suggested action: Personal call
   - Talking points: Thank for past support of scholarships,
     share recent impact story, gauge interest in Annual Fund
   - Recommended ask: $1,500

2. [Additional priority donors...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 THIS WEEK'S OPPORTUNITIES

- James Wilson: First-time $1K donor (30 days ago) - Stewardship call needed
- Patricia Davis: Consistent $500 annual donor - Upgrade conversation ready
- Robert Lee: Major donor capacity - No ask in 6 months

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 PORTFOLIO SNAPSHOT

- Total active donors: 247
- Major donor touches this month: 12
- Lapsed donors (action needed): 8
- Warm prospects ready for ask: 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 WHY THESE PRIORITIES?

These recommendations use RFM scoring (Recency, Frequency, Monetary)
combined with fundraising best practices. Donors who are 11-13 months
since last gift have a 60% reactivation rate if contacted promptly.
```

**Delivery Method (TBD for Phase 1):**

Options to test with pilots:
- Email: Send as HTML email via SendGrid
- Slack DM: Send via Slack bot direct message
- Saved File: Save to shared folder (Google Drive, Dropbox)
- Web Dashboard: Display in simple web interface
- Mix: Different orgs prefer different methods

For Week 3-4: Manually generate and send reports to validate usefulness  
For Week 5-6: Automate generation, test delivery methods with pilots

**Files to create:**
- recipes/daily_prioritization.yaml - Recipe (product lead)
- generate_reports.py - Script to orchestrate daily generation (developer)
- Report template (within recipe or as separate template)

**Success criteria:**
- Recipe successfully generates useful reports
- Product lead can manually generate reports for all pilot orgs
- Pilot orgs find reports valuable and actionable
- Reports generated in <30 seconds per org

---

#### 6. Admin Log Viewer (Basic)

**Purpose:** View logged interactions for quality review and debugging

**Static HTML Page (admin/logs.html - host on Cloudflare Pages):**

**Features:**
- Dropdown to select org
- Button to load logs
- Table displaying: timestamp, user email, recipe used, input (first 50 chars), response time, source, View Full button
- Modal to show full log details
- Highlight errors (red background)
- Highlight slow queries (yellow background)

**API calls:**
- Fetch logs from GET /logs?org_id=org_123&limit=50 (requires API key authentication)

**Key views needed:**
- Recent activity (last 50 interactions)
- Per-org activity
- Error log (filter for errors)
- Slow queries (filter for >10 seconds)

**Files to create:**
- admin/logs.html - Static HTML page with JavaScript
- CSS for styling
- API endpoint already created in logging section

**Success criteria:**
- Product lead can view all interactions
- Can filter by org
- Can see full input/output
- Can identify errors quickly
- Can track which recommendations users acted on

---

### Week 5-6: Pilot Testing & Iteration

**What we're doing:**
- Automate daily report generation for 3 pilot orgs
- Test different delivery methods per org preference
- Monitor logs daily
- Collect feedback on report usefulness
- Iterate on Goose recipes based on feedback
- Prepare for Phase 2 (Slack)

#### 7. Production Deployment

**Cloudflare Worker Deployment:**
- Deploy main worker (MCP + logging)
- Set secrets (API keys, etc.)
- Create KV namespaces (ORG_CREDENTIALS, INTERACTION_LOGS)
- Deploy admin dashboard (static HTML)

**Add Pilot Org Credentials to KV:**
- Create script or API endpoint to add orgs with inputs (org_id, name, user_email, Salesforce credentials)
- Stores in KV with key org:{org_id}
- Encrypts sensitive fields

**Monitoring:**
- Cloudflare dashboard for worker logs
- Check daily report generation (success/failure)
- Track delivery confirmations (if automated)
- Error alerting (send email/Slack to product lead if >3 errors/day)

**Documentation:**
- Setup guide for adding new pilot org
- Troubleshooting guide
- How to view logs
- How to restart worker (redeploy)
- How to update org credentials

---

#### 8. Feedback Integration Process

**Product lead does:**
- Daily check-ins with pilot users (first week)
- Ask: "Did you get the report? Was it useful? Did you act on any recommendations?"
- Review logs for common questions/issues
- Identify which donors users actually contacted (validate prioritization)
- Iterate on Goose recipes based on what's working/not working
- Note delivery method preferences

**Developer supports:**
- Quick bug fixes as issues arise
- Performance optimization if report generation >30s
- Query optimization if certain patterns are slow
- Add error handling for edge cases
- Adjust automation based on delivery method feedback

**Iteration loop:**
1. User receives daily report
2. User acts (or doesn't act) on recommendations
3. Product lead reviews logs to see what happened
4. Product lead updates recipe OR flags technical issue
5. Developer fixes technical issue if needed
6. Test fix in development
7. Deploy to production
8. Verify improvement in next report

**Success metrics for pilot:**
- Users find reports valuable (qualitative feedback)
- Users act on 3+ recommendations per week
- <5 support questions per week per org
- NPS >50 after 2 weeks of use
- At least 1 testimonial quote collected
- Clear understanding of preferred delivery method per org

---

## Phase 2: Slack Bot (Weeks 7-12)

**Goal:** Real-time interaction via Slack, 10+ pilot/test customers

### Week 7-8: Slack Infrastructure

#### 9. Slack Bot Integration

**Purpose:** Handle Slack interactions via webhooks, trigger Goose recipes, return responses

**Add to existing Cloudflare Worker new endpoints:**
- POST /slack/events - Handle Slack events
- POST /slack/oauth - OAuth callback
- GET /slack/install - Redirect to Slack OAuth

**Slack Event Handler functionality:**
- Verify Slack signature (security requirement)
- Handle URL verification challenge
- Process app_mention events
- Respond within 3 seconds (async processing)
- Look up org by Slack team ID
- Detect intent → select recipe
- Run Goose recipe via wrapper
- Post response to Slack
- Log interaction

**Intent detection (keyword-based for Phase 2):**
- "focus" / "priorities" / "who should i" → daily_prioritization
- "research" / "tell me about" → donor_research
- "draft" / "write email" → email_drafter
- "create" / "add" / "update" → conversational_data_entry
- Default → fundraising_expert

**Key features:**
- Slack signature verification (security)
- Async processing (don't block Slack's 3-second timeout)
- Thread support (reply in threads, not channel)
- "Thinking..." indicators
- Error messages that are user-friendly
- All interactions logged

**Slack App Configuration:**
- OAuth Scopes: app_mentions:read, chat:write, users:read
- Event Subscriptions: app_mention
- Request URL: https://fundraising-mcp.workers.dev/slack/events

**Success criteria:**
- Responds to Slack messages in <5 seconds
- Handles multiple concurrent users
- Gracefully handles errors
- All interactions logged
- User-friendly error messages
- Works in threads (clean UX)

---

#### 10. Slack OAuth & Installation Flow

**Purpose:** Allow orgs to install the Slack bot easily

**User flow:**
1. User visits installation page: https://resin.team/install-slack
2. Clicks "Add to Slack" button
3. Slack OAuth consent screen
4. User approves bot permissions
5. Slack redirects to: https://fundraising-mcp.workers.dev/slack/oauth?code=...
6. Exchange code for bot token
7. Show "Connect Salesforce" page
8. Salesforce OAuth flow
9. Store both tokens in KV
10. Show success page + quick start guide

**Files to create:**
- install.html - Slack installation page
- Add OAuth handler to Cloudflare Worker
- connect-salesforce.html - Salesforce connection page
- Success page with quick start guide

**Success criteria:**
- User can install Slack bot in 5 minutes
- Both tokens stored securely in KV
- Setup wizard is clear and simple
- Errors are user-friendly

---

### Week 9-10: Enhanced Workflows (Product Lead Writes Recipes)

#### 11. Additional Goose Recipes

**Product lead creates these YAML files:**

**Email Drafting Recipe (recipes/email_drafter.yaml):**
- Purpose: Draft thank you emails and outreach emails
- Input: "Draft a thank you email to Sarah Johnson"
- Uses: Salesforce data (gift history), generic professional tone
- Output: Draft email with suggested edits
- For Phase 2: Keep it simple - no voice analysis, no document RAG

**Donor Research Recipe (recipes/donor_research.yaml):**
- Purpose: Create one-page donor briefing
- Input: "Research Sarah Johnson for our meeting"
- Uses: Salesforce data (all donor history)
- Output: One-page briefing with contact info, gift history, suggested talking points, recommended ask amount

**Enhanced Data Entry Recipe (recipes/conversational_data_entry.yaml):**
- Purpose: Create Salesforce records from natural language
- Input: "I met with Sarah. She's interested in STEM scholarships. Follow up Tuesday."
- Validates: All required fields before creating records
- Output: Confirmation of created records, links to records in Salesforce, asks for missing required fields if needed

**Product lead responsibility:**
- Write YAML files for these recipes
- Test in Goose CLI with real Salesforce data
- Iterate based on pilot feedback
- Document in recipes/ directory

---

### Week 11-12: Polish & Documentation

#### 12. Admin Dashboard Enhancements

**Add to existing log viewer:**

**Organizations Page:**
- List all orgs
- Add new org (form or API)
- Edit org config (credentials)
- View org-specific metrics
- Reconnect Salesforce if OAuth expires
- Test connection button

**Basic Analytics:**
- Total queries today/week/month
- Queries per org
- Average response time
- Error rate
- Most used recipes
- Which recommendations users acted on (if trackable)

**Files to create:**
- admin/orgs.html - Org management page
- admin/analytics.html - Basic metrics
- API endpoints for CRUD operations on orgs

---

#### 13. Customer Success Documentation

**Purpose:** Help users get value from the product

**Onboarding Guide (docs/ONBOARDING.md):**
- How to install Slack bot
- How to connect Salesforce
- First 5 queries to try
- What to expect from daily reports

**Command Reference (docs/COMMANDS.md):**
- List of all supported queries
- Examples for each recipe
- Tips for getting best results

**Troubleshooting Guide (docs/TROUBLESHOOTING.md):**
- Common issues and fixes
- "Bot isn't responding" → Check permissions
- "Wrong donors suggested" → How to provide feedback
- How to reconnect Salesforce
- How to contact support

**Best Practices Guide (docs/BEST_PRACTICES.md):**
- How to interpret donor priorities
- When to use different recipes
- How to act on AI recommendations
- How to provide feedback

**Host on:** Cloudflare Pages (simple static site) or Notion (easier to update). Link from Slack bot welcome message.

---

## Phase 3: Scale & Growth (Months 4-6)

**Goal:** Scale to more customers, add web app, consider org context system if needed

### Month 4: Web App

#### 14. Web Application

**Purpose:** Alternative to Slack for orgs without Slack

**What it provides:**
- Chat interface (like Claude.ai)
- Access to all Goose recipes
- Daily report history
- Conversation history
- Mobile responsive

**Architecture:**
- Frontend: Next.js + React (deployed on Vercel or Cloudflare Pages)
- Backend: Existing Cloudflare Worker (add WebSocket endpoint)
- Same Goose recipes and MCP server

**Key features:**
- User authentication (email + password)
- Org management (admins can invite users)
- Chat interface with recipe selector
- View daily report history
- Download/share reports and responses
- Dark mode (nice to have)

**Files to create:**
- web_app/ - Next.js application
- WebSocket handler in Cloudflare Worker
- Authentication system (simple email/password for Phase 3)
- Report history viewer

---

#### 15. Proactive Notifications

**Purpose:** Bot messages users without being asked

**Notification types:**

**Daily Priority Reports (via Slack DM):**
- Already built in Phase 1/2!
- Just enable for Slack delivery in addition to other methods

**Weekly Summary:**
- "This week you engaged with 12 donors..."
- "3 donors are approaching lapsed status..."

**Real-time Alerts (Stretch Goal):**
- Requires Salesforce Outbound Messages or Platform Events
- "Sarah Johnson's opportunity moved to Negotiation stage"
- Defer to Phase 4+

**Implementation:**
- Add weekly Goose recipe (weekly_summary.yaml)
- Schedule via cron or manual trigger
- Format weekly summary
- User preferences for notification frequency

---

### Month 5: Advanced Features

#### 16. Portfolio Analytics

**Purpose:** High-level insights about donor portfolio

**Metrics to calculate:**
- Donor pyramid (major, mid-level, annual)
- Pipeline health score
- Lapse risk percentage
- Giving trends over time
- Portfolio balance

**Implementation:**
- Add analytics Goose recipe
- Pre-calculate metrics
- Store in KV with 24-hour TTL
- Display in admin dashboard
- Reference in weekly summaries

**Visualizations:**
- Donor pyramid chart
- Trend lines (giving over time)
- Pipeline funnel

**Files to create:**
- recipes/portfolio_analytics.yaml - Goose recipe
- Analytics calculation logic
- Dashboard charts (Chart.js or Recharts)
- API endpoints for metrics

---

### Month 6: Org Discovery & Context (If Needed)

#### 17. Org Discovery & Context Storage

**Purpose:** Use conversational approach to understand each org's fundraising structure for orgs we don't have deep knowledge of

**When to implement:** Only if we need to onboard orgs where we don't have existing knowledge of their structure

**Org Discovery Recipe (recipes/org_discovery.yaml):**

Product lead creates conversational recipe that asks questions and stores answers in KV for the AI to reference later.

**Discovery Questions:**

**Donor Tiers & Structure:**
- "What are your donor giving tiers?" (e.g., <$1K annual, $1K-$5K mid-level, $5K-$25K major, $25K+ principal)
- "How do you classify major donors?" (by amount, relationship, capacity)
- "What gift amount triggers major donor status at your org?"

**Team Structure:**
- "Who on your team is responsible for which donor tiers?"
- "Do you have portfolio assignments? Who manages which donors?"
- "Who should receive daily priorities for major donors? Mid-level? Annual?"

**Campaign & Program Context:**
- "What are your current active campaigns?"
- "What programs do donors typically support?" (scholarships, operations, capital, etc.)
- "Any upcoming events or giving days we should know about?"

**Donor Engagement Approach:**
- "How often do you typically contact major donors?" (quarterly, monthly, etc.)
- "What's your typical moves management cycle?"
- "Do you have a formal stewardship calendar?"

**Custom Definitions:**
- "What does 'qualified prospect' mean at your org?"
- "How do you define a lapsed donor?" (no gift in 12 months? 18 months?)
- "What engagement activities count for donor touches?" (calls, emails, meetings, events)

**Data Quirks:**
- "Are there any custom fields in Salesforce we should pay attention to?"
- "Do you use Campaigns for tracking? If so, how?"
- "Any data quality issues we should be aware of?"

**Implementation:**

**Storage in KV:**
- Key format: `org:{org_id}:context`
- Value: JSON with all discovered context

```json
{
  "donor_tiers": {
    "annual": "< $1,000",
    "mid_level": "$1,000 - $5,000",
    "major": "$5,000 - $25,000",
    "principal": "$25,000+"
  },
  "team_structure": {
    "major_donors": "Sarah (Development Director)",
    "mid_level": "Michael (Development Associate)",
    "annual": "Team effort"
  },
  "lapsed_definition": "No gift in 12 months",
  "active_campaigns": ["Annual Fund 2025", "Scholarship Drive"],
  "custom_notes": "Use 'Donor_Stage__c' field for cultivation tracking"
}
```

**How Goose Recipes Use This Context:**

When running daily_prioritization recipe for orgs with context stored, Goose:
- Loads org context from KV
- Uses context to inform recommendations
- Example: "Based on your tier structure, Sarah Johnson ($4,500 lifetime) is in your mid-level range and should be managed by Michael."

**Product Lead Process:**
- Schedule 30-minute discovery call with new org
- Run through org_discovery recipe conversationally
- Store responses in KV via API or manual entry
- Update context as needed

**Context Management Features:**
- Admin UI to edit org context
- Version history of context changes
- AI suggests context updates when it notices mismatches
- Scheduled context refresh (quarterly check-ins)

**Success criteria:**
- Orgs without context still get useful recommendations (baseline)
- Orgs with context get noticeably more personalized recommendations
- Context is easy to collect and maintain
- AI successfully references context in responses

---

#### 18. Multi-User Support (If Needed)

**Purpose:** Support multiple users per org with different roles and permissions

**User roles:**
- Admin: Can edit org context, manage users, view all activity
- Development Director: Full access to all features and reports
- Development Officer: Access to their portfolio only
- Board Member: Read-only access to reports

**Implementation:**
- Add users table (if using database) or complex KV structure
- User authentication system
- Role-based access control
- Portfolio filtering based on org context

---

#### 19. SSO (If Enterprise Customers Request)

**Only build if enterprise customers demand it:**
- SAML 2.0 support
- OAuth with Okta, Azure AD

**Defer unless required for deal**

---

#### 20. White-Label (If Enterprise Customers Request)

**Only build if enterprise customers request:**
- Custom branding
- Custom domain
- Custom email templates

**Defer unless required for deal**

---

## Technical Considerations

### Performance Targets

**Response Times:**
- Daily report generation: <30 seconds per org
- Simple queries: <3 seconds
- Complex queries: <5 seconds
- Slack responses: <5 seconds total (including "thinking...")

**Cloudflare Worker Limits:**
- Free tier: 30-second timeout
- Paid tier: 50-second timeout (recommended for Phase 2+)
- If queries take >30 seconds: Upgrade to paid tier ($5/month)

**Availability:**
- Cloudflare SLA: 99.9%+ uptime
- No additional monitoring needed for Phase 1-2

**Scale Targets:**
- Phase 1: 5-10 orgs, 20 users, 100 reports/week
- Phase 2: 20-30 orgs, 75 users, 500 queries/week
- Phase 3: 50-100 orgs, 200 users, 2000 queries/week

---

### Cost Structure

- **Phase 1 (1-10 orgs):** $0/month (Cloudflare free tier)
- **Phase 2 (10-30 orgs):** $5-20/month (Cloudflare paid tier, Claude API usage)
- **Phase 3 (30+ orgs):** $30-50/month (Cloudflare + Supabase + increased API usage)

---

## Success Metrics by Phase

### Phase 1 (Validation)
- ✅ 3-5 orgs using daily reports
- ✅ Users find reports valuable (qualitative feedback)
- ✅ Users act on 3+ recommendations per week
- ✅ NPS >50
- ✅ 2-3 testimonials collected
- ✅ <5 support questions per week per org
- ✅ MCP confirmed working with Nonprofit Cloud

### Phase 2 (Product-Market Fit)
- ✅ 10-15 active orgs
- ✅ 5+ queries per user per week (Slack)
- ✅ 3+ recipes used per user
- ✅ 2-3 referrals generated
- ✅ Users prefer real-time Slack interaction over daily reports (or vice versa)
- ✅ Clear understanding of best delivery methods

### Phase 3 (Scale)
- ✅ 30-50 orgs
- ✅ Multiple users per org actively using
- ✅ NPS >60
- ✅ Web app adoption among non-Slack orgs
- ✅ 2+ case studies published
- ✅ Clear understanding of when org context is needed vs. not needed

---

## Risk Mitigation

### Technical Risks

**Risk: Cloudflare Worker timeout (30-50 seconds)**
- Mitigation: Optimize SOQL queries (use indexes, limit results), upgrade to paid tier (50-second timeout), break complex workflows into multiple steps, show "thinking..." progress to users

**Risk: Goose has bugs or breaks**
- Mitigation: Wrapper layer isolates Goose issues, can call MCP tools directly if Goose fails, keep recipes portable (YAML format)

**Risk: Claude API outage**
- Mitigation: Queue requests during outages, graceful degradation (notify users of delay), consider fallback to GPT-4 (future)

**Risk: Salesforce rate limits**
- Mitigation: Efficient query batching, caching, monitor API usage per org, upgrade to higher limits if needed

**Risk: Prompt drift (AI becomes inconsistent)**
- Mitigation: Automated testing (run same queries, compare results), version control for recipes, log-based quality monitoring

---

### Business Risks

**Risk: Salesforce builds this feature**
- Mitigation: Move fast, build deep nonprofit expertise, focus on workflow integration (they won't), build community of users (switching cost)

**Risk: Users don't adopt AI**
- Mitigation: Validate with pilots before scaling, white-glove onboarding, show immediate value (time saved), make recommendations actionable

**Risk: Recommendations don't match org reality**
- Mitigation: Start with orgs we know well (Phase 1-2), add org context system only if needed (Phase 3), continuous feedback loop via logs

**Risk: Users prefer manual work over AI suggestions**
- Mitigation: Start with easy wins (daily reports), prove value before asking for behavior change, support hybrid approach (AI suggests, human decides)

---

## Development Timeline Summary

### Phase 1: Weeks 1-6 (MVP)
- Week 1-2: Multi-tenant MCP + Logging + Test Nonprofit Cloud
- Week 3-4: Daily report generation + Testing
- Week 5-6: Pilot testing + Iteration + Delivery method validation

### Phase 2: Weeks 7-12 (Slack Bot)
- Week 7-8: Slack integration
- Week 9-10: Enhanced workflows (product lead writes recipes)
- Week 11-12: Admin dashboard + Docs

### Phase 3: Months 4-6 (Scale)
- Month 4: Web app
- Month 5: Advanced features (analytics)
- Month 6: Org discovery system (if needed for scaling to orgs we don't know well)

**Total time to validation:** 6 weeks  
**Total time to full platform:** 6 months

---

## Team & Resources

### Phase 1 (1 Developer)

**Skills needed:**
- TypeScript (Cloudflare Workers)
- Python (Goose wrapper script)
- API integrations (Goose, Salesforce)
- Cloudflare KV

**Estimated hours:** 80-120 hours  
**Cost:** $6K-$10K (contract) or equity

---

### Phase 2 (1 Developer)

**Skills needed:**
- Same as Phase 1
- Slack API experience
- HTML/CSS for admin dashboard

**Estimated hours:** 160-240 hours  
**Cost:** $12K-$20K (contract) or equity

---

### Phase 3 (1-2 Developers)

**Team composition:**
- 1 Full-stack engineer (TypeScript, APIs, frontend)
- Optional: 1 Frontend specialist (React/Next.js)

**Estimated hours:** 240-400 hours  
**Cost:** $18K-$30K or mix of equity/salary

---

## Open Questions for Product Lead

Before starting Phase 1, please confirm:

1. **Pilot orgs:** Which 3-5 orgs will test Phase 1?
2. **Cloudflare setup:** Do you have Cloudflare account? Need help with setup?
3. **TypeScript MCP status:** Is it truly ready? Can we see the code?
4. **Delivery method preference:** Any initial sense of what pilots might prefer?
5. **Logging retention:** 90 days sufficient or need longer?
6. **Admin access:** Just you or shared with developer?
7. **Support model:** How will you handle pilot support?

---

## Getting Started (Developer Onboarding)

### Day 1: Environment Setup
- Get access to Cloudflare account
- Get access to existing TypeScript MCP repo
- Install Wrangler CLI: `npm install -g wrangler`
- Set up local development environment
- Get API keys: Anthropic API key (for Goose), Slack app credentials (Phase 2)
- Review existing TypeScript MCP code
- Test MCP with NPSP Salesforce sandbox

### Day 2-3: Understand Architecture & Test Nonprofit Cloud
- Read existing TypeScript MCP implementation
- Review Goose recipes (written by product lead)
- Understand Cloudflare Workers model
- Set up Nonprofit Cloud sandbox
- Test all MCP queries with Nonprofit Cloud
- Document any differences found

### Day 4-5: First Feature (Multi-Tenant MCP)
- Add org credential storage to KV
- Add org routing to existing MCP
- Test with 2 different orgs
- Verify credential isolation

### Week 2: Continue with roadmap tasks

---

## Questions & Support

- **For product questions:** Contact Product Lead
- **For technical questions:** Refer to this document + Cloudflare docs
- **For architecture decisions:** Schedule architecture review
- **For blockers:** Daily standup (15 min)

---

## Next Steps

- ✅ Product lead reviews and approves roadmap
- ✅ Product lead writes Phase 1 Goose recipes (daily_prioritization)
- ✅ Developer gets access to Cloudflare + TypeScript MCP repo
- ✅ Developer tests MCP with Nonprofit Cloud sandbox
- ✅ Schedule daily standups (15 min)
- ✅ Developer starts Week 1 tasks (multi-tenant MCP)
- ✅ Product lead generates first reports manually with Goose
- ✅ Begin pilot validation loop

---

**Document Version:** 3.2  
**Last Updated:** November 4, 2025  
**Status:** Ready for Development  
**Architecture:** Cloudflare-first
