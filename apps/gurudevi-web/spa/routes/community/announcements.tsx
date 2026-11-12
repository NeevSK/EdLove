import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementsFloor } from '../../../app/(sanctuary)/community/announcements/AnnouncementsFloor';
import { SanctuaryShell } from '../../../app/(sanctuary)/components/SanctuaryShell';
import { getExploreSampleAnnouncements } from '../../../lib/community/announcements-contract';

export const Route = createFileRoute('/community/announcements')({
  component: ExploreRoute,
});

function ExploreRoute() {
  const announcements = getExploreSampleAnnouncements();
  return (
    <SanctuaryShell
      displayName="Guest Explorer"
      navigationPrefix=""
      showAccountNavigation={true}
      isExploreMode={true}
    >
      <AnnouncementsFloor
        announcements={announcements}
        displayName="Guest Explorer"
        isExplore={true}
      />
    </SanctuaryShell>
  );
}
