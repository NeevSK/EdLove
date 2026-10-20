import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { signInPath } from '../../auth/routeSafety';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { WorkspaceState } from '../WorkspaceState';
import { PlanFloor } from './PlanFloor';

export const metadata = { title: 'Plan & Calm Notices | Gurudevi Sanctuary' };

export default async function PlanPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <PlanFloor displayName="Guest Explorer" initialCapacity="TEACHER" />
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
        <PlanFloor displayName="Guest Explorer" initialCapacity="TEACHER" />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <WorkspaceState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Select your school or classroom capacity before opening the Plan workspace."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <WorkspaceState
        displayName="Explorer"
        title="Plan workspace is unavailable"
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
      <PlanFloor initialCapacity={entry.activeCapacity} displayName={entry.displayName} />
    </SanctuaryShell>
  );
}
