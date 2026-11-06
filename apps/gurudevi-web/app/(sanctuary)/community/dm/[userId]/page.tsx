import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '../../../../../lib/host-routing';
import { SanctuaryShell } from '../../../components/SanctuaryShell';
import { DirectMessageFloor } from './DirectMessageFloor';

export const metadata = { title: 'Direct Message | Gurudevi Sanctuary' };

interface DirectMessagePageProps {
  params: Promise<{ userId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DirectMessagePage({ params, searchParams }: DirectMessagePageProps) {
  const { userId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const isExplore =
    classifyGurudeviHost(host) === 'explore' ||
    resolvedSearchParams?.mode === 'explore' ||
    resolvedSearchParams?.surface === 'explore';

  const query = new URLSearchParams();
  query.set('pillar', 'messages');
  if (userId) {
    query.set('dm', userId);
  }
  if (isExplore) {
    query.set('mode', 'explore');
  }

  redirect(`/community?${query.toString()}`);
}

function DmState({
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