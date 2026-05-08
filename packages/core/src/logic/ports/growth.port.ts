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
  awardMoments(userId: string, moments: Array<{
    key: string;
    name_si: string;
    name_en: string;
  }>): Promise<void>;

  /**
   * Counts occurrences of specific event types for a user.
   */
  countEvents(userId: string, eventTypes: string[], options?: { since?: string }): Promise<number>;

  /**
   * Retrieves metadata for specific event types.
   */
  getEventMetadata(userId: string, eventType: string): Promise<Array<Record<string, any>>>;
}
