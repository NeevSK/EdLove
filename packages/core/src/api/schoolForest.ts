/**
 * School Forest API — Vana (वन) — the principal's ecosystem view.
 *
 * Routed through the Sovereign oRPC client to Sanctuary API.
 */
import { orpcClient } from '@repo/core/api/orpcClient';
import {
  type GiftType,
  gratitudeGift,
  type GratitudeGift,
  type SchoolForestState,
  type SchoolPulse,
  type TeacherTree,
} from '@repo/core/api/schoolForest.contract';
import { APIError } from '@repo/core/types/API';

export type TreeHealth = TeacherTree['tree_health'];
export type { GiftType, GratitudeGift, SchoolForestState, SchoolPulse, TeacherTree };

export const schoolForestAPI = {
  async getForestOverview(schoolId: string): Promise<SchoolForestState> {
    try {
      const response = await orpcClient.schoolForest.getForestOverview({
        params: { schoolId },
      });
      return response as SchoolForestState;
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch school forest overview', error?.code || 'FOREST_OVERVIEW_FAILED');
    }
  },

  /** Compatibility name retained while callers move to the server-owned read. */
  async computeForestLive(schoolId: string): Promise<SchoolForestState> {
    return this.getForestOverview(schoolId);
  },

  async getSchoolPulse(schoolId: string): Promise<SchoolPulse> {
    try {
      const response = await orpcClient.schoolForest.getSchoolPulse({
        params: { schoolId },
      });
      return response as SchoolPulse;
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch school pulse', error?.code || 'SCHOOL_PULSE_FAILED');
    }
  },

  async sendGratitudeGift(
    _principalUserId: string,
    recipientUserId: string,
    giftType: GiftType,
    personalMessage?: string,
    schoolId?: string,
  ): Promise<void> {
    try {
      const response = await orpcClient.schoolForest.sendGratitudeGift({
        body: {
          recipientUserId,
          giftType,
          message: personalMessage,
          schoolId,
        },
      });
      gratitudeGift.parse(response);
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to create gratitude gift', error?.code || 'GIFT_SEND_FAILED');
    }
  },

  async getPendingGifts(recipientUserId: string): Promise<GratitudeGift[]> {
    try {
      const response = await orpcClient.schoolForest.getPendingGifts({
        params: { recipientUserId },
      });
      return Array.isArray(response) ? (response as GratitudeGift[]) : [];
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch pending gifts', error?.code || 'PENDING_GIFTS_FAILED');
    }
  },

  async markGiftDelivered(giftId: string): Promise<void> {
    try {
      const response = await orpcClient.schoolForest.markGiftDelivered({
        params: { giftId },
      });
      gratitudeGift.parse(response);
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to mark gift delivered', error?.code || 'GIFT_DELIVERY_FAILED');
    }
  },
};
