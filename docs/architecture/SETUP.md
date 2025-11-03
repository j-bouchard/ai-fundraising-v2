# AI Fundraising MCP Server - Setup Guide

This is a TypeScript MCP server for Salesforce/NPSP fundraising analytics, refactored from the Python version and deployed to Cloudflare Workers.

## 🚀 Quick Start

### 1. Set Cloudflare Secrets

Run the helper script to set your Salesforce credentials as Cloudflare secrets:

```bash
cd /Users/mpaz/workspace/ai-fundraising/modelfetch/resin
./set-secrets.sh
```

This will read your `.env` file and set these secrets in Cloudflare:
- `SF_CLIENT_ID`
- `SF_CLIENT_SECRET`
- `SF_REFRESH_TOKEN`
- `SF_INSTANCE_URL`
- `SF_DOMAIN`

### 2. Deploy to Cloudflare Workers

```bash
npm run deploy
```

Your server will be available at: **https://resin.mpazbot.workers.dev**

## 🧪 Testing in Goose

### Configure HTTP MCP Extension in Goose:

**Extension Name:** `fundraisingaimcp`

**Type:** `HTTP` (or `SSE` if available)

**URL:** `https://resin.mpazbot.workers.dev/mcp`

**Headers:** (if authentication is required)
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

**Timeout:** `300`

## 📋 Available Tools

The server exposes three main MCP tools:

### 1. `run_soql`
Execute any SOQL query against Salesforce.

**Parameters:**
- `query` (string): The SOQL query to execute
- `limit` (number, optional): Maximum number of records to return (default: 25)

**Example:**
```javascript
{
  "query": "SELECT Id, Name, Email FROM Contact LIMIT 10",
  "limit": 10
}
```

### 2. `create_record`
Create any Salesforce sObject record.

**Parameters:**
- `sobject` (string): The sObject type (e.g., Contact, Opportunity, Task)
- `fields` (object): Field names and values for the new record

**Example:**
```javascript
{
  "sobject": "Contact",
  "fields": {
    "FirstName": "Ada",
    "LastName": "Lovelace",
    "Email": "ada@example.org"
  }
}
```

### 3. `update_record`
Update any Salesforce record by ID.

**Parameters:**
- `sobject` (string): The sObject type
- `record_id` (string): The 15 or 18 character Salesforce record ID
- `fields` (object): Field names and new values to update

**Example:**
```javascript
{
  "sobject": "Contact",
  "record_id": "003XXXXXXXXXXXXXXX",
  "fields": {
    "Email": "new.email@example.org"
  }
}
```

## 🛠️ Development

### Local Testing with MCP Inspector

```bash
npm run mcp-server
```

This opens the MCP Inspector at `http://localhost:6274` where you can test your tools interactively.

### Local Cloudflare Workers Development

```bash
npm run dev
```

Runs the worker locally with Wrangler.

## 📦 Project Structure

```
modelfetch/resin/
├── src/
│   ├── index.ts          # Cloudflare Workers entry point
│   ├── server.ts         # MCP server implementation (refactored from Python)
│   └── stdio.ts          # STDIO mode entry point (for local testing)
├── package.json
├── wrangler.jsonc        # Cloudflare Workers configuration
├── tsconfig.json
├── set-secrets.sh        # Helper script to set Cloudflare secrets
└── SETUP.md              # This file
```

## 🔐 Security Notes

- Never commit `.env` files or secrets to git
- Use Cloudflare Workers secrets for sensitive data (accessed via `wrangler secret put`)
- The server uses OAuth 2.0 refresh token flow for Salesforce authentication
- Implements 60-second caching for SOQL queries to reduce API calls

## 🌟 Features Ported from Python

All functionality from `fundraising_mcp_server.py` has been ported:

- ✅ OAuth 2.0 refresh token flow
- ✅ SOQL query execution with caching
- ✅ Create/Update any Salesforce sObject
- ✅ Utility functions (currency formatting, date formatting, etc.)
- ✅ SOQL builders for donor segments (lapsed, major, recent, first-time)
- ✅ NLP-to-SOQL parsing (not exposed as tools yet, but available in codebase)

## 📝 Next Steps

1. Run `./set-secrets.sh` to configure your Salesforce credentials
2. Deploy with `npm run deploy`
3. Configure Goose to use the HTTP endpoint
4. Test the three tools (run_soql, create_record, update_record)
5. Consider adding more specialized tools using the SOQL builders

## 🐛 Troubleshooting

**Error: "Missing OAuth env vars"**
- Run `./set-secrets.sh` to set your Cloudflare secrets
- Verify secrets with: `npx wrangler secret list`

**Error: "SOQL query failed"**
- Check your Salesforce credentials are correct
- Verify the refresh token hasn't expired
- Ensure your Salesforce Connected App is configured correctly

**HTTP endpoint not working**
- Check the deployment URL: https://resin.mpazbot.workers.dev
- Try accessing `/mcp` endpoint directly in browser
- Check Cloudflare Workers logs: `npx wrangler tail`
