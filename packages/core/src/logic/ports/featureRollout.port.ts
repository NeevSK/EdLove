import type { UserContext } from '@repo/core/logic/schemas/user.schema';

export interface FeatureRolloutSnapshot {
  flags: Record<string, boolean | string>;
  source: 'cache' | 'remote' | 'computed';
  /** Last verified network payload load; reevaluation must never renew this time. */
  refreshedAt: string;
  /** True when the snapshot exceeded the local offline continuity window. */
  stale?: boolean;
}

export interface IFeatureRolloutPort {
  resolveFlags(context: UserContext): Promise<FeatureRolloutSnapshot>;
  subscribeToFlagChanges(
    context: UserContext,
    callback: (snapshot: FeatureRolloutSnapshot) => void,
  ): () => void;
  trackExposure(flagKey: string, value: boolean | string): void;
}
