import { 
  createSovereignClient, 
  SOVEREIGN_API_URL, 
  type AppType 
} from './base';
import { APIError } from '../types';

/**
 * PROFILE API (Sovereign RPC Proxy)
 * 
 * This module siphons Profile requests to the Sanctuary API.
 * It maintains the legacy signature but shifts the transport to RPC.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const profileAPI = {
  async getUserProfile(id: string) {
    const res = await client.api.profile.users[':id'].$get({
      param: { id },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new APIError('Failed to fetch user profile', res.status.toString());
    }

    return await res.json();
  },

  async updateProfile(id: string, updates: Record<string, any>) {
    const res = await client.api.profile.users[':id'].$patch({
      param: { id },
      json: updates,
    });

    if (!res.ok) {
      throw new APIError('Failed to update profile', res.status.toString());
    }

    return await res.json();
  },

  async getJourneySnapshot(
    id: string,
    params?: {
      at?: string;
      view_date?: string;
      view_scale?: any;
    },
  ) {
    const res = await client.api.profile.users[':id'].journey.$get({
      param: { id },
      query: {
        at: params?.at,
        view_date: params?.view_date,
        view_scale: params?.view_scale,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch journey snapshot', res.status.toString());
    }

    return await res.json();
  },

  async getSchoolPulse(
    id: string,
    params: {
      view_date: string;
      view_scale?: any;
    },
  ) {
    const res = await client.api.profile.schools[':id'].pulse.$get({
      param: { id },
      query: {
        view_date: params.view_date,
        view_scale: params.view_scale,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch school pulse', res.status.toString());
    }

    return await res.json();
  },
};
