import { headers } from 'next/headers';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { loadCommunityGroups } from '../../../lib/community/groups';
import { classifyGurudeviHost } from '../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { CommunityFeedFloor } from './CommunityFeedFloor';
import { EXPLORE_COMMUNITY_GROUPS } from './exploreGroups';
import styles from './community.module.css';

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

export default async function CommunityPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const isExplore = classifyGurudeviHost(host) === 'explore';

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
        />
      </SanctuaryShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase)
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
        />
      </SanctuaryShell>
    );

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
            <Link href="/welcome">Welcome Gate</Link>
          </div>
        }
        title="Choose your first role"
        detail="Complete your sanctuary enrollment and select a role before opening shared Community spaces."
      />
    );
  if (entry.kind === 'inactive' || entry.kind === 'unavailable')
    return (
      <CommunityState
        action={
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link href="/welcome">Return to Welcome Gate</Link>
            <a href="https://explore.gurudevi.app">Guest House ↗</a>
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
        primaryCapacity={entry.activeCapacity}
        result={result}
      />
    </SanctuaryShell>
  );
}
