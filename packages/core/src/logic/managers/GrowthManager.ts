import { IGrowthPort } from '../ports/growth.port';
import { GROWTH_SIGNAL_MAP, type GrowthSignalType } from '../../api/growthSignals.generated';

// Legacy dependencies for orchestration - to be refactored later
import { naturePathsAPI } from '../../api/naturePaths';
import { contextualChallengesAPI } from '../../api/contextualChallenges';
import { userGrowthStateAPI, UserGrowthState } from '../../api/userGrowthState';

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

const BANYAN_SIGNALS = new Set<GrowthSignalType>(['peer_mentored', 'circle_facilitated', 'resource_gifted', 'colleague_helped']);
const RIVER_SIGNALS = new Set<GrowthSignalType>(['lesson_completed', 'deep_study_session', 'reflection_submitted', 'knowledge_connected', 'resource_read']);
const CRYSTAL_SIGNALS = new Set<GrowthSignalType>(['crystal_found', 'fractal_moment', 'knowledge_connected']);

type WhisperedMomentKey = 'still_water' | 'storm_holder' | 'first_offering' | 'caring_teacher' | 'the_seeker' | 'first_branch' | 'the_companion' | 'river_meets_sea' | 'fractal_vision';

interface WhisperedMomentSpec {
  key: WhisperedMomentKey;
  name_si: string;
  name_en: string;
  triggerSignals: GrowthSignalType[];
}

const WHISPERED_MOMENT_SPECS: WhisperedMomentSpec[] = [
  { key: 'still_water', name_si: 'නිශ්චල දිය', name_en: 'Still Water', triggerSignals: ['mood_checkin'] },
  { key: 'storm_holder', name_si: 'කුළු ගෙන සිටින්නා', name_en: 'Storm Holder', triggerSignals: ['fire_journal_entry'] },
  { key: 'first_offering', name_si: 'ප්‍රථම දානය', name_en: 'First Offering', triggerSignals: ['lesson_material_created', 'resource_uploaded'] },
  { key: 'caring_teacher', name_si: 'සැලකිලිමත් ගුරුවරිය', name_en: 'The Caring Teacher', triggerSignals: ['assignment_graded'] },
  { key: 'the_seeker', name_si: 'සොයන්නා', name_en: 'The Seeker', triggerSignals: ['app_opened'] },
  { key: 'first_branch', name_si: 'පළමු අතු', name_en: 'First Branch', triggerSignals: ['peer_mentored', 'circle_facilitated', 'resource_gifted'] },
  { key: 'the_companion', name_si: 'සහකරු ගුරුවරයා', name_en: 'The Companion', triggerSignals: ['peer_mentored', 'circle_facilitated'] },
  { key: 'river_meets_sea', name_si: 'ගංගාව මුහුදට හමු වේ', name_en: 'River Meets Sea', triggerSignals: ['reflection_submitted', 'knowledge_connected'] },
  { key: 'fractal_vision', name_si: 'භාගික දෘෂ්ටිය', name_en: 'Fractal Vision', triggerSignals: ['fractal_moment', 'knowledge_connected'] },
];

export class GrowthManager {
  constructor(private growthPort: IGrowthPort) {}

  emitSilent(input: {
    user_id: string;
    event_type: GrowthSignalType;
    event_metadata?: Record<string, unknown>;
  }): void {
    void this.emitSignal(input).catch(() => {});
  }

  async emitSignal(input: {
    user_id: string;
    event_type: GrowthSignalType;
    event_metadata?: Record<string, unknown>;
  }): Promise<void> {
    const { user_id: userId, event_type: signalType, event_metadata: metadata = {} } = input;
    const dimension = GROWTH_SIGNAL_MAP[signalType];

    // 1. Record event
    try {
      await this.growthPort.recordEvent({
        user_id: userId,
        dimension,
        event_type: signalType,
        event_metadata: metadata,
      });
    } catch (e) {
      console.warn('[GrowthManager] Failed to record event', e);
      return; // Stop if recording fails (matching legacy behavior)
    }

    // 2. Increment dimension
    void userGrowthStateAPI.incrementDimension(userId, dimension).catch(() => {});

    // 3. Evaluate moments
    void this.checkWhisperedMoments(userId, signalType).catch(() => {});

    // 4. Advance paths
    this.advancePaths(userId, signalType, metadata);

    // 5. Challenges
    const metric = SIGNAL_TO_CHALLENGE_METRIC[signalType];
    if (metric) {
      void contextualChallengesAPI.recordContribution(
        userId,
        metric,
        metadata['classroom_id'] as string,
        metadata['school_id'] as string
      ).catch(() => {});
    }
  }

  private async checkWhisperedMoments(userId: string, signalType: GrowthSignalType) {
    const relevantSpecs = WHISPERED_MOMENT_SPECS.filter(s => s.triggerSignals.includes(signalType));
    if (relevantSpecs.length === 0) return;

    const experienced = await this.growthPort.getExperiencedMomentKeys(userId, relevantSpecs.map(s => s.key));
    const candidates = relevantSpecs.filter(s => !experienced.includes(s.key));

    const metResults = await Promise.all(candidates.map(async (spec) => ({
      spec,
      met: await this.evaluateCondition(userId, spec.key)
    })));

    const newlyMet = metResults.filter(r => r.met).map(r => r.spec);
    if (newlyMet.length > 0) {
      await this.growthPort.awardMoments(userId, newlyMet);
    }
  }

  private async evaluateCondition(userId: string, key: WhisperedMomentKey): Promise<boolean> {
    switch (key) {
      case 'still_water': return (await this.growthPort.countEvents(userId, ['mood_checkin'])) >= 5;
      case 'storm_holder': {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        return (await this.growthPort.countEvents(userId, ['fire_journal_entry'], { since: sevenDaysAgo })) >= 3;
      }
      case 'first_offering': return (await this.growthPort.countEvents(userId, ['lesson_material_created', 'resource_uploaded'])) >= 1;
      case 'caring_teacher': return (await this.growthPort.countEvents(userId, ['assignment_graded'])) >= 10;
      case 'the_seeker': {
        const data = await this.growthPort.getEventMetadata(userId, 'app_opened');
        const sections = new Set(data.map(m => m['section']).filter(Boolean));
        return ['community', 'library', 'self', 'classroom'].every(s => sections.has(s));
      }
      case 'first_branch': return (await this.growthPort.countEvents(userId, ['peer_mentored', 'circle_facilitated', 'resource_gifted'])) >= 1;
      case 'the_companion': return (await this.growthPort.countEvents(userId, ['peer_mentored', 'circle_facilitated'])) >= 3;
      case 'river_meets_sea': return (await this.growthPort.countEvents(userId, ['reflection_submitted', 'knowledge_connected'])) >= 5;
      case 'fractal_vision': return (await this.growthPort.countEvents(userId, ['fractal_moment', 'knowledge_connected'])) >= 1;
      default: return false;
    }
  }

  private async advancePaths(userId: string, signalType: GrowthSignalType, metadata: Record<string, any>) {
    if (BANYAN_SIGNALS.has(signalType)) {
      const state = await userGrowthStateAPI.getFullState(userId).catch(() => null) as UserGrowthState | null;
      if (state) {
        void naturePathsAPI.advanceBanyan(userId, {
          banyan_stage: state.banyan_stage ?? 'sapling',
          peer_mentored_count: state.peer_mentored_count ?? 0,
          circles_facilitated_count: state.circles_facilitated_count ?? 0,
          blooming_signals: state.blooming_signals ?? 0,
        }).catch(() => {});
      }
    } else if (RIVER_SIGNALS.has(signalType)) {
       const state = await userGrowthStateAPI.getFullState(userId).catch(() => null) as UserGrowthState | null;
       if (state) {
         void naturePathsAPI.advanceRiver(userId, {
           river_stage: state.river_stage ?? 'trickle',
           lessons_completed_count: state.lessons_completed_count ?? 0,
           reflections_submitted_count: state.reflections_submitted_count ?? 0,
           weaving_signals: state.weaving_signals ?? 0,
         }).catch(() => {});
       }
    }

    if (CRYSTAL_SIGNALS.has(signalType)) {
      const isFractal = signalType === 'fractal_moment';
      const area = metadata['subject_area'] || metadata['section'] || 'general';
      void naturePathsAPI.recordCrystalDiscovery(
        userId,
        isFractal ? 'fractal_crystal' : 'subject_crystal',
        [area],
        isFractal ? 'A Fractal Moment' : 'A New Discovery',
        isFractal ? 'You connected ideas across domains' : 'Something clicked',
        isFractal,
        metadata['entity_id']
      ).catch(() => {});
    }
  }
}
