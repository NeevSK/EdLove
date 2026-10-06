import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { LibraryFloor } from './LibraryFloor';

export const metadata = { title: 'Library | Gurudevi Sanctuary' };

export default async function LibraryPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase)
    return (
      <LibraryState
        detail="Library is not configured for browser sign-in."
        title="Library unavailable"
      />
    );

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out')
    return (
      <LibraryState
        action={<Link href={signInPath('/library')}>Sign in</Link>}
        detail="Sign in to browse resources available to your account and selected Sanctuary scope."
        title="Your Library is ready when you are"
      />
    );
  if (entry.kind === 'onboarding-required')
    return (
      <LibraryState
        detail="Choose your Sanctuary capacity to open Library."
        title="Complete your enrollment first"
      />
    );
  if (entry.kind === 'inactive' || entry.kind === 'unavailable')
    return <LibraryState detail={entry.message} title="Library is unavailable" />;

  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <LibraryFloor accountId={entry.authSubjectId} displayName={entry.displayName} />
    </SanctuaryShell>
  );
}

function LibraryState({
  action,
  detail,
  title,
}: Readonly<{ action?: ReactNode; detail: string; title: string }>) {
  return (
    <main id="main-content">
      <section aria-live="polite">
        <p>Library</p>
        <h1>{title}</h1>
        <p>{detail}</p>
        {action}
      </section>
    </main>
  );
}
