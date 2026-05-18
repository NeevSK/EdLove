import { growth } from '../logic';
import { type CrystalTier, type RiverStage, type BanyanStage, type CrystalDiscovery } from '../types/Growth';
export * from '../types/Growth';



/**
 * naturePathsAPI (Legacy Proxy)
 * 
 * Superseded by GrowthManager. Now redirects to the sovereign Growth domain.
 * This file is kept temporarily for backward compatibility.
 */
export const naturePathsAPI = {
  /**
   * Check and advance the Banyan stage if conditions are met.
   */
  async advanceBanyan(
    userId: string,
    state: {
      banyan_stage: BanyanStage;
      peer_mentored_count: number;
      circles_facilitated_count: number;
      blooming_signals: number;
    },
  ): Promise<void> {
    // GrowthManager handles the evaluation logic internally
    await growth.updateGrowthState(userId, {
      banyan_stage: state.banyan_stage,
      peer_mentored_count: state.peer_mentored_count,
      circles_facilitated_count: state.circles_facilitated_count,
      blooming_signals: state.blooming_signals
    });
  },

  /**
   * Check and advance the River stage if conditions are met.
   */
  async advanceRiver(
    userId: string,
    state: {
      river_stage: RiverStage;
      lessons_completed_count: number;
      reflections_submitted_count: number;
      weaving_signals: number;
    },
  ): Promise<void> {
    await growth.updateGrowthState(userId, {
      river_stage: state.river_stage,
      lessons_completed_count: state.lessons_completed_count,
      reflections_submitted_count: state.reflections_submitted_count,
      weaving_signals: state.weaving_signals
    });
  },

  /**
   * Record a crystal discovery for a student.
   */
  async recordCrystalDiscovery(
    userId: string,
    crystalType: CrystalDiscovery['crystal_type'],
    subjectTags: string[],
    nameEn: string,
    descriptionEn: string,
    isFractalMoment = false,
    sourceEntityId?: string,
  ): Promise<void> {
    await growth.recordCrystalDiscovery({
      user_id: userId,
      crystal_type: crystalType,
      subject_tags: subjectTags,
      crystal_name_en: nameEn,
      crystal_description_en: descriptionEn,
      is_fractal_moment: isFractalMoment,
      source_entity_id: sourceEntityId ?? null,
    });
  },

  /**
   * Get a student's full Crystal Collection.
   */
  async getCrystalCollection(userId: string): Promise<CrystalDiscovery[]> {
    return growth.getCrystalCollection(userId);
  },

  /**
   * Get a student's current nature path state (River stage + Crystal tier).
   */
  async getStudentPathState(userId: string): Promise<{
    river_stage: RiverStage;
    crystal_tier: CrystalTier;
    crystals_found_count: number;
    fractal_moments_count: number;
  } | null> {
    const state = await growth.getGrowthState(userId);
    if (!state) return null;
    return {
      river_stage: state.river_stage,
      crystal_tier: state.crystal_tier,
      crystals_found_count: state.crystals_found_count,
      fractal_moments_count: state.fractal_moments_count,
    };
  },

  /**
   * Get a teacher's/principal's Banyan stage.
   */
  async getBanyanState(userId: string): Promise<{
    banyan_stage: BanyanStage;
    peer_mentored_count: number;
    circles_facilitated_count: number;
  } | null> {
    const state = await growth.getGrowthState(userId);
    if (!state) return null;
    return {
      banyan_stage: state.banyan_stage,
      peer_mentored_count: state.peer_mentored_count,
      circles_facilitated_count: state.circles_facilitated_count,
    };
  },
};
