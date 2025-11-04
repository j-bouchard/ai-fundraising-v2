# Deploying a New Resin MCP Server Instance

This playbook provides step-by-step instructions for deploying a new Resin MCP server instance for a new client. Each client gets a completely isolated Cloudflare Worker with its own Salesforce credentials, API keys, and metrics collection.

## Architecture Overview

**Multi-Client Deployment Model:**
- One codebase (`mcp/resin/`) deploys to multiple Cloudflare Workers
- Each client = one wrangler environment = one isolated worker
- Complete separation: secrets, metrics, data access
- Environment names become worker names (e.g., `evergreen` → `evergreen.mpazbot.workers.dev`)

## Prerequisites

Before deploying a new instance, ensure you have:

1. **Cloudflare Account Access**
   - Access to the Cloudflare account where workers are deployed
   - Wrangler CLI installed and authenticated
   - Workers Paid plan (required for Analytics Engine)

2. **Salesforce Connected App Credentials**
   - Client's Salesforce org URL
   - Connected App client ID and secret
   - OAuth refresh token for the Connected App
   - Appropriate permissions configured in Salesforce

3. **Client Information**
   - Client name/identifier (lowercase, no spaces) - this becomes the environment name
   - Desired API key for MCP server authentication

4. **Repository Access**
   - Clone of this repository
   - Node.js and npm installed

## Step-by-Step Deployment Guide

### Step 1: Configure Wrangler Environment

Add a new environment section to `mcp/resin/wrangler.jsonc`:

```bash
cd mcp/resin
```

Edit `wrangler.jsonc` and add your new environment to the `env` section:

```jsonc
{
  "name": "resin",
  "main": "./src/index.ts",
  "compatibility_date": "2025-06-17",
  "vars": {
    // "SF_DOMAIN": "login"
  },
  "analytics_engine_datasets": [
    {
      "binding": "ANALYTICS",
      "dataset": "resin_metrics"
    }
  ],
  "env": {
    "evergreen": {
      "name": "evergreen",
      "analytics_engine_datasets": [
        {
          "binding": "ANALYTICS",
          "dataset": "evergreen_metrics"
        }
      ],
      "vars": {}
    },
    // ADD YOUR NEW CLIENT HERE
    "newclient": {
      "name": "newclient",  // Worker will be deployed as newclient.mpazbot.workers.dev
      "analytics_engine_datasets": [
        {
          "binding": "ANALYTICS",
          "dataset": "newclient_metrics"  // Isolated metrics collection
        }
      ],
      "vars": {
        // Optional: Add any environment-specific variables here
        // Most config should be in secrets, not vars
      }
    }
  }
}
```

**Naming Conventions:**
- Environment name: lowercase, no spaces, alphanumeric + hyphens (e.g., `global-giving`, `acme-corp`)
- Worker name: same as environment name
- Metrics dataset: `{environment}_metrics`
- URL: `https://{environment}.mpazbot.workers.dev`

### Step 2: Create Secrets File

Create a secrets file for the new environment from the template:

```bash
cd mcp/resin
cp .secrets.template .secrets.newclient
```

Edit `.secrets.newclient` with the client's actual credentials:

```bash
nano .secrets.newclient
# or use your preferred editor: code .secrets.newclient
```

**Secrets File Format:**

```bash
# MCP Server Authentication
# Generate a secure random API key (minimum 32 characters recommended)
API_KEY=your-secure-api-key-here

# Salesforce OAuth Credentials
# These come from your Salesforce Connected App configuration
SF_CLIENT_ID=3MVG9your_client_id_here
SF_CLIENT_SECRET=ABC123your_client_secret_here
SF_REFRESH_TOKEN=5Aep861your_refresh_token_here

# Salesforce Instance Configuration
# Use the client's specific Salesforce instance URL
SF_INSTANCE_URL=https://clientorg.my.salesforce.com

# Salesforce Domain
# Options: "login" (production), "test" (sandbox), or custom domain
SF_DOMAIN=login
```

### Step 3: Obtaining Salesforce Credentials

If you need to obtain fresh Salesforce credentials for the client:

#### A. Salesforce Connected App Setup

1. **In Salesforce Setup, navigate to:**
   - App Manager → New Connected App

2. **Configure the Connected App:**
   - **Connected App Name:** `Resin MCP Server - {Client Name}`
   - **API Name:** Auto-generated
   - **Contact Email:** Your email
   - **Enable OAuth Settings:** ✓
   - **Callback URL:** `https://login.salesforce.com/services/oauth2/callback`
   - **Selected OAuth Scopes:**
     - Full access (full)
     - Perform requests on your behalf at any time (refresh_token, offline_access)
     - Access and manage your data (api)
   - **Require Secret for Web Server Flow:** ✓
   - **Require Secret for Refresh Token Flow:** ✓

3. **Save and retrieve credentials:**
   - After saving, view the Connected App
   - Click "Manage Consumer Details"
   - Copy the **Consumer Key** (this is `SF_CLIENT_ID`)
   - Copy the **Consumer Secret** (this is `SF_CLIENT_SECRET`)

#### B. Obtaining the Refresh Token

Use OAuth 2.0 Web Server flow to get the refresh token:

1. **Build authorization URL** (replace `{CLIENT_ID}` with your Consumer Key):
```
https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id={CLIENT_ID}&redirect_uri=https://login.salesforce.com/services/oauth2/callback&scope=full%20refresh_token%20offline_access%20api
```

2. **Visit the URL in a browser:**
   - Log in as the Salesforce user who will access the data
   - Authorize the application
   - You'll be redirected to the callback URL with a `code` parameter

3. **Exchange the code for tokens:**
```bash
curl -X POST https://login.salesforce.com/services/oauth2/token \
  -d "grant_type=authorization_code" \
  -d "client_id={CLIENT_ID}" \
  -d "client_secret={CLIENT_SECRET}" \
  -d "redirect_uri=https://login.salesforce.com/services/oauth2/callback" \
  -d "code={CODE_FROM_URL}"
```

4. **Extract from response:**
   - `refresh_token` → this is `SF_REFRESH_TOKEN`
   - `instance_url` → this is `SF_INSTANCE_URL`

**Important Security Notes:**
- Store the refresh token securely - it provides ongoing access
- Never commit secrets files to version control (they're gitignored)
- Keep a secure backup of `.secrets.{environment}` files outside the repository
- Rotate API keys and refresh tokens periodically

### Step 4: Generate Secure API Key

Generate a secure random API key for the MCP server:

```bash
# Generate 32-character random API key
openssl rand -base64 32

# Or use a password manager to generate a strong key
# Recommended: 32+ characters, mix of alphanumeric and special characters
```

Add this as the `API_KEY` value in your `.secrets.newclient` file.

### Step 5: Set Secrets in Cloudflare

Use the enhanced `set-secrets.sh` script to upload all secrets at once:

```bash
cd mcp/resin

# Set secrets for your new environment
./set-secrets.sh newclient
```

**Expected Output:**
```
Setting secrets for worker: newclient
Reading from: .secrets.newclient

Setting secret: API_KEY
Setting secret: SF_CLIENT_ID
Setting secret: SF_CLIENT_SECRET
Setting secret: SF_REFRESH_TOKEN
Setting secret: SF_INSTANCE_URL
Setting secret: SF_DOMAIN

✅ All secrets have been set for newclient!

Your MCP server is deployed at:
https://newclient.mpazbot.workers.dev
```

**Verify secrets were set:**
```bash
npx wrangler secret list --env newclient
```

Expected output:
```json
[
  { "name": "API_KEY", "type": "secret_text" },
  { "name": "SF_CLIENT_ID", "type": "secret_text" },
  { "name": "SF_CLIENT_SECRET", "type": "secret_text" },
  { "name": "SF_DOMAIN", "type": "secret_text" },
  { "name": "SF_INSTANCE_URL", "type": "secret_text" },
  { "name": "SF_REFRESH_TOKEN", "type": "secret_text" }
]
```

### Step 6: Deploy the Worker

Deploy the new worker instance:

```bash
cd mcp/resin

# Deploy to Cloudflare
wrangler deploy --env newclient
```

**Expected Output:**
```
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded newclient (X.XX sec)
Published newclient (X.XX sec)
  https://newclient.mpazbot.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Step 7: Test the Deployment

#### A. Health Check (Unauthenticated)

Test basic connectivity:

```bash
curl https://newclient.mpazbot.workers.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-04T20:00:00.000Z",
  "version": "1.0.0"
}
```

#### B. Readiness Check (Tests Salesforce Connectivity)

```bash
curl https://newclient.mpazbot.workers.dev/ready
```

Expected response:
```json
{
  "status": "ready",
  "salesforce": "connected",
  "timestamp": "2025-11-04T20:00:00.000Z"
}
```

**If readiness check fails:**
- Verify Salesforce credentials are correct
- Check refresh token hasn't expired
- Ensure Connected App is properly configured
- Check logs: `npx wrangler tail --env newclient`

#### C. MCP Server Test (Authenticated)

Test the MCP server endpoint with authentication:

```bash
curl -X POST https://newclient.mpazbot.workers.dev/mcp \
  -H "Authorization: Bearer your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

Expected response should list available tools:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      {
        "name": "run_soql",
        "description": "Execute a SOQL query..."
      },
      {
        "name": "create_record",
        "description": "Create a Salesforce record..."
      },
      // ... more tools
    ]
  },
  "id": 1
}
```

#### D. Test Data Query

Test querying actual Salesforce data:

```bash
curl -X POST https://newclient.mpazbot.workers.dev/mcp \
  -H "Authorization: Bearer your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "run_soql",
      "arguments": {
        "query": "SELECT COUNT() FROM Contact"
      }
    },
    "id": 2
  }'
```

Should return contact count from the client's Salesforce org.

### Step 8: Monitor the Deployment

#### View Live Logs

```bash
npx wrangler tail --env newclient --format pretty
```

#### Filter for Errors

```bash
npx wrangler tail --env newclient --status error
```

#### Test with MCP Inspector

```bash
npx -y @modelcontextprotocol/inspector@latest
```

Connect to: `https://newclient.mpazbot.workers.dev/mcp`

Add header: `Authorization: Bearer your-api-key-here`

### Step 9: Document the Deployment

Create a record of the deployment for your team:

**Information to document:**
- Client name and environment name
- Worker URL: `https://{environment}.mpazbot.workers.dev`
- Deployment date
- Salesforce org connected to
- Contact person for client
- Location of secrets backup (secure location outside repo)
- Any special configuration or considerations

**Add to internal documentation:**
- Update `mcp/resin/CLAUDE.md` deployments list if needed
- Update `/CLAUDE.md` if this is a notable client
- Create client-specific recipes if needed (see `mill/` directory)

### Step 10: Configure Client Access

Provide the client with:

1. **MCP Server URL:**
   ```
   https://newclient.mpazbot.workers.dev/mcp
   ```

2. **API Key:**
   ```
   The API_KEY value from .secrets.newclient
   ```

3. **Authentication Instructions:**
   ```
   All requests must include header:
   Authorization: Bearer {API_KEY}
   ```

4. **Example Goose Recipe Configuration:**
   ```yaml
   parameters:
     - key: MCP_SERVER_URL
       input_type: string
       requirement: optional
       description: "MCP server URL"
       default: "https://newclient.mpazbot.workers.dev"
     - key: API_KEY
       input_type: string
       requirement: optional
       description: "API key for authentication"
       default: "client-api-key-here"

   instructions: |
     **MCP Server Access**
     Server: {{ MCP_SERVER_URL }}/mcp
     Auth: Bearer {{ API_KEY }}
   ```

## Troubleshooting

### Common Issues

#### 1. "Missing OAuth env vars" Error

**Symptom:** Worker returns 500 error, logs show missing environment variables

**Solution:**
- Verify secrets are set: `npx wrangler secret list --env newclient`
- Re-run secrets script: `./set-secrets.sh newclient`
- Check `.secrets.newclient` file has all required keys

#### 2. "Salesforce authentication failed" Error

**Symptom:** `/ready` endpoint fails, logs show OAuth errors

**Solution:**
- Verify refresh token is still valid
- Check Connected App configuration in Salesforce
- Ensure OAuth scopes include: `full`, `refresh_token`, `offline_access`, `api`
- Try obtaining a new refresh token

#### 3. "Invalid API key" Error

**Symptom:** MCP requests return 401 Unauthorized

**Solution:**
- Verify `API_KEY` secret matches what client is using
- Check Authorization header format: `Bearer {key}` (note the space)
- Ensure no extra whitespace in API key

#### 4. SOQL Query Failures

**Symptom:** Queries return empty results or errors

**Solution:**
- Verify Salesforce user has appropriate permissions
- Check object and field-level security in Salesforce
- Test query in Salesforce Developer Console first
- Review logs: `npx wrangler tail --env newclient`

#### 5. Worker Not Found

**Symptom:** `curl` returns 404 or "Worker not found"

**Solution:**
- Verify deployment succeeded: `wrangler deploy --env newclient`
- Check worker name matches environment name in `wrangler.jsonc`
- Allow a few minutes for DNS propagation

### Getting Help

- **View detailed logs:** `npx wrangler tail --env newclient --format pretty`
- **Check Cloudflare Dashboard:** Workers & Pages → newclient
- **Review Analytics:** Cloudflare Dashboard → Analytics Engine → newclient_metrics
- **Test locally first:** `npm run dev` then test against `http://localhost:8787`

## Maintenance

### Rotating Secrets

When secrets need to be updated:

```bash
# Update .secrets.newclient file with new values
nano .secrets.newclient

# Re-run secrets script to update Cloudflare
./set-secrets.sh newclient

# No need to redeploy - secrets are injected at runtime
```

### Deleting an Instance

If you need to remove a client's instance:

```bash
# Delete the worker
wrangler delete --env newclient

# Delete secrets (optional - they're deleted with worker)
npx wrangler secret delete API_KEY --env newclient
# ... repeat for each secret

# Remove from wrangler.jsonc
# Delete the env.newclient section

# Securely delete secrets file
rm .secrets.newclient
```

### Updating Code

Code updates apply to all environments:

```bash
cd mcp/resin

# Update code (git pull, edit files, etc.)

# Deploy to specific environment
wrangler deploy --env newclient

# Or deploy to all environments
wrangler deploy                    # Default (resin)
wrangler deploy --env evergreen    # Evergreen
wrangler deploy --env newclient    # New client
```

## Security Best Practices

1. **Secrets Management:**
   - Never commit `.secrets.*` files to version control
   - Store backup copies in secure password manager or vault
   - Use strong, randomly generated API keys (32+ characters)
   - Rotate secrets periodically (recommend quarterly)

2. **Access Control:**
   - Limit Cloudflare account access to necessary personnel
   - Use principle of least privilege for Salesforce Connected App
   - Monitor API usage for anomalies

3. **Monitoring:**
   - Set up alerts for failed health checks
   - Monitor error rates in Cloudflare Analytics
   - Review logs regularly for suspicious activity

4. **Client Isolation:**
   - Each client's data is completely isolated
   - No shared secrets between environments
   - Separate metrics collection per client
   - Independent deployment lifecycle

## Checklist

Use this checklist when deploying a new instance:

- [ ] Obtain client Salesforce credentials
- [ ] Generate secure API key
- [ ] Add environment to `wrangler.jsonc`
- [ ] Create `.secrets.{environment}` file
- [ ] Run `./set-secrets.sh {environment}`
- [ ] Verify secrets: `npx wrangler secret list --env {environment}`
- [ ] Deploy: `wrangler deploy --env {environment}`
- [ ] Test `/health` endpoint
- [ ] Test `/ready` endpoint
- [ ] Test MCP endpoint with authentication
- [ ] Test SOQL query
- [ ] Monitor logs for errors
- [ ] Document deployment details
- [ ] Provide client with URL and API key
- [ ] Create backup of secrets file in secure location
- [ ] Update team documentation

## Next Steps

After successful deployment:

1. **Create client-specific recipes** (if needed)
   - See `mill/` directory for recipe examples
   - Use `goose-recipes` skill to generate from specs
   - Parameterize with client's worker URL and API key

2. **Set up monitoring alerts**
   - Configure Cloudflare alerts for error rates
   - Set up uptime monitoring
   - Create runbook for incident response

3. **Client onboarding**
   - Provide documentation and examples
   - Train client team on recipe usage
   - Schedule follow-up to ensure success

## References

- **Resin Documentation:** `mcp/resin/CLAUDE.md`
- **Wrangler Configuration:** `mcp/resin/wrangler.jsonc`
- **Secrets Script:** `mcp/resin/set-secrets.sh`
- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **MCP Protocol Docs:** https://modelcontextprotocol.io
- **Salesforce OAuth Guide:** https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm
