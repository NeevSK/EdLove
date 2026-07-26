import {
  type AppType,
  createSovereignClient,
  growthSignalsAPI,
  SOVEREIGN_API_URL,
} from '@repo/core/api';
import { useStore } from '@repo/core/logic';
import { APIError } from '@repo/core/types';
import type { FireJournalEntry, MoodLog } from '@/types';

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

/**
 * SELF API (Sovereign Hono Proxy)
 *
 * This module no longer talks to Supabase directly.
 * It acts as a lightweight RPC proxy to the Sanctuary API on Railway.
 */
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
  async getBurnedHistory(userId: string, limit: number = 10): Promise<FireJournalEntry[]> {
    assertAuthenticated();
    const res = await client.api.self.journal.$get({
      query: { userId, limit: limit.toString() },
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
};
