# Devlog: API Authentication & Monorepo Organization

**Date:** October 30, 2025
**Project:** Resin MCP Server
**Status:** ✅ Deployed to Production

---

## Executive Summary

Today we secured the Resin MCP server with Bearer token authentication and reorganized the repository into a proper monorepo structure. The production endpoint now requires API key authentication for all requests, preventing unauthorized access while maintaining the clean MCP protocol interface.

**Key Achievements:**
- ✅ Implemented Bearer token authentication middleware
- ✅ Deployed with API key protection to production
- ✅ Updated monorepo structure and documentation
- ✅ Verified authentication works correctly (401/403 for invalid, 200 for valid)

---

## What We Did

### 1. Implemented Bearer Token Authentication

**Challenge:** The MCP server was publicly accessible without authentication, which could expose sensitive Salesforce donor data.

**Solution:** Implemented a clean authentication layer following the pattern from the Compass project, but simplified for single-key validation.

**Implementation Details:**

**Created `src/auth.ts`:**
```typescript
export function validateApiKey(apiKey: string, env: any): boolean {
  const expectedKey = env.API_KEY;

  if (!expectedKey) {
    console.error("❌ API_KEY not configured in environment");
    return false;
  }

  return apiKey === expectedKey;
}
```

**Updated `src/index.ts`:**
- Extract Bearer token from `Authorization` header
- Validate against Cloudflare secret `API_KEY`
- Return JSON-RPC error responses for unauthorized requests:
  - **401** for missing/invalid header format
  - **403** for invalid API key
  - **200** with MCP response for valid authentication

**Why This Approach:**
- No modification of generated files (`worker-configuration.d.ts`)
- Clean separation of concerns (auth module separate from server logic)
- Proper JSON-RPC error responses for MCP clients
- Follows established pattern from Compass project

### 2. Configured & Deployed API Key

**Cloudflare Secret:**
```bash
echo "igtcRlUi6YF2GGboiHrKRxUeVEXITDOo" | npx wrangler secret put API_KEY
```

**Deployment:**
```bash
npm run deploy
```

**Result:**
- Version ID: `c8e7e2b4-211b-4235-8113-76d33734c61e`
- Production URL: https://resin.mpazbot.workers.dev/mcp
- All requests now require: `Authorization: Bearer igtcRlUi6YF2GGboiHrKRxUeVEXITDOo`

### 3. Tested Authentication End-to-End

Created `test-auth.sh` script with 4 test cases:

**Test Results:**
1. ✅ **No Authorization header** → 401: "Missing Authorization header"
2. ✅ **Invalid format (no Bearer prefix)** → 401: "Invalid Authorization header format"
3. ✅ **Wrong API key** → 403: "Unauthorized: Invalid API key"
4. ✅ **Valid API key** → 200: Returns MCP server info

**Example Successful Request:**
```bash
curl -X POST "https://resin.mpazbot.workers.dev/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer igtcRlUi6YF2GGboiHrKRxUeVEXITDOo" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize",...}'
```

**Response:**
```
event: message
data: {"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{"listChanged":true}},"serverInfo":{"title":"AI Fundraising (Salesforce/NPSP)","name":"resin","version":"0.0.1"}},...}
```

### 4. Reorganized as Monorepo

**Previous Structure:**
- Root CLAUDE.md only documented Resin project
- Unclear that this was a multi-project repository

**New Structure:**
```
/
├── mcp/resin/          # Resin MCP Server (Salesforce analytics)
├── mill/               # Fundraising AI workflows & Goose recipes
├── CLAUDE.md           # Monorepo overview + legacy Resin docs
└── README.md           # High-level project descriptions
```

**Documentation Updates:**
- **Root CLAUDE.md**: Added monorepo overview section listing both projects
- **Root README.md**: Added project summaries with key capabilities
- **All paths corrected**: Changed `modelfetch/resin` → `mcp/resin` throughout
- **API key instructions**: Added to Secrets Management section

---

## Technical Details

### Authentication Flow

```
1. Client Request → Authorization: Bearer <api-key>
2. index.ts extracts token from header
3. validateApiKey(token, env) checks against env.API_KEY
4. ✅ Valid → Pass to MCP server handler
   ❌ Invalid → Return JSON-RPC error response
```

### Security Considerations

**What We Secured:**
- All MCP server endpoints now require authentication
- API key stored as Cloudflare secret (not in code/version control)
- Clear error messages for debugging without leaking secrets

**What's Next:**
- Consider rate limiting per API key
- Add API key rotation mechanism
- Monitor for unauthorized access attempts

### Files Changed

**New Files:**
- `src/auth.ts` - Authentication validation logic
- `test-auth.sh` - Authentication test script

**Modified Files:**
- `src/index.ts` - Added authentication middleware
- `wrangler.jsonc` - Documented API_KEY requirement
- `CLAUDE.md` - Added auth docs + monorepo structure
- `README.md` - Updated project overview

**Not Modified:**
- `worker-configuration.d.ts` (generated file - avoided editing)
- `src/server.ts` (no changes needed to MCP tool logic)

---

## Lessons Learned

### 1. Don't Modify Generated Files
**Issue:** Initially tried to add `API_KEY` to `worker-configuration.d.ts` interface.
**Solution:** Used `any` type in auth module to avoid TypeScript errors without modifying generated files.
**Takeaway:** Generated files should remain untouched - work around them with proper typing in application code.

### 2. Follow Established Patterns
**Decision:** Used Compass project's authentication pattern as reference.
**Benefit:** Clean, tested approach that's consistent across projects.
**Adaptation:** Simplified for single-key validation (no user isolation needed for Resin).

### 3. Test Authentication Thoroughly
**Approach:** Created comprehensive test script with 4 failure/success scenarios.
**Result:** Caught edge cases and verified all error messages are correct.
**Value:** Confidence that authentication works as expected in production.

---

## Production Impact

### Before Today:
- ❌ MCP server publicly accessible
- ❌ No authentication required
- ❌ Potential exposure of Salesforce donor data

### After Today:
- ✅ All requests require Bearer token
- ✅ Invalid requests properly rejected (401/403)
- ✅ API key securely stored in Cloudflare
- ✅ Production endpoint verified working

### Usage Example for Clients:

**MCP Configuration (e.g., `.mcp.json`):**
```json
{
  "mcpServers": {
    "resin": {
      "url": "https://resin.mpazbot.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer ig___"
      }
    }
  }
}
```

---

## Next Steps

### Immediate:
- ✅ Authentication implemented and tested
- ✅ Documentation updated
- ✅ Production deployment verified

### Future Enhancements:
- [ ] Add API key rotation capability
- [ ] Implement rate limiting per key
- [ ] Add usage analytics/monitoring
- [ ] Support multiple API keys (if multi-tenant needed)
- [ ] Add API key expiration timestamps

---

## References

**Related Projects:**
- Compass MCP Server: `/Users/mpaz/workspace/authentic-advantage/workers/mcp/compass`
  - Reference implementation for Bearer token authentication
  - User-based key validation (adapted to single-key for Resin)

**Documentation:**
- Cloudflare Workers Secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- MCP Protocol Spec: https://modelcontextprotocol.io
- ModelFetch Cloudflare Handler: https://www.modelfetch.com/docs

**Production Endpoints:**
- Resin MCP Server: https://resin.mpazbot.workers.dev/mcp
- API Key: `igtcRlUi6YF2GGboiHrKRxUeVEXITDOo` (stored in Cloudflare secrets)

---

## Summary

Successfully secured the Resin MCP server with Bearer token authentication, following established patterns from the Compass project. The implementation is clean, tested, and deployed to production. All endpoints now require a valid API key, protecting sensitive Salesforce donor data from unauthorized access.

The repository is now properly organized as a monorepo with clear documentation for both the Resin MCP server and Mill workflow projects. All paths and references have been corrected throughout the documentation.

**Status:** Ready for production use with secure authentication. ✅
