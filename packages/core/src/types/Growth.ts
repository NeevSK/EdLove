/**
 * Growth Domain Types
 * 
 * Centralizes all types related to the Gurudevi Growth Model, including
 * nature paths, bhumi stages, and contextual challenges.
 */

/**
 * Bhumi (Lotus) path stages \u2014 the core journey of personal aliveness.
 */
export type BhumiStage = 'bijam' | 'mula' | 'nala' | 'patra' | 'kamala' | 'purna_kamala';

/**
 * Banyan (Vata) path stages \u2014 the tree that becomes a forest.
 * For teachers who mentor; for principals as their primary path.
 */
export type BanyanStage =
  | 'sapling'
  | 'roots_spreading'
  | 'canopy'
  | 'shade_giver'
  | 'forest_maker';

/**
 * River (Ganga) path stages \u2014 learning that flows and shapes what it touches.
 * For students (primary) and teachers' curricular contribution.
 */
export type RiverStage =
  | 'trickle'
  | 'stream'
  | 'river'
  | 'delta';

/**
 * Crystal (Spatika) tiers \u2014 student knowledge as discovered crystals and fractals.
 */
export type CrystalTier =
  | 'spark'
  | 'cluster'
  | 'cave'
  | 'fractal';

export interface CrystalDiscovery {
  id: string;
  user_id: string;
  crystal_type: 'subject_crystal' | 'connection_crystal' | 'deep_crystal' | 'fractal_crystal';
  subject_tags: string[];
  source_entity_id: string | null;
  crystal_name_en: string | null;
  crystal_description_en: string | null;
  is_fractal_moment: boolean;
  created_at: string;
}

/**
 * Growth Dimensions \u2014 the five qualities of aliveness.
 */
export type GrowthDimension = 'presence' | 'nourishing' | 'witnessing' | 'weaving' | 'blooming';

export interface UserGrowthState {
  id: string;
  user_id: string;
  // Bhumi (Lotus) path
  bhumi_stage: BhumiStage;
  presence_signals: number;
  nourishing_signals: number;
  witnessing_signals: number;
  weaving_signals: number;
  blooming_signals: number;
  // Banyan (Vata) path
  banyan_stage: BanyanStage;
  peer_mentored_count: number;
  circles_facilitated_count: number;
  // River (Ganga) path
  river_stage: RiverStage;
  lessons_completed_count: number;
  reflections_submitted_count: number;
  // Crystal (Spatika) path
  crystal_tier: CrystalTier;
  crystals_found_count: number;
  fractal_moments_count: number;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Contextual Challenges
 */

export type ChallengeMetric =
  | 'library_resources_opened'
  | 'joy_jar_entries'
  | 'assignments_submitted'
  | 'community_posts'
  | 'reflections_written'
  | 'lessons_completed'
  | 'attendance_recorded'
  | 'feedback_given';

export type ChallengeType =
  | 'class_collective_pulse'
  | 'school_season_challenge'
  | 'personal_compass';

export type ChallengeStatus =
  | 'active'
  | 'completed'
  | 'expired'
  | 'draft';

export interface Challenge {
  id: string;
  type: ChallengeType;
  school_id: string | null;
  classroom_id: string | null;
  creator_user_id: string | null;
  title_en: string;
  description_en: string;
  metric: ChallengeMetric;
  target_count: number;
  current_count: number;
  status: ChallengeStatus;
  nature_metaphor: 'river_rising' | 'forest_brightening' | 'lotus_opening' | 'crystal_growing';
  completion_celebration_en: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalCompass {
  id: string;
  user_id: string;
  title_en: string;
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
  progress_fraction: number;
  progress_narrative_en: string;
  is_complete: boolean;
  nature_state: string;
}

/**
 * Impact Ripples
 */
export type RippleType =
  | 'resource_saved'
  | 'resource_read'
  | 'post_sparked'
  | 'lesson_accessed'
  | 'feedback_given'
  | 'manifesto_endorsed'
  | 'circle_joined'
  | 'principal_recognition';

export type RippleSourceEntityType =
  | 'resource'
  | 'community_post'
  | 'lesson'
  | 'manifesto'
  | 'circle'
  | 'gratitude_gift';

export interface CreateRippleInput {
  recipientUserId: string;
  actorUserId?: string;
  rippleType: RippleType;
  schoolId?: string;
  sourceEntityType?: RippleSourceEntityType;
  sourceEntityId?: string;
  isActorVisible?: boolean;
}

export interface ImpactRipple {
  id: string;
  recipient_user_id: string;
  ripple_type: RippleType;
  school_id: string | null;
  actor_user_id: string | null;
  is_actor_visible: boolean;
  source_entity_type: RippleSourceEntityType | null;
  source_entity_id: string | null;
  warm_message_si: string | null;
  warm_message_ta: string | null;
  warm_message_en: string;
  delivered: boolean;
  delivered_at: string | null;
  batch_window: string | null;
  created_at: string;
}

/**
 * Sacred Missions (Manifestos)
 */
export type ManifestoVibe = 'creative' | 'analytical' | 'compassionate' | 'leadership' | 'wisdom';

export interface SanctuaryManifesto {
  id: string;
  school_id: string;
  creator_id: string;
  title: string;
  content: string;
  vibe: ManifestoVibe;
  target_date: string | null;
  status: 'active' | 'archived';
  endorsement_count: number;
  has_endorsed: boolean;
  created_at: string;
  updated_at: string;
}

