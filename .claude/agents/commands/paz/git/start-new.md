Create a new feature branch from main and ensure safe development practices. Required branch name: $ARGUMENTS

Follow these steps:
1. Check current git status and warn if there are uncommitted changes
2. Ensure we're not already on main branch (if we are, that's fine, we'll create from main)
3. Switch to main branch: `git checkout main`
4. Pull latest changes: `git pull origin main`
5. If no branch name provided in $ARGUMENTS, suggest branch name based on:
   - Current date (format: YYYY-MM-DD)
   - Common prefixes: feature/, fix/, chore/, docs/
   - Ask me to confirm or specify different branch name
6. Use provided branch name from $ARGUMENTS or the confirmed suggested name
7. Create and switch to new branch: `git checkout -b [BRANCH_NAME]`
8. Show current branch status: `git branch --show-current`
9. Show git status to confirm clean working directory
10. Remind about best practices:
    - Keep commits small and focused
    - Use conventional commit messages (feat:, fix:, chore:, docs:)
    - Regularly push to remote with: `git push -u origin [BRANCH_NAME]`
    - Use `/release-version` command when ready to merge to main

Safety checks:
- Warn if already on a feature branch and ask for confirmation
- Warn if uncommitted changes exist and suggest stashing or committing first
- Prevent accidental work directly on main branch
- Ensure main is up to date before branching