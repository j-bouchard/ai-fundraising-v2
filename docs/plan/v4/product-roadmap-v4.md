# Fundraising Assistant - Product Roadmap

**Version:** 4.0
**Last Updated:** November 26, 2025
**For:** Internal Development (Joe)
**Status:** Pre-Launch - Building for January 1 Production Launch

---

## Executive Summary

We're building an AI fundraising strategist that **keeps nonprofit development teams OUT of Salesforce** while helping them prioritize donors and manage relationships more effectively. The product gives time back to nonprofits so they can focus on their mission, not database management. It integrates with Salesforce (NPSP + Nonprofit Cloud) and delivers insights through Claude Code agents, subagents, commands, and tools via MCP.

**Core Value Proposition:**
- **Save Time:** Keep users out of their database entirely
- **Fundraise Better:** Deep fundraising expertise embedded in every recommendation
- **Focus on Mission:** Give time back to what matters

**V4 Focus:**
- **Internal "Joe Only" release** — Joe's personal consulting toolkit
- Joe uses this tool when delivering consulting services across client organizations
- Claude Code + MCP architecture with agents, subagents, commands, and tools
- Delivery via MCP client (Goose, Claude Desktop, or similar) — NOT Slack
- Foundation for V5 client-facing release

**Current State:**
- MCP server rewritten in TypeScript for Cloudflare
- Works with Goose for orchestration
- MCP should work with both NPSP and Nonprofit Cloud (needs testing)
- No production org access until January 1, 2026
- Intelligence layer is the key differentiator (must build before Jan 1)

**Deployment Path:**
1. **Now:** Joe's sandbox for development and testing
2. **Next:** Early adopter client org to validate multi-tenant workflow
3. **January 1:** Joe uses across his full consulting client portfolio

**January 1 Launch Goals:**
- Full data analysis capability ready for Joe's consulting delivery
- Joe can run analysis on any client org during engagements
- Org discovery system operational
- Fundraising expertise knowledge base embedded
- Multi-tenant workflow validated with early adopter

---

## Release Strategy

### V4 (This Release) - Joe's Internal Consulting Toolkit
- **Who uses it:** Joe only — this is his personal delivery tool
- **How it's used:** Joe runs agents/commands during consulting engagements
- **Architecture:** Claude Code + MCP with agents, subagents, commands, tools
- **Delivery:** MCP client (Goose, Claude Desktop, or similar)
- **Multi-tenant:** One codebase, separate Worker per client org Joe serves

**Deployment Sequence:**
1. Joe's sandbox (development/testing) — **Current**
2. Early adopter client org (multi-tenant validation) — **Needed**
3. Joe's full client portfolio (January 1 launch)

### V5 (Future) - Client-Facing Product
- Slack integration for end-user access
- Productized wrapper around V4
- Clients use directly (not just Joe)
- Self-service onboarding flows

---

## Product Vision & Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│              DELIVERY LAYER                         │
│                                                     │
│  V4: MCP Client (Goose / Claude Desktop / TBD)     │
│  V5: Slack Bot (Future Release)                    │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│         ORCHESTRATION / COORDINATOR LAYER           │
│                                                     │
│  Based on: github.com/mpazaryna/orchestrator       │
│                                                     │
│  • Coordinates agents across compute (local/remote)│
│  • Skill-agnostic pattern for Claude-powered tasks │
│  • Batch processing across multiple orgs/contexts  │
│  • tmux integration for long-running sessions      │
│  • Configuration-driven (repos.json style)         │
│  • Result persistence and audit trails             │
│                                                     │
│  V4: Run locally via tmux + orchestrator           │
│  Future: Distributed across multiple compute       │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│         CLAUDE CODE AGENT LAYER                     │
│                                                     │
│  Agents & Subagents                                 │
│  • Discovery Agent (learns the org)          [P0]   │
│  • Data Analysis Agent                       [P0]   │
│  • Daily Prioritization Agent                [P2]   │
│  • Email Drafter Agent                       [P2]   │
│  • Donor Research Agent                      [P2]   │
│                                                     │
│  Commands                                           │
│  • /discover - Run org discovery                    │
│  • /analyze - Generate data analysis               │
│  • /prioritize - Daily donor priorities            │
│  • /draft - Draft communications                   │
│  • /research - Donor research                      │
│                                                     │
│  Tools                                              │
│  • Salesforce query tools (via MCP)                │
│  • Knowledge base retrieval                        │
│  • Document reference                              │
│  • Cache/consistency tools                         │
│                                                     │
│  Using: Claude Sonnet 4.5 / Opus as LLM            │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│    INTELLIGENCE LAYER (CRITICAL PRIORITY)          │
│                                                     │
│  1. ORG-SPECIFIC KNOWLEDGE BASE                    │
│  • Discovery Agent (learns the org)                │
│  • Semantic layer (donor routing rules)            │
│  • Strategic plans & goals                         │
│  • Program documentation                           │
│  • Custom field mappings                           │
│  • Required fields per object                      │
│                                                     │
│  2. FUNDRAISING EXPERTISE DATABASE                 │
│  • Best practices knowledge base                   │
│  • Donor engagement strategies                     │
│  • Gift officer workflows                          │
│  • Moves management methodology                    │
│  • Industry benchmarks                             │
│                                                     │
│  3. DOCUMENT UPLOAD & REFERENCE                    │
│  • Program-specific asks                           │
│  • Campaign materials                              │
│  • Board reports                                   │
│  • Strategic initiatives                           │
│                                                     │
│  4. CONSISTENCY ENGINE                             │
│  • Deterministic responses within time windows     │
│  • Same query = same answer (5 hour window)        │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│      CONVERSATION & CONFIRMATION LAYER             │
│                                                     │
│  • Two-way confirmation for updates                │
│  • Preview exact changes before execution          │
│  • Request missing required fields                 │
│  • Validate data before writing                    │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│           MCP LAYER                                 │
│                                                     │
│  MCP Server (TypeScript) - Already built           │
│  • OAuth to Salesforce                             │
│  • Execute SOQL queries                            │
│  • Create/Update records (with confirmation)       │
│  • Works with NPSP + Nonprofit Cloud               │
│  • Multi-tenant: separate Worker instance per org  │
│                                                     │
│  MCP Tools exposed to Claude Code:                 │
│  • query_salesforce                                │
│  • create_record                                   │
│  • update_record                                   │
│  • get_object_metadata                             │
│  • describe_object                                 │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│         INFRASTRUCTURE                              │
│                                                     │
│  Knowledge Storage (TBD: R2, KV, S3, etc.)         │
│  • Org context and discovery data                  │
│  • Fundraising expertise documents                 │
│  • User-uploaded documents                         │
│  • Semantic layer definitions                      │
│                                                     │
│  Logging                                           │
│  • Receives interaction logs                       │
│  • Configurable retention                          │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│    SALESFORCE (NPSP + Nonprofit Cloud)             │
│    Customer's Data (Production from Jan 1)         │
└─────────────────────────────────────────────────────┘
```

---

## Orchestration Layer (CRUCIAL)

**Based on:** [github.com/mpazaryna/orchestrator](https://github.com/mpazaryna/orchestrator)

The orchestrator is the **coordination layer** that manages agent execution. This is crucial for V4 and foundational for future scaling.

### Why Orchestration is Critical

- Agents need coordination — they can't run in isolation
- Multiple agents may need to run in sequence or parallel
- Results need persistence and audit trails
- V4 runs locally; future versions run across distributed compute

### Orchestrator Capabilities (Already Built)

| Feature | Description |
|---------|-------------|
| Skill-agnostic pattern | Runs any Claude-powered task via skill definitions |
| Batch processing | Execute across multiple contexts (orgs) in single run |
| tmux integration | Long-running sessions, detachable |
| Configuration-driven | Define targets via JSON config |
| Result persistence | Outputs + JSON summaries for audit |
| Context collection | Gathers metadata before execution |

### V4 Implementation

**Local execution model:**
```
┌─────────────────────────────────────────┐
│  tmux session                           │
│  ┌─────────────────────────────────┐    │
│  │  Orchestrator (Python)          │    │
│  │  ├── Load agent skill           │    │
│  │  ├── Collect org context        │    │
│  │  ├── Execute via Claude API     │    │
│  │  ├── Persist results            │    │
│  │  └── Next agent/org...          │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Configuration example (orgs.json):**
```json
{
  "orgs": [
    {
      "name": "client-a",
      "mcp_endpoint": "https://client-a.workers.dev",
      "knowledge_base": "./kb/client-a/",
      "tags": ["npsp", "active"]
    },
    {
      "name": "client-b",
      "mcp_endpoint": "https://client-b.workers.dev",
      "knowledge_base": "./kb/client-b/",
      "tags": ["nonprofit-cloud", "active"]
    }
  ]
}
```

### Future: Distributed Compute

V4 validates the pattern locally. Future iterations can distribute across:
- Multiple local tmux sessions
- Cloud compute (Cloudflare Workers, AWS Lambda)
- Dedicated agent servers

The orchestrator abstraction allows this scaling without rewriting agents.

---

## Claude Code Components

### Agents

| Agent | Purpose | Triggers | Priority |
|-------|---------|----------|----------|
| **Discovery Agent** | Learns org configuration, staff, processes, goals | `/discover`, initial onboarding | P0 |
| **Data Analysis Agent** | Comprehensive fundraising analytics | `/analyze`, scheduled reports | P0 |
| **Prioritization Agent** | Daily donor priorities and tasks | `/prioritize`, daily schedule | P2 |
| **Email Drafter Agent** | Draft donor communications | `/draft`, after meetings | P2 |
| **Donor Research Agent** | Research prospects and existing donors | `/research` | P2 |

**Note:** Fundraising expertise is not a separate agent — it's the **knowledge base** that informs all agents via markdown definition files. All agents reference fundraising best practices through the knowledge base retrieval tools.

### Subagents

Subagents handle specialized subtasks within parent agents:

- **Field Mapper Subagent** - Maps custom fields during discovery
- **Data Quality Subagent** - Identifies data issues during analysis
- **Benchmark Subagent** - Compares metrics to industry standards
- **Voice Matcher Subagent** - Matches org's communication style

### Commands

```
/discover [org-name]     - Run full org discovery process
/analyze [report-type]   - Generate data analysis (retention, pipeline, trends)
/prioritize [date]       - Get daily donor priorities
/draft [type] [donor]    - Draft communication (email, thank-you, proposal)
/research [donor-name]   - Research a donor or prospect
/refresh [cache-type]    - Force refresh cached data
/status                  - Show org context and system status
```

### Tools (MCP)

```
# Salesforce Tools (via MCP Server)
query_salesforce(soql)           - Execute SOQL query
create_record(object, fields)    - Create Salesforce record
update_record(id, fields)        - Update Salesforce record
get_object_metadata(object)      - Get object schema
describe_object(object)          - Get field details

# Knowledge Tools
retrieve_expertise(topic)        - Get fundraising best practices
retrieve_org_context(key)        - Get org-specific context
store_org_context(key, value)    - Store org-specific context

# Document Tools
search_documents(query)          - Search uploaded documents
get_document(id)                 - Retrieve specific document

# Consistency Tools
get_cached_response(query_hash)  - Check for cached response
cache_response(query_hash, ttl)  - Cache a response
invalidate_cache(pattern)        - Clear matching cache entries
```

---

## Critical Path to January 1 Launch

### Resource Allocation

**Developer:** Paz
**Domain Expert / QA:** Joe
**Estimated Development Hours:** 120 hours
**Pace:** 20 hours/week (firm) — optionally 25 hours/week for accelerated timeline

**Joe's Responsibilities (outside 120 dev hours):**
- Fundraising expertise knowledge base content creation
- **Discovery document examples** — past client discovery templates, Salesforce schema patterns, common configurations
- Testing and QA against real-world scenarios
- Review/validation of Discovery Agent captured context
- Client relationships and requirements gathering

*Note: Estimate assumes familiarity with Claude Code ecosystem. 120 hours includes buffer for orchestrator adaptation, error handling implementation, and unknowns. Priority stack rank below defines what gets cut if needed. Specific dates tracked in project management tooling (e.g., Linear).*

---

### Priority Stack Rank (If Time Runs Short)

If development hits 100 hours and scope must be cut, deprioritize in this order (cut from bottom first):

| Priority | Component | Status |
|----------|-----------|--------|
| P0 - Must Have | MCP Server + Salesforce integration | Already built |
| P0 - Must Have | Orchestrator integration | Existing codebase, needs adaptation |
| P0 - Must Have | Discovery Agent | Core value |
| P0 - Must Have | Data Analysis Agent | January 1 deliverable |
| P1 - Should Have | Document upload (PDF + CSV) | High value |
| P1 - Should Have | Confirmation layer (safe writes) | Trust building |
| P2 - Nice to Have | Prioritization Agent | Can be manual |
| P2 - Nice to Have | Email Drafter Agent | Can be manual |
| P2 - Nice to Have | Donor Research Agent | Can be manual |
| P3 - Defer to Future | Consistency/caching engine | Descoped from V4 |
| P3 - Defer to Future | Voice Matcher subagent | Polish feature |

**Cut rule:** If at 100 hours, drop all P3 items. If at 110 hours, evaluate P2 items.

---

### Milestone 1: Intelligence Foundation + Orchestrator (25 hours)

#### Priority 1: Fundraising Expertise Knowledge Base

**Purpose:** Build the core value differentiator - deep fundraising knowledge

**Source:** Joe (Salesforce consultant) provides fundraising expertise documents. This work can run concurrently with other milestones — documents can be added incrementally as they become available.

**Knowledge base topics to cover:**
- Donor lifecycle management
- Major gift strategies
- Annual fund best practices
- Moves management methodology
- Stewardship calendars
- Ask amounts and timing
- Donor segmentation strategies

**Storage requirements:**
- Documents must be stored and accessible to agents
- Options: Cloudflare R2, KV, or other suitable storage
- Retrieval mechanism for agents to reference

**Deliverables:**
- Fundraising best practice documents (added incrementally)
- `retrieve_expertise` tool implemented
- Integration with Claude Code agents

#### Knowledge Base Document Analysis

**Reference:** `example-kb-doc.md` (Donor Retention Strategy Guide)

Joe has authored a comprehensive knowledge base document that demonstrates how his fundraising expertise translates into agent-actionable content. Initial analysis shows this single document provides:

| Content Type | Agent/Component | Usage |
|--------------|-----------------|-------|
| Benchmark thresholds (retention rates by segment) | Data Analysis Agent | Compare org metrics against industry standards, flag underperformance |
| Giving level definitions ($100-249, $1K-9,999, $10K+) | Semantic Layer | Consistent donor segmentation across all agents |
| Time-based workflows (48hr, 30-day, 90-day sequences) | Prioritization Agent | Surface time-sensitive tasks ("Call due — $500 gift 47hrs ago") |
| Warning signs & intervention triggers | Data Analysis Agent | Flag at-risk donors, recommend intervention level |
| Formulas (LTV, retention rate, CPDR) | Data Analysis Agent | Calculate metrics automatically from Salesforce data |
| Stewardship calendars by giving level | Prioritization Agent | Generate monthly/quarterly touchpoint recommendations |
| Win-back campaign frameworks | Email Drafter Agent | Template-driven outreach for lapsed donor segments |

**Key Insight:** One well-structured KB document feeds multiple agents. This validates the architecture — Joe's expertise becomes the "fuel" that powers intelligent recommendations.

**Milestone Integration:**
- **Milestone 1:** Knowledge base retrieval tool must parse and index this format
- **Milestone 2:** Semantic layer extracts segment definitions and thresholds
- **Milestone 3:** Data Analysis Agent references benchmarks; Prioritization Agent uses time-based rules
- **Milestone 4:** Email Drafter Agent uses campaign frameworks and templates

**Request to Joe:** More documents in this style — discovery templates, major gifts strategy, moves management methodology, annual fund playbook.

---

#### Priority 2: Discovery Agent

**Purpose:** Automate the consultant discovery process

**Create: `agents/discovery/`**

**Key Dependency:** Joe has the core discovery knowledge in his head — this is his consultant expertise. As part of his knowledge base work, Joe will provide:
- Example discovery documents from past client engagements
- Salesforce schema patterns (NPSP + Nonprofit Cloud)
- Common custom field configurations
- Typical org structures and variations

**V4 Implementation (simplified):**

The Discovery Agent will be a simpler implementation that:
1. References Joe's discovery templates from the knowledge base
2. Executes guided discovery questions (not fully autonomous)
3. Stores responses in structured format
4. Requires Joe's review/validation of captured context

**Discovery areas (guided by Joe's templates):**

*Salesforce Configuration:*
- Objects in use (standard + custom)
- Required fields per object
- Custom fields of note
- Campaign usage patterns

*Organization Structure:*
- Staff roles and responsibilities
- Donor tier definitions
- Portfolio assignments

*Fundraising Processes:*
- Moves management stages
- Stewardship requirements
- Lapsed donor definitions

*Strategic Context:*
- Current campaigns
- Annual goals
- Key programs

**Note:** Full autonomous discovery requires deep Salesforce schema expertise. V4 implements a guided/template-driven approach. More sophisticated autonomous discovery may come in future iterations as Joe's knowledge base matures.

**Stores all findings in structured format for agent retrieval**

---

### Milestone 2: Semantic Layer & Documents (25 hours)

#### Priority 3: Semantic Layer Implementation

**Purpose:** Ensure consistent, reliable recommendations

**Build semantic layer containing:**
- Donor routing rules (who handles which donors)
- Staff assignments and territories
- Business logic for prioritization
- Data pulling guardrails

**Tools:**
- `retrieve_org_context`
- `store_org_context`

#### Consistency Engine (DESCOPED - Future/V5)

*Moved to future release. Getting to high-value solution quickly is priority.*

The following is out of scope for V4's 120 hours:
- Response caching with TTL
- Query normalization
- Cache invalidation logic

If time permits after P0/P1 items complete, may revisit.

---

#### Priority 4: Document Upload System

**Purpose:** Allow orgs to upload context documents

**V4 Scope (narrowed):**
- **Supported formats:** PDF and CSV only
- **Tooling:** LlamaIndex for parsing (no custom parsing)
- **Categories:**
  - Strategic plans
  - Program descriptions
  - Campaign materials
  - Board reports
- Parse and index for AI reference
- Available to all agents

**Out of scope for V4:** Word docs, complex spreadsheets, custom parsing

**Storage options:** Cloudflare R2, S3, or other suitable document storage

**Tools:**
- `search_documents`
- `get_document`

---

### Milestone 3: Core Agents & Commands (25 hours)

#### Priority 5: Data Analysis Agent

**Purpose:** Ready for January 1 client delivery

**Create: `agents/data-analysis/`**

Comprehensive analysis covering:
- Donor retention rates
- Giving trends (YoY, MoM)
- Pipeline health
- Lapsed donor analysis
- Program performance
- ROI by channel
- Donor lifecycle metrics
- Predictive indicators

**Subagents:**
- Benchmark Subagent (industry comparisons)
- Data Quality Subagent (flag issues)

**Output format:**
- Executive summary
- Key metrics dashboard
- Actionable recommendations
- Areas of concern
- Opportunities identified

**Command:** `/analyze [report-type]`

---

#### Priority 6: Conversation & Confirmation Layer

**Purpose:** Safe, confirmed updates to Salesforce

**For all create/update operations:**
1. Parse user intent
2. Show exactly what will be changed
3. List any missing required fields
4. Get confirmation before executing
5. Execute and show result

**Example flow:**
```
User: "I met with Sarah. She's interested in STEM scholarships. Follow up Tuesday."
Agent: "I'll create a task with:
  - Contact: Sarah Johnson
  - Subject: Follow up on STEM scholarship interest
  - Due: Tuesday, Dec 10
  - Description: Discussed STEM scholarship opportunities

  Required: Should this be high priority? Who should be assigned?"
User: "High priority, assign to me"
Agent: "Task created: [link to Salesforce record]"
```

---

### Milestone 4: Additional Agents & Testing (25 hours)

#### Priority 7: Supporting Agents

**Prioritization Agent** (`agents/prioritization/`)
- Daily donor priorities
- Task recommendations
- Meeting prep
- Command: `/prioritize`

**Email Drafter Agent** (`agents/email-drafter/`)
- Thank you notes
- Follow-up emails
- Solicitation drafts
- Voice matching via subagent
- Command: `/draft`

**Donor Research Agent** (`agents/donor-research/`)
- Wealth indicators
- Giving history
- Relationship mapping
- Command: `/research`

---

#### Priority 8: Testing Infrastructure

**With test/sandbox orgs:**
- Full Discovery Agent run
- Semantic layer configuration
- Document upload and parsing
- All agent workflows
- Data analysis generation
- Consistency validation
- MCP client integration (Goose / Claude Desktop)

---

### Milestone 5: Polish & Launch Prep (20 hours + buffer)

#### Priority 9: Multi-Tenant Deployment

**Multi-tenant architecture (decided):** Deploy separate Cloudflare Worker instances per org. Simple and elegant within the Cloudflare ecosystem.

**Per-org isolation:**
- Dedicated Worker instance
- Isolated knowledge base
- Org-specific semantic layer
- Separate document storage
- Independent credentials

---

#### Priority 10: January 1 Launch Preparation

**Pre-launch checklist:**
- [ ] Production credentials ready (from new contracts)
- [ ] Discovery Agent tested and ready
- [ ] Knowledge base fully populated
- [ ] Data analysis templates polished
- [ ] MCP client configured for Joe's daily use
- [ ] Early adopter org connected and validated
- [ ] Launch sequence documented

**January 1 Launch Sequence:**
1. Connect to client orgs Joe is actively working with
2. Run Discovery Agent for each org
3. Generate comprehensive data analysis
4. Joe uses analysis as part of consulting delivery
5. Iterate on toolkit based on real-world usage
6. Document pain points and V5 requirements

---

## Phase 1: Production Launch & Validation

**Goal:** Joe successfully uses toolkit across consulting engagements, validate core value props

### Initial Deployment (First 2 Weeks Post-Launch)

**For each client org Joe works with:**
1. Deploy new Worker instance for the org
2. Run Discovery Agent (30-45 min session)
3. Configure semantic layer
4. Upload key documents (strategic plans, etc.)
5. Generate initial data analysis
6. Joe uses toolkit throughout the engagement

**Joe's daily workflow:**
- Use agents for all client analysis work
- Document what works/doesn't work
- Iterate on agents based on real usage
- Track which recommendations are actionable
- Note requirements for V5 client-facing release

---

### Iteration & Enhancement (Weeks 3-4 Post-Launch)

**Based on Joe's real usage:**
- Refine Discovery Agent questions
- Enhance knowledge base with missing topics
- Improve consistency engine
- Optimize slow queries
- Add missing commands

**Key metrics to track:**
- Recommendations Joe acts upon
- Time saved on consulting delivery
- Questions that stumped the AI
- Most valuable features for Joe's workflow
- V5 feature requests (what would clients want?)

---

## V5 Planning (Future - Client-Facing Release)

### Slack Integration - Explored but Not a V4 Constraint

**Spike Conducted:** A proof-of-concept was built at [cloudflare-agent-spike](https://github.com/mpazaryna/cloudflare-agent-spike) to validate Cloudflare Agents as a unified entry point for Goose, Slack, and HTTP requests.

**What the Spike Proved:**
- Cloudflare Workers can serve as a unified HTTP endpoint (`POST /ask`) accepting requests from multiple clients
- Slack-compatible payloads (using `"text"` field) work alongside standard `"question"` fields
- Sub-second response times are achievable for simple keyword-matched responses
- State isolation between concurrent requests works correctly

**Why Slack is NOT Driving V4 Architecture:**

The spike validated that Slack *can* integrate with our architecture, but also revealed why designing around Slack's constraints would be architecturally harmful:

| Slack Constraint | Impact on Architecture | V4 Decision |
|------------------|----------------------|-------------|
| 3-second response timeout | Forces async patterns, "thinking..." indicators, complex webhook flows | V4 agents can take 30+ seconds for complex analysis—this is a feature, not a bug |
| Synchronous request/response | Limits multi-step reasoning and tool use | Claude Code agents benefit from iterative tool calls, which Slack's model doesn't support well |
| Message-based interface | Requires intent detection, response formatting for chat | MCP clients (Goose, Claude Desktop) provide richer context and tool awareness |
| Bolt/SDK complexity | Additional integration overhead | Direct MCP protocol is cleaner and more powerful |

**The Core Insight:**

Building V4 to work "ideally with Slack someday" would constrain the agentic system's power. The strength of Claude Code + MCP is precisely that it's *not* limited by chat interface constraints:
- Agents can run multi-minute analysis workflows
- Complex multi-tool orchestration is natural
- Rich structured outputs (tables, code, analysis) are first-class
- No artificial response time pressure

**V5 Slack Integration Strategy:**

When Slack integration becomes a priority, it will be a *wrapper* around V4—not a constraint on V4:
- Expose V4 agents via Slack bot
- Handle async processing (Slack's 3-second limit) through queuing
- Thread support for ongoing conversations
- "Thinking..." indicators during long operations
- Intent detection layer to route to appropriate agents
- Summarized responses suitable for chat context

**Key Principle:** V4 builds the powerful, unconstrained agentic system. V5 adds a Slack "viewport" into that system—Slack adapts to the agents, not the other way around.

### Additional Delivery Channels
- Web application (chat interface)
- Scheduled reports via email
- Mobile notifications

### Enhanced Workflows
- Email sequences with voice matching
- Grant research and writing assistant
- Board report generator
- Campaign performance analyzer
- Event planning assistant

---

## Success Metrics

### January 1 Launch (Immediate)
- Joe's sandbox fully operational
- Early adopter client org connected and tested (multi-tenant validated)
- Joe can run data analysis on any connected org
- Discovery Agent captures org context reliably
- MCP client workflow smooth for Joe's daily use

### January 31 (Month 1)
- Joe using toolkit across 3+ client engagements
- Joe staying out of Salesforce 80% of the time during consulting work
- 10+ hours saved per week on Joe's consulting delivery
- Pain points documented for V5 improvements
- Clear V5 requirements documented based on real usage

### V5 Launch (Future)
- Slack integration operational
- Clients can use directly (not just Joe)
- Client self-service onboarding
- NPS >60

---

## Outstanding Items (Requires Attention)

### Early Adopter Client Org (BLOCKING)

**Status:** Needed before January 1 launch

To validate the multi-tenant workflow, we need access to one real client org beyond Joe's sandbox. This allows us to:

1. **Test multi-tenant deployment:** Verify separate Worker instances work correctly
2. **Validate credential isolation:** Confirm API keys and Salesforce credentials are properly isolated
3. **Test real-world data:** Run agents against production-like data (not just sandbox)
4. **Catch edge cases:** Discover org-specific configurations we haven't anticipated

**Requirements for early adopter:**
- Joe has existing relationship and trust
- Willing to grant Salesforce API access (read-only initially)
- Has reasonably clean data (not a disaster org)
- Available for feedback/iteration

**Action:** Joe to identify and reach out to potential early adopter candidate.

---

### LLM Costs

**Status:** Not yet estimated

Claude API usage could be significant with multiple agents and complex queries.

**To be determined:**
- Estimated cost per query/interaction
- Monthly budget assumption
- Cost scaling with number of orgs
- Cost controls (model selection, query optimization)

**Action:** Establish baseline costs during Milestone 1-2 testing, before scaling.

---

### Error Handling Strategy

**Status:** Needs implementation

Agents must handle failure scenarios gracefully:

| Scenario | Handling |
|----------|----------|
| Salesforce API rate limits | Backoff and retry with user notification |
| Org with corrupted/inconsistent data | Flag issues, continue with available data |
| MCP connection failures | Retry with timeout, surface error to user |
| LLM timeouts or errors | Retry once, then graceful failure message |
| Missing required fields | Prompt user for input before proceeding |

**Principle:** Fail gracefully, never silently. Always inform user what happened and what they can do.

---

## Risk Mitigation

### Technical Risks

**Risk: MCP client limitations discovered**
- Mitigation: Test with multiple clients (Goose, Claude Desktop)
- Document findings for V5 architecture decisions

**Risk: Consistency engine creates stale responses**
- Mitigation: Smart cache invalidation
- Time-based and event-based clearing
- User can force refresh via `/refresh` command

**Risk: Discovery Agent misses critical org context**
- Mitigation: Iterative discovery (not one-time)
- Human review of captured context
- Ability to manually edit/add context

**Risk: Unknown unknowns / rabbit holes**
- Mitigation: Buffer built into 100-hour estimate
- Weekly check-ins on progress
- Flexibility to adjust scope if needed

---

### Business Risks

**Risk: Orgs don't trust AI with their donor data**
- Mitigation: Start with read-only operations
- Show value before asking for write permissions
- Emphasize time savings and mission focus

**Risk: Generic recommendations without intelligence layer**
- Mitigation: This is why intelligence layer is Priority #1
- Deep expertise + org context = unique value
- Not just another MCP connection

---

## File Structure

```
fundraising-assistant/
├── orchestrator/             # Based on github.com/mpazaryna/orchestrator
│   ├── main.py               # Entry point
│   ├── orgs.json             # Org configuration
│   ├── skills/               # Agent skill definitions
│   │   ├── discovery/
│   │   │   └── SKILL.md
│   │   ├── data-analysis/
│   │   │   └── SKILL.md
│   │   └── ...
│   └── results/              # Persisted outputs + audit logs
├── agents/
│   ├── discovery/
│   │   ├── index.ts
│   │   ├── prompts/
│   │   └── subagents/
│   │       ├── field-mapper.ts
│   │       └── data-quality.ts
│   ├── data-analysis/
│   │   ├── index.ts
│   │   ├── prompts/
│   │   └── subagents/
│   │       └── benchmark.ts
│   ├── prioritization/
│   ├── email-drafter/
│   │   └── subagents/
│   │       └── voice-matcher.ts
│   └── donor-research/
├── commands/
│   ├── discover.ts
│   ├── analyze.ts
│   ├── prioritize.ts
│   ├── draft.ts
│   ├── research.ts
│   ├── refresh.ts
│   └── status.ts
├── tools/
│   ├── salesforce/
│   ├── knowledge/
│   ├── documents/
│   └── cache/
├── knowledge-base/
│   └── fundraising/
├── mcp-server/               # Already built
└── infrastructure/
    └── cloudflare/
```

---

## Critical Success Factors

1. **Intelligence Layer Depth:** The fundraising expertise and org discovery must be exceptional
2. **January 1 Launch:** Must deliver immediate value to consulting clients
3. **Consistency:** Same questions get same answers (builds trust)
4. **Time Savings:** Measurably keep people out of Salesforce
5. **V5 Foundation:** Clean architecture that exposes well to Slack

---

## Open Questions

1. **MCP Client:** Goose vs Claude Desktop vs other for V4 testing?
2. **Knowledge Base Format:** Markdown, JSON, or other for fundraising expertise?
3. **Storage:** Which storage solution(s) for documents, org context, and caching?
4. **Discovery:** One-time vs continuous discovery process?

---

## Next Steps

*Detailed task tracking and date assignments managed in project management tooling (e.g., Linear).*

### Milestone 1 (Hours 1-25):
- [ ] Adapt orchestrator for fundraising agents
- [ ] Set up development environment
- [ ] Start building fundraising knowledge base integration
- [ ] Begin Discovery Agent (requires Joe's templates)

### Milestone 2 (Hours 26-50):
- [ ] Complete Discovery Agent
- [ ] Implement semantic layer
- [ ] Implement document upload system (PDF + CSV via LlamaIndex)

### Milestone 3 (Hours 51-75):
- [ ] Build Data Analysis Agent
- [ ] Implement confirmation layer
- [ ] Create core commands

### Milestone 4 (Hours 76-100):
- [ ] Build supporting agents (prioritization, email, research) — P2, cut if needed
- [ ] Testing with sandbox orgs
- [ ] MCP client integration testing
- [ ] Error handling implementation

### Milestone 5 (Hours 101-120):
- [ ] Multi-tenant finalization
- [ ] Launch preparation
- [ ] Buffer for unknowns
- [ ] LAUNCH READY

---

**Document Version:** 4.0
**Last Updated:** November 26, 2025
**Status:** Internal Development Release
**Next Release:** V5 (Client-Facing with Slack)
