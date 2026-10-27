import type { Metadata } from 'next';
import Link from 'next/link';
import { resolveAuthorizedEntry } from '../../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../../lib/supabase/server';
import { SanctuaryShell } from '../../../components/SanctuaryShell';
import { ClassroomDetailFloor } from './ClassroomDetailFloor';

export const metadata: Metadata = {
  title: 'Classroom Hub | Gurudevi Sanctuary',
  description: 'Learner roster, curriculum lessons, assignments desk, and pedagogical insights.',
};

export default async function ClassroomDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const classroomId = decodeURIComponent(id);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <ClassroomDetailFloor classroomId={classroomId} displayName="Guest Explorer" isExplore={true} />
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
        <ClassroomDetailFloor classroomId={classroomId} displayName="Guest Explorer" isExplore={true} />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    return (
      <ClassroomState
        displayName="Explorer"
        title="Complete enrollment first"
        detail="Complete your onboarding to view classroom learning journeys."
      />
    );
  }

  if (entry.kind === 'inactive' || entry.kind === 'unavailable') {
    return (
      <ClassroomState
        displayName="Explorer"
        title="Classroom unavailable"
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
      <ClassroomDetailFloor
        classroomId={classroomId}
        displayName={entry.displayName}
        isExplore={false}
      />
    </SanctuaryShell>
  );
}

function ClassroomState({
  title,
  detail,
  displayName,
}: Readonly<{
  title: string;
  detail: string;
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
        <p style={{ color: 'var(--color-ink-soft, #453c35)', marginTop: '0.5rem', lineHeight: 1.5 }}>
          {detail}
        </p>
        <Link
          href="/workspace"
          style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            color: 'var(--color-gold-deep, #9a5b2d)',
            fontWeight: 600,
          }}
        >
          Return to Workspace
        </Link>
      </div>
    </SanctuaryShell>
  );
}
