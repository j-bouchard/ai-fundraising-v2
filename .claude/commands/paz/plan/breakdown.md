---
name: Break Down Technical Document
allowed-tools: Bash, Read, Write, Grep, Glob
description: Decompose technical planning documents into actionable work items with templates
---

# Document Breakdown Agent

Analyze a technical planning document and break it down into actionable planning artifacts. Follow the `Workflow` for the `DOC_PATH` then `Report` the completed work.

## Variables

DOC_PATH: (to be provided by user - path to technical document like THRIVE-TECHNICAL.md)
OUTPUT_DIR: (optional - defaults to `plans/breakdown/{doc-name}/`)
BREAKDOWN_TYPE: (optional - auto-detected or user-specified: technical-spec, roadmap, feature-plan)

## Workflow

If no `DOC_PATH` is provided, STOP immediately and ask the user to provide it.

### Step 1: Document Analysis & Type Detection

1. **Read the target document** at `DOC_PATH`
2. **Detect document type** by analyzing structure:
   - Contains data models → `technical-spec`
   - Contains phases/milestones → `roadmap`
   - Contains feature descriptions → `feature-plan`
   - Mixed content → `comprehensive-plan`
3. **Load appropriate templates** from `.claude/templates/paz/docbreak/`

### Step 2: Document Type Detection Logic

Analyze document for these patterns:

- **Technical Spec**: Contains code blocks, data models, API definitions, architecture diagrams
- **Roadmap**: Contains phases, timelines, milestones, dependencies
- **Feature Plan**: Contains user stories, requirements, acceptance criteria
- **Comprehensive**: Contains multiple of the above (like THRIVE-TECHNICAL.md)

### Step 3: Template Loading Strategy

**Base Template**: Always load `.claude/templates/paz/docbreak/base.md`

**Type-Specific Templates** (load based on detection):
- Technical Spec → `.claude/templates/paz/docbreak/technical.md`
- Roadmap → `.claude/templates/paz/docbreak/roadmap.md`
- Feature Plan → `.claude/templates/paz/docbreak/feature.md`
- Comprehensive → Load all relevant templates

### Step 4: Content Extraction

Extract key elements from the document:

1. **Identify all sections** (use markdown headers as delimiters)
2. **Categorize content**:
   - Data models/schemas
   - Implementation phases
   - Feature requirements
   - Technical decisions
   - Open questions
   - Dependencies
3. **Extract actionable items**:
   - Checkboxes `[ ]` or `[x]`
   - Implementation tasks
   - Decision points
   - Research needs

### Step 5: Generate Planning Artifacts

Create structured planning documents in `OUTPUT_DIR`:

**For Technical Specs:**
- `01-data-models.md` - All data structures that need implementation
- `02-apis-interfaces.md` - API endpoints, interfaces, contracts
- `03-architecture-decisions.md` - Key technical decisions and rationale
- `04-integration-points.md` - External dependencies and integrations
- `05-open-questions.md` - Unresolved technical questions

**For Roadmaps:**
- `01-phase-overview.md` - All phases with timelines and goals
- `02-phase-{N}-plan.md` - Detailed plan for each phase
- `03-milestones.md` - Key milestones and success criteria
- `04-dependencies.md` - Cross-phase dependencies
- `05-risk-mitigation.md` - Identified risks and mitigation strategies

**For Features:**
- `01-feature-inventory.md` - Complete list of features
- `02-feature-{name}-spec.md` - Detailed spec for each major feature
- `03-user-stories.md` - User stories and use cases
- `04-acceptance-criteria.md` - Testing and acceptance requirements

**Universal Artifacts (always create):**
- `00-index.md` - Navigation index for all breakdown files
- `99-next-steps.md` - Immediate actionable next steps with priorities

### Step 6: Create Executable Tasks

For each planning artifact, extract and prioritize:

1. **Immediate tasks** (can start now)
2. **Blocked tasks** (dependencies need resolution)
3. **Research tasks** (need investigation before implementation)
4. **Review tasks** (need stakeholder input)

Output format for tasks:
```markdown
## Task: [Title]
- **ID**: T-{number}
- **Type**: immediate | blocked | research | review
- **Effort**: small | medium | large
- **Dependencies**: [List of task IDs]
- **Owner**: [TBD or assigned]
- **Context**: [Why this task exists]
- **Acceptance**: [How to know it's done]
```

### Step 7: Generate Workflow Guide

Create a `WORKFLOW.md` that explains:
1. How to navigate the breakdown files
2. Suggested order for tackling tasks
3. How to update artifacts as work progresses
4. Integration back to main document

## Report

After completing the breakdown, create:

```markdown
# Document Breakdown Complete: {DOC_NAME}

> Generated: [timestamp]
> Source: {DOC_PATH}
> Output: {OUTPUT_DIR}

## Breakdown Summary

### Document Analysis
- **Type**: {detected-type}
- **Sections**: {count}
- **Templates Applied**: {list}

### Generated Artifacts
- {count} planning documents created
- {count} actionable tasks identified
- {count} open questions extracted
- {count} dependencies mapped

### Quick Start

**Immediate Next Steps** (Priority 1):
1. [First task from 99-next-steps.md]
2. [Second task]
3. [Third task]

**View Complete Breakdown**:
```bash
cd {OUTPUT_DIR}
cat 00-index.md
```

### Task Distribution
- Immediate: {count} tasks
- Blocked: {count} tasks
- Research: {count} tasks
- Review: {count} tasks

### Key Insights
- [Major insight from analysis]
- [Technical complexity assessment]
- [Resource requirements]
- [Timeline considerations]
```

---

## Example Usage

```bash
# Break down THRIVE technical document
/paz:plan:breakdown
# When prompted, provide: plans/THRIVE-TECHNICAL.md

# Result structure:
plans/breakdown/thrive-technical/
├── 00-index.md
├── 01-data-models.md
├── 02-phase-overview.md
├── 03-phase-1-foundation.md
├── 04-phase-2-story-skills.md
├── 05-phase-3-career-planning.md
├── 06-ai-pipeline-specs.md
├── 07-content-system-spec.md
├── 08-privacy-security.md
├── 99-next-steps.md
└── WORKFLOW.md
```

## Integration with Development

The breakdown agent creates a bridge between planning and execution:

1. **Planning Phase**: Run `/paz:plan:breakdown` on technical doc
2. **Task Selection**: Review `99-next-steps.md` for priorities
3. **Implementation**: Execute tasks referencing artifact specs
4. **Verification**: Check acceptance criteria in task definitions
5. **Update Loop**: As work progresses, update artifacts and re-run breakdown to adjust

This workflow enables:
- Clear separation of planning vs execution
- Traceability from implementation back to requirements
- Adaptive planning as new information emerges
- Template-driven consistency across projects
