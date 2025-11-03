# Work on Phase Milestone

Query GitHub milestone for phase {{arg1}}, show all issues in that milestone, and help user choose which to work on.

## Workflow

1. **Query the milestone:**
   ```bash
   gh api repos/mpazaryna/chiro/milestones/{{arg1}}
   ```

   This returns:
   - Milestone title
   - Progress (open_issues, closed_issues)
   - Due date

2. **List milestone issues:**
   ```bash
   gh issue list --milestone "Phase {{arg1}}: ..." --state open
   ```

   Shows all open issues in the milestone with:
   - Issue number
   - Title
   - Labels
   - Current state

3. **Let user choose:**
   - Present the issues to the user
   - Show which are open vs closed
   - Ask which one they want to work on

4. **Delegate to work-on-issue:**
   - Once user picks, use `/work-on-issue {number}` to start work

## Example Usage

```
/work-on-phase 1
```

This will:
1. Query Milestone 1 (Phase 1: Core Foundation)
2. List all issues: #1, #4, #13, #14, #15, #16, #17, #38
3. Show status (7 open, 1 closed)
4. Let you pick which to work on

## Phase to Milestone Mapping

- Phase 1: Milestone 1 - Core Foundation
- Phase 2: Milestone 2 - Clinical Intelligence
- Phase 3: Milestone 3 - Practice Management
- Phase 4: Milestone 4 - Specialty Expansion
- Phase 5: Milestone 5 - Advanced Features

## API Response Format

```json
{
  "number": 1,
  "title": "Phase 1: Core Foundation",
  "open_issues": 7,
  "closed_issues": 1,
  "due_on": "2025-03-31T00:00:00Z"
}
```

## Benefits Over Old Approach

**Before (parsing phase issues):**
- Had to parse issue #5-9 bodies
- Extract sub-issue links manually
- No progress tracking

**After (milestone API):**
- One command lists all milestone issues
- GitHub tracks progress automatically
- Built-in filtering by state
