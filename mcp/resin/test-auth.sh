#!/bin/bash

# Test authentication for Resin MCP Server
# Usage: ./test-auth.sh [url] [api-key]

URL="${1:-http://localhost:8787/mcp}"
API_KEY="${2:-test-key-123}"

echo "Testing Resin MCP Server Authentication"
echo "========================================"
echo ""

# Test 1: Request without Authorization header
echo "Test 1: Request without Authorization header (should fail with 401)"
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
  | jq . || echo "Failed to parse response"
echo ""
echo ""

# Test 2: Request with invalid Bearer token format
echo "Test 2: Request with invalid format (should fail with 401)"
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: InvalidFormat" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
  | jq . || echo "Failed to parse response"
echo ""
echo ""

# Test 3: Request with invalid API key
echo "Test 3: Request with invalid API key (should fail with 403)"
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer wrong-key" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
  | jq . || echo "Failed to parse response"
echo ""
echo ""

# Test 4: Request with valid API key
echo "Test 4: Request with valid API key (should succeed)"
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}' \
  | jq . || echo "Failed to parse response"
echo ""
echo ""

echo "========================================"
echo "Tests complete!"
