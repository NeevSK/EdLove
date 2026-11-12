import { createFileRoute } from '@tanstack/react-router';
import { LibraryAtlasDesk } from '../../../../app/(sanctuary)/library/map/LibraryAtlasDesk';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/library/map')({
  component: LibraryMapScreen,
});

function LibraryMapScreen() {
  const { capacity, displayName } = useSession();
  return <LibraryAtlasDesk displayName={displayName} capacity={capacity} />;
}
