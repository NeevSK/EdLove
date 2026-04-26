import {
  APIError,
  assertContractCoverage,
  createPOAProxy,
  defineContractCoverage,
  growthSignalsAPI,
  selfContract,
  supabase,
} from '@repo/core';
import type { FireJournalEntry, MoodLog } from '../types';

// ============================================================================
// SELF API (Wellbeing & Reflection)
// ============================================================================

const rawSelfAPI = {
  /**
   * @authority create Wellbeing
   */
  async logMood(
    userId: string,
    score: number,
    note?: string,
    mood?: MoodLog['mood'],
  ): Promise<MoodLog> {
    // AuthorityInterceptor handles authentication and authorization check

    // Validate mood score (1-5)
    if (score < 1 || score > 5) {
      throw new APIError('Mood score must be between 1 and 5', 'INVALID_SCORE');
    }

    const { data, error } = await supabase
      .from('mood_logs')
      .insert([
        {
          user_id: userId,
          mood_score: score,
          mood,
          note,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new APIError('Failed to log mood', error.code, error);
    }

    // Growth signal: teacher chose to check in with themselves (Presence  Tier 2 Care Signal)
    growthSignalsAPI.emitSilent({
      user_id: userId,
      event_type: 'mood_checkin',
      event_metadata: { mood_score: score },
    });

    return data;
  },

  /**
   * @authority read Wellbeing
   */
  async getMoodHistory(userId: string, limit: number = 30): Promise<MoodLog[]> {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new APIError('Failed to fetch mood history', error.code, error);
    }

    return data || [];
  },

  /**
   * @authority create Wellbeing
   */
  async burnJournal(userId: string, content: string): Promise<FireJournalEntry> {
    // Only store preview (first 50 characters) for privacy
    const contentPreview = content.substring(0, 50);

    const { data, error } = await supabase
      .from('fire_journal')
      .insert([
        {
          user_id: userId,
          content_preview: contentPreview,
          is_burned: true,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new APIError('Failed to burn journal entry', error.code, error);
    }

    // Growth signal: teacher processed difficult emotions (Presence  Tier 2 Care Signal)
    growthSignalsAPI.emitSilent({
      user_id: userId,
      event_type: 'fire_journal_entry',
      event_metadata: {},
    });

    return data;
  },

  /**
   * @authority read Wellbeing
   */
  async getBurnedHistory(userId: string, limit: number = 10): Promise<FireJournalEntry[]> {
    const { data, error } = await supabase
      .from('fire_journal')
      .select('id, user_id, content_preview, is_burned, created_at')
      .eq('user_id', userId)
      .eq('is_burned', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new APIError('Failed to fetch burned history', error.code, error);
    }

    return data || [];
  },

  /**
   * @authority read Wellbeing
   */
  async getTodayMood(userId: string): Promise<MoodLog | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No mood logged today
      }
      throw new APIError('Failed to fetch today mood', error.code, error);
    }

    return data;
  },
};

const selfCoverage = assertContractCoverage(
  rawSelfAPI,
  defineContractCoverage({
    moduleName: 'self',
    contract: selfContract,
    methodMapping: {
      getBurnedHistory: 'getJournalHistory',
    },
  }),
);

export const selfAPI = createPOAProxy(
  'self',
  rawSelfAPI,
  selfCoverage.contract,
  selfCoverage.methodMapping,
  { strictUnmappedMethods: true },
);

void [selfContract];
