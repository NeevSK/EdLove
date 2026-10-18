import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { NotificationsFloor } from './NotificationsFloor';

export const metadata = { title: 'Notifications | Gurudevi Sanctuary' };

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <NotificationsState
        displayName="Explorer"
        title="Notifications are unavailable"
        detail="Browser sign-in is not configured in this environment."
      />
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <NotificationsState
        action={<Link href={signInPath('/notifications')}>Sign in</Link>}
        displayName="Explorer"
        detail="Sign in to view alerts and updates from your learning circles."
        title="Notifications are private"
      />
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <NotificationsState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish onboarding before accessing your notification center."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <NotificationsState
        displayName="Explorer"
        title="Notifications are unavailable"
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
      <NotificationsFloor displayName={entry.displayName} />
    </SanctuaryShell>
  );
}

function NotificationsState({
  action,
  detail,
  displayName,
  title,
}: Readonly<{ action?: ReactNode; detail: string; displayName: string; title: string }>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <main id="main-content" className="sanctuary-container">
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
    </SanctuaryShell>
  );
}
