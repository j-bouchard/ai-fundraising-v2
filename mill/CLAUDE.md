# Mill - Fundraising AI Workflows

Mill contains AI workflow specifications and Goose recipes for fundraising operations using the Resin MCP server.

## Overview

Mill provides:
- **Workflow specifications** (`spec/`) - Markdown files describing fundraising workflows
- **Goose recipes** (`recipes/`) - Executable YAML configurations for AI agents
- **Runner scripts** (`../scripts/mill/`) - Convenient shell scripts for executing recipes

## Directory Structure

```
mill/
├── spec/                           # Workflow specifications (markdown)
│   └── fundraising-data-analysis.md
└── recipes/                        # Goose recipe files (YAML)
    └── fundraising-data-analysis.yaml

scripts/mill/                       # Recipe runner scripts
└── run-fundraising-analysis.sh
```

## Creating New Recipes

### CRITICAL: Always Use the goose-recipes Skill

**DO NOT create recipes manually.** Always use the `goose-recipes` skill in Claude Code:

```
use the goose-recipes skill to create a recipe for mill/spec/your-workflow.md
```

### Why Use the Skill?

The `goose-recipes` skill ensures:

1. **Correct MCP authentication** - Properly configures access to the Resin MCP server with Bearer token authentication
2. **Working patterns** - Uses proven patterns that actually work in production (we learned this the hard way!)
3. **Consistent structure** - All recipes follow the same structure with proper parameters, instructions, and output schemas
4. **Complete setup** - Generates both the recipe YAML and a convenient shell script runner

### What the Skill Does

When you use the skill, it will:

1. Read your markdown spec file from `mill/spec/`
2. Extract the workflow description and output requirements
3. Generate a properly structured YAML recipe with:
   - Parameters (including API key configuration)
   - Instructions for the AI agent
   - MCP server access details
   - Structured JSON output schema
   - Retry logic with validation
4. Create a shell script runner with:
   - API key management
   - Parameter handling
   - Help and usage documentation

## Running Recipes

### Philosophy: CLI for Recipes, Desktop for Ad-Hoc

**IMPORTANT:** Recipes are designed for **automated, repeatable workflows** and should be run from the **CLI** (command line). Reserve **Goose Desktop** for ad-hoc exploration, development, and one-off tasks.

| Use Case | Tool | Why |
|----------|------|-----|
| **Running recipes** | CLI (`goose run` or shell scripts) | Automated, repeatable, scriptable, production workflows |
| **Developing/testing recipes** | CLI with `--explain` and `--render-recipe` | Fast iteration without full execution |
| **Ad-hoc queries** | Goose Desktop | Interactive exploration, one-off questions, prototyping |
| **Interactive debugging** | Goose Desktop | Conversational troubleshooting and investigation |

### Using the Shell Script (Recommended for Production)

Each recipe has a corresponding shell script for easy CLI execution:

```bash
# Run with defaults
./scripts/mill/run-fundraising-analysis.sh

# Run with custom parameters
./scripts/mill/run-fundraising-analysis.sh \
  --period "last 12 months" \
  --output "reports/2024.md"

# View help
./scripts/mill/run-fundraising-analysis.sh --help
```

### Using Goose Directly

```bash
# Basic run
goose run --recipe mill/recipes/fundraising-data-analysis.yaml

# With parameters
goose run --recipe mill/recipes/fundraising-data-analysis.yaml \
  --params analysis_period="Q4 2024" \
  --params output_file="reports/q4-2024.md"

# View recipe details
goose run --recipe mill/recipes/fundraising-data-analysis.yaml --explain

# Preview rendered template
goose run --recipe mill/recipes/fundraising-data-analysis.yaml --render-recipe
```

## MCP Server Authentication Pattern

### The Problem

Goose recipes have issues with HTTP-based MCP servers that require authentication. The `sse` and `streamable_http` extension types **DO NOT** properly support custom authentication headers.

### The Solution

The `goose-recipes` skill uses this pattern that actually works:

```yaml
parameters:
  - key: RESIN_API_KEY
    input_type: string
    requirement: optional
    description: "API key for Resin MCP server authentication"
    default: "your-api-key"

instructions: |
  **MCP Server Access**
  The resin MCP server is available at: https://resin.mpazbot.workers.dev/mcp
  Authentication: Use Bearer token with API key: {{ RESIN_API_KEY }}

  The server provides tools for querying Salesforce fundraising data including:
  - run_soql: Execute SOQL queries
  - query_donors: Query donors using natural language criteria
  - create_record: Create Salesforce records
  - update_record: Update Salesforce records

  Access these tools by making HTTP requests with the Authorization header.
```

This approach:
1. ✅ Passes the API key as a parameter (not extension config)
2. ✅ Documents the MCP server URL and available tools in instructions
3. ✅ Guides the agent to make authenticated HTTP calls directly
4. ✅ Actually works in production!

### What Doesn't Work

**❌ DO NOT use this pattern** (it will fail):

```yaml
extensions:
  - type: sse
    name: resin
    uri: https://resin.mpazbot.workers.dev/mcp
    headers:
      Authorization: "Bearer {{ RESIN_API_KEY }}"  # This doesn't work!
```

## Workflow Specifications

Workflow specs in `mill/spec/` are markdown files that describe:

1. **Title and description** - What the workflow does
2. **Allowed tools** - Which MCP servers/tools to use
3. **Workflow steps** - The process to follow
4. **Output requirements** - What the final report should include

### Example Spec Structure

```markdown
---
title: workflow-name
description: Brief description of what this workflow accomplishes
allowed-tools: resin MCP server
---

# Workflow Name

## Workflow

Describe the high-level workflow and what it accomplishes.

## Output

Create a markdown report including:
- Section 1 with specific requirements
- Section 2 with specific requirements
- etc.
```

## Available Recipes

### Fundraising Data Analysis

**Spec:** `mill/spec/fundraising-data-analysis.md`
**Recipe:** `mill/recipes/fundraising-data-analysis.yaml`
**Runner:** `./scripts/mill/run-fundraising-analysis.sh`

Performs comprehensive fundraising performance analysis including:
- Revenue analysis (by year/quarter/month)
- Donor retention calculations
- Donor segmentation (recurring vs one-time)
- Pipeline and moves management
- Campaign performance metrics

## Workflow: From Spec to Production

The recommended workflow for creating and running fundraising AI workflows:

```
1. Define Workflow (Ad-Hoc)
   └─> Use Goose Desktop to explore and prototype
   └─> Understand what queries/tools are needed
   └─> Document learnings

2. Create Spec (Manual)
   └─> Write markdown spec in mill/spec/
   └─> Define workflow steps and output requirements
   └─> Commit to version control

3. Generate Recipe (Using Skill)
   └─> Use goose-recipes skill in Claude Code
   └─> Skill creates YAML recipe + shell script
   └─> Review and commit generated files

4. Test Recipe (CLI)
   └─> Run with --explain and --render-recipe
   └─> Execute with test parameters
   └─> Validate output and fix issues

5. Production Use (CLI/Automated)
   └─> Run via shell script or goose CLI
   └─> Integrate with cron/CI/CD if needed
   └─> Monitor and iterate
```

### Development vs Production

| Stage | Tool | Purpose |
|-------|------|---------|
| **Exploration** | Goose Desktop | "What queries do I need? How does this work?" |
| **Documentation** | Text editor | Write clear spec of what workflow should do |
| **Generation** | goose-recipes skill | Convert spec to working recipe |
| **Testing** | CLI (`--explain`, `--render`) | Validate recipe without full execution |
| **Production** | CLI (shell script) | Run automated, repeatable workflows |
| **Debugging** | Goose Desktop | "Why isn't this working? Let me investigate..." |

## Best Practices

1. **Always start with a spec** - Create a clear markdown specification in `mill/spec/` before generating a recipe

2. **Use the skill** - Never manually create recipes. Use: `use the goose-recipes skill to create a recipe for mill/spec/your-spec.md`

3. **Test recipes in CLI** - Run with `--explain` and `--render-recipe` flags to verify before full execution

4. **Run production workflows from CLI** - Use shell scripts or `goose run` for automated, repeatable workflows

5. **Keep Desktop for ad-hoc** - Reserve Goose Desktop for exploration, debugging, and one-off queries

6. **Version control** - Commit both spec files and generated recipes

7. **API keys in scripts** - For production, store API keys in environment variables or secure secret management, not hardcoded in scripts

## Troubleshooting

### Recipe won't load
- Check YAML syntax with `--explain` flag
- Ensure all parameters have defaults if marked optional
- Verify template variables match parameter keys

### MCP server authentication fails
- Verify API key is set correctly in shell script or environment
- Check that instructions include proper MCP server URL and auth details
- Ensure you're NOT using extension-based auth (use parameter-based instead)

### Recipe execution hangs
- Check timeout settings in retry configuration
- Verify MCP server is accessible (test with curl)
- Review Goose logs for detailed error messages

## Related Documentation

- [Goose Recipes Skill](../.claude/skills/goose-recipes/SKILL.md) - Complete skill documentation
- [Recipe Structure Reference](../.claude/skills/goose-recipes/references/recipe-structure.md) - Field reference
- [Resin MCP Server](../mcp/resin/README.md) - MCP server documentation
- [Root CLAUDE.md](../CLAUDE.md) - Monorepo overview
