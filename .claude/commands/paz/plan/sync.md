---
name: Sync Breakdown with Issues
allowed-tools: Bash, Read, Write, Edit, Glob
description: Read completed issue files and sync changes back to parent breakdown
---

# Sync Agent

Reads issue files (`issues/*.md`) and syncs their status back to the parent breakdown files (`99-next-steps.md`, etc.). Updates state tracking and identifies newly unblocked tasks.

## Variables

BREAKDOWN_DIR: (optional - defaults to most recent breakdown or prompts user)
DRY_RUN: (optional - if true, shows what would change without modifying files)

## Workflow

### Step 1: Validate Environment

If no `BREAKDOWN_DIR` provided:
1. Look for most recent breakdown in `plans/breakdown/*/`
2. If multiple exist, ask user to specify
3. If none exist, error and tell user to run `/paz:plan:breakdown` first

Verify required files exist:
- `{BREAKDOWN_DIR}/99-next-steps.md`
- `{BREAKDOWN_DIR}/.state/task-updates.json`
- `{BREAKDOWN_DIR}/issues/` directory

### Step 2: Load Current State

**Read state file**: `{BREAKDOWN_DIR}/.state/task-updates.json`
- Get last sync timestamp
- Get current task statuses
- Get previous change log

**Read parent breakdown**: `{BREAKDOWN_DIR}/99-next-steps.md`
- Parse all tasks (T-001 through T-XXX)
- Identify current status of each task (checkbox state)
- Map task dependencies (what blocks what)

### Step 3: Scan Issue Files

**Find all issue files**: `{BREAKDOWN_DIR}/issues/*.md`

For each issue file:
1. **Extract task ID** from filename (e.g., `T-001-storage-decision.md` → T-001)
2. **Read issue file** content
3. **Parse status indicators**:
   - Status field: 🔄 In Progress | ✅ Complete | ⚠️ Blocked | 📋 Pending
   - Completion date (if status = complete)
   - Outcome/decision (if applicable)
4. **Identify changes**:
   - Compare status in issue vs state file
   - Note any status transitions (in_progress → completed)
5. **Extract metadata**:
   - Unblocked tasks (from "Tasks Unblocked" section)
   - Updated files (from "Files to Update" section)
   - New tasks discovered (from "New Tasks Created" section)

### Step 4: Detect Changes

**Compare issue status vs state file**:

For each task with an issue file:
- **Status changed?** (e.g., in_progress → completed)
- **New completion date?**
- **New outcome/decision documented?**
- **Files marked for update?**

**Build change list**:
```javascript
{
  "T-001": {
    "old_status": "in_progress",
    "new_status": "completed",
    "changes": ["Status: completed", "Decision: SwiftData", "Unblocks: 25 tasks"],
    "affects": ["99-next-steps.md", "05-architecture-decisions.md"]
  }
}
```

### Step 5: Identify Cascading Effects

For each completed task:

**Find unblocked tasks**:
- Read "Tasks Unblocked" section from issue
- Cross-reference with dependency map from parent breakdown
- List tasks that can now start

**Example**:
```
T-001 completed → unblocks T-006, T-007, T-008...T-038
```

**Find affected artifacts**:
- Data model specs might need updates
- Architecture decisions need ADR added
- Phase plans might need status changes

### Step 6: Update Parent Breakdown

**Update `99-next-steps.md`**:

For each completed task:
1. **Find task section** in file (search for task ID)
2. **Mark checkboxes** as complete:
   ```markdown
   - [x] T-001: Research SwiftData capabilities
   - [x] T-002: Compare performance characteristics
   ```
3. **Add completion note** (optional):
   ```markdown
   ### Task 1.1: Storage Decision ✅
   **Completed**: 2025-10-01
   **Decision**: SwiftData selected (see issues/T-001-storage-decision.md)
   ```

For unblocked tasks:
1. **Update status** from "blocked by" to "ready to start"
2. **Add note** indicating what unblocked them

### Step 7: Update Other Artifacts

Based on "Files to Update" from issues:

**Architecture Decisions** (`05-architecture-decisions.md`):
- Add ADRs from decision issues
- Update open questions when resolved

**Data Models** (`01-data-models.md`):
- Update implementation status
- Mark models as complete

**Phase Plans** (`02-phase-overview.md`):
- Update phase completion percentage
- Mark milestones achieved

### Step 8: Update State File

**Update `.state/task-updates.json`**:

```json
{
  "last_sync": "{NEW_TIMESTAMP}",
  "tasks": {
    "T-001": {
      "status": "completed",
      "completed_date": "2025-10-01",
      "outcome": "SwiftData selected",
      "unblocked_tasks": ["T-006", "T-007", ...]
    },
    ...
  },
  "changes": [
    {
      "date": "2025-10-01",
      "task": "T-001",
      "change": "Completed: SwiftData decision",
      "cascading_effects": "25 tasks unblocked"
    },
    ...
  ],
  "statistics": {
    "completed": 1,
    "in_progress": 3,
    "blocked": 21,
    "pending": 75
  }
}
```

### Step 9: Generate Sync Report

Create summary of changes:

```markdown
# Sync Report: {BREAKDOWN_NAME}

**Sync Date**: {TIMESTAMP}
**Last Sync**: {PREVIOUS_TIMESTAMP}

## Tasks Updated

### Completed Tasks
- **T-001**: Storage Decision ✅
  - Decision: SwiftData selected
  - Unblocked: 25 tasks
  - Updated: 99-next-steps.md, 05-architecture-decisions.md

### Status Changes
- T-016: pending → in_progress
- T-026: blocked → ready (unblocked by T-001)

### Newly Unblocked Tasks
Tasks now ready to start:
- T-006: Design Stage 1 models
- T-011: Design Stage 2 models
- T-026: Implement Stage 1 models
- ... (22 more)

## Files Updated
- [x] 99-next-steps.md (1 task marked complete, 25 tasks unblocked)
- [x] .state/task-updates.json (state synced)
- [ ] 05-architecture-decisions.md (needs ADR-001 added manually)
- [ ] 01-data-models.md (update with SwiftData syntax)

## Statistics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Completed | 0 | 1 | +1 |
| In Progress | 1 | 3 | +2 |
| Blocked | 25 | 21 | -4 |
| Ready to Start | 0 | 25 | +25 |
| Total | 100 | 100 | 0 |

**Completion**: 1% → 1% (25% unblocked)

## Recommended Next Steps

Based on newly unblocked work:
1. Start T-006: Design Stage 1 models (now unblocked)
2. Start T-011: Design Stage 2 models (now unblocked)
3. Complete architecture artifacts:
   - Add ADR-001 to 05-architecture-decisions.md
   - Update 01-data-models.md with SwiftData syntax

## Detected Issues

- [ ] **Manual update needed**: ADR-001 should be added to architecture decisions
- [ ] **Manual update needed**: Model specs need SwiftData syntax

## Next Sync Recommended

After completing current in-progress tasks: T-016, T-026, T-033
```

### Step 10: Report to User

Display sync report with:
- Summary of changes
- Tasks completed since last sync
- Tasks newly unblocked
- Files that were updated
- Files that need manual updates
- Recommended next steps

---

## Sync Modes

### Full Sync (default)
- Reads all issue files
- Updates all affected breakdown files
- Updates state tracking
- Generates full report

### Dry Run Mode
- Shows what would change
- Doesn't modify any files
- Useful for preview before committing

### Single Task Sync
- Syncs only one task's issue file
- Faster for incremental updates
- Updates only affected sections

---

## Conflict Resolution

### Issue File vs Breakdown Conflicts

**Scenario 1**: Task marked complete in issue, but still in_progress in breakdown
- **Resolution**: Issue file wins (user worked on it more recently)
- **Action**: Update breakdown to match issue

**Scenario 2**: Task status manually changed in breakdown after issue created
- **Resolution**: Warn user, ask which to keep
- **Action**: Don't auto-overwrite manual changes

**Scenario 3**: Dependencies changed in breakdown after issue created
- **Resolution**: Update issue file with new dependencies
- **Action**: Add note in issue about dependency change

### Manual Override

If user manually edited breakdown:
- Detect manual changes (compare timestamps)
- Prompt before overwriting
- Option to merge or skip

---

## State Tracking Schema

**`.state/task-updates.json`**:

```json
{
  "version": "1.0.0",
  "last_sync": "2025-10-01T14:30:00Z",
  "breakdown_source": "plans/THRIVE-TECHNICAL.md",
  "breakdown_generated": "2025-10-01T10:00:00Z",

  "tasks": {
    "T-{id}": {
      "status": "completed|in_progress|blocked|pending",
      "type": "research|decision|implementation|review",
      "title": "Task title",
      "priority": "P1|P2|P3|P4",
      "issue_file": "issues/T-{id}-slug.md",
      "created_date": "2025-10-01",
      "started_date": "2025-10-01",
      "completed_date": "2025-10-01",
      "outcome": "Brief outcome/decision",
      "blocks": ["T-XXX", "T-YYY"],
      "blocked_by": ["T-AAA"],
      "updated_files": ["file1.md", "file2.md"],
      "notes": "Additional context"
    }
  },

  "changes": [
    {
      "date": "2025-10-01T14:30:00Z",
      "task": "T-001",
      "type": "status_change",
      "old_value": "in_progress",
      "new_value": "completed",
      "change": "SwiftData decision made",
      "cascading_effects": "25 tasks unblocked",
      "user": "manual|sync_agent"
    }
  ],

  "statistics": {
    "total_tasks": 100,
    "by_status": {
      "completed": 1,
      "in_progress": 3,
      "blocked": 21,
      "pending": 75
    },
    "by_priority": {
      "P1": 25,
      "P2": 35,
      "P3": 20,
      "P4": 20
    },
    "by_type": {
      "research": 20,
      "decision": 10,
      "implementation": 60,
      "review": 10
    },
    "completion_percentage": 1,
    "velocity": {
      "tasks_per_week": 0.5,
      "estimated_completion": "2025-12-31"
    }
  },

  "next_sync_recommended": "2025-10-08T14:30:00Z"
}
```

---

## Example Usage

### Basic sync
```bash
/paz:plan:sync
# Syncs all changes from issues/ back to parent breakdown
```

### Dry run (preview changes)
```bash
/paz:plan:sync --dry-run
# Shows what would change without modifying files
```

### Specify breakdown
```bash
/paz:plan:sync plans/breakdown/thrive-technical
# Syncs specific breakdown directory
```

---

## Design Principles

1. **Single Responsibility**: Only syncs state, doesn't create new content
2. **Non-Destructive**: Warns before overwriting manual changes
3. **Traceable**: Logs all changes in state file
4. **Idempotent**: Can run multiple times safely
5. **Informative**: Provides clear report of what changed

---

## Integration with Workflow

```
[Create Breakdown]
    ↓
/paz:plan:breakdown → 99-next-steps.md (100 tasks)
    ↓
[Work on Task]
    ↓
/paz:plan:issue T-001 → issues/T-001-storage-decision.md
    ↓
[Complete Work, Update Issue]
    ↓
Mark status: ✅ Complete in issue file
    ↓
[Sync Changes Back]
    ↓
/paz:plan:sync → Updates 99-next-steps.md
             → Marks T-001 [x] complete
             → Unblocks 25 dependent tasks
             → Updates statistics
    ↓
[Continue with Next Task]
    ↓
/paz:plan:issue T-006 (now unblocked)
```

---

## Notes

- Sync reads issue files as source of truth for task status
- Parent breakdown updated to reflect issue completions
- State file tracks all changes over time
- Sync is safe to run multiple times (idempotent)
- Dry run mode useful for previewing changes
- Manual edits in breakdown are detected and protected
