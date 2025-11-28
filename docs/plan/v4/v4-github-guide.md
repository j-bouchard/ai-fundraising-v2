# V4 GitHub Setup Guide

**For:** Joe Bouchard
**Purpose:** Set up GitHub repos for V4 development
**Date:** November 28, 2025

---

## Overview

We're using GitHub for everything — code, docs, and project management. One place for everything.

### Repository Structure

| Repo | Purpose | Owner |
|------|---------|-------|
| `j-bouchard/ai-fundraising-v2` | Your knowledge base, discovery templates, fundraising docs | Joe |
| `j-bouchard/resin-platform` | Salesforce AI agent platform — agents, MCP, orchestrator, workflows | Joe (Paz develops) |
| `j-bouchard/resin-goose` | Goose deployment target — published recipes | Joe (Paz develops) |
| `j-bouchard/resin-web` | Web deployment target (placeholder for now) | Joe (Paz develops) |
| `j-bouchard/resin-slack` | Slack deployment target (placeholder for now) | Joe (Paz develops) |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              ai-fundraising-v2                          │
│         (Knowledge Base - Joe's domain expertise)       │
│    Fundraising best practices, discovery templates      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   resin-platform                         │
│         (Development - all code and workflows)          │
├─────────────────────────────────────────────────────────┤
│  • MCP Server (Salesforce connectivity)                 │
│  • Agents (Discovery, Analysis, Action)                 │
│  • Orchestrator                                         │
│  • Workflows & Recipes (source)                         │
│  • Build scripts (outputs to deployment targets)        │
└─────────────────────────────────────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │resin-goose │   │ resin-web  │   │resin-slack │
   │  (deploy)  │   │  (deploy)  │   │  (deploy)  │
   └────────────┘   └────────────┘   └────────────┘
```

**The flow:** All development happens in `resin-platform`. Build/publish scripts output deployable artifacts to `resin-goose`, `resin-web`, `resin-slack`, etc.

**Why this structure?**
- `resin-platform` is a generic Salesforce AI agent platform — works with any knowledge base
- `ai-fundraising-v2` (fundraising) is just the first vertical
- Future: plug in different knowledge bases for sales ops, customer success, etc.
- Clean separation: Joe owns domain content, Paz owns the platform

---

## Step 1: Create the Repositories

### 1.1 Create resin-platform

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `resin-platform`
   - **Description:** `Salesforce AI agent platform — agents, MCP, orchestrator, workflows`
   - **Visibility:** Private
   - **Initialize with:** Check "Add a README file"
   - **Add .gitignore:** Select `Python`
   - **License:** None (can add later)
3. Click **Create repository**

### 1.2 Create resin-goose

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `resin-goose`
   - **Description:** `Goose deployment target — published recipes`
   - **Visibility:** Private
   - **Initialize with:** Check "Add a README file"
3. Click **Create repository**

### 1.3 Create resin-web

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `resin-web`
   - **Description:** `Web deployment target (future)`
   - **Visibility:** Private
   - **Initialize with:** Check "Add a README file"
3. Click **Create repository**

### 1.4 Create resin-slack

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `resin-slack`
   - **Description:** `Slack deployment target (future)`
   - **Visibility:** Private
   - **Initialize with:** Check "Add a README file"
3. Click **Create repository**

### 1.5 Add Paz as Collaborator (all repos)

For each repo (`resin-platform`, `resin-goose`, `resin-web`, `resin-slack`):

1. Go to the repo
2. Click **Settings** (tab at top)
3. Click **Collaborators** (left sidebar)
4. Click **Add people**
5. Search for `mpazaryna`
6. Select and click **Add mpazaryna to this repository**
7. Choose role: **Write**

Paz will get email invitations to accept.

---

## Step 2: Set Up GitHub Project Board

GitHub Projects is our task tracking — like a Kanban board.

### 2.1 Create the Project

1. Go to `https://github.com/j-bouchard/resin-platform`
2. Click **Projects** tab
3. Click **Link a project** → **New project**
4. Select **Board** (Kanban view)
5. Name it: `V4 Development`
6. Click **Create**

---

## Step 3: Workflow — How We Work Together

### Daily/Weekly Flow

1. **Check the board:** https://github.com/j-bouchard/resin-platform/projects
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

## Step 4: Your Existing Repo (ai-fundraising-v2)

Keep using `ai-fundraising-v2` for your knowledge base. Suggested structure:

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

Paz will reference these files from `resin-platform`.

---

## Quick Reference

| What | Where |
|------|-------|
| Platform code (agents, MCP, workflows) | `j-bouchard/resin-platform` |
| Goose deployment | `j-bouchard/resin-goose` |
| Web deployment | `j-bouchard/resin-web` |
| Slack deployment | `j-bouchard/resin-slack` |
| Knowledge base / docs | `j-bouchard/ai-fundraising-v2` |
| Project board | `github.com/j-bouchard/resin-platform/projects` |
| Issues | `github.com/j-bouchard/resin-platform/issues` |

---

## Checklist for Joe

- [ ] Create `resin-platform` repo (Step 1.1)
- [ ] Create `resin-goose` repo (Step 1.2)
- [ ] Create `resin-web` repo (Step 1.3)
- [ ] Create `resin-slack` repo (Step 1.4)
- [ ] Add Paz (`mpazaryna`) as collaborator to all repos (Step 1.5)
- [ ] Create project board `V4 Development` (Step 2)
- [ ] Organize `ai-fundraising-v2` folder structure (Step 4)
- [ ] Start working on discovery templates (Priority!)

---

## Questions?

Create an issue in `resin-platform` with the `question` label, or reach out directly.

---

**Document Version:** 2.0
**Created:** November 26, 2025
**Updated:** November 28, 2025
