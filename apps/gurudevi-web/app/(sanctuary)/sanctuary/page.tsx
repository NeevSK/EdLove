import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { signInPath } from '../auth/routeSafety';

export const metadata = { title: 'Sanctuary' };

export default async function SanctuaryPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return <SanctuaryState detail="The sanctuary is not configured for browser sign-in in this environment." title="Sanctuary access is unavailable" />;
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return <SanctuaryState action={<Link className="primary-action" href={signInPath()}>Sign in</Link>} detail="Sign in to continue into your private Gurudevi space." title="Your sanctuary is ready when you are" />;
  }
  if (entry.kind === 'onboarding-required') {
    return <SanctuaryState detail="Your verified account still needs an active Gurudevi capacity before a sanctuary workspace can open. Browser onboarding is not available yet; please use the supported enrollment path." title="Complete your Gurudevi enrollment" />;
  }
  if (entry.kind === 'unavailable') {
    return <SanctuaryState detail="We could not verify your secure session or reach the authoritative sanctuary service. Please try again." title="Sanctuary access is unavailable" />;
  }

  return (
    <SanctuaryState detail={entry.displayName ? `Welcome, ${entry.displayName}. Your verified Gurudevi capacity is ready for the next sanctuary workspace slice.` : 'Your verified Gurudevi capacity is ready for the next sanctuary workspace slice.'} title="Your sanctuary entry is confirmed" />
  );
}

function SanctuaryState({ action, detail, title }: Readonly<{ action?: ReactNode; detail: string; title: string }>) {
  return <main className="sanctuary-shell" id="main-content"><section className="sanctuary-card" aria-live="polite"><p className="kicker">Sanctuary</p><h1>{title}</h1><p>{detail}</p>{action}</section></main>;
}
