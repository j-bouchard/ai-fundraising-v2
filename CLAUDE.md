# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Overview

This is a **monorepo** containing multiple projects related to AI-powered fundraising and Salesforce integration:

### Projects

1. **Resin** (`mcp/resin/`) - Cloudflare Workers-based MCP server for Salesforce fundraising analytics
   - Production: https://resin.mpazbot.workers.dev
   - **Authentication required:** All requests must include `Authorization: Bearer <api-key>` header

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

**✅ CORRECT - Pass credentials as parameters:**
```yaml
parameters:
  - key: API_KEY
    input_type: string
    requirement: optional
    description: "API key for authentication"
    default: "your-key"

instructions: |
  **MCP Server Access**
  Server: https://server.example.com/mcp
  Auth: Bearer {{ API_KEY }}
  Tools: tool1, tool2, tool3
```

**❌ INCORRECT - Extension with headers (doesn't work):**
```yaml
extensions:
  - type: sse
    headers:
      Authorization: "Bearer {{ API_KEY }}"  # This will fail
```

### Working with This Monorepo

When working on a specific project:
1. Navigate to the project directory: `cd mcp/resin` or `cd mill`
2. Refer to that project's documentation for detailed instructions
3. Each project has its own dependencies, commands, and deployment workflows

---

## Legacy Resin Documentation

The following sections contain the original Resin project documentation. This is kept for backwards compatibility and quick reference.

### Resin Project Overview

**Resin** is a Cloudflare Workers-based MCP (Model Context Protocol) server for Salesforce fundraising analytics. It provides AI assistants with tools to query donor data, segment audiences, and perform fundraising analytics through natural language interactions.

**Main codebase location:** `mcp/resin/`

**Production deployment:** https://resin.mpazbot.workers.dev

**Authentication:** All requests require `Authorization: Bearer <api-key>` header

### Essential Commands

### Development & Testing

```bash
# Navigate to the project directory first
cd mcp/resin

# Run local development server (Cloudflare Workers)
npm run dev

# Run MCP Inspector for interactive tool testing
npm run mcp-server

# Run all tests
npm test

# Run tests in watch mode (recommended for TDD)
npm run test:watch

# Run only integration tests (tests against live deployment)
npm run test:integration

# Run only unit tests (pure functions, no external deps)
npm run test:unit

# Run tests with visual UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/integration/mcp-server.test.ts

# Run specific test by name
npm test -- -t "should create a test Contact"
```

### Deployment

```bash
cd mcp/resin

# Deploy to Cloudflare Workers
npm run deploy

# Delete deployment and all resources
npm run delete

# View live logs from deployed worker
npx wrangler tail

# List Cloudflare secrets
npx wrangler secret list
```

### Secrets Management

```bash
cd mcp/resin

# Set API key for authentication (required)
echo "your-secure-api-key-here" | npx wrangler secret put API_KEY

# Set all Salesforce secrets from .env (one-time setup)
./set-secrets.sh

# Set individual secret manually
echo "value" | npx wrangler secret put SECRET_NAME

# List all configured secrets
npx wrangler secret list
```

**Note:** All requests to the MCP server must include an Authorization header:
```
Authorization: Bearer your-secure-api-key-here
```

## Architecture

### High-Level Design

The codebase follows a **modular architecture** with clean separation of concerns. The original 770-line monolithic `server.ts` has been refactored into focused modules:

```
src/
├── index.ts                     # Cloudflare Workers entry point
├── server.ts                    # MCP server setup & tool registration (~145 lines)
├── stdio.ts                     # STDIO mode for local testing
└── lib/
    ├── salesforce-client.ts     # OAuth client, API calls, 60s caching
    ├── utils.ts                 # Formatting & parsing utilities
    ├── soql/                    # SOQL query builders
    │   ├── donor-queries.ts     # 10 donor segmentation patterns
    │   ├── opportunity-queries.ts # 11 opportunity analytics patterns
    │   ├── query-builder.ts     # Criteria → SOQL conversion
    │   └── nlp-parser.ts        # Natural language → SOQL
    └── tools/                   # MCP tool implementations
        ├── soql-tools.ts        # SOQL execution
        ├── record-tools.ts      # CRUD operations
        └── donor-tools.ts       # Donor-specific tools
```

### Key Architectural Principles

1. **Tool Registration in server.ts** - All MCP tools are registered in `src/server.ts` using `server.registerTool()`. This is the entry point for adding new functionality.

2. **Reusable Query Builders** - The `lib/soql/` directory contains 20+ pre-built query patterns for common fundraising scenarios. When adding donor/opportunity analysis features, check if an existing query pattern can be reused.

3. **Tool Implementations** - Tool logic lives in `lib/tools/`. Tools receive a `SalesforceClient` instance and parameters, perform operations, and return formatted strings.

4. **Salesforce Client** - `lib/salesforce-client.ts` handles all Salesforce interactions with OAuth refresh token flow and automatic 60-second query caching.

5. **Environment Variables** - All sensitive credentials (SF_CLIENT_ID, SF_CLIENT_SECRET, SF_REFRESH_TOKEN, SF_INSTANCE_URL, SF_DOMAIN) are stored as Cloudflare secrets, never in code.

### MCP Tools Available

The server exposes four main tools:

1. **run_soql** - Execute any SOQL query
2. **create_record** - Create Salesforce records
3. **update_record** - Update Salesforce records
4. **query_donors** - Query donors using natural language criteria

### Pre-Built Query Patterns

The `lib/soql/` directory contains 20+ ready-to-use patterns:

**Donor Segmentation:** lapsed donors, major donors, recent donors, first-time donors, recurring donors, upgrade candidates, at-risk donors, mid-level donors, high-value engaged, warm prospects

**Opportunity Analytics:** pipeline by stage, open pipeline, recently won/lost, monthly/quarterly revenue, year-over-year comparison, large gifts, gift distribution, conversion metrics, average days to close

### Testing Strategy

This project uses **comprehensive TDD** with both unit and integration tests:

- **Unit tests** (`tests/unit/`) - Pure functions, no external dependencies, fast
- **Integration tests** (`tests/integration/`) - Test against live Cloudflare deployment + real Salesforce sandbox

All test data should be:
- Clearly marked with "Test" or timestamp in names
- Include description: "Created by automated test - safe to delete"
- Use unique identifiers (timestamps/UUIDs)
- Never depend on specific existing records

## Adding New Features

### Example: Adding a New MCP Tool

1. **Choose or create query pattern** (if needed):
   ```typescript
   // lib/soql/campaign-queries.ts
   export function campaignPerformance(campaignId: string): string {
     return `SELECT COUNT(Id) Members FROM CampaignMember WHERE CampaignId = '${campaignId}'`;
   }
   ```

2. **Create tool implementation**:
   ```typescript
   // lib/tools/campaign-tools.ts
   export async function analyzeCampaign(
     client: SalesforceClient,
     campaignId: string
   ): Promise<string> {
     const soql = CampaignQueries.campaignPerformance(campaignId);
     const result = await client.soql(soql);
     return formatResults(result);
   }
   ```

3. **Register tool in server.ts**:
   ```typescript
   // src/server.ts
   import { analyzeCampaign } from "./lib/tools/campaign-tools";

   server.registerTool(
     "analyze_campaign",
     {
       title: "Analyze Campaign Performance",
       description: "Get detailed analytics for a Salesforce campaign",
       inputSchema: {
         campaign_id: z.string().describe("Salesforce Campaign ID"),
       },
     },
     async ({ campaign_id }) => {
       const result = await analyzeCampaign(salesforceClient, campaign_id);
       return { content: [{ type: "text" as const, text: result }] };
     }
   );
   ```

4. **Write tests**:
   ```typescript
   // tests/integration/campaign.test.ts
   it("should analyze campaign performance", async () => {
     const result = await client.callTool("analyze_campaign", {
       campaign_id: "701..."
     });
     expect(result).toContain("Campaign Performance");
   });
   ```

5. **Deploy**: `npm run deploy`

## Configuration Files

- **wrangler.jsonc** - Cloudflare Workers configuration (compatibility date, entry point)
- **vitest.config.ts** - Test configuration (30s timeout for integration tests)
- **tsconfig.json** - TypeScript configuration
- **package.json** - Dependencies and npm scripts
- **.env** - Local environment variables (NOT committed, used by set-secrets.sh)
- **.env.test** - Test environment variables

## Important Notes

- **All work happens in `mcp/resin/`** - The root directory only contains documentation
- **API Authentication** - The server requires Bearer token authentication. Set API_KEY secret using `npx wrangler secret put API_KEY`
- **Salesforce credentials** - Never commit secrets. Use `./set-secrets.sh` to configure Cloudflare secrets from `.env`
- **OAuth flow** - The server uses OAuth 2.0 refresh token flow, not username/password
- **Query caching** - SOQL queries are automatically cached for 60 seconds to reduce API calls
- **Test data safety** - Integration tests run against Salesforce sandbox. Always mark test records clearly
- **TDD workflow** - Use `npm run test:watch` for rapid red-green-refactor cycles

## Testing with MCP Inspector

```bash
# Run MCP Inspector locally
npx -y @modelcontextprotocol/inspector@latest

# Connect to: http://localhost:8787/mcp (for local dev)
# Or: https://resin.mpazbot.workers.dev/mcp (for deployed)
```

## Troubleshooting

**"Missing OAuth env vars"**
- Run `./set-secrets.sh` to configure secrets
- Verify with `npx wrangler secret list`

**SOQL query failures**
- Check Salesforce credentials
- Verify refresh token hasn't expired
- Ensure Connected App is configured correctly

**Tests failing**
- Check test is using timestamped/unique data
- View detailed logs: `npm test -- --reporter=verbose`
- Check Cloudflare logs: `npx wrangler tail`
- Test against local dev: Set `MCP_SERVER_URL=http://localhost:8787/mcp` then run tests

## Documentation

Additional documentation in `docs/`:
- **ARCHITECTURE.md** - Detailed architecture, module breakdown, migration notes
- **SETUP.md** - Initial setup and deployment instructions
- **TDD_GUIDE.md** - Test-driven development workflow and best practices
- **TESTING_SUMMARY.md** - Testing overview
- **QUICK_START_TESTING.md** - Quick testing guide
- **WHAT-WE-DID.md** - Project history and development summary

## External Resources

- [Model Context Protocol Docs](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [ModelFetch Documentation](https://www.modelfetch.com/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Salesforce SOQL Reference](https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta)
