import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../../app/(sanctuary)/components/SanctuaryShell';
import { LibraryAtlasDesk } from '../../../app/(sanctuary)/library/map/LibraryAtlasDesk';

export const Route = createFileRoute('/library/map')({
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
      <LibraryAtlasDesk displayName="Guest Explorer" capacity="guest" />
    </SanctuaryShell>
  );
}
