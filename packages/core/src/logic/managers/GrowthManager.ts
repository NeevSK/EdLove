import { Effect } from 'effect';
import { GROWTH_SIGNAL_MAP, type GrowthSignalType } from '../../api/growthSignals.generated';
import type {
  BanyanStage,
  BhumiStage,
  Challenge,
  ChallengeMetric,
  ChallengeProgress,
  ChallengeType,
  CreateRippleInput,
  CrystalDiscovery,
  CrystalTier,
  ManifestoVibe,
  PersonalCompass,
  RiverStage,
  UserGrowthState,
} from '../../types/Growth';
import type { IGrowthPort } from '../ports/growth.port';

export * from '../../types/Growth';

const SIGNAL_TO_CHALLENGE_METRIC: Partial<Record<GrowthSignalType, any>> = {
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

const BANYAN_SIGNALS = new Set<GrowthSignalType>([
  'peer_mentored',
  'circle_facilitated',
  'resource_gifted',
  'colleague_helped',
]);
const RIVER_SIGNALS = new Set<GrowthSignalType>([
  'lesson_completed',
  'deep_study_session',
  'reflection_submitted',
  'knowledge_connected',
  'resource_read',
]);
const _CRYSTAL_SIGNALS = new Set<GrowthSignalType>([
  'crystal_found',
  'fractal_moment',
  'knowledge_connected',
]);

type WhisperedMomentKey =
  | 'still_water'
  | 'storm_holder'
  | 'first_offering'
  | 'caring_teacher'
  | 'the_seeker'
  | 'first_branch'
  | 'the_companion'
  | 'river_meets_sea'
  | 'fractal_vision';

interface WhisperedMomentSpec {
  key: WhisperedMomentKey;
  name_si: string;
  name_en: string;
  triggerSignals: GrowthSignalType[];
}

const WHISPERED_MOMENT_SPECS: WhisperedMomentSpec[] = [
  {
    key: 'still_water',
    name_si: 'නිශ්චල දිය',
    name_en: 'Still Water',
    triggerSignals: ['mood_checkin'],
  },
  {
    key: 'storm_holder',
    name_si: 'කුළු ගෙන සිටින්නා',
    name_en: 'Storm Holder',
    triggerSignals: ['fire_journal_entry'],
  },
  {
    key: 'first_offering',
    name_si: 'ප්‍රථම දානය',
    name_en: 'First Offering',
    triggerSignals: ['lesson_material_created', 'resource_uploaded'],
  },
  {
    key: 'caring_teacher',
    name_si: 'සැලකිලිමත් ගුරුවරිය',
    name_en: 'The Caring Teacher',
    triggerSignals: ['assignment_graded'],
  },
  { key: 'the_seeker', name_si: 'සොයන්නා', name_en: 'The Seeker', triggerSignals: ['app_opened'] },
  {
    key: 'first_branch',
    name_si: 'පළමු අතු',
    name_en: 'First Branch',
    triggerSignals: ['peer_mentored', 'circle_facilitated', 'resource_gifted'],
  },
  {
    key: 'the_companion',
    name_si: 'සහකරු ගුරුවරයා',
    name_en: 'The Companion',
    triggerSignals: ['peer_mentored', 'circle_facilitated'],
  },
  {
    key: 'river_meets_sea',
    name_si: 'ගංගාව මුහුදට හමු වේ',
    name_en: 'River Meets Sea',
    triggerSignals: ['reflection_submitted', 'knowledge_connected'],
  },
  {
    key: 'fractal_vision',
    name_si: 'භාගික දෘෂ්ටිය',
    name_en: 'Fractal Vision',
    triggerSignals: ['fractal_moment', 'knowledge_connected'],
  },
];

function fireAndForget<T>(fn: () => Promise<T>, label: string): Effect.Effect<void, never, never> {
  return Effect.forkDaemon(
    Effect.promise(fn).pipe(
      Effect.catchAll((e) => Effect.logError(`[GrowthManager] ${label} failed`, e)),
      Effect.asVoid,
    ),
  ).pipe(Effect.asVoid);
}

export class GrowthManager {
  constructor(private growthPort: IGrowthPort) {}

  emitSilent(input: {
    user_id: string;
    event_type: GrowthSignalType;
    event_metadata?: Record<string, unknown>;
  }): void {
    Effect.runFork(
      Effect.promise(() => this.emitSignal(input)).pipe(
        Effect.catchAll((e) => Effect.logError('[GrowthManager] emitSilent failed', e)),
      ),
    );
  }

  async emitSignal(input: {
    user_id: string;
    event_type: GrowthSignalType;
    event_metadata?: Record<string, unknown>;
  }): Promise<void> {
    const { user_id: userId, event_type: signalType, event_metadata: metadata = {} } = input;
    const dimension = GROWTH_SIGNAL_MAP[signalType];
    const self = this;

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () => self.growthPort.recordEvent({ user_id: userId, dimension, event_type: signalType, event_metadata: metadata }),
          catch: (e) => e,
        }).pipe(
          Effect.catchAll((e) => {
            console.warn('[GrowthManager] Failed to record event', e);
            return Effect.void;
          }),
        );

        yield* fireAndForget(
          () => self.growthPort.incrementDimension(userId, `${dimension}_signals`),
          'incrementDimension',
        );

        yield* fireAndForget(
          () => self.checkWhisperedMoments(userId, signalType),
          'checkWhisperedMoments',
        );

        yield* fireAndForget(
          () => self.advancePaths(userId, signalType, metadata),
          'advancePaths',
        );

        const metric = SIGNAL_TO_CHALLENGE_METRIC[signalType];
        if (metric) {
          yield* fireAndForget(
            () => self.recordChallengeContribution(userId, metric, metadata),
            'recordChallengeContribution',
          );
        }
      }),
    );
  }

  private async checkWhisperedMoments(userId: string, signalType: GrowthSignalType) {
    const candidateSpecs = WHISPERED_MOMENT_SPECS.filter((s) =>
      s.triggerSignals.includes(signalType),
    );
    if (candidateSpecs.length === 0) return;

    const candidateKeys = candidateSpecs.map((s) => s.key);
    const experiencedKeys = await this.growthPort.getExperiencedMomentKeys(userId, candidateKeys);

    const remainingCandidates = candidateSpecs.filter((s) => !experiencedKeys.includes(s.key));

    const metResults = await Promise.all(
      remainingCandidates.map(async (spec) => ({
        spec,
        met: await this.evaluateCondition(userId, spec.key),
      })),
    );

    const newlyMet = metResults.filter((r) => r.met).map((r) => r.spec);
    if (newlyMet.length > 0) {
      await this.growthPort.awardMoments(userId, newlyMet);
    }
  }

  private async evaluateCondition(userId: string, key: WhisperedMomentKey): Promise<boolean> {
    switch (key) {
      case 'still_water':
        return (await this.growthPort.countEvents(userId, ['mood_checkin'])) >= 5;
      case 'storm_holder': {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        return (
          (await this.growthPort.countEvents(userId, ['fire_journal_entry'], {
            since: sevenDaysAgo,
          })) >= 3
        );
      }
      case 'first_offering':
        return (
          (await this.growthPort.countEvents(userId, [
            'lesson_material_created',
            'resource_uploaded',
          ])) >= 1
        );
      case 'caring_teacher':
        return (await this.growthPort.countEvents(userId, ['assignment_graded'])) >= 10;
      case 'the_seeker': {
        const data = await this.growthPort.getEventMetadata(userId, 'app_opened');
        const sections = new Set(data.map((m: any) => m.section).filter(Boolean));
        return ['community', 'library', 'self', 'classroom'].every((s) => sections.has(s));
      }
      case 'first_branch':
        return (
          (await this.growthPort.countEvents(userId, [
            'peer_mentored',
            'circle_facilitated',
            'resource_gifted',
          ])) >= 1
        );
      case 'the_companion':
        return (
          (await this.growthPort.countEvents(userId, ['peer_mentored', 'circle_facilitated'])) >= 3
        );
      case 'river_meets_sea':
        return (
          (await this.growthPort.countEvents(userId, [
            'reflection_submitted',
            'knowledge_connected',
          ])) >= 5
        );
      case 'fractal_vision':
        return (
          (await this.growthPort.countEvents(userId, ['fractal_moment', 'knowledge_connected'])) >=
          1
        );
      default:
        return false;
    }
  }

  private async advancePaths(
    userId: string,
    signalType: GrowthSignalType,
    metadata: Record<string, any>,
  ) {
    const state = await this.growthPort.getGrowthState(userId);
    if (!state) return;

    const updates: Partial<UserGrowthState> = {};

    const nextBhumi = this.evaluateBhumiTransition(state.bhumi_stage, state);
    if (nextBhumi) updates.bhumi_stage = nextBhumi;

    if (BANYAN_SIGNALS.has(signalType)) {
      if (signalType === 'peer_mentored')
        updates.peer_mentored_count = (state.peer_mentored_count || 0) + 1;
      if (signalType === 'circle_facilitated')
        updates.circles_facilitated_count = (state.circles_facilitated_count || 0) + 1;

      const nextBanyan = this.evaluateBanyanTransition(state.banyan_stage, state);
      if (nextBanyan) updates.banyan_stage = nextBanyan;
    }

    if (RIVER_SIGNALS.has(signalType)) {
      if (signalType === 'lesson_completed')
        updates.lessons_completed_count = (state.lessons_completed_count || 0) + 1;
      if (signalType === 'reflection_submitted')
        updates.reflections_submitted_count = (state.reflections_submitted_count || 0) + 1;

      const nextRiver = this.evaluateRiverTransition(state.river_stage, state);
      if (nextRiver) updates.river_stage = nextRiver;
    }

    if (signalType === 'crystal_found' || signalType === 'fractal_moment') {
      const isFractal = signalType === 'fractal_moment';

      if (signalType === 'crystal_found') {
        updates.crystals_found_count = (state.crystals_found_count || 0) + 1;
      }
      if (isFractal) {
        updates.fractal_moments_count = (state.fractal_moments_count || 0) + 1;
      }

      Effect.runFork(
        Effect.promise(() =>
          this.growthPort.recordCrystalDiscovery({
            user_id: userId,
            crystal_type:
              (metadata.crystal_type as 'subject_crystal' | 'connection_crystal' | 'deep_crystal' | 'fractal_crystal') || (isFractal ? 'fractal_crystal' : 'subject_crystal'),
            subject_tags: (metadata.subject_tags as string[]) || [],
            crystal_name_en:
              (metadata.name_en as string) || (isFractal ? 'Fractal Connection' : 'Knowledge Crystal'),
            crystal_description_en: (metadata.description_en as string) || null,
            is_fractal_moment: isFractal,
            source_entity_id: (metadata.source_entity_id as string) || null,
          }),
        ).pipe(
          Effect.catchAll((e) => Effect.logError('[GrowthManager] recordCrystalDiscovery failed', e)),
        ),
      );

      const nextCrystal = this.evaluateCrystalTransition(state.crystal_tier, {
        ...state,
        crystals_found_count: updates.crystals_found_count ?? state.crystals_found_count,
        fractal_moments_count: updates.fractal_moments_count ?? state.fractal_moments_count,
      });
      if (nextCrystal) updates.crystal_tier = nextCrystal;
    }

    if (Object.keys(updates).length > 0) {
      await this.growthPort.updateGrowthState(userId, updates);
    }
  }

  private evaluateBhumiTransition(current: BhumiStage, state: UserGrowthState): BhumiStage | null {
    switch (current) {
      case 'bijam':
        return state.presence_signals >= 1 ? 'mula' : null;
      case 'mula':
        return state.presence_signals >= 5 &&
          state.nourishing_signals + state.witnessing_signals + state.weaving_signals >= 1
          ? 'nala'
          : null;
      case 'nala':
        return state.weaving_signals >= 1 || state.nourishing_signals >= 1 ? 'patra' : null;
      case 'patra': {
        const activeDimensions = [
          state.presence_signals,
          state.nourishing_signals,
          state.witnessing_signals,
          state.weaving_signals,
          state.blooming_signals,
        ].filter((c) => c >= 5).length;
        return activeDimensions >= 3 ? 'kamala' : null;
      }
      case 'kamala': {
        const deepDimensions = [
          state.presence_signals,
          state.nourishing_signals,
          state.witnessing_signals,
          state.weaving_signals,
          state.blooming_signals,
        ].filter((c) => c >= 20).length;
        return deepDimensions >= 4 ? 'purna_kamala' : null;
      }
      default:
        return null;
    }
  }

  private evaluateBanyanTransition(
    current: BanyanStage,
    state: UserGrowthState,
  ): BanyanStage | null {
    switch (current) {
      case 'sapling':
        return state.peer_mentored_count >= 1 ? 'roots_spreading' : null;
      case 'roots_spreading':
        return state.peer_mentored_count >= 3 ? 'canopy' : null;
      case 'canopy':
        return state.circles_facilitated_count >= 1 && state.blooming_signals >= 1
          ? 'shade_giver'
          : null;
      case 'shade_giver':
        return state.peer_mentored_count >= 5 && state.circles_facilitated_count >= 3
          ? 'forest_maker'
          : null;
      default:
        return null;
    }
  }

  private evaluateRiverTransition(current: RiverStage, state: UserGrowthState): RiverStage | null {
    switch (current) {
      case 'trickle':
        return state.lessons_completed_count >= 1 ? 'stream' : null;
      case 'stream':
        return state.lessons_completed_count >= 5 && state.reflections_submitted_count >= 1
          ? 'river'
          : null;
      case 'river':
        return state.lessons_completed_count >= 20 && state.reflections_submitted_count >= 5
          ? 'delta'
          : null;
      default:
        return null;
    }
  }

  private evaluateCrystalTransition(
    current: CrystalTier,
    state: UserGrowthState,
  ): CrystalTier | null {
    switch (current) {
      case 'spark':
        return state.crystals_found_count >= 1 ? 'cluster' : null;
      case 'cluster':
        return state.crystals_found_count >= 10 ? 'cave' : null;
      case 'cave':
        return state.fractal_moments_count >= 1 ? 'fractal' : null;
      default:
        return null;
    }
  }

  private async recordChallengeContribution(
    userId: string,
    metric: ChallengeMetric,
    metadata: Record<string, any>,
  ) {
    const schoolId = metadata.school_id as string;
    const classroomId = metadata.classroom_id as string;

    const self = this;
    await Effect.runPromise(
      Effect.gen(function* () {
        const [challenges, compasses] = yield* Effect.all(
          [
            Effect.promise(() =>
              self.growthPort.getChallenges({ schoolId, classroomId, status: 'active' }),
            ),
            Effect.promise(() =>
              self.growthPort.getPersonalCompasses({ userId, status: 'active' }),
            ),
          ],
          { concurrency: 2 },
        );

        const updates: Array<Effect.Effect<void>> = [];

        for (const challenge of challenges) {
          if (challenge.metric === metric) {
            updates.push(
              Effect.promise(() =>
                self.growthPort.updateChallenge(challenge.id, {
                  current_count: (challenge.current_count || 0) + 1,
                }),
              ),
            );
          }
        }

        for (const compass of compasses) {
          if (compass.metric === metric) {
            updates.push(
              Effect.promise(() =>
                self.growthPort.updatePersonalCompass(compass.id, {
                  current_count: (compass.current_count || 0) + 1,
                }),
              ),
            );
          }
        }

        yield* Effect.all(updates, { concurrency: 'unbounded' });
      }),
    );
  }

  async getGrowthState(userId: string) {
    return this.growthPort.getGrowthState(userId);
  }

  async getChallenges(schoolId: string, classroomId?: string) {
    return this.growthPort.getChallenges({ schoolId, classroomId, status: 'active' });
  }

  async getPersonalCompasses(userId: string) {
    return this.growthPort.getPersonalCompasses({ userId, status: 'active' });
  }

  async getCrystalCollection(userId: string) {
    return this.growthPort.getCrystalCollection(userId);
  }

  async updateGrowthState(userId: string, updates: Partial<UserGrowthState>) {
    return this.growthPort.updateGrowthState(userId, updates);
  }

  async incrementDimension(userId: string, dimension: string) {
    return this.growthPort.incrementDimension(userId, dimension);
  }

  async createChallenge(params: any) {
    return this.growthPort.createChallenge(params);
  }

  async setPersonalCompass(userId: string, params: any) {
    return this.growthPort.createPersonalCompass({
      user_id: userId,
      ...params,
      status: 'active',
    });
  }

  async clearPersonalCompass(userId: string) {
    const compasses = await this.getPersonalCompasses(userId);
    await Effect.runPromise(
      Effect.all(
        compasses.map((compass) =>
          Effect.promise(() =>
            this.growthPort.updatePersonalCompass(compass.id, { status: 'expired' }),
          ),
        ),
        { concurrency: 'unbounded' },
      ),
    );
  }

  async recordCrystalDiscovery(discovery: Omit<CrystalDiscovery, 'id' | 'created_at'>) {
    return this.growthPort.recordCrystalDiscovery(discovery);
  }

  async recordContribution(
    userId: string,
    metric: ChallengeMetric,
    classroomId?: string,
    schoolId?: string,
  ) {
    return this.growthPort.recordContribution(userId, metric, classroomId, schoolId);
  }

  async createRipple(input: CreateRippleInput) {
    return this.growthPort.createRipple(input);
  }

  async getPendingRipples(userId: string) {
    return this.growthPort.getPendingRipples(userId);
  }

  async markRippleDelivered(rippleId: string) {
    return this.growthPort.markRippleDelivered(rippleId);
  }

  async getDeliveredRipples(userId: string, since: string) {
    return this.growthPort.getDeliveredRipples(userId, since);
  }

  async getManifestos(schoolId: string, userId?: string) {
    return this.growthPort.getManifestos(schoolId, userId);
  }

  async createManifesto(input: {
    school_id: string;
    creator_id: string;
    title: string;
    content: string;
    vibe: ManifestoVibe;
    target_date?: string;
  }) {
    return this.growthPort.createManifesto(input);
  }

  async endorseManifesto(manifestoId: string, userId: string, commitmentText?: string) {
    return this.growthPort.endorseManifesto(manifestoId, userId, commitmentText);
  }

  async unendorseManifesto(manifestoId: string, userId: string) {
    return this.growthPort.unendorseManifesto(manifestoId, userId);
  }

  getProgress(challenge: Challenge): ChallengeProgress {
    const fraction =
      challenge.target_count > 0
        ? Math.min(challenge.current_count / challenge.target_count, 1)
        : 0;

    return {
      challenge_id: challenge.id,
      progress_fraction: Math.round(fraction * 100) / 100,
      progress_narrative_en: this.buildProgressNarrative(
        challenge.type,
        challenge.metric,
        challenge.current_count,
        challenge.target_count,
      ),
      is_complete: challenge.current_count >= challenge.target_count,
      nature_state: this.natureStateFromFraction(challenge.nature_metaphor, fraction),
    };
  }

  getCompassProgress(compass: PersonalCompass): {
    progress_fraction: number;
    narrative_en: string;
    is_complete: boolean;
  } {
    const fraction =
      compass.target_count > 0 ? Math.min(compass.current_count / compass.target_count, 1) : 0;
    return {
      progress_fraction: Math.round(fraction * 100) / 100,
      narrative_en: this.buildProgressNarrative(
        'personal_compass',
        compass.metric,
        compass.current_count,
        compass.target_count,
      ),
      is_complete: compass.current_count >= compass.target_count,
    };
  }

  private buildProgressNarrative(
    type: ChallengeType,
    metric: ChallengeMetric,
    current: number,
    target: number,
  ): string {
    const fraction = current / target;
    const remaining = target - current;

    const metricLabel: Record<ChallengeMetric, { singular: string; plural: string }> = {
      library_resources_opened: { singular: 'resource opened', plural: 'resources opened' },
      joy_jar_entries: { singular: 'Joy Jar entry', plural: 'Joy Jar entries' },
      assignments_submitted: { singular: 'assignment submitted', plural: 'assignments submitted' },
      community_posts: { singular: 'community post', plural: 'community posts' },
      reflections_written: { singular: 'reflection written', plural: 'reflections written' },
      lessons_completed: { singular: 'lesson completed', plural: 'lessons completed' },
      attendance_recorded: { singular: 'attendance taken', plural: 'attendances recorded' },
      feedback_given: { singular: 'piece of feedback given', plural: 'pieces of feedback given' },
    };

    const label = current === 1 ? metricLabel[metric].singular : metricLabel[metric].plural;

    if (fraction >= 1) {
      if (type === 'class_collective_pulse')
        return `Your class reached it together — ${current} ${label}. A river reaching the sea.`;
      if (type === 'school_season_challenge')
        return `Your school's forest is bright — ${current} ${label} this season.`;
      return `You reached your compass — ${current} ${label}. Well done.`;
    }

    if (fraction >= 0.75) {
      if (type === 'personal_compass')
        return `Almost there — ${current} ${label} so far. ${remaining} more to complete your compass.`;
      return `The momentum is strong — ${current} ${label} together. ${remaining} more to reach the collective goal.`;
    }

    if (fraction >= 0.4) {
      if (type === 'class_collective_pulse')
        return `Your class is flowing — ${current} ${label} together. The river is rising.`;
      if (type === 'school_season_challenge')
        return `The forest is brightening — ${current} ${label} across the school.`;
      return `You are on your way — ${current} ${label} so far.`;
    }

    if (fraction > 0) {
      if (type === 'class_collective_pulse')
        return `Your class has begun — ${current} ${label} together so far.`;
      if (type === 'school_season_challenge')
        return `The first growth is here — ${current} ${label} across the school.`;
      return `A beginning — ${current} ${label}. Every start matters.`;
    }

    return type === 'personal_compass'
      ? 'Your compass is set. The first step begins when you are ready.'
      : 'The challenge is open. Every contribution counts.';
  }

  private natureStateFromFraction(metaphor: string, fraction: number): string {
    if (fraction >= 1) return `${metaphor}_complete`;
    if (fraction >= 0.75) return `${metaphor}_near`;
    if (fraction >= 0.4) return `${metaphor}_growing`;
    if (fraction > 0) return `${metaphor}_beginning`;
    return `${metaphor}_ready`;
  }
}
