# Generate Form 22-A Report

Create weekly business-focused progress summary for non-technical stakeholders (Form 22-A: Weekly Operational Progress Assessment).

## Task

1. **Get current week date range:**
   ```bash
   # Calculate week start (Monday) and end (Sunday)
   date +"%B %d, %Y"
   ```

2. **Query GitHub for recent closed issues:**
   ```bash
   gh issue list --state closed --limit 20 --json number,title,closedAt,labels,milestone --jq '.[] | select(.closedAt >= (now - 7*24*3600) | strftime("%Y-%m-%d")) | {number, title, milestone: .milestone.title, labels: [.labels[].name]}'
   ```

3. **Get milestone progress:**
   ```bash
   gh api repos/mpazaryna/chiro/milestones --jq '.[] | {title, open_issues, closed_issues}'
   ```

4. **Generate business-focused summary:**

   **Format:**
   ```markdown
   ## Week of [Start Date] - [End Date], 2025

   **Phase 1 Progress:** X% complete (Y/Z features) ⬆️ from A%

   ### ✅ What We Shipped This Week

   **[Feature Name]** ✨
   - [Business capability in plain English]
   - [Another capability]
   - **Impact:** [How this helps doctors/practice]

   **[Another Feature]** 📊
   - [Business capability]
   - **Impact:** [Business value]

   ### 📈 What This Means
   - [High-level summary of progress]
   - [Key milestone if applicable]
   - [Next major milestone]

   ---

   ```

5. **Prepend to FORM-22-A.md:**
   - Add new week at top
   - Keep last 6 weeks visible
   - Archive older entries

## Key Principles

**Language:**
- ❌ "SwiftData model with cascade delete"
- ✅ "Doctors can add notes to existing patient records"

**Focus:**
- ❌ Technical implementation details
- ✅ Business capabilities and impact

**Audience:**
- Non-technical partner
- Wants to know what's working now
- Cares about patient/doctor workflow improvements

## Output

Create concise business summary:
```
Generated Form 22-A for Week of Oct 7-10

Summary:
- 2 major features shipped
- Phase 1: 55.6% complete
- 4 features remaining until production

Added to: FORM-22-A.md
```

## Notes

- Translate technical terms to business language
- Focus on "what doctors can do now"
- Include specific impact statements
- Keep it brief (partner will skim, not read deeply)
- Emoji for visual scanning (✨ for new features, 📊 for analytics, etc.)
- **NEVER include timeline estimates** (Q1 2025, etc.) - use velocity metrics only (% complete, X/Y features, open/closed issues)
- **NEVER include "Remaining for Production" or future work** - Form 22-A reports ONLY accomplishments and current velocity. Future planning belongs in Form 22-C (unpublished).
