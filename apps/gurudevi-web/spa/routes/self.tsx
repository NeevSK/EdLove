import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../app/(sanctuary)/components/SanctuaryShell';
import { SelfFloor } from '../../app/(sanctuary)/self/SelfFloor';

// The explore branch of app/(sanctuary)/self/page.tsx, decided at build time instead of per request.
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
