import { cookies, headers } from 'next/headers';
import { GURUDEVI_SCHOOL_WHATSAPP } from '@repo/core/config/publicUrls';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { classifyGurudeviHost } from '../../../lib/host-routing';
import { resolveSurfaceUrl } from '../../../lib/surface-urls';
import { resolveAuthorizedEntry } from '../../../lib/sanctuary/authorizedEntry';
import { resolveSanctuaryDevSession } from '../../../lib/sanctuary/devSession';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { SanctuaryShell } from '../components/SanctuaryShell';
import { WorkspaceFloor } from './WorkspaceFloor';
import { SchoolSetupContact } from './SchoolSetupContact';

export const metadata = { title: 'Workspace | Gurudevi Sanctuary' };

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams?: Promise<{
    mode?: string;
    surface?: string;
    dev?: string;
    role?: string;
    name?: string;
  }>;
}) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const host = requestHeaders.get('host') ?? '';
  const isExplore =
    classifyGurudeviHost(host) === 'explore' ||
    params?.mode === 'explore' ||
    params?.surface === 'explore';

  if (isExplore) {
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <WorkspaceFloor capacity="TEACHER" displayName="Guest Explorer" mode="explore" />
      </SanctuaryShell>
    );
  }

  const devSession = resolveSanctuaryDevSession({
    searchParams: params,
    host,
    cookieStore,
  });

  if (devSession.isDevSession) {
    return (
      <SanctuaryShell
        displayName={devSession.displayName}
        isDevPreview
        previewCapacity={devSession.capacity}
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={false}
      >
        <WorkspaceFloor
          capacity={devSession.capacity}
          displayName={devSession.displayName}
          mode="explore"
          isDevPreview
        />
      </SanctuaryShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect('/welcome?returnTo=/workspace');
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out') {
    redirect('/welcome?returnTo=/workspace');
  }
  if (entry.kind === 'onboarding-required') {
    redirect('/onboarding');
  }
  if (entry.kind === 'inactive') {
    redirect('/account-recovery');
  }
  if (entry.kind === 'unavailable')
    return (
      <WorkspaceState
        action={
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link href="/welcome">Return to Guest House</Link>
            <a href={resolveSurfaceUrl('explore', '/')}>Guest House ↗</a>
          </div>
        }
        displayName="Explorer"
        title="Workspace is unavailable"
        detail={entry.message}
      />
    );
  if (entry.activeScope.entityType === 'PERSONAL_CLASSROOM')
    return (
      <WorkspaceState
        action={
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link href="/self">Return to Self</Link>
            <Link href="/welcome">Guest House</Link>
            <SchoolSetupContact phone={GURUDEVI_SCHOOL_WHATSAPP} />
          </div>
        }
        displayName={entry.displayName}
        title="Choose a classroom or school bond"
        detail={
          entry.activeCapacity?.toLowerCase() === 'teacher'
            ? 'Your personal Sanctuary is ready. Ask your school administrator to connect your account to a school and assign your classrooms. When you have a school or classroom bond, select it to open your shared workspace.'
            : 'Personal Sanctuary keeps your private Self work together. Classroom attendance opens only in an institutional classroom or school scope.'
        }
      />
    );

  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <WorkspaceFloor
        key={entry.accountId}
        mode="account"
        displayName={entry.displayName}
        capacity={entry.activeCapacity}
        scope={{ bondId: entry.activeScope.bondId, entityId: entry.activeScope.entityId }}
        subjectId={entry.accountId}
      />
    </SanctuaryShell>
  );
}

function WorkspaceState({
  action,
  detail,
  displayName = 'Guest',
  title,
}: Readonly<{ action?: ReactNode; detail: string; displayName?: string; title: string }>) {
  return (
    <SanctuaryShell displayName={displayName} navigationPrefix="">
      <main id="main-content" className="sanctuary-container">
        <section aria-live="polite">
          <p>Workspace</p>
          <h1>{title}</h1>
          <p>{detail}</p>
          {action}
        </section>
      </main>
    </SanctuaryShell>
  );
}
