/**
 * SOQL Tool Implementations
 */

import { SalesforceClient } from "../salesforce-client";
import { header } from "../utils";

const DEFAULT_LIMIT = 25;

/**
 * Execute a SOQL query and format the results
 */
export async function runSoql(
  client: SalesforceClient,
  query: string,
  limit: number = DEFAULT_LIMIT
): Promise<string> {
  const q = query.trim();

  try {
    const res = await client.soql(q);

    // Special case for COUNT()
    if (
      res.records.length === 0 &&
      res.totalSize !== undefined &&
      q.toLowerCase().startsWith("select count")
    ) {
      return (
        header("SOQL Count Result") +
        `\n- Count: ${res.totalSize}\n- Query: \`${q}\``
      );
    }

    // Truncate for display
    const records = res.records.slice(0, limit);
    return (
      header("SOQL Result") +
      `\n- Records returned: ${records.length} of ${res.totalSize}\n- Query: \`${q}\`\n\n` +
      JSON.stringify(records, null, 2)
    );
  } catch (error: any) {
    return (
      header("Salesforce Error") +
      `\n- Unable to run SOQL. ${error.message}\n- Query: \`${q}\``
    );
  }
}
