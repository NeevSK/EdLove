import { useAuthStore } from '@repo/core/store';
import { orpcClient } from '@repo/core/api/orpcClient';
import { growthSignalsAPI } from '@repo/core/api/client';

import type { ThoughtRecord } from '@repo/core/logic/schemas/self.schema';
import { APIError } from '@repo/core/types';
import type { FireJournalEntry, MoodLog } from '@repo/self/types';

/**
 * Helper to enforce client-side defense-in-depth guest blocks.
 */
function assertAuthenticated() {
  const state = useAuthStore.getState();
  if (!state.user || state.user.is_anonymous) {
    throw new APIError('Forbidden', '403');
  }
}

export const selfAPI = {
  /**
   * Log a new mood signal via the Sovereign oRPC API.
   */
  async logMood(
    userId: string,
    score: number,
    note?: string,
    mood?: MoodLog['mood'],
  ): Promise<MoodLog> {
    assertAuthenticated();
    try {
      const data = await orpcClient.self.logMood({
        body: {
          mood_score: score,
          mood: mood ?? null,
          note: note ?? null,
        },
      });

      // Emit growth signal
      growthSignalsAPI.emitSilent({
        user_id: userId,
        event_type: 'mood_checkin',
        event_metadata: { mood_score: score },
      });

      return data as MoodLog;
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to log mood', error?.code || 'MOOD_LOG_FAILED');
    }
  },

  /**
   * Retrieve mood history.
   */
  async getMoodHistory(userId: string, limit: number = 30): Promise<MoodLog[]> {
    assertAuthenticated();
    try {
      const data = await orpcClient.self.getMoodHistory({
        query: { userId, limit },
      });
      return data as MoodLog[];
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch mood history', error?.code || 'MOOD_HISTORY_FAILED');
    }
  },

  /**
   * Release a journal entry to the flames.
   */
  async burnJournal(userId: string, content: string): Promise<FireJournalEntry> {
    assertAuthenticated();
    try {
      const data = await orpcClient.self.burnJournal({
        body: { content },
      });

      growthSignalsAPI.emitSilent({
        user_id: userId,
        event_type: 'fire_journal_entry',
        event_metadata: {},
      });

      return data as FireJournalEntry;
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to burn journal entry', error?.code || 'BURN_JOURNAL_FAILED');
    }
  },

  /**
   * Retrieve burned history.
   */
  async getBurnedHistory(
    userId: string,
    limit: number = 10,
    viewDate?: string,
  ): Promise<FireJournalEntry[]> {
    assertAuthenticated();
    try {
      const data = await orpcClient.self.getJournalHistory({
        query: { userId, limit, viewDate },
      });
      return data as FireJournalEntry[];
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch burned history', error?.code || 'JOURNAL_HISTORY_FAILED');
    }
  },

  /**
   * Retrieve today's mood.
   */
  async getTodayMood(userId: string): Promise<MoodLog | null> {
    assertAuthenticated();
    try {
      const data = await orpcClient.self.getTodayMood({
        query: { userId },
      });
      return (data as MoodLog) ?? null;
    } catch (error: any) {
      if (error?.status === 404 || error?.code === 'NOT_FOUND') return null;
      throw new APIError(error?.message || 'Failed to fetch today mood', error?.code || 'TODAY_MOOD_FAILED');
    }
  },

  /**
   * Save a completed thought record via the Sovereign oRPC API.
   */
  async saveThoughtRecord(
    input: Omit<ThoughtRecord, 'id' | 'created_at' | 'user_id'>,
  ): Promise<ThoughtRecord> {
    assertAuthenticated();
    try {
      const saved = await orpcClient.self.saveThoughtRecord({
        body: {
          thought: input.thought,
          situation: input.situation ?? null,
          emotion: input.emotion ?? null,
          trap_ids: input.trap_ids ?? null,
          evidence_for: input.evidence_for ?? null,
          evidence_against: input.evidence_against ?? null,
          reframe: input.reframe ?? null,
          mood_before: input.mood_before ?? null,
          mood_after: input.mood_after ?? null,
          post_outcome: input.post_outcome ?? null,
          follow_up: input.follow_up ?? null,
        },
      });

      growthSignalsAPI.emitSilent({
        user_id: (saved as ThoughtRecord).user_id,
        event_type: 'reframe_recorded',
        event_metadata: {
          mood_before: (saved as ThoughtRecord).mood_before,
          mood_after: (saved as ThoughtRecord).mood_after,
          post_outcome: (saved as ThoughtRecord).post_outcome,
        },
      });

      return saved as ThoughtRecord;
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to save thought record', error?.code || 'THOUGHT_RECORD_FAILED');
    }
  },

  /**
   * Retrieve thought record history.
   */
  async getThoughtRecords(
    userId: string,
    limit: number = 30,
    viewDate?: string,
  ): Promise<ThoughtRecord[]> {
    assertAuthenticated();
    try {
      const data = await orpcClient.self.getThoughtRecords({
        query: { userId, limit, viewDate },
      });
      return data as ThoughtRecord[];
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch thought records', error?.code || 'THOUGHT_HISTORY_FAILED');
    }
  },

  /**
   * Complete a thought record follow-up reflection.
   */
  async completeThoughtRecordFollowUp(
    id: string,
    input: { post_outcome?: ThoughtRecord['post_outcome']; follow_up?: ThoughtRecord['follow_up'] },
  ): Promise<ThoughtRecord> {
    assertAuthenticated();
    try {
      const data = await orpcClient.self.completeThoughtRecordFollowUp({
        params: { id },
        body: {
          post_outcome: input.post_outcome ?? null,
          follow_up: input.follow_up ?? null,
        },
      });
      return data as ThoughtRecord;
    } catch (error: any) {
      throw new APIError(
        error?.message || 'Failed to complete thought record follow-up',
        error?.code || 'THOUGHT_RECORD_FAILED',
      );
    }
  },
};
