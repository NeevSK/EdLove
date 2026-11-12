import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../../app/(sanctuary)/components/SanctuaryShell';
import { ProfileFloor } from '../../../app/(sanctuary)/profile/ProfileFloor';

export const Route = createFileRoute('/profile/')({
  component: ExploreRoute,
});

function ExploreRoute() {
  return (
    <SanctuaryShell
      displayName="Guest Explorer"
      navigationPrefix=""
      showAccountNavigation={true}
      isExploreMode={true}
    >
      <ProfileFloor
        accountId="guest-explorer"
        displayName="Guest Explorer"
        primaryScopeRole="Guest Explorer"
        isExplore={true}
      />
    </SanctuaryShell>
  );
}
