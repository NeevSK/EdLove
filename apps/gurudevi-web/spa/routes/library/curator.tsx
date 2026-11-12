import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../../app/(sanctuary)/components/SanctuaryShell';
import { CuratorReviewDesk } from '../../../app/(sanctuary)/library/curator/CuratorReviewDesk';

export const Route = createFileRoute('/library/curator')({
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
      <CuratorReviewDesk displayName="Guest Explorer" capacity="guest" />
    </SanctuaryShell>
  );
}
