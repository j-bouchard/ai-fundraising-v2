#!/bin/bash
# Script to set Cloudflare Workers secrets from environment-specific files
#
# Usage:
#   ./set-secrets.sh              # Sets secrets for default worker from .secrets.resin
#   ./set-secrets.sh evergreen    # Sets secrets for evergreen worker from .secrets.evergreen

# Determine environment and secret file
ENV=${1:-}  # Optional environment argument (e.g., "evergreen")
if [ -z "$ENV" ]; then
  # Default environment (no --env flag)
  SECRET_FILE=".secrets.resin"
  ENV_FLAG=""
  WORKER_NAME="resin"
  WORKER_URL="https://resin.mpazbot.workers.dev"
else
  # Named environment (with --env flag)
  SECRET_FILE=".secrets.$ENV"
  ENV_FLAG="--env $ENV"
  WORKER_NAME="$ENV"
  WORKER_URL="https://$ENV.mpazbot.workers.dev"
fi

# Check if secret file exists
if [ ! -f "$SECRET_FILE" ]; then
  echo "❌ Error: Secret file '$SECRET_FILE' not found"
  echo ""
  echo "Create the file with the following format:"
  echo ""
  echo "API_KEY=your-api-key-here"
  echo "SF_CLIENT_ID=your-client-id"
  echo "SF_CLIENT_SECRET=your-client-secret"
  echo "SF_REFRESH_TOKEN=your-refresh-token"
  echo "SF_INSTANCE_URL=https://example.my.salesforce.com"
  echo "SF_DOMAIN=login"
  exit 1
fi

echo "Setting secrets for worker: $WORKER_NAME"
echo "Reading from: $SECRET_FILE"
echo ""

# Read secret file and set secrets
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  if [[ $key =~ ^#.*$ ]] || [[ -z $key ]]; then
    continue
  fi

  # Remove leading/trailing whitespace and quotes from value
  value=$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^["'"'"']//' -e 's/["'"'"']$//')

  # Set secret (API_KEY and all SF_* variables)
  if [[ $key == API_KEY ]] || [[ $key == SF_* ]]; then
    echo "Setting secret: $key"
    if [ -z "$ENV_FLAG" ]; then
      echo "$value" | npx wrangler secret put "$key"
    else
      echo "$value" | npx wrangler secret put "$key" $ENV_FLAG
    fi
  fi
done < "$SECRET_FILE"

echo ""
echo "✅ All secrets have been set for $WORKER_NAME!"
echo ""
echo "Your MCP server is deployed at:"
echo "$WORKER_URL"
