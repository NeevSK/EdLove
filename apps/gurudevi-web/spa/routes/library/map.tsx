import { createFileRoute } from '@tanstack/react-router';
import { LibraryAtlasDesk } from '../../../app/(sanctuary)/library/map/LibraryAtlasDesk';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/library/map')({
  component: LibraryMapScreen,
});

function LibraryMapScreen() {
  const { displayName, capacity } = useSession();
  return <LibraryAtlasDesk displayName={displayName} capacity={capacity} />;
}
