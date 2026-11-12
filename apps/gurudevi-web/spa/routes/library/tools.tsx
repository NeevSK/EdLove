import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../../app/(sanctuary)/components/SanctuaryShell';
import { ToolsWorkbenchDesk } from '../../../app/(sanctuary)/library/tools/ToolsWorkbenchDesk';

export const Route = createFileRoute('/library/tools')({
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
      <ToolsWorkbenchDesk displayName="Guest Explorer" />
    </SanctuaryShell>
  );
}
