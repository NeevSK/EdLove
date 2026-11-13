import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import { type AuthorizedEntryResult, mapAuthorizedEntry } from '@repo/core/web-authorized-entry';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../../app/(sanctuary)/auth/AuthProvider';
import { notificationFeed } from '../../app/(sanctuary)/notifications/notificationFeed';
import { EXPLORE_COMMUNITY_GROUPS } from '../../app/(sanctuary)/community/exploreGroups';
import { getExploreSampleAnnouncements } from '../../lib/community/announcements-contract';
import { loadCommunityGroups } from '../../lib/community/groups';
import { resolveSanctuaryDevSession } from '../../lib/sanctuary/devSession';
import { createBrowserSupabaseClient } from '../../lib/supabase/browser';
import { ACTIVE_BOND_COOKIE, authoritativeFacts, readV1Entry } from '../../lib/sanctuary/v1Entry';
import { type Access, AccessScope } from './access';
import type { Roles } from './session';
import type { AccountHome, Sources } from './sources';

/** A signed-in person: Supabase proves who they are, Sanctuary says what they may do. */
export function Surface({ children }: { readonly children: ReactNode }) {
  return (
    <AuthProvider>
      <AccountAccess>{children}</AccountAccess>
    </AuthProvider>
  );
}

function AccountAccess({ children }: { readonly children: ReactNode }) {
  const { state } = useAuth();
  const preview = developmentPreview();
  const subject = state.session?.user.id;
  const token = state.session?.access_token;
  const entry = useQuery({
    queryKey: ['session', 'entry', subject],
    queryFn: () => readEntry(token ?? '', subject ?? ''),
    enabled: !preview && state.status === 'authenticated' && Boolean(token && subject),
    staleTime: 60_000,
  });

  let access: Access;
  if (preview) access = preview;
  else if (state.status === 'loading') access = { kind: 'loading' };
  else if (state.status === 'signed-out') access = { kind: 'signed-out' };
  else if (state.status === 'unavailable')
    access = {
      kind: 'unavailable',
      message: 'We could not verify your secure session. Please try again.',
    };
  else if (entry.isPending) access = { kind: 'loading' };
  else if (entry.isError)
    access = {
      kind: 'unavailable',
      message: 'We could not reach the sanctuary service. Please try again.',
    };
  else access = fromEntry(entry.data);

  return <AccessScope access={access}>{children}</AccessScope>;
}

async function readEntry(token: string, subject: string): Promise<AuthorizedEntryResult> {
  const origin = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!origin) throw new Error('Sanctuary services are not configured in this build.');
  assertSecureApiUrl(origin);
  const entry = await readV1Entry(origin, token);
  return mapAuthorizedEntry(authoritativeFacts(entry, subject, cookie(ACTIVE_BOND_COOKIE)));
}

function fromEntry(entry: AuthorizedEntryResult): Access {
  if (entry.kind !== 'ready')
    return entry.kind === 'onboarding-required' ? { kind: entry.kind } : entry;
  return {
    kind: 'ready',
    session: {
      surface: 'sanctuary',
      accountId: entry.accountId,
      displayName: entry.displayName,
      capacity: entry.activeCapacity,
      primaryCapacity: entry.primaryCapacity,
      roleLabel: entry.primaryScopeRole,
      authSubjectId: entry.authSubjectId,
      activeScope: entry.activeScope,
    },
  };
}

/** Local development only: `?dev=true&role=PRINCIPAL&name=…` previews a capacity without an account. */
function developmentPreview(): Access | null {
  if (!import.meta.env.DEV) return null;
  const params = new URLSearchParams(window.location.search);
  const preview = resolveSanctuaryDevSession({
    host: window.location.host,
    searchParams: Object.fromEntries(params),
    cookieStore: {
      get: (name) => (cookie(name) === undefined ? undefined : { value: cookie(name) ?? '' }),
    },
  });
  if (!preview.isDevSession) return null;
  return {
    kind: 'ready',
    session: {
      surface: 'sanctuary',
      accountId: preview.accountId,
      authSubjectId: preview.accountId,
      displayName: preview.displayName,
      capacity: preview.capacity,
      primaryCapacity: preview.capacity,
      roleLabel: preview.capacity,
    },
  };
}

function cookie(name: string): string | undefined {
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`));
  return match === undefined ? undefined : decodeURIComponent(match.slice(name.length + 1));
}

/**
 * The account's sources. Announcements and notifications have no v1 procedure yet, so the account
 * sees the same samples the server pages show; each becomes `v1.….queryOptions()` when it lands.
 */
export const sources: Sources = {
  announcements: () => ({
    queryKey: ['account', 'announcements'],
    queryFn: async () => getExploreSampleAnnouncements(),
  }),
  notifications: () => ({
    queryKey: ['account', 'notifications'],
    queryFn: async () => notificationFeed('sanctuary'),
  }),
  communityGroups: () => ({
    queryKey: ['account', 'community-groups'],
    queryFn: async () => {
      const token = await accessToken();
      if (token) return loadCommunityGroups(token);
      // A development preview has no account behind it, so it browses the sample circles.
      if (import.meta.env.DEV)
        return { kind: 'ready', groups: [...EXPLORE_COMMUNITY_GROUPS], hasMore: false };
      return { kind: 'unavailable' };
    },
  }),
};

async function accessToken(): Promise<string | undefined> {
  const { data } = (await createBrowserSupabaseClient()?.auth.getSession()) ?? {
    data: { session: null },
  };
  return data.session?.access_token;
}

export const accountHome: AccountHome = { kind: 'here' };

/** An account changes role by changing bond, outside the page. */
export const roles: Roles | undefined = undefined;
