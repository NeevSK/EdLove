import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { signInPath } from '../../auth/routeSafety';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { FounderFloor } from './FounderFloor';

export const metadata = { title: 'Founder Command | Gurudevi Sanctuary' };

export default async function FounderPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <FounderState
        displayName="Explorer"
        title="Founder command is unavailable"
        detail="Browser sign-in is not configured in this environment."
      />
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <FounderState
        action={<Link href={signInPath('/admin/founder')}>Sign in</Link>}
        displayName="Explorer"
        detail="Sign in with founder administrative credentials."
        title="Founder command is private"
      />
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <FounderState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish onboarding before accessing founder command."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <FounderState
        displayName="Explorer"
        title="Founder command is unavailable"
        detail={entry.message}
      />
    );
  }

  const isFounder =
    entry.activeCapacity === 'founder' ||
    entry.activeCapacity === 'developer' ||
    entry.activeCapacity === 'admin' ||
    (entry.activeScope?.roles?.includes('founder') ?? false);

  if (!isFounder) {
    return (
      <FounderState
        displayName={entry.displayName}
        title="Access restricted"
        detail="Founder command is restricted to platform founders and system administrators."
      />
    );
  }

  return (
    <SanctuaryShell
      displayName={entry.displayName}
      navigationPrefix=""
      activeCapacity={entry.activeCapacity}
    >
      <FounderFloor displayName={entry.displayName} capacity={entry.activeCapacity} />
    </SanctuaryShell>
  );
}

function FounderState({
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
