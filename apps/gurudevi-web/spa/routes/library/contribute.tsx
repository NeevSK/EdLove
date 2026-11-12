import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../../app/(sanctuary)/components/SanctuaryShell';
import { ContributeDesk } from '../../../app/(sanctuary)/library/contribute/ContributeDesk';

export const Route = createFileRoute('/library/contribute')({
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
      <ContributeDesk displayName="Guest Explorer" capacity="guest" />
    </SanctuaryShell>
  );
}
