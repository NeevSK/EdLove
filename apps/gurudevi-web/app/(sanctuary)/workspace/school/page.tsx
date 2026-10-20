import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { signInPath } from '../../auth/routeSafety';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { SchoolFloor } from './SchoolFloor';

export const metadata = {
  title: 'School Profile | Gurudevi Sanctuary',
  description:
    'Institutional identity, national census fact binding, Roll of Honor, and sanctuary credentials.',
};

export default async function SchoolProfileWorkspacePage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell displayName="Guest Explorer" navigationPrefix="" isExploreMode={true}>
        <SchoolFloor schoolId="school-ananda-colombo" isLeader={false} />
      </SanctuaryShell>
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <SanctuaryShell displayName="Guest Explorer" navigationPrefix="" isExploreMode={true}>
        <SchoolFloor schoolId="school-ananda-colombo" isLeader={false} />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <SchoolProfileState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish onboarding before accessing the school institutional profile."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <SchoolProfileState
        displayName="Explorer"
        title="School profile is unavailable"
        detail={entry.message}
      />
    );
  }

  const schoolId =
    entry.activeScope && entry.activeScope.entityType === 'SCHOOL'
      ? entry.activeScope.entityId
      : 'school-ananda-colombo';

  const isLeader =
    entry.activeCapacity === 'principal' ||
    entry.activeCapacity === 'section_head' ||
    entry.activeCapacity === 'admin' ||
    (entry.activeScope?.roles?.includes('principal') ?? false);

  return (
    <SanctuaryShell
      displayName={entry.displayName}
      navigationPrefix=""
      activeCapacity={entry.activeCapacity}
    >
      <main id="main-content" className="sanctuary-container">
        <SchoolFloor schoolId={schoolId} isLeader={isLeader} />
      </main>
    </SanctuaryShell>
  );
}

function SchoolProfileState({
  action,
  detail,
  displayName,
  title,
}: Readonly<{
  action?: ReactNode;
  detail: string;
  displayName: string;
  title: string;
}>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <main id="main-content" className="sanctuary-container">
        <section aria-live="polite" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <p
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.8rem',
              color: '#7A1C20',
              fontWeight: 700,
            }}
          >
            Institutional Profile
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0' }}>{title}</h1>
          <p style={{ maxWidth: 500, margin: '0 auto 1.5rem', color: '#666', lineHeight: 1.6 }}>
            {detail}
          </p>
          {action}
        </section>
      </main>
    </SanctuaryShell>
  );
}
