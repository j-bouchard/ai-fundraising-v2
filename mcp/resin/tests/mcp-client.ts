/**
 * MCP Client utility for testing against deployed Cloudflare Workers
 *
 * This client uses HTTP transport to communicate with the MCP server
 */

interface MCPRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class MCPClient {
  private baseUrl: string;
  private apiKey: string | null = null;
  private requestId = 0;
  private sessionId: string | null = null;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || null;
  }

  private getNextId(): number {
    return ++this.requestId;
  }

  private async sendRequest(method: string, params?: any): Promise<any> {
    const request: MCPRequest = {
      jsonrpc: "2.0",
      id: this.getNextId(),
      method,
      params,
    };

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        ...(this.sessionId && { "X-Session-ID": this.sessionId }),
        ...(this.apiKey && { "Authorization": `Bearer ${this.apiKey}` }),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const contentType = response.headers.get("content-type") || "";

    // Handle SSE response
    if (contentType.includes("text/event-stream")) {
      const text = await response.text();
      // Parse SSE format: "event: message\ndata: {json}\n\n"
      const lines = text.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonData = line.substring(6);
          const data: MCPResponse = JSON.parse(jsonData);
          if (data.error) {
            throw new Error(`MCP Error: ${data.error.message}`);
          }
          return data.result;
        }
      }
      throw new Error("No data found in SSE response");
    }

    // Handle JSON response
    const data: MCPResponse = await response.json();

    if (data.error) {
      throw new Error(`MCP Error: ${data.error.message}`);
    }

    return data.result;
  }

  async initialize(): Promise<any> {
    return this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {
        roots: { listChanged: false },
      },
      clientInfo: {
        name: "test-client",
        version: "1.0.0",
      },
    });
  }

  async listTools(): Promise<any> {
    return this.sendRequest("tools/list");
  }

  async callTool(name: string, args: any): Promise<any> {
    return this.sendRequest("tools/call", {
      name,
      arguments: args,
    });
  }

  async listResources(): Promise<any> {
    return this.sendRequest("resources/list");
  }

  async readResource(uri: string): Promise<any> {
    return this.sendRequest("resources/read", { uri });
  }

  async runSoql(query: string, limit?: number): Promise<string> {
    const result = await this.callTool("run_soql", { query, limit });
    return result.content[0].text;
  }

  async createRecord(sobject: string, fields: Record<string, any>): Promise<string> {
    const result = await this.callTool("create_record", { sobject, fields });
    return result.content[0].text;
  }

  async updateRecord(
    sobject: string,
    record_id: string,
    fields: Record<string, any>
  ): Promise<string> {
    const result = await this.callTool("update_record", {
      sobject,
      record_id,
      fields,
    });
    return result.content[0].text;
  }

  async close(): Promise<void> {
    // Optional cleanup if needed
  }
}

/**
 * Create a test MCP client connected to the deployed server
 */
export function createTestClient(baseUrl?: string, apiKey?: string): MCPClient {
  const url = baseUrl || process.env.MCP_SERVER_URL || "https://resin.mpazbot.workers.dev/mcp";
  const key = apiKey || process.env.API_KEY;
  return new MCPClient(url, key);
}
