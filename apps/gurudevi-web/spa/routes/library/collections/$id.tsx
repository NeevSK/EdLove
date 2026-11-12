import { createFileRoute } from '@tanstack/react-router';
import { CollectionShelfDesk } from '../../../../app/(sanctuary)/library/collections/[id]/CollectionShelfDesk';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/library/collections/$id')({
  component: LibraryCollectionsIdScreen,
});

function LibraryCollectionsIdScreen() {
  const { id } = Route.useParams();
  const { displayName } = useSession();
  return <CollectionShelfDesk id={id} displayName={displayName} />;
}
