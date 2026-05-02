/**
 * School Forest API \u2014 Vana (\u0935\u0928) \u2014 The Principal's Ecosystem View.
 *
 * The principal is the banyan \u2014 the one whose roots create the conditions for an
 * entire forest. The School Forest is their distinctive view: the whole school as a
 * living ecosystem, each teacher a tree, the collective health expressed as weather.
 *
 * Philosophy (see docs/Core/GROWTH_MODEL.md v3.0 \u2014 Section 7B "Principal's Constellation"):
 *
 *   The principal sees aggregate forest health, not individual surveillance.
 *   "One tree needs rain" is a compassionate signal, not a performance report.
 *   Individual teacher data is summarized as tree health \u2014 never raw signal counts.
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

import { composeUserAbilities } from '../logic/permissions/composer';
import { APIError } from '../types/API';
import { identityAPI } from './identity';
import { impactRipplesAPI } from './impactRipples';
import { supabase } from './supabase';

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// TYPES
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

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
  /** Days since last signal \u2014 used for the "needs rain" compassionate signal */
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

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// GRATITUDE GIFT WARM MESSAGES
// (See impactRipples.ts for the warm message design philosophy.)
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const GIFT_MESSAGES: Record<GiftType, { en: string; si: string; ta: string }> = {
  lantern: {
    en: 'Your principal lit a lantern for you today.',
    si: '\u0D94\u0DB6\u0DDA \u0DC0\u0DD2\u0DAF\u0DD4\u0DC4\u0DBD\u0DCA\u0DB4\u0DAD\u0DD2 \u0D85\u0DAF \u0D94\u0DB6 \u0DC3\u0DB3\u0DC4\u0DCF \u0DBD\u0DCF\u0DB8\u0DCA\u0DB4\u0DD4\u0DC0\u0D9A\u0DCA \u0DAF\u0DD0\u0DBD\u0DCA\u0DC0\u0DD3\u0DBA.', // pending native review
    ta: '\u0B87\u0BA9\u0BCD\u0BB1\u0BC1 \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B85\u0BA4\u0BBF\u0BAA\u0BB0\u0BCD \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BC1\u0B95\u0BCD\u0B95\u0BBE\u0B95 \u0B92\u0BB0\u0BC1 \u0BB5\u0BBF\u0BB3\u0B95\u0BCD\u0B95\u0BC8 \u0B8F\u0BB1\u0BCD\u0BB1\u0BBF\u0BA9\u0BBE\u0BB0\u0BCD.', // pending native review
  },
  rain: {
    en: 'Your school sees the work you are doing. Thank you.',
    si: '\u0D94\u0DB6\u0DDA \u0DB4\u0DCF\u0DC3\u0DBD \u0D94\u0DB6 \u0D9A\u0DBB\u0DB1 \u0D9A\u0DCF\u0DBB\u0DCA\u0DBA \u0DAF\u0D9A\u0DD3. \u0DC3\u0DCA\u0DAD\u0DD6\u0DAD\u0DD2\u0DBA\u0DD2.', // pending native review
    ta: '\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BAA\u0BB3\u0BCD\u0BB3\u0BBF \u0BA8\u0BC0\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B9A\u0BC6\u0BAF\u0BCD\u0BAF\u0BC1\u0BAE\u0BCD \u0BB5\u0BC7\u0BB2\u0BC8\u0BAF\u0BC8 \u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BBF\u0BB1\u0BA4\u0BC1. \u0BA8\u0BA9\u0BCD\u0BB1\u0BBF.', // pending native review
  },
  sunlight: {
    en: 'You brought light to this school this week.',
    si: '\u0D94\u0DB6 \u0DB8\u0DDA \u0DC3\u0DAD\u0DD2\u0DBA \u0D94\u0DB6\u0DDA \u0DB4\u0DCF\u0DC3\u0DBD\u0DA7 \u0D86\u0DBD\u0DDD\u0D9A\u0DBA \u0D9C\u0DD9\u0DB1\u0D86.', // pending native review
    ta: '\u0B87\u0BA8\u0BCD\u0BA4 \u0BB5\u0BBE\u0BB0\u0BAE\u0BCD \u0BA8\u0BC0\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B87\u0BA8\u0BCD\u0BA4 \u0BAA\u0BB3\u0BCD\u0BB3\u0BBF\u0B95\u0BCD\u0B95\u0BC1 \u0B92\u0BB3\u0BBF \u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BC1 \u0BB5\u0BA8\u0BCD\u0BA4\u0BC0\u0BB0\u0BCD\u0B95\u0BB3\u0BCD.', // pending native review
  },
  seed: {
    en: 'What you planted here will grow long after this season.',
    si: '\u0D94\u0DB6 \u0DB8\u0DD9\u0DC4\u0DD2 \u0DBB\u0DDD\u0DB4\u0DAB\u0DBA \u0D9A\u0DC5 \u0DAF\u0DD9\u0DBA \u0DB8\u0DD9\u0DB8 \u0D9A\u0DCF\u0DBD\u0DBA\u0DD9\u0DB1\u0DCA \u0D94\u0DB6\u0DCA\u0DB6\u0DA7 \u0DC0\u0DD0\u0DA9\u0DD9\u0DB1\u0DD4 \u0D87\u0DAD.', // pending native review
    ta: '\u0BA8\u0BC0\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B87\u0B99\u0BCD\u0B95\u0BC7 \u0BA8\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 \u0B87\u0BA8\u0BCD\u0BA4 \u0BAA\u0BB0\u0BC1\u0BB5\u0B95\u0BBE\u0BB2\u0BA4\u0BCD\u0BA4\u0BBF\u0BB1\u0BCD\u0B95\u0BC1 \u0B85\u0BAA\u0BCD\u0BAA\u0BBE\u0BB2\u0BCD \u0BB5\u0BB3\u0BB0\u0BC1\u0BAE\u0BCD.', // pending native review
  },
};

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// TREE HEALTH COMPUTATION
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

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

  const lines = [];

  switch (weather) {
    case 'radiant':
      lines.push(
        `Your school forest is radiant this week \u2014 ${active} of ${total} trees are alive with activity.`,
      );
      break;
    case 'lush':
      lines.push(`The forest is lush and growing \u2014 most trees have been active.`);
      break;
    case 'steady':
      lines.push(`The forest is steady \u2014 ${active} trees are engaged, others at rest.`);
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
      `${needsRain} ${needsRain === 1 ? 'tree needs' : 'trees need'} some rain \u2014 a gentle check-in may help.`,
    );
  }
  if (hasThuthimal > 0) {
    lines.push(
      `${hasThuthimal} ${hasThuthimal === 1 ? 'lotus blooms' : 'lotus blooms'} permanently in this forest \u2014 a Thuthimal was given here.`,
    );
  }

  return lines.join(' ');
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// SCHOOL FOREST API
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export const schoolForestAPI = {
  /**
   * Get the full School Forest view for a principal.
   * Each teacher in the school is represented as a tree with health metadata.
   *
   * This reads from `school_forest_state` (computed/refreshed nightly) and
   * falls back to live `growth_events` computation if the table is empty.
   */
  async getForestOverview(schoolId: string): Promise<SchoolForestState> {
    const loggedInId = await identityAPI.getMyInternalId();
    const ability = composeUserAbilities({ userId: loggedInId, schoolId });

    if (!ability.can('read', 'SchoolForest')) {
      throw new APIError('Unauthorized to view school forest', 'FORBIDDEN');
    }

    const now = new Date();

    // Fetch pre-computed forest state
    const { data: forestRows } = await supabase
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
    const { data: teachers } = await supabase
      .from('users')
      .select('id')
      .eq('school_id', schoolId)
      .eq('role', 'teacher');

    if (!teachers || teachers.length === 0) {
      return {
        school_id: schoolId,
        trees: [],
        forest_weather: 'quiet',
        forest_narrative_en:
          'The forest is young \u2014 teachers are still finding their way here.',
        computed_at: now.toISOString(),
      };
    }

    const teacherIds: string[] = teachers.map((t: { id: string }) => t.id);

    // Batch query: growth events for ALL teachers in one request (avoids N+1)
    const { data: allSignals } = await supabase
      .from('growth_events')
      .select('user_id, dimension, created_at')
      .in('user_id', teacherIds)
      .gte('created_at', fourteenDaysAgo);

    // Batch query: growth state for ALL teachers in one request (avoids N+1)
    const { data: allGrowthStates } = await supabase
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
   * Get the School Pulse \u2014 aggregate wellbeing "weather" across the school.
   * The principal sees health expressed as atmosphere, not individual scores.
   */
  async getSchoolPulse(schoolId: string): Promise<SchoolPulse> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

    const { data: teachers } = await supabase
      .from('users')
      .select('id')
      .eq('school_id', schoolId)
      .eq('role', 'teacher');

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
    const { data: signalsByTeacher } = await supabase
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
          ? `About half the school has been engaged this week \u2014 steady and growing.`
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
   * Send a Gratitude Gift to a teacher \u2014 the principal's recognition ritual.
   * Creates a warm, private impact signal for the recipient.
   *
   * Gift types and their meaning:
   *   lantern  \u2014 "I see you. You light this place."
   *   rain     \u2014 "Thank you. Your school sees your work."
   *   sunlight \u2014 "You brought light here this week."
   *   seed     \u2014 "What you planted here will grow long after this season."
   */
  async sendGratitudeGift(
    principalUserId: string,
    recipientUserId: string,
    giftType: GiftType,
    personalMessage?: string,
    schoolId?: string,
  ): Promise<void> {
    if (principalUserId === recipientUserId) return;

    const loggedInId = await identityAPI.getMyInternalId();
    const ability = composeUserAbilities({ userId: loggedInId, schoolId });

    if (!ability.can('manage', 'SchoolForest')) {
      throw new APIError('Unauthorized to send gratitude gifts', 'FORBIDDEN');
    }

    const messages = GIFT_MESSAGES[giftType];

    try {
      await supabase.from('gratitude_gifts').insert({
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

    // Also create an Impact Ripple so it arrives through the normal delivery channel
    void impactRipplesAPI
      .createRipple({
        recipientUserId,
        actorUserId: principalUserId,
        rippleType: 'principal_recognition',
        sourceEntityType: 'gratitude_gift',
        sourceEntityId: undefined,
      })
      .catch(() => {});
  },

  /**
   * Get pending Gratitude Gifts for a teacher.
   * Called by the notification delivery system.
   */
  async getPendingGifts(recipientUserId: string): Promise<GratitudeGift[]> {
    const loggedInId = await identityAPI.getMyInternalId();
    if (loggedInId !== recipientUserId) {
      const ability = composeUserAbilities({ userId: loggedInId });
      if (!ability.can('manage', 'Staff')) {
        throw new APIError('Unauthorized to view others gifts', 'FORBIDDEN');
      }
    }
    const { data, error } = await supabase
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
      await supabase
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
