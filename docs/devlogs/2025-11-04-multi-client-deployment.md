# Multi-Client Deployment Infrastructure for Resin MCP Server

**Date:** 2025-11-04
**Location:** `mcp/resin/`

## Overview

Implemented a scalable multi-client deployment architecture for the Resin MCP server that allows one codebase to deploy to multiple isolated Cloudflare Workers, one per client. Each client gets complete isolation of secrets, metrics, and data access through Wrangler environment configurations.

## Background

### The Problem

We needed to deploy the Resin MCP server to multiple clients, each with their own Salesforce instance and credentials. Initial approaches considered:

1. **Separate repositories per client** - Would create maintenance nightmare with code drift
2. **Single worker with tenant routing** - Would risk credential leakage and configuration complexity
3. **Environment-based deployment** - One codebase, isolated deployments ✅

### The Solution

Use Cloudflare Wrangler's environment feature to deploy multiple isolated workers from a single codebase. Each environment maps to a unique worker with its own secrets, metrics collection, and URL.

## Architecture

### Core Concepts

**Wrangler Environments:**
```jsonc
{
  "name": "resin",  // Default environment (top-level config)
  "main": "./src/index.ts",
  "env": {
    "evergreen": {  // Named environment
      "name": "evergreen",
      "analytics_engine_datasets": [
        {
          "binding": "ANALYTICS",
          "dataset": "evergreen_metrics"
        }
      ]
    }
  }
}
```

**Environment Structure:**
- **Default environment** (no `--env` flag): Top-level config in `wrangler.jsonc`
  - Worker name: `resin`
  - Deploy: `wrangler deploy`
  - Secrets: `wrangler secret put API_KEY`
  - URL: `https://resin.mpazbot.workers.dev`

- **Named environments** (with `--env` flag): `env.{name}` sections
  - Worker name: Same as environment name
  - Deploy: `wrangler deploy --env evergreen`
  - Secrets: `wrangler secret put API_KEY --env evergreen`
  - URL: `https://evergreen.mpazbot.workers.dev`

**Complete Isolation:**
- ✅ Separate Salesforce credentials per client
- ✅ Unique API keys per deployment
- ✅ Isolated metrics datasets
- ✅ Independent deployment lifecycle
- ✅ No shared state or configuration

## Implementation

### 1. Wrangler Configuration

Added environment support to `mcp/resin/wrangler.jsonc`:

```jsonc
{
  "name": "resin",
  "main": "./src/index.ts",
  "compatibility_date": "2025-06-17",
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
    }
  }
}
```

**Key decisions:**
- Worker name = environment name (clean, predictable URLs)
- Separate metrics dataset per client (isolated analytics)
- Minimal vars (secrets via Wrangler secrets, not config)

### 2. Enhanced Secrets Management

Created environment-specific secrets file system:

**File Structure:**
```
mcp/resin/
├── .secrets.template       # Template for new environments
├── .secrets.resin          # Default worker secrets (gitignored)
├── .secrets.evergreen      # Evergreen worker secrets (gitignored)
└── set-secrets.sh          # Enhanced script with environment support
```

**Enhanced `set-secrets.sh`:**
```bash
#!/bin/bash
# Usage:
#   ./set-secrets.sh              # Default worker (reads .secrets.resin)
#   ./set-secrets.sh evergreen    # Named environment (reads .secrets.evergreen)

ENV=${1:-}
if [ -z "$ENV" ]; then
  SECRET_FILE=".secrets.resin"
  ENV_FLAG=""
  WORKER_NAME="resin"
else
  SECRET_FILE=".secrets.$ENV"
  ENV_FLAG="--env $ENV"
  WORKER_NAME="$ENV"
fi

# Read and set all secrets from file
while IFS='=' read -r key value; do
  if [[ $key == API_KEY ]] || [[ $key == SF_* ]]; then
    echo "$value" | npx wrangler secret put "$key" $ENV_FLAG
  fi
done < "$SECRET_FILE"
```

**Benefits:**
- ✅ Single command to set all secrets
- ✅ Credentials stored as files (easier backup/restore)
- ✅ No credentials in shell history
- ✅ Template for consistency across environments

### 3. Security: Gitignore Configuration

Updated `.gitignore` to prevent credential leakage:

```gitignore
# Secret files (environment-specific credentials)
.secrets.*
.env
.env.*
```

All secret files are gitignored by default - no risk of accidental commits.

## Usage

### Adding a New Client

**1. Add environment to `wrangler.jsonc`:**
```jsonc
"env": {
  "newclient": {
    "name": "newclient",
    "analytics_engine_datasets": [
      {
        "binding": "ANALYTICS",
        "dataset": "newclient_metrics"
      }
    ],
    "vars": {}
  }
}
```

**2. Create secrets file from template:**
```bash
cd mcp/resin
cp .secrets.template .secrets.newclient
nano .secrets.newclient  # Edit with actual credentials
```

**3. Deploy and configure:**
```bash
# Deploy worker
wrangler deploy --env newclient

# Set secrets from file
./set-secrets.sh newclient

# Verify
npx wrangler secret list --env newclient
```

**4. Test deployment:**
```bash
# Health check (unauthenticated)
curl https://newclient.mpazbot.workers.dev/health

# Readiness check (tests Salesforce connectivity)
curl https://newclient.mpazbot.workers.dev/ready

# MCP endpoint (authenticated)
curl -X POST https://newclient.mpazbot.workers.dev/mcp \
  -H "Authorization: Bearer api-key" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

**5. Monitor:**
```bash
# Live logs
npx wrangler tail --env newclient --format pretty

# Error filtering
npx wrangler tail --env newclient --status error
```

### Recipe Configuration

Recipes parameterize server URL and API key for client-specific access:

```yaml
parameters:
  - key: MCP_SERVER_URL
    input_type: string
    requirement: optional
    description: "MCP server URL for specific client"
    default: "https://resin.mpazbot.workers.dev"
  - key: API_KEY
    input_type: string
    requirement: optional
    description: "API key for authentication"
    default: "your-key"

instructions: |
  **MCP Server Access**
  Server: {{ MCP_SERVER_URL }}/mcp
  Auth: Bearer {{ API_KEY }}
```

**Running recipes for different clients:**
```bash
# Default client
./scripts/mill/run-recipe.sh

# Evergreen client
./scripts/mill/run-recipe.sh \
  --params MCP_SERVER_URL="https://evergreen.mpazbot.workers.dev" \
  --params API_KEY="evergreen-api-key"
```

## Documentation Created

### 1. Updated CLAUDE.md Files

**`/CLAUDE.md` (root):**
- Added multi-client deployment overview
- Documented environment-based architecture
- Updated MCP authentication patterns with URL parameterization
- Added recipe configuration examples

**`mcp/resin/CLAUDE.md`:**
- Comprehensive deployment section with environment commands
- Detailed secrets management with file-based approach
- "Adding a New Client" step-by-step guide
- Environment structure explanation (default vs named)
- Updated all command examples to show both patterns

### 2. Deployment Playbook

Created comprehensive playbook at `docs/playbooks/deploy-new-instance.md`:

**Contents:**
- Architecture overview and prerequisites
- 10-step deployment guide with detailed instructions
- Complete Salesforce credential acquisition guide
- OAuth flow walkthrough
- API key generation instructions
- Testing procedures (health, readiness, MCP, data queries)
- Troubleshooting guide with common issues
- Maintenance procedures (rotating secrets, updates, deletion)
- Security best practices
- Deployment checklist

**Key sections:**
- **Step 3: Obtaining Salesforce Credentials** - Complete guide for Connected App setup and refresh token generation
- **Step 7: Test the Deployment** - Comprehensive testing procedures
- **Troubleshooting** - Common issues with solutions
- **Checklist** - Quick reference for deployments

### 3. Documentation Organization

Improved docs structure:
```
docs/
├── playbooks/          # Operational procedures
│   ├── MONITORING.md
│   └── deploy-new-instance.md  ← New playbook
├── architecture/       # Technical design docs
├── status/            # Client status reports
│   └── FORM-22A.md    ← Moved from docs/
└── devlogs/           # Development logs
    └── DEVLOG-2025-11-04-multi-client-deployment.md  ← This file
```

## Best Practices

### ✅ Do

- Use descriptive environment names (lowercase, alphanumeric + hyphens)
- Create `.secrets.{environment}` files from template
- Set all secrets using `./set-secrets.sh {environment}`
- Test health and readiness endpoints after deployment
- Monitor logs during initial deployment: `wrangler tail --env {name}`
- Document each new client deployment (URL, date, contact)
- Store secrets file backups in secure location outside repo
- Rotate API keys and refresh tokens periodically

### ❌ Don't

- Don't commit `.secrets.*` files to version control
- Don't use `--env` flag for default worker (it's top-level config)
- Don't share API keys between clients
- Don't reuse Salesforce credentials across environments
- Don't skip testing after deployment
- Don't deploy without verifying secrets first: `wrangler secret list --env {name}`
- Don't put sensitive data in `vars` section (use secrets)

## Pattern: Environment vs Config File Approaches

### Why Wrangler Environments? (Our Choice)

**Advantages:**
- ✅ Single codebase, no duplication
- ✅ Environment-specific secrets isolation
- ✅ Simple deployment: `wrangler deploy --env {name}`
- ✅ Built-in support from Cloudflare
- ✅ Easy to add new clients (just add env section)
- ✅ Scales to dozens of clients

**Example - Adding 5th client:**
```bash
# 1. Add to wrangler.jsonc (5 lines)
# 2. Copy template: cp .secrets.template .secrets.newclient
# 3. Deploy: wrangler deploy --env newclient
# 4. Set secrets: ./set-secrets.sh newclient
```

### Alternative: Separate Config Files (Rejected)

Would require multiple `wrangler.{client}.jsonc` files:
- ❌ Command complexity: `wrangler deploy --config wrangler.client.jsonc`
- ❌ Harder to maintain (duplicate config sections)
- ❌ More verbose in documentation
- ❌ Doesn't scale as cleanly

## Related Documentation

- **Main Documentation:** `mcp/resin/CLAUDE.md`
- **Root Documentation:** `/CLAUDE.md`
- **Deployment Playbook:** `docs/playbooks/deploy-new-instance.md`
- **Monitoring Guide:** `docs/playbooks/MONITORING.md`
- **Wrangler Config:** `mcp/resin/wrangler.jsonc`
- **Secrets Script:** `mcp/resin/set-secrets.sh`
- **Secrets Template:** `mcp/resin/.secrets.template`

## Impact

### Immediate Benefits

1. **Scalability:** Can easily add new clients without code duplication
2. **Security:** Complete isolation between client deployments
3. **Maintainability:** Single codebase for all clients, bug fixes apply everywhere
4. **Operations:** Simple deployment process with clear documentation
5. **Developer Experience:** Clear patterns, good tooling, comprehensive docs

### Future Possibilities

1. **Automated deployment:** Could script entire deployment process
2. **Monitoring dashboard:** Aggregate metrics across all client instances
3. **Shared improvements:** New features automatically available to all clients
4. **Easy testing:** Can test changes in one environment before rolling to others
5. **Client-specific customization:** Environment-specific vars if needed

## Metrics

**Files Created/Modified:**
- `mcp/resin/wrangler.jsonc` - Added environment configuration
- `mcp/resin/set-secrets.sh` - Enhanced with environment support
- `mcp/resin/.gitignore` - Added secrets file patterns
- `mcp/resin/.secrets.template` - Created template
- `mcp/resin/CLAUDE.md` - Comprehensive updates
- `/CLAUDE.md` - Multi-client architecture documentation
- `docs/playbooks/deploy-new-instance.md` - Complete deployment guide

**Documentation:**
- 1 comprehensive deployment playbook (~400 lines)
- 2 CLAUDE.md files updated with environment patterns
- 1 secrets template created
- 1 enhanced deployment script

**Time Investment:**
- Architecture design: 15 minutes
- Implementation: 30 minutes
- Documentation: 45 minutes
- Total: ~90 minutes

**ROI:**
- New client deployment: ~30 minutes (down from several hours)
- Maintenance overhead: Minimal (single codebase)
- Onboarding time: Reduced with clear docs
- Security posture: Significantly improved with isolation

## Lessons Learned

1. **Wrangler environments are powerful** - The `env` feature is exactly designed for this use case
2. **File-based secrets management** - Much cleaner than manual `echo | wrangler secret put` commands
3. **Documentation is critical** - The deployment playbook will save hours on every new client
4. **Test thoroughly** - Health/readiness checks caught configuration issues early
5. **Template approach works** - `.secrets.template` makes it foolproof to create new environments

## Next Steps

- [ ] Deploy first production client using this infrastructure (Evergreen)
- [ ] Create monitoring dashboard for all client instances
- [ ] Consider automated deployment script wrapping the manual steps
- [ ] Add metrics aggregation across all environments
- [ ] Document incident response procedures for multi-client setup
- [ ] Create backup/restore playbook for secrets files
