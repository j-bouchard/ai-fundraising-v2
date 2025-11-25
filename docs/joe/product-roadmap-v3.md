# Fundraising Assistant - Product Roadmap

**Version:** 3.4  
**Last Updated:** November 25, 2025  
**For:** Developer Onboarding & Build Planning  
**Status:** Pre-Launch - Building for January 1 Production Launch

---

## Executive Summary

We're building an AI fundraising strategist that **keeps nonprofit development teams OUT of Salesforce** while helping them prioritize donors and manage relationships more effectively. The product gives time back to nonprofits so they can focus on their mission, not database management. It integrates with Salesforce (NPSP + Nonprofit Cloud) and delivers insights through multiple channels (Slack first, then reports and web).

**Core Value Proposition:**
- **Save Time:** Keep users out of their database entirely
- **Fundraise Better:** Deep fundraising expertise embedded in every recommendation
- **Focus on Mission:** Give time back to what matters

**Current State:**
- ✅ MCP server rewritten in TypeScript for Cloudflare
- ✅ Works with Goose for orchestration
- ✅ MCP should work with both NPSP and Nonprofit Cloud (needs testing)
- ⚠️ No production org access until January 1, 2026
- ⚠️ Intelligence layer is the key differentiator (must build before Jan 1)

**January 1 Launch Goals:**
- Full data analysis capability ready for all consulting clients
- Slack integration for internal testing
- Org discovery system operational
- Fundraising expertise knowledge base embedded
- 3-5 orgs ready to onboard immediately

---

## Product Vision & Architecture

### High-Level Architecture (Updated)

```
┌─────────────────────────────────────────────────┐
│              DELIVERY LAYER                     │
│                                                 │
│  Priority: Slack Bot (MVP by Dec 15)            │
│  Reports: Automated Analysis (Monthly/Quarterly) │
│  Future: Web App (Q2 2025)                      │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│        CLOUDFLARE WORKER EDGE                   │
│                                                 │
│  Main Request Router                            │
│  • Slack webhook handler                        │
│  • Intent detection & routing                   │
│  • Session management (KV)                      │
│  • Response orchestration                       │
│  • Report scheduling (Cron)                     │
└────────────┬────────────────────────────────────┘
             │
    ┌────────┼────────┬────────────┬────────────┐
    ▼        ▼        ▼            ▼            ▼
┌───────┐┌───────┐┌─────────┐┌─────────┐┌──────────┐
│Knowledge││ Org  ││Discovery││Salesforce││Fundraising│
│  Base  ││Context││  Agent  ││   MCP   ││  Analysis │
│Service ││Service││ Service ││  Server ││  Worker  │
└───────┘└───────┘└─────────┘└─────────┘└──────────┘

Note: ALL services are Cloudflare Workers
No external dependencies (no Goose, no containers)
```

### Intelligence Layer Components

```
┌─────────────────────────────────────────────────┐
│    🔥 INTELLIGENCE LAYER (CRITICAL PRIORITY)    │
│                                                 │
│  1. ORG-SPECIFIC KNOWLEDGE BASE                 │
│  • Discovery Agent (learns the org)             │
│  • Semantic layer (donor routing rules)         │
│  • Strategic plans & goals                      │
│  • Program documentation                        │
│  • Custom field mappings                        │
│  • Required fields per object                   │
│                                                 │
│  2. FUNDRAISING EXPERTISE DATABASE              │
│  • 50+ best practices documents                 │
│  • Stored in R2: /knowledge-base/fundraising/   │
│  • Categories: major-gifts, annual-fund, etc.   │
│  • Semantic search via embeddings               │
│                                                 │
│  3. DOCUMENT UPLOAD SYSTEM                      │
│  • Via Slack: Drop files in DM                  │
│  • Automatic categorization                     │
│  • Stored in R2: /documents/{orgId}/            │
│  • Indexed for AI reference                     │
│                                                 │
│  4. CONSISTENCY ENGINE                          │
│  • Deterministic responses (5-hour window)      │
│  • Cache in Cloudflare KV                       │
│  • Hash(query + context + time window)          │
└─────────────────────────────────────────────────┘
```

---

## Week-by-Week Development Plan

### Week 1: November 20-27 - Intelligence Foundation

#### Priority 1: Fundraising Knowledge Base

**Purpose:** Deep expertise that differentiates us from generic AI

**Implementation:**
- Create 50+ fundraising best practice documents in markdown
- Categories: major-gifts/, annual-fund/, moves-management/, stewardship/
- Store in Cloudflare R2: `/knowledge-base/fundraising/`
- Build retrieval API with semantic search
- Generate embeddings using OpenAI text-embedding-3-small
- Store embeddings in Cloudflare KV

**Deliverables:**
- Fundraising best practice documents
- Retrieval API endpoint
- Integration with all response generation

---

#### Priority 2: Discovery Agent

**Purpose:** Automate the consultant discovery process

**Two-Part System:**
1. **Automated Discovery (Cloudflare Worker)**
   - Runs without user input
   - Explores Salesforce metadata
   - Detects patterns and usage
   - Generates questions for gaps

2. **Conversational Discovery (Slack Bot)**
   - Built in Cloudflare Worker (NOT Goose)
   - Asks targeted questions
   - Manages conversation state in KV
   - Updates org profile continuously

**What Discovery Learns:**

**Salesforce Configuration:**
- Objects in use (standard + custom)
- Required fields per object
- Custom fields and their purpose
- Validation rules
- Campaign usage patterns
- Data quality issues

**Organization Structure:**
- Staff roles and responsibilities
- Donor tier definitions ($ amounts)
- Portfolio assignments
- Donor routing rules
- Who gets which reports

**Fundraising Processes:**
- Moves management stages
- Solicitation approval process
- Stewardship requirements
- Touch frequency by tier
- Lapsed donor definitions

**Storage:**
- All findings in R2: `/org-profiles/{orgId}/`
- Accessible to all system components

---

### Week 2: November 27-December 4 - Semantic Layer & Consistency

#### Priority 3: Semantic Layer Implementation

**Purpose:** Ensure consistent, reliable recommendations

**Business Rules Engine:**
```typescript
// Donor routing based on org rules
if (donor.amount > org.majorGiftThreshold) {
  assignTo = org.majorGiftOfficer;
  priority = 'high';
  nextAction = 'Personal outreach within 24 hours';
}
```

**Components:**
- Donor routing rules (who handles which donors)
- Staff assignments and territories
- Business logic for prioritization
- Data pulling guardrails
- Touch frequency by tier

---

#### Priority 4: Document Upload System

**Purpose:** Allow orgs to upload context documents

**Implementation:**
- Slack file upload handler
- Automatic categorization using AI
- Text extraction from PDFs/Word docs
- Store in R2: `/documents/{orgId}/`
- Index for semantic search
- Available to all response generation

**Supported Documents:**
- Strategic plans
- Program descriptions
- Campaign materials
- Board reports
- Donor communication templates

---

### Week 3: December 4-11 - Slack MVP & Conversation Layer

#### Priority 5: Slack Integration MVP

**Purpose:** Enable internal testing before January 1

**Implementation:**
```typescript
// Cloudflare Worker handles all Slack events
export async function handleSlackWebhook(request) {
  const body = await request.json();
  
  // Quick response (3-second limit)
  await postToSlack("🤔 Thinking...");
  
  // Detect intent and route
  const intent = detectIntent(body.text);
  
  // Process based on intent
  let response;
  switch(intent) {
    case 'discovery':
      response = await discoveryAgent.handle(body);
      break;
    case 'analysis':
      response = await generateQuickAnalysis(body);
      break;
    default:
      response = await processGeneralQuery(body);
  }
  
  await postToSlack(response);
}
```

**Architecture:**
- Pure Cloudflare Worker implementation
- No external dependencies
- Session state in KV
- All logic self-contained

---

#### Priority 6: Conversation & Confirmation Layer

**Purpose:** Safe, confirmed updates to Salesforce

**Two-Way Confirmation Process:**
1. Parse user intent
2. Show preview of changes
3. Request missing required fields
4. Get explicit confirmation
5. Execute and show result

**Example:**
```
User: "I met with Sarah. She's interested in STEM scholarships."
Bot: "I'll create a task with:
  - Contact: Sarah Johnson
  - Subject: STEM scholarship discussion follow-up
  - Due: [missing]
  
Required: When should I schedule the follow-up?"
User: "Next Tuesday"
Bot: "✅ Task created: [Salesforce link]"
```

---

### Week 4: December 11-18 - Data Analysis & Testing

#### Priority 7: Fundraising Data Analysis

**Purpose:** Comprehensive monthly/quarterly reports

**Implementation (Cloudflare Worker):**
```typescript
// src/workers/fundraising-analysis.ts
export class FundraisingAnalysisWorker {
  // Triggered by Cloudflare Cron: "0 9 1 * *" (Monthly)
  async scheduled(event: ScheduledEvent) {
    const orgs = await this.getActiveOrgs();
    for (const org of orgs) {
      await this.generateReport(org.id);
    }
  }
  
  async generateReport(orgId: string) {
    // 1. Gather context
    const context = await this.getOrgContext(orgId);
    
    // 2. Query Salesforce directly via MCP
    const metrics = await this.querySalesforceMetrics(orgId);
    
    // 3. Generate analysis with Claude
    const report = await this.generateAnalysis(metrics, context);
    
    // 4. Store and deliver
    await this.r2.put(`reports/${orgId}/${date}.md`, report);
    await this.deliverViaSlack(orgId, report);
  }
}
```

**Architecture:**
- Extract queries from existing `fundraising-data-analysis.yaml`
- Move all logic to Cloudflare Worker
- Use MCP server directly for Salesforce queries
- Store reports in R2: `/reports/{orgId}/`
- Deliver via Slack summary + link

**Report Sections:**
- Revenue analysis (YoY, QoQ, MoM)
- Donor retention metrics
- Pipeline health
- Campaign performance
- Actionable recommendations

---

#### Priority 8: Testing Infrastructure

**Test with sandbox orgs:**
- Discovery Agent full runs
- Semantic layer configuration
- Document upload and indexing
- Slack conversation flows
- Report generation
- Cache consistency

---

### Week 5-6: December 18-31 - Polish & Launch Prep

#### Priority 9: Multi-Tenant Support

**Architecture:**
```
/org-profiles/
├── customer123/
│   ├── discovery/
│   ├── context/
│   └── documents/
└── customer456/
    └── ...

Cloudflare KV:
- org:customer123:credentials (encrypted)
- session:abc123 (conversation state)
- cache:query:hash (5-hour TTL)
```

---

#### Priority 10: January 1 Launch Preparation

**Pre-launch checklist:**
- [ ] Production credentials from 5 clients
- [ ] Discovery Agent tested
- [ ] Knowledge base complete
- [ ] Slack bot operational
- [ ] Report generation working
- [ ] Multi-tenant isolation verified

**Launch Day Sequence:**
1. Morning: Connect production orgs
2. Run Discovery Agent for each
3. Generate initial analysis reports
4. Send "AI-Powered Fundraising Analysis" to clients
5. Begin Slack support
6. Monitor and iterate

---

## Technical Decisions & Answers

### Addressing Open Questions

**1. ~~Can Goose be triggered from Slack?~~**
- **No longer relevant** - Not using Goose
- Everything in Cloudflare Workers
- Simpler architecture, better control

**2. Knowledge Base Format?**
- **Decision:** Markdown with YAML frontmatter
- Stored in R2, indexed with embeddings
- 500-token chunks with 100-token overlap

**3. Document Storage?**
- **Decision:** R2 for documents, KV for metadata
- R2 is cost-effective for blob storage
- KV provides fast lookups for indexes

**4. Cache Strategy?**
- **Decision:** Cloudflare KV (not Redis)
- 5-hour TTL for complex queries
- 1-hour for simple lookups
- 24-hour for reports

**5. Discovery Process?**
- **Decision:** Continuous, not one-time
- Weekly automated scans
- Conversational updates as needed
- Stored in R2, cached in KV

---

## Key Architecture Changes from v3.3

### What's Different

1. **Pure Cloudflare Architecture**
   - NO Goose dependency at all
   - Everything runs in Cloudflare Workers
   - No external infrastructure needed
   - True serverless, scales automatically

2. **Fundraising Analysis Moved to Workers**
   - Was: Goose recipe (`fundraising-data-analysis.yaml`)
   - Now: Cloudflare Worker with Cron trigger
   - Direct MCP integration for Salesforce queries
   - Same analysis logic, better integration

3. **Discovery Agent in Workers**
   - Automated part: Cloudflare Worker (no user input)
   - Conversational part: Slack bot in Worker
   - Continuous learning from interactions

4. **Consistency Engine Added**
   - 5-hour cache windows for deterministic responses
   - Hash-based cache keys in KV
   - Same query = same answer (builds trust)

5. **Semantic Layer Formalized**
   - Business rules engine
   - Donor routing logic
   - Portfolio assignments

6. **Unified Platform Benefits**
   - Single deployment: `wrangler deploy`
   - No container management
   - No Goose runtime needed
   - Simpler debugging and monitoring

---

## Phase 1: January 1-31 - Production Launch

### Success Metrics

**January 1 (Launch Day):**
- ✅ 5 orgs connected successfully
- ✅ Discovery Agent captures context
- ✅ Initial reports delivered
- ✅ Slack bot responding

**January 31 (Month 1):**
- ✅ Users out of Salesforce 80% of time
- ✅ 10+ hours saved per user
- ✅ 3+ testimonials collected
- ✅ NPS >60

**March 31 (Quarter 1):**
- ✅ 15+ organizations onboarded
- ✅ $15K MRR achieved
- ✅ 2+ case studies published
- ✅ Clear product-market fit signals

---

## Resource Requirements

### Before January 1 (6 weeks)

**Product Lead (You):**
- Build fundraising knowledge base (Week 1)
- Design Discovery Agent questions
- Define analysis report structure
- Test with sandbox orgs
- Prepare client communications

**Developer:**
- Implement all Cloudflare Workers
- Build retrieval API and semantic search
- Create Discovery Agent (automated + conversational)
- Slack integration and session management
- Fundraising Analysis Worker (migrate from Goose recipe)
- Document upload system
- Consistency engine and caching
- Multi-tenant infrastructure

**Estimated hours:** 200-240 hours  
**Cost:** $15K-$20K (or equity equivalent)

---

## Risk Mitigation

### Technical Risks

**Risk: Cloudflare Worker timeout (30 seconds)**
- Complex analyses split into chunks
- Use Durable Objects for long-running tasks
- Upgrade to paid tier if needed (50-second limit)

**Risk: Discovery misses critical context**
- Continuous discovery (not one-time)
- Human review of findings
- Manual override capability

**Risk: Cache creates stale responses**
- 5-hour windows balance consistency and freshness
- Manual cache invalidation available
- Event-based clearing for major changes

### Business Risks

**Risk: Orgs don't trust AI with donor data**
- Start read-only
- Explicit confirmation for all writes
- Emphasize time savings over automation

**Risk: Generic recommendations**
- 50+ fundraising best practices documents
- Org-specific discovery
- Semantic layer applies business rules

---

## Critical Success Factors

1. **Intelligence Layer Depth:** The fundraising expertise and org discovery must be exceptional
2. **January 1 Launch:** Must deliver immediate value to consulting clients
3. **Consistency:** Same questions get same answers (builds trust)
4. **Time Savings:** Measurably keep people out of Salesforce
5. **Mission Focus:** Help nonprofits focus on impact, not data management

---

## Next Steps (Immediate)

### This Week (Nov 25-Dec 1):
- ✅ Complete fundraising knowledge base
- ✅ Build Discovery Agent (automated portion)
- ✅ Set up R2 storage structure
- ✅ Create retrieval API

### By December 8:
- ✅ Semantic layer implemented
- ✅ Document upload system ready
- ✅ Slack MVP working (or pivot decision made)

### By December 15:
- ✅ Conversation layer tested
- ✅ Report generation automated
- ✅ All core components integrated

### By January 1:
- ✅ LAUNCH READY
- ✅ 5 clients onboarded
- ✅ Discovery complete for each
- ✅ Initial reports delivered

---

**Document Version:** 3.4  
**Last Updated:** November 25, 2025  
**Status:** Critical Path to January 1 Launch  
**Key Change:** Pure Cloudflare architecture - NO Goose dependency, everything in Workers
