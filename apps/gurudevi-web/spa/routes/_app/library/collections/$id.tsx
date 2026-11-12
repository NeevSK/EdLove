import { createFileRoute } from '@tanstack/react-router';
import { CollectionShelfDesk } from '../../../../../app/(sanctuary)/library/collections/[id]/CollectionShelfDesk';
import { useSession } from '../../../../surface/session';

export const Route = createFileRoute('/_app/library/collections/$id')({
  component: LibraryCollectionsIdScreen,
});

function LibraryCollectionsIdScreen() {
  const { id } = Route.useParams();
  const { capacity, displayName } = useSession();
  return <CollectionShelfDesk id={id} displayName={displayName} capacity={capacity} />;
}
