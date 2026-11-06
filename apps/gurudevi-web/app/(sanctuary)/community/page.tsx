import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { loadCommunityGroups } from '../../../lib/community/groups';
import { classifyGurudeviHost } from '../../../lib/host-routing';
import { resolveSurfaceUrl } from '../../../lib/surface-urls';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { resolveSanctuaryDevSession } from '../../../lib/sanctuary/devSession';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { CommunityFeedFloor } from './CommunityFeedFloor';
import styles from './community.module.css';
import { EXPLORE_COMMUNITY_GROUPS } from './exploreGroups';

export const metadata = { title: 'Community | Gurudevi Sanctuary' };

function CommunityState({
  action,
  detail,
  title,
  displayName = 'Guest',
}: Readonly<{ action?: ReactNode; detail: string; title: string; displayName?: string }>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <main className={styles.floor} id="main-content">
        <section className={styles.state} aria-live="polite">
          <p className={styles.eyebrow}>Community</p>
          <h1>{title}</h1>
          <p>{detail}</p>
          {action}
        </section>
      </main>
    </SanctuaryShell>
  );
}

interface CommunityPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CommunityPage({ searchParams }: CommunityPageProps = {}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawInviteCode = resolvedSearchParams?.inviteCode;
  const inviteCode = typeof rawInviteCode === 'string' ? rawInviteCode : undefined;

  const rawPillar = resolvedSearchParams?.pillar;
  const initialPillar =
    rawPillar === 'feed' || rawPillar === 'groups' || rawPillar === 'messages'
      ? rawPillar
      : undefined;
  const rawDm = resolvedSearchParams?.dm;
  const initialConversationId = typeof rawDm === 'string' ? rawDm : undefined;
  const initialIncognito =
    resolvedSearchParams?.incognito === 'true' ||
    resolvedSearchParams?.mode === 'incognito';

  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const host = requestHeaders.get('host') ?? '';
  const isExplore =
    classifyGurudeviHost(host) === 'explore' ||
    resolvedSearchParams?.mode === 'explore' ||
    resolvedSearchParams?.surface === 'explore';

  if (isExplore) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <CommunityFeedFloor
          accountId="guest"
          mode="explore"
          result={{ kind: 'ready', groups: [...EXPLORE_COMMUNITY_GROUPS], hasMore: false }}
          inviteCode={inviteCode}
          initialPillar={initialPillar}
          initialConversationId={initialConversationId}
          initialIncognito={initialIncognito}
        />
      </SanctuaryShell>
    );
  }

  const devSession = resolveSanctuaryDevSession({
    searchParams: resolvedSearchParams as any,
    host,
    cookieStore,
  });

  if (devSession.isDevSession) {
    return (
      <SanctuaryShell
        displayName={devSession.displayName}
        isDevPreview
        previewCapacity={devSession.capacity}
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={false}
      >
        <CommunityFeedFloor
          accountId={devSession.accountId}
          primaryCapacity={devSession.capacity}
          mode="account"
          result={{ kind: 'ready', groups: [...EXPLORE_COMMUNITY_GROUPS], hasMore: false }}
          inviteCode={inviteCode}
          initialPillar={initialPillar}
          initialConversationId={initialConversationId}
          initialIncognito={initialIncognito}
        />
      </SanctuaryShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <CommunityFeedFloor
          accountId="guest"
          mode="explore"
          result={{ kind: 'ready', groups: [...EXPLORE_COMMUNITY_GROUPS], hasMore: false }}
          inviteCode={inviteCode}
          initialPillar={initialPillar}
          initialConversationId={initialConversationId}
          initialIncognito={initialIncognito}
        />
      </SanctuaryShell>
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <CommunityFeedFloor
          accountId="guest"
          mode="explore"
          result={{ kind: 'ready', groups: [...EXPLORE_COMMUNITY_GROUPS], hasMore: false }}
          inviteCode={inviteCode}
          initialPillar={initialPillar}
          initialConversationId={initialConversationId}
          initialIncognito={initialIncognito}
        />
      </SanctuaryShell>
    );
  }
  if (entry.kind === 'onboarding-required')
    return (
      <CommunityState
        action={
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link href="/onboarding">Continue Enrollment</Link>
            <Link href="/welcome">Guest House</Link>
          </div>
        }
        title="Choose your first role"
        detail="Complete your sanctuary enrollment and select a role before opening shared Community spaces."
      />
    );
  if (entry.kind === 'inactive') {
    redirect('/account-recovery');
  }
  if (entry.kind === 'unavailable')
    return (
      <CommunityState
        action={
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link href="/welcome">Return to Guest House</Link>
            <a href={resolveSurfaceUrl('explore', '/')}>Guest House ↗</a>
          </div>
        }
        title="Community is unavailable"
        detail={entry.message}
      />
    );

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (sessionError || !session?.access_token || session.user.id !== entry.authSubjectId) {
    return (
      <CommunityState
        title="Community is unavailable"
        detail="We could not refresh your verified session. Please try again."
      />
    );
  }

  const result = await loadCommunityGroups(session.access_token);
  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <CommunityFeedFloor
        accountId={entry.accountId}
        primaryCapacity={entry.primaryCapacity}
        result={result}
        inviteCode={inviteCode}
        initialPillar={initialPillar}
        initialConversationId={initialConversationId}
        initialIncognito={initialIncognito}
      />
    </SanctuaryShell>
  );
}
