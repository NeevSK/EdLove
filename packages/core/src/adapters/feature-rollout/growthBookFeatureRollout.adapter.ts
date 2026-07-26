import { GrowthBook, setPolyfills } from '@growthbook/growthbook';
import { storage } from '@/lib/storage';
import type {
  FeatureRolloutSnapshot,
  IFeatureRolloutPort,
} from '@/logic/ports/featureRollout.port';
import type { UserContext } from '@/logic/schemas/user.schema';

// Apply the platform-agnostic storage polyfill for GrowthBook cache persistence
setPolyfills({
  localStorage: {
    getItem: (key: string) => storage.getString(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  },
});

export class GrowthBookFeatureRolloutAdapter implements IFeatureRolloutPort {
  private growthbook: GrowthBook;

  constructor(apiHost?: string, clientKey?: string) {
    this.growthbook = new GrowthBook({
      apiHost:
        apiHost ||
        process.env.EXPO_PUBLIC_GROWTHBOOK_API_HOST ||
        process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST ||
        'https://cdn.growthbook.io',
      clientKey:
        clientKey ||
        process.env.EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY ||
        process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY,
      enableDevMode: process.env.NODE_ENV === 'development',
      trackingCallback: (experiment, result) => {
        this.trackExposure(experiment.key, result.key);
      },
    });

    // Auto load cached features from storage polyfill on initialization
    void this.growthbook.loadFeatures({ autoRefresh: true }).catch(() => {});
  }

  async resolveFlags(context: UserContext): Promise<FeatureRolloutSnapshot> {
    // Map UserContext to GrowthBook attributes
    const attributes = {
      id: context.userId || undefined,
      email: context.email || undefined,
      pricing_tier: context.pricing_tier,
      citizenship: context.citizenship,
      schoolId: context.schoolId,
      primaryCapacity: context.primaryCapacity,
      activeBond: context.activeBond,
      bonds: context.bonds,
      isAnonymous: context.isAnonymous,
      hasGlobalAccess: context.hasGlobalAccess,
    };

    await this.growthbook.setAttributes(attributes);

    const flags: Record<string, boolean | string> = {};
    const features = this.growthbook.getFeatures();

    for (const key of Object.keys(features)) {
      flags[key] = this.growthbook.evalFeature(key).value;
    }

    return {
      flags,
      source: 'computed',
      refreshedAt: new Date().toISOString(),
    };
  }

  subscribeToFlagChanges(
    context: UserContext,
    callback: (snapshot: FeatureRolloutSnapshot) => void,
  ): () => void {
    this.growthbook.setRenderer(() => {
      void this.resolveFlags(context)
        .then(callback)
        .catch(() => {});
    });

    return () => {
      this.growthbook.setRenderer(() => {});
    };
  }

  trackExposure(flagKey: string, value: boolean | string): void {
    console.debug(`[GrowthBook Exposure] ${flagKey} = ${value}`);
  }
}
