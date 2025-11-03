import handle from "@modelfetch/cloudflare";
import { createServer } from "./server";
import { validateApiKey } from "./auth";

export default {
  fetch: async (request: Request, env: any, ctx: ExecutionContext) => {
    // Extract API key from Authorization header
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
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
      );
    }

    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
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
      );
    }

    const apiKey = authHeader.substring(7);
    const isValid = validateApiKey(apiKey, env);

    if (!isValid) {
      console.log("❌ Unauthenticated request - invalid API key");
      return new Response(
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
      );
    }

    console.log("✅ Authenticated request");

    // Create server instance with Cloudflare env bindings
    const server = createServer(env as Record<string, string>);

    try {
      return await handle(server)(request, env, ctx);
    } catch (error) {
      console.error("💥 Handler error:", error);
      return new Response(
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
      );
    }
  },
};
