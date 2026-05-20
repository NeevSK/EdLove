import { APIError } from '../types/API';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from './base';

/**
 * IDENTITY API (Sovereign RPC Proxy)
 *
 * Siphons Identity and Profile management to the Sanctuary API.
 * [BREAKING] Renamed methods to force loud failure in UI.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const identityAPI = {
  /**
   * [LOUD-FAILURE] Renamed from resolveIdentity.
   */
  async identifyActiveCitizen() {
    const res = await client.api.identity.resolveIdentity.$get();
    if (!res.ok) {
      throw new APIError('Failed to resolve identity', res.status.toString());
    }
    return await res.json();
  },

  /**
   * [LOUD-FAILURE] Renamed from getProfile.
   */
  async fetchUserProfile(id: string) {
    const res = await client.api.identity.profile[':id'].$get({
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
  async modifyUserProfile(id: string, updates: any) {
    const res = await client.api.identity.profile[':id'].$patch({
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
    const res = await client.api.identity['classroom-capacity-summary'][':id'].$get({
      param: { id },
    });
    if (!res.ok) {
      throw new APIError('Failed to fetch workspace context', res.status.toString());
    }
    return await res.json();
  },
};
