# Quick Start: TDD with Your MCP Server

## 🚀 5-Minute Setup

Your server is **already tested and working**! Here's how to use TDD for new features.

## ⚡ Essential Commands

```bash
# Start watch mode (best for TDD)
npm run test:watch

# Run all tests once
npm test

# Run only fast unit tests
npm run test:unit

# Run only integration tests (with Salesforce)
npm run test:integration

# Visual test UI
npm run test:ui
```

## 📝 TDD in 3 Steps

### 1. Write the Test (RED)

```typescript
// tests/integration/mcp-server.test.ts
it("should find major donors over $10k", async () => {
  const result = await client.callTool("find_major_donors", {
    minimumAmount: 10000,
    limit: 10
  });
  expect(result.content[0].text).toContain("Donor Results");
});
```

### 2. Watch It Fail

```bash
npm run test:watch
# ❌ Tool "find_major_donors" not found
```

### 3. Make It Pass (GREEN)

```typescript
// src/server.ts
server.registerTool(
  "find_major_donors",
  {
    title: "Find Major Donors",
    description: "Find donors who have given over a specific amount",
    inputSchema: {
      minimumAmount: z.number().min(0),
      limit: z.number().int().min(1).max(100).default(25).optional(),
    },
  },
  async ({ minimumAmount, limit }) => {
    const soql = SOQLBuilder.majorDonorsOver(minimumAmount, limit || 25);
    const result = await fundraisingServer.toolRunSoql(soql);
    return { content: [{ type: "text" as const, text: result }] };
  }
);
```

Watch test turn green: ✅

### 4. Deploy

```bash
npm run deploy
```

## 🎯 Current Test Coverage

```
✅ 30 tests passing
   • 13 unit tests (fast, no API calls)
   • 17 integration tests (real Salesforce)

✅ All 3 MCP tools tested:
   • run_soql
   • create_record
   • update_record
```

## 🔧 Common Tasks

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

## 📁 Where Everything Lives

```
tests/
├── mcp-client.ts              # Helper to call your server
├── fixtures/test-data.ts      # Reusable test data
├── unit/                      # Fast tests (no API)
└── integration/               # Real tests (with Salesforce)
```

## 🎨 Test Patterns

### Use Test Fixtures

```typescript
import { createTestContact } from "../fixtures/test-data";

const contact = createTestContact({
  Email: "custom@example.org"
});
```

### Safe Test Data

All test data is:
- ✅ Timestamped (unique)
- ✅ Labeled "Test" or "AutoTest"
- ✅ Includes "safe to delete" in description
- ✅ Easy to find and clean up

### Extract IDs from Results

```typescript
const result = await client.createRecord("Contact", {...});
const match = result.match(/Id:\s*([a-zA-Z0-9]{15,18})/);
const recordId = match![1];
```

## 🚦 When to Run Tests

**During Development** (watch mode)
```bash
npm run test:watch
```

**Before Committing**
```bash
npm test
```

**After Deploying**
```bash
npm run test:integration
```

## 🐛 Debugging

### See What Your Server Returns

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

## 📊 Test Performance

- **Unit tests**: ~5ms (instant feedback)
- **Integration tests**: ~7s (real Salesforce API)
- **Total suite**: ~7s (fast enough for TDD)

## 🎉 You're Ready!

Your testing infrastructure is **production-ready**:

✅ Tests run against live Cloudflare deployment
✅ Connected to Salesforce sandbox
✅ SSE/HTTP transport working
✅ All tools tested
✅ Error handling validated
✅ Safe test data patterns

**Start TDD workflow**: `npm run test:watch`

---

**Need more details?** See `TDD_GUIDE.md` or `TESTING_SUMMARY.md`
