import { WorkforceFloor } from './WorkforceFloor';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { SanctuaryShell } from '../../components/SanctuaryShell';

export const metadata: Metadata = {
  title: 'Workforce & Leave Management | Gurudevi Sanctuary',
  description: 'Institutional faculty presence, leave roster, and human capital continuity.',
};

export default async function WorkforcePage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <WorkforceFloor />
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
        <WorkforceFloor />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <WorkforceState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish institutional onboarding before accessing staff management."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <WorkforceState
        displayName="Explorer"
        title="Workforce management is unavailable"
        detail={entry.message}
      />
    );
  }

  const isStaffOrLeader =
    entry.activeCapacity === 'teacher' ||
    entry.activeCapacity === 'principal' ||
    entry.activeCapacity === 'assistantPrincipal' ||
    entry.activeCapacity === 'gradeHead' ||
    entry.activeCapacity === 'sectionHead' ||
    entry.activeCapacity === 'admin' ||
    entry.activeCapacity === 'founder' ||
    entry.activeCapacity === 'developer' ||
    (entry.activeScope?.roles?.some((r) => ['teacher', 'principal', 'admin', 'founder'].includes(r)) ?? false);

  if (!isStaffOrLeader) {
    return (
      <WorkforceState
        displayName={entry.displayName}
        title="Access restricted"
        detail="Workforce directory and leave management are restricted to faculty members and school administrators."
      />
    );
  }

  return (
    <SanctuaryShell
      displayName={entry.displayName}
      navigationPrefix=""
      activeCapacity={entry.activeCapacity}
    >
      <WorkforceFloor />
    </SanctuaryShell>
  );
}

function WorkforceState({
  title,
  detail,
  displayName,
}: Readonly<{
  title: string;
  detail: string;
  displayName: string;
}>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <div style={{ maxWidth: '40rem', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display, "Fraunces", serif)',
            fontSize: '1.5rem',
            color: 'var(--color-ink, #131e27)',
          }}
        >
          {title}
        </h2>
        <p
          style={{ color: 'var(--color-ink-soft, #453c35)', marginTop: '0.5rem', lineHeight: 1.5 }}
        >
          {detail}
        </p>
      </div>
    </SanctuaryShell>
  );
}
