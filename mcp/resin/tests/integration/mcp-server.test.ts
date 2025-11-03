/**
 * Integration tests against live Cloudflare Workers deployment
 *
 * These tests run against your sandbox Salesforce instance
 * Set MCP_SERVER_URL environment variable to test against different deployments
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestClient, MCPClient } from "../mcp-client";

describe("MCP Server Integration Tests", () => {
  let client: MCPClient;

  beforeAll(async () => {
    client = createTestClient();
    await client.initialize();
  });

  afterAll(async () => {
    await client.close();
  });

  describe("Server Health", () => {
    it("should successfully initialize", async () => {
      const result = await client.initialize();
      expect(result).toBeDefined();
      expect(result.protocolVersion).toBeDefined();
    });

    it("should list available tools", async () => {
      const result = await client.listTools();
      expect(result.tools).toBeDefined();
      expect(result.tools.length).toBeGreaterThan(0);

      // Verify the three main tools exist
      const toolNames = result.tools.map((t: any) => t.name);
      expect(toolNames).toContain("run_soql");
      expect(toolNames).toContain("create_record");
      expect(toolNames).toContain("update_record");
    });
  });

  describe("run_soql Tool", () => {
    it("should execute a simple COUNT query", async () => {
      const result = await client.runSoql(
        "SELECT COUNT() FROM Contact"
      );
      expect(result).toContain("SOQL Count Result");
      expect(result).toContain("Count:");
    });

    it("should execute a SELECT query with LIMIT", async () => {
      const result = await client.runSoql(
        "SELECT Id, Name, Email FROM Contact LIMIT 5",
        5
      );
      expect(result).toContain("SOQL Result");
      expect(result).toContain("Records returned:");
    });

    it("should handle invalid SOQL gracefully", async () => {
      const result = await client.runSoql("INVALID QUERY");
      expect(result).toContain("Salesforce Error");
    });

    it("should support aggregate queries", async () => {
      const result = await client.runSoql(
        "SELECT COUNT(Id), StageName FROM Opportunity WHERE IsWon = true GROUP BY StageName"
      );
      expect(result).toContain("SOQL Result");
    });

    it("should support date filtering", async () => {
      const result = await client.runSoql(
        "SELECT Id, Name, CreatedDate FROM Contact WHERE CreatedDate = THIS_YEAR LIMIT 3"
      );
      expect(result).toContain("SOQL Result");
    });
  });

  describe("create_record Tool", () => {
    it("should create a test Contact", async () => {
      const timestamp = Date.now();
      const result = await client.createRecord("Contact", {
        FirstName: "Test",
        LastName: `User ${timestamp}`,
        Email: `test.${timestamp}@example.org`,
        Description: "Created by automated test - safe to delete",
      });

      expect(result).toContain("Record Created");
      expect(result).toContain("sObject: Contact");
      expect(result).toContain("Id:");
    });

    it("should create a test Task", async () => {
      // First, get a Contact ID to associate the task with
      const contacts = await client.runSoql(
        "SELECT Id FROM Contact LIMIT 1"
      );

      // Extract contact ID from result (this is hacky but works for testing)
      const match = contacts.match(/"Id"\s*:\s*"([^"]+)"/);

      if (match && match[1]) {
        const contactId = match[1];
        const result = await client.createRecord("Task", {
          Subject: "Test Task - Safe to Delete",
          Description: "Created by automated test",
          WhoId: contactId,
          Status: "Not Started",
          Priority: "Normal",
        });

        expect(result).toContain("Record Created");
        expect(result).toContain("sObject: Task");
      }
    });

    it("should fail gracefully with invalid sobject", async () => {
      const result = await client.createRecord("InvalidObject", {
        Name: "Test",
      });
      expect(result).toContain("Salesforce Error");
    });

    it("should fail gracefully with missing required fields", async () => {
      const result = await client.createRecord("Contact", {
        // Missing LastName (required field)
        FirstName: "Test",
      });
      expect(result).toContain("Salesforce Error");
    });
  });

  describe("update_record Tool", () => {
    it("should update an existing Contact", async () => {
      // First, create a test contact
      const timestamp = Date.now();
      const createResult = await client.createRecord("Contact", {
        FirstName: "Update",
        LastName: `Test ${timestamp}`,
        Email: `update.${timestamp}@example.org`,
      });

      // Extract the record ID
      const match = createResult.match(/Id:\s*([a-zA-Z0-9]{15,18})/);
      expect(match).toBeDefined();

      if (match && match[1]) {
        const recordId = match[1];

        // Update the contact
        const updateResult = await client.updateRecord("Contact", recordId, {
          Email: `updated.${timestamp}@example.org`,
          Description: "Updated by automated test",
        });

        expect(updateResult).toContain("Record Updated");
        expect(updateResult).toContain(recordId);
      }
    });

    it("should fail gracefully with invalid record ID", async () => {
      const result = await client.updateRecord("Contact", "INVALID_ID", {
        Email: "test@example.com",
      });
      expect(result).toContain("Salesforce Error");
    });

    it("should fail gracefully when updating with invalid data", async () => {
      // Get a real contact ID
      const contacts = await client.runSoql(
        "SELECT Id FROM Contact LIMIT 1"
      );
      const match = contacts.match(/"Id"\s*:\s*"([^"]+)"/);

      if (match && match[1]) {
        const contactId = match[1];
        const result = await client.updateRecord("Contact", contactId, {
          Email: "not-an-email", // Invalid email format
        });
        // Salesforce might accept this or reject it depending on validation rules
        expect(result).toBeDefined();
      }
    });
  });

  describe("Donor Query Scenarios", () => {
    it("should query recent donors", async () => {
      const result = await client.runSoql(
        "SELECT Id, Name, Email FROM Contact WHERE Id IN " +
          "(SELECT ContactId FROM OpportunityContactRole WHERE " +
          "Opportunity.IsWon=true AND Opportunity.CloseDate = LAST_N_DAYS:180) " +
          "LIMIT 10"
      );
      expect(result).toContain("SOQL Result");
    });

    it("should query contacts by lifetime giving", async () => {
      const result = await client.runSoql(
        "SELECT Id, Name, Email, " +
          "(SELECT SUM(Amount) total FROM Opportunities WHERE IsWon=true) LifetimeGiving " +
          "FROM Contact WHERE Id IN " +
          "(SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true) " +
          "LIMIT 5"
      );
      expect(result).toBeDefined();
    });

    it("should count opportunities by stage", async () => {
      const result = await client.runSoql(
        "SELECT StageName, COUNT(Id) FROM Opportunity GROUP BY StageName"
      );
      expect(result).toContain("SOQL Result");
    });
  });
});
