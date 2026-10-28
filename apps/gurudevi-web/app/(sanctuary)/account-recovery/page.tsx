import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { AuthFrame } from '../auth/AuthFrame';
import { safeReturnPath } from '../auth/routeSafety';
import { AccountRecoveryFloor } from './AccountRecoveryFloor';

export const metadata: Metadata = {
  title: 'Account Status & Recovery | Gurudevi Sanctuary',
  description: 'Review account status and recovery options',
};

interface AccountRecoveryPageProps {
  searchParams?: Promise<{ returnTo?: string; mode?: string }>;
}

export default async function AccountRecoveryPage({ searchParams }: AccountRecoveryPageProps = {}) {
  const resolved = searchParams ? await searchParams : {};
  const returnTo = safeReturnPath(resolved.returnTo ?? null);
  const mode = resolved.mode;

  if (mode === 'reset') {
    redirect(`/recovery${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`);
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect(`/recovery${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`);
  }

  const entry = await resolveAuthorizedEntry(supabase);

  if (entry.kind === 'inactive') {
    return (
      <AuthFrame
        title="This account is unavailable"
        description="Your account is not available for sanctuary access right now. This screen has not deleted any data."
      >
        <AccountRecoveryFloor message={entry.message} returnTo={returnTo} />
      </AuthFrame>
    );
  }

  if (entry.kind === 'ready') {
    redirect(returnTo || '/workspace');
  }

  if (entry.kind === 'onboarding-required') {
    redirect('/onboarding');
  }

  // If signed-out or unavailable without an active session, forward to credential recovery
  redirect(`/recovery${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`);
}
