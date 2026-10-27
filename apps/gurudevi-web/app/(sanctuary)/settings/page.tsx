import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { classifyGurudeviHost, isLocalPreviewHost } from '../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { SettingsFloor } from './SettingsFloor';

export const metadata = { title: 'Settings | Gurudevi Sanctuary' };

export default async function SettingsPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const isExploreHost = classifyGurudeviHost(host) === 'explore';
  const supabase = isExploreHost ? null : await createServerSupabaseClient();
  const isExplore = isExploreHost || (!supabase && isLocalPreviewHost(host));

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

  if (!supabase) {
    return (
      <SettingsState
        action={
          <div
            style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href={signInPath('/settings')}>Sign in</Link>
            <Link href="/welcome">Welcome Gate</Link>
            <a href="https://explore.gurudevi.app">Guest House ↗</a>
          </div>
        }
        displayName="Explorer"
        title="Settings are private"
        detail="Sign in to customize your appearance, notifications, and security settings."
      />
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    if (isLocalPreviewHost(host)) {
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
    return (
      <SettingsState
        action={
          <div
            style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href={signInPath('/settings')}>Sign in</Link>
            <Link href="/welcome">Welcome Gate</Link>
            <a href="https://explore.gurudevi.app">Guest House ↗</a>
          </div>
        }
        displayName="Explorer"
        detail="Sign in to customize your appearance, notifications, and security settings."
        title="Settings are private"
      />
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <SettingsState
        action={
          <div
            style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/onboarding">Complete Enrollment</Link>
            <Link href="/welcome">Welcome Gate</Link>
          </div>
        }
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish onboarding before accessing your sanctuary settings."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <SettingsState
        action={
          <div
            style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/welcome">Return to Welcome Gate</Link>
            <a href="https://explore.gurudevi.app">Guest House ↗</a>
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
