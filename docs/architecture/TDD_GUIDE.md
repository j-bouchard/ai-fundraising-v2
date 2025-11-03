# Test-Driven Development (TDD) Guide

## 🎯 Testing Philosophy

This project uses a **comprehensive TDD approach** with both unit and integration tests against your **live Cloudflare deployment** connected to your **Salesforce sandbox**.

### Why TDD for MCP Servers?

1. **Confidence in Changes** - Modify and extend with confidence
2. **Living Documentation** - Tests document expected behavior
3. **Fast Feedback** - Catch issues before they reach production
4. **Regression Prevention** - Ensure old features still work
5. **Beta-Ready** - Move to beta quickly with test coverage

## 🏗️ Test Structure

```
tests/
├── mcp-client.ts                    # Reusable MCP client for testing
├── fixtures/
│   └── test-data.ts                 # Test fixtures and mock data
├── unit/
│   └── soql-builder.test.ts         # Unit tests (no external deps)
└── integration/
    └── mcp-server.test.ts           # Integration tests (live server)
```

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode (TDD)
```bash
npm run test:watch
```

### Run Only Integration Tests
```bash
npm run test:integration
```

### Run Only Unit Tests
```bash
npm run test:unit
```

### Run with Visual UI
```bash
npm run test:ui
```

### Run with Coverage Report
```bash
npm run test:coverage
```

## 📝 TDD Workflow

### 1. Red-Green-Refactor Cycle

**RED** → Write a failing test first
```typescript
it("should create a major donors tool", async () => {
  const result = await client.callTool("find_major_donors", {
    minimumAmount: 10000,
    limit: 10
  });
  expect(result).toBeDefined();
});
```

**GREEN** → Write minimal code to make it pass
```typescript
server.registerTool("find_major_donors", {
  // ... implementation
});
```

**REFACTOR** → Clean up and optimize
```typescript
// Extract reusable logic, improve readability
```

### 2. Test-First Development Process

When adding a new feature:

1. **Write the test**
   ```bash
   npm run test:watch
   # Test will fail (RED)
   ```

2. **Implement the feature**
   ```typescript
   // Add your implementation in src/server.ts
   ```

3. **Watch test pass (GREEN)**
   ```bash
   # Vitest automatically reruns and shows green ✓
   ```

4. **Refactor if needed**
   ```bash
   # Tests still pass while you refactor
   ```

5. **Deploy with confidence**
   ```bash
   npm run deploy
   ```

## 🧪 Test Categories

### Unit Tests (`tests/unit/`)

Test **pure functions** without external dependencies:
- SOQL query generation
- Amount parsing (e.g., "$10k" → 10000)
- Date parsing (e.g., "last 6 months")
- Utility functions

**Fast** ⚡ - Run in milliseconds
**Isolated** 🔒 - No network calls
**Deterministic** ✅ - Same input = same output

### Integration Tests (`tests/integration/`)

Test **against live Cloudflare deployment**:
- MCP server initialization
- Tool execution (run_soql, create_record, update_record)
- Real Salesforce API calls
- End-to-end workflows

**Realistic** 🌍 - Tests actual deployment
**Sandbox Safe** 🛡️ - Uses test data
**Comprehensive** 📊 - Full system coverage

## 📊 Test Coverage Goals

Target coverage for beta release:
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All critical paths
- **Tools**: 100% of exposed MCP tools tested

Check current coverage:
```bash
npm run test:coverage
```

## 🎨 Writing Good Tests

### DO ✅

```typescript
// Clear test names
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
// Always mark test records with description: "Test - safe to delete"
```

## 🔄 Continuous Testing During Development

### Terminal 1: Watch Tests
```bash
npm run test:watch
```

### Terminal 2: Make Changes
```bash
# Edit src/server.ts
# Tests auto-rerun on save
```

### Terminal 3: Deploy When Ready
```bash
npm run deploy
```

## 🛡️ Safe Testing Practices

### Sandbox Data Safety

All test data should be:
1. **Clearly marked** - Include "Test" or timestamp in names
2. **Self-documenting** - Description: "Created by automated test - safe to delete"
3. **Unique** - Use timestamps or UUIDs
4. **Isolated** - Don't depend on specific existing records

### Example Safe Test
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

## 📈 Moving to Beta Checklist

Before promoting to beta:

- [ ] All integration tests passing
- [ ] Unit test coverage > 80%
- [ ] All critical user workflows tested
- [ ] Error handling tested and documented
- [ ] Performance tests if needed
- [ ] Security review of test credentials

Run full test suite:
```bash
npm test
npm run test:coverage
```

## 🐛 Debugging Failed Tests

### View Detailed Logs
```bash
npm run test -- --reporter=verbose
```

### Debug Specific Test
```bash
npm run test -- tests/integration/mcp-server.test.ts -t "should create a test Contact"
```

### Check Cloudflare Logs
```bash
npx wrangler tail
```

### Test Against Local Dev Server
```bash
# Terminal 1
npm run dev

# Terminal 2
export MCP_SERVER_URL=http://localhost:8787/mcp
npm run test:integration
```

## 🎯 Example TDD Session

Let's add a new "find_lapsed_donors" tool:

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

## 📚 Resources

- **Vitest Docs**: https://vitest.dev/
- **MCP Specification**: https://modelcontextprotocol.io/
- **Salesforce SOQL**: https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta

## 🎉 Happy Testing!

Remember: **Tests are not just validation—they're documentation, specification, and confidence.**
