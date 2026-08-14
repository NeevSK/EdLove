/**
 * Thuthimal API \u2014 Flower of Gratitude gift economy
 *
 * Thuthimal (\u0DAD\u0DD4\u0DAD\u0DD2\u0DB8\u0DBD\u0DCA) transforms subscription economics into a gratitude economy.
 * Anyone (past students, alumni, communities) can gift Pro to a teacher/principal.
 * The gift is encoded as a one-time QR token and claimed by the recipient.
 *
 * See: apps/gurudevi-mobile/docs/Support/THUTHIMAL_README.md
 */

import type { ThuthimalGift } from '@repo/core/types';
import { growthSignalsAPI } from '@repo/core/api/growthSignals';
import { APIError } from '@repo/core/types/API';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export interface CreateGiftInput {
  gifterName: string;
  recipientTier: 'teacher' | 'principal';
  /** Optional: specify a specific recipient by ID */
  recipientId?: string;
  /** Optional: ISO date string for expiry */
  expiresAt?: string;
  /** Optional personal message */
  message?: string;
}

export interface ClaimResult {
  success: boolean;
  gifter_name?: string;
  recipient_id?: string;
  error?: 'already_claimed_or_invalid' | string;
}

export const thuthimalAPI = {
  /**
   * Create a new gift token.
   * Called by the gifter after completing payment (Alpha: manual; Beta: post-Stripe webhook).
   * Returns the generated gift_token UUID for encoding in a QR code.
   */
  async createGift(
    input: CreateGiftInput & { gifter_id: string },
  ): Promise<{ gift_token: string }> {
    const res = await (client.api as any).thuthimal.gifts.$post({
      json: {
        gifterName: input.gifterName,
        recipientTier: input.recipientTier,
        recipientId: input.recipientId ?? null,
        expiresAt: input.expiresAt ?? null,
        message: input.message ?? null,
      },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new APIError('Failed to create thuthimal gift', res.status.toString());
    return data as { gift_token: string };
  },

  /**
   * Claim a gift token on behalf of the recipient.
   * Uses server-side RPC with row-lock to prevent double-claim.
   */
  async claimGift(input: { gift_token: string; recipient_id: string }): Promise<ClaimResult> {
    const res = await (client.api as any).thuthimal.gifts.claim.$post({
      json: { giftToken: input.gift_token },
    });
    const result = (await res.json().catch(() => null)) as ClaimResult | null;
    if (!res.ok || !result) throw new APIError('Claim request failed', res.status.toString());

    // Growth signal: receiving a Thuthimal is the apex Blooming event \u2014
    // a past student honoring their teacher years later.
    // This can advance the teacher to P\u016Br\u1E47a Kamala (Full Lotus).
    if (result.success && result.recipient_id) {
      void growthSignalsAPI
        .emitSignal({
          user_id: result.recipient_id,
          event_type: 'thuthimal_received',
          event_metadata: {
            gifter_name: result.gifter_name,
          },
        })
        .catch(() => {});
    }

    return result;
  },

  /**
   * Get gift history for the current user as gifter.
   */
  async getMyGifts(gifterId: string): Promise<ThuthimalGift[]> {
    void gifterId;
    const res = await (client.api as any).thuthimal.gifts.$get();
    if (!res.ok) throw new APIError('Failed to fetch gifts', res.status.toString());
    return (await res.json()) as ThuthimalGift[];
  },

  /**
   * Preview an unclaimed gift token (for display before claiming).
   * Returns null if token is already claimed or expired.
   */
  async previewGift(
    giftToken: string,
  ): Promise<Pick<ThuthimalGift, 'gifter_name' | 'recipient_tier'> | null> {
    const res = await (client.api as any).thuthimal.gifts[':giftToken'].preview.$get({
      param: { giftToken },
    });
    if (!res.ok) return null;
    return (await res.json()) as Pick<ThuthimalGift, 'gifter_name' | 'recipient_tier'> | null;
  },
};
