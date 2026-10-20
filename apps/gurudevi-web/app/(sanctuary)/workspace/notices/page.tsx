import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { signInPath } from '../../auth/routeSafety';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { WorkspaceState } from '../WorkspaceState';
import { NoticesFloor } from './NoticesFloor';

export const metadata = { title: 'School Notices & Circulars | Gurudevi Sanctuary' };

export default async function NoticesPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <NoticesFloor displayName="Guest Explorer" initialCapacity="TEACHER" />
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
        <NoticesFloor displayName="Guest Explorer" initialCapacity="TEACHER" />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <WorkspaceState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Select your school or classroom capacity before opening Notices."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <WorkspaceState
        displayName="Explorer"
        title="Notices are unavailable"
        detail={entry.message}
      />
    );
  }

  return (
    <SanctuaryShell
      displayName={entry.displayName}
      navigationPrefix=""
      activeCapacity={entry.activeCapacity}
    >
      <NoticesFloor displayName={entry.displayName} initialCapacity={entry.activeCapacity} />
    </SanctuaryShell>
  );
}
