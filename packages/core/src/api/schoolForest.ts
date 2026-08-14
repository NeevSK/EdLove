/**
 * School Forest API — Vana (वन) — the principal's ecosystem view.
 *
 * This module is intentionally a transport client. Aggregation, authorization,
 * fallback computation, and persistence belong to Sanctuary API so there is
 * one policy and data boundary for school-wide reads.
 */
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import {
  type GiftType,
  gratitudeGift,
  type SchoolForestState,
  type SchoolPulse,
  schoolForestContract,
  type TeacherTree,
} from '@repo/core/api/schoolForest.contract';

export type TreeHealth = TeacherTree['tree_health'];
export type { GiftType, SchoolForestState, SchoolPulse, TeacherTree };
export type GratitudeGift = ReturnType<typeof gratitudeGift.parse>;

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

async function readJson<T>(
  response: Response,
  message: string,
  parse: (value: unknown) => T,
): Promise<T> {
  if (!response.ok) throw new Error(message);
  return parse(await response.json());
}

export const schoolForestAPI = {
  async getForestOverview(schoolId: string): Promise<SchoolForestState> {
    const response = await (client.api as any)['school-forest'].overview[':schoolId'].$get({
      param: { schoolId },
    });
    return readJson(
      response,
      'Failed to fetch school forest overview',
      (value) => value as SchoolForestState,
    );
  },

  /** Compatibility name retained while callers move to the server-owned read. */
  async computeForestLive(schoolId: string): Promise<SchoolForestState> {
    return this.getForestOverview(schoolId);
  },

  async getSchoolPulse(schoolId: string): Promise<SchoolPulse> {
    const response = await (client.api as any)['school-forest'].pulse[':schoolId'].$get({
      param: { schoolId },
    });
    return readJson(response, 'Failed to fetch school pulse', (value) => value as SchoolPulse);
  },

  async sendGratitudeGift(
    _principalUserId: string,
    recipientUserId: string,
    giftType: GiftType,
    personalMessage?: string,
    schoolId?: string,
  ): Promise<void> {
    const response = await (client.api as any)['school-forest'].gifts.$post({
      json: { recipientUserId, giftType, message: personalMessage, schoolId },
    });
    await readJson(response, 'Failed to create gratitude gift', (value) =>
      gratitudeGift.parse(value),
    );
  },

  async getPendingGifts(recipientUserId: string): Promise<GratitudeGift[]> {
    const response = await (client.api as any)['school-forest'].gifts.pending[
      ':recipientUserId'
    ].$get({
      param: { recipientUserId },
    });
    return readJson(response, 'Failed to fetch pending gifts', (value) =>
      Array.isArray(value) ? value.map((row) => gratitudeGift.parse(row)) : [],
    );
  },

  async markGiftDelivered(giftId: string): Promise<void> {
    const response = await (client.api as any)['school-forest'].gifts[':giftId'].deliver.$patch({
      param: { giftId },
    });
    await readJson(response, 'Failed to mark gift delivered', (value) =>
      gratitudeGift.parse(value),
    );
  },
};

void schoolForestContract;
