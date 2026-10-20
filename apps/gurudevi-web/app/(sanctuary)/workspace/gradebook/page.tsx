import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { signInPath } from '../../auth/routeSafety';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { GradebookFloor } from './GradebookFloor';

export const metadata = { title: 'Gradebook | Gurudevi Sanctuary' };

export default async function GradebookPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <GradebookFloor displayName="Guest Explorer" capacity="TEACHER" />
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
        <GradebookFloor displayName="Guest Explorer" capacity="TEACHER" />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <GradebookState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Select your classroom capacity before opening the Gradebook."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <GradebookState
        displayName="Explorer"
        title="Gradebook is unavailable"
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
      <GradebookFloor displayName={entry.displayName} capacity={entry.activeCapacity} />
    </SanctuaryShell>
  );
}

function GradebookState({
  action,
  detail,
  displayName,
  title,
}: Readonly<{ action?: ReactNode; detail: string; displayName: string; title: string }>) {
  return (
    <main id="main-content">
      <section
        aria-live="polite"
        style={{ padding: '3rem 1.5rem', maxWidth: '36rem', margin: '0 auto' }}
      >
        <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.75rem' }}>
          {title}
        </h1>
        <p style={{ color: 'var(--color-ink-soft, #453c35)', lineHeight: 1.6 }}>{detail}</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft, #453c35)' }}>
          Browsing sanctuary as {displayName}
        </p>
        {action ? <div style={{ marginTop: '1.5rem' }}>{action}</div> : null}
      </section>
    </main>
  );
}
