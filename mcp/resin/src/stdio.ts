#!/usr/bin/env node
/**
 * STDIO entry point for the Fundraising MCP Server
 * This file is used when running the server in STDIO mode (e.g., for Goose, Claude Desktop)
 */
import { createStdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./server.js";

async function main() {
  const transport = createStdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
