/**
 * API Key authentication for Resin MCP Server
 * Validates Bearer token from Authorization header
 */

import { createLogger } from "./lib/logger";

/**
 * Validates API key from Authorization header against environment variable
 * @param apiKey - The API key extracted from Bearer token
 * @param env - Environment variables containing API_KEY
 * @returns true if valid, false otherwise
 */
export function validateApiKey(apiKey: string, env: any): boolean {
  const logger = createLogger({ module: "auth" });
  const expectedKey = env.API_KEY;

  if (!expectedKey) {
    logger.error("API_KEY not configured in environment - authentication will fail for all requests");
    return false;
  }

  if (!apiKey) {
    return false;
  }

  return apiKey === expectedKey;
}
