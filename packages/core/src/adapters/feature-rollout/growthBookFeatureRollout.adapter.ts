import { GrowthBook, setPolyfills } from '@growthbook/growthbook';
import { trackProductEvent } from '@/lib/monitoring/posthog';
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
  private readonly initialization: Promise<void>;
  private snapshotSource: FeatureRolloutSnapshot['source'] = 'computed';
  private currentContext: UserContext | null = null;

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

    // Resolve the initial payload before evaluating flags. GrowthBook may use a
    // last-known-good cache when offline and can stream later updates.
    this.initialization = this.growthbook
      .init({ streaming: true })
      .then((result) => {
        this.snapshotSource =
          result.source === 'cache' ? 'cache' : result.source === 'network' ? 'remote' : 'computed';
      })
      .catch(() => {
        // The local persisted snapshot remains the safe fallback when the
        // control plane is unavailable.
        this.snapshotSource = 'computed';
      });
  }

  async resolveFlags(context: UserContext): Promise<FeatureRolloutSnapshot> {
    await this.initialization;
    this.currentContext = context;

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
      school_type: context.schoolType,
      effective_entitlement_scope: context.effective_entitlement_scope,
      effective_entitlement_tier: context.effective_entitlement_tier,
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
      source: this.snapshotSource,
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
    trackProductEvent(
      'feature_exposed',
      {
        feature_id: flagKey,
        flag_value: value,
      },
      {
        identity_mode: this.currentContext?.isAnonymous ? 'anonymous' : 'authenticated',
        citizenship: this.currentContext?.citizenship,
        onboarding_completed: Boolean(this.currentContext?.onboarding_completed),
        active_capacity: this.currentContext?.activeBond?.capacity ?? null,
        active_entity_type: this.currentContext?.activeEntityType ?? null,
        school_type: this.currentContext?.schoolType ?? null,
        personal_pricing_tier: this.currentContext?.pricing_tier === 'PRO' ? 'PRO' : 'FREE',
        effective_entitlement_scope:
          this.currentContext?.effective_entitlement_scope ?? 'individual',
        effective_entitlement_tier: this.currentContext?.effective_entitlement_tier ?? 'FREE',
        analytics_schema_version: 1,
      },
    );
  }
}
