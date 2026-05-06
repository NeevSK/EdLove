/**
 * Contextual Challenges API \u2014 Generative, Opt-In, Collective.
 *
 * This module implements the "Contextual Competition" layer described in
 * docs/Core/GROWTH_MODEL.md Section 14 "The Contextual Competition Question."
 *
 * PHILOSOPHY:
 *   Real classrooms have real competition \u2014 and that is healthy. The question is
 *   whether we design competition that creates losers (extractive) or competition
 *   that creates growth (generative).
 *
 *   All challenges here are:
 *     - Collective (class or school as a whole, not individuals within it)
 *     - Personal best (users see their own trajectory, not a peer ranking)
 *     - Opt-in (the app offers; the user decides; there is no loss for declining)
 *     - Time-boxed (they end; the next one starts fresh)
 *     - Grounded in real impact (actual lessons, actual journal entries, actual care)
 *
 * THREE CHALLENGE TYPES:
 *   1. ClassCollectivePulse  \u2014 class-wide challenge (teacher + students together)
 *   2. SchoolSeasonChallenge \u2014 school-wide challenge (all teachers, principal visible)
 *   3. PersonalCompass       \u2014 individual opt-in, user-defined, private
 *
 * DESIGN BOUNDARIES (expressed through what this system does):
 *   - Progress is always collective or personal best \u2014 never individual comparative rankings
 *   - Challenges are opt-in; the app offers; the user decides; there is no loss for declining
 *   - Challenge metrics reflect real impact \u2014 lessons taught, care given, community built
 *   - Every challenge ends cleanly; the next one starts fresh with no accumulated shame
 *
 * See GROWTH_MODEL.md \u00A714 for the full doctrine and Duolingo analysis.
 */

import { getCurrentTimeMillis } from '../utils/temporal';
import { supabase } from './supabase';

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// TYPES
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

/** What kind of collective growth signal counts toward a challenge. */
export type ChallengeMetric =
  | 'library_resources_opened' // Students/teachers opening Library resources
  | 'joy_jar_entries' // Teacher wellbeing entries
  | 'assignments_submitted' // Students submitting assignments
  | 'community_posts' // Posts and discussions
  | 'reflections_written' // Reflective writing by students or teachers
  | 'lessons_completed' // Students completing lessons
  | 'attendance_recorded' // Teachers taking attendance
  | 'feedback_given'; // Assignments graded with written feedback

export type ChallengeType =
  | 'class_collective_pulse' // Type 1: Class-wide, teacher + students
  | 'school_season_challenge' // Type 2: School-wide, all teachers
  | 'personal_compass'; // Type 3: Individual, opt-in, private

export type ChallengeStatus =
  | 'active' // In progress \u2014 accepting contributions
  | 'completed' // Target reached \u2014 celebration time
  | 'expired' // Time window passed; not yet reached (no shame, just reset)
  | 'draft'; // Not yet started

export interface Challenge {
  id: string;
  type: ChallengeType;
  school_id: string | null;
  classroom_id: string | null;
  creator_user_id: string | null; // null for school/admin-created challenges
  title_en: string;
  description_en: string;
  metric: ChallengeMetric;
  target_count: number;
  current_count: number;
  status: ChallengeStatus;
  /** Nature metaphor for the progress visualization */
  nature_metaphor: 'river_rising' | 'forest_brightening' | 'lotus_opening' | 'crystal_growing';
  /** Collective celebration when the target is reached */
  completion_celebration_en: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalCompass {
  id: string;
  user_id: string;
  title_en: string; // User writes their own compass intention
  metric: ChallengeMetric;
  target_count: number;
  current_count: number;
  status: ChallengeStatus;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface ChallengeProgress {
  challenge_id: string;
  /** Fraction 0\u20131 */
  progress_fraction: number;
  /** Human-language description of current progress */
  progress_narrative_en: string;
  /** Whether the collective target has been reached */
  is_complete: boolean;
  /** Nature visualization state (maps to a visual in the UI) */
  nature_state: string;
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// PROGRESS NARRATIVE GENERATION
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

/**
 * Generate a warm, collective-focused progress narrative.
 * No individual is named. Progress is framed as shared momentum.
 */
function buildProgressNarrative(
  type: ChallengeType,
  metric: ChallengeMetric,
  current: number,
  target: number,
): string {
  const fraction = current / target;
  const remaining = target - current;

  const metricLabel: Record<ChallengeMetric, { singular: string; plural: string }> = {
    library_resources_opened: {
      singular: 'resource opened',
      plural: 'resources opened',
    },
    joy_jar_entries: { singular: 'Joy Jar entry', plural: 'Joy Jar entries' },
    assignments_submitted: {
      singular: 'assignment submitted',
      plural: 'assignments submitted',
    },
    community_posts: { singular: 'community post', plural: 'community posts' },
    reflections_written: {
      singular: 'reflection written',
      plural: 'reflections written',
    },
    lessons_completed: {
      singular: 'lesson completed',
      plural: 'lessons completed',
    },
    attendance_recorded: {
      singular: 'attendance taken',
      plural: 'attendances recorded',
    },
    feedback_given: {
      singular: 'piece of feedback given',
      plural: 'pieces of feedback given',
    },
  };

  const label = current === 1 ? metricLabel[metric].singular : metricLabel[metric].plural;

  if (fraction >= 1) {
    if (type === 'class_collective_pulse')
      return `Your class reached it together \u2014 ${current} ${label}. A river reaching the sea.`;
    if (type === 'school_season_challenge')
      return `Your school's forest is bright \u2014 ${current} ${label} this season.`;
    return `You reached your compass \u2014 ${current} ${label}. Well done.`;
  }

  if (fraction >= 0.75) {
    if (type === 'personal_compass')
      return `Almost there \u2014 ${current} ${label} so far. ${remaining} more to complete your compass.`;
    return `The momentum is strong \u2014 ${current} ${label} together. ${remaining} more to reach the collective goal.`;
  }

  if (fraction >= 0.4) {
    if (type === 'class_collective_pulse')
      return `Your class is flowing \u2014 ${current} ${label} together. The river is rising.`;
    if (type === 'school_season_challenge')
      return `The forest is brightening \u2014 ${current} ${label} across the school.`;
    return `You are on your way \u2014 ${current} ${label} so far.`;
  }

  if (fraction > 0) {
    if (type === 'class_collective_pulse')
      return `Your class has begun \u2014 ${current} ${label} together so far.`;
    if (type === 'school_season_challenge')
      return `The first growth is here \u2014 ${current} ${label} across the school.`;
    return `A beginning \u2014 ${current} ${label}. Every start matters.`;
  }

  return type === 'personal_compass'
    ? 'Your compass is set. The first step begins when you are ready.'
    : 'The challenge is open. Every contribution counts.';
}

function natureStateFromFraction(metaphor: Challenge['nature_metaphor'], fraction: number): string {
  if (fraction >= 1) return `${metaphor}_complete`;
  if (fraction >= 0.75) return `${metaphor}_near`;
  if (fraction >= 0.4) return `${metaphor}_growing`;
  if (fraction > 0) return `${metaphor}_beginning`;
  return `${metaphor}_ready`;
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// CONTEXTUAL CHALLENGES API
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export const contextualChallengesAPI = {
  // \u2500\u2500 TYPE 1: Class Collective Pulse \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  /**
   * Get the active Class Collective Pulse for a classroom.
   * Returns null if no challenge is currently active for this class.
   * Used by the Teacher's Classroom view and Student's home screen.
   */
  async getClassChallenge(classroomId: string): Promise<Challenge | null> {
    const { data } = await supabase
      .from('contextual_challenges')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('type', 'class_collective_pulse')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data as Challenge | null;
  },

  /**
   * Create a new Class Collective Pulse.
   * Called by teachers who opt in to start a class challenge.
   * The challenge is visible to all students in the class.
   */
  async createClassChallenge(
    classroomId: string,
    creatorUserId: string,
    schoolId: string,
    metric: ChallengeMetric,
    targetCount: number,
    titleEn: string,
    durationDays = 7,
  ): Promise<Challenge> {
    const nowMs = getCurrentTimeMillis();
    const now = new Date(nowMs);
    const endsAt = new Date(nowMs + durationDays * 86400000);

    const celebrationMessages: Record<ChallengeMetric, string> = {
      library_resources_opened:
        'Your class opened their minds together \u2014 the river reached the sea. \uD83C\uDF0A',
      joy_jar_entries: 'The whole class has been holding joy. The jar is full. \uD83C\uDF1F',
      assignments_submitted: 'Every student showed up. The harvest is complete. \uD83C\uDF3E',
      community_posts: 'Your class found their voices together. The circle is alive. \uD83C\uDF3F',
      reflections_written: 'Every voice was heard in this class. The garden grew. \uD83C\uDF38',
      lessons_completed:
        'The river flowed from first lesson to last. A class in full flow. \uD83C\uDF0A',
      attendance_recorded: 'Everyone was counted, every day. The forest is full. \uD83C\uDF33',
      feedback_given: 'Every student received care. The nourishing is complete. \uD83E\uDEB7',
    };

    const { data, error } = await supabase
      .from('contextual_challenges')
      .insert({
        type: 'class_collective_pulse',
        classroom_id: classroomId,
        school_id: schoolId,
        creator_user_id: creatorUserId,
        title_en: titleEn,
        description_en: `A collective challenge for your class: reach ${targetCount} ${metric.replace(/_/g, ' ')} together.`,
        metric,
        target_count: targetCount,
        current_count: 0,
        status: 'active',
        nature_metaphor: 'river_rising',
        completion_celebration_en: celebrationMessages[metric],
        starts_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create class challenge: ${error.message}`);
    return data as Challenge;
  },

  // \u2500\u2500 TYPE 2: School Season Challenge \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  /**
   * Get the active School Season Challenge for a school.
   * Used by the School Forest view (principal) and Teacher's home screen.
   */
  async getSchoolChallenge(schoolId: string): Promise<Challenge | null> {
    const { data } = await supabase
      .from('contextual_challenges')
      .select('*')
      .eq('school_id', schoolId)
      .eq('type', 'school_season_challenge')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data as Challenge | null;
  },

  /**
   * Create a School Season Challenge.
   * Called by principals who opt in to start a school-wide challenge.
   */
  async createSchoolChallenge(
    schoolId: string,
    principalUserId: string,
    metric: ChallengeMetric,
    targetCount: number,
    titleEn: string,
    durationDays = 30,
  ): Promise<Challenge> {
    const now = new Date();
    const endsAt = new Date(now.getTime() + durationDays * 86400000);

    const { data, error } = await supabase
      .from('contextual_challenges')
      .insert({
        type: 'school_season_challenge',
        classroom_id: null,
        school_id: schoolId,
        creator_user_id: principalUserId,
        title_en: titleEn,
        description_en: `A school-wide challenge for this season: ${targetCount} ${metric.replace(/_/g, ' ')} across all staff.`,
        metric,
        target_count: targetCount,
        current_count: 0,
        status: 'active',
        nature_metaphor: 'forest_brightening',
        completion_celebration_en: `Your school's forest reached full brightness this season. Every tree contributed. \uD83C\uDF32`,
        starts_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create school challenge: ${error.message}`);
    return data as Challenge;
  },

  // \u2500\u2500 TYPE 3: Personal Compass \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  /**
   * Get the user's active Personal Compass.
   * Returns null if the user has not set one, or has not opted in.
   */
  async getPersonalCompass(userId: string): Promise<PersonalCompass | null> {
    const { data } = await supabase
      .from('personal_compasses')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data as PersonalCompass | null;
  },

  /**
   * Set a Personal Compass intention.
   * The user defines their own challenge \u2014 the app does not assign one.
   * Expires any existing active compass for the same user.
   */
  async setPersonalCompass(
    userId: string,
    metric: ChallengeMetric,
    targetCount: number,
    titleEn: string,
    durationDays = 7,
  ): Promise<PersonalCompass> {
    try {
      // Expire any current active compass
      await supabase
        .from('personal_compasses')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('status', 'active');
    } catch (_e) {
      // ignore network errors
    }
    const now = new Date();
    const endsAt = new Date(now.getTime() + durationDays * 86400000);

    const { data, error } = await supabase
      .from('personal_compasses')
      .insert({
        user_id: userId,
        title_en: titleEn,
        metric,
        target_count: targetCount,
        current_count: 0,
        status: 'active',
        starts_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to set personal compass: ${error.message}`);
    return data as PersonalCompass;
  },

  /**
   * Clear (abandon) the user's Personal Compass.
   * No penalty. The compass simply goes away.
   */
  async clearPersonalCompass(userId: string): Promise<void> {
    try {
      await supabase
        .from('personal_compasses')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('status', 'active');
    } catch (err) {
      console.warn(
        '[Challenges] Failed to clear compass:',
        err instanceof Error ? err.message : String(err),
      );
    }
  },

  // \u2500\u2500 CONTRIBUTION + PROGRESS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  /**
   * Record a contribution to any active challenges for this user.
   * Called by growthSignals.emitSignal \u2014 fire-and-forget.
   *
   * Finds all active challenges where:
   *   - The metric matches the signal
   *   - The user belongs (classroom, school, or personal)
   * ...and increments their count.
   */
  async recordContribution(
    userId: string,
    metric: ChallengeMetric,
    classroomId?: string,
    schoolId?: string,
  ): Promise<void> {
    const updates: Promise<void>[] = [];

    // Check class challenge \u2014 fetch current count, then increment
    if (classroomId) {
      updates.push(
        (async () => {
          const { data } = await supabase
            .from('contextual_challenges')
            .select('id, current_count, target_count')
            .eq('classroom_id', classroomId)
            .eq('metric', metric)
            .eq('status', 'active')
            .maybeSingle();

          if (!data) return;
          const newCount = (data.current_count ?? 0) + 1;
          const isComplete = newCount >= data.target_count;
          const { error } = await supabase
            .from('contextual_challenges')
            .update({
              current_count: newCount,
              status: isComplete ? 'completed' : 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.id);

          if (error) console.warn('[Challenges] Class count update failed:', error.message);
        })(),
      );
    }

    // Check school challenge \u2014 fetch current count, then increment
    if (schoolId) {
      updates.push(
        (async () => {
          const { data } = await supabase
            .from('contextual_challenges')
            .select('id, current_count, target_count')
            .eq('school_id', schoolId)
            .eq('type', 'school_season_challenge')
            .eq('metric', metric)
            .eq('status', 'active')
            .maybeSingle();

          if (!data) return;
          const newCount = (data.current_count ?? 0) + 1;
          const isComplete = newCount >= data.target_count;
          const { error } = await supabase
            .from('contextual_challenges')
            .update({
              current_count: newCount,
              status: isComplete ? 'completed' : 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.id);

          if (error) console.warn('[Challenges] School count update failed:', error.message);
        })(),
      );
    }

    // Check personal compass
    updates.push(
      (async () => {
        const { data } = await supabase
          .from('personal_compasses')
          .select('id, current_count, target_count')
          .eq('user_id', userId)
          .eq('metric', metric)
          .eq('status', 'active')
          .maybeSingle();

        if (!data) return;
        const newCount = (data.current_count ?? 0) + 1;
        const isComplete = newCount >= data.target_count;
        try {
          const { error } = await supabase
            .from('personal_compasses')
            .update({
              current_count: newCount,
              status: isComplete ? 'completed' : 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.id);

          if (error) console.warn('[Challenges] Personal compass update failed:', error.message);
        } catch (err) {
          console.warn(
            '[Challenges] Personal compass update failed:',
            err instanceof Error ? err.message : String(err),
          );
        }
      })(),
    );

    await Promise.allSettled(updates);
  },

  /**
   * Get the current progress for a challenge.
   * Returns a ChallengeProgress with narrative and nature state.
   */
  getProgress(challenge: Challenge): ChallengeProgress {
    const fraction =
      challenge.target_count > 0
        ? Math.min(challenge.current_count / challenge.target_count, 1)
        : 0;

    return {
      challenge_id: challenge.id,
      progress_fraction: Math.round(fraction * 100) / 100,
      progress_narrative_en: buildProgressNarrative(
        challenge.type,
        challenge.metric,
        challenge.current_count,
        challenge.target_count,
      ),
      is_complete: challenge.current_count >= challenge.target_count,
      nature_state: natureStateFromFraction(challenge.nature_metaphor, fraction),
    };
  },

  /**
   * Get progress for a Personal Compass.
   */
  getCompassProgress(compass: PersonalCompass): {
    progress_fraction: number;
    narrative_en: string;
    is_complete: boolean;
  } {
    const fraction =
      compass.target_count > 0 ? Math.min(compass.current_count / compass.target_count, 1) : 0;
    return {
      progress_fraction: Math.round(fraction * 100) / 100,
      narrative_en: buildProgressNarrative(
        'personal_compass',
        compass.metric,
        compass.current_count,
        compass.target_count,
      ),
      is_complete: compass.current_count >= compass.target_count,
    };
  },

  /**
   * Get all recently completed challenges for a classroom or school (past 30 days).
   * Used to show collective celebration history.
   */
  async getRecentCompletions(schoolId: string, classroomId?: string): Promise<Challenge[]> {
    const now = getCurrentTimeMillis();
    const thirtyDaysAgo = new Date(now - 30 * 86400000).toISOString();

    const query = supabase
      .from('contextual_challenges')
      .select('*')
      .eq('school_id', schoolId)
      .eq('status', 'completed')
      .gte('updated_at', thirtyDaysAgo)
      .order('updated_at', { ascending: false });

    if (classroomId) {
      query.eq('classroom_id', classroomId);
    }

    const { data } = await query;
    return (data ?? []) as Challenge[];
  },
};
