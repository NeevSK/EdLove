import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '../../../lib/host-routing';
import { resolveSurfaceUrl } from '../../../lib/surface-urls';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { resolveSanctuaryDevSession } from '../../../lib/sanctuary/devSession';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { SettingsFloor } from './SettingsFloor';

export const metadata = { title: 'Settings | Gurudevi Sanctuary' };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    mode?: string;
    surface?: string;
    dev?: string;
    role?: string;
    name?: string;
  }>;
} = {}) {
  const params = searchParams ? await searchParams : undefined;
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const host = requestHeaders.get('host') ?? '';
  const isExplore =
    classifyGurudeviHost(host) === 'explore' ||
    params?.mode === 'explore' ||
    params?.surface === 'explore';

  if (isExplore) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <SettingsFloor displayName="Guest Explorer" isExplore={true} />
      </SanctuaryShell>
    );
  }

  const devSession = resolveSanctuaryDevSession({
    searchParams: params,
    host,
    cookieStore,
  });

  if (devSession.isDevSession) {
    return (
      <SanctuaryShell
        displayName={devSession.displayName}
        isDevPreview
        previewCapacity={devSession.capacity}
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={false}
      >
        <SettingsFloor displayName={devSession.displayName} isExplore={false} />
      </SanctuaryShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect('/welcome?returnTo=/settings');
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    redirect('/welcome?returnTo=/settings');
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <SettingsState
        action={
          <div
            style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/onboarding">Complete Enrollment</Link>
            <Link href="/welcome">Guest House</Link>
          </div>
        }
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish onboarding before accessing your sanctuary settings."
      />
    );
  }

  if (entry.kind === 'inactive') {
    redirect('/account-recovery');
  }
  if (entry.kind === 'unavailable') {
    return (
      <SettingsState
        action={
          <div
            style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/welcome">Return to Guest House</Link>
            <a href={resolveSurfaceUrl('explore', '/')}>Guest House ↗</a>
          </div>
        }
        displayName="Explorer"
        title="Settings are unavailable"
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
      <SettingsFloor
        accountId={entry.accountId}
        displayName={entry.displayName}
        capacity={entry.activeCapacity}
      />
    </SanctuaryShell>
  );
}

function SettingsState({
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
      <SanctuaryFloorCanvas domain="settings" showPageActions={false}>
        <div
          style={{ maxWidth: '40rem', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}
        >
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
            style={{
              color: 'var(--color-ink-soft, #453c35)',
              marginTop: '0.5rem',
              lineHeight: 1.5,
            }}
          >
            {detail}
          </p>
          {action && <div style={{ marginTop: '1.5rem' }}>{action}</div>}
        </div>
      </SanctuaryFloorCanvas>
    </SanctuaryShell>
  );
}
