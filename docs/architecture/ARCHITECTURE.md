# Architecture Documentation

## 🏗️ Modular Architecture Overview

The MCP server has been refactored into a clean, modular architecture that separates concerns and makes it easy to extend with new donor query patterns.

### Design Principles

1. **Separation of Concerns** - Each module has a single responsibility
2. **Testability** - Pure functions and dependency injection
3. **Extensibility** - Easy to add new query patterns and tools
4. **Type Safety** - Full TypeScript coverage with proper types
5. **Reusability** - Shared utilities and composable functions

## 📁 Project Structure

```
src/
├── server.ts                    # Main MCP server (refactored, clean)
├── index.ts                     # Cloudflare Workers entry point
├── lib/
│   ├── utils.ts                 # Utility functions (formatting, parsing)
│   ├── salesforce-client.ts     # Salesforce OAuth client
│   ├── soql/                    # SOQL query builders
│   │   ├── index.ts             # Module exports
│   │   ├── donor-queries.ts     # Donor segmentation queries
│   │   ├── opportunity-queries.ts # Opportunity analytics
│   │   ├── query-builder.ts     # Criteria-based builder
│   │   └── nlp-parser.ts        # Natural language parser
│   └── tools/                   # MCP tool implementations
│       ├── index.ts             # Module exports
│       ├── soql-tools.ts        # SOQL execution
│       ├── record-tools.ts      # CRUD operations
│       └── donor-tools.ts       # Donor-specific tools
tests/
├── mcp-client.ts                # Test client utility
├── fixtures/
│   └── test-data.ts             # Shared test fixtures
├── unit/
│   └── soql-builder.test.ts     # Unit tests
└── integration/
    └── mcp-server.test.ts       # Integration tests
```

## 🔧 Module Breakdown

### 1. Core Server (`src/server.ts`)

**Before:** 770 lines of mixed concerns
**After:** 145 lines of pure server setup

```typescript
// Clean, focused server setup
export function createServer(env: Record<string, string>) {
  const server = new McpServer({ ... });
  const salesforceClient = createSalesforceClient(env);

  // Register tools
  server.registerTool("run_soql", ...);
  server.registerTool("create_record", ...);
  server.registerTool("update_record", ...);
  server.registerTool("query_donors", ...); // NEW!

  return server;
}
```

### 2. Utilities (`src/lib/utils.ts`)

**Purpose:** Shared formatting and parsing functions

**Exports:**
- `fmtCurrency(amount)` - Format currency
- `fmtDate(date)` - Format dates
- `header(title)` - Create section headers
- `parseAmount(text)` - Parse "$10k" → 10000
- `parseTimeframe(text)` - Parse "last 6 months"

**Example:**
```typescript
import { fmtCurrency, parseAmount } from "./lib/utils";

const amount = parseAmount("$10k"); // 10000
const formatted = fmtCurrency(amount); // "$10,000.00"
```

### 3. Salesforce Client (`src/lib/salesforce-client.ts`)

**Purpose:** Salesforce API interactions with OAuth

**Features:**
- OAuth 2.0 refresh token flow
- Automatic token refresh
- 60-second query caching
- Full CRUD operations
- Proper error handling

**Example:**
```typescript
import { createSalesforceClient } from "./lib/salesforce-client";

const client = createSalesforceClient(env);
await client.connect();

// Query
const result = await client.soql("SELECT Id FROM Contact LIMIT 5");

// Create
const created = await client.create("Contact", { LastName: "Smith" });

// Update
await client.update("Contact", recordId, { Email: "new@example.com" });

// Delete
await client.delete("Contact", recordId);
```

### 4. SOQL Query Builders (`src/lib/soql/`)

**Purpose:** Generate SOQL queries for common fundraising scenarios

#### Donor Queries (`donor-queries.ts`)

**10 donor segmentation patterns:**

1. **Lapsed Donors** - `lapsedDonors(months, limit)`
   - Donors who haven't given in N months
   - Use: Reactivation campaigns

2. **Major Donors** - `majorDonorsOver(amount, limit)`
   - Lifetime giving > threshold
   - Use: Major gift programs

3. **Recent Donors** - `recentDonorsLastNMonths(months, limit)`
   - Given within N months
   - Use: Stewardship

4. **First-Time Donors** - `firstTimeDonors(limit)`
   - Exactly one gift
   - Use: Second gift cultivation

5. **Recurring Donors** - `recurringDonors(minMonths, limit)`
   - Multiple consecutive gifts
   - Use: Sustained giving analysis

6. **Upgrade Candidates** - `upgradeCandidates(minAmount, minCount, limit)`
   - Showing increasing patterns
   - Use: Major gift pipeline

7. **At-Risk Donors** - `atRiskDonors(historical, recent, minGifts, limit)`
   - Historical givers going quiet
   - Use: Retention

8. **Mid-Level Donors** - `midLevelDonors(min, max, limit)`
   - Between two thresholds
   - Use: Targeted cultivation

9. **High-Value Engaged** - `highValueEngagedDonors(months, minCount, minAmount, limit)`
   - Recent + frequent + high-value (RFM)
   - Use: VIP stewardship

10. **Warm Prospects** - `warmProspects(minScore, limit)`
    - Engaged but haven't given
    - Use: Acquisition

**Example:**
```typescript
import { DonorQueries } from "./lib/soql";

// Get lapsed donors from last 12 months
const soql = DonorQueries.lapsedDonors(12, 25);

// Get major donors over $10k
const soql = DonorQueries.majorDonorsOver(10000, 50);

// Get at-risk donors
const soql = DonorQueries.atRiskDonors(24, 6, 2, 25);
```

#### Opportunity Queries (`opportunity-queries.ts`)

**11 opportunity analytics patterns:**

1. **By Stage** - `opportunitiesByStage()`
2. **Open Pipeline** - `openPipeline(limit)`
3. **Recently Won** - `recentlyWonOpportunities(days, limit)`
4. **Monthly Revenue** - `monthlyRevenue(months)`
5. **Quarterly Performance** - `quarterlyPerformance(years)`
6. **Year-Over-Year** - `yearOverYearComparison()`
7. **Large Gifts** - `largeGifts(minAmount, limit)`
8. **Gift Distribution** - `giftDistribution()`
9. **Conversion Metrics** - `conversionMetrics(days)`
10. **Days to Close** - `averageDaysToClose(months)`
11. **Recently Lost** - `recentlyLostOpportunities(days, limit)`

**Example:**
```typescript
import { OpportunityQueries } from "./lib/soql";

// Monthly revenue trends
const soql = OpportunityQueries.monthlyRevenue(12);

// Gift size distribution
const soql = OpportunityQueries.giftDistribution();
```

#### Query Builder (`query-builder.ts`)

**Purpose:** Convert criteria to SOQL

```typescript
import { buildSoqlFromCriteria } from "./lib/soql";

const { soql, meta } = buildSoqlFromCriteria("major donors over $10k", 25);
// Returns: { soql: "SELECT...", meta: { segment: "major_donors_over", amount: 10000 } }
```

#### NLP Parser (`nlp-parser.ts`)

**Purpose:** Natural language to SOQL

```typescript
import { nlToSoql } from "./lib/soql";

const { soql, explanation } = nlToSoql("How many donations this month?");
// Returns: { soql: "SELECT COUNT()...", explanation: "Count of won..." }
```

### 5. MCP Tools (`src/lib/tools/`)

**Purpose:** Tool implementations for MCP server

#### SOQL Tools (`soql-tools.ts`)

```typescript
export async function runSoql(
  client: SalesforceClient,
  query: string,
  limit: number
): Promise<string>
```

#### Record Tools (`record-tools.ts`)

```typescript
export async function createRecord(
  client: SalesforceClient,
  sobject: string,
  fields: Record<string, any>
): Promise<string>

export async function updateRecord(
  client: SalesforceClient,
  sobject: string,
  recordId: string,
  fields: Record<string, any>
): Promise<string>

export async function deleteRecord(
  client: SalesforceClient,
  sobject: string,
  recordId: string
): Promise<string>
```

#### Donor Tools (`donor-tools.ts`)

```typescript
export async function queryDonors(
  client: SalesforceClient,
  criteria: string,
  limit: number
): Promise<string>
```

## 🚀 Adding New Features

### Example: Add a "Campaign Analytics" Tool

**Step 1:** Create campaign queries

```typescript
// src/lib/soql/campaign-queries.ts
export function campaignPerformance(campaignId: string): string {
  return `SELECT COUNT(Id) Members, SUM(AmountWonOpportunities) Revenue
    FROM CampaignMember
    WHERE CampaignId = '${campaignId}'`;
}

export const CampaignQueries = {
  campaignPerformance,
};
```

**Step 2:** Create campaign tool

```typescript
// src/lib/tools/campaign-tools.ts
import { SalesforceClient } from "../salesforce-client";
import { CampaignQueries } from "../soql/campaign-queries";

export async function analyzeCampaign(
  client: SalesforceClient,
  campaignId: string
): Promise<string> {
  const soql = CampaignQueries.campaignPerformance(campaignId);
  const result = await client.soql(soql);
  return formatCampaignResults(result);
}
```

**Step 3:** Register tool in server.ts

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

**Step 4:** Write tests

```typescript
// tests/integration/campaign.test.ts
it("should analyze campaign performance", async () => {
  const result = await client.callTool("analyze_campaign", {
    campaign_id: "701..."
  });
  expect(result).toContain("Campaign Performance");
});
```

**Step 5:** Deploy

```bash
npm test
npm run deploy
```

## 📊 Benefits of Refactoring

### Before Refactoring

❌ 770-line monolithic server.ts
❌ Mixed concerns (OAuth, queries, tools, formatting)
❌ Hard to test individual components
❌ Difficult to add new query patterns
❌ No code reuse

### After Refactoring

✅ 145-line focused server.ts
✅ Clean separation of concerns
✅ Easy to test (unit + integration)
✅ Simple to add new patterns
✅ Highly reusable modules
✅ 10 donor segments + 11 opportunity analytics ready to use

## 🎯 What's Ready Now

### Available Donor Segments

```typescript
// All these are one function call away!
DonorQueries.lapsedDonors(12, 25)
DonorQueries.majorDonorsOver(10000, 50)
DonorQueries.recentDonorsLastNMonths(6, 25)
DonorQueries.firstTimeDonors(25)
DonorQueries.recurringDonors(3, 25)
DonorQueries.upgradeCandidates(1000, 3, 25)
DonorQueries.atRiskDonors(24, 6, 2, 25)
DonorQueries.midLevelDonors(500, 5000, 25)
DonorQueries.highValueEngagedDonors(12, 3, 5000, 25)
DonorQueries.warmProspects(50, 25)
```

### Available Opportunity Analytics

```typescript
OpportunityQueries.opportunitiesByStage()
OpportunityQueries.openPipeline(25)
OpportunityQueries.recentlyWonOpportunities(30, 25)
OpportunityQueries.monthlyRevenue(12)
OpportunityQueries.quarterlyPerformance(2)
OpportunityQueries.yearOverYearComparison()
OpportunityQueries.largeGifts(10000, 25)
OpportunityQueries.giftDistribution()
OpportunityQueries.conversionMetrics(90)
OpportunityQueries.averageDaysToClose(6)
OpportunityQueries.recentlyLostOpportunities(30, 25)
```

## 🔄 Migration Notes

### Backward Compatibility

✅ All existing tools still work (run_soql, create_record, update_record)
✅ Tests pass without modifications
✅ API unchanged for existing integrations
✅ Original server.ts backed up as `server.ts.backup`

### New Features

✅ New `query_donors` tool with natural language criteria
✅ 10 donor segment patterns available
✅ 11 opportunity analytics patterns available
✅ Easy to extend with more patterns

## 📚 Next Steps

1. **Add more tools** - Expose more donor segments as dedicated tools
2. **Campaign analytics** - Add campaign-specific queries
3. **Engagement scoring** - Track donor engagement metrics
4. **Predictive analytics** - Add churn prediction, upgrade likelihood
5. **Custom reports** - Build complex multi-query reports

## 🎉 Summary

The refactored architecture provides:
- **Clean separation** of concerns
- **20+ query patterns** ready to use
- **Easy extensibility** for new features
- **Full test coverage** maintained
- **Production-ready** and deployed

All while maintaining **100% backward compatibility** with existing integrations!
