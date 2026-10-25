import { z } from 'zod';

const assurance = z.object({
  aal: z.literal('aal2'),
  is_anonymous: z.literal(false),
  amr: z.array(z.object({ method: z.string(), timestamp: z.number().int().nonnegative() })).min(1),
});

/** A newly refreshed token is not evidence that its authentication was recent. */
export function hasRecentMfa(claims: unknown, now = Date.now()): boolean {
  const parsed = assurance.safeParse(claims);
  if (!parsed.success) return false;
  const seconds = Math.floor(now / 1000);
  return parsed.data.amr.some(
    ({ method, timestamp }) =>
      method === 'totp' && timestamp <= seconds && seconds - timestamp <= 300,
  );
}

export function recentMfaFailure(
  claims: unknown,
  user: {
    is_anonymous?: boolean;
    factors?: readonly { factor_type: string; status: string }[];
  },
): 'RECENT_MFA_REQUIRED' | 'AUTH_MFA_STATE_UNAVAILABLE' | null {
  if (user.is_anonymous !== false || !hasRecentMfa(claims)) return 'RECENT_MFA_REQUIRED';
  if (!user.factors) return 'AUTH_MFA_STATE_UNAVAILABLE';
  return user.factors.some(
    (factor) => factor.factor_type === 'totp' && factor.status === 'verified',
  )
    ? null
    : 'RECENT_MFA_REQUIRED';
}
