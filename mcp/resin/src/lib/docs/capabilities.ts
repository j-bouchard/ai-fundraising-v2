/**
 * Capabilities documentation content
 * This file exports the capabilities documentation as a string constant
 * for use in the MCP resource registration
 */

export const CAPABILITIES_DOC = `# Resin MCP Server - Capabilities Overview

## What is Resin?

Resin is a **Cloudflare Workers-based MCP (Model Context Protocol) server** for Salesforce fundraising analytics. It provides AI assistants with tools to query donor data, segment audiences, and perform fundraising analytics through natural language interactions.

**Production deployment:** https://resin.mpazbot.workers.dev

## Authentication

All requests require Bearer token authentication:
\`\`\`
Authorization: Bearer <api-key>
\`\`\`

## Available Tools

### 1. run_soql
**Execute SOQL queries against Salesforce**

- Execute any SOQL query against your Salesforce org
- Returns formatted results with record count
- Supports all standard SOQL features:
  - COUNT() aggregations
  - GROUP BY clauses
  - Subqueries
  - Field relationships (e.g., Account.Name)
- Configurable result limit (1-100 records, default: 25)

**Example use cases:**
- "Show me all contacts created this month"
- "Count opportunities by stage"
- "List accounts with more than 5 contacts"

**Input:**
- \`query\` (string, required): The SOQL query to execute
- \`limit\` (number, optional): Max records to display (1-100, default: 25)

**Output:** Formatted table with results and record count

---

### 2. create_record
**Create any Salesforce sObject record**

- Create Contacts, Opportunities, Tasks, Custom Objects, etc.
- Returns the newly created record ID
- Supports all standard and custom fields

**Example use cases:**
- "Create a new contact named John Smith"
- "Add a follow-up task for next week"
- "Create a $50,000 opportunity"

**Input:**
- \`sobject\` (string, required): sObject type (e.g., "Contact", "Opportunity", "Task")
- \`fields\` (object, required): Field names and values

**Output:** Success message with the new record ID

---

### 3. update_record
**Update any Salesforce sObject record**

- Update existing records by their Salesforce ID
- Supports partial updates (only specified fields)
- Works with any sObject type

**Example use cases:**
- "Update the contact's email address"
- "Change the opportunity stage to Closed Won"
- "Mark the task as completed"

**Input:**
- \`sobject\` (string, required): sObject type
- \`record_id\` (string, required): 15 or 18 character Salesforce ID
- \`fields\` (object, required): Field names and new values

**Output:** Success confirmation

---

### 4. query_donors
**Query donors using natural language criteria**

- Intelligent donor segmentation using natural language
- Pre-built patterns for common fundraising scenarios
- Returns formatted donor data with giving history

**Supported donor segments:**
- **Lapsed donors**: Donors who haven't given recently (customizable timeframe)
- **Major donors**: High-value donors above a specified threshold
- **Recent donors**: Donors who gave within a specified period
- **First-time donors**: New donors from a specific timeframe
- **Recurring donors**: Active recurring/sustainer donors
- **Upgrade candidates**: Donors showing increased giving patterns
- **At-risk donors**: Previously engaged donors showing declining activity
- **Mid-level donors**: Donors in a specific giving range
- **High-value engaged**: Major donors with recent activity
- **Warm prospects**: Engaged contacts who haven't donated yet

**Example queries:**
- "Show me lapsed donors from the last 12 months"
- "Find major donors over $10,000"
- "List recent donors from the past 30 days"
- "Get all recurring donors"
- "Find upgrade candidates who gave more this year"

**Input:**
- \`criteria\` (string, required): Natural language donor segment description
- \`limit\` (number, optional): Max donors to return (1-100, default: 25)

**Output:** Formatted donor list with giving summaries

---

## Data Model

Resin works with **Salesforce NPSP (Nonprofit Success Pack)** data model:

- **Contact**: Individual donors and constituents
- **Account**: Organizational donors and households
- **Opportunity**: Individual donations/gifts
- **npe03__Recurring_Donation__c**: Recurring gift schedules
- **Campaign**: Fundraising campaigns
- **CampaignMember**: Campaign participation records

## Pre-Built Query Patterns

Resin includes 20+ optimized query patterns:

**Donor Segmentation (10 patterns):**
- Lapsed donors
- Major donors
- Recent donors
- First-time donors
- Recurring donors
- Upgrade candidates
- At-risk donors
- Mid-level donors
- High-value engaged
- Warm prospects

**Opportunity Analytics (11+ patterns):**
- Pipeline by stage
- Open pipeline
- Recently won/lost
- Monthly/quarterly revenue
- Year-over-year comparison
- Large gifts
- Gift distribution
- Conversion metrics
- Average days to close

## Performance Features

- **60-second query caching**: Identical SOQL queries are cached for 60 seconds
- **OAuth refresh token flow**: Automatic token management
- **Cloudflare Workers**: Global edge deployment for low latency

## Common Workflows

### Donor Outreach Campaign
1. Use \`query_donors\` to segment lapsed donors
2. Use \`create_record\` to create Campaign records
3. Use \`update_record\` to track outreach status

### Major Gift Pipeline
1. Use \`query_donors\` to find high-value prospects
2. Use \`run_soql\` to analyze giving patterns
3. Use \`create_record\` to create Opportunities

### Reporting & Analytics
1. Use \`run_soql\` with aggregations (COUNT, SUM, AVG)
2. Analyze trends with date-based queries
3. Generate segmentation reports with \`query_donors\`

## Additional Resources

For detailed setup, testing, and development information, see:
- CLAUDE.md - Developer documentation
- ARCHITECTURE.md - Technical architecture details
- TDD_GUIDE.md - Test-driven development workflow
`;
