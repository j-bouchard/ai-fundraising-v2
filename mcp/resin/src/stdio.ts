#!/usr/bin/env node
/**
 * STDIO entry point for the Fundraising MCP Server
 * This file is used when running the server in STDIO mode (e.g., for Goose, Claude Desktop)
 */
import { createStdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./server.js";
import { createLogger } from "./lib/logger.js";

async function main() {
  const logger = createLogger({ module: "stdio" });
  logger.info("Starting MCP server in STDIO mode");

  const transport = createStdioServerTransport();
  await server.connect(transport);

  logger.info("MCP server connected and ready");
}

main().catch((error) => {
  const logger = createLogger({ module: "stdio" });
  logger.error("Fatal startup error", error);
  process.exit(1);
});
