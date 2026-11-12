import { createFileRoute } from '@tanstack/react-router';
import { DocumentReaderDesk } from '../../../../app/(sanctuary)/library/reader/[bookId]/DocumentReaderDesk';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/library/reader/$bookId')({
  component: LibraryReaderBookidScreen,
});

function LibraryReaderBookidScreen() {
  const { bookId } = Route.useParams();
  const { displayName } = useSession();
  return <DocumentReaderDesk bookId={bookId} displayName={displayName} />;
}
