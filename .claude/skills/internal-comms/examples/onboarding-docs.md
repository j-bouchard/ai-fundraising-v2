---
name: onboarding-doc-generator
description: Generate intermediate-level implementation guide for Joe to customize. Focuses on user workflows, what customers will experience, and implementation requirements. Minimal technical architecture, maximum user and implementer value.
---

# Onboarding Doc Generator Skill

Generate an implementation guide positioned for Joe to build customer-facing docs from. Balances what end-users will experience, what Joe needs to set up, and what they should be aware of.

## Quick Start

Use Claude Code to invoke this skill:

```
Generate implementation guide for [customer_context] using MCP server at [codebase_path]
```

Provide:
1. **Codebase path** — Directory containing MCP server source code
2. **Architecture docs** — Technical documentation explaining design and integration
3. **Customer context** — Use case description (e.g., "AI-powered Salesforce integration for fundraising")

Output: Markdown positioned as an intermediate artifact for Joe to customize and base customer docs on.

## Document Purpose

This document answers three sets of questions:

**For end-users:**
- What can I do with this system?
- How do I get started?
- What happens when I use it?
- What won't work?

**For Joe (implementer):**
- What must I configure before users can start?
- What integration points are critical?
- What should I explain to customers about their Salesforce setup?
- What problems might arise and how do I troubleshoot?

**For refinement:**
- Where should I add customer-specific details?
- What workflows are most important for my customers?
- What terminology should I change for my audience?

## Workflow

### Phase 1: Codebase Analysis — User Experience Perspective

Extract what end-users will actually *do* (not how it works internally):

1. **Connection process** — What steps does a user take to start? (e.g., "Authorize Salesforce access" not "OAuth 2.0 flow")
2. **Available actions** — List in user terms:
   - "Ask questions about your data" vs "execute SOQL queries"
   - "Get recommendations" vs "enrichment engine returns insights"
   - "Send emails to contacts" vs "create EmailMessage records"
3. **Typical workflows** — What are 3-5 things a user would do in their first week?
4. **What they see** — What is the user interface/output like? What do results look like?
5. **Constraints** — What can't they do? Why? (e.g., "Can't delete records" not "hard deletes prevented by design")
6. **Common mistakes** — What will confuse first-time users? How do they recover?

### Phase 2: Codebase Analysis — Implementation Perspective

Extract what Joe needs to set up:

1. **Prerequisites** — What must be true about the customer's Salesforce setup?
2. **Configuration steps** — What does Joe actually do to set this up? (Not: low-level config. But: "Connect to your Salesforce instance," "Provide API credentials," etc.)
3. **Integration checkpoints** — What can Joe test to verify setup worked?
4. **Data mapping** — Do custom fields need configuration? Does data need to be cleaned up?
5. **Access/permissions** — What Salesforce permissions must users have?
6. **Common setup problems** — What typically goes wrong during implementation?

### Phase 3: Architecture Context

Review docs to understand:

1. **Why it works this way** — What problems does the design solve?
2. **What data flows** — Where does information come from? Where does it go?
3. **Known limitations** — Technical constraints that affect users (e.g., query timeouts, rate limits)
4. **Operational considerations** — What should Joe monitor? When might things break?
5. **Best practices for implementation** — What has worked well in similar setups?

### Phase 4: User Journey Mapping

Synthesize into real workflows:

1. **Day 1: Getting started** — Minimum steps to first successful query
2. **Week 1: Common workflows** — 3-4 most valuable things users will do
3. **Ongoing: Advanced usage** — Features users graduate to once comfortable

### Phase 5: Documentation Generation

Follow template below, keeping focus on user experience and implementer needs.

---

## Documentation Template

Generate markdown with this structure:

```markdown
# [Product Name] Implementation Guide

*For implementers building [Customer Context] solutions*

## Overview

[What this system does from end-user perspective]
[How it fits into the customer's workflow]
[What value it provides]

---

## Section 1: Implementation Requirements

### Prerequisites for Your Salesforce Organization
[What must be true: org edition, features, data quality, custom fields needed, etc.]

### Accounts & Permissions Setup
[What Salesforce user roles/permissions are required]
[Any special setup (connected apps, custom fields, picklists, etc.)]

### Configuration Checklist
- [ ] Salesforce prerequisites verified
- [ ] API access configured
- [ ] Team members have required permissions
- [ ] [Any custom setup specific to this system]

### Testing Implementation
[How Joe verifies the setup worked before giving to customers]

---

## Section 2: How It Works for End-Users

### What Your Users Can Do

**Scenario 1: [Most common first task]**
- User does X
- System responds with Y
- User sees/receives Z
- Example: [Realistic example]

**Scenario 2: [Second common task]**
- Similar format

**Scenario 3: [Third common task]**
- Similar format

### The Four-Step Workflow

**Step 1: Connect**
- What users do: [simple action]
- What happens: [outcome in user terms]
- First-time user question: "[likely question]"

**Step 2: Ask**
- What users do: [describe interaction model]
- What they can ask about: [capabilities in user language]
- Examples:
  - "Show me..."
  - "Get me..."
  - "Find..."
- What they get back: [describe output, not technical format]

**Step 3: Get Insights**
- What users see: [recommendations, analysis, etc.]
- Where insights come from: [data sources in user terms]
- How to use insights: [actionable guidance]

**Step 4: Take Action**
- What users can do: [generate, send, schedule, etc.]
- Where actions are logged: [Salesforce records they can see]

### What Users Cannot Do

[List in user terms, explain why]

---

## Section 3: Getting Users Started

### Day 1: First-Time User Setup
1. [Simple step 1]
2. [Simple step 2]
3. [First successful interaction]

Estimated time: X minutes

### Week 1: Core Workflows
- **Monday:** [Workflow 1 - what they'll try first]
- **Wednesday:** [Workflow 2 - more valuable use case]
- **Friday:** [Workflow 3 - consolidate learning]

---

## Section 4: Common Workflows & Patterns

### Workflow: [Common Use Case 1]

**Goal:** [What user is trying to accomplish]

**Steps:**
1. Do this
2. Then this
3. System returns this
4. User does this

**Expected result:** [What they should see]

**Tips:**
- [Helpful hints for success]
- [Common mistakes to avoid]

### Workflow: [Common Use Case 2]
[Similar structure]

---

## Section 5: Troubleshooting

### Common User Issues

**Problem: [Real issue users might encounter]**
- What causes it: [simple explanation]
- How to fix it:
  - Check X in Salesforce
  - Verify Y
  - Try Z
- Prevention: [how to avoid next time]

**Problem: [Another issue]**
[Same structure]

### When Implementation Isn't Working

**Setup issue: [Common problem during implementation]**
- What went wrong: [explanation]
- How to debug:
  - Check X
  - Look for Y in logs
  - Verify Z
- Resolution: [steps to fix]

---

## Section 6: What You Should Tell Your Customers

### Key Points to Communicate

- [What this can do for them]
- [Time investment for getting started]
- [What Salesforce data quality requirements exist]
- [Privacy/data handling reassurance]
- [Support and next steps]

### Common Customer Questions

**Q: How is this different from [alternative]?**
A: [Your answer]

**Q: Will this change my Salesforce data?**
A: [Reassurance]

**Q: How secure is this?**
A: [Answer]

**Q: What if I need to customize this?**
A: [What's possible]

---

## Section 7: Operational Considerations

### What to Monitor

- [Metrics that indicate health]
- [Warning signs to watch for]
- [How often to check]

### Known Limitations & Constraints

- [What might cause slowdowns or failures]
- [Salesforce rate limits]
- [Data volume considerations]
- [Timing expectations]

### Best Practices

- [How to structure data in Salesforce for best results]
- [Workflows that work well]
- [Patterns to avoid]
- [Maintenance tasks]

---

## Section 8: Support & Next Steps

### For Customers

- [How to report issues]
- [Support process]
- [What constitutes normal behavior vs problems]

### For You (Implementer)

- [Resources for deeper technical understanding]
- [Monitoring and maintenance tasks]
- [When to escalate to technical support]

---

## Additional Resources

- [Customer-facing quick start guide location]
- [Technical reference for implementers]
- [Support contact info]
```

---

## Key Principles

### 1. Separate User Experience from Implementation

- **User sections** describe what end-users do and see, using their language
- **Implementation sections** describe what Joe needs to set up, using his context
- **Callout sections** help Joe know what to communicate to his customers

### 2. Use Real Workflows, Not Feature Lists

Don't write: "The system supports querying data, filtering results, and generating reports"

Write: "Your users will ask questions like 'Show me donors who gave in 2024' and get a prioritized list they can act on immediately"

### 3. Minimize Technical Implementation Details

Avoid: TypeScript code, architecture diagrams, MCP protocol specs, OAuth flows, Salesforce API internals

Include: Step-by-step setup, configuration checklist, what to verify, what problems to expect

### 4. Give Joe Points to Customize

Leave specific sections where Joe should add customer details:
- "For [Industry/Use Case] customers, also configure..."
- "You'll want to train users on [Topic]"
- "Customers often customize [Feature] for..."

### 5. Anticipate Implementation Problems

Look at error handling and logging in codebase to identify:
- What will first-time users get confused about?
- Where will permissions problems occur?
- When might queries time out or fail?
- What data quality issues might surface?

---

## Quality Checklist

Before outputting final document:

- [ ] User experience sections are clear without technical jargon
- [ ] Implementation sections are actionable (Joe knows exactly what to do)
- [ ] Every workflow includes a realistic example
- [ ] Troubleshooting section covers real problems (not hypothetical)
- [ ] Configuration checklist is checkable
- [ ] Tone is helpful and confident, not overly cautious
- [ ] Limitations are explained in user terms (not "governor limits")
- [ ] "What to tell customers" section gives Joe real talking points
- [ ] Joe knows where his customization should go
- [ ] No generic placeholder text remains
- [ ] No code samples or architecture diagrams (they belong elsewhere)
- [ ] Customer journey is clear and achievable

---

## What To Extract From Codebase

| Section | What To Find | Example |
|---------|-------------|---------|
| User actions | Tool names, inputs, outputs | query-salesforce, get-donor-profile |
| Workflows | Test cases, example code, design docs | Common sequences of operations |
| Constraints | Error handling, guard clauses, limits | Max records, timeouts, permissions |
| Setup | Config files, env vars, initialization | What must be set before use |
| Integration | How it connects to external systems | OAuth, API keys, Salesforce connection |
| Problems | Known issues, TODOs, warnings | What has caused problems before |

---

## Usage in Claude Code

Typical invocation:

```bash
# Claude Code workflow:
# 1. Read the MCP server codebase
# 2. Read architecture and design docs
# 3. Extract user workflows and implementation needs
# 4. Apply this skill to generate intermediate guide
# 5. Output markdown file ready for Joe to customize
```

Joe then:
1. Reviews the document
2. Adds customer-specific details
3. Extracts sections for customer-facing guides
4. Uses troubleshooting section to build support materials

---

## Integration with Document Versions

This generates the **intermediate/implementation level** document.

Work with these other versions:
- **Customer-facing guide** — Derived from user experience sections + Joe's customizations
- **Technical reference** — Deeper dive on architecture (Form 22-A equivalent)
- **Quick-start** — Condensed day-1 workflow (Form 22-B equivalent)

All three versions can reference each other and stay in sync.