# V4 GitHub Setup Guide

**For:** Joe Bouchard
**Purpose:** Set up GitHub repos and project management for V4 development
**Date:** November 26, 2025

---

## Overview

We're using GitHub for everything — code, docs, and project management. No Linear, no separate tools. One place for everything.

### Repository Structure

| Repo | Purpose | Owner |
|------|---------|-------|
| `j-bouchard/ai-fundraising-v2` | Your knowledge base, discovery templates, fundraising docs | Joe |
| `j-bouchard/fundraising-assistant` | Implementation code — orchestrator, agents, MCP | Joe (Paz develops) |

**Why two repos?**
- Clean separation: your content vs Paz's code
- You can add/edit docs freely without worrying about breaking code
- Different work cadences — you add docs anytime, Paz does structured dev sprints

---

## Step 1: Create the Implementation Repo

### 1.1 Create New Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `fundraising-assistant`
   - **Description:** `AI fundraising assistant — agents, orchestration, MCP integration`
   - **Visibility:** Private (for now)
   - **Initialize with:** Check "Add a README file"
   - **Add .gitignore:** Select `Python`
   - **License:** None (can add later)
3. Click **Create repository**

### 1.2 Add Paz as Collaborator

1. Go to your new repo: `https://github.com/j-bouchard/fundraising-assistant`
2. Click **Settings** (tab at top)
3. Click **Collaborators** (left sidebar)
4. Click **Add people**
5. Search for `mpazaryna`
6. Select and click **Add mpazaryna to this repository**
7. Choose role: **Write** (allows push, pull, manage issues)

Paz will get an email invitation to accept.

---

## Step 2: Set Up GitHub Project Board

GitHub Projects is our task tracking — like a Kanban board.

### 2.1 Create the Project

1. Go to `https://github.com/j-bouchard/fundraising-assistant`
2. Click **Projects** tab
3. Click **Link a project** → **New project**
4. Select **Board** (Kanban view)
5. Name it: `V4 Development`
6. Click **Create**

### 2.2 Configure Columns

Default columns are fine, but rename them:

| Default | Rename to |
|---------|-----------|
| Todo | Backlog |
| In Progress | In Progress |
| Done | Done |

Add one more column:
- Click **+ Add column** → name it **Blocked**

Final board:
```
| Backlog | In Progress | Blocked | Done |
```

---

## Step 3: Create Milestones

Milestones group issues by phase. We have 5 milestones matching the roadmap.

### 3.1 Create Each Milestone

1. Go to **Issues** tab
2. Click **Milestones**
3. Click **New milestone**
4. Create each:

| Milestone | Title | Description |
|-----------|-------|-------------|
| 1 | Milestone 1: Intelligence Foundation + Orchestrator (25 hrs) | Orchestrator adaptation, knowledge base integration, begin Discovery Agent |
| 2 | Milestone 2: Semantic Layer & Documents (25 hrs) | Complete Discovery Agent, semantic layer, document upload (PDF + CSV) |
| 3 | Milestone 3: Core Agents & Commands (25 hrs) | Data Analysis Agent, confirmation layer, core commands |
| 4 | Milestone 4: Additional Agents & Testing (25 hrs) | P2 agents, sandbox testing, error handling |
| 5 | Milestone 5: Polish & Launch Prep (20 hrs + buffer) | Multi-tenant, launch prep, buffer for unknowns |

Leave due dates blank (we track in hours, not dates).

---

## Step 4: Create Labels

Labels help categorize issues.

### 4.1 Go to Labels

1. **Issues** tab → **Labels**
2. Delete default labels (or keep if useful)
3. Create new labels:

| Label | Color | Description |
|-------|-------|-------------|
| `P0` | Red (#d73a4a) | Must have — critical path |
| `P1` | Orange (#f9a825) | Should have — high value |
| `P2` | Yellow (#fbca04) | Nice to have — cut if needed |
| `P3` | Gray (#bfdadc) | Defer to future |
| `paz-dev` | Blue (#0366d6) | Paz's development work |
| `joe-content` | Green (#0e8a16) | Joe's content/docs work |
| `blocked` | Black (#000000) | Waiting on something |
| `bug` | Red (#d73a4a) | Something broken |
| `question` | Purple (#d876e3) | Needs discussion |

---

## Step 5: Create Initial Issues

Here's the initial issue structure. Paz will create these, but here's what to expect.

### Epic Issues (One per Milestone)

Each milestone gets a "tracking" issue that links to child tasks:

```
Issue: [M1] Intelligence Foundation + Orchestrator
Labels: P0, paz-dev
Milestone: Milestone 1

## Tasks
- [ ] Adapt orchestrator for fundraising context
- [ ] Set up development environment
- [ ] Integrate knowledge base retrieval
- [ ] Begin Discovery Agent (blocked on Joe's templates)

## Dependencies
- Joe: Discovery template examples needed before Discovery Agent work
```

### Joe's Content Issues

```
Issue: [JOE] Discovery Templates
Labels: P0, joe-content
Milestone: Milestone 1

Joe to provide:
- [ ] Example discovery document from past client engagement
- [ ] NPSP schema patterns / common configurations
- [ ] Nonprofit Cloud schema patterns
- [ ] Common custom fields you see across orgs

These templates will guide the Discovery Agent implementation.
```

```
Issue: [JOE] Fundraising Knowledge Base Documents
Labels: P1, joe-content
Milestone: Milestone 1

Joe to provide (incrementally):
- [ ] Donor lifecycle management
- [ ] Major gift strategies
- [ ] Annual fund best practices
- [ ] Moves management methodology
- [ ] Stewardship practices
- [ ] Donor segmentation strategies

Format: Markdown files in ai-fundraising-v2 repo
```

---

## Step 6: Workflow — How We Work Together

### Daily/Weekly Flow

1. **Check the board:** https://github.com/j-bouchard/fundraising-assistant/projects
2. **See what's in progress** — that's what Paz is working on
3. **See what's blocked** — usually waiting on content from you
4. **Add comments** to issues if you have questions or updates

### When Joe Completes Content

1. Push your docs to `ai-fundraising-v2` repo
2. Comment on the relevant issue: "Done — see [link to file]"
3. Paz will pull it into the implementation

### When Paz Completes a Task

1. Paz moves issue to **Done**
2. Paz comments with what was delivered
3. If it needs Joe's review, Paz tags you (`@j-bouchard`)

### Communication

- **Questions about a specific task:** Comment on that issue
- **General questions:** Create a new issue with `question` label
- **Urgent:** Slack/text (outside GitHub)

---

## Step 7: Your Existing Repo (ai-fundraising-v2)

Keep using `ai-fundraising-v2` for your docs. Suggested structure:

```
ai-fundraising-v2/
├── knowledge-base/
│   ├── fundraising/
│   │   ├── donor-lifecycle.md
│   │   ├── major-gifts.md
│   │   ├── annual-fund.md
│   │   ├── moves-management.md
│   │   └── stewardship.md
│   └── discovery/
│       ├── template-npsp.md
│       ├── template-nonprofit-cloud.md
│       └── common-custom-fields.md
├── docs/
│   ├── product-roadmap-v4.md
│   ├── v4-risk.md
│   └── v4-github-guide.md (this file)
└── README.md
```

When you add a file:
1. Create/edit the file
2. Commit with a message like "Add major gifts knowledge base doc"
3. Push to main

Paz will reference these files from the implementation repo.

---

## Quick Reference

| What | Where |
|------|-------|
| Implementation code | `j-bouchard/fundraising-assistant` |
| Knowledge base / docs | `j-bouchard/ai-fundraising-v2` |
| Project board | `github.com/j-bouchard/fundraising-assistant/projects` |
| Issues | `github.com/j-bouchard/fundraising-assistant/issues` |
| Milestones | `github.com/j-bouchard/fundraising-assistant/milestones` |

---

## Checklist for Joe

- [ ] Create `fundraising-assistant` repo (Step 1.1)
- [ ] Add Paz (`mpazaryna`) as collaborator (Step 1.2)
- [ ] Create project board `V4 Development` (Step 2)
- [ ] Create 5 milestones (Step 3)
- [ ] Create labels (Step 4)
- [ ] Organize `ai-fundraising-v2` folder structure (Step 7)
- [ ] Start working on discovery templates (Priority!)

---

## Questions?

Create an issue in `fundraising-assistant` with the `question` label, or reach out directly.

---

**Document Version:** 1.0
**Created:** November 26, 2025
