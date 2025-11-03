/**
 * Opportunity Analysis SOQL Queries
 *
 * These queries analyze giving patterns, trends, and opportunity data:
 * - Pipeline analysis
 * - Revenue trending
 * - Stage conversion
 * - Time-based analytics
 */

const DEFAULT_LIMIT = 25;

// ------------------------------------------------------------
// Pipeline & Stage Analysis
// ------------------------------------------------------------

/**
 * Opportunities by Stage
 * Aggregate opportunities grouped by stage
 */
export function opportunitiesByStage(): string {
  return `SELECT StageName, COUNT(Id) OpportunityCount, SUM(Amount) TotalAmount
    FROM Opportunity
    GROUP BY StageName
    ORDER BY TotalAmount DESC NULLS LAST`;
}

/**
 * Open Pipeline
 * All open (not closed won/lost) opportunities
 */
export function openPipeline(limit: number = DEFAULT_LIMIT): string {
  return `SELECT Id, Name, Amount, StageName, CloseDate, ContactId,
    (SELECT Contact.Name, Contact.Email FROM OpportunityContactRoles LIMIT 1)
    FROM Opportunity
    WHERE IsClosed = false
    ORDER BY Amount DESC NULLS LAST, CloseDate ASC
    LIMIT ${limit}`;
}

/**
 * Recently Won Opportunities
 * Opportunities closed won within specified days
 */
export function recentlyWonOpportunities(days: number = 30, limit: number = DEFAULT_LIMIT): string {
  return `SELECT Id, Name, Amount, CloseDate,
    (SELECT Contact.Name, Contact.Email FROM OpportunityContactRoles LIMIT 1)
    FROM Opportunity
    WHERE IsWon = true
    AND CloseDate = LAST_N_DAYS:${days}
    ORDER BY CloseDate DESC, Amount DESC
    LIMIT ${limit}`;
}

// ------------------------------------------------------------
// Trending & Time-Series
// ------------------------------------------------------------

/**
 * Monthly Revenue
 * Revenue trends by month
 */
export function monthlyRevenue(months: number = 12): string {
  const days = months * 30;
  return `SELECT CALENDAR_YEAR(CloseDate) Year, CALENDAR_MONTH(CloseDate) Month,
    COUNT(Id) GiftCount, SUM(Amount) TotalRevenue, AVG(Amount) AverageGift
    FROM Opportunity
    WHERE IsWon = true
    AND CloseDate = LAST_N_DAYS:${days}
    GROUP BY CALENDAR_YEAR(CloseDate), CALENDAR_MONTH(CloseDate)
    ORDER BY CALENDAR_YEAR(CloseDate) DESC, CALENDAR_MONTH(CloseDate) DESC`;
}

/**
 * Quarterly Performance
 * Revenue and gift count by quarter
 */
export function quarterlyPerformance(years: number = 2): string {
  return `SELECT CALENDAR_YEAR(CloseDate) Year, CALENDAR_QUARTER(CloseDate) Quarter,
    COUNT(Id) GiftCount, SUM(Amount) TotalRevenue, AVG(Amount) AverageGift
    FROM Opportunity
    WHERE IsWon = true
    AND CALENDAR_YEAR(CloseDate) >= ${new Date().getFullYear() - years}
    GROUP BY CALENDAR_YEAR(CloseDate), CALENDAR_QUARTER(CloseDate)
    ORDER BY CALENDAR_YEAR(CloseDate) DESC, CALENDAR_QUARTER(CloseDate) DESC`;
}

/**
 * Year-Over-Year Comparison
 * Compare this year vs last year
 */
export function yearOverYearComparison(): string {
  return `SELECT CALENDAR_YEAR(CloseDate) Year,
    COUNT(Id) GiftCount,
    SUM(Amount) TotalRevenue,
    AVG(Amount) AverageGift,
    MIN(Amount) SmallestGift,
    MAX(Amount) LargestGift
    FROM Opportunity
    WHERE IsWon = true
    AND (CALENDAR_YEAR(CloseDate) = THIS_YEAR OR CALENDAR_YEAR(CloseDate) = LAST_YEAR)
    GROUP BY CALENDAR_YEAR(CloseDate)
    ORDER BY CALENDAR_YEAR(CloseDate) DESC`;
}

// ------------------------------------------------------------
// Gift Size Analysis
// ------------------------------------------------------------

/**
 * Large Gifts
 * Opportunities above a threshold
 */
export function largeGifts(minAmount: number = 10000, limit: number = DEFAULT_LIMIT): string {
  return `SELECT Id, Name, Amount, CloseDate, StageName,
    (SELECT Contact.Name, Contact.Email, Contact.Phone FROM OpportunityContactRoles ORDER BY IsPrimary DESC LIMIT 1)
    FROM Opportunity
    WHERE Amount >= ${minAmount}
    AND IsWon = true
    ORDER BY Amount DESC, CloseDate DESC
    LIMIT ${limit}`;
}

/**
 * Gift Distribution
 * Breakdown by gift size ranges
 */
export function giftDistribution(): string {
  return `SELECT
    CASE
      WHEN Amount < 100 THEN 'Under $100'
      WHEN Amount >= 100 AND Amount < 500 THEN '$100-$499'
      WHEN Amount >= 500 AND Amount < 1000 THEN '$500-$999'
      WHEN Amount >= 1000 AND Amount < 5000 THEN '$1,000-$4,999'
      WHEN Amount >= 5000 AND Amount < 10000 THEN '$5,000-$9,999'
      WHEN Amount >= 10000 THEN '$10,000+'
      ELSE 'Unknown'
    END GiftRange,
    COUNT(Id) GiftCount,
    SUM(Amount) TotalRevenue
    FROM Opportunity
    WHERE IsWon = true
    GROUP BY
      CASE
        WHEN Amount < 100 THEN 'Under $100'
        WHEN Amount >= 100 AND Amount < 500 THEN '$100-$499'
        WHEN Amount >= 500 AND Amount < 1000 THEN '$500-$999'
        WHEN Amount >= 1000 AND Amount < 5000 THEN '$1,000-$4,999'
        WHEN Amount >= 5000 AND Amount < 10000 THEN '$5,000-$9,999'
        WHEN Amount >= 10000 THEN '$10,000+'
        ELSE 'Unknown'
      END
    ORDER BY SUM(Amount) DESC NULLS LAST`;
}

// ------------------------------------------------------------
// Conversion & Velocity
// ------------------------------------------------------------

/**
 * Conversion Metrics
 * Stage-to-stage conversion rates
 */
export function conversionMetrics(days: number = 90): string {
  return `SELECT StageName,
    COUNT(Id) OpportunityCount,
    SUM(Amount) TotalAmount,
    COUNT(CASE WHEN IsWon = true THEN 1 END) WonCount,
    COUNT(CASE WHEN IsLost = true THEN 1 END) LostCount
    FROM Opportunity
    WHERE CreatedDate = LAST_N_DAYS:${days}
    GROUP BY StageName
    ORDER BY TotalAmount DESC NULLS LAST`;
}

/**
 * Average Days to Close
 * Time from creation to closed won
 */
export function averageDaysToClose(months: number = 6): string {
  const days = months * 30;
  return `SELECT
    AVG(DAYS_TO_CLOSE__c) AvgDaysToClose,
    MIN(DAYS_TO_CLOSE__c) MinDaysToClose,
    MAX(DAYS_TO_CLOSE__c) MaxDaysToClose
    FROM Opportunity
    WHERE IsWon = true
    AND CloseDate = LAST_N_DAYS:${days}`;
}

// ------------------------------------------------------------
// Lost Opportunity Analysis
// ------------------------------------------------------------

/**
 * Recently Lost Opportunities
 * Opportunities marked as closed lost
 */
export function recentlyLostOpportunities(days: number = 30, limit: number = DEFAULT_LIMIT): string {
  return `SELECT Id, Name, Amount, CloseDate, StageName, Loss_Reason__c,
    (SELECT Contact.Name, Contact.Email FROM OpportunityContactRoles LIMIT 1)
    FROM Opportunity
    WHERE IsLost = true
    AND CloseDate = LAST_N_DAYS:${days}
    ORDER BY Amount DESC, CloseDate DESC
    LIMIT ${limit}`;
}

// Export all opportunity query builders
export const OpportunityQueries = {
  opportunitiesByStage,
  openPipeline,
  recentlyWonOpportunities,
  monthlyRevenue,
  quarterlyPerformance,
  yearOverYearComparison,
  largeGifts,
  giftDistribution,
  conversionMetrics,
  averageDaysToClose,
  recentlyLostOpportunities,
};
