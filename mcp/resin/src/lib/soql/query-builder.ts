/**
 * Query Builder - High-level interface for building SOQL queries
 *
 * Provides a criteria-based interface for generating donor queries
 */

import { parseAmount, parseTimeframe, monthsToDays } from "../utils";
import { DonorQueries } from "./donor-queries";

const DEFAULT_LIMIT = 25;

export interface QueryMeta {
  segment: string;
  limit: number;
  [key: string]: any;
}

export interface QueryResult {
  soql: string;
  meta: QueryMeta;
}

/**
 * Build SOQL from natural language criteria
 *
 * Examples:
 * - "lapsed donors from last 12 months"
 * - "major donors over $10,000"
 * - "recent donors from last 6 months"
 * - "first-time donors"
 */
export function buildSoqlFromCriteria(
  criteria: string,
  limit: number = DEFAULT_LIMIT
): QueryResult {
  const text = criteria.toLowerCase().trim();
  const meta: QueryMeta = { segment: "unknown", limit };

  // Lapsed donors
  if (text.includes("lapsed")) {
    let months = 12;
    const tf = parseTimeframe(text);
    if (tf) {
      const daysDiff = Math.floor(
        (Date.now() - tf.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      months = Math.max(1, Math.floor(daysDiff / 30));
    }
    meta.segment = "lapsed_donors";
    meta.months = months;
    return {
      soql: DonorQueries.lapsedDonors(months, limit),
      meta,
    };
  }

  // Major donors
  if (text.includes("major") || text.includes("over") || text.includes("$")) {
    const amt = parseAmount(text) || 1000.0;
    meta.segment = "major_donors_over";
    meta.amount = amt;
    return {
      soql: DonorQueries.majorDonorsOver(amt, limit),
      meta,
    };
  }

  // Recent donors
  if (text.includes("recent") && text.includes("month")) {
    let months = 6;
    const tf = parseTimeframe(text);
    if (tf) {
      const daysDiff = Math.floor(
        (Date.now() - tf.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      months = Math.max(1, Math.floor(daysDiff / 30));
    }
    meta.segment = "recent_donors";
    meta.months = months;
    return {
      soql: DonorQueries.recentDonorsLastNMonths(months, limit),
      meta,
    };
  }

  // First-time donors
  if (text.includes("first")) {
    meta.segment = "first_time_donors";
    return {
      soql: DonorQueries.firstTimeDonors(limit),
      meta,
    };
  }

  // Recurring donors
  if (text.includes("recurring") || text.includes("sustain")) {
    meta.segment = "recurring_donors";
    return {
      soql: DonorQueries.recurringDonors(3, limit),
      meta,
    };
  }

  // At-risk donors
  if (text.includes("at-risk") || text.includes("at risk")) {
    meta.segment = "at_risk_donors";
    return {
      soql: DonorQueries.atRiskDonors(24, 6, 2, limit),
      meta,
    };
  }

  // Upgrade candidates
  if (text.includes("upgrade") || text.includes("candidate")) {
    const minAmount = parseAmount(text) || 1000;
    meta.segment = "upgrade_candidates";
    meta.minAmount = minAmount;
    return {
      soql: DonorQueries.upgradeCandidates(minAmount, 3, limit),
      meta,
    };
  }

  // Mid-level donors
  if (text.includes("mid-level") || text.includes("mid level")) {
    meta.segment = "mid_level_donors";
    return {
      soql: DonorQueries.midLevelDonors(500, 5000, limit),
      meta,
    };
  }

  // Default: recent donors 6 months
  meta.segment = "recent_donors";
  meta.months = 6;
  meta.defaulted = true;
  return {
    soql: DonorQueries.recentDonorsLastNMonths(6, limit),
    meta,
  };
}
