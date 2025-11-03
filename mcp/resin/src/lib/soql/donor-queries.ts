/**
 * Donor Segmentation SOQL Queries
 *
 * These queries help identify and segment donors based on:
 * - Giving history
 * - Recency, frequency, monetary value (RFM)
 * - Lifetime value
 * - Engagement patterns
 */

const DEFAULT_LIMIT = 25;

// ------------------------------------------------------------
// Core Donor Segments
// ------------------------------------------------------------

/**
 * Lapsed Donors
 * Definition: Donors who have given before but not within the specified timeframe
 *
 * Use cases:
 * - Reactivation campaigns
 * - Win-back efforts
 * - Stewardship recovery
 */
export function lapsedDonors(months: number = 12, limit: number = DEFAULT_LIMIT): string {
  const days = months * 30;
  return `SELECT Id, Name, Email,
    (SELECT SUM(Amount) total FROM Opportunities WHERE IsWon=true) LifetimeGiving,
    (SELECT MAX(CloseDate) lastGiftDate FROM Opportunities WHERE IsWon=true) LastGiftDate
    FROM Contact
    WHERE Id IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true)
    AND Id NOT IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true AND Opportunity.CloseDate = LAST_N_DAYS:${days})
    LIMIT ${limit}`;
}

/**
 * Major Donors
 * Definition: Donors whose lifetime giving exceeds a threshold
 *
 * Use cases:
 * - Major gift program identification
 * - High-value prospect cultivation
 * - Board recruitment
 */
export function majorDonorsOver(amount: number, limit: number = DEFAULT_LIMIT): string {
  return `SELECT Id, Name, Email, Phone, MailingAddress,
    (SELECT SUM(Amount) total FROM Opportunities WHERE IsWon=true) LifetimeGiving,
    (SELECT MAX(CloseDate) lastGiftDate FROM Opportunities WHERE IsWon=true) LastGiftDate,
    (SELECT COUNT() FROM Opportunities WHERE IsWon=true) TotalGifts
    FROM Contact
    WHERE Id IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true)
    AND Id IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true GROUP BY ContactId HAVING SUM(Opportunity.Amount) > ${Math.floor(amount)})
    ORDER BY LifetimeGiving DESC
    LIMIT ${limit}`;
}

/**
 * Recent Donors
 * Definition: Donors who have given within the specified timeframe
 *
 * Use cases:
 * - Stewardship and thank-you campaigns
 * - Current donor analysis
 * - Retention programs
 */
export function recentDonorsLastNMonths(months: number, limit: number = DEFAULT_LIMIT): string {
  const days = Math.max(1, months * 30);
  return `SELECT Id, Name, Email, Phone,
    (SELECT MAX(CloseDate) lastGiftDate FROM Opportunities WHERE IsWon=true AND CloseDate = LAST_N_DAYS:${days}) LastGiftDate,
    (SELECT SUM(Amount) recentTotal FROM Opportunities WHERE IsWon=true AND CloseDate = LAST_N_DAYS:${days}) RecentTotal,
    (SELECT COUNT() FROM Opportunities WHERE IsWon=true AND CloseDate = LAST_N_DAYS:${days}) RecentGiftCount
    FROM Contact
    WHERE Id IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true AND Opportunity.CloseDate = LAST_N_DAYS:${days})
    ORDER BY RecentTotal DESC
    LIMIT ${limit}`;
}

/**
 * First-Time Donors
 * Definition: Contacts with exactly one won opportunity
 *
 * Use cases:
 * - New donor welcome series
 * - Second gift cultivation
 * - Retention focus
 */
export function firstTimeDonors(limit: number = DEFAULT_LIMIT): string {
  return `SELECT Id, Name, Email, Phone,
    (SELECT Amount, CloseDate FROM Opportunities WHERE IsWon=true LIMIT 1) FirstGift
    FROM Contact
    WHERE Id IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true GROUP BY ContactId HAVING COUNT(Opportunity.Id) = 1)
    ORDER BY FirstGift DESC NULLS LAST
    LIMIT ${limit}`;
}

// ------------------------------------------------------------
// Advanced Donor Segments
// ------------------------------------------------------------

/**
 * Recurring Donors
 * Definition: Donors who have given in multiple consecutive periods
 *
 * Use cases:
 * - Sustained giving program identification
 * - Monthly donor analysis
 * - Retention modeling
 */
export function recurringDonors(
  minConsecutiveMonths: number = 3,
  limit: number = DEFAULT_LIMIT
): string {
  // This is a simplified version - true recurring donor identification
  // would require more complex date logic or custom fields
  return `SELECT Id, Name, Email,
    (SELECT COUNT() FROM Opportunities WHERE IsWon=true) TotalGifts,
    (SELECT SUM(Amount) FROM Opportunities WHERE IsWon=true) LifetimeGiving,
    (SELECT MAX(CloseDate) FROM Opportunities WHERE IsWon=true) LastGiftDate,
    (SELECT MIN(CloseDate) FROM Opportunities WHERE IsWon=true) FirstGiftDate
    FROM Contact
    WHERE Id IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true GROUP BY ContactId HAVING COUNT(Opportunity.Id) >= ${minConsecutiveMonths})
    ORDER BY TotalGifts DESC
    LIMIT ${limit}`;
}

/**
 * Upgrade Candidates
 * Definition: Donors showing increasing giving patterns
 *
 * Use cases:
 * - Major gift pipeline building
 * - Capacity-based solicitations
 * - Moves management
 */
export function upgradeCandidates(
  minLifetimeGiving: number = 1000,
  minGiftCount: number = 3,
  limit: number = DEFAULT_LIMIT
): string {
  return `SELECT Id, Name, Email, Phone,
    (SELECT SUM(Amount) total FROM Opportunities WHERE IsWon=true) LifetimeGiving,
    (SELECT COUNT() FROM Opportunities WHERE IsWon=true) TotalGifts,
    (SELECT AVG(Amount) FROM Opportunities WHERE IsWon=true) AverageGift,
    (SELECT MAX(Amount) FROM Opportunities WHERE IsWon=true) LargestGift,
    (SELECT MAX(CloseDate) FROM Opportunities WHERE IsWon=true) LastGiftDate
    FROM Contact
    WHERE Id IN (
      SELECT ContactId FROM OpportunityContactRole
      WHERE Opportunity.IsWon=true
      GROUP BY ContactId
      HAVING SUM(Opportunity.Amount) > ${minLifetimeGiving}
      AND COUNT(Opportunity.Id) >= ${minGiftCount}
    )
    ORDER BY LifetimeGiving DESC
    LIMIT ${limit}`;
}

/**
 * At-Risk Donors
 * Definition: Historically consistent donors showing signs of disengagement
 *
 * Use cases:
 * - Retention interventions
 * - Re-engagement campaigns
 * - Churn prevention
 */
export function atRiskDonors(
  historicalMonths: number = 24,
  recentMonths: number = 6,
  minHistoricalGifts: number = 2,
  limit: number = DEFAULT_LIMIT
): string {
  const historicalDays = historicalMonths * 30;
  const recentDays = recentMonths * 30;

  return `SELECT Id, Name, Email, Phone,
    (SELECT COUNT() FROM Opportunities WHERE IsWon=true AND CloseDate = LAST_N_DAYS:${historicalDays}) HistoricalGifts,
    (SELECT SUM(Amount) FROM Opportunities WHERE IsWon=true) LifetimeGiving,
    (SELECT MAX(CloseDate) FROM Opportunities WHERE IsWon=true) LastGiftDate
    FROM Contact
    WHERE Id IN (
      SELECT ContactId FROM OpportunityContactRole
      WHERE Opportunity.IsWon=true
      AND Opportunity.CloseDate = LAST_N_DAYS:${historicalDays}
      GROUP BY ContactId
      HAVING COUNT(Opportunity.Id) >= ${minHistoricalGifts}
    )
    AND Id NOT IN (
      SELECT ContactId FROM OpportunityContactRole
      WHERE Opportunity.IsWon=true
      AND Opportunity.CloseDate = LAST_N_DAYS:${recentDays}
    )
    ORDER BY LifetimeGiving DESC
    LIMIT ${limit}`;
}

/**
 * Mid-Level Donors
 * Definition: Donors in the middle giving range (between thresholds)
 *
 * Use cases:
 * - Mid-level program cultivation
 * - Targeted asks
 * - Upgrade paths to major gifts
 */
export function midLevelDonors(
  minAmount: number = 500,
  maxAmount: number = 5000,
  limit: number = DEFAULT_LIMIT
): string {
  return `SELECT Id, Name, Email, Phone,
    (SELECT SUM(Amount) total FROM Opportunities WHERE IsWon=true) LifetimeGiving,
    (SELECT AVG(Amount) FROM Opportunities WHERE IsWon=true) AverageGift,
    (SELECT MAX(CloseDate) FROM Opportunities WHERE IsWon=true) LastGiftDate,
    (SELECT COUNT() FROM Opportunities WHERE IsWon=true) TotalGifts
    FROM Contact
    WHERE Id IN (
      SELECT ContactId FROM OpportunityContactRole
      WHERE Opportunity.IsWon=true
      GROUP BY ContactId
      HAVING SUM(Opportunity.Amount) >= ${minAmount}
      AND SUM(Opportunity.Amount) <= ${maxAmount}
    )
    ORDER BY LifetimeGiving DESC
    LIMIT ${limit}`;
}

// ------------------------------------------------------------
// RFM (Recency, Frequency, Monetary) Segmentation
// ------------------------------------------------------------

/**
 * High-Value Engaged Donors
 * Definition: Recent, frequent, and high-value donors (top RFM segment)
 *
 * Use cases:
 * - VIP stewardship
 * - Campaign chairs
 * - Leadership giving programs
 */
export function highValueEngagedDonors(
  recentMonths: number = 12,
  minGiftCount: number = 3,
  minLifetimeGiving: number = 5000,
  limit: number = DEFAULT_LIMIT
): string {
  const days = recentMonths * 30;

  return `SELECT Id, Name, Email, Phone,
    (SELECT SUM(Amount) total FROM Opportunities WHERE IsWon=true) LifetimeGiving,
    (SELECT COUNT() FROM Opportunities WHERE IsWon=true) TotalGifts,
    (SELECT MAX(CloseDate) FROM Opportunities WHERE IsWon=true) LastGiftDate,
    (SELECT AVG(Amount) FROM Opportunities WHERE IsWon=true) AverageGift
    FROM Contact
    WHERE Id IN (
      SELECT ContactId FROM OpportunityContactRole
      WHERE Opportunity.IsWon=true
      GROUP BY ContactId
      HAVING COUNT(Opportunity.Id) >= ${minGiftCount}
      AND SUM(Opportunity.Amount) >= ${minLifetimeGiving}
    )
    AND Id IN (
      SELECT ContactId FROM OpportunityContactRole
      WHERE Opportunity.IsWon=true
      AND Opportunity.CloseDate = LAST_N_DAYS:${days}
    )
    ORDER BY LifetimeGiving DESC
    LIMIT ${limit}`;
}

// ------------------------------------------------------------
// Prospect Identification
// ------------------------------------------------------------

/**
 * Warm Prospects
 * Definition: Engaged contacts without giving history
 *
 * Use cases:
 * - Acquisition campaigns
 * - Event follow-up
 * - First-time donor cultivation
 */
export function warmProspects(
  minEngagementScore: number = 50,
  limit: number = DEFAULT_LIMIT
): string {
  // Note: Engagement score would typically be a custom field
  // This is a simplified version based on activity
  return `SELECT Id, Name, Email, Phone,
    (SELECT COUNT() FROM Tasks WHERE Status = 'Completed') CompletedTasks,
    (SELECT COUNT() FROM Events) TotalEvents,
    CreatedDate
    FROM Contact
    WHERE Id NOT IN (
      SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true
    )
    AND (
      Id IN (SELECT WhoId FROM Task WHERE Status = 'Completed')
      OR Id IN (SELECT WhoId FROM Event)
    )
    ORDER BY CreatedDate DESC
    LIMIT ${limit}`;
}

// Export all donor query builders
export const DonorQueries = {
  lapsedDonors,
  majorDonorsOver,
  recentDonorsLastNMonths,
  firstTimeDonors,
  recurringDonors,
  upgradeCandidates,
  atRiskDonors,
  midLevelDonors,
  highValueEngagedDonors,
  warmProspects,
};
