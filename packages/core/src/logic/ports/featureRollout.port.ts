import type { UserContext } from '../schemas/user.schema';

export interface FeatureRolloutSnapshot {
  flags: Record<string, boolean | string>;
  source: 'cache' | 'remote' | 'computed';
  refreshedAt: string;
}

export interface IFeatureRolloutPort {
  resolveFlags(context: UserContext): Promise<FeatureRolloutSnapshot>;
  subscribeToFlagChanges(
    context: UserContext,
    callback: (snapshot: FeatureRolloutSnapshot) => void,
  ): () => void;
  trackExposure(flagKey: string, value: boolean | string): void;
}
