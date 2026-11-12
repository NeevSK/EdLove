import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../app/(sanctuary)/components/SanctuaryShell';
import { SelfFloor } from '../../app/(sanctuary)/self/SelfFloor';

export const Route = createFileRoute('/self')({
  component: () => (
    <SanctuaryShell
      displayName="Guest Explorer"
      navigationPrefix=""
      showAccountNavigation={true}
      isExploreMode={true}
    >
      <SelfFloor accountId="explore-guest" displayName="Guest Explorer" initialPracticing={true} />
    </SanctuaryShell>
  ),
});
