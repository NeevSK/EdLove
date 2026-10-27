import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { KioskFloor } from './KioskFloor';

export const metadata = { title: 'Doorway Ingress Kiosk | Gurudevi Sanctuary' };

export default async function WorkspaceKioskPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <KioskState
        displayName="Explorer"
        title="Kiosk is unavailable"
        detail="Browser authentication is not configured in this environment."
      />
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <SanctuaryShell displayName="Guest" navigationPrefix="" isExploreMode>
        <KioskFloor mode="explore" />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <KioskState
        displayName="Explorer"
        title="Institutional access required"
        detail="Complete enrollment and select an authorized classroom or school scope."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <KioskState
        displayName="Explorer"
        title="Kiosk is unavailable"
        detail={entry.message}
      />
    );
  }

  const isLeaderOrAdmin =
    entry.activeCapacity === 'principal' ||
    entry.activeCapacity === 'assistantPrincipal' ||
    entry.activeCapacity === 'admin' ||
    entry.activeCapacity === 'founder' ||
    entry.activeCapacity === 'developer' ||
    (entry.activeScope?.roles?.some((r) => ['principal', 'admin', 'founder'].includes(r)) ?? false);

  if (!isLeaderOrAdmin) {
    return (
      <KioskState
        displayName={entry.displayName}
        title="Access restricted"
        detail="The doorway ingress kiosk station is restricted to institutional administrators and school leadership."
      />
    );
  }

  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <KioskFloor
        key={entry.accountId}
        mode="account"
        subjectId={entry.accountId}
        scope={{ bondId: entry.activeScope.bondId, entityId: entry.activeScope.entityId }}
      />
    </SanctuaryShell>
  );
}

function KioskState({
  detail,
  displayName = 'Guest',
  title,
}: Readonly<{ detail: string; displayName?: string; title: string }>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <main id="main-content" className="sanctuary-container">
        <section aria-live="polite" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <p style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#9d5b25', fontWeight: 700 }}>
            Doorway Kiosk
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', margin: '0.5rem 0 1rem' }}>{title}</h1>
          <p style={{ color: '#71695f', maxWidth: '32rem', margin: '0 auto' }}>{detail}</p>
        </section>
      </main>
    </SanctuaryShell>
  );
}
