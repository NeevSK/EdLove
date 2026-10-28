import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { resolveSanctuaryDevSession } from '../../../lib/sanctuary/devSession';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { ProfileFloor } from './ProfileFloor';
import styles from './profile.module.css';

export const metadata = { title: 'Profile | Gurudevi Sanctuary' };

/**
 * The first browser profile slice intentionally presents only identity facts
 * returned by the verified Sanctuary entry contract. Editing and expanded
 * profile fields remain out of scope until their browser contracts exist.
 */
type ProfilePageProps = {
  searchParams?: Promise<{ mode?: string; [key: string]: string | string[] | undefined }>;
};

export default async function ProfilePage(props: ProfilePageProps) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const host = requestHeaders.get('host') ?? '';
  const isExplore =
    classifyGurudeviHost(host) === 'explore' ||
    searchParams?.mode === 'explore' ||
    searchParams?.surface === 'explore';

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

  const devSession = resolveSanctuaryDevSession({
    searchParams: searchParams as any,
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
        <ProfileFloor
          accountId={devSession.accountId}
          displayName={devSession.displayName}
          primaryScopeRole={devSession.capacity}
          isExplore={false}
        />
      </SanctuaryShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect('/welcome?returnTo=/profile');
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    redirect('/welcome?returnTo=/profile');
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
              Guest House
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
    redirect('/account-recovery');
  }
  if (entry.kind === 'unavailable') {
    return (
      <ProfileState
        action={
          <div className={styles.actionRow}>
            <Link className={styles.action} href="/welcome">
              Return to Guest House
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
      <SanctuaryFloorCanvas domain="profile" showPageActions={false}>
        <main id="main-content" className="sanctuary-container">
          <section
            className={styles.state}
            aria-live="polite"
            aria-labelledby="profile-state-title"
          >
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 id="profile-state-title">{title}</h1>
            <p>{detail}</p>
            {action}
          </section>
        </main>
      </SanctuaryFloorCanvas>
    </SanctuaryShell>
  );
}
