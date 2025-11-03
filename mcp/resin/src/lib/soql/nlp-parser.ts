/**
 * Natural Language to SOQL Parser
 *
 * Converts natural language questions into SOQL queries
 * for common fundraising analytics questions
 */

import { DonorQueries } from "./donor-queries";
import { OpportunityQueries } from "./opportunity-queries";

const DEFAULT_LIMIT = 25;

export interface NLPResult {
  soql: string;
  explanation: string;
}

/**
 * Convert natural language question to SOQL
 *
 * Examples:
 * - "How many donations have we had this month?"
 * - "Who are our top 10 donors this quarter?"
 * - "Who gave last year but hasn't given since?"
 */
export function nlToSoql(
  question: string,
  defaultLimit: number = DEFAULT_LIMIT
): NLPResult {
  const q = question.toLowerCase().trim();

  // How many donations this month?
  if (/how\s+many\s+(donation|gift)s?.*this\s+month/.test(q)) {
    return {
      soql: "SELECT COUNT() FROM Opportunity WHERE IsWon = true AND CloseDate = THIS_MONTH",
      explanation: "Count of won opportunities in the current month",
    };
  }

  // How many donations this year?
  if (/how\s+many\s+(donation|gift)s?.*this\s+year/.test(q)) {
    return {
      soql: "SELECT COUNT() FROM Opportunity WHERE IsWon = true AND CloseDate = THIS_YEAR",
      explanation: "Count of won opportunities in the current year",
    };
  }

  // Total revenue this month/quarter/year
  if (/total\s+(revenue|raised|donations?).*this\s+(month|quarter|year)/.test(q)) {
    const match = q.match(/this\s+(month|quarter|year)/);
    const period = match ? match[1].toUpperCase() : "MONTH";
    return {
      soql: `SELECT SUM(Amount) TotalRevenue FROM Opportunity WHERE IsWon = true AND CloseDate = THIS_${period}`,
      explanation: `Total revenue for the current ${period.toLowerCase()}`,
    };
  }

  // Top N donors this quarter/year
  const topMatch = q.match(/top\s+(\d+)\s+donor/);
  const topN = topMatch ? parseInt(topMatch[1], 10) : 10;
  if (q.includes("top") && q.includes("donor")) {
    let period = "YEAR";
    if (q.includes("quarter")) period = "QUARTER";
    if (q.includes("month")) period = "MONTH";

    return {
      soql:
        `SELECT ContactId, SUM(Opportunity.Amount) total ` +
        `FROM OpportunityContactRole ` +
        `WHERE Opportunity.IsWon = true AND Opportunity.CloseDate = THIS_${period} ` +
        `GROUP BY ContactId ORDER BY SUM(Opportunity.Amount) DESC ` +
        `LIMIT ${topN}`,
      explanation: `Top ${topN} donors this ${period.toLowerCase()} by total won amount`,
    };
  }

  // Last year but not this year (lapsed)
  if (
    (q.includes("last year") || q.includes("this time last year")) &&
    (q.includes("hasn't given since") ||
      q.includes("not since") ||
      q.includes("haven't given since"))
  ) {
    return {
      soql:
        `SELECT Id, Name, Email FROM Contact WHERE Id IN (` +
        `SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true AND Opportunity.CloseDate = LAST_YEAR) ` +
        `AND Id NOT IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true AND Opportunity.CloseDate = THIS_YEAR) ` +
        `LIMIT ${defaultLimit}`,
      explanation: "Contacts who gave last year but not yet this year",
    };
  }

  // Recent donors N months
  const monthsMatch = q.match(/last\s*(\d+)\s*months?/);
  if ((q.includes("donor") || q.includes("gift")) && monthsMatch) {
    const months = Math.max(1, parseInt(monthsMatch[1], 10));
    return {
      soql: DonorQueries.recentDonorsLastNMonths(months, defaultLimit),
      explanation: `Contacts with gifts in the last ${months} months`,
    };
  }

  // Average gift size
  if (/average\s+(gift|donation)\s*(size|amount)?/.test(q)) {
    let period = "YEAR";
    if (q.includes("this month")) period = "MONTH";
    if (q.includes("this quarter")) period = "QUARTER";

    return {
      soql: `SELECT AVG(Amount) AverageGift FROM Opportunity WHERE IsWon = true AND CloseDate = THIS_${period}`,
      explanation: `Average gift size for the current ${period.toLowerCase()}`,
    };
  }

  // Largest gift
  if (/largest|biggest|highest\s+(gift|donation)/.test(q)) {
    let period = "YEAR";
    if (q.includes("this month")) period = "MONTH";
    if (q.includes("this quarter")) period = "QUARTER";
    if (q.includes("all time") || q.includes("ever")) period = null;

    const whereClause = period
      ? `WHERE IsWon = true AND CloseDate = THIS_${period}`
      : "WHERE IsWon = true";

    return {
      soql: `SELECT Id, Name, Amount, CloseDate FROM Opportunity ${whereClause} ORDER BY Amount DESC LIMIT 1`,
      explanation: period
        ? `Largest gift for the current ${period.toLowerCase()}`
        : "Largest gift of all time",
    };
  }

  // How many lapsed donors?
  if (/how\s+many.*lapsed/.test(q)) {
    const monthsMatch = q.match(/(\d+)\s*months?/);
    const months = monthsMatch ? parseInt(monthsMatch[1], 10) : 12;
    const days = months * 30;

    return {
      soql:
        `SELECT COUNT(Id) FROM Contact ` +
        `WHERE Id IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true) ` +
        `AND Id NOT IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true AND Opportunity.CloseDate = LAST_N_DAYS:${days})`,
      explanation: `Count of donors who haven't given in ${months} months`,
    };
  }

  // Who are my major donors?
  if (/who.*major\s+donors?/.test(q)) {
    const amountMatch = q.match(/\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+[kKmMbB]?)/);
    let amount = 10000; // Default
    if (amountMatch) {
      const raw = amountMatch[1].toLowerCase();
      if (raw.endsWith("k")) amount = parseFloat(raw) * 1000;
      else if (raw.endsWith("m")) amount = parseFloat(raw) * 1000000;
      else amount = parseFloat(raw.replace(/,/g, ""));
    }

    return {
      soql: DonorQueries.majorDonorsOver(amount, defaultLimit),
      explanation: `Donors with lifetime giving over $${amount.toLocaleString()}`,
    };
  }

  // Monthly trends / revenue by month
  if (/revenue.*by\s+month|monthly\s+(revenue|trends?)/.test(q)) {
    return {
      soql: OpportunityQueries.monthlyRevenue(12),
      explanation: "Monthly revenue trends for the last 12 months",
    };
  }

  // Fallback: recent donors 6 months
  return {
    soql: DonorQueries.recentDonorsLastNMonths(6, defaultLimit),
    explanation: "Fallback: recent donors in the last 6 months",
  };
}
