import { Effect } from 'effect';
import type { Context } from 'hono';

class SyncTableError {
  readonly _tag = 'SyncTableError';
  constructor(readonly table: string) {}
  get message() {
    return `Unsupported sync table: ${this.table}`;
  }
}

class SyncDelegateError {
  readonly _tag = 'SyncDelegateError';
  constructor(readonly modelKey: string) {}
  get message() {
    return `Model delegate "${this.modelKey}" not found in transaction context`;
  }
}

class SyncOperationError {
  readonly _tag = 'SyncOperationError';
  constructor(readonly op: string) {}
  get message() {
    return `Unsupported operations mode: ${this.op}`;
  }
}

const tableToModelMap: Record<string, string> = {
  users: 'user',
  bonds: 'bond',
  user_social_links: 'userSocialLink',
  classroom: 'classroom',
  classroom_student: 'classroomStudent',
  classroom_students: 'classroomStudent',
  assignment: 'assignment',
  assignments: 'assignment',
  grade: 'grade',
  grades: 'grade',
  classroom_grading_settings: 'classroomGradingSettings',
  group: 'group',
  groups: 'group',
  group_member: 'groupMember',
  group_members: 'groupMember',
  post: 'post',
  posts: 'post',
  group_message: 'groupMessage',
  group_messages: 'groupMessage',
  community_reaction: 'communityReaction',
  community_reactions: 'communityReaction',
  lesson: 'lesson',
  lessons: 'lesson',
  lesson_materials: 'material',
  classroom_resources: 'material',
  attendance_record: 'attendanceRecord',
  attendance_records: 'attendanceRecord',
  school: 'school',
  schools: 'school',
  inventory_item: 'inventoryItem',
  inventory_items: 'inventoryItem',
  mood_logs: 'moodLog',
  fire_journal: 'fireJournalEntry',
  user_preferences: 'userPreferences',
  nodes: 'libraryResource',
  collections: 'libraryCollection',
  resource_engagements: 'resourceEngagement',
  thuthimal_gifts: 'thuthimalGift',
  impact_ripples: 'impactRipple',
  whispered_moments: 'whisperedMoment',
  growth_events: 'growthEvent',
  user_growth_state: 'userGrowthState',
  sanctuary_manifestos: 'sanctuaryManifesto',
  manifesto_endorsements: 'manifestoEndorsement',
  section: 'section',
  sections: 'section',
  school_grade: 'schoolGrade',
  school_grades: 'schoolGrade',
  staff_leaves: 'staffLeave',
};

const idempotencyCache = new Map<string, { success: boolean; processedCount: number; timestamp: number }>();

// Clean up cache periodically (e.g. keys older than 10 minutes)
if (typeof globalThis !== 'undefined' && !(globalThis as any).__idempotencyCleanupInterval) {
  (globalThis as any).__idempotencyCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, val] of idempotencyCache.entries()) {
      if (now - val.timestamp > 10 * 60 * 1000) {
        idempotencyCache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export async function applyPowerSyncBatch(db: any, crud: any[], idempotencyKey?: string | null) {
  if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
    console.log(`[Sync] Duplicate batch detected via idempotency key: "${idempotencyKey}". Returning cached response.`);
    const cached = idempotencyCache.get(idempotencyKey)!;
    return {
      success: cached.success,
      processedCount: cached.processedCount,
      idempotent: true,
    };
  }

  if (!Array.isArray(crud)) {
    throw new Error('Invalid payload: crud must be an array');
  }

  console.log(`[Sync] Processing transactional upload batch of ${crud.length} mutations.`);

  try {
    await db.$transaction(async (tx: any) => {
      for (const item of crud) {
        const { id, op, table, opData } = item;
        const modelKey = tableToModelMap[table] || tableToModelMap[table.toLowerCase()];

        if (!modelKey) {
          console.warn(`[Sync] No active Prisma model mapping for table: "${table}"`);
          throw new SyncTableError(table);
        }

        const delegate = tx[modelKey];
        if (!delegate) {
          throw new SyncDelegateError(modelKey);
        }

        switch (op) {
          case 'PUT':
            await delegate.upsert({
              where: { id },
              create: { ...opData, id },
              update: opData ?? {},
            });
            break;

          case 'PATCH':
            await delegate.update({ where: { id }, data: opData ?? {} });
            break;

          case 'DELETE':
            await delegate.delete({ where: { id } });
            break;

          default:
            throw new SyncOperationError(op);
        }
      }
    });

    if (idempotencyKey) {
      idempotencyCache.set(idempotencyKey, {
        success: true,
        processedCount: crud.length,
        timestamp: Date.now(),
      });
    }

    return { success: true, processedCount: crud.length };
  } catch (e) {
    const err = e as Error | SyncTableError | SyncDelegateError | SyncOperationError;
    const message =
      err instanceof SyncTableError ||
      err instanceof SyncDelegateError ||
      err instanceof SyncOperationError
        ? err.message
        : err?.message || 'Transaction Aborted';
    console.error('[Sync] Transaction processing failed, batch aborted:', err);
    throw new Error(message);
  }
}

/**
 * Sync Domain Handlers
 *
 * Exclusively processes transactional PowerSync batches under
 * ZenStack ReBAC security scopes.
 */
export const syncHandlers = {
  /**
   * Processes a bulk batch of offline mutations.
   * Performs all writes in an atomic transaction under the active user's ReBAC context.
   */
  uploadPowerSyncBatch: async (c: Context) => {
    const db = c.get('db');
    if (!db) {
      return c.json({ error: 'Database context not available' }, 500);
    }

    const idempotencyKey = c.req.header('X-Idempotency-Key');
    try {
      const { crud } = await c.req.json();
      const outcome = await applyPowerSyncBatch(db, crud, idempotencyKey);
      return c.json(outcome, 200);
    } catch (err: any) {
      return c.json({ error: 'Transaction Aborted', message: err.message }, 400);
    }
  },
};
