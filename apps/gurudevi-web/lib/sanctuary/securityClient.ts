import {
  AuthenticatorAssuranceSchema,
  AuthenticatorIdSchema,
  CredentialInventorySchema,
  VerifiedAuthenticatorProjectionSchema,
} from '@repo/core/api/credentialInventory';
import {
  CredentialUnlinkFailureSchema,
  CredentialUnlinkReceiptSchema,
  CredentialUnlinkRequestSchema,
} from '@repo/core/api/credentialUnlink';
import {
  PasswordChangeFailureSchema,
  PasswordChangeReceiptSchema,
  PasswordChangeRequestSchema,
} from '@repo/core/api/passwordChange';
import { assertSecureApiUrl, secureApiFetch } from '@repo/core/api/transportSecurity';
import { abortableQueryRead } from '@repo/core/lib/clientStateFoundation';
import { CanonicalAccountIdSchema } from '@repo/core/logic/schemas/identity.schema';
import { createBrowserSupabaseClient } from '../supabase/browser';

export type SecurityOwner = Readonly<{ accountId: string; authSubjectId: string }>;

export async function resolveSecurityOwner(): Promise<SecurityOwner> {
  const client = createBrowserSupabaseClient();
  if (!client) throw new Error('Browser authentication is not configured.');
  const { data, error } = await client.auth.getSession();
  if (error || !data.session || data.session.user.is_anonymous !== false) {
    throw new Error('This session is unavailable. Open a valid recovery link or sign in again.');
  }
  const { data: verified, error: invalid } = await client.auth.getClaims(data.session.access_token);
  const account = CanonicalAccountIdSchema.safeParse(verified?.claims.canonical_account_id);
  if (invalid || !account.success || verified?.claims.sub !== data.session.user.id) {
    throw new Error('Your account identity could not be verified. Open a new recovery link.');
  }
  const owner = { accountId: account.data, authSubjectId: data.session.user.id };
  await securitySession(owner);
  return owner;
}

async function securitySession(owner: SecurityOwner) {
  CanonicalAccountIdSchema.parse(owner.accountId);
  const client = createBrowserSupabaseClient();
  if (!client) throw new Error('Browser authentication is not configured.');
  const { data, error } = await client.auth.getSession();
  const session = data.session;
  if (
    error ||
    !session ||
    session.user.id !== owner.authSubjectId ||
    session.user.is_anonymous !== false
  ) {
    throw new Error('Your account session changed. Reload security settings.');
  }
  const { data: verified, error: invalid } = await client.auth.getClaims(session.access_token);
  if (
    invalid ||
    verified?.claims.sub !== owner.authSubjectId ||
    verified.claims.canonical_account_id !== owner.accountId
  ) {
    throw new Error('Your account identity changed. Reload security settings.');
  }
  return { client, session };
}

function securityOrigin() {
  const origin = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!origin) throw new Error('Security services are not configured.');
  assertSecureApiUrl(origin);
  return origin.replace(/\/+$/, '');
}

export async function loadSecuritySnapshot(owner: SecurityOwner, signal: AbortSignal) {
  return abortableQueryRead(signal, async () => {
    const origin = securityOrigin();
    const { client, session } = await securitySession(owner);
    const [response, factors, assurance] = await Promise.all([
      secureApiFetch(`${origin}/api/auth/credentials`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      }),
      client.auth.mfa.listFactors(),
      client.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);
    if (!response.ok) {
      if (response.body) await response.body.cancel();
      throw new Error('Linked sign-in methods are unavailable. Refresh and try again.');
    }
    const inventory = CredentialInventorySchema.parse(await response.json());
    if (inventory.accountId !== owner.accountId || inventory.anonymous)
      throw new Error(
        'The credential inventory belongs to another account. Reload security settings.',
      );
    if (factors.error || assurance.error)
      throw new Error('Authenticator details are unavailable. Refresh and try again.');
    const verifiedFactors = VerifiedAuthenticatorProjectionSchema.parse(factors.data.totp);
    const level = AuthenticatorAssuranceSchema.parse(assurance.data.currentLevel);
    await securitySession(owner);
    return { ...inventory, factors: verifiedFactors, assurance: level };
  });
}
export type SecuritySnapshot = Awaited<ReturnType<typeof loadSecuritySnapshot>>;

export async function verifySecurityTotp(owner: SecurityOwner, factorId: string, code: string) {
  AuthenticatorIdSchema.parse(factorId);
  if (!/^\d{6}$/.test(code)) throw new Error('Enter the six-digit code from your authenticator.');
  const { client } = await securitySession(owner);
  const { error } = await client.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) throw new Error('Authenticator verification failed. Check the code and try again.');
  await securitySession(owner);
}

export async function requestSecurityPasswordCode(owner: SecurityOwner) {
  const { client } = await securitySession(owner);
  const { error } = await client.auth.reauthenticate();
  if (error) throw new Error('Could not request a confirmation code. Try again.');
  await securitySession(owner);
}

export async function changeSecurityPassword(
  owner: SecurityOwner,
  password: string,
  confirmation: { currentPassword?: string; nonce?: string } = {},
) {
  const request = PasswordChangeRequestSchema.parse({ password, ...confirmation });
  const origin = securityOrigin();
  const { session } = await securitySession(owner);
  const response = await secureApiFetch(`${origin}/api/auth/credentials/password`, {
    method: 'POST',
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const failure = PasswordChangeFailureSchema.safeParse(await response.json().catch(() => null));
    const messages = {
      RECENT_MFA_REQUIRED: 'Verify your authenticator again before changing the password.',
      PASSWORD_REAUTHENTICATION_REQUIRED: 'Request a confirmation code before trying again.',
      PASSWORD_REAUTHENTICATION_INVALID:
        'Check your current password or request a new confirmation code.',
      PASSWORD_UNCHANGED: 'Choose a password different from your current password.',
      PASSWORD_TOO_WEAK: 'Choose a stronger password that meets the account requirements.',
      PASSWORD_CHANGE_NOT_CONFIRMED:
        'Password change could not be confirmed. Check your sign-in before retrying.',
    };
    throw new Error(
      failure.success ? messages[failure.data.error] : messages.PASSWORD_CHANGE_NOT_CONFIRMED,
    );
  }
  const receipt = PasswordChangeReceiptSchema.parse(await response.json());
  if (receipt.accountId !== owner.accountId || receipt.user.id !== owner.authSubjectId) {
    throw new Error('Password receipt ownership did not match. Reload account settings.');
  }
  await securitySession(owner);
  return receipt;
}

export async function unlinkSecurityCredential(owner: SecurityOwner, identityId: string) {
  const request = CredentialUnlinkRequestSchema.parse({ identityId });
  const origin = securityOrigin();
  const { session } = await securitySession(owner);
  const response = await secureApiFetch(`${origin}/api/auth/credentials/identities/unlink`, {
    method: 'POST',
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const failure = CredentialUnlinkFailureSchema.safeParse(
      await response.json().catch(() => null),
    );
    const messages = {
      RECENT_MFA_REQUIRED: 'Verify your authenticator again before unlinking Google.',
      RECOVERY_CREDENTIAL_REQUIRED:
        'Keep a confirmed email sign-in method before unlinking Google.',
      CREDENTIAL_UNLINK_NOT_ADMITTED: 'This sign-in method cannot be unlinked here.',
      CREDENTIAL_NOT_FOUND: 'This sign-in method is no longer linked. Refresh the inventory.',
    };
    throw new Error(
      failure.success
        ? messages[failure.data.error]
        : 'Credential unlink could not be confirmed. Refresh before trying again.',
    );
  }
  const receipt = CredentialUnlinkReceiptSchema.parse(await response.json());
  if (
    receipt.accountId !== owner.accountId ||
    receipt.user.id !== owner.authSubjectId ||
    receipt.identityId !== identityId
  ) {
    throw new Error('Credential receipt ownership did not match. Reload security settings.');
  }
  await securitySession(owner);
  return receipt;
}
