import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import { createV1Client } from '@repo/core/api/v1/client';
import { roomFeatures } from '@repo/core/logic/floor';
import type { FeaturePresentationMode } from '@repo/core/logic/permissions/featurePresentation';
import {
  decisionsFromPermissions,
  evaluateFeatureFor,
  type PersonAccess,
} from '@repo/core/logic/permissions/personAccess';
import { verifySnapshotSignature } from '@repo/core/logic/permissions/signature';
import type { TabDomain } from '@repo/core/logic/registry/domainEntry';
import { roomPresentationOf } from '@repo/core/logic/registry/featureRequirement';
import { DEFAULT_FEATURE_FLAGS } from '@repo/core/store/types/featureFlags';
import type { AuthorizedEntryResult } from '@repo/core/web-authorized-entry';
import { APP_CATALOG } from '../appCatalog';
import type { ServerSupabaseClient } from '../supabase/server';

type ReadyEntry = Extract<AuthorizedEntryResult, { kind: 'ready' }>;
type IssuedSnapshot = Awaited<
  ReturnType<ReturnType<typeof createV1Client>['authority']['refreshSnapshot']>
>;

/** SanctuaryFeature's decision for each feature of a room, by feature id. */
export type RoomPresentation = Readonly<Record<string, FeaturePresentationMode>>;

function apiOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) return null;
  assertSecureApiUrl(value);
  return value.replace(/\/+$/, '');
}

/**
 * The bond's permissions, only from a snapshot the API signed for this
 * account and bond, still in date, with a signature that checks. Anything else
 * is no snapshot, and SanctuaryFeature then treats protected features as not
 * known yet, exactly as the phone does before its snapshot arrives.
 */
async function signedPermissions(
  supabase: ServerSupabaseClient,
  entry: ReadyEntry,
  fetcher: typeof fetch,
): Promise<IssuedSnapshot['permissions'] | null> {
  try {
    const origin = apiOrigin();
    if (!origin) return null;
    const { data, error } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (error || !token) return null;
    const client = createV1Client({
      origin,
      headers: { authorization: `Bearer ${token}` },
      fetch: (url, init) => fetcher(url, { ...init, cache: 'no-store' }),
    });
    const issued = await client.authority.refreshSnapshot({ bondId: entry.activeScope.bondId });
    if (issued.userId !== entry.accountId || issued.activeBondId !== entry.activeScope.bondId) {
      return null;
    }
    if (!(Date.parse(issued.expiresAt) > Date.now())) return null;
    const valid = await verifySnapshotSignature({
      ...issued,
      permissions: JSON.stringify(issued.permissions),
      temporalHints: JSON.stringify(issued.temporalHints),
    });
    return valid ? issued.permissions : null;
  } catch {
    return null;
  }
}

/** The person SanctuaryFeature sees on the web: the server-checked entry plus the signed snapshot. */
export function webPersonAccess(
  entry: ReadyEntry,
  permissions: IssuedSnapshot['permissions'] | null,
): PersonAccess {
  const scope = entry.activeScope;
  return {
    userId: entry.accountId,
    isLocalOnly: false,
    activeBondId: scope.bondId,
    activeEntityId: scope.entityId,
    activeEntityType: scope.entityType,
    schoolId: scope.entityType === 'SCHOOL' ? scope.entityId : null,
    capacity: entry.activeCapacity,
    citizenship: scope.citizenship ?? 'THIRD_CLASS',
    cedarSnapshotLoaded: permissions !== null,
    decisionOf: decisionsFromPermissions(permissions),
    // The web has no entitlement source yet (the phone reads tables the v1 API
    // does not serve either). Until it has one, every account counts as FREE:
    // a paid feature shows as needing an upgrade, never as open.
    entitlement: { pricingTier: 'FREE', activeEntitlements: [], grants: [], expirationDate: null },
    entitlementManifestLoaded: true,
    entitlementReadiness: 'cached',
    flags: DEFAULT_FEATURE_FLAGS,
  };
}

/**
 * SanctuaryFeature's decision for every feature of one room, made on the
 * server for the signed-in person. Pages pass it to the room so a feature the
 * person may not have never takes a place. Every command is still checked
 * again by the API; this only decides what is shown.
 */
export async function resolveRoomPresentation(
  supabase: ServerSupabaseClient,
  entry: ReadyEntry,
  room: TabDomain,
  fetcher: typeof fetch = fetch,
): Promise<RoomPresentation> {
  const permissions = await signedPermissions(supabase, entry, fetcher);
  const person = webPersonAccess(entry, permissions);
  return roomPresentationOf(
    roomFeatures(APP_CATALOG, room, entry.activeCapacity, 'web'),
    (action, subject, requirement) => evaluateFeatureFor(person, action, subject, requirement),
    true,
  );
}
