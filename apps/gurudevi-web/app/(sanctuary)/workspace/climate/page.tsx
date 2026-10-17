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
      <ClimateState
        displayName="Explorer"
        title="Climate sensing is unavailable"
        detail="Browser sign-in is not configured in this environment."
      />
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <ClimateState
        action={<Link href={signInPath('/workspace/climate')}>Sign in</Link>}
        displayName="Explorer"
        detail="Sign in to submit and view classroom climate sensing pulses."
        title="Climate sensing is private"
      />
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
