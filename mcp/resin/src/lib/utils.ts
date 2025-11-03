/**
 * Utility functions for formatting, parsing, and data manipulation
 */

// ------------------------------------------------------------
// Formatting Functions
// ------------------------------------------------------------

export function fmtCurrency(amount: number | null | undefined): string {
  if (amount == null) return "$0.00";
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function fmtDate(dt: Date | string | null | undefined): string {
  if (!dt) return "";
  const date = typeof dt === "string" ? new Date(dt) : dt;
  return date.toISOString().split("T")[0];
}

export function header(title: string): string {
  return `${title}\n${"-".repeat(Math.max(6, title.length))}`;
}

// ------------------------------------------------------------
// Parsing Functions
// ------------------------------------------------------------

export interface Timeframe {
  start: Date;
  end: Date;
}

// Regex patterns for parsing
const AMOUNT_PATTERN =
  /\$?\s*(\d{1,3}(?:[,\s]\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?|\d+\s*[kKmMbB])/;
const MONTHS_PATTERN = /(last|past)\s*(\d+)\s*(month|months)/i;
const YEARS_PATTERN = /(last|past)\s*(\d+)\s*(year|years)/i;
const SIX_MONTHS_PATTERN = /(last|past)\s*6\s*months/i;
const ONE_YEAR_PATTERN = /(last|past)\s*1\s*year/i;

/**
 * Parse dollar amounts with k/m/b suffixes
 * Examples: "$10k" -> 10000, "5.5m" -> 5500000
 */
export function parseAmount(text: string): number | null {
  const match = text.replace(/,/g, "").match(AMOUNT_PATTERN);
  if (!match) return null;

  let raw = match[1].trim().toLowerCase();
  let factor = 1;

  if (raw.endsWith("k")) {
    factor = 1000;
    raw = raw.slice(0, -1);
  } else if (raw.endsWith("m")) {
    factor = 1000000;
    raw = raw.slice(0, -1);
  } else if (raw.endsWith("b")) {
    factor = 1000000000;
    raw = raw.slice(0, -1);
  }

  try {
    return parseFloat(raw) * factor;
  } catch {
    return null;
  }
}

/**
 * Parse relative timeframe expressions
 * Examples: "last 6 months", "past 2 years"
 */
export function parseTimeframe(text: string): Timeframe | null {
  const now = new Date();

  // Check for months pattern
  let match = text.match(MONTHS_PATTERN);
  if (match) {
    const months = parseInt(match[2], 10);
    const start = new Date(now);
    start.setMonth(start.getMonth() - months);
    return { start, end: now };
  }

  // Check for years pattern
  match = text.match(YEARS_PATTERN);
  if (match) {
    const years = parseInt(match[2], 10);
    const start = new Date(now);
    start.setFullYear(start.getFullYear() - years);
    return { start, end: now };
  }

  // Check for specific patterns
  if (SIX_MONTHS_PATTERN.test(text)) {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 6);
    return { start, end: now };
  }

  if (ONE_YEAR_PATTERN.test(text)) {
    const start = new Date(now);
    start.setFullYear(start.getFullYear() - 1);
    return { start, end: now };
  }

  return null;
}

/**
 * Convert timeframe to days for SOQL queries
 */
export function timeframeToDays(timeframe: Timeframe): number {
  return Math.floor(
    (timeframe.end.getTime() - timeframe.start.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Convert months to days (approximate)
 */
export function monthsToDays(months: number): number {
  return months * 30;
}

// Export patterns for testing
export const patterns = {
  AMOUNT_PATTERN,
  MONTHS_PATTERN,
  YEARS_PATTERN,
  SIX_MONTHS_PATTERN,
  ONE_YEAR_PATTERN,
};
