# Sync dev-plan.md with GitHub Milestones

Query GitHub Milestones API and update dev-plan.md with velocity metrics.

## Task

1. **Query GitHub API:**
   ```bash
   gh api repos/mpazaryna/chiro/milestones --jq '.[] | {number, title, open_issues, closed_issues, state, html_url}'
   ```

2. **Update dev-plan.md with velocity-focused table:**
   ```markdown
   | Phase | Open | Closed | % | Link |
   |-------|------|--------|---|------|
   | Phase 1: Core Foundation | 7 | 1 | 12.5% | [→](https://github.com/mpazaryna/chiro/milestone/1) |
   | Phase 2: Clinical Intelligence | 2 | 1 | 33.3% | [→](https://github.com/mpazaryna/chiro/milestone/2) |
   | Phase 3: Practice Management | 3 | 0 | 0% | [→](https://github.com/mpazaryna/chiro/milestone/3) |
   | Phase 4: Specialty Expansion | 6 | 0 | 0% | [→](https://github.com/mpazaryna/chiro/milestone/4) |
   | Phase 5: Advanced Features | 6 | 0 | 0% | [→](https://github.com/mpazaryna/chiro/milestone/5) |
   ```

3. **Update overall velocity:**
   ```markdown
   **Overall:** 2 closed, 24 open (7.7% velocity)
   ```

4. **Update "Last Updated":**
   ```markdown
   **Last Updated:** 2025-10-10
   ```
   Use today's date from <env>.

5. **Report concisely:**
   ```
   Synced with GitHub Milestones

   Velocity: 2 closed, 24 open (7.7%)
   Phase 1: 7 open, 1 closed
   Phase 2: 2 open, 1 closed
   Phase 3-5: No closed issues yet
   ```

## Note

Focus on **open vs closed** (velocity), not timelines. This reflects actual progress for agentic/solo dev work.
