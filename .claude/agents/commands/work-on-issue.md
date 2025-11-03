# Work on GitHub Issue

Read GitHub issue {{arg1}}, analyze requirements, create implementation plan, and execute the work.

## Workflow

1. **Read the issue:**
   - Use `gh issue view {{arg1}}` to get full details
   - Read any linked parent issues for context
   - Check for sub-issues or dependencies

2. **Analyze requirements:**
   - What is the acceptance criteria?
   - What files need to be modified?
   - Are there architectural constraints?

3. **Create implementation plan:**
   - Use TodoWrite to create task list
   - Break down into concrete steps
   - Identify potential blockers

4. **Execute the work:**
   - Implement feature step by step
   - Test as you go
   - Follow architectural patterns in CLAUDE.md

5. **Update the issue:**
   - Comment with progress and results
   - Link to commits/PRs when done
   - Update labels if appropriate

## Example Usage

```
/work-on-issue 27
```

This will read issue #27, create a plan, and start implementation.

## Note for Agent

Read the issue FIRST before doing anything else. The issue contains all the requirements and context needed.
