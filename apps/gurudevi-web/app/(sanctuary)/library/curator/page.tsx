import { headers } from 'next/headers';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '../../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { signInPath } from '../../auth/routeSafety';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { CuratorReviewFloor } from './CuratorReviewFloor';

export const metadata = { title: 'Curator Studio | Gurudevi Sanctuary' };

export default async function CuratorPage() {
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
        <CuratorReviewFloor displayName="Guest Explorer" capacity="guest" />
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
        <CuratorReviewFloor displayName="Guest Explorer" capacity="guest" />
      </SanctuaryShell>
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Sign-in required</h2>
        <p>Curator review requires an authenticated educator or moderator account.</p>
        <Link href={signInPath('/library/curator')}>Sign In</Link>
      </div>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Complete enrollment first</h2>
        <p>Choose your capacity to enter the Curator Studio.</p>
      </div>
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Curator studio is unavailable</h2>
        <p>{entry.message}</p>
      </div>
    );
  }

  return (
    <SanctuaryShell
      displayName={entry.displayName}
      navigationPrefix=""
      activeCapacity={entry.activeCapacity}
    >
      <CuratorReviewFloor displayName={entry.displayName} capacity={entry.activeCapacity} />
    </SanctuaryShell>
  );
}
