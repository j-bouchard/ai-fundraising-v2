/**
 * Metrics Collection for Cloudflare Workers Analytics Engine
 *
 * Provides structured metrics collection for monitoring:
 * - Request counts by endpoint
 * - Response times
 * - HTTP status codes
 * - Authentication failures
 * - Error rates
 */

export interface AnalyticsEngineDataset {
  writeDataPoint(data: {
    blobs?: string[];
    doubles?: number[];
    indexes?: string[];
  }): void;
}

export interface MetricsCollector {
  recordRequest(params: {
    endpoint: string;
    method: string;
    statusCode: number;
    durationMs: number;
    authenticated?: boolean;
    error?: string;
  }): void;
}

/**
 * Create a metrics collector backed by Analytics Engine
 */
export function createMetricsCollector(
  analytics?: AnalyticsEngineDataset
): MetricsCollector {
  return {
    recordRequest({ endpoint, method, statusCode, durationMs, authenticated, error }) {
      // Skip if no analytics binding available (e.g., in tests)
      if (!analytics) {
        return;
      }

      // Blobs: categorical dimensions for grouping/filtering
      // Order: endpoint, method, statusCategory, authStatus, errorType
      const statusCategory = Math.floor(statusCode / 100) + "xx"; // e.g., "2xx", "4xx", "5xx"
      const authStatus = authenticated === undefined ? "none" : authenticated ? "success" : "failed";
      const errorType = error || "none";

      // Doubles: numeric metrics
      // Order: statusCode, durationMs, requestCount
      const doubles = [statusCode, durationMs, 1]; // requestCount always 1 per call

      // Write data point (non-blocking)
      analytics.writeDataPoint({
        blobs: [endpoint, method, statusCategory, authStatus, errorType],
        doubles,
      });
    },
  };
}

/**
 * Measure duration of an async operation
 */
export async function measure<T>(
  operation: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = Date.now();
  const result = await operation();
  const durationMs = Date.now() - start;
  return { result, durationMs };
}
