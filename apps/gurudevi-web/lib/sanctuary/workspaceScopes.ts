import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import type { BrowserSupabaseClient } from '../supabase/browser';
import { ACTIVE_BOND_COOKIE, chooseActiveScope, readV1Entry } from './v1Entry';

type Session = Readonly<{ accessToken: string; subject: string }>;

async function currentSession(client: BrowserSupabaseClient): Promise<Session | null> {
  const { data, error } = await client.auth.getSession();
  if (error) throw new Error('Could not verify your session. Please try again.');
  if (!data.session || data.session.user.is_anonymous) return null;
  return { accessToken: data.session.access_token, subject: data.session.user.id };
}

async function assertSession(client: BrowserSupabaseClient, expected: Session): Promise<void> {
  const current = await currentSession(client);
  if (!current || current.subject !== expected.subject || current.accessToken !== expected.accessToken) {
    throw new Error('Your session changed. Reload before switching workspaces.');
  }
}

function apiOrigin(): string {
  const origin = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!origin) throw new Error('Workspaces are not configured.');
  assertSecureApiUrl(origin);
  return origin;
}

function selectedBond(): string | undefined {
  const prefix = `${ACTIVE_BOND_COOKIE}=`;
  return document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(prefix))
    ?.slice(prefix.length);
}

export async function loadWorkspaceScopes(client: BrowserSupabaseClient) {
  const session = await currentSession(client);
  if (!session) return null;
  const entry = await readV1Entry(apiOrigin(), session.accessToken);
  await assertSession(client, session);
  const active = chooseActiveScope(entry.scopes, selectedBond());
  if (!entry.onboardingCompleted || !active) {
    throw new Error('Your workspace selection could not be verified. Please try again.');
  }
  return {
    identity: {
      id: entry.accountId,
      activeBond: { id: active.bondId },
      availableBonds: entry.scopes
        .filter((scope) => scope.admission === 'available')
        .map((scope) => ({
          id: scope.bondId,
          entity_type: scope.entityType,
          entity_id: scope.entityId,
          capacity: scope.capacity,
        })),
    },
    session,
  };
}

export async function selectWorkspaceScope(
  client: BrowserSupabaseClient,
  session: Session,
  accountId: string,
  bondId: string,
) {
  await assertSession(client, session);
  const entry = await readV1Entry(apiOrigin(), session.accessToken);
  await assertSession(client, session);
  if (
    entry.accountId !== accountId ||
    chooseActiveScope(entry.scopes, bondId)?.bondId !== bondId
  ) {
    throw new Error('The selected workspace could not be confirmed. Reload to check your workspace.');
  }
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${ACTIVE_BOND_COOKIE}=${bondId}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}
