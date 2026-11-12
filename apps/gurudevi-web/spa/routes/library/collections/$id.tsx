import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../../../app/(sanctuary)/components/SanctuaryShell';
import { CollectionShelfDesk } from '../../../../app/(sanctuary)/library/collections/[id]/CollectionShelfDesk';

export const Route = createFileRoute('/library/collections/$id')({
  component: ExploreRoute,
});

function ExploreRoute() {
  const { id } = Route.useParams();
  return (
    <SanctuaryShell
      displayName="Guest Explorer"
      navigationPrefix=""
      showAccountNavigation={true}
      isExploreMode={true}
    >
      <CollectionShelfDesk id={id} displayName="Guest Explorer" />
    </SanctuaryShell>
  );
}
