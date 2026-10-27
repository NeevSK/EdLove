import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import type { SessionContinuity } from '@repo/core/api/clientRuntime';
import { APIError } from '@repo/core/types/API';

export async function readSupabaseSession() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error)
    throw new APIError('Unable to read the authentication session.', 'AUTH_SESSION_UNAVAILABLE');
  return data.session;
}

export async function assertSupabaseSessionContinuity(expected: SessionContinuity): Promise<void> {
  const current = await readSupabaseSession();
  if (
    !current ||
    current.access_token !== expected.accessToken ||
    current.user.id !== expected.subject
  )
    throw new APIError(
      'The authenticated session changed during identity resolution.',
      'AUTH_SESSION_CHANGED',
    );
}
