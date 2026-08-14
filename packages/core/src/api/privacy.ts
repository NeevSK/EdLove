import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { identityAPI } from '@repo/core/api/identity';
import { privacyContract, privacyLedgerEntry } from '@repo/core/api/privacy.contract';
import { APIError } from '@repo/core/types/API';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export interface PrivacyLedgerEntry {
  id: string;
  user_id: string;
  activity_type: string;
  resource_name: string;
  description: string;
  metadata: any;
  created_at: string;
}

export const privacyAPI = {
  /**
   * Fetch privacy ledger entries for the current user
   */
  async getPrivacyLedger() {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');
    const response = await (client.api as any).privacy.ledger.$get();
    if (!response.ok)
      throw new APIError('Failed to fetch privacy ledger', response.status.toString());
    return (await response.json()).map((entry: unknown) =>
      privacyLedgerEntry.parse(entry),
    ) as PrivacyLedgerEntry[];
  },

  /**
   * Log a privacy-related event
   */
  async logPrivacyEvent(input: {
    activity_type: string;
    resource_name: string;
    description: string;
    metadata?: any;
  }) {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');
    const response = await (client.api as any).privacy.ledger.events.$post({ json: input });
    if (!response.ok)
      throw new APIError('Failed to record privacy event', response.status.toString());
    return privacyLedgerEntry.parse(await response.json()) as PrivacyLedgerEntry;
  },
};

void privacyContract;
