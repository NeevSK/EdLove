import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { signInPath } from '../../auth/routeSafety';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { EventsFloor } from './EventsFloor';

export const metadata = { title: 'Programs & Events ERP | Gurudevi Sanctuary' };

export default async function EventsPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <EventsState
        displayName="Explorer"
        title="Institutional ERP is offline"
        detail="Server credentials are not configured in this environment."
      />
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <EventsState
        action={<Link href={signInPath('/workspace/events')}>Sign in</Link>}
        displayName="Explorer"
        detail="Sign in to view institutional programs, event budgets, and physical asset inventories."
        title="Institutional ERP is private"
      />
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <EventsState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish onboarding before accessing the institutional ERP workspace."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <EventsState
        displayName="Explorer"
        title="Institutional ERP is unavailable"
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
      <EventsFloor schoolId="school-ananda-colombo" />
    </SanctuaryShell>
  );
}

function EventsState({
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
      <section style={{ maxWidth: '48rem', margin: '3rem auto', padding: '0 1rem' }}>
        <div
          style={{
            background: 'var(--card, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '0.75rem',
            padding: '2rem',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--muted-foreground, #64748b)',
              margin: '0 0 0.5rem 0',
            }}
          >
            Programs & Events ERP
          </p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{title}</h2>
          <p style={{ color: 'var(--muted-foreground, #64748b)', margin: '0 0 1.5rem 0' }}>
            {detail}
          </p>
          {action}
        </div>
      </section>
    </SanctuaryShell>
  );
}
