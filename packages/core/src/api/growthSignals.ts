/**
 * Growth Signals API \u2014 the complete wiring layer of the Bhumi Growth Model.
 *
 * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 * THE PRESENCE INFERENCE MODEL: Work as Witness
 * (see docs/Core/GROWTH_MODEL.md v2.0 \u2014 Section 3, Dimension 1)
 * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 *
 * We do not ask teachers "were you present today?"
 * We observe the natural residue of their work.
 *
 * Signal tiers (from highest to lowest confidence of presence):
 *   Tier 1 \u2014 Work Signals: attendance_recorded, assignment_graded,
 *             lesson_material_created, assignment_created
 *             \u2192 Teacher was actively doing their job.
 *   Tier 2 \u2014 Care Signals: mood_checkin, fire_journal_entry,
 *             breathing_exercise_complete
 *             \u2192 Teacher chose to prioritise their own wellbeing.
 *   Tier 3 \u2014 Context Signals: app_opened (with section metadata)
 *             \u2192 Teacher was in the app thinking about their work.
 *
 * All three tiers contribute to the Presence dimension.
 * None require any extra action from the teacher beyond their normal work.
 *
 * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 * USAGE
 * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 *
 * After any meaningful user action, call fire-and-forget:
 *   void growthSignalsAPI.emitSignal(userId, 'mood_checkin').catch(() => {});
 *
 * Rules:
 *   \u2705 Always call AFTER the primary operation succeeds.
 *   \u2705 Always fire-and-forget \u2014 the primary action completes first; the signal follows silently.
 *   \u2705 Growth signal errors are silently absorbed \u2014 the primary feature always succeeds independently.
 *   \u2705 Signal counts and event types are internal to the growth system \u2014 expressed only through the lotus visual.
 *   \u2705 The primary feature succeeds on its own terms; growth observation rides alongside it.
 */

import { supabase } from '../lib/supabase';
import { type ChallengeMetric, contextualChallengesAPI } from './contextualChallenges';
import { naturePathsAPI } from './naturePaths';
import { userGrowthStateAPI } from './userGrowthState';

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// TYPES
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

import { GROWTH_SIGNAL_MAP, type GrowthSignalType } from './growthSignals.generated';

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// SIGNAL \u2192 CHALLENGE METRIC MAP
// Maps growth signal types to the ChallengeMetric that they contribute to.
// Used by emitSignal to wire challenge progress automatically.
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const SIGNAL_TO_CHALLENGE_METRIC: Partial<Record<GrowthSignalType, ChallengeMetric>> = {
  resource_read: 'library_resources_opened',
  wisdom_seed_read: 'library_resources_opened',
  joy_jar_entry: 'joy_jar_entries',
  reflection_submitted: 'reflections_written',
  reflection_written: 'reflections_written',
  lesson_completed: 'lessons_completed',
  attendance_recorded: 'attendance_recorded',
  assignment_graded: 'feedback_given',
  community_post_created: 'community_posts',
  group_message_sent: 'community_posts',
};

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// SIGNALS THAT ADVANCE NATURE PATHS (in addition to Bhumi)
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

/** Signals that also advance the Banyan path (teacher mentorship/ecosystem dimension). */
const BANYAN_SIGNALS = new Set<GrowthSignalType>([
  'peer_mentored',
  'circle_facilitated',
  'resource_gifted',
  'colleague_helped',
]);

/** Signals that also advance the River path (student learning flow). */
const RIVER_SIGNALS = new Set<GrowthSignalType>([
  'lesson_completed',
  'deep_study_session',
  'reflection_submitted',
  'knowledge_connected',
  'resource_read',
]);

/** Signals that also advance the Crystal path (student discoveries). */
const CRYSTAL_SIGNALS = new Set<GrowthSignalType>([
  'crystal_found',
  'fractal_moment',
  'knowledge_connected',
]);

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// WHISPERED MOMENT DEFINITIONS
// (See GROWTH_MODEL.md Section 4 for full catalog and design specification.)
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

type WhisperedMomentKey =
  | 'still_water' // 5 mood check-ins (any mood, no pressure)
  | 'storm_holder' // Fire journal 3+ times in one week
  | 'first_offering' // First lesson material or resource shared
  | 'caring_teacher' // 10+ assignments graded (proxy for consistent feedback)
  | 'the_seeker' // All main app sections explored in first week
  | 'first_branch' // First time a teacher helps a colleague (Banyan awakens)
  | 'the_companion' // Teacher mentored 3+ colleagues (the Banyan is real now)
  | 'river_meets_sea' // Student reaches delta stage (learning flowing outward)
  | 'fractal_vision'; // Student's first cross-domain connection (the Fractal Moment)

interface WhisperedMomentSpec {
  key: WhisperedMomentKey;
  name_si: string; // Sinhala name (pending native educator review)
  name_en: string;
  triggerSignals: GrowthSignalType[];
}

const WHISPERED_MOMENT_SPECS: WhisperedMomentSpec[] = [
  {
    key: 'still_water',
    name_si: '\u0DB1\u0DD2\u0DC1\u0DCA\u0DA0\u0DBD \u0DAF\u0DD2\u0DBA',
    name_en: 'Still Water',
    triggerSignals: ['mood_checkin'],
  },
  {
    key: 'storm_holder',
    name_si:
      '\u0D9A\u0DD4\u0DC5\u0DD4 \u0D9C\u0DD9\u0DB1 \u0DC3\u0DD2\u0DA7\u0DD2\u0DB1\u0DCA\u0DB1\u0DCF',
    name_en: 'Storm Holder',
    triggerSignals: ['fire_journal_entry'],
  },
  {
    key: 'first_offering',
    name_si: '\u0DB4\u0DCA\u200D\u0DBB\u0DAE\u0DB8 \u0DAF\u0DCF\u0DB1\u0DBA',
    name_en: 'First Offering',
    triggerSignals: ['lesson_material_created', 'resource_uploaded'],
  },
  {
    key: 'caring_teacher',
    name_si:
      '\u0DC3\u0DD0\u0DBD\u0D9A\u0DD2\u0DBD\u0DD2\u0DB8\u0DAD\u0DCA \u0D9C\u0DD4\u0DBB\u0DD4\u0DC0\u0DBB\u0DD2\u0DBA',
    name_en: 'The Caring Teacher',
    triggerSignals: ['assignment_graded'],
  },
  {
    key: 'the_seeker',
    name_si: '\u0DC3\u0DDC\u0DBA\u0DB1\u0DCA\u0DB1\u0DCF',
    name_en: 'The Seeker',
    triggerSignals: ['app_opened'],
  },
  // Banyan Path moments
  {
    key: 'first_branch',
    name_si: '\u0DB4\u0DC5\u0DB8\u0DD4 \u0D85\u0DAD\u0DD4', // pending native review
    name_en: 'First Branch',
    triggerSignals: ['peer_mentored', 'circle_facilitated', 'resource_gifted'],
  },
  {
    key: 'the_companion',
    name_si: '\u0DC3\u0DC4\u0D9A\u0DBB\u0DD4 \u0D9C\u0DD4\u0DBB\u0DD4\u0DC0\u0DBB\u0DBA\u0DCF', // pending native review
    name_en: 'The Companion',
    triggerSignals: ['peer_mentored', 'circle_facilitated'],
  },
  // River/Crystal Path moments (student-specific)
  {
    key: 'river_meets_sea',
    name_si:
      '\u0D9C\u0D82\u0D9C\u0DCF\u0DC0 \u0DB8\u0DD4\u0DC4\u0DD4\u0DAF\u0DA7 \u0DC4\u0DB8\u0DD4 \u0DC0\u0DDA', // pending native review
    name_en: 'River Meets Sea',
    triggerSignals: ['reflection_submitted', 'knowledge_connected'],
  },
  {
    key: 'fractal_vision',
    name_si: '\u0DB7\u0DCF\u0D9C\u0DD2\u0D9A \u0DAF\u0DD8\u0DC2\u0DCA\u0DA7\u0DD2\u0DBA', // pending native review
    name_en: 'Fractal Vision',
    triggerSignals: ['fractal_moment', 'knowledge_connected'],
  },
];

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// GROWTH SIGNALS API
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export const growthSignalsAPI = {
  /**
   * Emit a growth signal for a user.
   *
   * This is the single call site for wiring growth signals into existing APIs.
   * Every call:
   *   1. Writes a `growth_events` record (internal analytics \u2014 expressed through the lotus visual, not as raw data)
   *   2. Increments the user's dimension counter in `user_growth_state`
   *   3. Checks and awards any triggered Whispered Moments
   *   4. Checks and advances the user's Bhumi stage if criteria are met
   *   5. Advances any relevant nature path (Banyan / River / Crystal) based on signal type
   *   6. Records contribution toward any active Contextual Challenges (class / school / personal compass)
   *
   * @param userId     The user performing the action.
   * @param signalType Semantic type of the signal (see GrowthSignalType).
   * @param metadata   Optional context stored in event_metadata (entity IDs, section names, etc.)
   *                   Never surfaced to the user \u2014 analytics only.
   */
  async emitSignal(input: {
    user_id: string;
    event_type: GrowthSignalType;
    event_metadata?: Record<string, unknown>;
  }): Promise<void> {
    const { user_id: userId, event_type: signalType, event_metadata: metadata = {} } = input;
    const dimension = GROWTH_SIGNAL_MAP[signalType];

    // 1. Record the growth event (internal analytics \u2014 feeds the lotus, stays out of the teacher's hands)
    const { error: eventError } = await supabase.from('growth_events').insert({
      user_id: userId,
      dimension,
      event_type: signalType,
      event_metadata: metadata,
    });

    if (eventError) {
      // Non-fatal \u2014 log only; growth observations absorb their own errors
      console.warn('[GrowthSignals] Failed to record event:', eventError.message);
      return;
    }

    // 2. Increment the dimension counter + check Bhumi stage transition
    await userGrowthStateAPI.incrementDimension(userId, dimension).catch(() => {});

    // 3. Check for Whispered Moments triggered by this signal type
    await checkWhisperedMoments(userId, signalType).catch(() => {});

    // 4. Advance nature path if this signal is relevant to Banyan / River / Crystal
    if (BANYAN_SIGNALS.has(signalType)) {
      const state = await userGrowthStateAPI.getFullState(userId).catch(() => null);
      if (state) {
        void naturePathsAPI
          .advanceBanyan(userId, {
            banyan_stage: (state.banyan_stage as any) ?? 'sapling',
            peer_mentored_count: state.peer_mentored_count ?? 0,
            circles_facilitated_count: state.circles_facilitated_count ?? 0,
            blooming_signals: state.blooming_signals ?? 0,
          })
          .catch(() => {});
      }
    } else if (RIVER_SIGNALS.has(signalType)) {
      const state = await userGrowthStateAPI.getFullState(userId).catch(() => null);
      if (state) {
        void naturePathsAPI
          .advanceRiver(userId, {
            river_stage: (state.river_stage as any) ?? 'trickle',
            lessons_completed_count: state.lessons_completed_count ?? 0,
            reflections_submitted_count: state.reflections_submitted_count ?? 0,
            weaving_signals: state.weaving_signals ?? 0,
          })
          .catch(() => {});
      }
    }
    if (CRYSTAL_SIGNALS.has(signalType)) {
      const isFractal = signalType === 'fractal_moment';
      const subjectArea =
        (metadata.subject_area as string | undefined) ??
        (metadata.section as string | undefined) ??
        'general';
      void naturePathsAPI
        .recordCrystalDiscovery(
          userId,
          isFractal ? 'fractal_crystal' : 'subject_crystal',
          [subjectArea],
          isFractal ? 'A Fractal Moment' : 'A New Discovery',
          isFractal
            ? 'You connected ideas across domains \u2014 the crystal found its fractal.'
            : 'Something clicked \u2014 a new crystal formed in your collection.',
          isFractal,
          metadata.entity_id as string | undefined,
        )
        .catch(() => {});
    }

    // 5. Record contribution toward any active Contextual Challenges
    const challengeMetric = SIGNAL_TO_CHALLENGE_METRIC[signalType];
    if (challengeMetric) {
      void contextualChallengesAPI
        .recordContribution(
          userId,
          challengeMetric,
          metadata.classroom_id as string | undefined,
          metadata.school_id as string | undefined,
        )
        .catch(() => {});
    }
  },

  /**
   * Fire-and-forget convenience wrapper around `emitSignal`.
   *
   * Use this in existing API methods instead of the verbose pattern:
   *   void growthSignalsAPI.emitSignal({ user_id, event_type, event_metadata }).catch(() => {});
   *
   * Equivalent shorter form:
   *   growthSignalsAPI.emitSilent({ user_id, event_type, event_metadata });
   *
   * The primary operation always completes first; this call follows silently.
   */
  emitSilent(input: {
    user_id: string;
    event_type: GrowthSignalType;
    event_metadata?: Record<string, unknown>;
  }): void {
    void this.emitSignal(input).catch(() => {});
  },
};

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// INTERNAL: Whispered Moment evaluation
// (Private \u2014 not exported. Only triggered from within emitSignal.)
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

async function checkWhisperedMoments(userId: string, signalType: GrowthSignalType): Promise<void> {
  const relevantMoments = WHISPERED_MOMENT_SPECS.filter((m) =>
    m.triggerSignals.includes(signalType),
  );
  if (relevantMoments.length === 0) return;

  // Batch-fetch already-experienced moments so we avoid one SELECT per moment key
  const momentKeys = relevantMoments.map((m) => m.key);
  const { data: existingRows } = await supabase
    .from('whispered_moments')
    .select('moment_key')
    .eq('user_id', userId)
    .in('moment_key', momentKeys);

  const alreadyExperienced = new Set((existingRows ?? []).map((r) => r.moment_key));

  // Evaluate conditions for all not-yet-experienced moments in parallel
  const candidateMoments = relevantMoments.filter((m) => !alreadyExperienced.has(m.key));
  const results = await Promise.all(
    candidateMoments.map(async (m) => ({
      moment: m,
      met: await evaluateMomentCondition(userId, m.key).catch(() => false),
    })),
  );

  const metMoments = results.filter((r) => r.met).map((r) => r.moment);
  if (metMoments.length === 0) return;

  // Batch-insert all newly earned whispered moments in a single round-trip.
  // ON CONFLICT DO NOTHING guards against duplicate-key races.
  await supabase.from('whispered_moments').upsert(
    metMoments.map((m) => ({
      user_id: userId,
      moment_key: m.key,
      moment_name_si: m.name_si,
      moment_name_en: m.name_en,
    })),
    { onConflict: 'user_id,moment_key', ignoreDuplicates: true },
  );
}

async function evaluateMomentCondition(
  userId: string,
  momentKey: WhisperedMomentKey,
): Promise<boolean> {
  switch (momentKey) {
    case 'still_water': {
      // Any 5 mood check-ins \u2014 any mood, no pressure
      const { count } = await supabase
        .from('growth_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('event_type', 'mood_checkin');
      return (count ?? 0) >= 5;
    }

    case 'storm_holder': {
      // 3+ fire journal entries within any 7-day window
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('growth_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('event_type', 'fire_journal_entry')
        .gte('created_at', sevenDaysAgo);
      return (count ?? 0) >= 3;
    }

    case 'first_offering': {
      // At least one lesson material or resource created
      const { count } = await supabase
        .from('growth_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('event_type', ['lesson_material_created', 'resource_uploaded']);
      return (count ?? 0) >= 1;
    }

    case 'caring_teacher': {
      // 10+ assignments graded (sustained engagement with students' work)
      const { count } = await supabase
        .from('growth_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('event_type', 'assignment_graded');
      return (count ?? 0) >= 10;
    }

    case 'the_seeker': {
      // Explored all four main sections: community, library, self, classroom
      const { data } = await supabase
        .from('growth_events')
        .select('event_metadata')
        .eq('user_id', userId)
        .eq('event_type', 'app_opened');

      const visitedSections = new Set<string>(
        (data ?? [])
          .map((e) => (e.event_metadata as Record<string, unknown>)?.section as string)
          .filter(Boolean),
      );

      return (
        visitedSections.has('community') &&
        visitedSections.has('library') &&
        visitedSections.has('self') &&
        visitedSections.has('classroom')
      );
    }

    case 'first_branch': {
      // First time helping a colleague \u2014 the banyan's first branch reaches out
      const { count } = await supabase
        .from('growth_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('event_type', ['peer_mentored', 'circle_facilitated', 'resource_gifted']);
      return (count ?? 0) >= 1;
    }

    case 'the_companion': {
      // 3+ peer mentoring interactions \u2014 the banyan is real
      const { count } = await supabase
        .from('growth_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('event_type', ['peer_mentored', 'circle_facilitated']);
      return (count ?? 0) >= 3;
    }

    case 'river_meets_sea': {
      // 5+ reflections submitted \u2014 the river is flowing with depth and direction
      const { count } = await supabase
        .from('growth_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('event_type', ['reflection_submitted', 'knowledge_connected']);
      return (count ?? 0) >= 5;
    }

    case 'fractal_vision': {
      // First fractal moment \u2014 a cross-domain connection recognized
      const { count } = await supabase
        .from('growth_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('event_type', ['fractal_moment', 'knowledge_connected']);
      return (count ?? 0) >= 1;
    }
  }
}
