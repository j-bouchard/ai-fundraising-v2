# Donor Segmentation Methods Guide

## RFM Analysis Framework

### Understanding RFM Segmentation

RFM (Recency, Frequency, Monetary) analysis is a data-driven segmentation method that scores donors based on three critical behaviors: how recently they gave, how often they give, and how much they give. This creates a three-dimensional view of donor value and engagement.

### RFM Scoring Methodology

**Recency Scoring (R):**

```
Score 5: 0-6 months since last gift
Score 4: 7-12 months since last gift
Score 3: 13-18 months since last gift
Score 2: 19-24 months since last gift
Score 1: 25+ months since last gift

Weight: 35% of total score
```

**Frequency Scoring (F):**

```
Score 5: 6+ gifts in past 24 months
Score 4: 4-5 gifts in past 24 months
Score 3: 2-3 gifts in past 24 months
Score 2: 1 gift in past 24 months
Score 1: 0 gifts in past 24 months

Weight: 25% of total score
```

**Monetary Scoring (M):**

```
Score 5: $10,000+ cumulative in past 24 months
Score 4: $2,500-$9,999 cumulative
Score 3: $1,000-$2,499 cumulative
Score 2: $250-$999 cumulative
Score 1: <$250 cumulative

Weight: 40% of total score
```

### RFM Segment Definitions

**Champions (555, 554, 545, 544, 455):**
- Best donors across all dimensions
- 5-8% of database typically
- Generate 40-60% of revenue
- Strategy: VIP treatment, upgrade focus

**Loyal Donors (535, 534, 443, 453, 354):**
- Strong frequency and monetary, varying recency
- 8-12% of database
- Generate 20-30% of revenue
- Strategy: Recognition and retention

**Potential Loyalists (525, 524, 523, 522, 425):**
- Recent donors with upgrade potential
- 10-15% of database
- Strategy: Engagement and cultivation

**New Donors (515, 514, 513, 512, 415):**
- First-time or very recent donors
- 15-20% of database
- Strategy: Welcome and onboarding

**At Risk (345, 344, 335, 334, 245):**
- Previously good donors showing decline
- 8-10% of database
- Strategy: Re-engagement campaigns

**Can't Lose (155, 154, 145, 144, 255):**
- High value but lapsed
- 3-5% of database
- Strategy: Win-back with personal touch

**Hibernating (333, 332, 323, 322, 233):**
- Low engagement across board
- 20-25% of database
- Strategy: Reactivation or removal

**Lost (111, 112, 121, 122, 211):**
- No recent activity
- 15-20% of database
- Strategy: Final attempt or archive

### RFM Implementation Formula

```
Composite RFM Score = (R × 0.35) + (F × 0.25) + (M × 0.40)

Segment Assignment:
4.5-5.0: Champions
3.8-4.4: Loyal
3.0-3.7: Potential
2.2-2.9: At Risk
1.0-2.1: Lost

Action Priority = Monetary Score × Recency Score
```

## Lifecycle Segmentation

### Donor Lifecycle Stages

**Stage 1: Prospect (Pre-Donor)**
- Definition: No gift history
- Duration: Indefinite
- Conversion goal: First gift
- Key metrics: Engagement score, wealth rating

**Stage 2: First-Time Donor**
- Definition: Made first gift within 12 months
- Duration: 12 months from first gift
- Retention goal: Second gift within 18 months
- Key metrics: Second gift rate, engagement

**Stage 3: Repeat Donor**
- Definition: 2-3 gifts over 24 months
- Duration: Years 2-3
- Development goal: Consistent giving pattern
- Key metrics: Frequency increase, amount growth

**Stage 4: Core Donor**
- Definition: 4+ gifts over 3+ years
- Duration: Years 4-7
- Enhancement goal: Upgrade and deepen
- Key metrics: Retention rate, upgrade rate

**Stage 5: Major Donor**
- Definition: Giving at major gift level
- Duration: Ongoing with cultivation
- Stewardship goal: Maintain and expand
- Key metrics: Retention, satisfaction, referrals

**Stage 6: Legacy Donor**
- Definition: Planned gift committed
- Duration: Lifetime and beyond
- Legacy goal: Fulfill and inspire others
- Key metrics: Bequest realization, family engagement

### Lifecycle Migration Paths

**Progressive Path (Ideal):**
```
Prospect → First-Time (40% conversion)
    ↓
First-Time → Repeat (30% conversion)
    ↓
Repeat → Core (50% conversion)
    ↓
Core → Major (20% conversion)
    ↓
Major → Legacy (30% conversion)
```

**Recovery Paths:**
```
Lapsed → Reactivated → Repeat
At-Risk → Retained → Core
Downgraded → Re-upgraded → Major
```

### Lifecycle Stage Strategies

**Prospect Strategy:**
- Acquisition campaigns
- Event invitations
- Content marketing
- Peer referrals
- Low-barrier entry points

**First-Time Donor Strategy:**
- Immediate acknowledgment (48 hours)
- Welcome series (30 days)
- Impact reporting (90 days)
- Second gift ask (6-12 months)
- Survey and feedback (60 days)

**Repeat Donor Strategy:**
- Consistency rewards
- Upgrade suggestions
- Monthly giving conversion
- Volunteer opportunities
- Peer testimonials

**Core Donor Strategy:**
- Personal relationship
- Insider communications
- Leadership exposure
- Giving society invitation
- Major gift qualification

**Major Donor Strategy:**
- Dedicated relationship manager
- Custom stewardship plan
- Board engagement
- Campaign leadership
- Legacy conversations

**Legacy Donor Strategy:**
- Estate planning support
- Family engagement
- Legacy society benefits
- Testimonial opportunities
- Succession planning

## Capacity-Based Grouping

### Wealth Rating Categories

**Ultra High Net Worth ($100M+)**
- Population: 0.01% of database
- Average gift: $100,000+
- Approach: CEO/Board only
- Frequency: Monthly contact
- Ask strategy: Transformational

**Very High Net Worth ($10M-$100M)**
- Population: 0.1-0.5% of database
- Average gift: $10,000-$100,000
- Approach: Senior staff
- Frequency: Bi-weekly contact
- Ask strategy: Leadership level

**High Net Worth ($1M-$10M)**
- Population: 2-5% of database
- Average gift: $1,000-$10,000
- Approach: Gift officers
- Frequency: Monthly contact
- Ask strategy: Major gifts

**Affluent ($250K-$1M)**
- Population: 10-15% of database
- Average gift: $250-$1,000
- Approach: Annual fund team
- Frequency: Quarterly contact
- Ask strategy: Mid-level program

**Middle Market ($100K-$250K)**
- Population: 20-30% of database
- Average gift: $100-$250
- Approach: Automated + personal
- Frequency: 6-8 touches annually
- Ask strategy: Sustainer focus

**Mass Market (<$100K)**
- Population: 50-60% of database
- Average gift: <$100
- Approach: Digital/direct mail
- Frequency: Standard calendar
- Ask strategy: Volume-based

### Capacity Scoring Formula

```
Capacity Score = (Net Worth × 0.4) + (Income × 0.3) + 
                 (Real Estate × 0.2) + (Business Value × 0.1)

Percentile Ranking:
Top 1%: Ultra high priority
Top 5%: High priority
Top 20%: Medium priority
Top 50%: Standard priority
Bottom 50%: Low priority
```

### Capacity-Based Assignment Rules

**Portfolio Assignment Matrix:**

| Capacity Rating | Annual Giving | Assignment | Touch Frequency |
|-----------------|---------------|------------|-----------------|
| $10M+ | Any | CEO/CDO | Weekly |
| $1M-$10M | $10K+ | Major Gifts | Bi-weekly |
| $1M-$10M | <$10K | Major Gifts | Monthly |
| $250K-$1M | $1K+ | Mid-Level | Bi-monthly |
| $250K-$1M | <$1K | Annual Fund | Quarterly |
| <$250K | Any | Annual Fund | Standard |

### Capacity Migration Strategies

**Wealth Events Triggers:**
- IPO/Acquisition: Immediate re-rating
- Inheritance: 6-month cultivation
- Retirement: Planned giving focus
- Sale of business: Campaign ask
- Divorce: Pause and reassess

## Engagement Scoring

### Multi-Touch Engagement Model

**Engagement Score Components:**

```
Email Engagement (25 points max):
- Open: 1 point per open (max 10)
- Click: 2 points per click (max 10)
- Forward/Share: 5 points each (max 5)

Event Participation (25 points max):
- Attendance: 5 points per event (max 15)
- Guest brought: 3 points per guest (max 6)
- Committee service: 4 points

Volunteer Activity (20 points max):
- Hours logged: 1 point per 5 hours (max 10)
- Leadership role: 5 points
- Recruitment: 5 points

Digital Engagement (15 points max):
- Website visits: 1 point per visit (max 5)
- Content downloads: 2 points each (max 4)
- Social media: 1 point per interaction (max 3)
- Advocacy actions: 3 points

Communication (15 points max):
- Survey responses: 5 points
- Phone conversations: 3 points each
- Meeting attendance: 4 points
- Testimonial provided: 3 points

Total Possible: 100 points
```

### Engagement Segmentation Tiers

**Highly Engaged (75-100 points):**
- 5-10% of database
- Characteristics: Multi-channel active
- Strategy: Leadership cultivation
- Ask multiplier: 1.5x
- Retention rate: 95%+

**Engaged (50-74 points):**
- 15-20% of database
- Characteristics: Regular interaction
- Strategy: Deepen involvement
- Ask multiplier: 1.25x
- Retention rate: 80-85%

**Moderately Engaged (25-49 points):**
- 30-35% of database
- Characteristics: Occasional touch
- Strategy: Increase touchpoints
- Ask multiplier: 1.0x
- Retention rate: 60-70%

**Low Engagement (10-24 points):**
- 25-30% of database
- Characteristics: Minimal interaction
- Strategy: Re-engagement focus
- Ask multiplier: 0.75x
- Retention rate: 40-50%

**Unengaged (0-9 points):**
- 10-15% of database
- Characteristics: No interaction
- Strategy: Win-back or remove
- Ask multiplier: 0.5x
- Retention rate: 20-30%

### Engagement Trend Analysis

```
Engagement Velocity = (Current Score - Previous Score) / Time Period

Trend Categories:
Rising Fast: +10 points/quarter
Rising: +5 points/quarter
Stable: ±4 points/quarter
Declining: -5 points/quarter
Dropping Fast: -10 points/quarter

Action Triggers:
Rising Fast → Upgrade ask
Dropping Fast → Intervention required
```

## Predictive Modeling Basics

### Churn Prediction Model

**Risk Score Calculation:**

```
Churn Risk = (Recency Weight × 0.4) + (Frequency Decline × 0.3) + 
             (Amount Decline × 0.2) + (Engagement Drop × 0.1)

Risk Factors:
- No gift in 13+ months: +30 points
- Frequency decreased 50%: +20 points
- Amount decreased 50%: +15 points
- Engagement dropped 75%: +10 points
- Email bounced: +15 points
- Unsubscribed: +10 points

Risk Levels:
0-25: Low risk
26-50: Moderate risk
51-75: High risk
76-100: Critical risk
```

### Upgrade Propensity Model

**Upgrade Likelihood Score:**

```
Factors (Weighted):
- Consecutive years giving: 20%
- Gift amount trending up: 25%
- Engagement increasing: 15%
- Wealth indicators present: 20%
- Peer influence available: 10%
- Life stage appropriate: 10%

Score Interpretation:
80-100: Very likely (50%+ probability)
60-79: Likely (30-49% probability)
40-59: Possible (15-29% probability)
20-39: Unlikely (5-14% probability)
0-19: Very unlikely (<5% probability)
```

### Lifetime Value Prediction

```
Predicted LTV = (Average Gift × Predicted Frequency × Predicted Lifespan) 
                × Retention Probability × Upgrade Factor

Components:
- Average Gift: 3-year rolling average
- Predicted Frequency: Based on segment
- Predicted Lifespan: Based on age and engagement
- Retention Probability: Based on engagement and history
- Upgrade Factor: Based on capacity and trend

Example:
($500 avg × 1.5 frequency × 8 years) × 0.85 retention × 1.3 upgrade
= $6,630 predicted LTV
```

### Acquisition Likelihood Model

**Prospect Conversion Score:**

```
Conversion Score = Wealth (30%) + Linkage (25%) + Interest (20%) + 
                   Peer Connection (15%) + Timing (10%)

Scoring:
90-100: Hot prospect (>50% conversion)
70-89: Warm prospect (25-49% conversion)
50-69: Cool prospect (10-24% conversion)
30-49: Cold prospect (5-9% conversion)
0-29: Ice cold (<5% conversion)
```

## Portfolio Assignment Rules

### Portfolio Size Guidelines

**By Officer Type:**

| Officer Level | Capacity Focus | Portfolio Size | Dollar Goal |
|---------------|----------------|----------------|-------------|
| CEO/ED | $1M+ capacity | 20-30 | $5M+ |
| CDO/VP | $500K+ capacity | 30-50 | $3M+ |
| Senior MGO | $100K+ capacity | 75-100 | $2M+ |
| MGO | $50K+ capacity | 100-150 | $1.5M+ |
| Mid-Level | $10K+ capacity | 150-200 | $1M+ |
| Annual Fund | <$10K capacity | 200-500 | $500K+ |

### Assignment Algorithm

```
Priority Score = (Capacity × 0.4) + (Current Giving × 0.3) + 
                 (Engagement × 0.2) + (Readiness × 0.1)

Assignment Rules:
1. Sort by priority score
2. Assign top 20 to CEO
3. Next 50 to CDO
4. Next 150 to Senior MGOs
5. Next 300 to MGOs
6. Next 500 to Mid-Level
7. Remainder to Annual Fund

Rebalancing Triggers:
- Quarterly score recalculation
- Major gift closed
- Capacity change detected
- Engagement shift significant
```

### Geographic Assignment

**Territory Management:**

```
Regional Assignment Matrix:
- Primary: Within 50 miles (60% of portfolio)
- Secondary: 50-200 miles (30% of portfolio)
- Remote: 200+ miles (10% of portfolio)

Visit Frequency by Distance:
<50 miles: Monthly possible
50-200 miles: Quarterly possible
200-500 miles: Bi-annual possible
500+ miles: Annual or virtual
```

### Specialty Assignment Rules

**Interest-Based Assignment:**
- Healthcare donors → Medical officer
- Education donors → Academic officer
- Arts donors → Cultural officer
- Religious donors → Faith officer

**Demographic Assignment:**
- Young alumni → Young alumni officer
- Women donors → Women's philanthropy
- Planned giving age → Legacy officer
- Corporate → Corporate relations

## Communication Preference Mapping

### Channel Preference Segments

**Digital First (30% of database):**
- Primary: Email
- Secondary: Text/SMS
- Tertiary: Social media
- Never: Phone calls
- Characteristics: Under 50, tech-savvy

**Traditional (25% of database):**
- Primary: Direct mail
- Secondary: Phone
- Tertiary: Email
- Never: Text/SMS
- Characteristics: 65+, high-value

**Multi-Channel (20% of database):**
- Primary: All channels welcome
- Frequency: Maximum engagement
- Characteristics: Highly engaged

**Minimal Contact (15% of database):**
- Primary: Annual summary only
- Secondary: Major news only
- Characteristics: Low engagement

**Do Not Solicit (10% of database):**
- No fundraising asks
- Stewardship only
- Impact reports only
- Characteristics: Various reasons

### Frequency Preference Matrix

| Segment | Email | Mail | Phone | Text |
|---------|-------|------|-------|------|
| High Touch | Weekly | Monthly | Monthly | Weekly |
| Standard | Bi-weekly | Quarterly | Quarterly | Monthly |
| Low Touch | Monthly | Bi-annual | Annual | Never |
| Minimal | Quarterly | Annual | Never | Never |

### Content Preference Mapping

**Impact Focused (35%):**
- Wants: Outcomes, metrics, stories
- Avoids: Social content, events

**Community Focused (25%):**
- Wants: Events, volunteers, social
- Avoids: Financial details

**Leadership Focused (20%):**
- Wants: Strategy, financials, insider
- Avoids: Emotional appeals

**Efficiency Focused (20%):**
- Wants: Brief updates, key facts
- Avoids: Long content, multiple asks

## Segmentation Schemas

### Master Segmentation Framework

**Primary Dimension: Value**
- Tier 1: Transformational ($100K+)
- Tier 2: Leadership ($10K-$99K)
- Tier 3: Major ($1K-$9K)
- Tier 4: Core ($100-$999)
- Tier 5: Entry (<$100)

**Secondary Dimension: Engagement**
- A: Highly engaged
- B: Engaged
- C: Moderate
- D: Low
- E: Unengaged

**Tertiary Dimension: Lifecycle**
- 1: New (0-12 months)
- 2: Developing (13-36 months)
- 3: Established (37-60 months)
- 4: Mature (61+ months)
- 5: Legacy

**Segment Code Example:**
"2-A-3" = Leadership donor, highly engaged, established

### Behavioral Segmentation Schema

**The Socialites:**
- Attend all events
- Bring guests frequently
- Social media active
- Strategy: Event invitations, peer recognition

**The Pragmatists:**
- Research thoroughly
- Want metrics/ROI
- Designation specific
- Strategy: Impact reports, efficiency data

**The Believers:**
- Mission passionate
- Long-term supporters
- Advocate actively
- Strategy: Insider access, testimonial requests

**The Transactionalists:**
- Give for benefits
- Quid pro quo expectation
- Recognition important
- Strategy: Clear value proposition, tangible benefits

**The Quiet Philanthropists:**
- Anonymous preference
- No recognition desired
- Impact focused only
- Strategy: Private updates, no public acknowledgment

### Demographic Overlay Schema

**Generation + Wealth + Engagement:**

```
Matrix Example:
Millennial + High Wealth + Engaged = Digital innovation donor
Boomer + High Wealth + Engaged = Traditional major donor
Gen X + Medium Wealth + Moderate = Workplace giving prospect
Silent + Any Wealth + Any Engagement = Legacy prospect
```

## Migration Path Planning

### Upgrade Migration Paths

**Value Migration:**
```
Entry → Core: 
- Trigger: 3 consecutive gifts
- Strategy: Personal acknowledgment
- Goal: $100 → $250

Core → Major:
- Trigger: $500+ annual giving
- Strategy: Face-to-face cultivation
- Goal: $500 → $1,500

Major → Leadership:
- Trigger: $5K+ capacity verified
- Strategy: Peer involvement
- Goal: $5,000 → $15,000

Leadership → Transformational:
- Trigger: Wealth event or campaign
- Strategy: Vision partnership
- Goal: $25,000 → $100,000+
```

### Engagement Migration Paths

```
Unengaged → Low:
- Trigger: Any response/action
- Strategy: Gradual re-warming
- Success rate: 20%

Low → Moderate:
- Trigger: 3+ touches in quarter
- Strategy: Find right channel/content
- Success rate: 35%

Moderate → Engaged:
- Trigger: Event attendance or volunteer
- Strategy: Deepen involvement
- Success rate: 45%

Engaged → Highly Engaged:
- Trigger: Multiple channel activity
- Strategy: Leadership opportunities
- Success rate: 60%
```

### Recovery Migration Paths

```
Lapsed → Reactivated:
- Timeline: 3-6 month campaign
- Investment: $50-100 per donor
- Success rate: 15-25%

At-Risk → Retained:
- Timeline: 60-90 day intervention
- Investment: $25-50 per donor
- Success rate: 40-50%

Downgraded → Re-Upgraded:
- Timeline: 12-month cultivation
- Investment: $100-200 per donor
- Success rate: 30-40%
```

## Implementation Strategies

### Segmentation Rollout Plan

**Phase 1: Data Preparation (Month 1)**
- Data hygiene and standardization
- Missing data append
- Scoring algorithm setup
- Initial segment assignment

**Phase 2: System Configuration (Month 2)**
- CRM field creation
- Workflow automation
- Report development
- Dashboard creation

**Phase 3: Team Training (Month 3)**
- Segment definitions training
- Strategy workshops
- Tool training
- Role assignments

**Phase 4: Pilot Launch (Months 4-5)**
- Test with one segment
- Measure results
- Refine approach
- Document learnings

**Phase 5: Full Implementation (Month 6+)**
- Roll out all segments
- Monthly optimization
- Quarterly rebalancing
- Annual strategy review

### Measurement Framework

**Segment Performance Metrics:**

```
Key Metrics by Segment:
- Response rate
- Average gift
- Retention rate
- Upgrade rate
- ROI
- Lifetime value

Performance Index = (Actual/Goal) × 100

Scoring:
>120: Exceeding
100-120: Meeting
80-99: Approaching
<80: Underperforming
```

### Technology Requirements

**Essential Capabilities:**
- Dynamic segmentation
- Real-time scoring
- Automated assignment
- Multi-dimension analysis
- Predictive modeling
- Migration tracking
- Performance dashboards

**Integration Needs:**
- CRM system
- Email platform
- Wealth screening
- Event management
- Volunteer tracking
- Financial systems
- Analytics tools

## Best Practices and Guidelines

### Segmentation Governance

**Review Cycles:**
- Daily: New donor assignment
- Weekly: Engagement score updates
- Monthly: Segment performance review
- Quarterly: Segment rebalancing
- Annually: Strategy overhaul

**Decision Rights:**
- Segment definition: VP Development
- Assignment rules: Director level
- Individual moves: Manager level
- Exceptions: Case by case

### Common Pitfalls to Avoid

1. **Over-Segmentation:** Creating too many micro-segments
2. **Static Segments:** Not updating regularly
3. **Single Dimension:** Ignoring multiple factors
4. **Automation Only:** No human oversight
5. **Rigid Rules:** No flexibility for exceptions
6. **Poor Communication:** Segments not understood
7. **Inconsistent Application:** Different rules by team

### Success Factors

1. **Clean Data:** Foundation for all segmentation
2. **Clear Definitions:** Everyone understands segments
3. **Actionable Strategies:** Each segment has clear tactics
4. **Regular Updates:** Segments evolve with donors
5. **Measured Results:** Track what works
6. **Team Buy-in:** Everyone uses system
7. **Continuous Improvement:** Always optimizing

This comprehensive guide provides the frameworks, formulas, and strategies needed to implement sophisticated donor segmentation that drives personalized engagement, maximizes retention, and optimizes fundraising results across all donor segments.
