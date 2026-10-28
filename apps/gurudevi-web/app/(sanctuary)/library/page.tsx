import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { resolveSanctuaryDevSession } from '../../../lib/sanctuary/devSession';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { LibraryFloor } from './LibraryFloor';

export const metadata = { title: 'Library | Gurudevi Sanctuary' };

export default async function LibraryPage({
  searchParams,
}: {
  searchParams?: Promise<{
    mode?: string;
    surface?: string;
    dev?: string;
    role?: string;
    name?: string;
  }>;
} = {}) {
  const params = searchParams ? await searchParams : undefined;
  const requestHeaders = await headers();
  const cookieStore = await cookies();
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
        <LibraryFloor accountId="explore-guest" displayName="Guest Explorer" mode="explore" />
      </SanctuaryShell>
    );
  }

  const devSession = resolveSanctuaryDevSession({
    searchParams: params,
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
        <LibraryFloor
          accountId={devSession.accountId}
          displayName={devSession.displayName}
          mode="account"
        />
      </SanctuaryShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect('/welcome?returnTo=/library');
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    redirect('/welcome?returnTo=/library');
  }
  if (entry.kind === 'onboarding-required')
    return (
      <LibraryState
        detail="Choose your Sanctuary capacity to open Library."
        title="Complete your enrollment first"
      />
    );
  if (entry.kind === 'inactive') {
    redirect('/account-recovery');
  }
  if (entry.kind === 'unavailable')
    return <LibraryState detail={entry.message} title="Library is unavailable" />;

  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <LibraryFloor accountId={entry.accountId} displayName={entry.displayName} />
    </SanctuaryShell>
  );
}

function LibraryState({
  action,
  detail,
  title,
  displayName = 'Guest',
}: Readonly<{ action?: ReactNode; detail: string; title: string; displayName?: string }>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <main id="main-content" className="sanctuary-container">
        <section aria-live="polite">
          <p>Library</p>
          <h1>{title}</h1>
          <p>{detail}</p>
          {action}
        </section>
      </main>
    </SanctuaryShell>
  );
}
