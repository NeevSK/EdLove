import type { Context } from 'hono';
import { z } from 'zod';
import {
  FireJournalEntrySchema,
  MoodLogSchema,
  UserPreferencesSchema,
} from '../../logic/schemas/self.schema';

/**
 * Self Domain Handlers (Hono + ZenStack ReBAC)
 *
 * These handlers assume that 'db' (Enhanced Prisma Client)
 * has been injected into the context by the ZenStackMiddleware.
 */

export const selfHandlers = {
  /**
   * Log a new mood signal.
   * ZenStack v3.6.4 enforces that users can only log for themselves.
   */
  logMood: async (c: Context) => {
    const db = c.get('db');
    const body = await c.req.json();

    // Zod v4 Validation
    const validated = MoodLogSchema.omit({ id: true, created_at: true }).parse(body);

    const moodLog = await db.moodLog.create({
      data: validated,
    });

    return c.json(moodLog, 201);
  },

  /**
   * Retrieve mood history for a user.
   * ReBAC enforces that only the owner or an admin can see this history.
   */
  getMoodHistory: async (c: Context) => {
    const db = c.get('db');
    const userId = c.req.query('userId');
    const limit = Number(c.req.query('limit')) || 10;

    const history = await db.moodLog.findMany({
      where: { user_id: userId },
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    return c.json(history, 200);
  },

  /**
   * Release a journal entry to the flames.
   * Atomic creation of a 'burned' entry.
   */
  burnJournal: async (c: Context) => {
    const db = c.get('db');
    const { content } = await c.req.json();

    const entry = await db.fireJournalEntry.create({
      data: {
        content_preview: content.substring(0, 50), // Only keep a tiny fragment
        is_burned: true,
        user_id: c.get('user').id,
      },
    });

    return c.json(entry, 201);
  },

  /**
   * Retrieve burned journal history.
   */
  getJournalHistory: async (c: Context) => {
    const db = c.get('db');
    const userId = c.req.query('userId');
    const limit = Number(c.req.query('limit')) || 10;

    const history = await db.fireJournalEntry.findMany({
      where: { user_id: userId },
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    return c.json(history, 200);
  },

  /**
   * Retrieve today's mood log for a user.
   */
  getTodayMood: async (c: Context) => {
    const db = c.get('db');
    const userId = c.req.query('userId');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mood = await db.moodLog.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: today,
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return c.json(mood, 200);
  },

  /**
   * Retrieve user preferences.
   */
  getPreferences: async (c: Context) => {
    const db = c.get('db');
    const user = c.get('user');

    const prefs = await db.userPreferences.findUnique({
      where: { user_id: user.id },
    });

    return c.json(prefs, 200);
  },

  /**
   * Update user preferences (Partial).
   */
  updatePreferences: async (c: Context) => {
    const db = c.get('db');
    const user = c.get('user');
    const body = await c.req.json();

    const validated = UserPreferencesSchema.partial().parse(body);

    const updated = await db.userPreferences.update({
      where: { user_id: user.id },
      data: validated,
    });

    return c.json(updated, 200);
  },
};
