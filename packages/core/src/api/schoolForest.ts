/**
 * School Forest API — Vana (वन) — The Principal's Ecosystem View.
 *
 * The principal is the banyan — the one whose roots create the conditions for an
 * entire forest. The School Forest is their distinctive view: the whole school as a
 * living ecosystem, each teacher a tree, the collective health expressed as weather.
 *
 * Philosophy (see docs/Core/GROWTH_MODEL.md v3.0 — Section 7B "Principal's Constellation"):
 *
 *   The principal sees aggregate forest health, not individual surveillance.
 *   "One tree needs rain" is a compassionate signal, not a performance report.
 *   Individual teacher data is summarized as tree health — never raw signal counts.
 *
 * Features:
 *   - School Forest overview: each teacher's tree health
 *   - School Pulse: aggregate wellbeing "weather" across the school
 *   - Gratitude Circle: principal recognition ritual (sending warmth to specific teachers)
 *   - Forest Whispers: when the whole forest is unusually alive, a rare event fires
 *
 * USAGE (all methods fire-and-forget from the principal's UI):
 *   const forest = await schoolForestAPI.getForestOverview(schoolId);
 *   await schoolForestAPI.sendGratitudeGift(principalId, teacherId, 'lantern', message);
 */

import { Effect } from 'effect';
import { checkLocalPermission } from '@/logic/permissions/localEvaluator';
import { APIError } from '@/types/API';
import { identityAPI } from '@/api/identity';
import { impactRipplesAPI } from '@/api/impactRipples';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';
import { tryPromise } from '@/utils/effect';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type TreeHealth =
  | 'seedling' // New teacher; early days
  | 'growing' // Regular presence signals in past 14 days
  | 'flourishing' // Strong presence + nourishing signals
  | 'flowering' // Also weaving (community contribution); others benefit from their presence
  | 'ancient'; // Long-term, deep-rooted; high across multiple dimensions

export type GiftType = 'lantern' | 'rain' | 'sunlight' | 'seed';

export interface TeacherTree {
  user_id: string;
  tree_health: TreeHealth;
  has_thuthimal: boolean; // Permanent lotus marker in the forest
  last_signal_at: string | null; // When they last had any growth event
  /** Days since last signal — used for the "needs rain" compassionate signal */
  days_since_signal: number;
  /** Whether this teacher's tree should be highlighted as needing attention */
  needs_rain: boolean;
}

export interface SchoolForestState {
  school_id: string;
  trees: TeacherTree[];
  /** The forest's overall health as a weather condition */
  forest_weather: 'radiant' | 'lush' | 'steady' | 'resting' | 'quiet';
  /** English narrative of the forest's state for the principal */
  forest_narrative_en: string;
  computed_at: string;
}

export interface SchoolPulse {
  school_id: string;
  /** Active teachers (any signal in past 7 days) as a fraction of total */
  presence_fraction: number;
  /** Most active aliveness dimension across the school this week */
  leading_dimension: string;
  /** Short English narrative for the principal */
  pulse_narrative_en: string;
  period_start: string;
  computed_at: string;
}

export interface GratitudeGift {
  id: string;
  sender_user_id: string;
  recipient_user_id: string;
  school_id: string | null;
  message: string | null;
  gift_type: GiftType;
  warm_message_en: string;
  warm_message_si: string | null;
  warm_message_ta: string | null;
  delivered: boolean;
  delivered_at: string | null;
  created_at: string;
}

export interface SchoolForestRow {
  school_id: string;
  teacher_user_id: string;
  tree_health: string;
  has_thuthimal: boolean;
  last_signal_at: string | null;
}

export interface GrowthEventSignal {
  user_id: string;
  dimension: string;
  created_at: string;
}

// ────────────────────────────────────────────────────────────────────────────
// GRATITUDE GIFT WARM MESSAGES
// (See impactRipples.ts for the warm message design philosophy.)
// ────────────────────────────────────────────────────────────────────────────

const GIFT_MESSAGES: Record<GiftType, { en: string; si: string; ta: string }> = {
  lantern: {
    en: 'Your principal lit a lantern for you today.',
    si: 'ඔබේ විදුහල්පති අද ඔබ සඳහා ලාම්පුවක් දැල්වීය.', // pending native review
    ta: 'இன்று உங்கள் அதிபர் உங்களுக்காக ஒரு விளக்கை ஏற்றினார்.', // pending native review
  },
  rain: {
    en: 'Your school sees the work you are doing. Thank you.',
    si: 'ඔබේ පාසල ඔබ කරන කාර්ය දකී. ස්තූතියි.', // pending native review
    ta: 'உங்கள் பள்ளி நீங்கள் செய்யும் வேலையைப் பார்க்கிறது. நன்றி.', // pending native review
  },
  sunlight: {
    en: 'You brought light to this school this week.',
    si: 'ඔබ මේ සතියේ ඔබේ පාසලට ආලෝකය ගෙනආ.', // pending native review
    ta: 'இந்த வாரம் நீங்கள் இந்த பள்ளிக்கு ஒளி கொண்டு வந்தீர்கள்.', // pending native review
  },
  seed: {
    en: 'What you planted here will grow long after this season.',
    si: 'ඔබ මෙහි රෝපණය කළ දෙය මෙම කාලයෙන් ඔබ්බට වැඩෙනු ඇත.', // pending native review
    ta: 'நீங்கள் இங்கே நட்டது இந்த பருவக்காலத்திற்கு அப்பால் வளறும்.', // pending native review
  },
};

// ────────────────────────────────────────────────────────────────────────────
// TREE HEALTH COMPUTATION
// ────────────────────────────────────────────────────────────────────────────

/** Compute tree health from signal counts over the trailing 14 days. */
function computeTreeHealth(
  presenceSignals: number,
  nourishingSignals: number,
  weavingSignals: number,
  durationDays: number,
): TreeHealth {
  const totalSignals = presenceSignals + nourishingSignals + weavingSignals;

  if (totalSignals === 0) return 'seedling';

  const activeDimensions = [presenceSignals > 0, nourishingSignals > 0, weavingSignals > 0].filter(
    Boolean,
  ).length;

  if (durationDays > 180 && activeDimensions >= 3 && totalSignals > 30) return 'ancient';
  if (activeDimensions >= 2 && weavingSignals > 2) return 'flowering';
  if (presenceSignals >= 5 && nourishingSignals >= 3) return 'flourishing';
  if (presenceSignals >= 3) return 'growing';
  return 'seedling';
}

function forestWeather(trees: TeacherTree[]): SchoolForestState['forest_weather'] {
  if (trees.length === 0) return 'quiet';
  const flourishing = trees.filter(
    (t) =>
      t.tree_health === 'flowering' ||
      t.tree_health === 'flourishing' ||
      t.tree_health === 'ancient',
  ).length;
  const fraction = flourishing / trees.length;
  if (fraction > 0.6) return 'radiant';
  if (fraction > 0.4) return 'lush';
  if (fraction > 0.2) return 'steady';
  const resting = trees.filter((t) => t.needs_rain).length;
  if (resting > trees.length * 0.3) return 'quiet';
  return 'resting';
}

function forestNarrative(
  weather: SchoolForestState['forest_weather'],
  trees: TeacherTree[],
): string {
  const total = trees.length;
  const active = trees.filter((t) => t.tree_health !== 'seedling').length;
  const needsRain = trees.filter((t) => t.needs_rain).length;
  const hasThuthimal = trees.filter((t) => t.has_thuthimal).length;

  const lines: string[] = [];

  switch (weather) {
    case 'radiant':
      lines.push(
        `Your school forest is radiant this week — ${active} of ${total} trees are alive with activity.`,
      );
      break;
    case 'lush':
      lines.push(`The forest is lush and growing — most trees have been active.`);
      break;
    case 'steady':
      lines.push(`The forest is steady — ${active} trees are engaged, others at rest.`);
      break;
    case 'resting':
      lines.push(`The forest is in a resting season. That is natural and necessary.`);
      break;
    case 'quiet':
      lines.push(`The forest is very quiet this week. Some trees may need rain.`);
      break;
  }

  if (needsRain > 0) {
    lines.push(
      `${needsRain} ${needsRain === 1 ? 'tree needs' : 'trees need'} some rain — a gentle check-in may help.`,
    );
  }
  if (hasThuthimal > 0) {
    lines.push(
      `${hasThuthimal} ${hasThuthimal === 1 ? 'lotus blooms' : 'lotus blooms'} permanently in this forest — a Thuthimal was given here.`,
    );
  }

  return lines.join(' ');
}

// ────────────────────────────────────────────────────────────────────────────
// SCHOOL FOREST API
// ────────────────────────────────────────────────────────────────────────────

export const schoolForestAPI = {
  /**
   * Get the full School Forest view for a principal.
   * Each teacher in the school is represented as a tree with health metadata.
   *
   * This reads from `school_forest_state` (computed/refreshed nightly) and
   * falls back to live `growth_events` computation if the table is empty.
   */
  async getForestOverview(schoolId: string): Promise<SchoolForestState> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    const isAllowed = await checkLocalPermission({
      action: 'read',
      resourceType: 'SchoolForest',
      resourceId: schoolId,
      userContext: { userId: identity.id, schoolId },
    });

    if (!isAllowed) {
      throw new APIError('Unauthorized to view school forest', 'FORBIDDEN');
    }

    const now = new Date();

    // Fetch pre-computed forest state
    const { data: forestRows } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('school_forest_state')
      .select('*')
      .eq('school_id', schoolId);

    if (forestRows && forestRows.length > 0) {
      const trees: TeacherTree[] = forestRows.map((row: SchoolForestRow) => {
        const daysSince = row.last_signal_at
          ? Math.floor((now.getTime() - new Date(row.last_signal_at).getTime()) / 86400000)
          : 999;
        return {
          user_id: row.teacher_user_id,
          tree_health: row.tree_health as TreeHealth,
          has_thuthimal: row.has_thuthimal,
          last_signal_at: row.last_signal_at,
          days_since_signal: daysSince,
          needs_rain: daysSince > 7,
        };
      });

      const weather = forestWeather(trees);
      return {
        school_id: schoolId,
        trees,
        forest_weather: weather,
        forest_narrative_en: forestNarrative(weather, trees),
        computed_at: now.toISOString(),
      };
    }

    // Fallback: live computation from growth_events (slower)
    return this.computeForestLive(schoolId);
  },

  /**
   * Live computation of school forest state from growth_events.
   * Used as a fallback when pre-computed data is unavailable.
   * Also called by the background job that refreshes school_forest_state nightly.
   */
  async computeForestLive(schoolId: string): Promise<SchoolForestState> {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString();

    // Get all teachers in this school
    const { data: teachers } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('users')
      .select('id')
      .eq('school_id', schoolId)
      .eq('capacity', 'teacher');

    if (!teachers || teachers.length === 0) {
      return {
        school_id: schoolId,
        trees: [],
        forest_weather: 'quiet',
        forest_narrative_en: 'The forest is young — teachers are still finding their way here.',
        computed_at: now.toISOString(),
      };
    }

    const teacherIds: string[] = teachers.map((t: { id: string }) => t.id);

    // Batch query: growth events for ALL teachers in one request (avoids N+1)
    const { data: allSignals } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('growth_events')
      .select('user_id, dimension, created_at')
      .in('user_id', teacherIds)
      .gte('created_at', fourteenDaysAgo);

    // Batch query: growth state for ALL teachers in one request (avoids N+1)
    const { data: allGrowthStates } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('user_growth_state')
      .select('user_id, created_at, blooming_signals')
      .in('user_id', teacherIds);

    // Build lookup maps for O(1) access per teacher
    const signalsByTeacher = new Map<string, Array<{ dimension: string; created_at: string }>>();
    for (const signal of allSignals ?? []) {
      const list = signalsByTeacher.get(signal.user_id) ?? [];
      list.push(signal);
      signalsByTeacher.set(signal.user_id, list);
    }

    const growthStateByTeacher = new Map<
      string,
      { created_at: string | null; blooming_signals: number | null }
    >();
    for (const state of allGrowthStates ?? []) {
      growthStateByTeacher.set(state.user_id, state);
    }

    // Compute tree health for each teacher without further DB queries
    const trees: TeacherTree[] = [];

    for (const teacher of teachers) {
      const signals = signalsByTeacher.get(teacher.id) ?? [];
      const growthState = growthStateByTeacher.get(teacher.id);

      const presenceSignals = signals.filter((s) => s.dimension === 'presence').length;
      const nourishingSignals = signals.filter((s) => s.dimension === 'nourishing').length;
      const weavingSignals = signals.filter((s) => s.dimension === 'weaving').length;

      const durationDays = growthState?.created_at
        ? Math.floor((now.getTime() - new Date(growthState.created_at).getTime()) / 86400000)
        : 0;

      const lastSignal =
        signals.length > 0
          ? (signals
              .slice()
              .sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
              )[0]?.created_at ?? null)
          : null;

      const daysSince = lastSignal
        ? Math.floor((now.getTime() - new Date(lastSignal).getTime()) / 86400000)
        : 999;

      trees.push({
        user_id: teacher.id,
        tree_health: computeTreeHealth(
          presenceSignals,
          nourishingSignals,
          weavingSignals,
          durationDays,
        ),
        has_thuthimal: (growthState?.blooming_signals ?? 0) > 0,
        last_signal_at: lastSignal,
        days_since_signal: daysSince,
        needs_rain: daysSince > 7,
      });
    }

    const weather = forestWeather(trees);
    return {
      school_id: schoolId,
      trees,
      forest_weather: weather,
      forest_narrative_en: forestNarrative(weather, trees),
      computed_at: now.toISOString(),
    };
  },

  /**
   * Get the School Pulse — aggregate wellbeing "weather" across the school.
   * The principal sees health expressed as atmosphere, not individual scores.
   */
  async getSchoolPulse(schoolId: string): Promise<SchoolPulse> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

    const { data: teachers } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('users')
      .select('id')
      .eq('school_id', schoolId)
      .eq('capacity', 'teacher');

    const totalTeachers = teachers?.length ?? 0;
    if (totalTeachers === 0) {
      return {
        school_id: schoolId,
        presence_fraction: 0,
        leading_dimension: 'presence',
        pulse_narrative_en: 'The school is just beginning its journey.',
        period_start: sevenDaysAgo,
        computed_at: now.toISOString(),
      };
    }

    // Fetch growth signals for all teachers in this school via user_id join
    const teacherIds: string[] = (teachers ?? []).map((t: { id: string }) => t.id);
    const { data: signalsByTeacher } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('growth_events')
      .select('user_id, dimension')
      .in('user_id', teacherIds)
      .gte('created_at', sevenDaysAgo);

    const allSignals = (signalsByTeacher ?? []) as GrowthEventSignal[];
    const activeTeachers = new Set(allSignals.map((s) => s.user_id)).size;
    const presenceFraction = Math.round((activeTeachers / totalTeachers) * 100) / 100;

    // Which dimension is most active?
    const dimensionCounts: Record<string, number> = {};
    for (const s of allSignals) {
      dimensionCounts[s.dimension] = (dimensionCounts[s.dimension] ?? 0) + 1;
    }
    const leadingDimension =
      Object.entries(dimensionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'presence';

    const pulseNarrative =
      presenceFraction > 0.7
        ? `Most of your school's teachers have been active this week. The forest is alive.`
        : presenceFraction > 0.4
          ? `About half the school has been engaged this week — steady and growing.`
          : presenceFraction > 0.2
            ? `A quieter week for many. Some trees may be resting; some may need rain.`
            : `This has been a very quiet week across the school. A compassionate check-in with your team may be timely.`;

    return {
      school_id: schoolId,
      presence_fraction: presenceFraction,
      leading_dimension: leadingDimension,
      pulse_narrative_en: pulseNarrative,
      period_start: sevenDaysAgo,
      computed_at: now.toISOString(),
    };
  },

  /**
   * Send a Gratitude Gift to a teacher — the principal's recognition ritual.
   * Creates a warm, private impact signal for the recipient.
   *
   * Gift types and their meaning:
   *   lantern  — "I see you. You light this place."
   *   rain     — "Thank you. Your school sees your work."
   *   sunlight — "You brought light here this week."
   *   seed     — "What you planted here will grow long after this season."
   */
  async sendGratitudeGift(
    principalUserId: string,
    recipientUserId: string,
    giftType: GiftType,
    personalMessage?: string,
    schoolId?: string,
  ): Promise<void> {
    if (principalUserId === recipientUserId) return;

    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    const isAllowed = await checkLocalPermission({
      action: 'manage',
      resourceType: 'SchoolForest',
      resourceId: schoolId || 'school-forest',
      userContext: { userId: identity.id, schoolId },
    });

    if (!isAllowed) {
      throw new APIError('Unauthorized to send gratitude gifts', 'FORBIDDEN');
    }

    const messages = GIFT_MESSAGES[giftType];

    try {
      await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.from('gratitude_gifts').insert({
        sender_user_id: principalUserId,
        recipient_user_id: recipientUserId,
        school_id: schoolId ?? null,
        message: personalMessage ?? null,
        gift_type: giftType,
        warm_message_en: messages.en,
        warm_message_si: messages.si,
        warm_message_ta: messages.ta,
        delivered: false,
      });
    } catch (err) {
      console.warn(
        '[SchoolForest] Failed to create gratitude gift:',
        err instanceof Error ? err.message : String(err),
      );
    }

    Effect.runFork(
      tryPromise(() =>
        impactRipplesAPI.createRipple({
          recipientUserId,
          actorUserId: principalUserId,
          rippleType: 'principal_recognition',
          sourceEntityType: 'gratitude_gift',
          sourceEntityId: undefined,
        }),
      ).pipe(Effect.catchAll((e) => Effect.logError('[SchoolForest] createRipple failed', e))),
    );
  },

  /**
   * Get pending Gratitude Gifts for a teacher.
   * Called by the notification delivery system.
   */
  async getPendingGifts(recipientUserId: string): Promise<GratitudeGift[]> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    if (identity.id !== recipientUserId) {
      const isAllowed = await checkLocalPermission({
        action: 'manage',
        resourceType: 'Staff',
        resourceId: recipientUserId,
        userContext: { userId: identity.id },
      });
      if (!isAllowed) {
        throw new APIError('Unauthorized to view others gifts', 'FORBIDDEN');
      }
    }
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('gratitude_gifts')
      .select('*')
      .eq('recipient_user_id', recipientUserId)
      .eq('delivered', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[SchoolForest] Failed to fetch pending gifts:', error.message);
      return [];
    }
    return (data ?? []) as GratitudeGift[];
  },

  /**
   * Mark a Gratitude Gift as delivered.
   */
  async markGiftDelivered(giftId: string): Promise<void> {
    try {
      await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
        .from('gratitude_gifts')
        .update({ delivered: true, delivered_at: new Date().toISOString() })
        .eq('id', giftId);
    } catch (err) {
      console.warn(
        '[SchoolForest] Failed to mark gift delivered:',
        err instanceof Error ? err.message : String(err),
      );
    }
  },
};
