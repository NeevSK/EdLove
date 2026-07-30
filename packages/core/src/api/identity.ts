import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { assertHighway } from '@repo/core/api/highways';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';
import { getLocalGuestIdentity, updateLocalGuestIdentity } from '@repo/core/native/guestIdentity';
import { setGuestScope } from '@repo/core/native/guestScope';
import { APIError } from '@repo/core/types/API';

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

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);
let inFlightIdentityRequest: Promise<ActiveCitizen | null> | null = null;

export const identityAPI = {
  /**
   * [LOUD-FAILURE] Renamed from resolveIdentity.
   */
  async identifyActiveCitizen(): Promise<ActiveCitizen | null> {
    assertHighway('identity_bootstrap', 'direct-api');
    const { data: sessionData } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.getSession();
    if (sessionData.session?.user?.is_anonymous) {
      setGuestScope(sessionData.session.user.id);
      const local = await getLocalGuestIdentity(sessionData.session.user.id);
      return local;
    }
    setGuestScope(null);
    if (!inFlightIdentityRequest) {
      inFlightIdentityRequest = (async () => {
        const res = await (client.api as any).identity.resolveIdentity.$get();
        if (!res.ok) {
          throw new APIError('Failed to resolve identity', res.status.toString());
        }
        return await res.json();
      })().finally(() => {
        inFlightIdentityRequest = null;
      });
    }

    return await inFlightIdentityRequest;
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
    const res = await (client.api as any).identity.profile[':id'].$get({
      param: { id },
    });
    if (!res.ok) {
      throw new APIError('Failed to fetch profile', res.status.toString());
    }
    return await res.json();
  },

  /**
   * [LOUD-FAILURE] Renamed from updateProfile.
   */
  async modifyUserProfile(id: string, updates: Record<string, unknown>) {
    assertHighway('profile_core', 'direct-api');
    const { data: sessionData } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.getSession();
    if (sessionData.session?.user?.is_anonymous && sessionData.session.user.id === id) {
      return updateLocalGuestIdentity(id, {
        ...(updates.display_name !== undefined && {
          display_name: String(updates.display_name ?? ''),
        }),
      });
    }
    const res = await (client.api as any).identity.profile[':id'].$patch({
      param: { id },
      json: updates,
    });
    if (!res.ok) {
      throw new APIError('Failed to update profile', res.status.toString());
    }
    return await res.json();
  },

  /**
   * [LOUD-FAILURE] Renamed from getClassroomCapacitySummary.
   */
  async resolveWorkspaceContext(id: string) {
    assertHighway('workspace_sync', 'direct-api');
    const res = await (client.api as any).identity['classroom-capacity-summary'][':id'].$get({
      param: { id },
    });
    if (!res.ok) {
      throw new APIError('Failed to fetch workspace context', res.status.toString());
    }
    return await res.json();
  },

  async updateProfile(id: string, updates: Record<string, unknown>) {
    return this.modifyUserProfile(id, updates);
  },
};
