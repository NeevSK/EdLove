import {
  assertSupabaseSessionContinuity,
  readSupabaseSession,
} from '@repo/core/adapters/supabase/sessionContinuity';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { assertHighway } from '@repo/core/api/highways';
import { IdentityBootstrapSchema } from '@repo/core/api/identity.orpc.contract';
import { orpcClient } from '@repo/core/api/orpcClient';
import type { AuthSession } from '@repo/core/logic/ports/auth.port';
import { CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';
import { UserProfilePatchSchema } from '@repo/core/logic/schemas/profileUpdate.schema';
import { getLocalGuestIdentity, updateLocalGuestIdentity } from '@repo/core/native/guestIdentity';
import { setGuestScope } from '@repo/core/native/guestScope';
import type { Bond } from '@repo/core/types/Identity';

/**
 * IDENTITY API (Sovereign RPC Proxy)
 *
 * Siphons Identity and Profile management to the Sanctuary API.
 * [BREAKING] Renamed methods to force loud failure in UI.
 */

export interface ActiveCitizen {
  id: string;
  email: string | null;
  display_name: string;
  availableBonds: Bond[];
  activeBond?: Bond | null;
  onboarding_completed?: boolean;
  schoolId?: string;
}

function normalizeLocalGuestIdentity(
  identity: Awaited<ReturnType<typeof getLocalGuestIdentity>>,
): ActiveCitizen {
  const availableBonds = identity.availableBonds.flatMap((bond) => {
    const capacity = CapacitySchema.safeParse(bond.capacity);
    return capacity.success ? [{ ...bond, capacity: capacity.data }] : [];
  });
  return {
    ...identity,
    availableBonds,
    activeBond: availableBonds.find((bond) => bond.id === identity.activeBond?.id) ?? null,
  };
}

function normalizeBootstrapIdentity(identity: unknown): ActiveCitizen {
  const bootstrap = IdentityBootstrapSchema.parse(identity);
  const availableBonds = bootstrap.availableBonds.map((bond) => ({
    ...bond,
    capacity: CapacitySchema.parse(bond.capacity),
  }));
  const activeBond = bootstrap.activeBond
    ? (availableBonds.find((bond) => bond.id === bootstrap.activeBond?.id) ?? null)
    : null;
  if (bootstrap.activeBond && activeBond === null) {
    throw new Error('Identity bootstrap selected a bond outside its available bonds.');
  }
  return {
    id: bootstrap.id,
    email: bootstrap.email ?? null,
    display_name: bootstrap.display_name ?? bootstrap.name ?? '',
    availableBonds,
    activeBond,
    onboarding_completed: bootstrap.onboarding_completed,
  };
}

const inFlightIdentityRequests = new Map<string, Promise<ActiveCitizen | null>>();

export function getIdentityRequestKey(session: AuthSession | null): string | null {
  if (!session?.user) return null;
  return `${session.user.id}:${session.access_token}`;
}

export const identityAPI = {
  /**
   * [LOUD-FAILURE] Renamed from resolveIdentity.
   */
  async identifyActiveCitizen(): Promise<ActiveCitizen | null> {
    assertHighway('identity_bootstrap', 'direct-api');
    const session = await readSupabaseSession();
    if (!session) {
      setGuestScope(null);
      return null;
    }
    if (session?.user?.is_anonymous) {
      setGuestScope(session.user.id);
      const local = await getLocalGuestIdentity(session.user.id);
      return normalizeLocalGuestIdentity(local);
    }
    setGuestScope(null);
    const requestKey = getIdentityRequestKey(session);
    if (!requestKey) return null;

    const inFlight = inFlightIdentityRequests.get(requestKey);
    if (inFlight) return inFlight;

    const expectedSession = { accessToken: session.access_token, subject: session.user.id };
    const request = orpcClient.identity
      .identifyActiveCitizen({}, { context: { expectedSession, retry: 0 } })
      .then(async (response) => {
        await assertSupabaseSessionContinuity(expectedSession);
        return normalizeBootstrapIdentity(response);
      })
      .finally(() => {
        inFlightIdentityRequests.delete(requestKey);
      });
    inFlightIdentityRequests.set(requestKey, request);
    return request;
  },

  /**
   * Legacy shim for getMyInternalId to ensure backward compatibility across package hooks.
   */
  async getMyInternalId(): Promise<string | null> {
    const citizen = await this.identifyActiveCitizen();
    return citizen?.id ?? null;
  },

  /**
   * [LOUD-FAILURE] Renamed from getProfile.
   */
  async fetchUserProfile(id: string) {
    assertHighway('profile_core', 'direct-api');
    return orpcClient.identity.fetchUserProfile({ params: { id } });
  },

  /**
   * [LOUD-FAILURE] Renamed from updateProfile.
   */
  async modifyUserProfile(id: string, updates: Record<string, unknown>) {
    assertHighway('profile_core', 'direct-api');
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (sessionData.session?.user?.is_anonymous && sessionData.session.user.id === id) {
      return updateLocalGuestIdentity(id, {
        ...(typeof updates.display_name !== 'undefined' && {
          display_name: String(updates.display_name ?? ''),
        }),
      });
    }
    return orpcClient.identity.modifyUserProfile(
      { params: { id }, body: UserProfilePatchSchema.parse(updates) },
      { context: { expectedAccountId: id, retry: 0 } },
    );
  },

  /**
   * [LOUD-FAILURE] Renamed from getClassroomCapacitySummary.
   */
  async resolveWorkspaceContext(id: string) {
    assertHighway('workspace_sync', 'direct-api');
    return orpcClient.identity.resolveWorkspaceContext({ params: { id } });
  },

  /**
   * Resolves classroom capacity summary by delegating to resolveWorkspaceContext.
   */
  async getClassroomCapacitySummary(id: string) {
    return this.resolveWorkspaceContext(id);
  },

  async updateProfile(id: string, updates: Record<string, unknown>) {
    return this.modifyUserProfile(id, updates);
  },
};
