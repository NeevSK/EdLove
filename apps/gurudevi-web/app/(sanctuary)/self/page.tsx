import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { SelfFloor } from './SelfFloor';

export const metadata = { title: 'Self | Gurudevi Sanctuary' };

export default async function SelfPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string; surface?: string }>;
}) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const isExplore =
    classifyGurudeviHost(host) === 'explore' ||
    params?.mode === 'explore' ||
    params?.surface === 'explore';

  if (isExplore) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <SelfFloor
          accountId="explore-guest"
          displayName="Guest Explorer"
          initialPracticing={true}
        />
      </SanctuaryShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return <SelfFloorGuestFallback />;
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
        <SelfFloor accountId="explore-guest" displayName="Guest Explorer" initialPracticing={true} />
      </SanctuaryShell>
    );
  }
  if (entry.kind === 'onboarding-required') {
    redirect('/onboarding');
  }
  if (entry.kind === 'inactive' || entry.kind === 'unavailable')
    return <SelfState detail={entry.message} title="Self is unavailable" />;

  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <SelfFloor
        accountId={entry.accountId}
        displayName={entry.displayName}
        initialCapacity={entry.activeCapacity}
        key={entry.accountId}
      />
    </SanctuaryShell>
  );
}

function SelfState({
  action,
  detail,
  title,
  displayName = 'Guest',
}: Readonly<{ action?: ReactNode; detail: string; title: string; displayName?: string }>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <main id="main-content" className="sanctuary-container">
        <section aria-live="polite">
          <p>Self</p>
          <h1>{title}</h1>
          <p>{detail}</p>
          {action}
        </section>
      </main>
    </SanctuaryShell>
  );
}

function SelfFloorGuestFallback() {
  return (
    <SanctuaryShell
      displayName="Guest Explorer"
      navigationPrefix=""
      showAccountNavigation={true}
      isExploreMode={true}
    >
      <SelfFloor accountId="explore-guest" displayName="Guest Explorer" initialPracticing={true} />
    </SanctuaryShell>
  );
}
