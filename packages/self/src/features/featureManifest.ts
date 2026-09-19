import {
  getFeatureAccessStatus,
  resolveAccessibleFeatures,
  type UserAccessContext,
} from '@repo/self/features/accessPolicy';
import {
  FEATURE_CATALOG,
  getFeatureDefinition,
  type SelfFeatureDefinition,
} from '@repo/self/features/featureCatalog';
import {
  type ResolvedFeatureSet,
  type ResolverPreferences,
  resolveFeatureSet,
} from '@repo/self/features/featureResolver';

export type SelfFeaturePlatform = 'browser' | 'native';
export type SelfFeatureTaskBehavior =
  | { kind: 'single' }
  | { kind: 'transient' }
  | { kind: 'modal' };
export type SelfFeatureDelivery = 'runnable' | 'catalog-only';

/**
 * A platform-owned declaration of the features for which it has a real
 * renderer. The catalog deliberately does not infer delivery from access:
 * permission to use a feature is not evidence that this client can render it.
 */
export interface SelfFeatureDeliveryDeclaration {
  deliveredFeatureIds: readonly string[] | ReadonlySet<string>;
}

function declaresFeatureDelivery(
  deliveredFeatureIds: SelfFeatureDeliveryDeclaration['deliveredFeatureIds'],
  featureId: string,
): boolean {
  return 'has' in deliveredFeatureIds
    ? deliveredFeatureIds.has(featureId)
    : deliveredFeatureIds.includes(featureId);
}

export interface SelfFeatureManifestItem extends SelfFeatureDefinition {
  taskBehavior: SelfFeatureTaskBehavior;
  delivery: SelfFeatureDelivery;
  availability: 'available' | 'unavailable' | 'authorization-unresolved';
  unavailableReason?: 'capability' | 'citizenship' | 'not-delivered-on-platform';
}

export interface ResolvedSelfFeatureManifest {
  all: SelfFeatureManifestItem[];
  accessible: ResolvedFeatureSet;
  runnable: SelfFeatureManifestItem[];
}

/**
 * Delivery is deliberately explicit. A catalog entry is not an assertion that
 * its interaction is ready on every platform.
 */
const FEATURE_DELIVERY: Readonly<
  Record<string, Readonly<Record<SelfFeaturePlatform, SelfFeatureDelivery>>>
> = Object.freeze(
  Object.keys(FEATURE_CATALOG).reduce<
    Record<string, Readonly<Record<SelfFeaturePlatform, SelfFeatureDelivery>>>
  >((delivery, id) => {
    delivery[id] = {
      native: 'runnable',
      browser: id === 'fire_journal' ? 'runnable' : 'catalog-only',
    };
    return delivery;
  }, {}),
);

const FEATURE_TASK_BEHAVIORS: Readonly<Record<string, SelfFeatureTaskBehavior>> = Object.freeze({
  mood_lotus: { kind: 'modal' },
  wisdom_seeds: { kind: 'modal' },
  joy_jar: { kind: 'modal' },
  gratitude_glimmers: { kind: 'modal' },
  daily_pulse: { kind: 'transient' },
});

export function getSelfFeatureTaskBehavior(featureId: string): SelfFeatureTaskBehavior | undefined {
  return getFeatureDefinition(featureId)
    ? (FEATURE_TASK_BEHAVIORS[featureId] ?? { kind: 'single' })
    : undefined;
}

export function getSelfFeatureDelivery(
  featureId: string,
  platform: SelfFeaturePlatform,
  declaration?: SelfFeatureDeliveryDeclaration,
): SelfFeatureDelivery | undefined {
  if (declaration) {
    return declaresFeatureDelivery(declaration.deliveredFeatureIds, featureId)
      ? 'runnable'
      : 'catalog-only';
  }

  return FEATURE_DELIVERY[featureId]?.[platform];
}

/**
 * Pure platform-neutral catalog resolver. UI adapters receive the same
 * feature identity, layout metadata, task semantics and truthful delivery
 * status; they decide only how to present it.
 */
export function resolveSelfFeatureManifest(
  context: UserAccessContext | null,
  preferences: ResolverPreferences,
  platform: SelfFeaturePlatform,
  deliveryDeclaration?: SelfFeatureDeliveryDeclaration,
): ResolvedSelfFeatureManifest {
  const accessible = context ? resolveAccessibleFeatures(context) : [];
  const resolvedAccessible = resolveFeatureSet(accessible, preferences);
  const capabilities = context ? new Set(context.capabilities) : null;

  const all = Object.values(FEATURE_CATALOG).map((feature) => {
    const access =
      context && capabilities ? getFeatureAccessStatus(feature, context, capabilities) : null;
    const delivery =
      getSelfFeatureDelivery(feature.id, platform, deliveryDeclaration) ?? 'catalog-only';
    const unavailableReason: SelfFeatureManifestItem['unavailableReason'] =
      access && !access.allowed
        ? access.reason
        : delivery !== 'runnable'
          ? 'not-delivered-on-platform'
          : undefined;
    const availability: SelfFeatureManifestItem['availability'] =
      !access && delivery === 'runnable'
        ? 'authorization-unresolved'
        : unavailableReason
          ? 'unavailable'
          : 'available';

    return {
      ...feature,
      taskBehavior: getSelfFeatureTaskBehavior(feature.id) ?? { kind: 'single' },
      delivery,
      availability,
      ...(unavailableReason ? { unavailableReason } : {}),
    };
  });

  return {
    all,
    accessible: resolvedAccessible,
    runnable: all.filter((feature) => feature.availability === 'available'),
  };
}
