import Link from 'next/link';
import type { ReactNode } from 'react';
import { loadCommunityGroups } from '../../../lib/community/groups';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { CommunityFeedFloor } from './CommunityFeedFloor';
import styles from './community.module.css';

export const metadata = { title: 'Community | Gurudevi Sanctuary' };

export default async function CommunityPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase)
    return (
      <CommunityState
        title="Community is unavailable"
        detail="Browser sign-in is not configured in this environment."
      />
    );

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <CommunityState
        action={
          <Link className={styles.action} href={signInPath('/community')}>
            Sign in
          </Link>
        }
        detail="Sign in to see Community activity authorized for your selected scope."
        title="Community participation belongs to you"
      />
    );
  }
  if (entry.kind === 'onboarding-required')
    return (
      <CommunityState
        title="Choose your first role"
        detail="Complete your sanctuary enrollment and select a role before opening shared Community spaces."
      />
    );
  if (entry.kind === 'inactive' || entry.kind === 'unavailable')
    return <CommunityState title="Community is unavailable" detail={entry.message} />;

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (sessionError || !session?.access_token || session.user.id !== entry.authSubjectId) {
    return (
      <CommunityState
        title="Community is unavailable"
        detail="We could not refresh your verified session. Please try again."
      />
    );
  }

  const result = await loadCommunityGroups(session.access_token);
  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <CommunityFeedFloor accountId={entry.accountId} result={result} />
    </SanctuaryShell>
  );
}

function CommunityState({
  action,
  detail,
  title,
}: Readonly<{ action?: ReactNode; detail: string; title: string }>) {
  return (
    <main className={styles.floor} id="main-content">
      <section className={styles.state} aria-live="polite">
        <p className={styles.eyebrow}>Community</p>
        <h1>{title}</h1>
        <p>{detail}</p>
        {action}
      </section>
    </main>
  );
}
