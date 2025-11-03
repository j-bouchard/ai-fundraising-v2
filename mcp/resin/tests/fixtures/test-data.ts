/**
 * Test fixtures and mock data for testing
 */

export const testContacts = {
  valid: {
    FirstName: "Ada",
    LastName: "Lovelace",
    Email: "ada.lovelace@example.org",
    Description: "Test contact - safe to delete",
  },
  minimal: {
    LastName: "TestUser",
  },
  invalid: {
    // Missing required LastName field
    FirstName: "Invalid",
  },
};

export const testOpportunities = {
  valid: {
    Name: "Test Donation",
    StageName: "Closed Won",
    CloseDate: "2025-01-15",
    Amount: 1000,
  },
  minimal: {
    Name: "Minimal Opportunity",
    StageName: "Prospecting",
    CloseDate: "2025-12-31",
  },
};

export const testTasks = {
  valid: (contactId: string) => ({
    Subject: "Follow up with donor",
    Description: "Test task - safe to delete",
    WhoId: contactId,
    Status: "Not Started",
    Priority: "Normal",
    ActivityDate: "2025-11-01",
  }),
  minimal: (contactId: string) => ({
    Subject: "Test Task",
    WhoId: contactId,
  }),
};

export const sampleQueries = {
  countContacts: "SELECT COUNT() FROM Contact",
  basicContactQuery: "SELECT Id, Name, Email FROM Contact LIMIT 5",
  aggregateQuery:
    "SELECT COUNT(Id), StageName FROM Opportunity WHERE IsWon = true GROUP BY StageName",
  recentDonors:
    "SELECT Id, Name, Email FROM Contact WHERE Id IN " +
    "(SELECT ContactId FROM OpportunityContactRole WHERE " +
    "Opportunity.IsWon=true AND Opportunity.CloseDate = LAST_N_DAYS:180) " +
    "LIMIT 10",
  lifetimeGiving:
    "SELECT Id, Name, Email, " +
    "(SELECT SUM(Amount) total FROM Opportunities WHERE IsWon=true) LifetimeGiving " +
    "FROM Contact WHERE Id IN " +
    "(SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.IsWon=true) " +
    "LIMIT 5",
  invalid: "THIS IS NOT VALID SOQL",
};

/**
 * Generate a unique identifier for test data
 */
export function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a test contact with unique identifiers
 */
export function createTestContact(overrides?: Partial<typeof testContacts.valid>) {
  const id = generateTestId();
  return {
    ...testContacts.valid,
    LastName: `${testContacts.valid.LastName}_${id}`,
    Email: `test_${id}@example.org`,
    ...overrides,
  };
}

/**
 * Create a test opportunity with unique name
 */
export function createTestOpportunity(overrides?: Partial<typeof testOpportunities.valid>) {
  const id = generateTestId();
  return {
    ...testOpportunities.valid,
    Name: `${testOpportunities.valid.Name}_${id}`,
    ...overrides,
  };
}

/**
 * Expected response patterns for validation
 */
export const expectedPatterns = {
  soqlCountResult: /SOQL Count Result.*Count:\s*\d+/s,
  soqlResult: /SOQL Result.*Records returned:/s,
  recordCreated: /Record Created.*sObject:.*Id:/s,
  recordUpdated: /Record Updated.*sObject:.*Id:/s,
  salesforceError: /Salesforce Error/,
  validationError: /Validation Error/,
};
