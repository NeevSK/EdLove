import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { WorkspaceFloor } from './WorkspaceFloor';

export const metadata = { title: 'Workspace | Gurudevi Sanctuary' };

export default async function WorkspacePage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase)
    return (
      <WorkspaceState
        displayName="Explorer"
        title="Workspace is unavailable"
        detail="Browser sign-in is not configured in this environment."
      />
    );

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out')
    return (
      <WorkspaceState
        action={<Link href={signInPath('/workspace')}>Sign in</Link>}
        displayName="Explorer"
        detail="Sign in to open work connected to your classroom or school bonds."
        title="Your Workspace is private to its bonds"
      />
    );
  if (entry.kind === 'onboarding-required')
    return (
      <WorkspaceState
        displayName="Explorer"
        title="Choose your first sanctuary capacity"
        detail="Complete enrollment and select the scope you want to enter."
      />
    );
  if (entry.kind === 'inactive' || entry.kind === 'unavailable')
    return (
      <WorkspaceState
        displayName="Explorer"
        title="Workspace is unavailable"
        detail={entry.message}
      />
    );
  if (entry.activeScope.entityType === 'PERSONAL_CLASSROOM')
    return (
      <WorkspaceState
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
