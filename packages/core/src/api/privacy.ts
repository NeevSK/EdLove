import { identityAPI } from '@repo/core/api/identity';
import { orpcClient } from '@repo/core/api/orpcClient';
import { APIError } from '@repo/core/types/API';

export interface PrivacyLedgerEntry {
  id: string;
  user_id: string;
  activity_type: string;
  resource_name: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const privacyAPI = {
  /**
   * Fetch privacy ledger entries for the current user
   */
  async getPrivacyLedger() {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');
    return orpcClient.privacy.getPrivacyLedger();
  },

  /**
   * Log a privacy-related event
   */
  async logPrivacyEvent(input: {
    activity_type: string;
    resource_name: string;
    description: string;
    metadata?: Record<string, unknown>;
  }) {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');
    return orpcClient.privacy.logPrivacyEvent({ body: input });
  },
};
