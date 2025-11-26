# V4 Risk Assessment

**Document:** product-roadmap-v4.md
**Assessment Date:** November 26, 2025
**Purpose:** Identify gaps, questionable assumptions, and weaknesses in the V4 plan

---

## What's Missing

### 1. No Sandbox/Test Org Strategy Defined

The plan states "no production access until January 1" but relies heavily on testing with "sandbox orgs" in Milestone 4.

**Questions to resolve:**
- Do you have access to sandbox orgs now?
- Whose orgs? How many?
- Are they representative of real client data complexity?
- Is this a blocking dependency?

**Recommendation:** Document specific sandbox orgs available for testing, or identify this as a risk if none are secured.

**PAZ REPLY:** Joe has a sandbox org with mock data, all this work should run successfully and edge case against that mock data.  It 
would be beneficial to have a 'live' client, but not a deal breaker, this work is aimed at "Joe Only".

---

### 2. Knowledge Base Content Creation is a Black Box

Joe provides the fundraising expertise documents, but the process is undefined.

**Questions to resolve:**
- Is Joe writing these from scratch?
- Curating existing materials?
- Recording and transcribing expertise?
- How much time does this take outside the 100 dev hours?

**Concern:** 50+ documents alongside 100 hours of dev work may not be realistic if content creation is also on Joe's plate.

**Recommendation:** Separate content creation effort from development effort, or reduce scope.

**PAZ REPLY:** The 100 hour estimate does not include this work, this is "Joe Only" work.

---

### 3. No Error Handling / Failure Modes Defined

The plan describes happy paths but not failure scenarios.

**Unaddressed scenarios:**
- Salesforce API rate limits
- Org with corrupted/inconsistent data
- MCP connection failures
- LLM timeouts or errors
- Agent graceful degradation

**Recommendation:** Add a section on error handling strategy, even if lightweight.

**PAZ REPLY:** Valid point, lets add to the roadmap

---

### 4. OAuth Flow for New Orgs Undefined

Multi-tenant architecture is "deploy new Worker per org" — but authentication onboarding is not specified.

**Questions to resolve:**
- How does a new org authenticate?
- Is OAuth setup manual each time?
- Who handles credential management?
- What's the onboarding time per org?

**Recommendation:** Document the org onboarding flow, even if manual for V4.

**PAZ REPLY:** We have a single deployment running as of now against the sandbox org, there is a single set of credentials
at the MCP layer, this needs to be 'evaluated and reviewed', however until the full range of knowledge base docs
and expectations are available we have to defer

---

### 5. LLM Costs Not Mentioned

Claude API usage could be significant, especially with multiple agents and complex queries.

**Questions to resolve:**
- What's the estimated cost per query/interaction?
- What's the monthly budget assumption?
- How does cost scale with number of orgs?
- Are there any cost controls (caching, model selection)?

**Recommendation:** Add rough cost estimates and budget constraints.

**PAZ REPLY:** Very valid, we need to include this in our v4 document as 'requires attention' and 'outstanding'

---

## Questionable Assumptions

### 1. 100 Hours Feels Optimistic

The scope includes:
- 6 agents
- 4 subagents
- 7 commands
- Document upload/parse system
- Semantic layer
- Consistency/caching engine
- Multi-tenant deployment
- Testing

**Math:** ~10 hours per major component with minimal slack.

**The "buffer for unknowns" is acknowledged but not sized.** If unknowns consume 20-30 hours, core functionality gets cut.

**Recommendation:** Either increase estimate to 120-150 hours, or explicitly identify what gets cut if time runs short (priority stack rank).

**PAZ REPLY:** Updated to 120 hours. Add explicit priority stack rank to V4 roadmap (what gets cut if time runs short). 120 hours includes buffer for orchestrator adaptation, error handling, and unknowns. Pace is 20 hours/week firm (6 weeks), or 25 hours/week for accelerated timeline (~5 weeks).

---

### 2. Consistency Engine Complexity

The plan describes:
- Hash "query + context" to create cache keys
- TTL-based invalidation
- Event-based cache clearing

**Concerns:**
- What counts as "context"? (Org state? User? Time of day?)
- How do you normalize queries for matching? ("Show donors" vs "List all donors" vs "Get donor list")
- Semantic similarity vs exact match?

**This could become a significant rabbit hole.**

**Recommendation:** Start with simple exact-match caching. Defer smart normalization to V5.

**PAZ REPLY:** Yes, this is important, lets note that in the V4 document as needs further refinement and is outside of the
scope of the 120 hour estimate, we see it as a nice to have in a further effort, but it should not be a feature here, we 
are trying to get quickly to a high value solution.

---

### 3. Document Parsing is Hand-Waved

"Parse and index for AI reference" covers PDFs, Word docs, and spreadsheets.

**Reality:** Document parsing is hard.
- PDF text extraction is inconsistent
- Word docs have complex formatting
- Spreadsheets need structure interpretation

**Questions to resolve:**
- Are you using existing tooling (LlamaIndex, Unstructured, etc.)?
- Building custom parsing?
- What's the minimum viable approach?

**Recommendation:** Specify tooling or defer complex document types to V5 (start with Markdown/plain text only).

**PAZ REPLY:** Yes, we'd use existing off the shelf applications like LlamaIndex, we would not build custom parsing, we'd expect 
for v4 to be strictly working in PDF and CSV files only.

---

### 4. "Fundraising Expert Agent" is Vague

Other agents have clear triggers and outputs:
- Discovery Agent → `/discover` → org context stored
- Data Analysis Agent → `/analyze` → report generated

Fundraising Expert Agent is "on-demand questions" with "strategic recommendations."

**Questions:**
- How does this differ from just asking Claude with the knowledge base loaded?
- What's the unique value of a dedicated agent?
- What are the specific outputs?

**Recommendation:** Either sharpen the definition or merge into a general Q&A capability rather than a dedicated agent.

**PAZ REPLY:** By design, the knowledge base would be 'informing' our agents and tools 'how' to work, so the interchange
is through the markdown definition files that is the knowledge base.  

---

### 5. V4 → V5 Transition Not Fully Thought Through

**V4 interaction model:**
- Claude Code commands (`/discover`, `/analyze`, `/prioritize`)
- Developer-facing, CLI-style

**V5 interaction model:**
- Slack bot
- Natural language, async, non-technical users

**Concern:** These are fundamentally different interaction paradigms. V5 may require:
- Intent detection layer
- Conversation state management
- Different error handling (can't show stack traces)
- Re-architecting agent triggers

**Recommendation:** Add explicit "V5 compatibility" requirements to V4 agent design. Design agents to be trigger-agnostic from the start.

**PAZ REPLY:** Correct, V5 is outside of our effort here, are assumption is that providing Anthropic based standard tooling and agents is that
we'll be able to expose it to other tools for the consumer layer in V5.  The effort here is to develop the robust tool and then have
a separate effort in how to rollout to customers.   V4 is for "Joe Only" and it validates our approach.  Moving away from Goose is critical for
this effort and saying "MCP Client" is correct.  We don't know how Slack will interoperate and if even slack is the correct tool, we 
don't want to postpone this work for that.  I have said to Joe that he should find a Slack integration specialist if that is
the chosen tool, it's premature to make that call outside of the v4 work.

---

## Weaknesses

### 1. Single Point of Failure: Joe

Joe is responsible for:
- Fundraising domain expertise (content)
- Testing (QA)
- Client relationships

**Risks:**
- No redundancy
- No second pair of eyes on code
- No external QA
- Burnout risk

**Recommendation:** Identify at least one checkpoint for external review (code review, architecture review, or user testing with someone other than Joe).


**PAZ REPLY:** I've updated joes' responsibility, Paz is the developer.  Acknowledge the single point of failure for both joe and Paz.

---

### 2. "Internal Release" Could Mean Perpetually Internal

V4 is internal with no external accountability. V5 is "future" with no scope or timeline.

**Risk:** V4 works well enough for Joe's consulting work but never becomes a product. It remains a personal tool indefinitely.

**Questions to resolve:**
- What triggers the V5 decision?
- What would make you NOT pursue V5?
- Is there a deadline or forcing function?

**Recommendation:** Define explicit go/no-go criteria for V5. Example: "If V4 saves 10+ hours/week across 3 clients by end of January, proceed to V5."

**PAZ REPLY:** We need v4 to be bullet proof in both execution and logic.  It's only if we can build v4 that we can offer it to external customers.  

---

### 3. Success Metrics are Soft for V4

Current V4 metrics:
- "5+ orgs connected successfully"
- "Data analysis delivered to all clients"
- "MCP client operational for internal testing"

**Concern:** These are checkboxes, not success metrics. They measure output, not outcome.

**Better metrics would be:**
- Time saved per client interaction (measurable)
- Reduction in Salesforce logins (measurable)
- Query accuracy rate (measurable)
- Agent task completion rate (measurable)

**Recommendation:** Add at least 2-3 quantitative outcome metrics for V4.

**PAZ REPLY:** Acknowledge - we are focused on "Joe Only" interactions.  He has told his clients in his upcoming contract negotiation that he will be using
AI tools for his work. 

---

### 4. No Competitive Differentiation Articulated

The plan says "not just another MCP connection" but doesn't articulate what makes this defensible.

**Questions:**
- What's the moat?
- Why couldn't someone else build this quickly once they see it working?
- Is the value in the code, the knowledge base, or Joe's expertise?

**Possible differentiators (not stated):**
- Joe's fundraising expertise embedded in prompts
- Org-specific semantic layer that takes time to build
- Client relationships and trust

**Recommendation:** Articulate the defensibility, even if it's "first mover + domain expertise + client trust."

**PAZ REPLY:** This is an agentic approach, that can run at scale across multiple compute to accomplish tasks independently.  MCP is the
tool, the agentic approach is the moat.  Joe's fundraising skills are key.  In the context of kurt vonnegut's book player piano, we are 
essentially extracting joes knowledge and building the machine.  

---

### 5. Dependency on MCP Client Ecosystem

V4 relies on MCP clients (Goose, Claude Desktop) that are:
- Relatively new
- Actively evolving
- Not fully battle-tested

**Risks:**
- Breaking changes in MCP client APIs
- Performance limitations discovered late
- Features assumed but not available

**Recommendation:** Test MCP client integration early (Milestone 1, not Milestone 4). Identify backup plan if primary client doesn't work.

**PAZ REPLY:** We feel confident that MCP tooling at this point is a strong facade layer to sit in front of Salesforce, we can also access data
directly through the salesforce api

---

### 6. Orchestration is Crucial (Mitigated)

**Risk:** Without coordination, agents can't run reliably across contexts, results aren't persisted, and there's no path to distributed compute.

**Mitigation (already in place):**
- Paz's existing orchestrator (github.com/mpazaryna/orchestrator) provides the coordination layer
- Skill-agnostic pattern, batch processing, tmux integration, result persistence
- V4 runs locally via tmux + orchestrator
- Pattern validated — needs adaptation for fundraising agents, not built from scratch

**PAZ REPLY:** Orchestration is CRUCIAL. The existing orchestrator codebase is the coordinator layer. V4 validates the pattern locally; future iterations can distribute across multiple compute. This is P0 priority alongside MCP and core agents.

---

### 7. Discovery Agent Requires Deep Salesforce Knowledge

**Identified in meeting:** Joe acknowledged he has the core discovery knowledge "in his head" — this is his consultant expertise built over years of client engagements.

**Risk:** Building a fully autonomous Discovery Agent requires deep Salesforce schema expertise (NPSP, Nonprofit Cloud, common customizations, validation patterns). This is not something that can be quickly encoded.

**Mitigation (agreed):**
- V4 implements a **simplified, guided/template-driven** Discovery Agent (not fully autonomous)
- Joe provides **discovery document examples** from past client work as part of his knowledge base contribution
- Agent references Joe's templates and executes guided questions
- Joe reviews/validates captured context

**PAZ REPLY:** This de-risks the Discovery Agent by leveraging Joe's existing expertise rather than trying to encode deep Salesforce schema knowledge from scratch. The agent becomes a "guided assistant" rather than an autonomous expert. Full autonomous discovery may come in future iterations as the knowledge base matures.

---

## Summary: Risks to Address

| Priority | Risk | Impact | Likelihood | Status |
|----------|------|--------|------------|--------|
| 1 | 100 hours is optimistic | Incomplete V4 | Medium-High | ✅ Resolved - Bumped to 120 hours + stack rank |
| 2 | No sandbox orgs for testing | Can't validate before Jan 1 | Medium | ✅ Resolved - Joe has sandbox |
| 3 | Document parsing complexity | Rabbit hole, time sink | Medium | ✅ Mitigated - PDF+CSV only, LlamaIndex |
| 4 | Single point of failure (Joe+Paz) | Burnout, blind spots | Medium | ⚠️ Acknowledged |
| 5 | V4 stays internal forever | No product, just a tool | Low-Medium | ⚠️ Acknowledged |
| 6 | Orchestration is crucial | Agents can't coordinate | High | ✅ Mitigated - Existing orchestrator codebase |
| 7 | Discovery Agent needs deep SF knowledge | Incomplete/poor discovery | Medium | ✅ Mitigated - Guided/template approach, Joe provides examples |

---

## Recommended Actions

| Action | Status |
|--------|--------|
| Confirm sandbox org access | ✅ Done - Joe has sandbox with mock data |
| Stack rank features | ✅ Done - Added to V4 roadmap |
| Simplify document parsing | ✅ Done - PDF+CSV only with LlamaIndex |
| Test MCP client early | ✅ Addressed - MCP confidence is high |
| Define V5 go/no-go criteria | ⏸️ Deferred - V4 must be bulletproof first |
| Schedule one external review | ⏸️ Open - Consider before launch |
| Add error handling strategy | ✅ Done - Added to V4 roadmap |
| Estimate LLM costs | ⏸️ Open - Track during Milestone 1-2 |
| Joe provides discovery document examples | 🔲 Needed - Part of Joe's knowledge base work |
| Adapt orchestrator for fundraising agents | 🔲 Needed - P0 priority in Milestone 1 |

---

**Document Version:** 1.4
**Created:** November 26, 2025
**Last Updated:** November 26, 2025
**Status:** Risk review complete, V4 roadmap updated, 120 hours confirmed
