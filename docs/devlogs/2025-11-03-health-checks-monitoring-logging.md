# Cloudflare Deployment: Health Checks, Monitoring & Centralized Logging

**Location:** `mcp/resin/src/`
**GitHub Issue:** [#6 - Cloudflare deployment](https://github.com/j-bouchard/ai-fundraising-v2/issues/6)
**Deployed:** https://resin.mpazbot.workers.dev

## Overview

Implemented production-ready observability for the Resin MCP server with health check endpoints, automated metrics collection via Cloudflare Workers Analytics Engine, and structured JSON logging for all operations. These features enable uptime monitoring, performance analysis, and debugging without requiring external services or additional infrastructure costs.

## Core Features

### 1. Health Check Endpoints

Two unauthenticated endpoints for monitoring service health:

#### `/health` - Liveness Check
```json
{
  "status": "ok",
  "timestamp": "2025-11-03T18:32:17.216Z",
  "service": "resin-mcp"
}
```

**Purpose:** Verify the Worker is running
**Response:** 200 OK if alive
**Use cases:** Uptime monitors (Pingdom, UptimeRobot), load balancers

#### `/ready` - Readiness Check
```json
{
  "status": "ready",
  "timestamp": "2025-11-03T18:32:17.216Z",
  "salesforce": "connected"
}
```

**Purpose:** Verify service dependencies (Salesforce) are accessible
**Response:** 200 if ready, 503 if not
**Features:**
- Checks for required environment variables
- Tests Salesforce connectivity with 5-second timeout
- Returns detailed error messages on failure

**Location:** `src/index.ts:27-116`

---

### 2. Metrics Collection (Analytics Engine)

Automated metrics collection for every request without performance impact.

#### Configuration

**File:** `wrangler.jsonc`
```jsonc
{
  "analytics_engine_datasets": [
    {
      "binding": "ANALYTICS",
      "dataset": "resin_metrics"
    }
  ]
}
```

**Note:** Requires enabling Analytics Engine in Cloudflare Dashboard
**Cost:** $0.05 per million requests (10M included)
**Retention:** 90 days

#### Data Schema

Each request writes a data point with:

| Field | Type | Content | Example |
|-------|------|---------|---------|
| blob1 | string | Endpoint | `/health`, `/mcp` |
| blob2 | string | HTTP method | `GET`, `POST` |
| blob3 | string | Status category | `2xx`, `4xx`, `5xx` |
| blob4 | string | Auth status | `success`, `failed`, `none` |
| blob5 | string | Error type | `invalid_api_key`, `none` |
| double1 | number | Status code | 200, 401, 500 |
| double2 | number | Duration (ms) | 11, 250 |
| double3 | number | Request count | Always 1 |

#### Implementation

**Location:** `src/lib/metrics.ts`

```typescript
export function createMetricsCollector(
  analytics?: AnalyticsEngineDataset
): MetricsCollector {
  return {
    recordRequest({ endpoint, method, statusCode, durationMs, authenticated, error }) {
      if (!analytics) return;

      analytics.writeDataPoint({
        blobs: [endpoint, method, statusCategory, authStatus, errorType],
        doubles: [statusCode, durationMs, 1],
      });
    },
  };
}
```

**Why non-blocking?** `writeDataPoint()` returns immediately; Workers runtime handles writes in background with zero performance impact.

#### Usage in Request Handler

**Location:** `src/index.ts:11,14,23-50`

```typescript
const metrics = createMetricsCollector(env.ANALYTICS);

const respond = (response: Response, authenticated?: boolean, error?: string) => {
  const durationMs = Date.now() - startTime;
  metrics.recordRequest({
    endpoint: url.pathname,
    method: request.method,
    statusCode: response.status,
    durationMs,
    authenticated,
    error,
  });
  return response;
};
```

---

### 3. Structured JSON Logging

All operations log structured JSON for easy parsing and analysis.

#### Log Format

Every log entry follows this structure:

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
    "durationMs": 11,
    "authenticated": false
  }
}
```

#### Log Levels

| Level | Purpose | Console Method | Example |
|-------|---------|---------------|---------|
| debug | Diagnostic details | `console.debug()` | Cache hits, detailed traces |
| info | Normal operations | `console.log()` | Request received, completed |
| warn | Client errors | `console.warn()` | Auth failures (401, 403) |
| error | Server errors | `console.error()` | Exceptions, 5xx errors |

#### Logger Implementation

**Location:** `src/lib/logger.ts`

```typescript
export function createLogger(context?: LogContext): Logger {
  function log(level: LogLevel, message: string, data?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
    };

    if (error) {
      entry.error = {
        message: error.message,
        name: error.name,
        stack: error.stack,
      };
    }

    console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
  }

  return { debug, info, warn, error, child };
}
```

**Features:**
- Automatic request ID generation
- Context propagation (requestId, module, endpoint)
- Error stack trace capture
- Child logger support for nested contexts

#### Usage Patterns

**Request Logging:**
```typescript
const logger = createLogger({
  requestId: generateRequestId(),
  endpoint: url.pathname,
  method: request.method
});

logger.info("Request received", {
  url: url.pathname,
  userAgent: request.headers.get("user-agent"),
});

logger.info("Request completed", {
  statusCode: 200,
  durationMs: 11,
});
```

**Module-Specific Logging:**
```typescript
const logger = createLogger({ module: "salesforce-client" });
logger.info("Connected to Salesforce", { instanceUrl });
```

**Error Logging:**
```typescript
try {
  await operation();
} catch (error) {
  logger.error("Operation failed", error, { context: "additional data" });
}
```

---

## Viewing Logs

### Development (Local)

Logs appear in terminal when running:

```bash
npm run dev
```

**Output:**
```json
{"timestamp":"2025-11-03T18:30:04.421Z","level":"info","message":"Request received","context":{"requestId":"req_1762194604420_w411irfeg","endpoint":"/health","method":"GET"},"data":{"url":"/health","method":"GET","userAgent":"curl/8.7.1"}}
```

### Production (Live Tailing)

Use `wrangler tail` to stream live logs:

```bash
# Basic tail with pretty formatting
npx wrangler tail --format pretty

# Filter by status
npx wrangler tail --status error

# Filter by HTTP method
npx wrangler tail --method POST

# Combine filters
npx wrangler tail --format pretty --status error
```

### Advanced Log Filtering

Pipe logs through `jq` for powerful queries:

```bash
# Show only errors
npx wrangler tail --format json | jq 'select(.level == "error")'

# Show auth failures
npx wrangler tail --format json | jq 'select(.data.error == "invalid_api_key")'

# Show slow requests (>100ms)
npx wrangler tail --format json | jq 'select(.data.durationMs > 100)'

# Extract request IDs and durations
npx wrangler tail --format json | jq '{requestId: .context.requestId, duration: .data.durationMs}'
```

---

## Querying Metrics

### API Access

Metrics are queried via Cloudflare's SQL API:

```bash
POST https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/analytics_engine/sql
Authorization: Bearer <API_TOKEN>
```

**Requirements:**
- Cloudflare API token with "Account Analytics" read permissions
- Account ID from Cloudflare Dashboard

### Example Queries

#### Request Count by Endpoint (Last 24h)

```sql
SELECT
  blob1 AS endpoint,
  SUM(_sample_interval) AS total_requests
FROM resin_metrics
WHERE timestamp > NOW() - INTERVAL '1' DAY
GROUP BY endpoint
ORDER BY total_requests DESC
FORMAT JSON
```

**Why `SUM(_sample_interval)`?** At high volumes, Analytics Engine downsamples data. The `_sample_interval` field indicates sampling rate, so always sum it instead of using `COUNT()`.

#### Average Response Time by Endpoint

```sql
SELECT
  blob1 AS endpoint,
  SUM(_sample_interval * double2) / SUM(_sample_interval) AS avg_duration_ms
FROM resin_metrics
WHERE timestamp > NOW() - INTERVAL '1' DAY
GROUP BY endpoint
ORDER BY avg_duration_ms DESC
FORMAT JSON
```

#### Authentication Failure Analysis

```sql
SELECT
  blob4 AS auth_status,
  blob5 AS error_type,
  SUM(_sample_interval) AS count
FROM resin_metrics
WHERE timestamp > NOW() - INTERVAL '1' DAY
  AND blob4 = 'failed'
GROUP BY auth_status, error_type
ORDER BY count DESC
FORMAT JSON
```

#### Hourly Request Volume

```sql
SELECT
  toStartOfHour(timestamp) AS hour,
  blob1 AS endpoint,
  SUM(_sample_interval) AS request_count
FROM resin_metrics
WHERE timestamp > NOW() - INTERVAL '24' HOUR
GROUP BY hour, endpoint
ORDER BY hour DESC
FORMAT JSON
```

#### P95 Response Times

```sql
SELECT
  blob1 AS endpoint,
  quantile(0.95)(double2) AS p95_duration_ms
FROM resin_metrics
WHERE timestamp > NOW() - INTERVAL '1' DAY
GROUP BY endpoint
ORDER BY p95_duration_ms DESC
FORMAT JSON
```

#### Error Rate Over Time

```sql
SELECT
  toStartOfHour(timestamp) AS hour,
  blob5 AS error_type,
  SUM(_sample_interval) AS error_count
FROM resin_metrics
WHERE timestamp > NOW() - INTERVAL '7' DAY
  AND blob5 != 'none'
GROUP BY hour, error_type
ORDER BY hour DESC, error_count DESC
FORMAT JSON
```

### Using curl

```bash
ACCOUNT_ID="your-account-id"
API_TOKEN="your-api-token"

curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/analytics_engine/sql" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT blob1 AS endpoint, SUM(_sample_interval) AS total FROM resin_metrics WHERE timestamp > NOW() - INTERVAL '\''1'\'' DAY GROUP BY endpoint FORMAT JSON"
  }'
```

---

## Architecture Decisions

### Why Analytics Engine Over Custom Metrics?

**Alternatives considered:**
1. ❌ **Custom metrics to R2** - Requires writes on every request, added latency
2. ❌ **Third-party APM (Datadog, New Relic)** - Additional cost, external dependencies
3. ✅ **Analytics Engine** - Native Cloudflare, zero performance impact, low cost

**Benefits:**
- Non-blocking writes (zero latency impact)
- Native Cloudflare integration
- SQL query interface
- 90-day retention included
- $0.05/million requests (10M included)

### Why Structured Logging Over Plain Text?

**Alternatives considered:**
1. ❌ **Plain text logs** - Difficult to parse, search, and analyze
2. ❌ **Semi-structured** - Inconsistent format across modules
3. ✅ **JSON structured logs** - Easy parsing, queryable, compatible with log aggregators

**Benefits:**
- Easy filtering with `jq`
- Compatible with Logpush (future Phase 2)
- Searchable by any field
- Machine-readable for automation
- Consistent format across all modules

### Why Two Health Endpoints?

**Pattern:**
- `/health` - Liveness (is Worker alive?)
- `/ready` - Readiness (can Worker handle requests?)

**Why separate?**
- Load balancers need fast liveness checks
- Dependency checks (Salesforce) can timeout
- Kubernetes-style health check pattern
- Different failure domains

---

## Best Practices

### ✅ Do

- Use structured logging for all operations
- Include request IDs for request tracing
- Log both request start and completion
- Record metrics for all endpoints
- Keep health checks fast (<100ms)
- Query metrics with proper sampling (`SUM(_sample_interval)`)
- Use `wrangler tail` for debugging production issues
- Filter logs by level when troubleshooting

### ❌ Don't

- Don't log sensitive data (API keys, tokens, PII)
- Don't use plain `console.log()` without structure
- Don't use `COUNT()` for Analytics Engine (use `SUM(_sample_interval)`)
- Don't add authentication to health check endpoints
- Don't perform expensive operations in `/health`
- Don't rely on logs for metrics (use Analytics Engine)
- Don't forget to enable Analytics Engine in Dashboard before deploying

---

## Files Changed

### New Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/lib/metrics.ts` | Metrics collection module | 72 |
| `src/lib/logger.ts` | Structured logging module | 120 |
| `mcp/resin/MONITORING.md` | Comprehensive monitoring guide | 350+ |

### Modified Files

| File | Changes | Impact |
|------|---------|--------|
| `src/index.ts` | Health endpoints, metrics, logging | Request lifecycle |
| `src/auth.ts` | Structured logging for auth failures | Authentication |
| `src/lib/salesforce-client.ts` | Structured logging for SF connections | Salesforce integration |
| `src/stdio.ts` | Logging for STDIO mode | Local development |
| `wrangler.jsonc` | Analytics Engine binding | Configuration |

---

## Testing Performed

### Local Development

```bash
npm run dev

# Test health endpoint
curl http://localhost:8787/health
# ✅ Returns 200 OK with structured JSON

# Test ready endpoint
curl http://localhost:8787/ready
# ✅ Returns 503 (no SF creds in local dev)

# Test auth failure
curl http://localhost:8787/mcp
# ✅ Returns 401 with error logging

# Verify structured logs in terminal
# ✅ All logs output as JSON with proper structure
```

### Production Deployment

```bash
npm run deploy
# ✅ Deployed successfully with Analytics Engine binding

# Test production health endpoints
curl https://resin.mpazbot.workers.dev/health
curl https://resin.mpazbot.workers.dev/ready
# ✅ Both endpoints working correctly

# View live logs
npx wrangler tail --format pretty
# ✅ Structured logs streaming from production

# Generate test traffic and verify metrics
curl https://resin.mpazbot.workers.dev/health
curl https://resin.mpazbot.workers.dev/mcp
# ✅ Metrics recorded in resin_metrics dataset
```

---

## Future Enhancements (Phase 2 - Deferred)

### Logpush to R2

Enable automatic log shipping to Cloudflare R2:

```jsonc
{
  "logpush": true
}
```

**Benefits:**
- Long-term log retention (>90 days)
- Batch processing for analysis
- Integration with external tools
- Compliance requirements

**Configuration:**
1. Create Logpush job in Cloudflare Dashboard
2. Point to R2 bucket
3. Set up log rotation policy
4. Query historical logs with Workers SQL

### Custom Alerting

Create Workers Cron jobs for automated alerts:

```typescript
// Alert on error rate spike
export default {
  async scheduled(event, env, ctx) {
    const query = `
      SELECT COUNT(*) as errors
      FROM resin_metrics
      WHERE timestamp > NOW() - INTERVAL '5' MINUTE
        AND double1 >= 500
    `;

    const result = await queryAnalytics(query);
    if (result.errors > 100) {
      await sendAlert("High error rate detected!");
    }
  }
};
```

**Alert destinations:**
- Email via SendGrid
- Slack webhooks
- PagerDuty integration
- Custom HTTP endpoints

### Grafana Dashboards

Visualize metrics with Grafana:

1. Install Cloudflare GraphQL plugin
2. Connect to Analytics Engine dataset
3. Create dashboards with panels:
   - Request volume over time
   - Response time percentiles
   - Error rate trends
   - Auth failure analysis

---

## Related Documentation

- **Monitoring Guide:** `mcp/resin/MONITORING.md`
- **GitHub Issue:** [#6 - Cloudflare deployment](https://github.com/j-bouchard/ai-fundraising-v2/issues/6)
- **Architecture:** `mcp/resin/docs/ARCHITECTURE.md`
- **Cloudflare Analytics Engine:** https://developers.cloudflare.com/analytics/analytics-engine/
- **Workers Logpush:** https://developers.cloudflare.com/workers/observability/logs/logpush/

---

## Summary

Completed all three items from GitHub issue #6:

✅ **Health Check Endpoints** - `/health` and `/ready` for uptime monitoring
✅ **Monitoring with Cloudflare Resources** - Analytics Engine metrics collection
✅ **Centralized Logging** - Structured JSON logging with `wrangler tail` support

**Deployment:** https://resin.mpazbot.workers.dev
**Version:** 6d4662b1-8ad9-4a6c-9317-7dcc3f3d6fa8
**Status:** Production-ready ✅

The Resin MCP server now has production-grade observability with zero external dependencies, minimal cost ($0.05/M requests), and no performance impact. All monitoring features are native to Cloudflare Workers, ensuring reliability and simplicity.
