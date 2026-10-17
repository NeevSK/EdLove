import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { signInPath } from '../../auth/routeSafety';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { LibraryMapFloor } from './LibraryMapFloor';

export const metadata = { title: 'Library Map | Gurudevi Sanctuary' };

export default async function LibraryMapPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <MapState
        displayName="Explorer"
        title="Library map is unavailable"
        detail="Browser sign-in is not configured in this environment."
      />
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <MapState
        action={<Link href={signInPath('/library/map')}>Sign in</Link>}
        displayName="Explorer"
        detail="Sign in to explore provincial learning centers and library maps."
        title="Library map is private"
      />
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <MapState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish onboarding before accessing the learning centers map."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <MapState displayName="Explorer" title="Library map is unavailable" detail={entry.message} />
    );
  }

  return (
    <SanctuaryShell
      displayName={entry.displayName}
      navigationPrefix=""
      activeCapacity={entry.activeCapacity}
    >
      <LibraryMapFloor displayName={entry.displayName} capacity={entry.activeCapacity} />
    </SanctuaryShell>
  );
}

function MapState({
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
