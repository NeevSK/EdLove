import { GrowthBook, setPolyfills } from '@growthbook/growthbook';
import { storage } from '@repo/core/lib/storage';
import type {
  FeatureRolloutSnapshot,
  IFeatureRolloutPort,
} from '@repo/core/logic/ports/featureRollout.port';
import { FEATURE_FLAG_MANIFEST } from '@repo/core/logic/registry/featureLifecycleManifest';
import type { UserContext } from '@repo/core/logic/schemas/user.schema';
import { trackProductEvent } from '@repo/core/monitoring';

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

    // React Native has no EventSource implementation. Keep remote flags fresh
    // while the app is alive with a bounded poll rather than enabling a stream
    // that the runtime cannot create.
    this.initialization = this.growthbook
      .init({ streaming: false, pollingInterval: 15 * 60 * 1000 })
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

    return this.readSnapshot();
  }

  private readSnapshot(): FeatureRolloutSnapshot {
    const flags: Record<string, boolean | string> = {};

    // The manifest is the SSOT for the GrowthBook key mapping (ADR-012). The
    // snapshot is keyed by app flag keys so slices, registries, and permission
    // gates never see the remote naming scheme.
    for (const [appKey, metadata] of Object.entries(FEATURE_FLAG_MANIFEST)) {
      const value = this.growthbook.evalFeature(metadata.growthbookKey).value;
      if (value !== undefined) flags[appKey] = value;
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
    this.currentContext = context;
    this.growthbook.setRenderer(() => {
      // setAttributes invokes this renderer, so writing attributes here would
      // create an endless microtask loop and prevent native input processing.
      callback(this.readSnapshot());
    });

    return () => {
      this.growthbook.setRenderer(null);
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
        personal_pricing_tier:
          this.currentContext?.pricing_tier === 'PRO' ||
          this.currentContext?.pricing_tier === 'INSTITUTIONAL'
            ? this.currentContext.pricing_tier
            : 'FREE',
        effective_entitlement_scope:
          this.currentContext?.effective_entitlement_scope ?? 'individual',
        effective_entitlement_tier: this.currentContext?.effective_entitlement_tier ?? 'FREE',
        analytics_schema_version: 1,
      },
    );
  }
}
