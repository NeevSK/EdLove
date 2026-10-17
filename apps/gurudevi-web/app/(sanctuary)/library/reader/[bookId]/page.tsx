import Link from 'next/link';
import type { ReactNode } from 'react';
import { resolveAuthorizedEntry } from '../../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../../lib/supabase/server';
import { signInPath } from '../../../auth/routeSafety';
import { SanctuaryShell } from '../../../components/SanctuaryShell';
import { PDFReaderFloor } from './PDFReaderFloor';

export const metadata = { title: 'Document Reader | Gurudevi Sanctuary' };

interface ReaderPageProps {
  params: Promise<{ bookId: string }>;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { bookId } = await params;
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <ReaderState
        displayName="Explorer"
        title="Document reader is unavailable"
        detail="Browser sign-in is not configured in this environment."
      />
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <ReaderState
        action={<Link href={signInPath(`/library/reader/${bookId}`)}>Sign in</Link>}
        displayName="Explorer"
        detail="Sign in to view library documents and textbooks."
        title="Document reader is private"
      />
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <ReaderState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish onboarding before accessing the document reader."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <ReaderState
        displayName="Explorer"
        title="Document reader is unavailable"
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
      <PDFReaderFloor
        bookId={bookId}
        displayName={entry.displayName}
        capacity={entry.activeCapacity}
      />
    </SanctuaryShell>
  );
}

function ReaderState({
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
