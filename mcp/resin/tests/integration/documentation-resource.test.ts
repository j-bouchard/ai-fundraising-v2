/**
 * Integration tests for documentation resources
 *
 * Tests that the server properly exposes documentation as MCP resources
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestClient, MCPClient } from "../mcp-client";

describe("Documentation Resource Tests", () => {
  let client: MCPClient;

  beforeAll(async () => {
    client = createTestClient();
    await client.initialize();
  });

  afterAll(async () => {
    await client.close();
  });

  describe("Resource Discovery", () => {
    it("should list available resources", async () => {
      const result = await client.listResources();
      expect(result.resources).toBeDefined();
      expect(Array.isArray(result.resources)).toBe(true);
    });

    it("should expose capabilities documentation resource", async () => {
      const result = await client.listResources();
      const capabilitiesResource = result.resources.find(
        (r: any) => r.uri === "resin://docs/capabilities"
      );

      expect(capabilitiesResource).toBeDefined();
      expect(capabilitiesResource.name).toBe("capabilities");
      expect(capabilitiesResource.description).toContain("overview");
      expect(capabilitiesResource.mimeType).toBe("text/markdown");
    });
  });

  describe("Capabilities Documentation", () => {
    it("should read capabilities documentation", async () => {
      const result = await client.readResource("resin://docs/capabilities");

      expect(result.contents).toBeDefined();
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBeGreaterThan(0);

      const content = result.contents[0];
      expect(content.uri).toBe("resin://docs/capabilities");
      expect(content.mimeType).toBe("text/markdown");
      expect(content.text).toBeDefined();
    });

    it("should contain overview section", async () => {
      const result = await client.readResource("resin://docs/capabilities");
      const text = result.contents[0].text;

      expect(text).toContain("# Resin MCP Server");
      expect(text).toContain("What is Resin?");
      expect(text).toContain("Cloudflare Workers");
      expect(text).toContain("Model Context Protocol");
    });

    it("should document all four tools", async () => {
      const result = await client.readResource("resin://docs/capabilities");
      const text = result.contents[0].text;

      // Check that all four tools are documented
      expect(text).toContain("run_soql");
      expect(text).toContain("create_record");
      expect(text).toContain("update_record");
      expect(text).toContain("query_donors");
    });

    it("should include authentication information", async () => {
      const result = await client.readResource("resin://docs/capabilities");
      const text = result.contents[0].text;

      expect(text).toContain("Authentication");
      expect(text).toContain("Bearer");
      expect(text).toContain("api-key");
    });

    it("should describe SOQL tool capabilities", async () => {
      const result = await client.readResource("resin://docs/capabilities");
      const text = result.contents[0].text;

      expect(text).toContain("Execute SOQL queries");
      expect(text).toContain("COUNT()");
      expect(text).toContain("aggregations");
      expect(text).toContain("subqueries");
    });

    it("should describe donor query patterns", async () => {
      const result = await client.readResource("resin://docs/capabilities");
      const text = result.contents[0].text;

      // Check for key donor segments
      expect(text).toContain("Lapsed donors");
      expect(text).toContain("Major donors");
      expect(text).toContain("Recent donors");
      expect(text).toContain("First-time donors");
      expect(text).toContain("Recurring donors");
    });

    it("should describe the data model", async () => {
      const result = await client.readResource("resin://docs/capabilities");
      const text = result.contents[0].text;

      expect(text).toContain("Data Model");
      expect(text).toContain("NPSP");
      expect(text).toContain("Contact");
      expect(text).toContain("Opportunity");
      expect(text).toContain("Campaign");
    });

    it("should include example workflows", async () => {
      const result = await client.readResource("resin://docs/capabilities");
      const text = result.contents[0].text;

      expect(text).toContain("Common Workflows");
      expect(text).toContain("Donor Outreach");
      expect(text).toContain("Major Gift");
      expect(text).toContain("Reporting");
    });

    it("should describe performance features", async () => {
      const result = await client.readResource("resin://docs/capabilities");
      const text = result.contents[0].text;

      expect(text).toContain("Performance Features");
      expect(text).toContain("caching");
      expect(text).toContain("OAuth");
    });
  });

  describe("Resource Error Handling", () => {
    it("should handle non-existent resource gracefully", async () => {
      try {
        await client.readResource("resin://docs/nonexistent");
        // If we get here without error, fail the test
        expect(true).toBe(false);
      } catch (error: any) {
        // Should throw an error
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
      }
    });
  });
});
