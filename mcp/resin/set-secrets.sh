#!/bin/bash
# Script to set Cloudflare Workers secrets from .env file

# Read .env file and set secrets
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  if [[ $key =~ ^#.*$ ]] || [[ -z $key ]]; then
    continue
  fi

  # Only set SF_ variables
  if [[ $key == SF_* ]]; then
    echo "Setting secret: $key"
    echo "$value" | npx wrangler secret put "$key"
  fi
done < ../../.env

echo ""
echo "✅ All secrets have been set!"
echo ""
echo "Your MCP server is now deployed at:"
echo "https://resin.mpazbot.workers.dev"
