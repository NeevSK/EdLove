import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { classifyGurudeviHost, isLocalPreviewHost } from '../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { ProfileFloor } from './ProfileFloor';
import styles from './profile.module.css';

export const metadata = { title: 'Profile | Gurudevi Sanctuary' };

/**
 * The first browser profile slice intentionally presents only identity facts
 * returned by the verified Sanctuary entry contract. Editing and expanded
 * profile fields remain out of scope until their browser contracts exist.
 */
export default async function ProfilePage() {
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
        <ProfileFloor
          accountId="guest-explorer"
          displayName="Guest Explorer"
          primaryScopeRole="Guest Explorer"
          isExplore={true}
        />
      </SanctuaryShell>
    );
  }

  if (!supabase) {
    return (
      <ProfileState
        action={
          <div className={styles.actionRow}>
            <Link className={styles.action} href={signInPath('/profile')}>
              Sign in
            </Link>
            <a className={styles.secondaryAction} href="https://explore.gurudevi.app">
              Explore in Guest House ↗
            </a>
          </div>
        }
        detail="To view your verified educator or student profile, sign in to your sanctuary account."
        eyebrow="Personal Sanctuary"
        title="Sanctuary Profile"
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
          <ProfileFloor
            accountId="guest-explorer"
            displayName="Guest Explorer"
            primaryScopeRole="Guest Explorer"
            isExplore={true}
          />
        </SanctuaryShell>
      );
    }
    return (
      <ProfileState
        action={
          <div className={styles.actionRow}>
            <Link className={styles.action} href={signInPath('/profile')}>
              Sign in
            </Link>
            <Link className={styles.secondaryAction} href="/sign-up?returnTo=/onboarding">
              Create account
            </Link>
          </div>
        }
        detail="Sign in to view the identity associated with your Gurudevi sanctuary."
        eyebrow="Personal Sanctuary"
        title="Your profile is private"
      />
    );
  }
  if (entry.kind === 'onboarding-required') {
    return (
      <ProfileState
        action={
          <div className={styles.actionRow}>
            <Link className={styles.action} href="/onboarding">
              Complete Enrollment
            </Link>
            <Link className={styles.secondaryAction} href="/welcome">
              Welcome Gate
            </Link>
          </div>
        }
        detail={onboardingDetail(entry.reason)}
        eyebrow="Profile"
        title="Complete your enrollment first"
      />
    );
  }
  if (entry.kind === 'inactive') {
    return (
      <ProfileState
        action={
          <div className={styles.actionRow}>
            <Link className={styles.action} href="/welcome">
              Return to Welcome Gate
            </Link>
            <a className={styles.secondaryAction} href="https://explore.gurudevi.app">
              Guest House ↗
            </a>
          </div>
        }
        detail={entry.message}
        eyebrow="Profile"
        title="This profile is inactive"
      />
    );
  }
  if (entry.kind === 'unavailable') {
    return (
      <ProfileState
        action={
          <div className={styles.actionRow}>
            <Link className={styles.action} href="/welcome">
              Return to Welcome Gate
            </Link>
            <Link className={styles.secondaryAction} href={signInPath('/profile')}>
              Sign in again
            </Link>
          </div>
        }
        detail={entry.message}
        eyebrow="Profile"
        title="Profile is temporarily unavailable"
      />
    );
  }

  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <ProfileFloor
        accountId={entry.accountId}
        displayName={entry.displayName}
        primaryScopeRole={entry.primaryScopeRole}
      />
    </SanctuaryShell>
  );
}

function onboardingDetail(
  reason: 'missing-display-name' | 'missing-active-scope' | 'onboarding-incomplete',
) {
  if (reason === 'missing-display-name') {
    return 'Your account needs a display name before your profile identity can be shown.';
  }
  if (reason === 'missing-active-scope') {
    return 'Choose your Personal Sanctuary role before your profile identity can be shown.';
  }
  return 'Your verified account has not completed Gurudevi enrollment yet.';
}

function ProfileState({
  action,
  detail,
  eyebrow,
  title,
  displayName = 'Explorer',
}: Readonly<{
  action?: ReactNode;
  detail: string;
  eyebrow: string;
  title: string;
  displayName?: string;
}>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <main id="main-content" className="sanctuary-container">
        <section className={styles.state} aria-live="polite" aria-labelledby="profile-state-title">
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="profile-state-title">{title}</h1>
          <p>{detail}</p>
          {action}
        </section>
      </main>
    </SanctuaryShell>
  );
}
