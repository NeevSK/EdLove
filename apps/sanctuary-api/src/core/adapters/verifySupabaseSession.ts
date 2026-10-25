import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { SovereignError } from '@repo/core/types/Errors';
import { z } from 'zod';
import { verifySupabaseJwt } from '../../jwt';

const providerUser = z.object({
  id: z.uuid(),
  is_anonymous: z.boolean().optional(),
  email_confirmed_at: z.iso.datetime({ offset: true }).nullable().optional(),
  factors: z
    .array(
      z.object({
        id: z.uuid(),
        factor_type: z.string(),
        status: z.enum(['verified', 'unverified']),
      }),
    )
    .optional(),
  identities: z
    .array(
      z.object({
        identity_id: z.uuid(),
        user_id: z.uuid(),
        provider: z.string().min(1).max(100),
      }),
    )
    .optional(),
});
const sessionId = z.uuid().refine((id) => id !== '00000000-0000-0000-0000-000000000000');

/** Signature caching must never cache the continued existence of a session. */
export async function verifySupabaseSession(token: string, env?: Record<string, string>) {
  const verified = await verifySupabaseSessionDetails(token, env);
  return verified?.claims ?? null;
}

export async function verifySupabaseSessionDetails(token: string, env?: Record<string, string>) {
  const claims = await verifySupabaseJwt(token, env);
  if (!claims) return null;
  const configuration = (key: string) => env?.[key] ?? process.env[key];
  // Only the verifier's existing, explicitly admitted bare test identities bypass Auth.
  if (configuration('NODE_ENV') === 'test' && !token.includes('.')) {
    const user: z.infer<typeof providerUser> = { id: claims.sub };
    return { claims, user };
  }
  if (!sessionId.safeParse(claims.session_id).success || !z.uuid().safeParse(claims.sub).success) {
    return null;
  }
  const url = configuration('SUPABASE_URL');
  const key =
    configuration('SUPABASE_PUBLISHABLE_KEY') ||
    configuration('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
    configuration('SUPABASE_ANON_KEY') ||
    configuration('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !key) throw SovereignError.unavailable('AUTH_SESSION_VERIFICATION_UNAVAILABLE');

  let response: Response;
  try {
    response = await secureApiFetch(`${url.replace(/\/+$/, '')}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: key },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok && response.body) await response.body.cancel();
  } catch {
    throw SovereignError.unavailable('AUTH_SESSION_VERIFICATION_UNAVAILABLE');
  }
  if ([400, 401, 403].includes(response.status)) return null;
  if (!response.ok) throw SovereignError.unavailable('AUTH_SESSION_VERIFICATION_UNAVAILABLE');
  let user: unknown;
  try {
    user = await response.json();
  } catch {
    throw SovereignError.unavailable('AUTH_SESSION_VERIFICATION_UNAVAILABLE');
  }
  const parsed = providerUser.safeParse(user);
  if (!parsed.success) throw SovereignError.unavailable('AUTH_SESSION_VERIFICATION_UNAVAILABLE');
  if (parsed.data.id !== claims.sub) return null;
  if (parsed.data.identities?.some((identity) => identity.user_id !== claims.sub)) {
    throw SovereignError.unavailable('AUTH_IDENTITY_OWNERSHIP_INVARIANT_VIOLATION');
  }
  return { claims, user: parsed.data };
}
