import type { IFeatureFlagPort } from '../../logic/ports/featureFlag.port';
import type { UserContext } from '../../logic/schemas/user.schema';
import { useFeatureStore } from '../../store/useFeatureStore';
import { trackFeatureExposureInternal } from '../../logic/permissions/feature-engine';

export class SupabaseFeatureFlagAdapter implements IFeatureFlagPort {
  async getFlags(context: UserContext): Promise<Record<string, boolean | string>> {
    const { recomputeFlags } = useFeatureStore.getState();
    recomputeFlags(context);
    const resolvedFlags = useFeatureStore.getState().flags;
    return resolvedFlags as unknown as Record<string, boolean | string>;
  }

  subscribeToFlagChanges(
    context: UserContext,
    callback: (flags: Record<string, boolean | string>) => void
  ): () => void {
    // Return unsubscribe function
    return useFeatureStore.subscribe((state) => {
      callback(state.flags as unknown as Record<string, boolean | string>);
    });
  }

  trackExposure(flagKey: string, value: boolean | string): void {
    trackFeatureExposureInternal(flagKey, value);
  }
}
