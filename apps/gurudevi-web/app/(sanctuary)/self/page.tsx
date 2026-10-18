import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { SelfFloor } from './SelfFloor';

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
      <SanctuaryShell displayName="Guest" navigationPrefix="">
        <SelfFloor accountId="guest" displayName="Guest" initialPracticing={true} />
      </SanctuaryShell>
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
      <SelfFloor
        accountId={entry.accountId}
        displayName={entry.displayName}
        key={entry.accountId}
      />
    </SanctuaryShell>
  );
}

function SelfState({
  action,
  detail,
  title,
  displayName = 'Guest',
}: Readonly<{ action?: ReactNode; detail: string; title: string; displayName?: string }>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <main id="main-content" className="sanctuary-container">
        <section aria-live="polite">
          <p>Self</p>
          <h1>{title}</h1>
          <p>{detail}</p>
          {action}
        </section>
      </main>
    </SanctuaryShell>
  );
}
