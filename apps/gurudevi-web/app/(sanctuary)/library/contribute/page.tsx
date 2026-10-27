import { headers } from 'next/headers';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '../../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { signInPath } from '../../auth/routeSafety';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { ContributeFloor } from './ContributeFloor';

export const metadata = { title: 'Contribute Material | Gurudevi Sanctuary' };

export default async function ContributePage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const isExplore = classifyGurudeviHost(host) === 'explore';

  if (isExplore) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <ContributeFloor displayName="Guest Explorer" capacity="guest" />
      </SanctuaryShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <ContributeFloor displayName="Guest Explorer" capacity="guest" />
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
        <div style={{ padding: '3rem', textAlign: 'center', color: '#131e27' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Sign-in required</h2>
          <p style={{ opacity: 0.7, marginBottom: '1.25rem' }}>
            Contributing curricular resources requires an active educator or curator account.
          </p>
          <Link
            href={signInPath('/library/contribute')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              background: 'var(--color-action, #a85022)',
              color: '#ffffff',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Sign In to Sanctuary
          </Link>
        </div>
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <div style={{ padding: '3rem', textAlign: 'center', color: '#131e27' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Complete enrollment first</h2>
          <p style={{ opacity: 0.7 }}>Choose your active capacity to contribute resources.</p>
        </div>
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <SanctuaryShell
        displayName="Teacher"
        navigationPrefix=""
        showAccountNavigation={false}
        isExploreMode={false}
      >
        <div style={{ padding: '3rem', textAlign: 'center', color: '#131e27' }}>
          <p style={{ marginBottom: '1rem' }}>{entry.message}</p>
          <Link
            href={signInPath('/library/contribute')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              background: 'var(--color-action, #a85022)',
              color: '#ffffff',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Sign In to Sanctuary
          </Link>
        </div>
      </SanctuaryShell>
    );
  }

  return (
    <SanctuaryShell
      displayName={entry.displayName}
      navigationPrefix=""
      showAccountNavigation={true}
      isExploreMode={false}
    >
      <ContributeFloor displayName={entry.displayName} capacity={entry.activeCapacity} />
    </SanctuaryShell>
  );
}
