/**
 * Donor-specific Tool Implementations
 *
 * These tools use the SOQL query builders to provide
 * domain-specific donor analytics
 */

import { SalesforceClient } from "../salesforce-client";
import { header, fmtCurrency, fmtDate } from "../utils";
import { buildSoqlFromCriteria } from "../soql/query-builder";

const DEFAULT_LIMIT = 25;

/**
 * Query donors based on natural language criteria
 */
export async function queryDonors(
  client: SalesforceClient,
  criteria: string,
  limit: number = DEFAULT_LIMIT
): Promise<string> {
  const { soql, meta } = buildSoqlFromCriteria(criteria, limit);

  try {
    const result = await client.soql(soql);
    const records = result.records.slice(0, limit);

    const insights = [
      `Segment: ${meta.segment}`,
      "Prioritize donors with higher lifetime giving and recent engagement.",
    ];

    const steps = [
      "Create follow-up tasks for top 5 donors.",
      "Draft personalized outreach acknowledging specific past gifts.",
    ];

    return formatRecords("Donor Results", records, insights, steps);
  } catch (error: any) {
    return (
      header("SOQL Error") +
      `\n- Query: \`${soql}\`\n- Message: ${error.message}\n- Suggestion: Check field names and ensure NPSP is installed.`
    );
  }
}

/**
 * Format donor records with insights and next steps
 */
function formatRecords(
  title: string,
  records: any[],
  insights: string[],
  nextSteps: string[]
): string {
  const lines: string[] = [header(title)];

  for (const r of records) {
    const name = r.Name || r.Contact?.Name || "Unknown";
    const email = r.Email || "";
    const total = r.LifetimeGiving || r.total || r.attributes?.total;
    const last = r.LastGiftDate || r.lastGiftDate;

    lines.push(`- Name: ${name}`);
    if (email) lines.push(`  - Email: ${email}`);
    if (total !== undefined) {
      lines.push(`  - Lifetime Giving: ${fmtCurrency(parseFloat(total))}`);
    }
    if (last) {
      lines.push(`  - Last Gift: ${fmtDate(last)}`);
    }
  }

  if (insights.length > 0) {
    lines.push("");
    lines.push(header("AI Insights"));
    lines.push(...insights.map((i) => `- ${i}`));
  }

  if (nextSteps.length > 0) {
    lines.push("");
    lines.push(header("Next Steps"));
    lines.push(...nextSteps.map((n) => `- ${n}`));
  }

  return lines.join("\n");
}
