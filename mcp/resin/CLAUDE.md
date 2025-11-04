# Resin - Salesforce MCP Server

**Resin** is a Cloudflare Workers-based MCP (Model Context Protocol) server for Salesforce fundraising analytics. It provides AI assistants with tools to query donor data, segment audiences, and perform fundraising analytics through natural language interactions.

**Multi-Client Deployment Model:** One codebase deploys to multiple isolated Cloudflare Workers, one per client. Each worker has its own Salesforce credentials, API keys, and metrics collection.

**Deployments:**
- Default (demo): https://resin.mpazbot.workers.dev
- Evergreen: https://evergreen.mpazbot.workers.dev
- (Additional clients added via wrangler.jsonc environments)

**Authentication:** All requests require `Authorization: Bearer <api-key>` header (unique per client)

## Essential Commands

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

**Multi-Client Architecture:** This codebase deploys multiple isolated Cloudflare Workers, one per client. Each environment has its own worker name, secrets, and metrics collection.

**Environment structure:**
- **Default (no --env flag):** Top-level wrangler.jsonc config → worker name "resin"
- **Named environments (--env flag):** env.{name} sections → worker name = environment name

```bash
cd mcp/resin

# Deploy DEFAULT worker (uses top-level config → resin.mpazbot.workers.dev)
npm run deploy
# or: wrangler deploy

# Deploy NAMED ENVIRONMENT worker (uses env.evergreen → evergreen.mpazbot.workers.dev)
wrangler deploy --env evergreen

# Delete DEFAULT worker
npm run delete
# or: wrangler delete

# Delete NAMED ENVIRONMENT worker
wrangler delete --env evergreen

# View logs from DEFAULT worker (no --env flag)
npx wrangler tail

# View logs from NAMED ENVIRONMENT worker
npx wrangler tail --env evergreen

# Pretty formatted logs
npx wrangler tail --format pretty

# Filter by status
npx wrangler tail --status error

# List secrets for DEFAULT worker (no --env flag)
npx wrangler secret list

# List secrets for NAMED ENVIRONMENT worker
npx wrangler secret list --env evergreen
```

**Adding a New Client:**

1. Add environment to `wrangler.jsonc`:
```json
"env": {
  "newclient": {
    "name": "newclient",
    "analytics_engine_datasets": [
      {
        "binding": "ANALYTICS",
        "dataset": "newclient_metrics"
      }
    ],
    "vars": {}
  }
}
```

2. Create secrets file and deploy:
```bash
# Create secret file from template
cp .secrets.template .secrets.newclient

# Edit .secrets.newclient with actual credentials
nano .secrets.newclient

# Deploy worker
wrangler deploy --env newclient

# Set secrets from file
./set-secrets.sh newclient
```

3. Worker URL will be: `https://newclient.mpazbot.workers.dev`

### Secrets Management

**Important:** Each environment has completely isolated secrets. You must set secrets separately for each client worker.

**Recommended: Use environment-specific secret files**

Create `.secrets.{environment}` files for each worker:

```bash
cd mcp/resin

# Create .secrets.resin for default worker
cat > .secrets.resin << EOF
API_KEY=your-resin-api-key
SF_CLIENT_ID=your-client-id
SF_CLIENT_SECRET=your-client-secret
SF_REFRESH_TOKEN=your-refresh-token
SF_INSTANCE_URL=https://yourorg.my.salesforce.com
SF_DOMAIN=login
EOF

# Create .secrets.evergreen for evergreen worker
cat > .secrets.evergreen << EOF
API_KEY=your-evergreen-api-key
SF_CLIENT_ID=evergreen-client-id
SF_CLIENT_SECRET=evergreen-client-secret
SF_REFRESH_TOKEN=evergreen-refresh-token
SF_INSTANCE_URL=https://evergreen.my.salesforce.com
SF_DOMAIN=login
EOF

# Set secrets for default worker (reads from .secrets.resin)
./set-secrets.sh

# Set secrets for evergreen worker (reads from .secrets.evergreen)
./set-secrets.sh evergreen

# List secrets to verify
npx wrangler secret list                # Default worker
npx wrangler secret list --env evergreen  # Evergreen worker
```

**Alternative: Set secrets manually**

```bash
# Set individual secrets for DEFAULT worker (no --env flag)
echo "value" | npx wrangler secret put SECRET_NAME

# Set individual secrets for NAMED ENVIRONMENT worker
echo "value" | npx wrangler secret put SECRET_NAME --env evergreen

# Delete secret
npx wrangler secret delete SECRET_NAME --env evergreen
```

**Note:** All requests to the MCP server must include an Authorization header:
```
Authorization: Bearer your-secure-api-key-here
```

**Required secrets for each worker:**
- `API_KEY` - Bearer token for MCP server authentication
- `SF_CLIENT_ID` - Salesforce Connected App client ID
- `SF_CLIENT_SECRET` - Salesforce Connected App client secret
- `SF_REFRESH_TOKEN` - Salesforce OAuth refresh token
- `SF_INSTANCE_URL` - Salesforce instance URL (e.g., https://example.my.salesforce.com)
- `SF_DOMAIN` - Salesforce domain (login, test, or custom domain)

## Architecture

### High-Level Design

The codebase follows a **modular architecture** with clean separation of concerns:

```
src/
├── index.ts                     # Cloudflare Workers entry point
├── server.ts                    # MCP server setup & tool registration (~145 lines)
├── stdio.ts                     # STDIO mode for local testing
├── auth.ts                      # API key authentication
└── lib/
    ├── salesforce-client.ts     # OAuth client, API calls, 60s caching
    ├── utils.ts                 # Formatting & parsing utilities
    ├── logger.ts                # Structured JSON logging
    ├── metrics.ts               # Analytics Engine metrics collection
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

6. **Structured Logging** - All operations log structured JSON via `lib/logger.ts` for easy parsing and analysis.

7. **Metrics Collection** - Request metrics are automatically collected via Cloudflare Analytics Engine (`lib/metrics.ts`).

### MCP Tools Available

The server exposes four main tools:

1. **run_soql** - Execute any SOQL query
2. **create_record** - Create Salesforce records
3. **update_record** - Update Salesforce records
4. **query_donors** - Query donors using natural language criteria

### Health Check Endpoints

Two unauthenticated endpoints for monitoring:

1. **GET /health** - Liveness check (returns 200 if Worker is running)
2. **GET /ready** - Readiness check (verifies Salesforce connectivity)

See `MONITORING.md` for complete documentation.

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

## Monitoring & Observability

### Structured Logging

All operations log structured JSON for easy parsing:

```json
{
  "timestamp": "2025-11-03T18:32:17.216Z",
  "level": "info",
  "message": "Request completed",
  "context": {
    "requestId": "req_1762194737216_f52ah49lt",
    "endpoint": "/health",
    "method": "GET"
  },
  "data": {
    "statusCode": 200,
    "durationMs": 11
  }
}
```

**View logs:**
```bash
# Development
npm run dev

# Production (live tail)
npx wrangler tail --format pretty

# Filter errors
npx wrangler tail --status error

# Search with jq
npx wrangler tail --format json | jq 'select(.level == "error")'
```

### Metrics Collection

Automatic metrics via Cloudflare Analytics Engine:
- Request counts by endpoint
- Response times (P50, P95, P99)
- HTTP status codes
- Authentication success/failure rates
- Error types and rates

**Query metrics:**
```bash
# Via Cloudflare API
curl -X POST "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/analytics_engine/sql" \
  -H "Authorization: Bearer <API_TOKEN>" \
  -d '{"query": "SELECT blob1 AS endpoint, SUM(_sample_interval) AS requests FROM resin_metrics WHERE timestamp > NOW() - INTERVAL '\''1'\'' DAY GROUP BY endpoint FORMAT JSON"}'
```

See `MONITORING.md` for complete documentation with example queries.

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

4. **Add structured logging**:
   ```typescript
   const logger = createLogger({ module: "campaign-tools" });
   logger.info("Analyzing campaign", { campaignId });
   ```

5. **Write tests**:
   ```typescript
   // tests/integration/campaign.test.ts
   it("should analyze campaign performance", async () => {
     const result = await client.callTool("analyze_campaign", {
       campaign_id: "701..."
     });
     expect(result).toContain("Campaign Performance");
   });
   ```

6. **Deploy**: `npm run deploy`

## Configuration Files

- **wrangler.jsonc** - Cloudflare Workers configuration (compatibility date, entry point, Analytics Engine binding)
- **vitest.config.ts** - Test configuration (30s timeout for integration tests)
- **tsconfig.json** - TypeScript configuration
- **package.json** - Dependencies and npm scripts
- **.env** - Local environment variables (NOT committed, used by set-secrets.sh)
- **.env.test** - Test environment variables

## Important Notes

- **API Authentication** - The server requires Bearer token authentication. Set API_KEY secret using `npx wrangler secret put API_KEY`
- **Salesforce credentials** - Never commit secrets. Use `./set-secrets.sh` to configure Cloudflare secrets from `.env`
- **OAuth flow** - The server uses OAuth 2.0 refresh token flow, not username/password
- **Query caching** - SOQL queries are automatically cached for 60 seconds to reduce API calls
- **Test data safety** - Integration tests run against Salesforce sandbox. Always mark test records clearly
- **TDD workflow** - Use `npm run test:watch` for rapid red-green-refactor cycles
- **Structured logging** - Use `createLogger()` from `lib/logger.ts` instead of plain `console.log()`
- **Metrics** - All requests automatically record metrics; no manual instrumentation needed

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

**Analytics Engine errors**
- Ensure Analytics Engine is enabled in Cloudflare Dashboard
- Verify `analytics_engine_datasets` binding in `wrangler.jsonc`
- Check account has Workers Paid plan

## Documentation

Additional documentation in this directory:
- **MONITORING.md** - Complete monitoring guide (structured logging, metrics queries, health checks)
- **ARCHITECTURE.md** - Detailed architecture, module breakdown, migration notes (if exists)
- **SETUP.md** - Initial setup and deployment instructions (if exists)
- **TDD_GUIDE.md** - Test-driven development workflow and best practices (if exists)

Project-level documentation:
- **docs/devlogs/** - Development logs documenting major features and decisions
- **docs/architecture/** - High-level architecture documentation

## External Resources

- [Model Context Protocol Docs](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [ModelFetch Documentation](https://www.modelfetch.com/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/)
- [Salesforce SOQL Reference](https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta)

## Recent Changes

See project devlogs for detailed documentation of recent work:
- **2025-11-03:** Health checks, monitoring (Analytics Engine), and structured logging
- **2025-10-30:** API key authentication
- **2025-10-29:** Initial Cloudflare Workers deployment
