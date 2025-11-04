# Testing Guide for Resin MCP Server

**Status:** ✅ All 30 tests passing (13 unit, 17 integration)

## Quick Start

### Essential Commands

```bash
# Watch mode (best for TDD)
npm run test:watch

# Run all tests
npm test

# Fast unit tests only
npm run test:unit

# Integration tests only (with Salesforce)
npm run test:integration

# Visual test UI
npm run test:ui

# Coverage report
npm run test:coverage
```

### TDD in 3 Steps

**1. Write the Test (RED)**
```typescript
it("should find major donors over $10k", async () => {
  const result = await client.callTool("find_major_donors", {
    minimumAmount: 10000
  });
  expect(result.content[0].text).toContain("Donor Results");
});
```

**2. Watch It Fail**
```bash
npm run test:watch
# ❌ Tool "find_major_donors" not found
```

**3. Make It Pass (GREEN)**
```typescript
server.registerTool("find_major_donors", {
  title: "Find Major Donors",
  description: "Find donors who have given over a specific amount",
  inputSchema: {
    minimumAmount: z.number().min(0)
  }
}, async ({ minimumAmount }) => {
  const soql = SOQLBuilder.majorDonorsOver(minimumAmount);
  const result = await fundraisingServer.toolRunSoql(soql);
  return { content: [{ type: "text" as const, text: result }] };
});
```

Watch test turn green: ✅

**4. Deploy**
```bash
npm run deploy
```

## Testing Philosophy

### Why TDD for MCP Servers?

1. **Confidence in Changes** - Modify and extend with confidence
2. **Living Documentation** - Tests document expected behavior
3. **Fast Feedback** - Catch issues before production
4. **Regression Prevention** - Ensure old features still work
5. **Beta-Ready** - Move to production with test coverage

### Test Structure

```
tests/
├── mcp-client.ts              # Reusable MCP client for testing
├── fixtures/
│   └── test-data.ts           # Test fixtures and mock data
├── unit/
│   └── soql-builder.test.ts   # Unit tests (no external deps)
└── integration/
    └── mcp-server.test.ts     # Integration tests (live server)
```

## Test Categories

### Unit Tests (`tests/unit/`)

Test **pure functions** without external dependencies:
- SOQL query generation
- Amount parsing (e.g., "$10k" → 10000)
- Date parsing (e.g., "last 6 months")
- Utility functions

**Characteristics:**
- ⚡ Fast - Run in milliseconds
- 🔒 Isolated - No network calls
- ✅ Deterministic - Same input = same output

**Coverage:** 13 tests including:
- Lapsed donors query generation
- Major donors query generation
- Amount/date parsing
- Criteria to SOQL conversion

### Integration Tests (`tests/integration/`)

Test **against live Cloudflare deployment**:
- MCP server initialization
- Tool execution (run_soql, create_record, update_record)
- Real Salesforce API calls
- End-to-end workflows

**Characteristics:**
- 🌍 Realistic - Tests actual deployment
- 🛡️ Sandbox Safe - Uses test data
- 📊 Comprehensive - Full system coverage

**Coverage:** 17 tests including:
- Server health and tool listing
- SOQL queries (COUNT, SELECT, aggregates, date filtering)
- Record creation (Contact, Task)
- Record updates
- Error handling (invalid SOQL, missing fields, bad IDs)
- Donor query scenarios

## TDD Workflow

### Red-Green-Refactor Cycle

**RED** → Write a failing test first
```typescript
it("should find lapsed donors", async () => {
  const result = await client.callTool("find_lapsed_donors", {
    monthsSinceLastGift: 12
  });
  expect(result.content[0].text).toContain("Donor Results");
});
```

**GREEN** → Write minimal code to make it pass
```typescript
server.registerTool("find_lapsed_donors", {
  // ... implementation
});
```

**REFACTOR** → Clean up and optimize
```typescript
// Extract reusable logic, improve readability
```

### Continuous Testing During Development

**Terminal 1: Watch Tests**
```bash
npm run test:watch
```

**Terminal 2: Make Changes**
```bash
# Edit src/server.ts
# Tests auto-rerun on save
```

**Terminal 3: Deploy When Ready**
```bash
npm run deploy
```

## Writing Good Tests

### DO ✅

```typescript
// Clear, descriptive test names
it("should query recent donors from last 6 months", async () => {
  const result = await client.runSoql(
    "SELECT Id FROM Contact WHERE CreatedDate = LAST_N_MONTHS:6"
  );
  expect(result).toContain("SOQL Result");
});

// Test edge cases
it("should handle empty query results gracefully", async () => {
  const result = await client.runSoql(
    "SELECT Id FROM Contact WHERE Email = 'nonexistent@example.com'"
  );
  expect(result).toContain("Records returned: 0");
});

// Use fixtures for consistency
import { createTestContact } from "../fixtures/test-data";
const contact = createTestContact({ Email: "custom@example.org" });
```

### DON'T ❌

```typescript
// Vague test names
it("should work", async () => { ... });

// Testing multiple things in one test
it("should create and update and delete", async () => { ... });

// Hard-coded IDs that might not exist
const contactId = "003XXXXXXXXXXXXXX"; // ❌

// No cleanup of test data
// Always mark test records: "Test - safe to delete"
```

## Safe Testing Practices

### Sandbox Data Safety

All test data should be:
1. **Clearly marked** - Include "Test" or timestamp in names
2. **Self-documenting** - Description: "Created by automated test - safe to delete"
3. **Unique** - Use timestamps or UUIDs
4. **Isolated** - Don't depend on specific existing records

**Example Safe Test:**
```typescript
it("should create a test contact safely", async () => {
  const timestamp = Date.now();
  const result = await client.createRecord("Contact", {
    FirstName: "AutoTest",
    LastName: `User_${timestamp}`,
    Email: `autotest.${timestamp}@example.org`,
    Description: "Created by automated test - safe to delete"
  });
  expect(result).toContain("Record Created");
});
```

### Use Test Fixtures

```typescript
import { createTestContact } from "../fixtures/test-data";

const contact = createTestContact({
  Email: "custom@example.org"
});
```

### Extract IDs from Results

```typescript
const result = await client.createRecord("Contact", {...});
const match = result.match(/Id:\s*([a-zA-Z0-9]{15,18})/);
const recordId = match![1];
```

## Common Testing Tasks

### Add a New Tool

1. **Write test first** in `tests/integration/mcp-server.test.ts`
2. **Run watch mode**: `npm run test:watch`
3. **Implement tool** in `src/server.ts`
4. **Watch test pass** ✅
5. **Deploy**: `npm run deploy`

### Test a SOQL Query

```typescript
it("should query contacts from last 30 days", async () => {
  const result = await client.runSoql(
    "SELECT Id, Name FROM Contact WHERE CreatedDate = LAST_N_DAYS:30"
  );
  expect(result).toContain("SOQL Result");
});
```

### Test Creating a Record

```typescript
it("should create an opportunity", async () => {
  const result = await client.createRecord("Opportunity", {
    Name: "Test Donation",
    StageName: "Closed Won",
    CloseDate: "2025-12-31",
    Amount: 5000
  });
  expect(result).toContain("Record Created");
});
```

### Test Error Handling

```typescript
it("should handle invalid input gracefully", async () => {
  const result = await client.runSoql("INVALID SOQL");
  expect(result).toContain("Salesforce Error");
});
```

## Debugging

### View Detailed Logs

```bash
npm run test -- --reporter=verbose
```

### Watch Cloudflare Logs

```bash
npx wrangler tail
```

### Test One Specific Test

```bash
npm run test -- -t "should create a test Contact"
```

### Test Specific File

```bash
npm run test -- tests/integration/mcp-server.test.ts
```

### Test Against Local Dev Server

```bash
# Terminal 1
npm run dev

# Terminal 2
export MCP_SERVER_URL=http://localhost:8787/mcp
npm run test:integration
```

## Test Performance

- **Unit tests**: ~5ms (instant feedback)
- **Integration tests**: ~15s (real Salesforce API)
- **Total suite**: ~15s (fast enough for TDD)

## Current Test Coverage

### Coverage Goals

Target for production release:
- **Unit Tests**: 80%+ coverage ✅
- **Integration Tests**: All critical paths ✅
- **Tools**: 100% of exposed MCP tools tested ✅

Check current coverage:
```bash
npm run test:coverage
```

### Beta Readiness Checklist

- [x] All core tools tested (run_soql, create_record, update_record)
- [x] Error handling validated
- [x] Live Salesforce integration confirmed
- [x] Cloudflare Workers deployment verified
- [x] SSE/HTTP transport working
- [x] Test fixtures created for consistency
- [x] TDD workflow documented
- [x] Fast feedback loop established
- [x] Safe test data patterns
- [x] 30 tests passing, 0 failures

**Status:** ✅ Production-ready with comprehensive test coverage

## Complete TDD Example

Let's add a new "find_lapsed_donors" tool from scratch:

### Step 1: Write the test (RED)
```typescript
// tests/integration/mcp-server.test.ts
it("should find lapsed donors", async () => {
  const result = await client.callTool("find_lapsed_donors", {
    monthsSinceLastGift: 12,
    limit: 10
  });
  expect(result.content[0].text).toContain("Donor Results");
});
```

### Step 2: Run test (FAILS)
```bash
npm run test:watch
# ❌ Error: Tool "find_lapsed_donors" not found
```

### Step 3: Implement (GREEN)
```typescript
// src/server.ts
server.registerTool(
  "find_lapsed_donors",
  {
    title: "Find Lapsed Donors",
    description: "Find donors who haven't given in N months",
    inputSchema: {
      monthsSinceLastGift: z.number().int().min(1).default(12),
      limit: z.number().int().min(1).max(100).default(25).optional(),
    },
  },
  async ({ monthsSinceLastGift, limit }) => {
    const soql = SOQLBuilder.lapsedDonors(monthsSinceLastGift, limit || 25);
    const result = await fundraisingServer.toolRunSoql(soql);
    return { content: [{ type: "text" as const, text: result }] };
  }
);
```

### Step 4: Test passes (GREEN)
```bash
npm run test:watch
# ✓ should find lapsed donors
```

### Step 5: Deploy
```bash
npm run deploy
```

## Next Steps

### Expand Coverage
- [ ] Add tests for additional donor segmentation tools
- [ ] Test edge cases (rate limits, timeouts)
- [ ] Performance tests for large result sets
- [ ] Test multi-environment deployments

### CI/CD Integration
- [ ] Set up GitHub Actions
- [ ] Run tests on every commit
- [ ] Block merges if tests fail
- [ ] Deploy automatically when tests pass

### Monitoring
- [ ] Set up error tracking
- [ ] Monitor test execution time trends
- [ ] Track test flakiness
- [ ] Alert on test failures

## Resources

- **Vitest Docs**: https://vitest.dev/
- **MCP Specification**: https://modelcontextprotocol.io/
- **Salesforce SOQL**: https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta

## Summary

Your testing infrastructure is **production-ready**:

✅ Tests run against live Cloudflare deployment
✅ Connected to Salesforce sandbox
✅ SSE/HTTP transport working
✅ All tools tested
✅ Error handling validated
✅ Safe test data patterns
✅ Fast feedback loop
✅ 30 tests passing, 0 failures

**Start TDD workflow**: `npm run test:watch`

---

**Remember:** Tests are not just validation—they're documentation, specification, and confidence.
