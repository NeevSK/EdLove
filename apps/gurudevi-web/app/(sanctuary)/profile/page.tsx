import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';
import styles from './profile.module.css';

export const metadata = { title: 'Profile | Gurudevi Sanctuary' };

/**
 * The first browser profile slice intentionally presents only identity facts
 * returned by the verified Sanctuary entry contract. Editing and expanded
 * profile fields remain out of scope until their browser contracts exist.
 */
export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <ProfileState
        detail="Profile identity cannot be verified because browser sign-in is not configured in this environment."
        eyebrow="Profile"
        title="Profile is unavailable"
      />
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <ProfileState
        action={
          <Link className={styles.action} href={signInPath('/profile')}>
            Sign in
          </Link>
        }
        detail="Sign in to view the identity associated with your Gurudevi sanctuary."
        eyebrow="Profile"
        title="Your profile is private"
      />
    );
  }
  if (entry.kind === 'onboarding-required') {
    return (
      <ProfileState
        detail={onboardingDetail(entry.reason)}
        eyebrow="Profile"
        title="Complete your enrollment first"
      />
    );
  }
  if (entry.kind === 'inactive') {
    return (
      <ProfileState detail={entry.message} eyebrow="Profile" title="This profile is inactive" />
    );
  }
  if (entry.kind === 'unavailable') {
    return <ProfileState detail={entry.message} eyebrow="Profile" title="Profile is unavailable" />;
  }

  return (
    <article className={styles.profile} aria-labelledby="profile-title">
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Profile</p>
        <h1 id="profile-title">Your identity</h1>
        <p>
          This is the verified identity currently available to Sanctuary. Profile editing and
          additional details will appear here once their browser contracts are ready.
        </p>
      </header>
      <section className={styles.identity} aria-label="Verified profile identity">
        <dl>
          <div>
            <dt>Display name</dt>
            <dd>{entry.displayName}</dd>
          </div>
          <div>
            <dt>Selected sanctuary role</dt>
            <dd>{entry.primaryScopeRole}</dd>
          </div>
        </dl>
      </section>
      <p className={styles.readOnly} role="note">
        Read-only profile identity
      </p>
    </article>
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
}: Readonly<{ action?: ReactNode; detail: string; eyebrow: string; title: string }>) {
  return (
    <section className={styles.state} aria-live="polite" aria-labelledby="profile-state-title">
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 id="profile-state-title">{title}</h1>
      <p>{detail}</p>
      {action}
    </section>
  );
}
