import type {
  Challenge,
  ChallengeMetric,
  CrystalDiscovery,
  ImpactRipple,
  ManifestoVibe,
  PersonalCompass,
  SanctuaryManifesto,
  UserGrowthState,
} from '../../types/Growth';

export interface IGrowthPort {
  /**
   * Records a raw growth signal event.
   */
  recordEvent(params: {
    user_id: string;
    dimension: string;
    event_type: string;
    event_metadata: Record<string, any>;
  }): Promise<void>;

  /**
   * Retrieves keys of already-experienced whispered moments.
   */
  getExperiencedMomentKeys(userId: string, candidateKeys: string[]): Promise<string[]>;

  /**
   * Awards multiple whispered moments to a user.
   */
  awardMoments(
    userId: string,
    moments: Array<{
      key: string;
      name_si: string;
      name_en: string;
    }>,
  ): Promise<void>;

  /**
   * Counts occurrences of specific event types for a user.
   */
  countEvents(userId: string, eventTypes: string[], options?: { since?: string }): Promise<number>;

  /**
   * Retrieves metadata for specific event types.
   */
  getEventMetadata(userId: string, eventType: string): Promise<Array<Record<string, any>>>;

  /**
   * Updates a user's growth state (stage counters and dimension counters).
   */
  updateGrowthState(userId: string, updates: Partial<UserGrowthState>): Promise<UserGrowthState>;

  /**
   * Retrieves or creates a user's growth state.
   */
  getGrowthState(userId: string): Promise<UserGrowthState | null>;

  /**
   * Records a crystal discovery.
   */
  recordCrystalDiscovery(discovery: Omit<CrystalDiscovery, 'id' | 'created_at'>): Promise<void>;

  /**
   * Retrieves a student's full Crystal Collection.
   */
  getCrystalCollection(userId: string): Promise<CrystalDiscovery[]>;

  /**
   * Increments a dimension counter atomically.
   */
  incrementDimension(userId: string, column: string): Promise<UserGrowthState | null>;

  /**
   * Contextual Challenges
   */
  getChallenges(filters: {
    schoolId?: string;
    classroomId?: string;
    status?: string;
    type?: string;
  }): Promise<Challenge[]>;
  createChallenge(
    challenge: Omit<Challenge, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Challenge>;
  updateChallenge(id: string, updates: Partial<Challenge>): Promise<void>;

  getPersonalCompasses(filters: { userId: string; status?: string }): Promise<PersonalCompass[]>;
  createPersonalCompass(
    compass: Omit<PersonalCompass, 'id' | 'created_at'>,
  ): Promise<PersonalCompass>;
  updatePersonalCompass(id: string, updates: Partial<PersonalCompass>): Promise<void>;

  recordContribution(
    userId: string,
    metric: ChallengeMetric,
    classroomId?: string,
    schoolId?: string,
  ): Promise<void>;

  /**
   * Impact Ripples
   */
  createRipple(ripple: ImpactRipple | any): Promise<void>;
  getPendingRipples(userId: string): Promise<ImpactRipple[]>;
  markRippleDelivered(rippleId: string): Promise<void>;
  getDeliveredRipples(userId: string, since: string): Promise<ImpactRipple[]>;

  /**
   * Sacred Missions (Manifestos)
   */
  getManifestos(schoolId: string, userId?: string): Promise<SanctuaryManifesto[]>;
  createManifesto(input: {
    school_id: string;
    creator_id: string;
    title: string;
    content: string;
    vibe: ManifestoVibe;
    target_date?: string;
  }): Promise<SanctuaryManifesto>;
  endorseManifesto(manifestoId: string, userId: string, commitmentText?: string): Promise<void>;
  unendorseManifesto(manifestoId: string, userId: string): Promise<void>;
}
