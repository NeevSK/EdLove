import { IdentityBootstrapSchema } from '@repo/core/api/identity.orpc.contract';
import { assertSecureApiUrl, secureApiFetch } from '@repo/core/api/transportSecurity';
import { CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';
import { CanonicalAccountIdSchema } from '@repo/core/logic/schemas/identity.schema';
import type { BrowserSupabaseClient } from '../supabase/browser';
import { type DeviceAccountRecord, maskEmail } from './deviceAccountRegistry';

type CapturedSession = Readonly<{ accessToken: string; subject: string }>;

async function assertCurrentSession(
  client: BrowserSupabaseClient,
  expected: CapturedSession,
): Promise<void> {
  const { data, error } = await client.auth.getSession();
  if (
    error ||
    data.session?.access_token !== expected.accessToken ||
    data.session.user.id !== expected.subject
  )
    throw new Error('The browser session changed during account verification.');
}

export async function resolveCanonicalDeviceAccount(
  client: BrowserSupabaseClient,
  expected: CapturedSession,
): Promise<Omit<DeviceAccountRecord, 'lastActiveAt' | 'hasPin'>> {
  const origin = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!origin) throw new Error('Sanctuary identity verification is not configured.');
  assertSecureApiUrl(origin);
  await assertCurrentSession(client, expected);
  const response = await secureApiFetch(
    `${origin.replace(/\/+$/, '')}/api/openapi/identity/resolveIdentity`,
    {
      headers: {
        Authorization: `Bearer ${expected.accessToken}`,
        'X-Expected-Auth-Subject': expected.subject,
      },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!response.ok) throw new Error('Sanctuary account verification is unavailable.');
  const identity = IdentityBootstrapSchema.parse(await response.json());
  const accountId = CanonicalAccountIdSchema.parse(identity.id);
  if (
    identity.scopeBootstrap.userId !== accountId ||
    identity.availableBonds.some((bond) => bond.user_id !== accountId) ||
    (identity.activeBond &&
      !identity.availableBonds.some((bond) => bond.id === identity.activeBond?.id))
  )
    throw new Error('Sanctuary returned inconsistent canonical account identity.');
  const capacity =
    identity.scopeBootstrap.primaryCapacity === null
      ? 'scholar'
      : CapacitySchema.parse(identity.scopeBootstrap.primaryCapacity);
  await assertCurrentSession(client, expected);
  return {
    accountId,
    authUserId: expected.subject,
    displayName: identity.display_name ?? identity.name ?? 'Scholar',
    avatarUrl: null,
    maskedEmail: maskEmail(identity.email ?? ''),
    schoolId:
      identity.scopeBootstrap.activeScope?.entityType === 'SCHOOL'
        ? identity.scopeBootstrap.activeScope.entityId
        : null,
    capacity,
  };
}
