import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { assertHighway } from '@repo/core/api/highways';
import { orpcClient } from '@repo/core/api/orpcClient';
import type { AuthSession } from '@repo/core/logic/ports/auth.port';
import { getLocalGuestIdentity, updateLocalGuestIdentity } from '@repo/core/native/guestIdentity';
import { setGuestScope } from '@repo/core/native/guestScope';

/**
 * Simplified bond structure returned by the identity API
 * The full Bond structure includes additional fields like user_id, entity_id, etc.
 * that are filled in by the store layer
 */
export interface SimplifiedBond {
  id: string;
  capacity: string;
}

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
  availableBonds: SimplifiedBond[];
  activeBond?: SimplifiedBond | null;
  onboarding_completed?: boolean;
  schoolId?: string;
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
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const session = sessionData.session;
    if (session?.user?.is_anonymous) {
      setGuestScope(session.user.id);
      const local = await getLocalGuestIdentity(session.user.id);
      return local;
    }
    setGuestScope(null);
    const requestKey = getIdentityRequestKey(session);
    if (!requestKey) return null;

    const inFlight = inFlightIdentityRequests.get(requestKey);
    if (inFlight) return inFlight;

    const request = (orpcClient.identity.identifyActiveCitizen({}) as unknown as Promise<ActiveCitizen | null>).finally(() => {
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
    return orpcClient.identity.modifyUserProfile({ params: { id }, body: updates as any });
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
