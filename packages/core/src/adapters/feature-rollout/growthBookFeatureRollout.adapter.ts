import { GrowthBook, setPolyfills } from '@growthbook/growthbook';
import { storage } from '@repo/core/lib/storage';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
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
    getItem: async (key: string) => (await storage.getStringAsync(key)) ?? null,
    setItem: (key: string, value: string) => storage.setAsync(key, value),
  },
});

export class GrowthBookFeatureRolloutAdapter implements IFeatureRolloutPort {
  private growthbook: GrowthBook;
  private initialized = false;
  private refreshedAt: string | null = null;
  private loadingPayload = false;
  private currentContext: UserContext | null = null;
  private evaluation: Promise<void> = Promise.resolve();
  private rendererOwner: object | null = null;
  private static readonly POLL_INTERVAL_MS = 15 * 60 * 1000;

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
  }

  resolveFlags(context: UserContext): Promise<FeatureRolloutSnapshot> {
    // setAttributes can await sticky buckets. Serialize the shared SDK so one
    // context cannot read another context's attributes after that await.
    const result = this.evaluation.then(() => this.evaluateContext(context));
    this.evaluation = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async evaluateContext(context: UserContext): Promise<FeatureRolloutSnapshot> {
    await this.refreshPayload();
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

  private async refreshPayload(): Promise<void> {
    if (networkManager.getSnapshot().status !== 'online') return;
    const elapsed = this.refreshedAt ? Date.now() - Date.parse(this.refreshedAt) : Infinity;
    if (elapsed >= 0 && elapsed < GrowthBookFeatureRolloutAdapter.POLL_INTERVAL_MS) return;
    this.loadingPayload = true;
    try {
      await this.loadPayload();
      this.refreshedAt = new Date().toISOString();
    } finally {
      this.loadingPayload = false;
    }
  }

  private async loadPayload(): Promise<void> {
    if (!this.initialized) {
      const result = await this.growthbook.init({
        streaming: false,
        skipCache: true,
        timeout: 10_000,
      });
      this.initialized = true;
      if (!result.success || result.source !== 'network') {
        throw result.error ?? new Error(`Feature payload load failed (${result.source}).`);
      }
    } else {
      // Installed refreshFeatures changes the payload only when it received data.
      // Its void return cannot itself attest a successful network response.
      const previousPayload = this.growthbook.getPayload();
      await this.growthbook.refreshFeatures({ skipCache: true, timeout: 10_000 });
      if (this.growthbook.getPayload() === previousPayload) {
        throw new Error('Feature payload refresh did not receive a new network response.');
      }
    }
  }

  private readSnapshot(): FeatureRolloutSnapshot {
    const flags: Record<string, boolean | string> = {};

    // The manifest is the SSOT for the GrowthBook key mapping (ADR-012). The
    // snapshot is keyed by app flag keys so slices, registries, and permission
    // gates never see the remote naming scheme.
    for (const [appKey, metadata] of Object.entries(FEATURE_FLAG_MANIFEST)) {
      const value = this.growthbook.evalFeature(metadata.growthbookKey).value;
      if (typeof value === 'boolean' || typeof value === 'string') flags[appKey] = value;
    }

    return {
      flags,
      source: this.refreshedAt ? 'remote' : 'computed',
      refreshedAt: this.refreshedAt ?? new Date(0).toISOString(),
    };
  }

  subscribeToFlagChanges(
    context: UserContext,
    callback: (snapshot: FeatureRolloutSnapshot) => void,
  ): () => void {
    const owner = {};
    this.rendererOwner = owner;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let refreshing = false;
    const nextDelay = () =>
      this.refreshedAt
        ? Math.max(
            1,
            Date.parse(this.refreshedAt) +
              GrowthBookFeatureRolloutAdapter.POLL_INTERVAL_MS -
              Date.now(),
          )
        : GrowthBookFeatureRolloutAdapter.POLL_INTERVAL_MS;
    const refresh = () => {
      clearTimeout(timer);
      if (this.rendererOwner !== owner || networkManager.getSnapshot().status !== 'online') return;
      if (refreshing) return;
      refreshing = true;
      let succeeded = false;
      void this.resolveFlags(context)
        .then((snapshot) => {
          succeeded = true;
          if (this.rendererOwner === owner) callback(snapshot);
        })
        .catch((error: unknown) => {
          if (this.rendererOwner === owner)
            console.warn('[FeatureRollout] payload refresh failed', error);
        })
        .finally(() => {
          refreshing = false;
          if (this.rendererOwner === owner && networkManager.getSnapshot().status === 'online') {
            timer = setTimeout(
              refresh,
              succeeded ? nextDelay() : GrowthBookFeatureRolloutAdapter.POLL_INTERVAL_MS,
            );
          }
        });
    };
    this.growthbook.setRenderer(() => {
      // setAttributes invokes this renderer, so writing attributes here would
      // create an endless microtask loop and prevent native input processing.
      if (
        this.rendererOwner === owner &&
        this.currentContext === context &&
        this.refreshedAt &&
        !this.loadingPayload
      )
        callback(this.readSnapshot());
    });
    const unsubscribeNetwork = networkManager.subscribe(refresh);
    if (networkManager.getSnapshot().status === 'online') {
      timer = setTimeout(refresh, nextDelay());
    }

    return () => {
      clearTimeout(timer);
      unsubscribeNetwork();
      if (this.rendererOwner === owner) {
        this.rendererOwner = null;
        this.growthbook.setRenderer(null);
      }
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
