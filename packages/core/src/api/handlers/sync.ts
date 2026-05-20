import type { Context } from 'hono';

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

    const { crud } = await c.req.json();
    if (!Array.isArray(crud)) {
      return c.json({ error: 'Invalid payload: crud must be an array' }, 400);
    }

    console.log(`[Sync] Processing transactional upload batch of ${crud.length} mutations.`);

    try {
      // Execute all operations in a single database transaction for atomic consistency
      await db.$transaction(async (tx: any) => {
        for (const item of crud) {
          const { id, op, table, opData } = item;
          const modelKey = tableToModelMap[table] || tableToModelMap[table.toLowerCase()];

          if (!modelKey) {
            console.warn(`[Sync] No active Prisma model mapping for table: "${table}"`);
            throw new Error(`Unsupported sync table: ${table}`);
          }

          const delegate = tx[modelKey];
          if (!delegate) {
            throw new Error(`Model delegate "${modelKey}" not found in transaction context`);
          }

          console.log(`[Sync] Executing ${op} on "${modelKey}" ID: ${id}`);

          switch (op) {
            case 'PUT':
              // Perform atomic upsert
              await delegate.upsert({
                where: { id },
                create: { ...opData, id },
                update: opData ?? {},
              });
              break;

            case 'PATCH':
              // Perform atomic update
              await delegate.update({
                where: { id },
                data: opData ?? {},
              });
              break;

            case 'DELETE':
              // Perform atomic delete
              await delegate.delete({
                where: { id },
              });
              break;

            default:
              throw new Error(`Unsupported operations mode: ${op}`);
          }
        }
      });

      console.log(`[Sync] Successfully synchronized ${crud.length} mutations to platform ledger.`);

      return c.json(
        {
          success: true,
          processedCount: crud.length,
        },
        200,
      );
    } catch (err: any) {
      console.error('[Sync] Transaction processing failed, batch aborted:', err);
      return c.json(
        {
          error: 'Transaction Aborted',
          message: err.message || String(err),
        },
        400,
      );
    }
  },
};
