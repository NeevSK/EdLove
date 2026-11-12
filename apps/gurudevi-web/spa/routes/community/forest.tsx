import { createFileRoute } from '@tanstack/react-router';
import { SchoolForestFloor } from '../../../app/(sanctuary)/community/forest/SchoolForestFloor';
import { SanctuaryShell } from '../../../app/(sanctuary)/components/SanctuaryShell';

export const Route = createFileRoute('/community/forest')({
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
      <SchoolForestFloor displayName="Guest Explorer" />
    </SanctuaryShell>
  );
}
