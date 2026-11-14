/**
 * Sovereign Health Port (Hexagonal Architecture Contract)
 *
 * Defines the platform-agnostic interface for reading and writing
 * somatic wellbeing, mindful minutes, and recovery metrics.
 *
 * ZERO native dependencies: Safe for web, mobile, and test environments.
 */

export type RecoveryEnergyLevel = 'serene' | 'moderate' | 'depleted' | 'unknown';

export interface RecoverySignal {
  level: RecoveryEnergyLevel;
  restingHeartRateBpm?: number;
  hrvSdnnMs?: number;
  sleepDurationHours?: number;
  calculatedAt: string;
}

export interface MindfulSessionRecord {
  startedAt: string;
  durationSeconds: number;
  source: 'sanctuary_pulse' | 'breath_guide' | 'external_app';
}

export interface SovereignHealthPort {
  /**
   * Checks whether the underlying platform health store (HealthKit / Health Connect) is available.
   */
  isAvailable(): Promise<boolean>;

  /**
   * Prompts the user for opt-in permissions.
   */
  requestPermissions(): Promise<boolean>;

  /**
   * Reads total mindful minutes accumulated today across all apps.
   */
  getMindfulMinutesToday(): Promise<number>;

  /**
   * Records a completed Sanctuary mindfulness/breathing session back to the OS store.
   */
  recordMindfulSession(durationSeconds: number): Promise<void>;

  /**
   * Computes an on-device recovery energy signal to calibrate classroom pacing.
   */
  getRecoverySignal(): Promise<RecoverySignal>;
}
