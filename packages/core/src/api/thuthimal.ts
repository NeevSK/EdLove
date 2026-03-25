/**
 * Thuthimal API — Flower of Gratitude gift economy
 *
 * Thuthimal (තුතිමල්) transforms subscription economics into a gratitude economy.
 * Anyone (past students, alumni, communities) can gift Pro to a teacher/principal.
 * The gift is encoded as a one-time QR token and claimed by the recipient.
 *
 * See: apps/gurudevi-mobile/docs/Support/THUTHIMAL_README.md
 */

import { supabase } from '../lib/supabase';
import { growthSignalsAPI } from './growthSignals';

export interface ThuthimalGift {
  id: string;
  gift_token: string;
  gifter_id: string;
  gifter_name: string;
  recipient_tier: 'teacher' | 'principal';
  recipient_id: string | null;
  claimed: boolean;
  claimed_at: string | null;
  expires_at: string | null;
  message: string | null;
  created_at: string;
}

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
    gifterId: string,
    input: CreateGiftInput,
  ): Promise<{ gift_token: string }> {
    const { data, error } = await supabase
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
  async claimGift(giftToken: string, recipientId: string): Promise<ClaimResult> {
    const { data, error } = await supabase.rpc('claim_thuthimal_gift', {
      p_token: giftToken,
      p_recipient: recipientId,
    });

    if (error) throw new Error(`Claim RPC failed: ${error.message}`);

    const result = data as ClaimResult;

    // Growth signal: receiving a Thuthimal is the apex Blooming event —
    // a past student honoring their teacher years later.
    // This can advance the teacher to Pūrṇa Kamala (Full Lotus).
    if (result.success) {
      void growthSignalsAPI.emitSignal(recipientId, 'thuthimal_received', {
        gifter_name: result.gifter_name,
      }).catch(() => { });
    }

    return result;
  },

  /**
   * Get gift history for the current user as gifter.
   */
  async getMyGifts(gifterId: string): Promise<ThuthimalGift[]> {
    const { data, error } = await supabase
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
  async previewGift(giftToken: string): Promise<Pick<ThuthimalGift, 'gifter_name' | 'recipient_tier'> | null> {
    const { data, error } = await supabase
      .from('thuthimal_gifts')
      .select('gifter_name, recipient_tier')
      .eq('gift_token', giftToken)
      .eq('claimed', false)
      .maybeSingle();

    if (error || !data) return null;
    return data as Pick<ThuthimalGift, 'gifter_name' | 'recipient_tier'>;
  },
};
