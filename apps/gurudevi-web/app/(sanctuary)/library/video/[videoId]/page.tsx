import { headers } from 'next/headers';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '../../../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../../lib/supabase/server';
import { signInPath } from '../../../auth/routeSafety';
import { SanctuaryShell } from '../../../components/SanctuaryShell';
import { VideoPlayerFloor } from './VideoPlayerFloor';

export const metadata = { title: 'Video Lecture | Gurudevi Sanctuary' };

interface VideoPlayerPageProps {
  params: Promise<{ videoId: string }>;
}

export default async function VideoPlayerPage({ params }: VideoPlayerPageProps) {
  const { videoId } = await params;
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const isExplore = classifyGurudeviHost(host) === 'explore';

  if (isExplore) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <VideoPlayerFloor videoId={videoId} displayName="Guest Explorer" />
      </SanctuaryShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <VideoPlayerFloor videoId={videoId} displayName="Guest Explorer" />
      </SanctuaryShell>
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <VideoPlayerFloor videoId={videoId} displayName="Guest Explorer" />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <VideoState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Finish onboarding before accessing video lectures."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <VideoState
        displayName="Explorer"
        title="Video player is unavailable"
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
      <VideoPlayerFloor
        videoId={videoId}
        displayName={entry.displayName}
        capacity={entry.activeCapacity}
      />
    </SanctuaryShell>
  );
}

function VideoState({
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
