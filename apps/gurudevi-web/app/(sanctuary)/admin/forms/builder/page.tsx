import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../../lib/supabase/server';
import { signInPath } from '../../../auth/routeSafety';
import { SanctuaryShell } from '../../../components/SanctuaryShell';
import { FormBuilderFloor } from './FormBuilderFloor';

export const metadata = { title: 'Form Builder | Gurudevi Sanctuary' };

export default async function FormBuilderPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <FormBuilderState
        displayName="Explorer"
        title="Form builder is unavailable"
        detail="Browser sign-in is not configured in this environment."
      />
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <FormBuilderState
        action={<Link href={signInPath('/admin/forms/builder')}>Sign in</Link>}
        displayName="Explorer"
        detail="Sign in to create and manage institutional forms."
        title="Form builder is private"
      />
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <FormBuilderState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish onboarding before accessing the form builder."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <FormBuilderState
        displayName="Explorer"
        title="Form builder is unavailable"
        detail={entry.message}
      />
    );
  }

  return (
    <SanctuaryShell
      displayName={entry.displayName}
      navigationPrefix=""
      activeCapacity={entry.activeCapacity}
    >
      <FormBuilderFloor displayName={entry.displayName} capacity={entry.activeCapacity} />
    </SanctuaryShell>
  );
}

function FormBuilderState({
  title,
  detail,
  action,
  displayName,
}: Readonly<{
  title: string;
  detail: string;
  action?: ReactNode;
  displayName: string;
}>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <div style={{ maxWidth: '40rem', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display, "Fraunces", serif)',
            fontSize: '1.5rem',
            color: 'var(--color-ink, #131e27)',
          }}
        >
          {title}
        </h2>
        <p
          style={{ color: 'var(--color-ink-soft, #453c35)', marginTop: '0.5rem', lineHeight: 1.5 }}
        >
          {detail}
        </p>
        {action && <div style={{ marginTop: '1.5rem' }}>{action}</div>}
      </div>
    </SanctuaryShell>
  );
}
