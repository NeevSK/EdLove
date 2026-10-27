import type { Metadata } from 'next';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { GuardianFloor } from './GuardianFloor';

export const metadata: Metadata = {
  title: 'Guardian Portal | Gurudevi Sanctuary',
  description: 'Learner presence, progress tracking, and institutional family communication bridge.',
};

export default async function GuardianPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <GuardianFloor displayName="Guest Explorer" isExplore={true} />
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
        <GuardianFloor displayName="Guest Explorer" isExplore={true} />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <GuardianState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Register your learner enrollment before accessing the Guardian Portal."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <GuardianState
        displayName="Explorer"
        title="Guardian portal unavailable"
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
      <GuardianFloor displayName={entry.displayName} isExplore={false} />
    </SanctuaryShell>
  );
}

function GuardianState({
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
