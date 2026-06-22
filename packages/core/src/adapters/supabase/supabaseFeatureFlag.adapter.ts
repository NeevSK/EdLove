import {
  resolveFeatureFlags,
  trackFeatureExposureInternal,
} from '../../logic/permissions/feature-engine';
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

/* eslint-disable class-methods-use-this */
export class SupabaseFeatureFlagAdapter implements IFeatureRolloutPort {
  async resolveFlags(context: UserContext): Promise<FeatureRolloutSnapshot> {
    const cached = readFeatureRolloutCache();
    if (cached) {
      return { flags: cached.flags, source: 'cache', refreshedAt: cached.refreshedAt };
    }

    const { recomputeFlags, globalConfigs } = useFeatureStore.getState();
    const resolvedFlags = resolveFeatureFlags(context, globalConfigs);
    recomputeFlags(context);
    const snapshotFlags = resolvedFlags as unknown as Record<string, boolean | string>;
    writeFeatureRolloutCache(snapshotFlags);

    return {
      flags: snapshotFlags,
      source: 'computed',
      refreshedAt: new Date().toISOString(),
    };
  }

  subscribeToFlagChanges(
    context: UserContext,
    callback: (snapshot: FeatureRolloutSnapshot) => void,
  ): () => void {
    return useFeatureStore.subscribe((state) => {
      callback({
        flags: state.flags as unknown as Record<string, boolean | string>,
        source: 'computed',
        refreshedAt: new Date().toISOString(),
      });
    });
  }

  trackExposure(flagKey: string, value: boolean | string): void {
    trackFeatureExposureInternal(flagKey, value);
  }

  async getFlags(context: UserContext): Promise<Record<string, boolean | string>> {
    const snapshot = await this.resolveFlags(context);
    return snapshot.flags;
  }
}
