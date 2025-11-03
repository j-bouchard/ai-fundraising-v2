/**
 * Salesforce OAuth Client with automatic token refresh
 *
 * Supports:
 * - OAuth 2.0 refresh token flow
 * - Automatic connection on first API call
 * - Built-in caching (60-second TTL)
 * - SOQL queries, record creation, record updates
 */

import { createLogger } from "./logger";

// ------------------------------------------------------------
// Types & Interfaces
// ------------------------------------------------------------

export interface SalesforceConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  instanceUrl: string;
  domain: string;
  username?: string;
  password?: string;
  securityToken?: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  instance_url: string;
}

export interface SalesforceQueryResult {
  totalSize: number;
  done: boolean;
  records: any[];
}

export interface SalesforceCreateResponse {
  id: string;
  success: boolean;
  errors: any[];
}

// ------------------------------------------------------------
// Error Classes
// ------------------------------------------------------------

export class SalesforceAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SalesforceAuthError";
  }
}

export class SalesforceApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public salesforceErrorCode?: string,
  ) {
    super(message);
    this.name = "SalesforceApiError";
  }
}

// ------------------------------------------------------------
// Salesforce Client
// ------------------------------------------------------------

const CACHE_TTL_MS = 60000; // 60 seconds

export class SalesforceClient {
  private config: SalesforceConfig;
  private accessToken: string | null = null;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(config: SalesforceConfig) {
    this.config = config;
  }

  // ------------------------------------------------------------
  // Authentication
  // ------------------------------------------------------------

  private getTokenEndpoint(): string {
    const base =
      this.config.domain === "login"
        ? "https://login.salesforce.com"
        : "https://test.salesforce.com";
    return `${base}/services/oauth2/token`;
  }

  private async refreshAccessToken(): Promise<{
    accessToken: string;
    instanceUrl: string;
  }> {
    if (
      !this.config.clientId ||
      !this.config.clientSecret ||
      !this.config.refreshToken
    ) {
      throw new SalesforceAuthError(
        "Missing OAuth env vars: SF_CLIENT_ID/SF_CLIENT_SECRET/SF_REFRESH_TOKEN",
      );
    }

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: this.config.refreshToken,
    });

    const response = await fetch(this.getTokenEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new SalesforceAuthError(
        `OAuth refresh failed: ${response.status} ${text}`,
      );
    }

    const data: OAuthTokenResponse = await response.json();

    if (!data.access_token || !data.instance_url) {
      throw new SalesforceAuthError(
        "OAuth refresh succeeded but missing access_token/instance_url",
      );
    }

    return {
      accessToken: data.access_token,
      instanceUrl: data.instance_url,
    };
  }

  async connect(): Promise<void> {
    const logger = createLogger({ module: "salesforce-client" });
    try {
      const { accessToken, instanceUrl } = await this.refreshAccessToken();
      this.accessToken = accessToken;
      this.config.instanceUrl = instanceUrl;
      logger.info("Connected to Salesforce", { instanceUrl });
    } catch (error) {
      logger.warn("OAuth refresh failed", {
        hasUsernamePassword: !!(this.config.username && this.config.password),
        error: error instanceof Error ? error.message : String(error)
      });
      if (
        !this.config.username ||
        !this.config.password ||
        !this.config.securityToken
      ) {
        throw error;
      }
      // Username/password flow not implemented in this version
      // Would require additional Salesforce SOAP API integration
      throw new Error("Username/password flow not implemented");
    }
  }

  // ------------------------------------------------------------
  // Caching
  // ------------------------------------------------------------

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  // ------------------------------------------------------------
  // SOQL Queries
  // ------------------------------------------------------------

  async soql(query: string): Promise<SalesforceQueryResult> {
    if (!this.accessToken) {
      await this.connect();
    }

    const cacheKey = `soql:${query}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const url = `${this.config.instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new SalesforceApiError(
        `SOQL query failed: ${text}`,
        response.status,
      );
    }

    const result = (await response.json()) as SalesforceQueryResult;
    this.setCachedData(cacheKey, result);
    return result;
  }

  // ------------------------------------------------------------
  // Record Operations
  // ------------------------------------------------------------

  async create(
    sobject: string,
    data: Record<string, any>,
  ): Promise<SalesforceCreateResponse> {
    if (!this.accessToken) {
      await this.connect();
    }

    const url = `${this.config.instanceUrl}/services/data/v60.0/sobjects/${sobject}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new SalesforceApiError(
        `Salesforce create failed: ${text}`,
        response.status,
      );
    }

    return response.json();
  }

  async update(
    sobject: string,
    recordId: string,
    data: Record<string, any>,
  ): Promise<void> {
    if (!this.accessToken) {
      await this.connect();
    }

    const url = `${this.config.instanceUrl}/services/data/v60.0/sobjects/${sobject}/${recordId}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new SalesforceApiError(
        `Salesforce update failed: ${text}`,
        response.status,
      );
    }
  }

  async delete(sobject: string, recordId: string): Promise<void> {
    if (!this.accessToken) {
      await this.connect();
    }

    const url = `${this.config.instanceUrl}/services/data/v60.0/sobjects/${sobject}/${recordId}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new SalesforceApiError(
        `Salesforce delete failed: ${text}`,
        response.status,
      );
    }
  }

  // ------------------------------------------------------------
  // Utility Methods
  // ------------------------------------------------------------

  getInstanceUrl(): string {
    return this.config.instanceUrl;
  }

  isConnected(): boolean {
    return this.accessToken !== null;
  }
}

/**
 * Create a Salesforce client from environment variables
 */
export function createSalesforceClient(env: Record<string, string>): SalesforceClient {
  const config: SalesforceConfig = {
    clientId: env.SF_CLIENT_ID || "",
    clientSecret: env.SF_CLIENT_SECRET || "",
    refreshToken: env.SF_REFRESH_TOKEN || "",
    instanceUrl: env.SF_INSTANCE_URL || "",
    domain: env.SF_DOMAIN || "login",
    username: env.SF_USERNAME,
    password: env.SF_PASSWORD,
    securityToken: env.SF_SECURITY_TOKEN,
  };

  return new SalesforceClient(config);
}
