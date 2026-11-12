import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../../app/(sanctuary)/components/SanctuaryShell';
import { WorkspaceFloor } from '../../../app/(sanctuary)/workspace/WorkspaceFloor';

export const Route = createFileRoute('/workspace/')({
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
      <WorkspaceFloor capacity="TEACHER" displayName="Guest Explorer" mode="explore" />
    </SanctuaryShell>
  );
}
