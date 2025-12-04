# GitHub Issues from Product Roadmap v4

Generated from: `product-roadmap-v4.md`
Date: 2025-12-02

## Milestone 1: Intelligence Foundation + Orchestrator

- Create knowledge-base/fundraising/ structure, Priority 1, Milestone 1
- Implement retrieve_expertise tool, Priority 1, Milestone 1
- Set up document storage (R2/KV/S3), Priority 1, Milestone 1
- Create agents/discovery/, Priority 2, Milestone 1
- Implement Discovery Agent guided questions, Priority 2, Milestone 1
- Create field-mapper subagent, Priority 2, Milestone 1
- Implement /discover command, Priority 2, Milestone 1
- Create discovery data storage structure, Priority 2, Milestone 1
- Adapt orchestrator for fundraising agents, Priority 0, Milestone 1

## Milestone 2: Semantic Layer & Documents

- Build semantic layer with donor routing rules, Priority 3, Milestone 2
- Implement retrieve_org_context tool, Priority 3, Milestone 2
- Implement store_org_context tool, Priority 3, Milestone 2
- Create document upload system (PDF/CSV), Priority 4, Milestone 2
- Integrate LlamaIndex for document parsing, Priority 4, Milestone 2
- Implement search_documents tool, Priority 4, Milestone 2
- Implement get_document tool, Priority 4, Milestone 2

## Milestone 3: Core Agents & Commands

- Create agents/data-analysis/, Priority 5, Milestone 3
- Implement comprehensive fundraising analytics, Priority 5, Milestone 3
- Create benchmark subagent, Priority 5, Milestone 3
- Create data-quality subagent, Priority 5, Milestone 3
- Implement /analyze command, Priority 5, Milestone 3
- Design analysis report output format, Priority 5, Milestone 3
- Implement conversation & confirmation layer, Priority 6, Milestone 3
- Create safe create/update workflow, Priority 6, Milestone 3
- Add missing required field detection, Priority 6, Milestone 3

## Milestone 4: Additional Agents & Testing

- Create agents/prioritization/, Priority 7, Milestone 4
- Implement daily donor prioritization logic, Priority 7, Milestone 4
- Implement /prioritize command, Priority 7, Milestone 4
- Create agents/email-drafter/, Priority 7, Milestone 4
- Implement email drafting functionality, Priority 7, Milestone 4
- Create voice-matcher subagent, Priority 7, Milestone 4
- Implement /draft command, Priority 7, Milestone 4
- Create agents/donor-research/, Priority 7, Milestone 4
- Implement donor research functionality, Priority 7, Milestone 4
- Implement /research command, Priority 7, Milestone 4
- Create testing infrastructure for sandbox orgs, Priority 8, Milestone 4
- Implement full agent workflow tests, Priority 8, Milestone 4
- Test MCP client integration (Goose/Claude Desktop), Priority 8, Milestone 4

## Milestone 5: Polish & Launch Prep

- Implement multi-tenant Worker deployment, Priority 9, Milestone 5
- Set up per-org knowledge base isolation, Priority 9, Milestone 5
- Configure per-org credentials management, Priority 9, Milestone 5
- Create January 1 launch checklist, Priority 10, Milestone 5
- Set up early adopter client org access, Priority 10, Milestone 5
- Create production credentials workflow, Priority 10, Milestone 5
- Document launch sequence, Priority 10, Milestone 5

## Additional Commands & Infrastructure

- Implement /refresh command, Priority 6, Milestone 3
- Implement /status command, Priority 6, Milestone 3
- Implement error handling strategy, Priority 8, Milestone 4
- Create LLM cost tracking and monitoring, Priority 9, Milestone 5

## Tools Layer (Supporting Infrastructure)

- Create tools/salesforce/ integration, Priority 0, Milestone 1
- Create tools/knowledge/ integration, Priority 1, Milestone 1
- Create tools/documents/ integration, Priority 4, Milestone 2
- Create tools/cache/ (descoped for v4), Priority N/A, Future

## File Structure Setup

- Create orchestrator/ directory structure, Priority 0, Milestone 1
- Create agents/ directory structure, Priority 0, Milestone 1
- Create commands/ directory structure, Priority 0, Milestone 1
- Create tools/ directory structure, Priority 0, Milestone 1
- Create knowledge-base/ directory structure, Priority 1, Milestone 1
