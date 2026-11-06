import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import { CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';
import { CanonicalAccountIdSchema } from '@repo/core/logic/schemas/identity.schema';
import type { BrowserSupabaseClient } from '../supabase/browser';
import { type DeviceAccountRecord, maskEmail } from './deviceAccountRegistry';
import { chooseActiveScope, personalCapacity, readV1Entry, type V1Entry } from './v1Entry';

type CapturedSession = Readonly<{ accessToken: string; subject: string }>;

async function assertCurrentSession(
  client: BrowserSupabaseClient,
  expected: CapturedSession,
): Promise<string | undefined> {
  const { data, error } = await client.auth.getSession();
  if (
    error ||
    data.session?.access_token !== expected.accessToken ||
    data.session.user.id !== expected.subject
  )
    throw new Error('The browser session changed during account verification.');
  return data.session.user.email;
}

export async function resolveCanonicalDeviceAccount(
  client: BrowserSupabaseClient,
  expected: CapturedSession,
): Promise<Omit<DeviceAccountRecord, 'lastActiveAt' | 'hasPin'>> {
  const origin = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!origin) throw new Error('Sanctuary identity verification is not configured.');
  assertSecureApiUrl(origin);
  await assertCurrentSession(client, expected);
  let entry: V1Entry;
  try {
    entry = await readV1Entry(origin, expected.accessToken);
  } catch {
    throw new Error('Sanctuary account verification is unavailable.');
  }
  const accountId = CanonicalAccountIdSchema.parse(entry.accountId);
  const active = chooseActiveScope(entry.scopes, undefined);
  const primary = personalCapacity(entry.scopes) ?? active?.capacity ?? null;
  const capacity = primary === null ? 'scholar' : CapacitySchema.parse(primary);
  const email = await assertCurrentSession(client, expected);
  return {
    accountId,
    authUserId: expected.subject,
    displayName: entry.displayName ?? 'Scholar',
    avatarUrl: null,
    maskedEmail: maskEmail(email ?? ''),
    schoolId: active?.entityType === 'SCHOOL' ? active.entityId : null,
    capacity,
  };
}
