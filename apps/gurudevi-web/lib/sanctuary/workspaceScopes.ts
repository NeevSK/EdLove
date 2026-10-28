import { IdentityBootstrapSchema } from '@repo/core/api/identity.orpc.contract';
import { orpcClient } from '@repo/core/api/orpcClient';
import type { BrowserSupabaseClient } from '../supabase/browser';

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

export async function loadWorkspaceScopes(client: BrowserSupabaseClient) {
  const session = await currentSession(client);
  if (!session) return null;
  const identity = IdentityBootstrapSchema.parse(await orpcClient.identity.identifyActiveCitizen(
    {}, { context: { expectedSession: session, retry: 0 } },
  ));
  await assertSession(client, session);
  if (!identity.onboarding_completed || identity.scopeBootstrap.userId !== identity.id ||
      identity.availableBonds.some((bond) => bond.user_id !== identity.id) ||
      !identity.activeBond || identity.scopeBootstrap.activeScope?.bondId !== identity.activeBond.id ||
      !identity.availableBonds.some((bond) => bond.id === identity.activeBond?.id)) {
    throw new Error('Your workspace selection could not be verified. Please try again.');
  }
  return { identity, session };
}

export async function selectWorkspaceScope(
  client: BrowserSupabaseClient,
  session: Session,
  accountId: string,
  bondId: string,
) {
  await assertSession(client, session);
  const identity = IdentityBootstrapSchema.parse(await orpcClient.identity.selectActiveScope(
    { body: { bondId } }, { context: { expectedSession: session, retry: 0 } },
  ));
  await assertSession(client, session);
  if (identity.id !== accountId || identity.scopeBootstrap.userId !== accountId ||
      identity.activeBond?.id !== bondId || identity.scopeBootstrap.activeScope?.bondId !== bondId) {
    throw new Error('The selected workspace could not be confirmed. Reload to check your workspace.');
  }
}
