import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { SelfJournalFloor } from './SelfJournalFloor';

export const metadata = { title: 'Self | Gurudevi Sanctuary' };

export default async function SelfPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase)
    return (
      <SelfState
        detail="Self is not configured for browser sign-in in this environment."
        title="Self is unavailable"
      />
    );

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <SelfState
        action={<Link href={signInPath('/self')}>Sign in</Link>}
        detail="Sign in to enter your private Self space."
        title="Your Self space is private"
      />
    );
  }
  if (entry.kind === 'onboarding-required')
    return (
      <SelfState
        action={<Link href="/onboarding">Continue enrollment</Link>}
        detail="Complete your Gurudevi enrollment before opening Self."
        title="Complete your enrollment first"
      />
    );
  if (entry.kind === 'inactive' || entry.kind === 'unavailable')
    return <SelfState detail={entry.message} title="Self is unavailable" />;

  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <SelfJournalFloor displayName={entry.displayName} />
    </SanctuaryShell>
  );
}

function SelfState({
  action,
  detail,
  title,
}: Readonly<{ action?: ReactNode; detail: string; title: string }>) {
  return (
    <main id="main-content">
      <section aria-live="polite">
        <p>Self</p>
        <h1>{title}</h1>
        <p>{detail}</p>
        {action}
      </section>
    </main>
  );
}
