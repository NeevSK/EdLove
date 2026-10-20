import { headers } from 'next/headers';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { WorkspaceFloor } from './WorkspaceFloor';

export const metadata = { title: 'Workspace | Gurudevi Sanctuary' };

export default async function WorkspacePage() {
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
        <WorkspaceFloor capacity="TEACHER" displayName="Guest Explorer" mode="explore" />
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
        <WorkspaceFloor capacity="TEACHER" displayName="Guest Explorer" mode="explore" />
      </SanctuaryShell>
    );

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out')
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <WorkspaceFloor capacity="TEACHER" displayName="Guest Explorer" mode="explore" />
      </SanctuaryShell>
    );
  if (entry.kind === 'onboarding-required')
    return (
      <WorkspaceState
        action={
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link href="/onboarding">Continue Enrollment</Link>
            <Link href="/welcome">Welcome Gate</Link>
          </div>
        }
        displayName="Explorer"
        title="Choose your first sanctuary capacity"
        detail="Complete enrollment and select the scope you want to enter."
      />
    );
  if (entry.kind === 'inactive' || entry.kind === 'unavailable')
    return (
      <WorkspaceState
        action={
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link href="/welcome">Return to Welcome Gate</Link>
            <a href="https://explore.gurudevi.app">Guest House ↗</a>
          </div>
        }
        displayName="Explorer"
        title="Workspace is unavailable"
        detail={entry.message}
      />
    );
  if (entry.activeScope.entityType === 'PERSONAL_CLASSROOM')
    return (
      <WorkspaceState
        action={
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link href="/self">Return to Self</Link>
            <Link href="/welcome">Welcome Gate</Link>
          </div>
        }
        displayName={entry.displayName}
        title="Choose a classroom or school bond"
        detail="Personal Sanctuary keeps your private Self work together. Classroom attendance opens only in an institutional classroom or school scope."
      />
    );

  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <WorkspaceFloor
        key={entry.accountId}
        mode="account"
        displayName={entry.displayName}
        capacity={entry.activeCapacity}
        scope={{ bondId: entry.activeScope.bondId, entityId: entry.activeScope.entityId }}
        subjectId={entry.accountId}
      />
    </SanctuaryShell>
  );
}

function WorkspaceState({
  action,
  detail,
  displayName = 'Guest',
  title,
}: Readonly<{ action?: ReactNode; detail: string; displayName?: string; title: string }>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <main id="main-content" className="sanctuary-container">
        <section aria-live="polite">
          <p>Workspace</p>
          <h1>{title}</h1>
          <p>{detail}</p>
          {action}
        </section>
      </main>
    </SanctuaryShell>
  );
}
