/**
 * Salesforce Record CRUD Tool Implementations
 */

import { SalesforceClient } from "../salesforce-client";
import { header } from "../utils";

/**
 * Create a Salesforce record
 */
export async function createRecord(
  client: SalesforceClient,
  sobject: string,
  fields: Record<string, any>
): Promise<string> {
  if (!sobject || !fields || Object.keys(fields).length === 0) {
    return (
      header("Validation Error") +
      "\n- Provide sobject (string) and fields (non-empty object)."
    );
  }

  try {
    const res = await client.create(sobject, fields);
    return (
      header("Record Created") +
      `\n- sObject: ${sobject}\n- Id: ${res.id}\n- Fields: ${JSON.stringify(fields)}`
    );
  } catch (error: any) {
    return (
      header("Salesforce Error") +
      `\n- Unable to create ${sobject}. ${error.message}`
    );
  }
}

/**
 * Update a Salesforce record
 */
export async function updateRecord(
  client: SalesforceClient,
  sobject: string,
  recordId: string,
  fields: Record<string, any>
): Promise<string> {
  if (!sobject || !recordId || !fields || Object.keys(fields).length === 0) {
    return (
      header("Validation Error") +
      "\n- Provide sobject, record_id, and fields (non-empty object)."
    );
  }

  try {
    await client.update(sobject, recordId, fields);
    return (
      header("Record Updated") +
      `\n- sObject: ${sobject}\n- Id: ${recordId}\n- Fields: ${JSON.stringify(fields)}`
    );
  } catch (error: any) {
    return (
      header("Salesforce Error") +
      `\n- Unable to update ${sobject} ${recordId}. ${error.message}`
    );
  }
}

/**
 * Delete a Salesforce record
 */
export async function deleteRecord(
  client: SalesforceClient,
  sobject: string,
  recordId: string
): Promise<string> {
  if (!sobject || !recordId) {
    return (
      header("Validation Error") +
      "\n- Provide sobject and record_id."
    );
  }

  try {
    await client.delete(sobject, recordId);
    return (
      header("Record Deleted") +
      `\n- sObject: ${sobject}\n- Id: ${recordId}`
    );
  } catch (error: any) {
    return (
      header("Salesforce Error") +
      `\n- Unable to delete ${sobject} ${recordId}. ${error.message}`
    );
  }
}
