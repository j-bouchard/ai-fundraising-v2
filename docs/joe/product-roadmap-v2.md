# Fundraising Assistant - Product Roadmap

**Version:** 3.3  
**Last Updated:** November 20, 2025  
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
│  Priority 1: Slack Bot (MVP by Dec 15)         │
│  Priority 2: Data Analysis Reports (Jan 1)      │
│  Phase 3: Web App (Q2 2026)                    │
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
│  • Generates analysis and reports               │
│                                                 │
│  Using: Claude Sonnet 4.5 as LLM               │
│  Note: Testing Slack → Goose integration       │
└────────────┬────────────────────────────────────┘
             │
             ▼
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
│  • Best practices knowledge base                │
│  • Donor engagement strategies                  │
│  • Gift officer workflows                       │
│  • Moves management methodology                 │
│  • Industry benchmarks                          │
│                                                 │
│  3. DOCUMENT UPLOAD & REFERENCE                 │
│  • Program-specific asks                        │
│  • Campaign materials                           │
│  • Board reports                                │
│  • Strategic initiatives                        │
│                                                 │
│  4. CONSISTENCY ENGINE                          │
│  • Deterministic responses within time windows  │
│  • Same query = same answer (5 hour window)     │
│                                                 │
│  Goose Recipes (YAML + Markdown)                │
│  • recipes/discovery_agent.yaml 🆕              │
│  • recipes/data_analysis.yaml 🆕                │
│  • recipes/fundraising_expert.yaml              │
│  • recipes/daily_prioritization.yaml            │
│  • recipes/email_drafter.yaml                   │
│  • recipes/donor_research.yaml                  │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│      CONVERSATION & CONFIRMATION LAYER 🆕       │
│                                                 │
│  • Two-way confirmation for updates             │
│  • Preview exact changes before execution       │
│  • Request missing required fields              │
│  • Validate data before writing                 │
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
│  • Create/Update records (with confirmation)    │
│  • Works with NPSP + Nonprofit Cloud            │
│  • Multi-tenant (per-org credentials)           │
│                                                 │
│  Knowledge Storage (Cloudflare KV/R2)           │
│  • Org context and discovery data               │
│  • Fundraising expertise documents              │
│  • User-uploaded documents                      │
│  • Semantic layer definitions                   │
│                                                 │
│  Logging Endpoint (TypeScript/JavaScript)       │
│  • Receives interaction logs                    │
│  • Stores in Cloudflare KV                      │
│  • 90-day retention                             │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│    SALESFORCE (NPSP + Nonprofit Cloud)          │
│    Customer's Data (Production from Jan 1)      │
└─────────────────────────────────────────────────┘
```

---

## Critical Path to January 1 Launch

### November 20 - December 31: Pre-Production Build Phase

**No production org access until January 1** - Focus on building the intelligence layer and infrastructure

### Week 1: November 20-27 - Intelligence Foundation

#### Priority 1: Fundraising Expertise Knowledge Base

**Purpose:** Build the core value differentiator - deep fundraising knowledge

**Actions:**
1. Use Claude to research and compile fundraising best practices
2. Create structured knowledge base covering:
   - Donor lifecycle management
   - Major gift strategies
   - Annual fund best practices
   - Moves management methodology
   - Stewardship calendars
   - Ask amounts and timing
   - Donor segmentation strategies
3. Store in Cloudflare KV/R2 as searchable documents
4. Create retrieval system for Goose recipes to reference

**Deliverables:**
- 50+ fundraising best practice documents
- Retrieval API for knowledge base
- Integration with Goose recipes

---

#### Priority 2: Discovery Agent Recipe

**Purpose:** Automate the consultant discovery process

**Create recipe: `recipes/discovery_agent.yaml`**

The Discovery Agent asks and learns:

**Salesforce Configuration:**
- What objects are you using? (standard + custom)
- What are your required fields per object?
- Any custom fields we should know about?
- What validation rules exist?
- Campaign usage patterns?
- Data quality issues?

**Organization Structure:**
- Staff roles and responsibilities
- Donor tier definitions ($ amounts)
- Portfolio assignments
- Donor routing rules
- Who gets which reports?

**Fundraising Processes:**
- Moves management stages
- Solicitation approval process
- Stewardship requirements
- Touch frequency by tier
- Lapsed donor definitions

**Strategic Context:**
- Current campaigns
- Annual goals
- Key programs
- Board priorities
- Success metrics

**Stores all findings in structured format in KV**

---

### Week 2: November 27-December 4 - Semantic Layer & Consistency

#### Priority 3: Semantic Layer Implementation

**Purpose:** Ensure consistent, reliable recommendations

**Build semantic layer containing:**
- Donor routing rules (who handles which donors)
- Staff assignments and territories
- Business logic for prioritization
- Data pulling guardrails
- Consistency rules (same query = same answer within time windows)

**Consistency Requirements:**
- Cache responses with TTL:
  - Complex queries: 5-hour cache
  - Simple lookups: 1-hour cache
  - Reports: 24-hour cache
- Hash query + context to create cache keys
- Invalidate cache on data changes

---

#### Priority 4: Document Upload System

**Purpose:** Allow orgs to upload context documents

**Implementation:**
- Cloudflare R2 for document storage
- Support for: PDFs, Word docs, spreadsheets
- Categories:
  - Strategic plans
  - Program descriptions
  - Campaign materials
  - Board reports
- Parse and index for AI reference
- Available to all Goose recipes

---

### Week 3: December 4-11 - Slack MVP & Conversation Layer

#### Priority 5: Slack Integration MVP

**Purpose:** Enable internal testing before January 1

**Implementation:**
- Cloudflare Worker handles Slack webhooks
- Test Slack → Goose → MCP flow
- Handle async processing (Slack's 3-second limit)
- Basic intent detection
- "Thinking..." indicators
- Thread support

**Key Architecture Decision:**
- Test if Goose can be triggered from Slack
- If not, may need to move agents to Cloudflare Workers
- Document findings and adjust architecture

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
Bot: "I'll create a task with:
  - Contact: Sarah Johnson
  - Subject: Follow up on STEM scholarship interest
  - Due: Tuesday, Dec 10
  - Description: Discussed STEM scholarship opportunities
  
  Required: Should this be high priority? Who should be assigned?"
User: "High priority, assign to me"
Bot: "✅ Task created: [link to Salesforce record]"
```

---

### Week 4: December 11-18 - Data Analysis & Testing

#### Priority 7: Data Analysis Suite

**Purpose:** Ready for January 1 client delivery

**Create recipe: `recipes/data_analysis.yaml`**

Comprehensive analysis covering:
- Donor retention rates
- Giving trends (YoY, MoM)
- Pipeline health
- Lapsed donor analysis
- Program performance
- ROI by channel
- Donor lifecycle metrics
- Predictive indicators

**Output format:**
- Executive summary
- Key metrics dashboard
- Actionable recommendations
- Areas of concern
- Opportunities identified

---

#### Priority 8: Testing Infrastructure

**With test/sandbox orgs:**
- Full Discovery Agent run
- Semantic layer configuration
- Document upload and parsing
- Slack interaction flows
- Data analysis generation
- Consistency validation

---

### Week 5-6: December 18-31 - Polish & Prep

#### Priority 9: Multi-Tenant Support

**Finalize multi-tenant architecture:**
- Org credential management
- Isolated knowledge bases per org
- Semantic layer per org
- Document storage per org
- Ready for multiple production orgs

---

#### Priority 10: January 1 Launch Preparation

**Pre-launch checklist:**
- [ ] Production credentials ready (from new contracts)
- [ ] Discovery Agent tested and ready
- [ ] Knowledge base fully populated
- [ ] Data analysis templates polished
- [ ] Slack bot operational
- [ ] 3-5 orgs identified for immediate onboarding
- [ ] Launch sequence documented

**January 1 Launch Sequence:**
1. Connect to production orgs (morning)
2. Run Discovery Agent for each org
3. Generate comprehensive data analysis
4. Send to clients with "Your AI-Powered Fundraising Analysis"
5. Begin Slack integration for daily use
6. Start daily/weekly monitoring

---

## Phase 1: January 1-31 - Production Launch & Validation

**Goal:** Successful launch with consulting clients, validate core value props

### Week 1-2: Rapid Onboarding

**For each consulting client:**
1. Run Discovery Agent (30-45 min session)
2. Configure semantic layer
3. Upload their key documents
4. Generate initial data analysis
5. Set up Slack integration
6. Train primary users

**Internal testing priorities:**
- Use Slack daily for all client work
- Document what works/doesn't work
- Iterate on recipes based on real usage
- Track which recommendations get acted upon

---

### Week 3-4: Iteration & Enhancement

**Based on real usage:**
- Refine Discovery Agent questions
- Enhance knowledge base with missing topics
- Improve consistency engine
- Optimize slow queries
- Add missing Slack commands

**Key metrics to track:**
- Recommendations acted upon
- Time saved per user
- Questions that stumped the AI
- Most valuable features

---

## Phase 2: February-March - Scale & Enhancement

### Enhanced Workflows

**Additional Goose Recipes:**
- Email sequences with voice matching
- Grant research and writing assistant
- Board report generator
- Campaign performance analyzer
- Event planning assistant

### Delivery Improvements

**Automated reporting:**
- Daily priorities via Slack
- Weekly summaries
- Monthly board packages
- Quarterly analysis

---

## Phase 3: April-June - Platform Evolution

### Web Application

**For non-Slack organizations:**
- Chat interface
- Report library
- Document management
- Team collaboration

### Advanced Features

**Intelligence improvements:**
- Predictive donor scoring
- Automated campaign suggestions
- Peer organization benchmarking
- AI-powered coaching

---

## Success Metrics

### January 1 Launch (Immediate)
- ✅ 5+ orgs connected successfully
- ✅ Data analysis delivered to all clients
- ✅ Discovery Agent captures org context
- ✅ Slack bot operational for internal testing

### January 31 (Month 1)
- ✅ 3+ testimonials collected
- ✅ Users staying out of Salesforce 80% of the time
- ✅ 10+ hours saved per user
- ✅ NPS >60

### March 31 (Quarter 1)
- ✅ 15+ organizations onboarded
- ✅ Clear product-market fit signals
- ✅ 2+ case studies published
- ✅ Ready for broader launch

---

## Risk Mitigation

### Technical Risks

**Risk: Goose can't be triggered from Slack effectively**
- Mitigation: Move agents to Cloudflare Workers if needed
- Test early (Week 3) to make architectural decision

**Risk: Consistency engine creates stale responses**
- Mitigation: Smart cache invalidation
- Time-based and event-based clearing
- User can force refresh if needed

**Risk: Discovery Agent misses critical org context**
- Mitigation: Iterative discovery (not one-time)
- Human review of captured context
- Ability to manually edit/add context

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

## Resource Requirements

### Before January 1 (6 weeks)

**Product Lead (You):**
- Build fundraising knowledge base (Week 1)
- Write all Goose recipes
- Test with sandbox orgs
- Prepare client communications

**Developer:**
- Implement knowledge storage system
- Build semantic layer
- Create document upload system
- Slack MVP integration
- Consistency engine
- Multi-tenant infrastructure

**Estimated hours:** 200-240 hours
**Cost:** $15K-$20K (or equity equivalent)

---

## Critical Success Factors

1. **Intelligence Layer Depth:** The fundraising expertise and org discovery must be exceptional
2. **January 1 Launch:** Must deliver immediate value to consulting clients
3. **Consistency:** Same questions get same answers (builds trust)
4. **Time Savings:** Measurably keep people out of Salesforce
5. **Mission Focus:** Help nonprofits focus on impact, not data management

---

## Open Questions Needing Immediate Answers

1. **Architecture:** Can Goose be triggered from Slack webhooks? (Test Week 3)
2. **Knowledge Base:** What format for fundraising expertise? (Markdown, JSON, other?)
3. **Document Storage:** R2 vs KV for uploaded documents?
4. **Consistency:** Cache strategy - Redis or KV?
5. **Discovery:** One-time vs continuous discovery process?

---

## Next Steps (Immediate)

### This Week (Nov 20-27):
- ✅ Start building fundraising knowledge base
- ✅ Design Discovery Agent questions
- ✅ Set up development environment
- ✅ Create test Slack workspace
- ✅ Begin semantic layer design

### By December 1:
- ✅ Knowledge base v1 complete
- ✅ Discovery Agent recipe written
- ✅ Semantic layer implemented
- ✅ Document upload system ready

### By December 15:
- ✅ Slack MVP working
- ✅ Conversation layer tested
- ✅ Data analysis recipe complete

### By January 1:
- ✅ LAUNCH READY
- ✅ All systems tested
- ✅ Clients notified
- ✅ Launch sequence documented

---

**Document Version:** 3.3  
**Last Updated:** November 20, 2025  
**Status:** Critical Path to January 1 Launch  
**Key Change:** Intelligence Layer as #1 Priority
