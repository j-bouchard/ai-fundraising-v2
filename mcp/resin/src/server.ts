/**
 * AI Fundraising MCP Server (Refactored)
 * - Modular architecture with separated concerns
 * - Easy to extend with new query patterns
 * - Clean separation: client, queries, tools, server setup
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import packageJson from "../package.json" with { type: "json" };

// Import modules
import { createSalesforceClient, SalesforceClient } from "./lib/salesforce-client";
import { runSoql } from "./lib/tools/soql-tools";
import { createRecord, updateRecord } from "./lib/tools/record-tools";
import { queryDonors } from "./lib/tools/donor-tools";

// Import documentation
import { CAPABILITIES_DOC } from "./lib/docs/capabilities";

const DEFAULT_LIMIT = 25;

// ------------------------------------------------------------
// Server Factory
// ------------------------------------------------------------

export function createServer(env: Record<string, string>) {
  const server = new McpServer({
    title: "AI Fundraising (Salesforce/NPSP)",
    name: packageJson.name,
    version: packageJson.version,
  });

  // Initialize Salesforce client
  const salesforceClient = createSalesforceClient(env);

  // ------------------------------------------------------------
  // Register Resources
  // ------------------------------------------------------------

  // Documentation Resource: Overview of server capabilities
  server.registerResource(
    "capabilities",
    "resin://docs/capabilities",
    {
      title: "Resin Server Capabilities",
      description: "Complete overview of what the Resin MCP server can do",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: CAPABILITIES_DOC,
        },
      ],
    })
  );

  // ------------------------------------------------------------
  // Register Tools
  // ------------------------------------------------------------

  // Tool 1: Run SOQL Query
  server.registerTool(
    "run_soql",
    {
      title: "Run SOQL Query",
      description:
        "Execute a SOQL query against Salesforce. Returns formatted results with record count. Supports all standard SOQL features including COUNT(), aggregations, and subqueries.",
      inputSchema: {
        query: z.string().describe("The SOQL query to execute"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(DEFAULT_LIMIT)
          .optional()
          .describe("Maximum number of records to return in display"),
      },
    },
    async ({ query, limit }) => {
      const result = await runSoql(salesforceClient, query, limit || DEFAULT_LIMIT);
      return {
        content: [{ type: "text" as const, text: result }],
      };
    }
  );

  // Tool 2: Create Salesforce Record
  server.registerTool(
    "create_record",
    {
      title: "Create Salesforce Record",
      description:
        "Create any Salesforce sObject record (Contact, Opportunity, Task, etc.). Provide the sObject type and field values. Returns the created record ID.",
      inputSchema: {
        sobject: z
          .string()
          .describe("The sObject type (e.g., Contact, Opportunity, Task)"),
        fields: z
          .record(z.any())
          .describe("Field names and values for the new record"),
      },
    },
    async ({ sobject, fields }) => {
      const result = await createRecord(salesforceClient, sobject, fields);
      return {
        content: [{ type: "text" as const, text: result }],
      };
    }
  );

  // Tool 3: Update Salesforce Record
  server.registerTool(
    "update_record",
    {
      title: "Update Salesforce Record",
      description:
        "Update any Salesforce sObject record by ID. Provide the sObject type, record ID, and fields to update.",
      inputSchema: {
        sobject: z
          .string()
          .describe("The sObject type (e.g., Contact, Opportunity, Task)"),
        record_id: z
          .string()
          .describe("The 15 or 18 character Salesforce record ID"),
        fields: z.record(z.any()).describe("Field names and new values to update"),
      },
    },
    async ({ sobject, record_id, fields }) => {
      const result = await updateRecord(salesforceClient, sobject, record_id, fields);
      return {
        content: [{ type: "text" as const, text: result }],
      };
    }
  );

  // Tool 4: Query Donors (NEW - uses criteria-based query builder)
  server.registerTool(
    "query_donors",
    {
      title: "Query Donors by Criteria",
      description:
        "Query donors using natural language criteria. Supports: lapsed donors, major donors over $X, recent donors, first-time donors, recurring donors, at-risk donors, upgrade candidates, and more.",
      inputSchema: {
        criteria: z
          .string()
          .describe(
            'Donor segment criteria (e.g., "lapsed donors from last 12 months", "major donors over $10k", "recent donors")'
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(DEFAULT_LIMIT)
          .optional()
          .describe("Maximum number of donors to return"),
      },
    },
    async ({ criteria, limit }) => {
      const result = await queryDonors(
        salesforceClient,
        criteria,
        limit || DEFAULT_LIMIT
      );
      return {
        content: [{ type: "text" as const, text: result }],
      };
    }
  );

  return server;
}

// Default export for backwards compatibility
export default createServer({});
