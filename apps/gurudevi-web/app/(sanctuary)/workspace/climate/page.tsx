import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { signInPath } from '../../auth/routeSafety';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { ClimateSensingFloor } from './ClimateSensingFloor';

export const metadata = { title: 'Climate Pulse | Gurudevi Sanctuary' };

export default async function ClimatePage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <ClimateSensingFloor displayName="Guest Explorer" capacity="TEACHER" />
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
        <ClimateSensingFloor displayName="Guest Explorer" capacity="TEACHER" />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <ClimateState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish onboarding before accessing classroom climate pulses."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <ClimateState
        displayName="Explorer"
        title="Climate sensing is unavailable"
        detail={entry.message}
      />
    );
  }

  const isAuthorized =
    entry.activeCapacity === 'teacher' ||
    entry.activeCapacity === 'principal' ||
    entry.activeCapacity === 'assistantPrincipal' ||
    entry.activeCapacity === 'gradeHead' ||
    entry.activeCapacity === 'sectionHead' ||
    entry.activeCapacity === 'admin' ||
    entry.activeCapacity === 'founder' ||
    entry.activeCapacity === 'developer' ||
    (entry.activeScope?.roles?.some((r) => ['teacher', 'principal', 'admin', 'founder'].includes(r)) ?? false);

  if (!isAuthorized) {
    return (
      <ClimateState
        displayName={entry.displayName}
        title="Access restricted"
        detail="Classroom climate sensing and psychological pulse sensing are reserved for educators and administrators."
      />
    );
  }

  return (
    <SanctuaryShell
      displayName={entry.displayName}
      navigationPrefix=""
      activeCapacity={entry.activeCapacity}
    >
      <ClimateSensingFloor displayName={entry.displayName} capacity={entry.activeCapacity} />
    </SanctuaryShell>
  );
}

function ClimateState({
  title,
  detail,
  action,
  displayName,
}: Readonly<{
  title: string;
  detail: string;
  action?: ReactNode;
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
        {action && <div style={{ marginTop: '1.5rem' }}>{action}</div>}
      </div>
    </SanctuaryShell>
  );
}
