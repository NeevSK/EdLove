import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';

export const metadata = { title: 'Sanctuary' };

export default async function SanctuaryPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryState
        detail="The sanctuary is not configured for browser sign-in in this environment."
        title="Sanctuary access is unavailable"
      />
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <SanctuaryState
        action={
          <Link className="primary-action" href={signInPath()}>
            Sign in
          </Link>
        }
        detail="Sign in to continue into your private Gurudevi space."
        title="Your sanctuary is ready when you are"
      />
    );
  }
  if (entry.kind === 'onboarding-required') {
    return (
      <SanctuaryState
        detail={onboardingDetail(entry.reason)}
        title="Complete your Gurudevi enrollment"
      />
    );
  }
  if (entry.kind === 'inactive') {
    return <SanctuaryState detail={entry.message} title="This sanctuary account is inactive" />;
  }
  if (entry.kind === 'unavailable') {
    return <SanctuaryState detail={entry.message} title="Sanctuary access is unavailable" />;
  }

  return (
    <SanctuaryState
      detail={`Welcome, ${entry.displayName}. Your verified ${entry.activeCapacity} capacity is ready for the next sanctuary workspace slice.`}
      title="Your sanctuary entry is confirmed"
    />
  );
}

function onboardingDetail(
  reason: 'missing-display-name' | 'missing-active-capacity' | 'onboarding-incomplete',
) {
  if (reason === 'missing-display-name')
    return 'Your account needs a display name before a sanctuary workspace can open.';
  if (reason === 'missing-active-capacity')
    return 'Your account needs an active Gurudevi capacity before a sanctuary workspace can open.';
  return 'Your verified account has not completed Gurudevi enrollment yet.';
}

function SanctuaryState({
  action,
  detail,
  title,
}: Readonly<{ action?: ReactNode; detail: string; title: string }>) {
  return (
    <main className="sanctuary-shell" id="main-content">
      <section className="sanctuary-card" aria-live="polite">
        <p className="kicker">Sanctuary</p>
        <h1>{title}</h1>
        <p>{detail}</p>
        {action}
      </section>
    </main>
  );
}
