# Resin AI - Complete System Architecture

**Version:** 1.0  
**Date:** November 25, 2025  
**Purpose:** Technical architecture for AI-powered Salesforce fundraising assistant

---

## Table of Contents
1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Request Flow: Slack Question to Answer](#request-flow-slack-question-to-answer)
4. [Discovery Agent System](#discovery-agent-system)
5. [Document Management System](#document-management-system)
6. [Knowledge Base Architecture](#knowledge-base-architecture)
7. [Storage Strategy](#storage-strategy)
8. [Implementation Phases](#implementation-phases)

---

## System Overview

Resin AI is an intelligent fundraising assistant that helps nonprofits manage donor relationships without logging into Salesforce. It combines:

- **Universal fundraising expertise** (best practices knowledge base)
- **Organization-specific context** (discovered through automated + conversational discovery)
- **Custom documents** (strategic plans, programs, campaign materials)
- **Real-time Salesforce data** (via MCP server integration)

The system delivers insights through Slack (primary), reports, and eventually a web interface.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                   USER INTERFACES                     │
├──────────────────────────────────────────────────────┤
│  • Slack Bot (Primary - December 15)                  │
│  • Automated Reports (January 1)                      │
│  • Web App (Future - Q2 2025)                        │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│             CLOUDFLARE WORKER EDGE                    │
├──────────────────────────────────────────────────────┤
│  Main Request Router (index.ts)                       │
│  • Slack webhook handler                              │
│  • Intent detection                                   │
│  • Session management                                 │
│  • Response orchestration                             │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────┼────────────┬─────────────┐
        ▼            ▼            ▼             ▼
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│Knowledge  │ │    Org    │ │Salesforce │ │Discovery  │
│   Base    │ │  Context  │ │    MCP    │ │   Agent   │
│  Service  │ │  Service  │ │  Server   │ │  Service  │
└───────────┘ └───────────┘ └───────────┘ └───────────┘
        │            │            │             │
        ▼            ▼            ▼             ▼
┌──────────────────────────────────────────────────────┐
│                  STORAGE LAYER                        │
├──────────────────────────────────────────────────────┤
│  Cloudflare R2:                                       │
│  • /knowledge-base/ - Fundraising best practices      │
│  • /org-profiles/ - Discovery findings & context      │
│  • /documents/ - Uploaded strategic docs              │
│  • /reports/ - Generated analysis reports             │
│                                                       │
│  Cloudflare KV:                                      │
│  • Session states (conversations)                     │
│  • Response cache (5-hour TTL)                       │
│  • Embeddings index (semantic search)                │
│  • Org credentials (encrypted)                       │
└──────────────────────────────────────────────────────┘
```

---

## Request Flow: Slack Question to Answer

### Complete Flow Diagram

```
User asks in Slack: "Who are my top major gift prospects?"
                     │
                     ▼
        ┌─────────────────────────┐
        │   1. SLACK WEBHOOK       │
        │   Cloudflare Worker      │
        │   (3-second timeout)     │
        └─────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  2. INTENT DETECTION     │
        │  Classify question type  │
        │  Route to handler        │
        └─────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  3. CONTEXT GATHERING    │ ← Parallel execution
        ├─────────────────────────┤
        │  a. Load org profile     │
        │  b. Search knowledge base │
        │  c. Get cached response  │
        └─────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  4. SALESFORCE QUERY     │
        │  Via MCP Server          │
        │  (if not cached)         │
        └─────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  5. AI PROCESSING        │
        │  Anthropic Claude API    │
        │  Combine all context     │
        └─────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  6. RESPONSE GENERATION  │
        │  Format for Slack        │
        │  Cache for 5 hours       │
        └─────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  7. SLACK RESPONSE       │
        │  Post to thread          │
        │  Log interaction         │
        └─────────────────────────┘
```

### Detailed Implementation

```typescript
// src/handlers/slack.ts
export async function handleSlackRequest(request: Request, env: Env) {
  const body = await request.json();
  const { text, user, channel, ts, team } = body.event;
  
  // 1. Quick acknowledgment (must be within 3 seconds)
  await postToSlack(channel, "🤔 Thinking...", ts);
  
  // 2. Get org context
  const orgId = await getOrgIdFromSlackTeam(team);
  const [orgContext, cachedResponse] = await Promise.all([
    loadOrgContext(orgId),
    checkCache(orgId, text)
  ]);
  
  // 3. Return cached if available
  if (cachedResponse && !isStale(cachedResponse)) {
    return await postToSlack(channel, cachedResponse.text, ts);
  }
  
  // 4. Detect intent and route
  const intent = detectIntent(text);
  
  // 5. Gather knowledge in parallel
  const [knowledgeBase, salesforceData] = await Promise.all([
    searchKnowledgeBase(text, intent),
    querySalesforce(orgId, intent, text)
  ]);
  
  // 6. Generate response with AI
  const response = await generateAIResponse({
    query: text,
    intent,
    orgContext,
    knowledgeBase,
    salesforceData
  });
  
  // 7. Cache and respond
  await Promise.all([
    cacheResponse(orgId, text, response),
    postToSlack(channel, response, ts),
    logInteraction(orgId, user, text, response)
  ]);
}

// Intent detection maps to different handlers
function detectIntent(text: string): Intent {
  const intents = {
    DONOR_RESEARCH: /who|tell me about|donor|prospect/i,
    PRIORITIZATION: /priority|focus|should i|next/i,
    DATA_ANALYSIS: /analyze|trend|performance|how many/i,
    DRAFT_EMAIL: /write|draft|email|letter/i,
    CREATE_RECORD: /create|add|new|log/i,
    UPDATE_RECORD: /update|change|modify|edit/i,
    DISCOVERY: /setup|configure|tell you about our/i
  };
  
  for (const [intent, pattern] of Object.entries(intents)) {
    if (pattern.test(text)) return intent as Intent;
  }
  
  return Intent.GENERAL_QUESTION;
}
```

---

## Discovery Agent System

### Architecture Overview

The Discovery Agent has two complementary components that work together to build a complete understanding of each organization:

```
┌─────────────────────────────────────────────────────┐
│              DISCOVERY AGENT SYSTEM                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. AUTOMATED DISCOVERY (No user input needed)      │
│     • Runs on schedule (weekly)                     │
│     • Explores Salesforce metadata                  │
│     • Detects patterns and usage                    │
│     • Generates questions for gaps                  │
│                                                      │
│  2. CONVERSATIONAL DISCOVERY (Slack/Web)            │
│     • Asks targeted questions                       │
│     • Learns business rules                         │
│     • Captures strategic context                    │
│     • Updates continuously                          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 1. Automated Discovery Worker

**Location:** `src/workers/discovery-automated.ts`  
**Runs:** On schedule via Cloudflare Cron Triggers  
**No user interaction required**

```typescript
// Cloudflare Cron: "0 0 * * MON" (Weekly on Mondays)
export async function scheduled(event: ScheduledEvent, env: Env) {
  const orgs = await getActiveOrgs(env.KV);
  
  for (const org of orgs) {
    const discovery = new AutomatedDiscovery(env);
    await discovery.run(org.id);
  }
}

class AutomatedDiscovery {
  async run(orgId: string) {
    // 1. Connect to Salesforce
    const sf = await this.connectSalesforce(orgId);
    
    // 2. Discover schema and configuration
    const findings = {
      objects: await this.discoverObjects(sf),
      fields: await this.analyzeFields(sf),
      validation: await this.detectValidationRules(sf),
      patterns: await this.detectPatterns(sf),
      dataQuality: await this.assessQuality(sf)
    };
    
    // 3. Compare to best practices
    const gaps = await this.compareToKnowledgeBase(findings);
    
    // 4. Generate questions for human review
    const questions = this.generateQuestions(gaps);
    
    // 5. Store everything
    await this.storeFindings(orgId, findings, questions);
    
    // 6. Notify if significant changes detected
    if (this.hasSignificantChanges(findings)) {
      await this.notifyViaSlack(orgId, 
        "I noticed some changes in your Salesforce setup. " +
        "Can I ask a few quick questions to update my understanding?"
      );
    }
  }
  
  // Example: Detect donor segmentation patterns
  async detectPatterns(sf: SalesforceClient) {
    // Query giving history to find natural tiers
    const gifts = await sf.query(`
      SELECT Amount, COUNT(Id) count
      FROM Opportunity
      WHERE Amount != null AND StageName = 'Closed Won'
      GROUP BY Amount
      ORDER BY Amount DESC
      LIMIT 1000
    `);
    
    // Use clustering to find natural breakpoints
    const tiers = this.clusterAmounts(gifts.records);
    
    // Detect campaign usage patterns
    const campaigns = await sf.query(`
      SELECT Type, COUNT(Id) count
      FROM Campaign
      GROUP BY Type
    `);
    
    return {
      donorTiers: tiers,
      campaignTypes: campaigns.records,
      customFieldUsage: await this.analyzeCustomFieldUsage(sf)
    };
  }
}
```

### 2. Conversational Discovery Bot

**Location:** `src/handlers/discovery-conversation.ts`  
**Triggered by:** User request in Slack or scheduled check-ins  
**Maintains conversation state across messages**

```typescript
export class ConversationalDiscovery {
  constructor(
    private slack: SlackClient,
    private storage: StorageService,
    private ai: AnthropicClient
  ) {}
  
  async startDiscovery(channel: string, orgId: string) {
    // Load what we already know
    const automated = await this.storage.getAutomatedFindings(orgId);
    const questions = await this.storage.getPendingQuestions(orgId);
    
    // Create session
    const session = {
      id: crypto.randomUUID(),
      orgId,
      channel,
      state: 'active',
      currentQuestionIndex: 0,
      questions,
      answers: []
    };
    
    await this.storage.saveSession(session);
    
    // Start conversation
    await this.slack.post(channel, 
      "Hi! I've analyzed your Salesforce setup and have a few questions " +
      "to better understand your fundraising process."
    );
    
    // Ask first question
    await this.askQuestion(session, questions[0]);
  }
  
  async handleResponse(text: string, session: DiscoverySession) {
    // 1. Process and structure the answer
    const structured = await this.ai.extractStructured(
      session.questions[session.currentQuestionIndex],
      text
    );
    
    // 2. Update org profile immediately
    await this.updateOrgProfile(session.orgId, structured);
    
    // 3. Save answer
    session.answers.push({
      question: session.questions[session.currentQuestionIndex],
      rawAnswer: text,
      structured
    });
    
    // 4. Move to next question or complete
    session.currentQuestionIndex++;
    
    if (session.currentQuestionIndex < session.questions.length) {
      await this.askQuestion(session, session.questions[session.currentQuestionIndex]);
    } else {
      await this.completeDiscovery(session);
    }
    
    await this.storage.saveSession(session);
  }
  
  // Example questions based on gaps
  generateContextualQuestions(findings: any) {
    const questions = [];
    
    // Donor tiers not clear from data
    if (!findings.patterns.donorTiers.clear) {
      questions.push({
        id: 'donor_tiers',
        question: 'How do you categorize donors by giving level?',
        followUp: 'What dollar amounts define each tier?',
        expectedFormat: {
          tiers: [
            { name: 'string', min: 'number', max: 'number' }
          ]
        }
      });
    }
    
    // Custom fields detected but purpose unknown
    if (findings.unknownCustomFields.length > 0) {
      questions.push({
        id: 'custom_fields',
        question: `I see you have custom fields like ${findings.unknownCustomFields.join(', ')}. What are these used for?`,
        expectedFormat: {
          fieldPurposes: { fieldName: 'purpose' }
        }
      });
    }
    
    return questions;
  }
}
```

### 3. Continuous Learning System

The Discovery Agent continuously learns and updates its understanding:

```typescript
// src/workers/continuous-learning.ts
export class ContinuousLearning {
  async analyzeInteractions(orgId: string) {
    // Review recent interactions for learning opportunities
    const logs = await this.storage.getRecentLogs(orgId, 7); // Last 7 days
    
    for (const log of logs) {
      // Did user correct the AI?
      if (this.detectCorrection(log)) {
        await this.learnFromCorrection(orgId, log);
      }
      
      // Did user provide new context?
      if (this.detectNewContext(log)) {
        await this.extractAndStoreContext(orgId, log);
      }
      
      // Did query fail or timeout?
      if (log.error || log.timeout) {
        await this.adjustQueryStrategy(orgId, log.query);
      }
    }
  }
  
  async learnFromCorrection(orgId: string, log: InteractionLog) {
    // User said something like "Actually, our major gift level is $25k not $10k"
    const correction = await this.ai.extractCorrection(log.userMessage);
    
    if (correction) {
      // Update org profile
      await this.storage.updateOrgProfile(orgId, correction);
      
      // Invalidate related caches
      await this.cache.invalidatePattern(`${orgId}:donor_tiers:*`);
      
      // Log learning event
      await this.storage.logLearning(orgId, {
        type: 'correction',
        before: log.aiResponse,
        after: correction,
        confidence: 0.95
      });
    }
  }
}
```

---

## Document Management System

### Overview

Organizations can upload strategic documents that provide context for AI recommendations:

```
┌─────────────────────────────────────────────────────┐
│           DOCUMENT MANAGEMENT SYSTEM                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Upload Methods:                                    │
│  • Slack: Drop files in DM with bot                │
│  • Web: Drag & drop interface (future)             │
│  • API: Direct upload endpoint                      │
│                                                      │
│  Supported Documents:                               │
│  • Strategic plans (PDF, DOCX)                     │
│  • Program descriptions                             │
│  • Campaign materials                               │
│  • Board reports                                    │
│  • Donor communications templates                   │
│                                                      │
│  Processing Pipeline:                               │
│  1. Upload to R2 (/documents/orgId/...)            │
│  2. Extract text content                            │
│  3. Generate embeddings                             │
│  4. Index for semantic search                       │
│  5. Available to all AI queries                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Storage Structure in R2

```
/documents/
├── {orgId}/
│   ├── strategic-plans/
│   │   ├── 2024-2026-strategic-plan.pdf
│   │   └── 2024-2026-strategic-plan.json (extracted)
│   ├── programs/
│   │   ├── stem-education-initiative.docx
│   │   ├── youth-mentorship-program.pdf
│   │   └── metadata.json
│   ├── campaigns/
│   │   ├── capital-campaign-2024.pdf
│   │   └── annual-fund-case.docx
│   └── templates/
│       ├── major-gift-proposal-template.docx
│       └── stewardship-email-templates.pdf
```

### Upload Handler Implementation

```typescript
// src/handlers/document-upload.ts
export class DocumentUploadHandler {
  async handleSlackFileUpload(event: SlackFileUploadEvent) {
    const { file, user, team } = event;
    const orgId = await this.getOrgId(team);
    
    // 1. Download file from Slack
    const content = await this.downloadFromSlack(file.url_private);
    
    // 2. Determine category
    const category = await this.categorizeDocument(file.name, content);
    
    // 3. Store in R2
    const path = `documents/${orgId}/${category}/${file.name}`;
    await this.r2.put(path, content);
    
    // 4. Extract and process text
    const extracted = await this.extractText(content, file.mimetype);
    
    // 5. Generate embeddings
    const embeddings = await this.generateEmbeddings(extracted);
    
    // 6. Index for search
    await this.indexDocument(orgId, {
      path,
      name: file.name,
      category,
      content: extracted,
      embeddings,
      uploadedBy: user,
      uploadedAt: new Date().toISOString()
    });
    
    // 7. Confirm to user
    await this.slack.post(event.channel,
      `✅ Document "${file.name}" uploaded and indexed. ` +
      `I'll use this ${category} document to provide better recommendations.`
    );
  }
  
  async categorizeDocument(filename: string, content: Buffer): Promise<string> {
    // Use AI to categorize if not obvious from filename
    const textSample = await this.extractSample(content);
    
    const prompt = `
      Categorize this document:
      Filename: ${filename}
      Content sample: ${textSample}
      
      Categories: strategic-plans, programs, campaigns, templates, reports, other
    `;
    
    const category = await this.ai.complete(prompt);
    return category || 'other';
  }
}
```

### Document Search Integration

```typescript
// How documents are used in responses
export class ResponseGenerator {
  async generateResponse(query: string, orgId: string) {
    // 1. Search org's documents
    const relevantDocs = await this.searchDocuments(orgId, query);
    
    // 2. Include in AI context
    const prompt = `
      User Query: ${query}
      
      Organization Documents:
      ${relevantDocs.map(doc => `
        Document: ${doc.name}
        Relevant Section: ${doc.excerpt}
      `).join('\n')}
      
      Organization Context:
      ${orgContext}
      
      Fundraising Best Practices:
      ${knowledgeBase}
      
      Salesforce Data:
      ${salesforceData}
      
      Generate a response that incorporates the organization's specific
      documents and context.
    `;
    
    return await this.ai.complete(prompt);
  }
}
```

---

## Knowledge Base Architecture

### Three Layers of Knowledge

```
┌─────────────────────────────────────────────────────┐
│            KNOWLEDGE ARCHITECTURE                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. UNIVERSAL FUNDRAISING KNOWLEDGE                 │
│     Location: /knowledge-base/fundraising/          │
│     • Best practices (50+ documents)                │
│     • Industry benchmarks                           │
│     • Proven methodologies                          │
│     • Updated monthly                               │
│                                                      │
│  2. ORGANIZATION-SPECIFIC KNOWLEDGE                 │
│     Location: /org-profiles/{orgId}/                │
│     • Discovery findings                            │
│     • Business rules                                │
│     • Custom processes                              │
│     • Updated continuously                          │
│                                                      │
│  3. UPLOADED DOCUMENTS                              │
│     Location: /documents/{orgId}/                   │
│     • Strategic context                             │
│     • Program details                               │
│     • Campaign materials                            │
│     • Updated as needed                             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Retrieval API Implementation

```typescript
// src/services/knowledge-base.ts
export class KnowledgeBaseService {
  constructor(
    private r2: R2Bucket,
    private kv: KVNamespace,
    private embeddings: EmbeddingService
  ) {}
  
  async search(query: string, orgId?: string): Promise<KnowledgeResult[]> {
    // 1. Generate query embedding
    const queryEmbedding = await this.embeddings.generate(query);
    
    // 2. Search universal knowledge
    const universal = await this.searchUniversal(queryEmbedding);
    
    // 3. Search org-specific if provided
    let orgSpecific = [];
    if (orgId) {
      orgSpecific = await this.searchOrgContext(queryEmbedding, orgId);
    }
    
    // 4. Combine and rank results
    const combined = [...universal, ...orgSpecific];
    return this.rankResults(combined, queryEmbedding);
  }
  
  async searchUniversal(embedding: number[]): Promise<any[]> {
    // Search pre-indexed fundraising best practices
    const index = await this.kv.get('knowledge:universal:index', 'json');
    
    const results = [];
    for (const doc of index.documents) {
      const similarity = this.cosineSimilarity(embedding, doc.embedding);
      if (similarity > 0.7) {
        results.push({
          ...doc,
          similarity,
          source: 'universal'
        });
      }
    }
    
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  }
  
  async ingestDocument(category: string, content: string, metadata: any) {
    // 1. Chunk document
    const chunks = this.chunkDocument(content, 500); // 500 token chunks
    
    // 2. Generate embeddings for each chunk
    const embeddedChunks = await Promise.all(
      chunks.map(async chunk => ({
        content: chunk,
        embedding: await this.embeddings.generate(chunk),
        metadata
      }))
    );
    
    // 3. Store in R2
    const docId = crypto.randomUUID();
    await this.r2.put(
      `knowledge-base/fundraising/${category}/${docId}.json`,
      JSON.stringify({
        content,
        chunks: embeddedChunks,
        metadata,
        ingested: new Date().toISOString()
      })
    );
    
    // 4. Update index
    await this.updateIndex(category, embeddedChunks);
  }
}
```

---

## Storage Strategy

### Cloudflare R2 (Object Storage)
- **Knowledge Base:** `/knowledge-base/` - Fundraising best practices
- **Org Profiles:** `/org-profiles/` - Discovery findings and context  
- **Documents:** `/documents/` - Uploaded organizational documents
- **Reports:** `/reports/` - Generated analysis and recommendations

### Cloudflare KV (Key-Value Store)
- **Session State:** Conversation state for multi-turn interactions
- **Response Cache:** 5-hour cache for identical queries
- **Embeddings Index:** Vector embeddings for semantic search
- **Org Credentials:** Encrypted Salesforce OAuth tokens

### Cloudflare Durable Objects (Future)
- **Real-time Collaboration:** Multiple users editing shared context
- **WebSocket Connections:** For web app real-time features

---

## Fundraising Data Analysis System

### Overview

The Fundraising Data Analysis provides comprehensive performance reports on a scheduled basis (monthly/quarterly). Unlike real-time queries, these are deep analytical reports that combine Salesforce data with organizational context and best practices.

```
┌─────────────────────────────────────────────────────┐
│        FUNDRAISING DATA ANALYSIS SYSTEM              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Scheduling & Triggers:                              │
│  • Cloudflare Cron (monthly/quarterly)              │
│  • Manual trigger via Slack                         │
│  • API endpoint for on-demand                       │
│                                                      │
│  Execution Flow:                                     │
│  1. Trigger → Cloudflare Worker                     │
│  2. Worker → Goose Recipe Execution                 │
│  3. Goose → MCP Server (Salesforce queries)         │
│  4. Generate comprehensive report                    │
│  5. Store in R2 + Send notifications                 │
│                                                      │
│  Delivery Methods:                                   │
│  • Slack (summary + link)                           │
│  • Email (PDF attachment)                           │
│  • Web dashboard (future)                           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Architecture Components

#### 1. Scheduled Execution Worker

```typescript
// src/workers/report-scheduler.ts
export class ReportScheduler {
  // Cloudflare Cron: "0 9 1 * *" (Monthly, 1st day, 9 AM)
  async scheduledReport(event: ScheduledEvent, env: Env) {
    const orgs = await this.getActiveOrgs();
    
    for (const org of orgs) {
      await this.executeReport(org.id, 'monthly');
    }
  }
  
  async executeReport(orgId: string, frequency: 'monthly' | 'quarterly') {
    // 1. Get org context
    const context = await this.getOrgContext(orgId);
    
    // 2. Prepare Goose recipe parameters
    const params = {
      orgId,
      reportPeriod: this.getReportPeriod(frequency),
      includeContext: true,
      outputFormat: 'markdown'
    };
    
    // 3. Execute Goose recipe via HTTP
    const report = await this.executeGooseRecipe(
      'fundraising-data-analysis',
      params,
      context
    );
    
    // 4. Store in R2
    const reportPath = await this.storeReport(orgId, report);
    
    // 5. Generate follow-up analysis
    const analysis = await this.executeGooseRecipe(
      'fundraising-data-analysis-followup',
      { inputFile: reportPath }
    );
    
    // 6. Store analysis
    const analysisPath = await this.storeReport(orgId, analysis, '-analysis');
    
    // 7. Deliver to users
    await this.deliverReport(orgId, reportPath, analysisPath);
  }
  
  async executeGooseRecipe(recipeName: string, params: any, context?: any) {
    // Call Goose via subprocess or HTTP API
    const command = `goose run --recipe mill/recipes/${recipeName}.yaml`;
    
    // Add parameters
    const fullParams = {
      ...params,
      apiKey: await this.getOrgApiKey(params.orgId),
      mcpUrl: 'https://resin.mpazbot.workers.dev/mcp'
    };
    
    // Execute and capture output
    const result = await this.runGooseCommand(command, fullParams);
    return result.output;
  }
  
  async storeReport(orgId: string, content: string, suffix: string = '') {
    const timestamp = new Date().toISOString().split('T')[0];
    const path = `reports/${orgId}/fundraising-analysis/${timestamp}${suffix}.md`;
    
    await this.r2.put(path, content, {
      metadata: {
        orgId,
        generatedAt: new Date().toISOString(),
        type: 'fundraising-analysis'
      }
    });
    
    return path;
  }
}
```

#### 2. Report Delivery System

```typescript
// src/services/report-delivery.ts
export class ReportDeliveryService {
  async deliverReport(
    orgId: string, 
    reportPath: string, 
    analysisPath: string
  ) {
    const org = await this.getOrgDetails(orgId);
    const preferences = org.reportPreferences || {
      delivery: ['slack'],
      recipients: [org.primaryContact]
    };
    
    // Get report content
    const report = await this.r2.get(reportPath);
    const analysis = await this.r2.get(analysisPath);
    
    // Extract key metrics for summary
    const summary = await this.extractSummary(analysis);
    
    // Deliver based on preferences
    for (const method of preferences.delivery) {
      switch (method) {
        case 'slack':
          await this.deliverViaSlack(org, summary, reportPath);
          break;
        case 'email':
          await this.deliverViaEmail(org, report, analysis);
          break;
        case 'dashboard':
          await this.updateDashboard(orgId, reportPath);
          break;
      }
    }
  }
  
  async deliverViaSlack(org: OrgConfig, summary: any, reportPath: string) {
    const message = {
      channel: org.slackChannel || '@fundraising',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Monthly Fundraising Analysis Ready'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Key Highlights:*\n${summary.highlights.join('\n• ')}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Immediate Actions:*\n${summary.actions.slice(0, 3).join('\n1️⃣ ')}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View Full Report' },
              url: `https://resin.ai/reports/${reportPath}`
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Download PDF' },
              action_id: 'download_pdf'
            }
          ]
        }
      ]
    };
    
    await this.slack.postMessage(message);
  }
  
  async extractSummary(analysisContent: string) {
    // Use AI to extract key points
    const prompt = `
      Extract from this fundraising analysis:
      1. Top 3 highlights (positive findings)
      2. Top 3 immediate actions
      3. Key metric changes (%)
      
      Content: ${analysisContent}
    `;
    
    const summary = await this.ai.complete(prompt, { format: 'json' });
    return JSON.parse(summary);
  }
}
```

#### 3. Manual Trigger via Slack

```typescript
// In your main Slack handler
async function handleSlackMessage(event: SlackEvent) {
  if (event.text.includes('generate report')) {
    // Check permissions
    if (!await hasReportPermission(event.user)) {
      return "You don't have permission to generate reports.";
    }
    
    // Trigger report generation
    await slack.postMessage({
      channel: event.channel,
      text: "🔄 Generating fundraising analysis report... This may take a few minutes."
    });
    
    // Execute async
    const scheduler = new ReportScheduler();
    await scheduler.executeReport(orgId, 'on-demand');
    
    return "Report generation started. You'll be notified when complete.";
  }
}
```

### Report Storage Structure in R2

```
/reports/
├── {orgId}/
│   ├── fundraising-analysis/
│   │   ├── 2024-11-01.md              # Monthly report
│   │   ├── 2024-11-01-analysis.md     # AI analysis
│   │   ├── 2024-Q4.md                 # Quarterly report
│   │   └── 2024-Q4-analysis.md        # Quarterly analysis
│   ├── metadata.json                   # Report metadata
│   └── preferences.json                # Delivery preferences
```

### Integration with Existing Goose Recipes

Your existing `fundraising-data-analysis.yaml` recipe remains unchanged, but gets wrapped in this execution system:

```typescript
// How the Worker calls your existing Goose recipe
async function runMonthlyAnalysis(orgId: string) {
  // 1. Get the API key for this org
  const apiKey = await getOrgApiKey(orgId);
  
  // 2. Execute your existing recipe
  const result = await exec(`
    goose run --recipe mill/recipes/fundraising-data-analysis.yaml \\
      --params RESIN_API_KEY="${apiKey}" \\
      --params REPORT_PERIOD="last_month" \\
      --params OUTPUT_FORMAT="markdown"
  `);
  
  // 3. Capture the output
  const reportContent = result.stdout;
  
  // 4. Store in R2
  const path = await storeInR2(orgId, reportContent);
  
  // 5. Run follow-up analysis
  const analysis = await exec(`
    ./scripts/mill/run-fundraising-followup.sh \\
      --input ${path}
  `);
  
  return { report: reportContent, analysis: analysis.stdout };
}
```

### Configuration per Organization

```typescript
// Store in KV or R2: org-profiles/{orgId}/report-config.json
{
  "orgId": "customer123",
  "reportSchedule": {
    "monthly": {
      "enabled": true,
      "dayOfMonth": 1,
      "time": "09:00"
    },
    "quarterly": {
      "enabled": true,
      "months": [1, 4, 7, 10]
    }
  },
  "delivery": {
    "methods": ["slack", "email"],
    "slackChannel": "#fundraising",
    "emailRecipients": [
      "development@nonprofit.org",
      "director@nonprofit.org"
    ]
  },
  "reportOptions": {
    "includeBenchmarks": true,
    "includeYearOverYear": true,
    "customMetrics": ["averageGiftSize", "donorLifetimeValue"]
  }
}
```

## Implementation Phases

### Phase 1: Intelligence Foundation (Weeks 1-2)
✅ **Week 1: Knowledge Base**
- Build 50+ fundraising best practice documents
- Create retrieval API with semantic search
- Set up R2 storage structure

⏳ **Week 2: Discovery Agent**
- Build automated discovery worker
- Create conversational discovery bot
- Implement continuous learning system
- **Add report scheduler worker**

### Phase 2: Core Infrastructure (Weeks 3-4)
**Week 3: Slack Integration**
- Slack webhook handler
- Intent detection and routing
- Response generation pipeline
- **Manual report trigger commands**

**Week 4: Document Management & Reporting**
- Upload handlers for Slack
- Text extraction pipeline
- Document indexing system
- **Automated report execution**
- **Report storage in R2**
- **Delivery via Slack**

### Phase 3: Launch Preparation (Weeks 5-6)
**Week 5: Testing & Optimization**
- End-to-end testing with sandbox orgs
- Performance optimization
- Cache strategy refinement
- **Test scheduled reports**

**Week 6: Pilot Launch (January 1)**
- Deploy to production
- Onboard 5 pilot customers
- Begin daily monitoring
- **Schedule first monthly reports**

---

## Key Technical Decisions

### Why Cloudflare Workers?
- **Edge computing:** Low latency globally
- **Serverless:** No infrastructure management
- **Cost-effective:** Free tier covers initial usage
- **Integrated storage:** R2, KV, and Durable Objects in one platform

### Why Not Goose for Conversations?
- **Goose is for recipes:** Best for defined workflows and data analysis
- **Need state management:** Conversations require persistent state
- **Direct control:** Need fine-grained control over conversation flow
- **Real-time requirements:** Slack's 3-second timeout needs custom handling

### Why Separate Discovery from Daily Operations?
- **Different cadences:** Discovery is periodic, operations are real-time
- **Different interfaces:** Discovery is conversational, operations are query-based
- **Separation of concerns:** Keeps codebase organized and maintainable

---

## Security Considerations

### Data Protection
- **Encryption at rest:** All credentials encrypted in KV
- **Encryption in transit:** TLS 1.3 for all communications
- **OAuth 2.0:** Never store passwords, only OAuth tokens
- **Scoped access:** Each org's data is isolated

### Compliance
- **Data residency:** Cloudflare allows region selection
- **Audit logging:** All interactions logged with timestamps
- **GDPR ready:** Data deletion and export capabilities
- **SOC 2:** Cloudflare infrastructure is SOC 2 compliant

---

## Monitoring & Observability

### Key Metrics
- **Response time:** Target <2 seconds for cached, <5 seconds for fresh
- **Cache hit rate:** Target >60% for common queries
- **Discovery completion:** Track % of orgs with complete profiles
- **Document usage:** Track which documents influence responses

### Logging Strategy
```typescript
interface InteractionLog {
  timestamp: string;
  orgId: string;
  userId: string;
  channel: 'slack' | 'web' | 'api';
  query: string;
  intent: string;
  sources: string[]; // knowledge, salesforce, documents
  responseTime: number;
  cacheHit: boolean;
  error?: string;
}
```

---

## Future Enhancements

### Q2 2025
- **Web interface:** Alternative to Slack
- **Proactive insights:** Daily automated recommendations
- **Email integration:** Draft and send from the platform

### Q3 2025
- **Advanced analytics:** Predictive donor scoring
- **Workflow automation:** Multi-step fundraising workflows
- **Team collaboration:** Shared workspaces and notes

### Q4 2025
- **AI coaching:** Personalized fundraising coaching
- **Peer benchmarking:** Compare to similar organizations
- **Custom integrations:** Webhooks and API access

---

**Document Version:** 1.0  
**Status:** Ready for Implementation  
**Next Update:** After Week 1 Implementation Review
