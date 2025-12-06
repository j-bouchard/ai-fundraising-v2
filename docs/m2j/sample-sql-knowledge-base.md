# SQL Knowledge Base - Fundraising Queries

> **Note:** This document serves as a reference library for MCP tools. Each SQL snippet includes metadata that helps Claude (running inside MCP tools) understand purpose, compatibility, and usage context.

---

## Query Structure & Metadata

Each query in the knowledge base follows this format:

```
## [Query Name]

**ID:** `query_id_unique_identifier`  
**Category:** [donor_analysis | pipeline | stewardship | moves_management | reporting]  
**Org Type:** [NPSP | Nonprofit Cloud | Both]  
**Performance:** [Fast <1s | Medium 1-5s | Slow >5s]  
**Last Updated:** [Date]  
**Author:** [SME Name]  

### Purpose
Clear description of what this query answers and when to use it.

### Use Cases
- Scenario 1: When a user asks X, use this query
- Scenario 2: When building report Y, include this query
- Scenario 3: Real example of how a gift officer would need this data

### Required Sobjects
Objects this query depends on (helps validate org has the data)

### Salesforce Org Requirements
- Custom field needed? Custom object?
- Any data quality assumptions?

### Query

```sql
[ACTUAL SOQL QUERY]
```

### Output Format

Columns returned: [name, amount, date, etc.]
Example result: [sample row or two]
Interpretation: How should Claude interpret these results?


### Error Handling
- If no results: What does it mean?
- If query fails: Common reasons and fallbacks

### Integration Notes
- Which MCP tools use this query?
- What context should be provided to Claude when running it?

---

## Sample Queries

---

## 1. RFM Donor Scoring (Prioritization)

**ID:** `query_rfm_scoring_npsp`  
**Category:** `donor_analysis`  
**Org Type:** `NPSP`  
**Performance:** `Medium 1-5s`  
**Last Updated:** November 24, 2025  
**Author:** Nonprofit Fundraising Expert  

### Purpose
Calculate Recency, Frequency, and Monetary (RFM) scores for all donors to identify which supporters deserve immediate attention. This is the foundational query for daily prioritization recommendations.

**When to use:**
- Daily prioritization reports
- Identifying lapsed donors at risk
- Finding warm prospects for upgrades
- Portfolio health assessment

### Use Cases
- "Who should I call this week?" → Use this to rank active donors
- "Which donors are at risk of lapsing?" → Look at Recency scores
- "Who's ready for a major ask?" → Filter by high Monetary + recent Recency
- "Are we losing mid-level donors?" → Compare Frequency trends

### Required Sobjects
- `Account` (household accounts only)
- `npe03__Recurring_Donation__c` (optional, for subscription gifts)
- `Opportunity` (for donation history)
- `npe01__OppPayment__c` (optional, for payment records)

### Salesforce Org Requirements
- NPSP installed and configured
- Opportunities properly classified as "Closed Won"
- Contact records linked to Accounts
- No assumption about custom fields required

### Query
```sql
SELECT 
  a.Id,
  a.Name,
  COUNT(DISTINCT o.Id) as frequency_count,
  MAX(o.CloseDate) as last_gift_date,
  DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) as days_since_gift,
  SUM(o.Amount) as lifetime_giving,
  AVG(o.Amount) as avg_gift_size,
  -- RFM Scoring: 1-5 scale per metric
  CASE 
    WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) <= 90 THEN 5
    WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) <= 180 THEN 4
    WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) <= 365 THEN 3
    WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) <= 730 THEN 2
    ELSE 1
  END as recency_score,
  
  CASE 
    WHEN COUNT(DISTINCT o.Id) >= 10 THEN 5
    WHEN COUNT(DISTINCT o.Id) >= 5 THEN 4
    WHEN COUNT(DISTINCT o.Id) >= 3 THEN 3
    WHEN COUNT(DISTINCT o.Id) >= 2 THEN 2
    ELSE 1
  END as frequency_score,
  
  CASE 
    WHEN SUM(o.Amount) >= 10000 THEN 5
    WHEN SUM(o.Amount) >= 5000 THEN 4
    WHEN SUM(o.Amount) >= 2000 THEN 3
    WHEN SUM(o.Amount) >= 500 THEN 2
    ELSE 1
  END as monetary_score,
  
  -- Composite RFM Score (average)
  ROUND((
    CASE 
      WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) <= 90 THEN 5
      WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) <= 180 THEN 4
      WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) <= 365 THEN 3
      WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) <= 730 THEN 2
      ELSE 1
    END +
    CASE 
      WHEN COUNT(DISTINCT o.Id) >= 10 THEN 5
      WHEN COUNT(DISTINCT o.Id) >= 5 THEN 4
      WHEN COUNT(DISTINCT o.Id) >= 3 THEN 3
      WHEN COUNT(DISTINCT o.Id) >= 2 THEN 2
      ELSE 1
    END +
    CASE 
      WHEN SUM(o.Amount) >= 10000 THEN 5
      WHEN SUM(o.Amount) >= 5000 THEN 4
      WHEN SUM(o.Amount) >= 2000 THEN 3
      WHEN SUM(o.Amount) >= 500 THEN 2
      ELSE 1
    END
  ) / 3, 1) as rfm_composite_score

FROM Account a
INNER JOIN Opportunity o ON a.Id = o.AccountId
WHERE 
  a.Type = 'Household Account'
  AND o.StageName = 'Closed Won'
  AND o.CloseDate >= LAST_N_YEARS:5  -- Look back 5 years

GROUP BY a.Id, a.Name
HAVING COUNT(DISTINCT o.Id) > 0

ORDER BY rfm_composite_score DESC, days_since_gift ASC
LIMIT 500
```

### Output Format
```
Columns:
- Id: Salesforce Account ID
- Name: Donor/Household name
- frequency_count: Number of gifts (0-50+)
- last_gift_date: Date of most recent gift (YYYY-MM-DD)
- days_since_gift: Integer, days elapsed (0-2000+)
- lifetime_giving: Total $ amount (0-1000000+)
- avg_gift_size: Average gift $ (0-50000+)
- recency_score: 1-5 (5 = gave recently)
- frequency_score: 1-5 (5 = frequent giver)
- monetary_score: 1-5 (5 = high value)
- rfm_composite_score: 1-5 (5 = highest priority)

Example result:
Id: 001xx000003DIZ
Name: Sarah & John Johnson Household
frequency_count: 8
last_gift_date: 2025-10-15
days_since_gift: 40
lifetime_giving: 12500
avg_gift_size: 1562.50
recency_score: 5
frequency_score: 4
monetary_score: 4
rfm_composite_score: 4.3
```

### Interpretation Guide
**For Claude to understand the data:**

- **RFM Composite Score 4.5-5.0:** "Hot prospects" - Engage THIS WEEK. Recent, loyal, significant supporters. Risk of losing momentum if not contacted soon.

- **RFM Composite Score 3.5-4.4:** "Warm prospects" - Engage THIS MONTH. Good giving history and reasonably recent. Ready for upgrade conversations or major gift asks.

- **RFM Composite Score 2.5-3.4:** "Cultivation prospects" - 6-month engagement plan. Historically good supporters but touch frequency declining. Requires relationship rebuilding.

- **RFM Composite Score 1.5-2.4:** "At-risk/lapsed donors" - Reactivation focus. Haven't given in 1-2 years. Test with smaller ask or event invitation before major solicitation.

- **RFM Composite Score 1.0-1.4:** "Cold/inactive" - Research phase. Little to no recent engagement. May have moved, lost capacity, or disengaged. Verify address and intent before contact.

**When days_since_gift > 365 (more than 1 year):**
- Donor is entering "lapsed" status
- Reactivation rate increases with prompt contact (60%+ if reached within 13 months)
- Recommended action: Personal phone call, not email blast
- Offer: Smaller gift ask or event invitation to rebuild relationship

### Error Handling
- **No results:** Org has no donations or Opportunities aren't marked "Closed Won". Check data quality first.
- **Timeout (query exceeds 30s):** Organization has 500,000+ Opportunities. Add tighter date filter: `AND o.CloseDate >= LAST_N_YEARS:2`
- **Null values in last_gift_date:** Some Opportunities missing CloseDate. These are data quality issues; filter with `AND o.CloseDate != NULL`

### Integration Notes
- **Used by:** `daily_prioritization.ts`, `portfolio_analysis.ts`, `donor_research.ts` MCP tools
- **Called from:** Daily report generation, Slack queries like "Who should I focus on?"
- **Claude context:** When displaying results, always include "days_since_gift" prominently. Recent recency is urgent.
- **Caching:** Results valid for 24 hours unless org updates Opportunity data
- **Multi-org:** Each org has different RFM thresholds - use org context to customize monetary_score buckets

---

## 2. Lapsed Donor At-Risk List

**ID:** `query_lapsed_donors_npsp`  
**Category:** `donor_analysis`  
**Org Type:** `NPSP`  
**Performance:** `Fast <1s`  
**Last Updated:** November 24, 2025  
**Author:** Nonprofit Fundraising Expert  

### Purpose
Identify donors who have lapsed (no gift for 12+ months) but represent reactivation opportunities. Research shows 60% reactivation rate if contacted within 13 months of last gift.

**When to use:**
- Weekly lapsed donor alerts
- Reactivation campaign planning
- Portfolio risk assessment
- Stewardship outreach prioritization

### Use Cases
- "Who should we try to reactivate?" → Start here with donors 12-13 months lapsed
- "Which donors are we about to lose?" → Look at 9-12 month lapsed
- "Create a re-engagement campaign" → Filter by frequency >3 (they were loyal) and monetary >2 (they gave meaningfully)

### Required Sobjects
- `Account` (household)
- `Opportunity` (with CloseDate)

### Salesforce Org Requirements
- NPSP installed
- Opportunities properly closed
- No custom fields required

### Query
```sql
SELECT 
  a.Id,
  a.Name,
  COUNT(DISTINCT o.Id) as total_gifts,
  MAX(o.CloseDate) as last_gift_date,
  DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) as days_lapsed,
  SUM(o.Amount) as lifetime_giving,
  ROUND(SUM(o.Amount) / COUNT(DISTINCT o.Id), 2) as avg_gift_amount,
  -- Lapse risk window
  CASE 
    WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) BETWEEN 330 AND 395 THEN 'CRITICAL'
    WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) BETWEEN 240 AND 329 THEN 'HIGH'
    WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) BETWEEN 180 AND 239 THEN 'MEDIUM'
    ELSE 'LOW'
  END as reactivation_urgency,
  -- Reactivation potential (based on giving history)
  CASE 
    WHEN COUNT(DISTINCT o.Id) >= 5 AND SUM(o.Amount) >= 2500 THEN 'HIGH_VALUE'
    WHEN COUNT(DISTINCT o.Id) >= 3 THEN 'MID_VALUE'
    ELSE 'LOW_VALUE'
  END as reactivation_potential,
  -- Suggested ask (typically 15-25% of avg gift or last gift)
  ROUND(MAX(o.Amount) * 0.8, 2) as suggested_reactivation_ask

FROM Account a
INNER JOIN Opportunity o ON a.Id = o.AccountId
WHERE 
  a.Type = 'Household Account'
  AND o.StageName = 'Closed Won'
  AND o.CloseDate >= LAST_N_YEARS:5

GROUP BY a.Id, a.Name
HAVING 
  DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) >= 365
  AND COUNT(DISTINCT o.Id) >= 1  -- At least one prior gift

ORDER BY 
  CASE 
    WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) BETWEEN 330 AND 395 THEN 1
    WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) BETWEEN 240 AND 329 THEN 2
    WHEN DAYS_BETWEEN(TODAY(), MAX(o.CloseDate)) BETWEEN 180 AND 239 THEN 3
    ELSE 4
  END ASC,
  lifetime_giving DESC
LIMIT 200
```

### Output Format
```
Columns:
- Id: Salesforce Account ID
- Name: Donor household name
- total_gifts: Number of times donor gave
- last_gift_date: Date of most recent gift
- days_lapsed: How many days since last gift
- lifetime_giving: Total $ raised
- avg_gift_amount: Average gift size
- reactivation_urgency: CRITICAL | HIGH | MEDIUM | LOW
- reactivation_potential: HIGH_VALUE | MID_VALUE | LOW_VALUE
- suggested_reactivation_ask: $ amount for ask

Example:
Id: 001xx000003XYZ
Name: Margaret Chen Household
total_gifts: 7
last_gift_date: 2024-10-20
days_lapsed: 395
lifetime_giving: 8500
avg_gift_amount: 1214.29
reactivation_urgency: CRITICAL
reactivation_potential: HIGH_VALUE
suggested_reactivation_ask: 1000.00
```

### Interpretation Guide
**For Claude:**

- **CRITICAL (330-395 days):** Contact IMMEDIATELY. 60% reactivation window closing. Personal phone call needed. Risk: They'll become "lost" after 13 months.

- **HIGH (240-329 days):** Contact within 2 weeks. Still in optimal reactivation window. Personalized letter + event invitation effective.

- **MEDIUM (180-239 days):** Schedule contact for next month. Relationship needs attention. Use to invite to event or donor appreciation event.

- **HIGH_VALUE:** Was giving $500+ or 5+ times. These are MVPs who stepped back. Investigate why (life change, dissatisfaction, missed ask). Executive/major gift officer should personally reach out.

- **MID_VALUE:** Consistent annual supporter. Standard reactivation plan. Gift officer can handle.

### Error Handling
- **No results:** All current donors active (good sign!)
- **Too many results (500+):** Org has donor engagement issues. Contact gift officers directly; this query result is a warning sign.
- **days_lapsed very large (2000+):** Very old donor records. Verify contact info before outreach (address may be outdated).

### Integration Notes
- **Used by:** `reactivation_analysis.ts`, `portfolio_health.ts` MCP tools
- **Frequency:** Run weekly to catch donors in CRITICAL window
- **Alert threshold:** Flag any donor entering CRITICAL zone immediately
- **Caching:** Update every 7 days (runs over weekend)

---

## 3. Gift Officer Portfolio Summary

**ID:** `query_gift_officer_portfolio_npsp`  
**Category:** `portfolio_management`  
**Org Type:** `NPSP`  
**Performance:** `Medium 1-5s`  
**Last Updated:** November 24, 2025  
**Author:** Nonprofit Fundraising Expert  

### Purpose
Show assigned gift officer their complete portfolio: who they manage, giving totals, engagement recency, and pipeline status. Used for daily briefings and 1:1 meetings.

**When to use:**
- Gift officer daily briefing
- Manager 1:1 conversations
- Portfolio assignment verification
- Year-end performance review

### Use Cases
- "Show me my portfolio summary" → Daily check-in
- "Who haven't I talked to in a month?" → Engagement gaps
- "What's my pipeline look like?" → Open opportunities
- "Who's ready for an ask?" → Qualified prospects in pipeline

### Required Sobjects
- `Account` (with custom field: `gift_officer__c` or via Campaign membership)
- `Opportunity`
- `Task` or `Event` (for engagement tracking)

### Salesforce Org Requirements
- Gift officer assignments via custom field OR Campaign membership
- **Note:** This assumes org has a way to assign donors to staff. If not, modify query to use different assignment method.

### Query
```sql
SELECT 
  a.Id,
  a.Name,
  a.gift_officer__c,  -- Custom field or lookup
  SUM(o.Amount) FILTER (WHERE o.StageName = 'Closed Won') as ytd_giving,
  COUNT(DISTINCT o.Id) FILTER (WHERE o.StageName = 'Closed Won' AND YEAR(o.CloseDate) = THIS_FISCAL_YEAR) as ytd_gift_count,
  COUNT(DISTINCT o.Id) FILTER (WHERE o.StageName IN ('Cultivation', 'Solicitation', 'Negotiation')) as open_opportunities,
  SUM(o.Amount) FILTER (WHERE o.StageName IN ('Cultivation', 'Solicitation', 'Negotiation')) as pipeline_value,
  MAX(t.ActivityDate) as last_engagement_date,
  DAYS_BETWEEN(TODAY(), MAX(t.ActivityDate)) as days_since_engagement,
  MAX(o.CloseDate) FILTER (WHERE o.StageName = 'Closed Won') as last_gift_date,
  -- Engagement status
  CASE 
    WHEN DAYS_BETWEEN(TODAY(), MAX(t.ActivityDate)) <= 30 THEN 'ACTIVE'
    WHEN DAYS_BETWEEN(TODAY(), MAX(t.ActivityDate)) <= 90 THEN 'WARM'
    WHEN DAYS_BETWEEN(TODAY(), MAX(t.ActivityDate)) <= 180 THEN 'COLD'
    ELSE 'DORMANT'
  END as engagement_status

FROM Account a
LEFT JOIN Opportunity o ON a.Id = o.AccountId
LEFT JOIN Task t ON a.Id = t.WhoId OR a.Id = t.AccountId
WHERE 
  a.Type = 'Household Account'
  AND a.gift_officer__c = :current_user_id  -- Parameterized by logged-in user

GROUP BY 
  a.Id, 
  a.Name,
  a.gift_officer__c

HAVING 
  SUM(o.Amount) FILTER (WHERE o.StageName = 'Closed Won') > 0  -- Only current donors

ORDER BY 
  CASE 
    WHEN DAYS_BETWEEN(TODAY(), MAX(t.ActivityDate)) <= 30 THEN 1
    ELSE 2
  END,
  ytd_giving DESC
```

### Output Format
```
Columns:
- Id: Account ID
- Name: Donor name
- ytd_giving: This year's donations ($ amount)
- ytd_gift_count: Number of gifts this year
- open_opportunities: # of prospects in pipeline
- pipeline_value: $ value of open opportunities
- last_engagement_date: Date of most recent touch
- days_since_engagement: Integer days
- last_gift_date: Most recent Closed Won date
- engagement_status: ACTIVE | WARM | COLD | DORMANT

Example:
Id: 001xx000003ABC
Name: David Park Household
ytd_giving: 5000
ytd_gift_count: 3
open_opportunities: 2
pipeline_value: 15000
last_engagement_date: 2025-11-15
days_since_engagement: 9
last_gift_date: 2025-11-01
engagement_status: ACTIVE
```

### Interpretation Guide
**For Claude:**

**Engagement Status signals:**
- **ACTIVE (0-30 days):** Donor is being actively cultivated. Maintain momentum.
- **WARM (31-90 days):** Ongoing relationship but could use attention soon.
- **COLD (91-180 days):** Relationship needs re-engagement within 2 weeks.
- **DORMANT (180+ days):** Relationship is at-risk. This is red flag.

**Portfolio health indicators:**
- Ratio of active:warm:cold:dormant should be 50:30:15:5 (example benchmark)
- If >20% dormant: Portfolio needs attention
- If pipeline > YTD giving: Good trajectory
- If days_since_engagement > 60 for major donors: Urgent

### Error Handling
- **No results:** Gift officer has no assigned donors (check assignments)
- **Query fails:** `:current_user_id` parameter not passed. Requires authentication context.
- **All DORMANT:** Portfolio is disengaged. Escalate to manager.

### Integration Notes
- **Used by:** `gift_officer_briefing.ts`, `portfolio_health.ts`
- **Personalization:** Shows logged-in user their own portfolio only
- **Real-time:** No caching; run on demand for accuracy
- **Frequency:** Used for daily briefings and weekly check-ins

---

## Knowledge Base Usage Guide

### How MCP Tools Reference These Queries

When building an MCP tool, it loads relevant queries from this KB:

```typescript
// Example: In daily_prioritization.ts MCP tool
const rfmQuery = await loadQueryFromKB('query_rfm_scoring_npsp');
const lapsedQuery = await loadQueryFromKB('query_lapsed_donors_npsp');

const rfmResults = await executeSOQL(rfmQuery, { orgId: request.org_id });
const lapsedResults = await executeSOQL(lapsedQuery, { orgId: request.org_id });

// Claude (invoked inside the MCP tool) reads the KB metadata to understand the data:
const analysis = await claude.messages.create({
  model: "claude-sonnet-4-5-20250929",
  messages: [{
    role: "user",
    content: `
      Here's RFM scoring data from our knowledge base (query_rfm_scoring_npsp):
      [KB metadata including Purpose, Interpretation Guide, Use Cases]
      
      Results:
      ${JSON.stringify(rfmResults)}
      
      Generate daily priorities based on these donors. Focus on RFM score and lapsed indicators.
    `
  }]
});
```

### Adding New Queries

When SME adds a new query:

1. **Create new section** in this file with metadata block
2. **Tag with ID:** `query_[category]_[org_type]_[version]`
3. **Include Interpretation Guide** so Claude understands what the numbers mean
4. **Document error scenarios** so MCP tool can handle failures gracefully
5. **List which MCP tools use it** in Integration Notes

### Query Maintenance

- **Performance targets:** Update if query times exceed targets
- **Org type expansion:** If a NPSP query works with Nonprofit Cloud, update header and test thoroughly
- **Threshold adjustments:** Review monetary/frequency buckets annually based on org data

---

**This knowledge base is living documentation. Update as org needs and best practices evolve.**
