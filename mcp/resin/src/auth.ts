/**
 * API Key authentication for Resin MCP Server
 * Validates Bearer token from Authorization header
 */

/**
 * Validates API key from Authorization header against environment variable
 * @param apiKey - The API key extracted from Bearer token
 * @param env - Environment variables containing API_KEY
 * @returns true if valid, false otherwise
 */
export function validateApiKey(apiKey: string, env: any): boolean {
  const expectedKey = env.API_KEY;

  if (!expectedKey) {
    console.error("❌ API_KEY not configured in environment");
    return false;
  }

  if (!apiKey) {
    return false;
  }

  return apiKey === expectedKey;
}
