import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../app/(sanctuary)/components/SanctuaryShell';
import { SettingsFloor } from '../../app/(sanctuary)/settings/SettingsFloor';

export const Route = createFileRoute('/settings')({
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
      <SettingsFloor displayName="Guest Explorer" isExplore={true} />
    </SanctuaryShell>
  );
}
