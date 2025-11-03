---
name: Propose Next Step
allowed-tools: Bash, Read, Write, SlashCommand
description: Read next steps from breakdown and propose what to work on next, then create issue
---

# Next Step Agent

Analyzes `99-next-steps.md` to identify the most logical next task, proposes it to the user, and upon agreement automatically creates a detailed issue file via `/paz:plan:issue`.

## Variables

BREAKDOWN_DIR: (optional - defaults to most recent breakdown or prompts user)
AUTO_APPROVE: (optional - if true, skips approval and proceeds directly to issue creation)

## Workflow

### Step 1: Locate Breakdown

If no `BREAKDOWN_DIR` provided:
1. Look for most recent breakdown in `plans/breakdown/*/`
2. If multiple exist, list them and ask user to specify
3. If none exist, error and tell user to run `/paz:plan:breakdown` first

Verify required file exists:
- `{BREAKDOWN_DIR}/99-next-steps.md`

### Step 2: Load Task State

**Read next steps file**: `{BREAKDOWN_DIR}/99-next-steps.md`

**Parse task structure**:
- Identify all priority sections (P1, P2, P3, P4)
- Extract task details: ID, title, status, dependencies, effort
- Identify completed tasks (marked with ✅)
- Identify blocked tasks (with "Dependencies:" or "Blocked by:")
- Identify in-progress tasks (marked with 🔄)
- Identify ready-to-start tasks (no blockers, not started)

**Optional: Load state tracking** if exists:
- `{BREAKDOWN_DIR}/.state/task-updates.json`
- Get current task statuses
- Get task history

### Step 3: Analyze Next Best Task

Apply decision logic to find the best next task:

**Priority 1: Continue in-progress work**
- If any task is 🔄 In Progress → recommend completing it first
- Rationale: "Finish what you started before starting new work"

**Priority 2: Unblocked P1 tasks**
- Find P1 tasks that are:
  - Not completed (no ✅)
  - Not blocked (no unmet dependencies)
  - Not in progress
- Sort by:
  - Effort (small tasks first for quick wins)
  - Dependencies (tasks that unblock others get priority)
  - Sequential order in document

**Priority 3: Recently unblocked tasks**
- Check if any tasks were recently unblocked (see completion notes)
- Example: "T-001 completed → unblocks T-006, T-011, T-026..."
- Recommend first unblocked task

**Priority 4: P2 tasks if P1 exhausted**
- If all P1 tasks complete or blocked, move to P2
- Apply same logic as P1

**Priority 5: Research/Review tasks (P3/P4)**
- If waiting on implementation, suggest research tasks
- Parallel workstreams: research while implementing

### Step 4: Extract Task Context

For the selected task, extract:

**Basic Info**:
- Task ID (e.g., T-006)
- Title
- Priority level
- Effort estimate
- Status

**Context**:
- Why (rationale for task)
- What (description of work)
- Done when (acceptance criteria)
- See references (linked artifacts)

**Dependencies**:
- Blocked by (if any - should be none if recommended)
- Blocks (tasks this will unblock)

**Subtasks**:
- All checkbox items under this task
- Gives sense of scope

### Step 5: Generate Proposal

Create a human-friendly proposal:

```markdown
## 🎯 Recommended Next Step

**Task**: T-{id} - {Title}

**Why this task?**
- {Reason this is the logical next step}
- {What it unblocks or enables}
- {Strategic value}

**What you'll do**:
{Description from task}

**Effort**: {small|medium|large} ({estimated hours})

**Acceptance Criteria**:
- {Done when conditions}
- {Success measures}

**This task will unblock**:
{count} dependent tasks: {list task IDs}

**Subtasks**:
- [ ] {subtask 1}
- [ ] {subtask 2}
...

**Related Context**:
- See: {linked artifact files}
- Status: {current completion % of this priority tier}

---

**Ready to start?**
If you agree, I'll create a detailed issue file for T-{id} using `/paz:plan:issue`.

Type 'yes' to proceed or suggest a different task ID.
```

### Step 6: Wait for User Response

**If AUTO_APPROVE=true**:
- Skip to Step 7 immediately

**Otherwise**:
- Display proposal
- Wait for user input
- Accept responses:
  - "yes" / "y" / "ok" / "proceed" → go to Step 7
  - "no" / "different" → ask "Which task ID would you like instead?"
  - "T-XXX" (task ID) → validate it exists, go to Step 7 with that task
  - "skip" / "later" → exit gracefully

### Step 7: Create Issue File

**Call the issue agent**:
```
/paz:plan:issue {TASK_ID}
```

This will:
- Extract full task context
- Call specialized agents if needed (research/decision)
- Create issue file in `{BREAKDOWN_DIR}/issues/`
- Update state tracking

**Report completion**:
```markdown
✅ Created issue file for T-{id}

**Next Steps**:
1. Open `{BREAKDOWN_DIR}/issues/T-{id}-{slug}.md`
2. Follow the structured plan in the issue
3. Update the issue as you make progress
4. When complete, run `/paz:plan:sync` to update parent breakdown

**Start working**:
cat {BREAKDOWN_DIR}/issues/T-{id}-{slug}.md
```

---

## Decision Logic Examples

### Example 1: Fresh start (no tasks in progress)

**Input**: 99-next-steps.md with T-001 completed, T-006 newly unblocked

**Analysis**:
- P1 has 4 tasks, 1 completed (T-001)
- T-006 ready to start (was blocked by T-001, now unblocked)
- Effort: medium (4-8 hours)
- Unblocks: T-026 (implementation task)

**Recommendation**: T-006 (Design Stage 1 models)

**Rationale**:
- Recently unblocked by T-001 completion
- Design work enables implementation
- Medium effort, clear scope
- Unblocks downstream implementation

---

### Example 2: Task in progress

**Input**: 99-next-steps.md with T-016 marked 🔄 In Progress

**Analysis**:
- T-016 NaturalLanguage research already started
- 60% complete based on subtasks

**Recommendation**: T-016 (continue)

**Rationale**:
- Finish in-progress work before starting new tasks
- Already invested time, close to completion
- Context switching wastes effort

---

### Example 3: All P1 blocked or complete

**Input**: All P1 tasks done or blocked

**Analysis**:
- P1: 100% complete or blocked
- P2: T-026 ready (depends on completed T-001 + T-006)
- Effort: medium (6-10 hours)

**Recommendation**: T-026 (Implement Stage 1 models)

**Rationale**:
- Move to P2 since P1 exhausted
- Implementation ready (design complete)
- Clear deliverable

---

## Alternative Modes

### Quick Mode
```bash
/paz:plan:next-step --quick
# Shows just task ID and title, skips proposal
# Auto-creates issue if only one obvious choice
```

### List Mode
```bash
/paz:plan:next-step --list
# Shows top 5 recommended tasks ranked
# User picks by number
```

### Research Mode
```bash
/paz:plan:next-step --research
# Recommends research tasks specifically
# Good for parallel work while implementation blocked
```

---

## Integration with Development Workflow

**Daily workflow**:
```bash
# Morning: What should I work on?
/paz:plan:next-step

# Agent recommends T-016 (research task)
# You: "yes"

# Agent creates issues/T-016-naturallanguage-research.md
# You work on it, update issue with findings

# End of day: Sync progress
/paz:plan:sync

# Next day: repeat
/paz:plan:next-step
# Agent sees T-016 complete, recommends T-026
```

---

## Design Principles

1. **Smart Recommendations**: Uses context to pick best next task
2. **Human in the Loop**: Proposes, doesn't dictate
3. **Automatic Follow-through**: Creates issue on approval
4. **Transparent Logic**: Explains why task was recommended
5. **Flexible**: User can override recommendation
6. **Workflow Integration**: Bridges planning → execution

---

## State Awareness

This agent is stateful:
- Remembers completed tasks
- Tracks blocked vs ready tasks
- Identifies recently unblocked work
- Considers in-progress tasks
- Recommends based on strategic dependencies

This creates an **intelligent task queue** that adapts as work progresses.

---

## Notes

- Reads `99-next-steps.md` as source of truth
- Uses checkboxes and status markers (✅ 🔄 🔓 ⚠️)
- Calls `/paz:plan:issue` to create detailed issue
- Does NOT modify any files (read-only until issue creation)
- Safe to run multiple times (shows current recommendation)
- Recommendation logic prioritizes: finish → unblock → quick wins → strategic
