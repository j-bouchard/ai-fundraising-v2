import handle from "@modelfetch/cloudflare";
import { createServer } from "./server";
import { validateApiKey } from "./auth";
import { createSalesforceClient } from "./lib/salesforce-client";
import { createMetricsCollector, type AnalyticsEngineDataset } from "./lib/metrics";
import { createLogger, generateRequestId } from "./lib/logger";

export default {
  fetch: async (request: Request, env: any, ctx: ExecutionContext) => {
    const startTime = Date.now();
    const url = new URL(request.url);
    const requestId = generateRequestId();
    const logger = createLogger({ requestId, endpoint: url.pathname, method: request.method });
    const metrics = createMetricsCollector(env.ANALYTICS as AnalyticsEngineDataset | undefined);

    logger.info("Request received", {
      url: url.pathname,
      method: request.method,
      userAgent: request.headers.get("user-agent"),
    });

    // Helper to record metrics before returning response
    const respond = (response: Response, authenticated?: boolean, error?: string) => {
      const durationMs = Date.now() - startTime;

      // Log response
      const logData = {
        statusCode: response.status,
        durationMs,
        authenticated,
      };

      if (response.status >= 500) {
        logger.error("Request failed with server error", undefined, logData);
      } else if (response.status >= 400) {
        logger.warn("Request failed with client error", { ...logData, error });
      } else {
        logger.info("Request completed", logData);
      }

      // Record metrics
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

    // Health check endpoint - simple liveness check
    if (url.pathname === "/health") {
      return respond(
        new Response(
          JSON.stringify({
            status: "ok",
            timestamp: new Date().toISOString(),
            service: "resin-mcp",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    }

    // Readiness check endpoint - checks Salesforce connectivity
    if (url.pathname === "/ready") {
      try {
        // Check if we have required Salesforce credentials
        const requiredEnvVars = [
          "SF_CLIENT_ID",
          "SF_CLIENT_SECRET",
          "SF_REFRESH_TOKEN",
          "SF_INSTANCE_URL",
        ];
        const missing = requiredEnvVars.filter((key) => !env[key]);

        if (missing.length > 0) {
          return respond(
            new Response(
              JSON.stringify({
                status: "error",
                timestamp: new Date().toISOString(),
                message: `Missing environment variables: ${missing.join(", ")}`,
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            ),
            undefined,
            "missing_env_vars"
          );
        }

        // Quick Salesforce connectivity check with timeout
        const client = createSalesforceClient(env as Record<string, string>);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Health check timeout")), 5000)
        );

        await Promise.race([
          client.soql("SELECT Id FROM Account LIMIT 1"),
          timeoutPromise,
        ]);

        return respond(
          new Response(
            JSON.stringify({
              status: "ready",
              timestamp: new Date().toISOString(),
              salesforce: "connected",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          )
        );
      } catch (error) {
        return respond(
          new Response(
            JSON.stringify({
              status: "error",
              timestamp: new Date().toISOString(),
              message:
                error instanceof Error ? error.message : "Salesforce connectivity check failed",
            }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            }
          ),
          undefined,
          error instanceof Error ? error.message : "salesforce_error"
        );
      }
    }

    // Extract API key from Authorization header
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return respond(
        new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: {
              code: -32600,
              message: "Missing Authorization header. Expected: Bearer <api-key>",
            },
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        ),
        false,
        "missing_auth_header"
      );
    }

    if (!authHeader.startsWith("Bearer ")) {
      return respond(
        new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: {
              code: -32600,
              message: "Invalid Authorization header format. Expected: Bearer <api-key>",
            },
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        ),
        false,
        "invalid_auth_format"
      );
    }

    const apiKey = authHeader.substring(7);
    const isValid = validateApiKey(apiKey, env);

    if (!isValid) {
      logger.warn("Authentication failed - invalid API key");
      return respond(
        new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: {
              code: -32600,
              message: "Unauthorized: Invalid API key",
            },
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        ),
        false,
        "invalid_api_key"
      );
    }

    logger.info("Authentication successful");

    // Create server instance with Cloudflare env bindings
    const server = createServer(env as Record<string, string>);

    try {
      const response = await handle(server)(request, env, ctx);
      return respond(response, true);
    } catch (error) {
      logger.error("MCP handler error", error);
      return respond(
        new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: {
              code: -32603,
              message: `Internal error: ${error instanceof Error ? error.message : String(error)}`,
            },
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        ),
        true,
        error instanceof Error ? error.message : "internal_error"
      );
    }
  },
};
