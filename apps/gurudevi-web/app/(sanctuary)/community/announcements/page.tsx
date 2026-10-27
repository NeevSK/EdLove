import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getExploreSampleAnnouncements } from '../../../../lib/community/announcements-contract';
import { classifyGurudeviHost } from '../../../../lib/host-routing';
import { resolveAuthorizedEntry } from '../../../../lib/sanctuary/authorizedEntry';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { SanctuaryShell } from '../../components/SanctuaryShell';
import { AnnouncementsFloor } from './AnnouncementsFloor';

export const metadata = { title: 'Broadcaster Updates | Gurudevi Sanctuary' };

export default async function AnnouncementsPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const isExplore = classifyGurudeviHost(host) === 'explore';

  if (isExplore) {
    const announcements = getExploreSampleAnnouncements();
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <AnnouncementsFloor announcements={announcements} displayName="Guest Explorer" isExplore={true} />
      </SanctuaryShell>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    const announcements = getExploreSampleAnnouncements();
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <AnnouncementsFloor announcements={announcements} displayName="Guest Explorer" isExplore={true} />
      </SanctuaryShell>
    );
  }

  const entry = await resolveAuthorizedEntry(supabase);
  if (entry.kind === 'signed-out' || entry.kind === 'inactive' || entry.kind === 'unavailable') {
    const announcements = getExploreSampleAnnouncements();
    return (
      <SanctuaryShell
        displayName="Guest Explorer"
        navigationPrefix=""
        showAccountNavigation={true}
        isExploreMode={true}
      >
        <AnnouncementsFloor announcements={announcements} displayName="Guest Explorer" isExplore={true} />
      </SanctuaryShell>
    );
  }

  if (entry.kind === 'onboarding-required') {
    redirect('/onboarding');
  }

  // Account mode announcements
  const announcements = getExploreSampleAnnouncements();
  return (
    <SanctuaryShell displayName={entry.displayName} navigationPrefix="">
      <AnnouncementsFloor
        announcements={announcements}
        displayName={entry.displayName}
        isExplore={false}
      />
    </SanctuaryShell>
  );
}
