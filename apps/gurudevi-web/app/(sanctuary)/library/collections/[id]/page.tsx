import { headers } from 'next/headers';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '../../../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../../lib/supabase/server';
import { signInPath } from '../../../auth/routeSafety';
import { SanctuaryShell } from '../../../components/SanctuaryShell';
import { CollectionDetailFloor } from './CollectionDetailFloor';

export const metadata = { title: 'Collection Details | Gurudevi Sanctuary' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { id } = await params;
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
        <CollectionDetailFloor id={id} displayName="Guest Explorer" />
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
        <CollectionDetailFloor id={id} displayName="Guest Explorer" />
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
        <CollectionDetailFloor id={id} displayName="Guest Explorer" />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Complete enrollment first</h2>
        <p>Choose your Sanctuary capacity to open collections.</p>
      </div>
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Collection is unavailable</h2>
        <p>{entry.message}</p>
      </div>
    );
  }

  return (
    <SanctuaryShell
      displayName={entry.displayName}
      navigationPrefix=""
      activeCapacity={entry.activeCapacity}
    >
      <CollectionDetailFloor id={id} displayName={entry.displayName} capacity={entry.activeCapacity} />
    </SanctuaryShell>
  );
}
