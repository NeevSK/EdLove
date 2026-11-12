import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../../app/(sanctuary)/components/SanctuaryShell';
import { LibraryFloor } from '../../../app/(sanctuary)/library/LibraryFloor';

export const Route = createFileRoute('/library/')({
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
      <LibraryFloor accountId="explore-guest" displayName="Guest Explorer" mode="explore" />
    </SanctuaryShell>
  );
}
