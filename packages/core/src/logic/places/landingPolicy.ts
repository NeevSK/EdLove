import type { AppEntryPath } from '@repo/core/logic/auth/bootstrapRoutes';
import { PLACE_ROUTES } from '@repo/core/logic/places/placeRoutes';

/** Top-level primary Place floors eligible for dynamic landing and last-place restoration. */
export type PrimaryPlace = 'self' | 'workspace' | 'library' | 'community' | 'profile';

export type PrimaryPlaceRoute = AppEntryPath;

export type LastVisitedPlaceRecord = {
  readonly place: PrimaryPlace;
  readonly bondId: string | null;
  readonly visitedAt: number;
};

export type LandingContextRuleInput = {
  readonly activeCapacity: string | null | undefined;
  readonly bondId: string | null;
  readonly now: number;
  readonly lastVisited: LastVisitedPlaceRecord | null;
};

/**
 * Pluggable contextual landing rule (e.g. circadian school-hours, exam-day, or remote config).
 * Return a `PrimaryPlace` to claim the landing destination, or `null` to pass to the next rule.
 */
export type LandingContextRule = (input: LandingContextRuleInput) => PrimaryPlace | null;

export type LandingPolicyConfig = {
  /**
   * Maximum age (ms) for resuming the last visited Place before falling through to contextual
   * or default landing. Set to `0` to disable last-place resumption.
   */
  readonly lastPlaceMaxAgeMs: number;
  /**
   * Default Place when no pinned preference, fresh last-place, or contextual rule claims the
   * landing destination. Configurable rather than hardcoded per role.
   */
  readonly defaultPlace: PrimaryPlace;
  /**
   * Ordered contextual policy rules evaluated when no pinned preference or fresh last-place
   * applies. Kept empty by default so product/time-based policies can be plugged in without
   * changing routing or startup code.
   */
  readonly contextualRules: readonly LandingContextRule[];
};

/** Configurable default landing policy. Override via config or remote flags rather than hardcoding. */
export const DEFAULT_LANDING_POLICY: LandingPolicyConfig = {
  lastPlaceMaxAgeMs: 4 * 60 * 60 * 1000,
  defaultPlace: 'workspace',
  contextualRules: [],
};

const PRIMARY_PLACE_SET: ReadonlySet<string> = new Set<PrimaryPlace>([
  'self',
  'workspace',
  'library',
  'community',
  'profile',
]);

export function isPrimaryPlace(value: unknown): value is PrimaryPlace {
  return typeof value === 'string' && PRIMARY_PLACE_SET.has(value);
}

/**
 * Maps a pathname to its primary Place floor, or `null` for modals, auth, settings,
 * or non-Place routes (which must never be persisted as a cold-start landing target).
 */
export function primaryPlaceFromPathname(pathname: string): PrimaryPlace | null {
  const normalized = pathname.replace(/^\/\(tabs\)/, '');
  const firstSegment = normalized.split('/').filter(Boolean)[0];
  return isPrimaryPlace(firstSegment) ? firstSegment : null;
}

export type LandingResolution = {
  readonly place: PrimaryPlace;
  readonly route: PrimaryPlaceRoute;
  readonly reason: 'pinned' | 'last-place' | 'context-rule' | 'policy-default';
};

/**
 * Pure, configurable landing resolver for an admitted user entering the app
 * (when no explicit `pendingIntent` deep link or push notification takes precedence).
 */
export function resolveAppLandingRoute(
  input: {
    readonly activeCapacity: string | null | undefined;
    readonly bondId?: string | null;
    readonly pinnedPlace?: PrimaryPlace | null;
    readonly lastVisited?: LastVisitedPlaceRecord | null;
    readonly now: number;
  },
  policy: LandingPolicyConfig = DEFAULT_LANDING_POLICY,
): LandingResolution {
  const bondId = input.bondId ?? null;

  if (input.pinnedPlace && isPrimaryPlace(input.pinnedPlace)) {
    return {
      place: input.pinnedPlace,
      route: PLACE_ROUTES.mobile[input.pinnedPlace] as PrimaryPlaceRoute,
      reason: 'pinned',
    };
  }

  const last = input.lastVisited ?? null;
  if (
    last &&
    isPrimaryPlace(last.place) &&
    last.bondId === bondId &&
    policy.lastPlaceMaxAgeMs > 0
  ) {
    const ageMs = input.now - last.visitedAt;
    if (Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= policy.lastPlaceMaxAgeMs) {
      return {
        place: last.place,
        route: PLACE_ROUTES.mobile[last.place] as PrimaryPlaceRoute,
        reason: 'last-place',
      };
    }
  }

  for (const rule of policy.contextualRules) {
    const chosen = rule({
      activeCapacity: input.activeCapacity,
      bondId,
      now: input.now,
      lastVisited: last,
    });
    if (chosen && isPrimaryPlace(chosen)) {
      return {
        place: chosen,
        route: PLACE_ROUTES.mobile[chosen] as PrimaryPlaceRoute,
        reason: 'context-rule',
      };
    }
  }

  return {
    place: policy.defaultPlace,
    route: PLACE_ROUTES.mobile[policy.defaultPlace] as PrimaryPlaceRoute,
    reason: 'policy-default',
  };
}
