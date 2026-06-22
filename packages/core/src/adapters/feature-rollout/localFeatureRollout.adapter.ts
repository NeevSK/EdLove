import { resolveFeatureFlags } from '../../logic/permissions/feature-engine';
import {
  readFeatureRolloutCache,
  writeFeatureRolloutCache,
} from '../../logic/permissions/feature-rollout-cache';
import type {
  FeatureRolloutSnapshot,
  IFeatureRolloutPort,
} from '../../logic/ports/featureRollout.port';
import type { UserContext } from '../../logic/schemas/user.schema';
import { useFeatureStore } from '../../store/useFeatureStore';

export class LocalFeatureRolloutAdapter implements IFeatureRolloutPort {
  async resolveFlags(context: UserContext): Promise<FeatureRolloutSnapshot> {
    const cached = readFeatureRolloutCache();
    if (cached) {
      return {
        flags: cached.flags,
        source: 'cache',
        refreshedAt: cached.refreshedAt,
      };
    }

    const globalConfigs = useFeatureStore.getState().globalConfigs;
    const flags = resolveFeatureFlags(context, globalConfigs);
    const resolvedFlags = flags as unknown as Record<string, boolean | string>;
    writeFeatureRolloutCache(resolvedFlags);

    return {
      flags: resolvedFlags,
      source: 'computed',
      refreshedAt: new Date().toISOString(),
    };
  }

  subscribeToFlagChanges(
    context: UserContext,
    callback: (snapshot: FeatureRolloutSnapshot) => void,
  ): () => void {
    return useFeatureStore.subscribe(() => {
      void this.resolveFlags(context).then(callback);
    });
  }

  trackExposure(_flagKey: string, _value: boolean | string): void {
    // Exposure tracking remains a no-op until a GrowthBook adapter is wired in.
  }
}
