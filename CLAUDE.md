# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Overview

This is a **monorepo** containing multiple projects related to AI-powered fundraising and Salesforce integration:

### Projects

1. **Resin** (`mcp/resin/`) - Cloudflare Workers-based MCP server for Salesforce fundraising analytics
   - **See [mcp/resin/CLAUDE.md](mcp/resin/CLAUDE.md) for complete Resin documentation**
   - **Multi-client deployment:** One codebase, multiple isolated workers (one per client)
   - **Architecture:** Uses wrangler.jsonc environments for per-client deployments
   - **Deployments:**
     - Demo: https://resin.mpazbot.workers.dev
     - Evergreen: https://evergreen.mpazbot.workers.dev
   - **Authentication required:** Each worker has unique API key and Salesforce credentials
   - **Isolation:** Complete separation of secrets, metrics, and data per client
   - Features: Health checks, structured logging, per-client metrics collection

2. **Mill** (`mill/`) - Fundraising AI workflow specifications and Goose recipes
   - **See [mill/CLAUDE.md](mill/CLAUDE.md) for complete Mill documentation**
   - Contains workflow specs, recipe generation, and orchestration patterns
   - **ALWAYS use the `goose-recipes` skill** to create recipes from specs

## Creating Goose Recipes from Specs

### IMPORTANT: Use the goose-recipes Skill

When creating Goose recipes from markdown specification files in `mill/spec/`, **ALWAYS use the `goose-recipes` skill** rather than creating recipes manually. This ensures:

1. **Correct MCP server authentication** - The skill knows how to properly configure authenticated HTTP-based MCP servers
2. **Consistent structure** - Recipes follow established patterns and best practices
3. **Proper parameter handling** - API keys and configuration are passed correctly
4. **Working templates** - Uses proven patterns that actually work in production

### Quick Start: Create a Recipe

```bash
# Use Claude Code with the goose-recipes skill
# Example: "use the goose-recipes skill to create a recipe for mill/spec/your-spec.md"
```

The skill will:
- Read the markdown spec file
- Generate a properly structured Goose recipe YAML
- Configure MCP server access with authentication correctly
- Include retry logic and structured output
- Create a shell script runner for easy execution

### Running Recipes

**Philosophy: CLI for Production, Desktop for Ad-Hoc**

Recipes are **automated, repeatable workflows** meant to be run from the **CLI**:

```bash
# Recommended: Use shell script wrapper
./scripts/mill/run-<recipe-name>.sh

# Or use Goose CLI directly
goose run --recipe mill/recipes/<recipe-name>.yaml \
  --params param1="value1" \
  --params param2="value2"
```

**Reserve Goose Desktop for:**
- Ad-hoc queries and exploration
- Interactive debugging and troubleshooting
- One-off tasks that don't need repeatability
- Developing and testing new workflows before creating recipes

**Use CLI/recipes for:**
- Production workflows that run regularly
- Automated reports and analysis
- Scriptable, repeatable operations
- Integration with CI/CD or scheduled jobs

### Report Storage & Organization

Recipe outputs (reports) are organized for both local review and future Cloudflare R2 deployment:

```
reports/                                        # Working reports (gitignored)
├── README.md                                  # Documentation
└── <recipe-name>/                             # e.g., fundraising-data-analysis
    └── YYYY-MM-DD-HHMM/                       # Date-based folders
        ├── metadata.json                       # Execution metadata
        └── report.md                           # Generated report

reports-sample/                                 # Sample reports (committed)
└── <recipe-name>/
    └── YYYY-MM-DD-HHMM/
        ├── metadata.json
        └── report.md
```

**Key principles:**
- Reports organized by recipe name, then date/time
- Working reports are gitignored to prevent repository bloat
- Sample reports committed for documentation
- Structure mirrors future R2 bucket organization for easy deployment

**Saving reports:**
```bash
# When running a recipe, save output to:
TIMESTAMP=$(date +%Y-%m-%d-%H%M)
mkdir -p "reports/fundraising-data-analysis/$TIMESTAMP"
goose run --recipe mill/recipes/fundraising-data-analysis.yaml > \
  "reports/fundraising-data-analysis/$TIMESTAMP/report.md"
```

**R2 deployment (when ready):**
```bash
# Sync to Cloudflare R2 using helper script
./scripts/devops/sync-reports-to-r2.sh

# Or manually with rclone
rclone sync reports/ r2:resin-reports/ --progress
```

Path structure enables seamless transition:
```
Local:  reports/fundraising-data-analysis/2024-10-30-1400/report.md
R2:     s3://resin-reports/fundraising-data-analysis/2024-10-30-1400/report.md
```

**See also:**
- `reports/README.md` - Detailed reporting documentation
- `docs/DEVLOG-2025-10-31-reports-organization.md` - R2 deployment strategy
- `scripts/devops/sync-reports-to-r2.sh` - R2 sync helper script

### Key Pattern: MCP Server Authentication

The `goose-recipes` skill uses this critical pattern for authenticated MCP servers:

**✅ CORRECT - Pass server URL and credentials as parameters:**
```yaml
parameters:
  - key: MCP_SERVER_URL
    input_type: string
    requirement: optional
    description: "MCP server URL for specific client"
    default: "https://resin.mpazbot.workers.dev"
  - key: API_KEY
    input_type: string
    requirement: optional
    description: "API key for authentication"
    default: "your-key"

instructions: |
  **MCP Server Access**
  Server: {{ MCP_SERVER_URL }}/mcp
  Auth: Bearer {{ API_KEY }}
  Tools: tool1, tool2, tool3
```

**Running recipes for different clients:**
```bash
# Default client (resin)
./scripts/mill/run-recipe.sh

# Evergreen client
./scripts/mill/run-recipe.sh \
  --params MCP_SERVER_URL="https://evergreen.mpazbot.workers.dev" \
  --params API_KEY="evergreen-api-key"
```

**❌ INCORRECT - Extension with headers (doesn't work):**
```yaml
extensions:
  - type: sse
    headers:
      Authorization: "Bearer {{ API_KEY }}"  # This will fail
```

**Multi-Client Deployment Model:**
- Each client gets an isolated Cloudflare Worker deployment
- Worker environments configured in `mcp/resin/wrangler.jsonc`
- Each environment has unique secrets (API keys, Salesforce credentials)
- Recipes parameterize the server URL and API key for client-specific access
- Complete isolation ensures client data never mixes

### Working with This Monorepo

When working on a specific project:
1. Navigate to the project directory: `cd mcp/resin` or `cd mill`
2. Refer to that project's CLAUDE.md file for detailed instructions
3. Each project has its own dependencies, commands, and deployment workflows

## Project Documentation

For detailed documentation on each project, see:
- **Resin MCP Server:** [mcp/resin/CLAUDE.md](mcp/resin/CLAUDE.md)
- **Mill Workflows:** [mill/CLAUDE.md](mill/CLAUDE.md)
- **Architecture & Devlogs:** [docs/](docs/)
