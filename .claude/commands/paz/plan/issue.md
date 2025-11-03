---
name: Create Task Issue
allowed-tools: Bash, Read, Write, Task
description: Extract a task from breakdown and create a detailed, self-contained issue file
---

# Task Issue Agent

Extract a specific task from a breakdown's `99-next-steps.md` and create a detailed, self-contained issue file ready for work or GitHub issue creation.

## Variables

TASK_ID: (required - e.g., T-001, T-016)
BREAKDOWN_DIR: (optional - defaults to most recent breakdown or prompts user)

## Workflow

### Step 1: Validate Input

If no `TASK_ID` provided, STOP and ask user for task ID.

If no `BREAKDOWN_DIR` provided:
1. Look for most recent breakdown in `plans/breakdown/*/`
2. If multiple exist, ask user to specify
3. If none exist, error and tell user to run `/paz:plan:breakdown` first

### Step 2: Extract Task Context

1. **Read** `{BREAKDOWN_DIR}/99-next-steps.md`
2. **Find** task with ID `{TASK_ID}`
3. **Extract** full task context:
   - Title
   - Priority level (P1/P2/P3/P4)
   - Why/What/Done when/Effort
   - All subtasks (T-XXX-a, T-XXX-b, etc.)
   - Dependencies (blocked by, blocks)
   - See references to other artifacts

4. **Detect task type** from priority section:
   - Priority 1 or 2 → `implementation` or `decision`
   - Priority 3 → `research`
   - Priority 4 → `review`

5. **Read referenced artifacts** if "See:" link exists
   - Load additional context from linked files

### Step 3: Determine Agent Strategy

Based on detected type, decide which specialized agent to call:

**Research Tasks** (P3):
- Call → `/paz:research:task` agent
- Pass: task context, research questions
- Receive: findings, recommendations

**Decision Tasks** (e.g., T-001 storage decision):
- Call → `/paz:decide:technical` agent
- Pass: decision context, options, criteria
- Receive: structured comparison, recommendation

**Implementation Tasks** (P1/P2):
- No additional agent needed
- Use template to structure implementation plan

**Review Tasks** (P4):
- No additional agent needed
- Use template to structure review checklist

### Step 4: Call Specialized Agent (if needed)

**For Research Tasks**:
```
/paz:research:task with context:
- Research questions from task
- Why it matters
- Suggested approach
- Return findings to be included in issue
```

**For Decision Tasks**:
```
/paz:decide:technical with context:
- Decision question
- Options listed in task
- Evaluation criteria
- Return comparison matrix and recommendation
```

### Step 5: Create Issue File

1. **Create directory** if not exists: `{BREAKDOWN_DIR}/issues/`

2. **Generate filename**: `T-{id}-{slug}.md`
   - Example: `T-001-storage-decision.md`
   - Slug from task title (lowercase, hyphens)

3. **Load appropriate template**:
   - Research → `.claude/templates/paz/issue/research.md`
   - Decision → `.claude/templates/paz/issue/decision.md`
   - Implementation → `.claude/templates/paz/issue/implementation.md`
   - Review → `.claude/templates/paz/issue/review.md`

4. **Populate template** with:
   - Extracted task context
   - Results from specialized agent (if called)
   - Cross-references to breakdown artifacts
   - GitHub-ready format

5. **Write file**: `{BREAKDOWN_DIR}/issues/T-{id}-{slug}.md`

### Step 6: Track State

1. **Create/Update** `{BREAKDOWN_DIR}/.state/task-updates.json`
2. **Log** issue creation:
```json
{
  "T-{id}": {
    "status": "in_progress",
    "issue_file": "issues/T-{id}-{slug}.md",
    "created_date": "2025-10-01",
    "type": "research|decision|implementation|review",
    "parent_task": null,
    "blocks": ["T-XXX", "T-YYY"]
  }
}
```

### Step 7: Report

Output to user:
```markdown
✅ Created issue file: {BREAKDOWN_DIR}/issues/T-{id}-{slug}.md

**Task**: {Title}
**Type**: {research|decision|implementation|review}
**Status**: In Progress
**Blocks**: {count} other tasks

## Next Steps

1. Open the issue file to see full context and research/decision framework
2. Work through the issue following the structure
3. Update the issue file with findings/decisions/progress
4. When complete, run `/paz:plan:sync` to update parent breakdown

## View Issue
```bash
cat {BREAKDOWN_DIR}/issues/T-{id}-{slug}.md
```

## Quick Links
- Parent task: [99-next-steps.md](../99-next-steps.md#{TASK_ID})
- Breakdown index: [00-index.md](../00-index.md)
```

---

## Agent Composition

This agent acts as an **orchestrator** that calls specialized agents:

- **Input**: Task ID from breakdown
- **Processing**: Detects type → Calls specialized agent
- **Output**: Self-contained issue file

### Agents Called

1. **`/paz:research:task`** - For P3 research tasks
   - Performs web search, reads docs, gathers info
   - Returns structured findings
   - Does NOT write files (returns data to issue agent)

2. **`/paz:decide:technical`** - For decision tasks
   - Analyzes options
   - Creates comparison matrix
   - Returns recommendation with rationale
   - Does NOT write files (returns data to issue agent)

3. **No agent called** - For implementation/review tasks
   - Just uses templates to structure the work
   - Includes context extraction and cross-references

---

## Example Usage

### Create issue for research task
```bash
/paz:plan:issue T-016
# Detects: Research task (NaturalLanguage framework)
# Calls: /paz:research:task to gather Apple docs info
# Creates: issues/T-016-naturallanguage-research.md
# Includes: Research findings + recommendations
```

### Create issue for decision task
```bash
/paz:plan:issue T-001
# Detects: Decision task (SwiftData vs CoreData)
# Calls: /paz:decide:technical with options
# Creates: issues/T-001-storage-decision.md
# Includes: Comparison matrix + recommendation
```

### Create issue for implementation task
```bash
/paz:plan:issue T-026
# Detects: Implementation task (Implement models)
# No agent called (just template)
# Creates: issues/T-026-implement-stage1-models.md
# Includes: Requirements + checklist + testing plan
```

---

## Design Principles

1. **Lazy Creation**: Only create issue files when explicitly requested
2. **Single Responsibility**: This agent orchestrates, doesn't do research/decisions itself
3. **Agent Composition**: Calls specialized agents based on task type
4. **Self-Contained**: Each issue file has all context needed to work independently
5. **Traceable**: Links back to parent breakdown + tracks state changes
6. **GitHub Ready**: Format suitable for copying to GitHub issues

---

## State Management

Issues are tracked in `.state/task-updates.json`:
- Created date
- Current status
- Type (research/decision/implementation/review)
- Dependencies (blocks what)
- Outcome summary (when completed)

This allows `/paz:plan:sync` to:
- Update parent `99-next-steps.md` with completion status
- Mark dependent tasks as unblocked
- Track cascading changes from decisions

---

## Notes

- One issue file per task (lazy creation)
- Issue files can be edited manually
- Running `/paz:plan:issue T-XXX` again will NOT overwrite (protection)
- To regenerate, must delete existing file first
- State tracking enables feedback loop to parent breakdown
