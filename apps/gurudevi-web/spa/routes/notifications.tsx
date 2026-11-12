import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../app/(sanctuary)/components/SanctuaryShell';
import { NotificationsFloor } from '../../app/(sanctuary)/notifications/NotificationsFloor';

export const Route = createFileRoute('/notifications')({
  component: ExploreRoute,
});

function ExploreRoute() {
  return (
    <SanctuaryShell
      displayName="Guest Explorer"
      navigationPrefix=""
      showAccountNavigation={true}
      isExploreMode={true}
      unreadNotifications={2}
    >
      <NotificationsFloor displayName="Guest Explorer" isExplore={true} />
    </SanctuaryShell>
  );
}
