import {
  type AppType,
  createSovereignClient,
  growthSignalsAPI,
  SOVEREIGN_API_URL,
} from '@repo/core/api/client';
import { useStore } from '@repo/core/logic';
import type { ThoughtRecord } from '@repo/core/logic/schemas/self.schema';
import { APIError } from '@repo/core/types';
import type { FireJournalEntry, MoodLog } from '@repo/self/types';

// Create the type-safe RPC client
const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

/**
 * Helper to enforce client-side defense-in-depth guest blocks.
 */
function assertAuthenticated() {
  const state = useStore.getState();
  if (!state.user || state.user.is_anonymous) {
    throw new APIError('Forbidden', '403');
  }
}

export const selfAPI = {
  /**
   * Log a new mood signal via the Remote API.
   */
  async logMood(
    userId: string,
    score: number,
    note?: string,
    mood?: MoodLog['mood'],
  ): Promise<MoodLog> {
    assertAuthenticated();
    const res = await client.api.self.mood.$post({
      json: {
        user_id: userId,
        mood_score: score,
        mood,
        note,
      },
    });

    if (!res.ok) {
      const error = (await res.json()) as any;
      throw new APIError(error.message || 'Failed to log mood', res.status.toString());
    }

    const data = (await res.json()) as MoodLog;

    // Emit growth signal (Side effect remains in client for now)
    growthSignalsAPI.emitSilent({
      user_id: userId,
      event_type: 'mood_checkin',
      event_metadata: { mood_score: score },
    });

    return data;
  },

  /**
   * Retrieve mood history.
   */
  async getMoodHistory(userId: string, limit: number = 30): Promise<MoodLog[]> {
    assertAuthenticated();
    const res = await client.api.self.mood.$get({
      query: { userId, limit: limit.toString() },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch mood history', res.status.toString());
    }

    return (await res.json()) as MoodLog[];
  },

  /**
   * Release a journal entry to the flames.
   */
  async burnJournal(userId: string, content: string): Promise<FireJournalEntry> {
    assertAuthenticated();
    const res = await client.api.self.journal.burn.$post({
      json: { content },
    });

    if (!res.ok) {
      throw new APIError('Failed to burn journal entry', res.status.toString());
    }

    const data = (await res.json()) as FireJournalEntry;

    growthSignalsAPI.emitSilent({
      user_id: userId,
      event_type: 'fire_journal_entry',
      event_metadata: {},
    });

    return data;
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
    const res = await client.api.self.journal.$get({
      query: { userId, limit: limit.toString(), viewDate },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch burned history', res.status.toString());
    }

    return (await res.json()) as FireJournalEntry[];
  },

  /**
   * Retrieve today's mood.
   */
  async getTodayMood(userId: string): Promise<MoodLog | null> {
    assertAuthenticated();
    const res = await client.api.self.mood.today.$get({
      query: { userId },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new APIError('Failed to fetch today mood', res.status.toString());
    }

    return (await res.json()) as MoodLog;
  },

  /**
   * Save a completed thought record via the Remote API.
   */
  async saveThoughtRecord(
    input: Omit<ThoughtRecord, 'id' | 'created_at' | 'user_id'>,
  ): Promise<ThoughtRecord> {
    assertAuthenticated();
    const res = await client.api.self.thoughtRecord.$post({
      json: {
        thought: input.thought,
        situation: input.situation,
        emotion: input.emotion,
        trap_ids: input.trap_ids,
        evidence_for: input.evidence_for,
        evidence_against: input.evidence_against,
        reframe: input.reframe,
        mood_before: input.mood_before,
        mood_after: input.mood_after,
        post_outcome: input.post_outcome,
        follow_up: input.follow_up,
      },
    });

    if (!res.ok) {
      const error = (await res.json()) as any;
      throw new APIError(error.message || 'Failed to save thought record', res.status.toString());
    }

    const saved = (await res.json()) as ThoughtRecord;

    growthSignalsAPI.emitSilent({
      user_id: saved.user_id,
      event_type: 'reframe_recorded',
      event_metadata: {
        mood_before: saved.mood_before,
        mood_after: saved.mood_after,
        post_outcome: saved.post_outcome,
      },
    });

    return saved;
  },

  /**
   * Complete (or reschedule) the follow-up on a thought record.
   */
  async completeThoughtRecordFollowUp(
    id: string,
    input: { post_outcome?: ThoughtRecord['post_outcome']; follow_up?: ThoughtRecord['follow_up'] },
  ): Promise<ThoughtRecord> {
    assertAuthenticated();
    const res = await client.api.self.thoughtRecord[':id'].$patch({
      param: { id },
      json: {
        post_outcome: input.post_outcome,
        follow_up: input.follow_up,
      },
    });

    if (!res.ok) {
      const error = (await res.json()) as any;
      throw new APIError(error.message || 'Failed to update thought record', res.status.toString());
    }

    const updated = (await res.json()) as ThoughtRecord;

    growthSignalsAPI.emitSilent({
      user_id: updated.user_id,
      event_type: 'reframe_follow_up_completed',
      event_metadata: { post_outcome: updated.post_outcome },
    });

    return updated;
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
    const res = await client.api.self.thoughtRecord.$get({
      query: { userId, limit: limit.toString(), viewDate },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch thought records', res.status.toString());
    }

    return (await res.json()) as ThoughtRecord[];
  },
};
