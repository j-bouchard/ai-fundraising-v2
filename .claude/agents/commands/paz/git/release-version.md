Create a release with version tag, changelog update, and push to main. Optional version: $ARGUMENTS

Follow these steps:
1. Check git status to ensure working directory is clean
2. Get the latest tag: `git describe --tags --abbrev=0 2>/dev/null || echo "No tags found"`
3. Show current git log since last tag to understand recent changes
4. If no version provided in $ARGUMENTS, suggest next version based on:
   - Current latest tag (increment patch version)
   - Type of changes (major/minor/patch based on commit messages)
   - Ask me to confirm or specify different version
5. Use provided version from $ARGUMENTS or the confirmed suggested version
6. Create/update CHANGELOG.md with the new version and changes since last tag
7. Show me the changelog entries and ask for confirmation
8. Stage all changes: `git add .`
9. Create commit with message: "chore: release version [VERSION]"
10. Create annotated git tag: `git tag -a v[VERSION] -m "Release version [VERSION]"`
11. Push to main: `git push origin main`
12. Push the tag: `git push origin v[VERSION]`
13. Show final status and confirm release is complete