# Monitoring Guide

This guide explains how to monitor the Resin MCP server using Cloudflare Workers Analytics Engine and structured logging.

## Table of Contents
- [Structured Logging](#structured-logging)
- [Viewing Logs](#viewing-logs)
- [Metrics Collection](#metrics-collection)
- [Querying Metrics](#querying-metrics)
- [Health Check Endpoints](#health-check-endpoints)

---

## Structured Logging

The Resin MCP server uses **structured JSON logging** for all operations, making logs easy to parse, search, and analyze.

### Log Format

All logs are output as JSON with the following structure:

```json
{
  "timestamp": "2025-11-03T18:32:17.216Z",
  "level": "info",
  "message": "Request received",
  "context": {
    "requestId": "req_1762194737216_f52ah49lt",
    "endpoint": "/health",
    "method": "GET"
  },
  "data": {
    "url": "/health",
    "userAgent": "curl/8.7.1",
    "statusCode": 200,
    "durationMs": 11
  }
}
```

### Log Levels

- **debug** - Detailed diagnostic information
- **info** - General informational messages (successful operations)
- **warn** - Warning messages (client errors, auth failures)
- **error** - Error messages (server errors, exceptions)

### What Gets Logged

Every request automatically logs:
- Request received (with endpoint, method, user agent)
- Authentication attempts and failures
- Salesforce connection status
- Request completion (with status code and duration)
- All errors with full stack traces

---

## Viewing Logs

### Development (Local)

When running locally with `npm run dev`, logs are displayed in the terminal:

```bash
npm run dev
# Logs appear in terminal as requests are processed
```

### Production (Live Tailing)

Use `wrangler tail` to view live logs from production:

```bash
# Basic tail (raw JSON)
npx wrangler tail

# Pretty formatted output
npx wrangler tail --format pretty

# Filter by status (show only errors)
npx wrangler tail --status error

# Filter by HTTP method
npx wrangler tail --method POST

# Combine filters
npx wrangler tail --format pretty --status error
```

### Searching Logs

Since logs are JSON, you can pipe them through `jq` for powerful filtering:

```bash
# Show only error logs
npx wrangler tail --format json | jq 'select(.level == "error")'

# Show only auth failures
npx wrangler tail --format json | jq 'select(.data.error == "invalid_api_key")'

# Show requests taking longer than 100ms
npx wrangler tail --format json | jq 'select(.data.durationMs > 100)'

# Extract just request IDs and durations
npx wrangler tail --format json | jq '{requestId: .context.requestId, duration: .data.durationMs}'
```

---

## Metrics Collection

The Resin MCP server automatically collects metrics for all requests, including:
- Request counts by endpoint
- Response times (duration in milliseconds)
- HTTP status codes
- Authentication success/failure rates
- Error types and rates

Metrics are stored in Cloudflare's Analytics Engine with a **90-day retention period**.

## Metrics Schema

Each request generates a data point with the following structure:

### Blobs (String Dimensions)
- **blob1**: Endpoint path (e.g., `/health`, `/ready`, `/mcp`)
- **blob2**: HTTP method (e.g., `GET`, `POST`)
- **blob3**: Status category (e.g., `2xx`, `4xx`, `5xx`)
- **blob4**: Authentication status (`success`, `failed`, `none`)
- **blob5**: Error type (e.g., `invalid_api_key`, `salesforce_error`, `none`)

### Doubles (Numeric Metrics)
- **double1**: HTTP status code (e.g., 200, 401, 500)
- **double2**: Request duration in milliseconds
- **double3**: Request count (always 1 per data point)

## Querying Metrics

### API Endpoint
```
POST https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/analytics_engine/sql
```

### Authentication
1. Create a Cloudflare API token with **Account Analytics** read permissions
2. Include it in requests: `Authorization: Bearer <API_TOKEN>`

### Dataset Name
All metrics are stored in the dataset: `resin_metrics`

## Example Queries

### 1. Request Count by Endpoint (Last 24 Hours)
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

### 2. Average Response Time by Endpoint
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

### 3. Status Code Distribution
```sql
SELECT
  blob3 AS status_category,
  double1 AS status_code,
  SUM(_sample_interval) AS count
FROM resin_metrics
WHERE timestamp > NOW() - INTERVAL '1' DAY
GROUP BY status_category, status_code
ORDER BY count DESC
FORMAT JSON
```

### 4. Authentication Failure Rate
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

### 5. Errors Over Time (Hourly)
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

### 6. Request Volume Over Time (Hourly)
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

### 7. Slowest Endpoints (P95 Response Time)
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

### 8. Health Check Status
```sql
SELECT
  blob1 AS endpoint,
  double1 AS status_code,
  SUM(_sample_interval) AS count
FROM resin_metrics
WHERE timestamp > NOW() - INTERVAL '1' HOUR
  AND blob1 IN ('/health', '/ready')
GROUP BY endpoint, status_code
ORDER BY endpoint, count DESC
FORMAT JSON
```

## Using curl to Query Metrics

```bash
# Set your Cloudflare credentials
ACCOUNT_ID="your-account-id"
API_TOKEN="your-api-token"

# Example: Get request counts by endpoint
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/analytics_engine/sql" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT blob1 AS endpoint, SUM(_sample_interval) AS total_requests FROM resin_metrics WHERE timestamp > NOW() - INTERVAL '\''1'\'' DAY GROUP BY endpoint ORDER BY total_requests DESC FORMAT JSON"
  }'
```

## Important Notes

### Sampling
At high request volumes, Analytics Engine may downsample data to maintain performance. Always use:
- `SUM(_sample_interval)` for counting requests (NOT `COUNT()`)
- `SUM(_sample_interval * value) / SUM(_sample_interval)` for averages

### Data Retention
Metrics are retained for **90 days**. Historical data beyond this period is automatically deleted.

### Query Limits
- SQL queries have execution time limits
- Large time ranges may need to be broken into smaller intervals

## Integration with Monitoring Tools

### Grafana
You can visualize Analytics Engine data in Grafana using the [Cloudflare GraphQL API plugin](https://grafana.com/grafana/plugins/cloudflare-cloudflare-grafana-datasource/).

### Custom Dashboards
Build custom monitoring dashboards by:
1. Creating scheduled queries via Workers Cron Triggers
2. Storing aggregated results in Cloudflare R2 or external storage
3. Serving dashboard data via API

## Health Check Endpoints

The server exposes two health check endpoints that don't require authentication:

- **GET /health** - Simple liveness check (returns 200 if Worker is running)
- **GET /ready** - Readiness check (verifies Salesforce connectivity)

These endpoints are ideal for:
- Cloudflare Health Checks
- Load balancer monitoring
- Uptime monitoring services (Pingdom, UptimeRobot, etc.)

## Next Steps

1. **Set up alerting**: Create Workers Cron jobs to query metrics and send alerts (via email, Slack, PagerDuty) when error rates exceed thresholds
2. **Build dashboards**: Create visualization dashboards using Grafana or custom web interfaces
3. **Optimize performance**: Use metrics to identify slow endpoints and optimize them
4. **Capacity planning**: Monitor request volume trends to plan for scaling

## Resources

- [Workers Analytics Engine Docs](https://developers.cloudflare.com/analytics/analytics-engine/)
- [Analytics Engine SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)
- [SQL Query Reference](https://developers.cloudflare.com/analytics/analytics-engine/sql-reference/)
