/**
 * Thuthimal API \u2014 Flower of Gratitude gift economy
 *
 * Thuthimal (\u0DAD\u0DD4\u0DAD\u0DD2\u0DB8\u0DBD\u0DCA) transforms subscription economics into a gratitude economy.
 * Anyone (past students, alumni, communities) can gift Pro to a teacher/principal.
 * The gift is encoded as a one-time QR token and claimed by the recipient.
 *
 * See: apps/gurudevi-mobile/docs/Support/THUTHIMAL_README.md
 */

import type { ThuthimalGift } from '../types';
import { growthSignalsAPI } from './growthSignals';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';

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
    const { gifter_id: gifterId } = input;
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('thuthimal_gifts')
      .insert({
        gifter_id: gifterId,
        gifter_name: input.gifterName,
        recipient_tier: input.recipientTier,
        recipient_id: input.recipientId ?? null,
        expires_at: input.expiresAt ?? null,
        message: input.message ?? null,
      })
      .select('gift_token')
      .single();

    if (error) throw new Error(`Failed to create thuthimal gift: ${error.message}`);
    return { gift_token: data.gift_token };
  },

  /**
   * Claim a gift token on behalf of the recipient.
   * Uses server-side RPC with row-lock to prevent double-claim.
   */
  async claimGift(input: { gift_token: string; recipient_id: string }): Promise<ClaimResult> {
    const { gift_token: giftToken, recipient_id: recipientId } = input;
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.rpc('claim_thuthimal_gift', {
      p_token: giftToken,
      p_recipient: recipientId,
    });

    if (error) throw new Error(`Claim RPC failed: ${error.message}`);

    const result = data as ClaimResult;

    // Growth signal: receiving a Thuthimal is the apex Blooming event \u2014
    // a past student honoring their teacher years later.
    // This can advance the teacher to P\u016Br\u1E47a Kamala (Full Lotus).
    if (result.success) {
      void growthSignalsAPI
        .emitSignal({
          user_id: recipientId,
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
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('thuthimal_gifts')
      .select('*')
      .eq('gifter_id', gifterId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch gifts: ${error.message}`);
    return (data ?? []) as ThuthimalGift[];
  },

  /**
   * Preview an unclaimed gift token (for display before claiming).
   * Returns null if token is already claimed or expired.
   */
  async previewGift(
    giftToken: string,
  ): Promise<Pick<ThuthimalGift, 'gifter_name' | 'recipient_tier'> | null> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('thuthimal_gifts')
      .select('gifter_name, recipient_tier')
      .eq('gift_token', giftToken)
      .eq('claimed', false)
      .maybeSingle();

    if (error || !data) return null;
    return data as Pick<ThuthimalGift, 'gifter_name' | 'recipient_tier'>;
  },
};
