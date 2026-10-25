import { CredentialUnlinkReceiptSchema } from '@repo/core/api/credentialUnlink';
import {
  PasswordChangeFailureSchema,
  PasswordChangeReceiptSchema,
  PasswordChangeRequestSchema,
} from '@repo/core/api/passwordChange';
import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { z } from 'zod';
import { verifySupabaseSessionDetails } from './adapters/verifySupabaseSession';
import { resolveAuthenticatedAccount } from './authenticatedAccount';
import { appendAuthCredentialAudit, appendAuthPasswordAudit } from './authSessionAudit';
import { recentMfaFailure } from './sensitiveAuthAssurance';

async function credentialActor(token: string, environment: Record<string, string>) {
  const verified = await verifySupabaseSessionDetails(token, environment);
  if (!verified) return { body: { error: 'AUTH_REQUIRED' }, status: 401 as const };
  const account = await resolveAuthenticatedAccount(verified.claims.sub, environment.DATABASE_URL);
  const error = recentMfaFailure(verified.claims, verified.user);
  if (error)
    return {
      body: { error },
      status: error === 'AUTH_MFA_STATE_UNAVAILABLE' ? (503 as const) : (403 as const),
    };
  return { verified, account };
}

function providerConfig(environment: Record<string, string>) {
  const config = (name: string) => environment[name] ?? process.env[name];
  const url = config('SUPABASE_URL');
  const key =
    config('SUPABASE_PUBLISHABLE_KEY') ||
    config('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
    config('SUPABASE_ANON_KEY') ||
    config('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  return url && key ? { url: url.replace(/\/+$/, ''), key } : null;
}

async function passwordProviderResult(
  config: { url: string; key: string },
  authorization: string,
  subject: string,
  password: z.infer<typeof PasswordChangeRequestSchema>,
) {
  const unknown = {
    confirmed: false,
    rejected: false,
    error: 'PASSWORD_CHANGE_NOT_CONFIRMED' as z.infer<typeof PasswordChangeFailureSchema>['error'],
  };
  try {
    const response = await secureApiFetch(`${config.url}/auth/v1/user`, {
      method: 'PUT',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      headers: {
        Authorization: authorization,
        apikey: config.key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: password.password,
        ...(password.currentPassword === undefined
          ? {}
          : { current_password: password.currentPassword }),
        ...(password.nonce === undefined ? {} : { nonce: password.nonce }),
      }),
    });
    if (response.ok) {
      const user = z.object({ id: z.uuid() }).safeParse(await response.json());
      return { ...unknown, confirmed: user.success && user.data.id === subject };
    }
    if (![400, 401, 403, 422].includes(response.status)) {
      if (response.body) await response.body.cancel();
      return unknown;
    }
    const failure = z
      .object({
        code: z.enum([
          'reauthentication_needed',
          'reauthentication_not_valid',
          'same_password',
          'weak_password',
        ]),
      })
      .safeParse(await response.json().catch(() => null));
    const errors = {
      reauthentication_needed: 'PASSWORD_REAUTHENTICATION_REQUIRED',
      reauthentication_not_valid: 'PASSWORD_REAUTHENTICATION_INVALID',
      same_password: 'PASSWORD_UNCHANGED',
      weak_password: 'PASSWORD_TOO_WEAK',
    } as const;
    return {
      ...unknown,
      rejected: true,
      error: failure.success ? errors[failure.data.code] : unknown.error,
    };
  } catch {
    return unknown;
  }
}

export async function changeCredentialPassword(
  authorization: string,
  password: z.infer<typeof PasswordChangeRequestSchema>,
  environment: Record<string, string>,
  operationId: string,
) {
  const actor = await credentialActor(authorization.slice(7), environment);
  if ('body' in actor) return actor;
  const config = providerConfig(environment);
  if (!config) return { body: { error: 'AUTH_PASSWORD_CHANGE_UNAVAILABLE' }, status: 503 as const };
  await appendAuthPasswordAudit(
    actor.account.id,
    operationId,
    'initiated',
    environment.DATABASE_URL,
  );
  const result = await passwordProviderResult(
    config,
    authorization,
    actor.verified.claims.sub,
    password,
  );
  const receiptId = await appendAuthPasswordAudit(
    actor.account.id,
    operationId,
    result.confirmed ? 'confirmed' : 'unconfirmed',
    environment.DATABASE_URL,
  );
  if (!result.confirmed)
    return {
      body: { error: result.error, operationId },
      status: result.rejected ? (400 as const) : (502 as const),
    };
  return {
    body: PasswordChangeReceiptSchema.parse({
      accountId: actor.account.id,
      operationId,
      receiptId,
      status: 'confirmed',
      user: { id: actor.verified.claims.sub },
    }),
    status: 200 as const,
  };
}

type ProviderUser = NonNullable<Awaited<ReturnType<typeof verifySupabaseSessionDetails>>>['user'];

function retainsEmailRecovery(user: ProviderUser, identityId: string) {
  return (
    !!user.email_confirmed_at &&
    user.identities?.some(
      (item) => item.provider === 'email' && item.identity_id !== identityId,
    ) === true
  );
}

function unlinkAdmission(user: ProviderUser, identityId: string) {
  if (!user.identities)
    return { body: { error: 'AUTH_CREDENTIAL_INVENTORY_UNAVAILABLE' }, status: 503 as const };
  const identity = user.identities.find((item) => item.identity_id === identityId);
  if (!identity) return { body: { error: 'CREDENTIAL_NOT_FOUND' }, status: 404 as const };
  if (identity.provider !== 'google')
    return { body: { error: 'CREDENTIAL_UNLINK_NOT_ADMITTED' }, status: 403 as const };
  if (!retainsEmailRecovery(user, identityId))
    return { body: { error: 'RECOVERY_CREDENTIAL_REQUIRED' }, status: 409 as const };
  return { identity };
}

async function unlinkProviderResult(
  config: { url: string; key: string },
  authorization: string,
  subject: string,
  identityId: string,
  environment: Record<string, string>,
) {
  try {
    const response = await secureApiFetch(`${config.url}/auth/v1/user/identities/${identityId}`, {
      method: 'DELETE',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      headers: { Authorization: authorization, apikey: config.key },
    });
    if (response.body) await response.body.cancel();
    if (!response.ok) return false;
    const after = await verifySupabaseSessionDetails(authorization.slice(7), environment);
    if (!after || after.claims.sub !== subject || !after.user.identities) return false;
    return (
      !after.user.identities.some((item) => item.identity_id === identityId) &&
      retainsEmailRecovery(after.user, identityId)
    );
  } catch {
    return false;
  }
}

export async function unlinkCredentialIdentity(
  authorization: string,
  identityId: string,
  environment: Record<string, string>,
  operationId: string,
) {
  const actor = await credentialActor(authorization.slice(7), environment);
  if ('body' in actor) return actor;
  const admission = unlinkAdmission(actor.verified.user, identityId);
  if ('body' in admission) return admission;
  const config = providerConfig(environment);
  if (!config) return { body: { error: 'CREDENTIAL_UNLINK_UNAVAILABLE' }, status: 503 as const };
  await appendAuthCredentialAudit(
    actor.account.id,
    operationId,
    'identity_unlink',
    'initiated',
    environment.DATABASE_URL,
  );
  const confirmed = await unlinkProviderResult(
    config,
    authorization,
    actor.verified.claims.sub,
    identityId,
    environment,
  );
  const receiptId = await appendAuthCredentialAudit(
    actor.account.id,
    operationId,
    'identity_unlink',
    confirmed ? 'confirmed' : 'unconfirmed',
    environment.DATABASE_URL,
  );
  if (!confirmed)
    return {
      body: { error: 'CREDENTIAL_UNLINK_NOT_CONFIRMED', operationId },
      status: 502 as const,
    };
  return {
    body: CredentialUnlinkReceiptSchema.parse({
      accountId: actor.account.id,
      operationId,
      receiptId,
      identityId,
      provider: 'google',
      status: 'confirmed',
      user: { id: actor.verified.claims.sub },
    }),
    status: 200 as const,
  };
}
