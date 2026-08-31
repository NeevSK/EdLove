import { ORPCError } from '@orpc/server';
import { thuthimalContract } from '@repo/core/api/thuthimal.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(thuthimalContract).$context<ORPCContext>();
const iso = (value: unknown) =>
  value instanceof Date ? value.toISOString() : value ? String(value) : null;

const mapGift = (row: any) => ({
  id: String(row.id),
  gift_token: String(row.gift_token),
  gifter_id: String(row.gifter_id),
  gifter_name: String(row.gifter_name),
  recipient_tier: row.recipient_role as 'teacher' | 'principal',
  recipient_id: row.recipient_id ?? null,
  claimed: Boolean(row.claimed),
  claimed_at: iso(row.claimed_at),
  expires_at: iso(row.expires_at),
  message: row.gift_message ?? null,
  created_at: iso(row.created_at) ?? new Date(0).toISOString(),
});

export const thuthimalRouter = impl.router({
  createGift: impl.createGift.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
    if (input.body.recipientId === context.user.id)
      throw SovereignError.invalidInput('A gratitude gift cannot be addressed to its creator.');

    const row = await context.db.thuthimalGift.create({
      data: {
        gifter_id: context.user.id,
        gifter_name: input.body.gifterName.trim(),
        recipient_role: input.body.recipientTier,
        recipient_id: input.body.recipientId ?? null,
        expires_at: input.body.expiresAt ? new Date(input.body.expiresAt) : null,
        gift_message: input.body.message ?? null,
      },
    });
    return { gift_token: String(row.gift_token) };
  }),

  claimGift: impl.claimGift.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();

    const result = await context.db.$transaction(async (tx: any) => {
      const gift = await tx.thuthimalGift.findFirst({
        where: {
          gift_token: input.body.giftToken,
          claimed: false,
          OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
        },
      });
      if (!gift) return { success: false as const, error: 'already_claimed_or_invalid' as const };

      const claimed = await tx.thuthimalGift.updateMany({
        where: { id: gift.id, claimed: false },
        data: { claimed: true, claimed_at: new Date(), recipient_id: context.user.id },
      });
      if (claimed.count !== 1)
        return { success: false as const, error: 'already_claimed_or_invalid' as const };

      await tx.user.update({
        where: { id: context.user.id },
        data: {
          pricing_tier: 'PRO',
          is_thuthimal: true,
          thuthimal_gifter: gift.gifter_name,
          thuthimal_gifted_at: new Date(),
        },
      });
      return {
        success: true as const,
        gifter_name: gift.gifter_name,
        recipient_id: context.user.id,
      };
    });
    return result;
  }),

  getMyGifts: impl.getMyGifts.use(doubleGateMiddleware).handler(async ({ context }) => {
    assertDatabase(context);
    if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
    const rows = await context.db.thuthimalGift.findMany({
      where: { gifter_id: context.user.id },
      orderBy: { created_at: 'desc' },
    });
    return rows.map(mapGift);
  }),

  previewGift: impl.previewGift.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
    const row = await context.db.thuthimalGift.findFirst({
      where: {
        gift_token: input.params.giftToken,
        claimed: false,
        OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      },
      select: { gifter_name: true, recipient_role: true },
    });
    if (!row) return null;
    if (row.recipient_role !== 'teacher' && row.recipient_role !== 'principal')
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message: 'Gift role is invalid' });
    return { gifter_name: row.gifter_name, recipient_tier: row.recipient_role };
  }),
});
