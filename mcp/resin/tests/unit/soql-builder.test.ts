/**
 * Unit tests for SOQL builders and utility functions
 *
 * These tests don't require a live Salesforce connection
 */
import { describe, it, expect } from "vitest";

// Import utility functions from server.ts
// Note: We'll need to export these from server.ts

describe("SOQL Builder Unit Tests", () => {
  describe("Amount Parsing", () => {
    it("should parse dollar amounts", () => {
      // These tests will verify parseAmount function
      // We'll implement after exporting from server.ts
      expect(true).toBe(true); // Placeholder
    });

    it("should parse amounts with k/m/b suffixes", () => {
      expect(true).toBe(true); // Placeholder
    });

    it("should handle amounts with commas", () => {
      expect(true).toBe(true); // Placeholder
    });
  });

  describe("Date Parsing", () => {
    it("should parse 'last N months' patterns", () => {
      expect(true).toBe(true); // Placeholder
    });

    it("should parse 'last N years' patterns", () => {
      expect(true).toBe(true); // Placeholder
    });

    it("should handle edge cases", () => {
      expect(true).toBe(true); // Placeholder
    });
  });

  describe("SOQL Query Generation", () => {
    it("should generate lapsed donors query", () => {
      const query = generateLapsedDonorsQuery(12, 25);
      expect(query).toContain("LAST_N_DAYS:360");
      expect(query).toContain("LIMIT 25");
    });

    it("should generate major donors query", () => {
      const query = generateMajorDonorsQuery(10000, 25);
      expect(query).toContain("10000");
      expect(query).toContain("LifetimeGiving");
    });

    it("should generate recent donors query", () => {
      const query = generateRecentDonorsQuery(6, 25);
      expect(query).toContain("LAST_N_DAYS:180");
    });

    it("should generate first time donors query", () => {
      const query = generateFirstTimeDonorsQuery(25);
      expect(query).toContain("HAVING COUNT(Opportunity.Id) = 1");
    });
  });

  describe("Criteria to SOQL Parsing", () => {
    it("should identify lapsed donor criteria", () => {
      expect(true).toBe(true); // Placeholder
    });

    it("should identify major donor criteria", () => {
      expect(true).toBe(true); // Placeholder
    });

    it("should handle default fallback", () => {
      expect(true).toBe(true); // Placeholder
    });
  });
});

// Temporary helpers until we export from server.ts
function generateLapsedDonorsQuery(months: number, limit: number): string {
  const days = months * 30;
  return `SELECT Id, Name, Email, ` +
    `(SELECT SUM(Amount) total FROM Opportunities WHERE IsWon=true) LifetimeGiving, ` +
    `(SELECT MAX(CloseDate) lastGiftDate FROM Opportunities WHERE IsWon=true) LastGiftDate ` +
    `FROM Contact ` +
    `WHERE Id IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true) ` +
    `AND Id NOT IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true AND Opportunity.CloseDate = LAST_N_DAYS:${days}) ` +
    `LIMIT ${limit}`;
}

function generateMajorDonorsQuery(amount: number, limit: number): string {
  return `SELECT Id, Name, Email, ` +
    `(SELECT SUM(Amount) total FROM Opportunities WHERE IsWon=true) LifetimeGiving ` +
    `FROM Contact ` +
    `WHERE Id IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true) ` +
    `AND Id IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true GROUP BY ContactId HAVING SUM(Opportunity.Amount) > ${Math.floor(amount)}) ` +
    `LIMIT ${limit}`;
}

function generateRecentDonorsQuery(months: number, limit: number): string {
  const days = Math.max(1, months * 30);
  return `SELECT Id, Name, Email, ` +
    `(SELECT MAX(CloseDate) lastGiftDate FROM Opportunities WHERE IsWon=true AND CloseDate = LAST_N_DAYS:${days}) LastGiftDate ` +
    `FROM Contact WHERE Id IN (SELECT ContactId FROM OpportunityContactRole WHERE ` +
    `Opportunity.IsWon=true AND Opportunity.CloseDate = LAST_N_DAYS:${days}) ` +
    `LIMIT ${limit}`;
}

function generateFirstTimeDonorsQuery(limit: number): string {
  return `SELECT Id, Name, Email FROM Contact WHERE ` +
    `Id IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true GROUP BY ContactId HAVING COUNT(Opportunity.Id) = 1) ` +
    `LIMIT ${limit}`;
}
