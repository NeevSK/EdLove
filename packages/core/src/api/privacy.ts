import { identityAPI } from './identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';

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
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Not authenticated');

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('privacy_ledger_entries')
      .select('*')
      .eq('user_id', myId)
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
    const myId = await identityAPI.getMyInternalId();
    if (!myId) throw new Error('Not authenticated');

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('privacy_ledger_entries')
      .insert([
        {
          ...input,
          user_id: myId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as PrivacyLedgerEntry;
  },
};
