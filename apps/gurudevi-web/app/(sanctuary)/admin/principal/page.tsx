import type { Metadata } from 'next';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { PrincipalFloor } from './PrincipalFloor';

export const metadata: Metadata = {
  title: 'Principal Command Center | Gurudevi Sanctuary',
  description: 'Executive situational intelligence, curriculum pacing, and institutional faculty oversight.',
};

export default async function PrincipalPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <PrincipalFloor displayName="Guest Explorer" isExplore={true} />
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
        <PrincipalFloor displayName="Guest Explorer" isExplore={true} />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <PrincipalState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Complete your institutional credentials before accessing the Principal Command Center."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <PrincipalState
        displayName="Explorer"
        title="Command Center is unavailable"
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
      <PrincipalFloor displayName={entry.displayName} isExplore={false} />
    </SanctuaryShell>
  );
}

function PrincipalState({
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
        <p style={{ color: 'var(--color-ink-soft, #453c35)', marginTop: '0.5rem', lineHeight: 1.5 }}>
          {detail}
        </p>
      </div>
    </SanctuaryShell>
  );
}
