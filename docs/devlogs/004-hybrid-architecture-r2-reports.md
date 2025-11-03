# Devlog 004: Hybrid Architecture - R2 Report Storage with Desktop Querying

**Date:** 2025-10-30
**Topic:** Storing generated reports in Cloudflare R2 and querying them via Goose Desktop
**Builds on:** [Devlog 003: Recipe Deployment Models](./003-recipe-deployment-models.md)

## The Insight

After considering deployment models, a hybrid architecture emerged:

**What if we run recipes on a schedule (server-side), save the generated reports to Cloudflare R2, and let customers query those reports using Goose Desktop?**

This combines:
- ✅ Automated report generation (no customer setup)
- ✅ Point-in-time snapshots for historical analysis
- ✅ Natural language querying via Goose Desktop
- ✅ Incredibly cheap storage (Cloudflare R2)
- ✅ Fast client-side queries (no heavy SOQL)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  SERVER SIDE (Automated, Scheduled)                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Cloudflare Workers Cron                                │
│    └─> Triggers recipe execution                        │
│                                                          │
│  Goose CLI (VPS/Container)                              │
│    ├─> goose run --recipe fundraising-analysis.yaml    │
│    ├─> Connects to Resin MCP                           │
│    ├─> Queries Salesforce via SOQL                     │
│    └─> Generates markdown report                        │
│                                                          │
│  Cloudflare R2 Storage                                  │
│    └─> Saves: customer123/reports/                      │
│        ├─ fundraising-analysis-2024-10-30.md           │
│        ├─ fundraising-analysis-2024-11-06.md           │
│        ├─ donor-segmentation-2024-10.md                │
│        └─ campaign-performance-Q4-2024.md              │
│                                                          │
└─────────────────────────────────────────────────────────┘

                         ↓ (Customer accesses)

┌─────────────────────────────────────────────────────────┐
│  CLIENT SIDE (Ad-Hoc, Interactive)                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Goose Desktop                                          │
│    └─> Connected to Resin MCP + R2 Resource Server     │
│                                                          │
│  Natural Language Queries:                              │
│    "Show me last week's fundraising analysis"          │
│    "What was our donor retention rate in October?"     │
│    "Compare Q3 and Q4 campaign performance"            │
│    "What were the top 3 recommendations from the       │
│     most recent analysis?"                             │
│                                                          │
│  Resin MCP Server                                       │
│    ├─> Lists available reports (R2 bucket)             │
│    ├─> Reads report content                            │
│    └─> Returns to Goose for AI analysis               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Why This Works Brilliantly

### 1. Point-in-Time Reports Are Perfect for Historical Analysis

Generated reports capture a **snapshot in time**:
- "Fundraising Analysis - October 30, 2024"
- Contains revenue, retention rates, recommendations as of that date
- Immutable - never changes, perfect for comparisons

**Example Queries:**
```
User: "How has our donor retention changed over the last 6 months?"

Goose:
  1. Lists reports: fundraising-analysis-2024-[05-10].md
  2. Reads retention rate from each
  3. Creates comparison table
  4. Identifies trends
```

### 2. Markdown Reports Are AI-Friendly

Reports in markdown format are:
- ✅ Human-readable
- ✅ Machine-parseable
- ✅ Perfect for LLM context
- ✅ Support tables, lists, structure
- ✅ Easy to extract specific sections

**Example Report:**
```markdown
# Fundraising Data Analysis - October 2024

## Executive Summary
- Total Revenue: $2.4M (↑15% YoY)
- Donor Retention: 68% (↓3% from Sept)
- New Donors: 245

## Revenue Analysis
| Period | Amount | Growth |
|--------|--------|--------|
| Q4 2024 | $2.4M | +15% |
| Q3 2024 | $2.1M | +8% |

## Recommendations
1. Launch re-engagement campaign for lapsed donors
2. Increase monthly giving program visibility
3. Focus on mid-level donor cultivation
```

Goose can easily:
- Extract specific metrics
- Compare across reports
- Summarize recommendations
- Answer questions about trends

### 3. Cloudflare R2 Is Incredibly Affordable

**Pricing:**
- Storage: $0.015/GB/month
- Class A operations (write): $4.50 per million
- Class B operations (read): $0.36 per million

**Example Cost (100 customers):**
- 10 reports/customer/month = 1,000 reports
- Average report size: 50KB
- Storage: 50MB = $0.0007/month
- Writes: 1,000 = $0.0045/month
- Reads: 10,000/month (heavy querying) = $0.0036/month
- **Total: ~$0.01/month** for 100 customers! 🤯

Even at scale (10,000 customers): ~$1/month

### 4. Fast Client-Side Queries

**Server-Generated (Heavy):**
- Complex SOQL queries
- Aggregations across thousands of records
- Data processing and formatting
- Takes seconds to minutes

**Client-Side Querying (Fast):**
- Read markdown file from R2 (milliseconds)
- LLM parses and extracts info
- No Salesforce API calls
- Instant responses

### 5. Offline Capability

Reports exist independently of Salesforce:
- ✅ Works even if Salesforce is down
- ✅ No API rate limits for queries
- ✅ Historical data preserved even if SF data changes
- ✅ Can analyze without SF credentials

## Implementation: Resin MCP with R2 Resources

### Add R2 Resource Support to Resin

```typescript
// src/lib/r2-resources.ts
export class R2ResourceManager {
  constructor(
    private r2Bucket: R2Bucket,
    private customerId: string
  ) {}

  async listReports(): Promise<ReportMetadata[]> {
    const prefix = `${this.customerId}/reports/`;
    const list = await this.r2Bucket.list({ prefix });

    return list.objects.map(obj => ({
      key: obj.key,
      name: this.parseReportName(obj.key),
      date: this.parseReportDate(obj.key),
      size: obj.size,
      type: this.parseReportType(obj.key)
    }));
  }

  async getReport(reportKey: string): Promise<string> {
    const object = await this.r2Bucket.get(reportKey);
    if (!object) throw new Error('Report not found');
    return await object.text();
  }

  async searchReports(query: string): Promise<ReportMetadata[]> {
    // Search by date range, type, keywords
    const allReports = await this.listReports();
    return allReports.filter(r => this.matchesQuery(r, query));
  }
}
```

### Expose as MCP Resources

```typescript
// src/server.ts
import { R2ResourceManager } from './lib/r2-resources';

// Register resource handlers
server.registerResource(
  "report://list",
  {
    title: "List Available Reports",
    description: "List all generated fundraising reports",
  },
  async () => {
    const r2 = new R2ResourceManager(env.R2_BUCKET, customerId);
    const reports = await r2.listReports();

    return {
      content: [{
        type: "text",
        text: JSON.stringify(reports, null, 2)
      }]
    };
  }
);

server.registerResource(
  "report://{reportName}",
  {
    title: "Get Report Content",
    description: "Get the full content of a specific report",
  },
  async ({ reportName }) => {
    const r2 = new R2ResourceManager(env.R2_BUCKET, customerId);
    const content = await r2.getReport(`${customerId}/reports/${reportName}`);

    return {
      content: [{
        type: "text",
        text: content
      }]
    };
  }
);
```

### Add Report Query Tool

```typescript
server.registerTool(
  "query_reports",
  {
    title: "Query Generated Reports",
    description: "Search and retrieve fundraising reports by date, type, or content",
    inputSchema: {
      date_range: z.string().optional().describe("Date range: 'last week', 'October 2024', etc."),
      report_type: z.enum(["fundraising-analysis", "donor-segmentation", "campaign-performance"]).optional(),
      keywords: z.array(z.string()).optional().describe("Keywords to search for in reports"),
      limit: z.number().optional().describe("Max number of reports to return")
    }
  },
  async ({ date_range, report_type, keywords, limit }) => {
    const r2 = new R2ResourceManager(env.R2_BUCKET, customerId);

    // Find matching reports
    const reports = await r2.searchReports({
      dateRange: date_range,
      type: report_type,
      keywords: keywords,
      limit: limit || 10
    });

    // Return report list or content
    if (reports.length === 1) {
      const content = await r2.getReport(reports[0].key);
      return { content: [{ type: "text", text: content }] };
    }

    return {
      content: [{
        type: "text",
        text: `Found ${reports.length} reports:\n` +
              reports.map(r => `- ${r.name} (${r.date})`).join('\n')
      }]
    };
  }
);
```

## User Experience

### Automated Report Generation (Weekly)

**Every Monday at 8am:**
```bash
# Server runs automatically
goose run --recipe mill/recipes/fundraising-analysis.yaml \
  --params analysis_period="last week" \
  --params output_file="/tmp/report.md"

# Upload to R2
aws s3 cp /tmp/report.md \
  s3://resin-reports/customer123/reports/fundraising-analysis-2024-11-04.md
```

Customer wakes up Monday morning, report is ready.

### Interactive Querying (Anytime)

**Customer opens Goose Desktop:**

```
User: "Show me last week's fundraising report"

Goose: *Calls query_reports tool with date_range="last week"*
      *Returns: fundraising-analysis-2024-11-04.md*

Here's your fundraising analysis from November 4, 2024:

Total Revenue: $2.4M (↑15% YoY)
Donor Retention: 68% (↓3% from previous month)

Key Recommendations:
1. Launch re-engagement campaign for lapsed donors
2. Increase monthly giving program visibility

Would you like me to dive deeper into any section?
```

```
User: "How has our retention rate changed over the last 3 months?"

Goose: *Calls query_reports with date_range="last 3 months", type="fundraising-analysis"*
      *Reads retention section from each report*

Here's your donor retention trend:

| Month | Retention Rate | Change |
|-------|----------------|--------|
| Sep   | 71%           | -      |
| Oct   | 68%           | ↓3%    |
| Nov   | 68%           | →      |

The retention rate dropped 3% in October and has stabilized in November.
Your October report recommended a re-engagement campaign - has that been implemented?
```

```
User: "What were our top priorities from the Q3 reports?"

Goose: *Searches all Q3 reports for recommendation sections*
      *Aggregates and prioritizes*

Based on your Q3 fundraising reports, the recurring priorities were:

1. **Mid-level donor cultivation** (mentioned in all 3 months)
   - Specific focus on $1,000-$5,000 donors

2. **Monthly giving program expansion** (mentioned 2x)
   - Current: 245 monthly donors
   - Goal: 500 by year-end

3. **Lapsed donor re-engagement** (mentioned 2x)
   - 180 donors who gave in 2023 but not 2024

Would you like me to create an action plan for any of these?
```

## Storage Strategy

### Directory Structure

```
resin-reports/
├── customer123/
│   ├── reports/
│   │   ├── fundraising-analysis/
│   │   │   ├── 2024-10-30.md
│   │   │   ├── 2024-11-06.md
│   │   │   └── 2024-11-13.md
│   │   ├── donor-segmentation/
│   │   │   ├── 2024-10.md
│   │   │   └── 2024-11.md
│   │   └── campaign-performance/
│   │       └── Q4-2024.md
│   └── metadata.json
└── customer456/
    └── ...
```

### Metadata File

```json
{
  "customer_id": "customer123",
  "reports": [
    {
      "type": "fundraising-analysis",
      "frequency": "weekly",
      "last_generated": "2024-11-13T08:00:00Z",
      "parameters": {
        "analysis_period": "last week"
      }
    }
  ]
}
```

## Benefits Summary

| Aspect | Benefit |
|--------|---------|
| **Cost** | ~$0.01/month per 100 customers |
| **Speed** | Client queries are instant (read markdown vs SOQL) |
| **Historical** | Easy comparison across time periods |
| **Offline** | Works without Salesforce connection |
| **Scalable** | R2 handles millions of objects |
| **AI-Friendly** | Markdown perfect for LLM context |
| **Simple** | No complex query engine needed client-side |
| **Reliable** | Reports exist even if SF data changes/deleted |

## Implementation Phases

### Phase 1: Basic R2 Storage
- [ ] Add R2 bucket binding to Resin
- [ ] Implement report upload after recipe execution
- [ ] Create basic list/get resource handlers

### Phase 2: Query Tools
- [ ] Add `query_reports` tool to Resin MCP
- [ ] Implement date range parsing
- [ ] Add report type filtering

### Phase 3: Advanced Search
- [ ] Full-text search within reports
- [ ] Keyword extraction and indexing
- [ ] Recommendation aggregation across reports

### Phase 4: Client Experience
- [ ] Goose Desktop configuration for customers
- [ ] Connection wizard (MCP server + auth)
- [ ] Example prompts and use cases

## Potential Enhancements

### Report Comparison Tool
```typescript
server.registerTool(
  "compare_reports",
  {
    title: "Compare Two Reports",
    description: "Side-by-side comparison of metrics across reports"
  },
  async ({ report1, report2, metrics }) => {
    const r1 = await r2.getReport(report1);
    const r2 = await r2.getReport(report2);

    // Extract and compare specified metrics
    return generateComparisonTable(r1, r2, metrics);
  }
);
```

### Trend Analysis
```typescript
server.registerTool(
  "analyze_trends",
  {
    title: "Analyze Trends Over Time",
    description: "Track how key metrics change across multiple reports"
  },
  async ({ metric, period }) => {
    const reports = await r2.searchReports({ dateRange: period });
    const values = reports.map(r => extractMetric(r, metric));

    return {
      trend: calculateTrend(values),
      visualization: generateSparkline(values),
      insights: generateInsights(values)
    };
  }
);
```

### Smart Recommendations
```typescript
server.registerTool(
  "track_recommendations",
  {
    title: "Track Recommendation Implementation",
    description: "See which recommendations were made and their outcomes"
  },
  async ({ date_range }) => {
    const reports = await r2.searchReports({ dateRange: date_range });

    // Extract recommendations from each report
    // Track which ones recur (not being addressed)
    // Identify which led to improvements

    return recommendationTrackingReport;
  }
);
```

## Security Considerations

1. **Customer Isolation**: Each customer has their own R2 prefix
2. **Authentication**: MCP server verifies customer identity before R2 access
3. **Report Privacy**: Reports contain customer's SF data, must be secured
4. **Access Logs**: Track who accessed which reports when

## Cost Projection

**For 1,000 customers:**
- 4 reports/customer/month = 4,000 reports
- 50KB average = 200MB total
- Storage: $0.003/month
- Writes: 4,000 = $0.018/month
- Reads: 40,000/month (10 per customer) = $0.014/month
- **Total: ~$0.04/month** 🎉

Even at massive scale, R2 storage is negligible compared to compute/bandwidth costs.

## Conclusion

This hybrid architecture elegantly separates concerns:

**Server (Heavy Lifting):**
- Scheduled recipe execution
- Complex SOQL queries
- Data aggregation
- Report generation

**Client (Smart Querying):**
- Natural language over reports
- Historical comparisons
- Trend analysis
- Quick insights

**Result:**
- ✅ Customers get automated reports
- ✅ No technical setup required
- ✅ Can query naturally via Goose Desktop
- ✅ Incredibly affordable
- ✅ Fast and reliable
- ✅ Historical analysis built-in

The point-in-time nature of generated reports is a **feature, not a bug**. It enables powerful historical analysis that would be expensive/impossible if querying Salesforce directly each time.

---

**Next Steps:**
1. Add R2 bucket to Resin Cloudflare Worker
2. Implement resource handlers for report listing/reading
3. Add `query_reports` tool
4. Test with sample reports
5. Document Goose Desktop setup for customers
