# Devlog 003: Recipe Deployment Models

**Date:** 2025-10-30
**Topic:** Deployment architecture for Goose recipes - customer-run vs managed service

## Context

We've successfully created the `goose-recipes` skill and generated our first production recipe (`fundraising-data-analysis.yaml`) that works with the Resin MCP server. Now we need to consider: **who actually runs these recipes?**

This is being built for a Salesforce consultant (https://www.resin.team/ai-fundraising-solutions) selling AI fundraising solutions to nonprofit customers. The deployment model significantly impacts product architecture, customer experience, and business viability.

## Two Deployment Models

### Model 1: Customer-Run CLI

Customers install and run Goose CLI on their own infrastructure.

**Architecture:**
```
Customer's Machine/Server
  ├─ Goose CLI installed
  ├─ Recipe files (YAML)
  ├─ Shell scripts
  ├─ API keys configured
  └─ Cron jobs for scheduling
```

**Workflow:**
1. Customer installs Goose CLI
2. Customer receives recipe files and scripts
3. Customer configures API keys
4. Customer runs `./mill/run-fundraising-analysis.sh`
5. Reports generated locally or to their chosen destination

**Pros:**
- Maximum customer control and customization
- No infrastructure costs for provider
- Customer owns all data in their environment
- Can integrate with their existing automation

**Cons:**
- High technical barrier for nonprofit customers
- Support overhead (different environments, versions, configs)
- API key distribution and security concerns
- Difficult to ensure consistent execution quality
- Hard to troubleshoot customer environments
- Each customer needs Goose expertise

**Best For:**
- Technical customers with DevOps resources
- Customers who need air-gapped or highly secure environments
- Open-source or enterprise self-hosted offerings

---

### Model 2: Managed Service (SaaS)

Provider runs recipes on behalf of customers and delivers results.

**Architecture:**
```
Customer Portal (Web UI)
  ├─ Configure report preferences
  ├─ Set parameters (date ranges, segments, etc.)
  ├─ Schedule frequency
  └─ Delivery preferences

         ↓

Provider Backend Service
  ├─ Customer configuration database
  ├─ Encrypted credential storage
  ├─ Job scheduler (cron/CloudFlare Workers cron triggers)
  ├─ Goose CLI execution environment
  └─ Recipe orchestration

         ↓

Execution Layer
  ├─ goose run --recipe <recipe>.yaml
  ├─ Uses customer-specific parameters
  ├─ Connects to Resin MCP (with customer's SF credentials)
  └─ Generates reports

         ↓

Delivery Layer
  ├─ Customer's Google Drive
  ├─ Customer's SharePoint
  ├─ Email delivery
  └─ Customer portal download
```

**Workflow:**
1. Customer signs up and connects Salesforce
2. Customer configures desired reports via web UI
3. System automatically runs recipes on schedule
4. Reports delivered to customer's chosen destination
5. Customer receives notification

**Pros:**
- **Low barrier to entry** - No technical setup for customers
- **Predictable service** - "Your report arrives every Monday at 8am"
- **Easier support** - Provider controls execution environment
- **Professional delivery** - Seamless, automated experience
- **Quality control** - Provider ensures reports are correct
- **Recurring revenue model** - Subscription for automated reports
- **Better for nonprofits** - Most don't have technical staff

**Cons:**
- Provider must operate infrastructure
- Hosting costs (but can use Cloudflare Workers!)
- Must securely store customer Salesforce credentials
- Provider responsible for uptime and reliability

**Best For:**
- Nonprofit customers without technical staff
- Consultants selling managed services
- SaaS business model with recurring revenue
- Professional service offerings

## Technical Feasibility: Running Goose in the Cloud

### Current Architecture
- **Resin MCP Server**: Already running on Cloudflare Workers ✅
- **Goose Recipes**: YAML configurations that call MCP server ✅
- **Goose CLI**: Node.js application that executes recipes

### Can We Run Goose in Cloudflare Workers?

**Challenge:** Goose CLI is a Node.js application designed for local execution. Cloudflare Workers have limitations:
- No persistent filesystem
- Limited execution time (CPU time limits)
- No native Node.js process spawning

**Options:**

#### Option A: Cloudflare Workers Cron Triggers
Use Cloudflare Workers cron triggers to orchestrate recipe execution, but run Goose elsewhere:

```typescript
// Cloudflare Worker with cron trigger
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    // Trigger external Goose execution
    await fetch('https://goose-runner.example.com/run', {
      method: 'POST',
      body: JSON.stringify({
        recipe: 'fundraising-data-analysis',
        customer_id: 'abc123',
        params: { analysis_period: 'last month' }
      })
    });
  }
}
```

Then run Goose on:
- **Cloudflare Durable Objects** (stateful, long-running)
- **Traditional VPS** (DigitalOcean, Fly.io, Railway)
- **Serverless containers** (AWS Fargate, Google Cloud Run)

#### Option B: Direct MCP Integration
Skip Goose CLI entirely and call the Resin MCP server directly from Cloudflare Workers:

```typescript
// Cloudflare Worker directly calling MCP server
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    const mcpClient = new MCPClient(env.RESIN_URL, env.RESIN_API_KEY);

    // Execute SOQL queries directly
    const revenue = await mcpClient.callTool('run_soql', {
      query: 'SELECT SUM(Amount) FROM Opportunity...'
    });

    // Generate report
    const report = await generateMarkdownReport(revenue);

    // Deliver to customer
    await deliverToGoogleDrive(report, customerId);
  }
}
```

**Pros:** No Goose dependency, full control, Cloudflare-native
**Cons:** Lose recipe abstraction, harder to maintain complex workflows

#### Option C: Hybrid Approach
Use recipes as **specifications** but execute them differently in production:

```
Development:
  - Write specs in markdown
  - Use goose-recipes skill to generate YAML
  - Test locally with Goose CLI

Production:
  - Parse recipe YAML
  - Execute workflow steps directly (without Goose)
  - Use Cloudflare Workers for orchestration
```

This means recipes serve as:
- ✅ Clear workflow documentation
- ✅ Development and testing tool
- ✅ Specification for production implementation
- ❌ Not directly executed in production

## Recommendation

For **Resin.team selling to nonprofits**, I recommend:

### **Model 2 (Managed Service) + Option A (External Goose Runner)**

**Why:**
1. **Customer experience** - Nonprofits want "set it and forget it," not CLI tools
2. **Business model** - Recurring revenue from automated report subscriptions
3. **Leverage existing infrastructure** - Resin MCP already on Cloudflare
4. **Keep recipe benefits** - Still use goose-recipes skill for development
5. **Practical execution** - Run Goose on simple VPS or serverless container

**Architecture:**

```
Cloudflare Workers
  ├─ Resin MCP Server (existing)
  ├─ Customer Portal API
  ├─ Cron triggers for scheduling
  └─ Webhook receiver for job status

         ↓ triggers

VPS/Container (Fly.io, Railway, Cloud Run)
  ├─ Goose CLI installed
  ├─ Recipe files
  ├─ Job queue processor
  └─ Executes: goose run --recipe

         ↓ generates

Report Delivery
  ├─ Google Drive API
  ├─ Email (SendGrid, Postmark)
  └─ Customer portal storage
```

**Customer Experience:**
1. Sign up at resin.team
2. Connect Salesforce (OAuth)
3. Configure reports: "Send me donor analysis every Monday"
4. Reports appear in Google Drive automatically
5. Customer stays in Salesforce/Drive - never touches CLI

**Cost Structure:**
- Cloudflare Workers: Free tier sufficient for most
- VPS for Goose: $5-10/month (Fly.io, Railway)
- Storage: Customer's own Google Drive/SharePoint
- **Total:** ~$10/month can support hundreds of customers

## Decision Points for Customer

The consultant should decide based on:

1. **Target market sophistication**
   - Tech-savvy nonprofits with IT staff → Model 1 possible
   - Typical small/medium nonprofits → Model 2 essential

2. **Business model**
   - One-time implementation fee → Model 1 works
   - Recurring subscription revenue → Model 2 required

3. **Support capacity**
   - Large support team → Model 1 manageable
   - Small/solo consultant → Model 2 reduces support burden

4. **Product positioning**
   - "Open source / self-hosted" → Model 1
   - "Managed AI service" → Model 2

5. **Sales cycle**
   - Long enterprise sales → Model 1 negotiable
   - Fast SMB sales → Model 2 removes friction

## Next Steps

### If Model 1 (Customer-Run):
- [ ] Create installation guide for customers
- [ ] Document API key distribution process
- [ ] Create troubleshooting guide
- [ ] Consider offering "premium support" tier

### If Model 2 (Managed Service):
- [ ] Design customer portal for configuration
- [ ] Build job scheduling system (Cloudflare cron + external runner)
- [ ] Implement secure credential storage
- [ ] Set up report delivery integrations (Google Drive, email)
- [ ] Create monitoring and alerting
- [ ] Define SLA and uptime guarantees

### Hybrid Approach:
- [ ] Offer both: Enterprise (Model 1) + Standard (Model 2)
- [ ] Price accordingly
- [ ] Use same recipes for both deployment models

## Open Questions

1. **Does Goose CLI work in serverless containers?** (Need to test)
2. **What's the cost per recipe execution?** (CPU time, API calls)
3. **How do we handle long-running reports?** (Some analyses may take minutes)
4. **Customer credential security?** (Encryption at rest, key management)
5. **Multi-tenancy isolation?** (Separate execution environments per customer?)

## References

- [Cloudflare Workers Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Fly.io for running Node.js apps](https://fly.io/docs/languages-and-frameworks/node/)
- [Railway.app deployment](https://docs.railway.app/)
- [Google Cloud Run for containers](https://cloud.google.com/run)

## Impact on Mill Architecture

Regardless of deployment model chosen:

**Keep doing:**
- ✅ Write specs in `mill/spec/`
- ✅ Use `goose-recipes` skill to generate recipes
- ✅ Test recipes locally with CLI
- ✅ Version control recipes as executable specifications

**Recipes serve as:**
- Source of truth for workflow logic
- Development and testing tool
- Specification for production implementation
- Documentation of what the workflow does

Even if production uses custom orchestration (Option B/C), the recipe development workflow remains valuable for:
- Clear workflow definition
- Fast prototyping
- Local testing
- Consistent structure

---

**Conclusion:** The deployment model significantly impacts architecture but doesn't change the value of the `goose-recipes` skill and recipe-based development. The consultant can choose the model that fits their business, and we've built a system flexible enough to support either approach.
