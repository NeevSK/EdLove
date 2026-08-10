import { identityAPI } from '@repo/core/api/identity';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

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
    if (!identity) throw new Error('Not authenticated');

    const { data, error } = await supabaseClient
      .from('privacy_ledger_entries')
      .select('*')
      .eq('user_id', identity.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PrivacyLedgerEntry[];
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
    if (!identity) throw new Error('Not authenticated');

    const { data, error } = await supabaseClient
      .from('privacy_ledger_entries')
      .insert([
        {
          ...input,
          user_id: identity.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as PrivacyLedgerEntry;
  },
};
