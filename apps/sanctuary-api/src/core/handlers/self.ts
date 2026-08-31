import { selfContract } from '@repo/core/api/server';
import { SovereignError } from '@repo/core/types/Errors';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(selfContract).$context<ORPCContext>();

const asIsoString = (value: unknown) =>
  value instanceof Date ? value.toISOString() : String(value ?? new Date().toISOString());

const mapMoodLog = (row: any) => ({
  id: String(row.id),
  user_id: String(row.user_id),
  mood_score: Number(row.mood_score ?? 0),
  mood: row.mood ?? null,
  note: row.note ?? null,
  created_at: asIsoString(row.created_at),
});

const mapPreferences = (row: any, userId: string) => ({
  id: String(row.id ?? `preferences-${userId}`),
  user_id: String(row.user_id ?? userId),
  favorite_features: Array.isArray(row.favorite_features) ? row.favorite_features : [],
  hidden_features: Array.isArray(row.hidden_features) ? row.hidden_features : [],
  morning_check_time: row.morning_check_time ?? null,
  afternoon_check_time: row.afternoon_check_time ?? null,
  evening_wind_down_time: row.evening_wind_down_time ?? null,
  enable_contextual_prompts: row.enable_contextual_prompts ?? true,
  enable_usage_tracking: row.enable_usage_tracking ?? true,
  notification_settings: row.notification_settings ?? null,
  updated_at: asIsoString(row.updated_at),
  created_at: asIsoString(row.created_at),
});

const mapThoughtRecord = (row: any) => ({
  id: String(row.id),
  user_id: String(row.user_id),
  thought: String(row.thought),
  situation: row.situation ?? null,
  emotion: row.emotion ?? null,
  trap_ids: row.trap_ids ?? null,
  evidence_for: row.evidence_for ?? null,
  evidence_against: row.evidence_against ?? null,
  reframe: row.reframe ?? null,
  mood_before: row.mood_before ?? null,
  mood_after: row.mood_after ?? null,
  post_outcome: row.post_outcome ?? null,
  follow_up: row.follow_up ?? null,
  idempotency_key: row.idempotency_key ?? null,
  created_at: asIsoString(row.created_at),
});

export const selfRouter = impl.router({
  logMood: impl.logMood.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const row = await context.db.moodLog.create({
      data: {
        user_id: context.user.id,
        mood_score: input.body.mood_score ?? 0,
        mood: input.body.mood ?? null,
        note: input.body.note ?? input.body.notes ?? null,
      },
    });
    return mapMoodLog(row);
  }),

  getMoodHistory: impl.getMoodHistory
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const rows = await context.db.moodLog.findMany({
        where: { user_id: context.user.id },
        take: input.query.limit ?? 10,
        orderBy: { created_at: 'desc' },
      });
      return rows.map(mapMoodLog);
    }),

  burnJournal: impl.burnJournal.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const row = await context.db.fireJournalEntry.create({
      data: {
        content_preview: input.body.content.substring(0, 50),
        is_burned: true,
        user_id: context.user.id,
      },
    });
    return {
      ...row,
      id: String(row.id),
      user_id: String(row.user_id ?? context.user.id),
      content_preview: String(row.content_preview ?? input.body.content.substring(0, 50)),
      is_burned: row.is_burned ?? true,
      created_at: asIsoString(row.created_at),
    };
  }),

  getJournalHistory: impl.getJournalHistory
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const rows = await context.db.fireJournalEntry.findMany({
        where: {
          user_id: context.user.id,
          created_at: input.query.viewDate
            ? (() => {
                const cutoff = new Date(input.query.viewDate);
                const start = new Date(
                  Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth(), cutoff.getUTCDate()),
                );
                return { gte: start, lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
              })()
            : undefined,
        },
        take: input.query.limit ?? 10,
        orderBy: { created_at: 'desc' },
      });
      return rows.map((row: any) => ({
        ...row,
        id: String(row.id),
        user_id: String(row.user_id ?? context.user.id),
        content_preview: String(row.content_preview ?? ''),
        is_burned: row.is_burned ?? true,
        created_at: asIsoString(row.created_at),
      }));
    }),

  getTodayMood: impl.getTodayMood.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const row = await context.db.moodLog.findFirst({
      where: {
        user_id: context.user.id,
        created_at: {
          gte: today,
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return row ? mapMoodLog(row) : null;
  }),

  saveThoughtRecord: impl.saveThoughtRecord
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const row = await context.db.thoughtRecord.create({
        data: {
          ...input.body,
          user_id: context.user.id,
        },
      });
      return mapThoughtRecord(row);
    }),

  getThoughtRecords: impl.getThoughtRecords
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const rows = await context.db.thoughtRecord.findMany({
        where: { user_id: context.user.id },
        take: input.query.limit ?? 10,
        orderBy: { created_at: 'desc' },
      });
      return rows.map(mapThoughtRecord);
    }),

  completeThoughtRecordFollowUp: impl.completeThoughtRecordFollowUp
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const row = await context.db.thoughtRecord.update({
        where: { id: input.params.id },
        data: {
          post_outcome: input.body.post_outcome,
          follow_up: input.body.follow_up,
        },
      });
      return mapThoughtRecord(row);
    }),

  getPreferences: impl.getPreferences.use(doubleGateMiddleware).handler(async ({ context }) => {
    assertDatabase(context);
    const prefs = await context.db.userPreferences.findUnique({
      where: { user_id: context.user.id },
    });
    if (!prefs) throw SovereignError.notFound('User preferences');
    return mapPreferences(prefs, context.user.id);
  }),

  updatePreferences: impl.updatePreferences
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const { user_id: _ignoredUserId, ...updateData } = input.body;
      const updated = await context.db.userPreferences.update({
        where: { user_id: context.user.id },
        data: updateData as any,
      });
      return mapPreferences(updated, context.user.id);
    }),
});
