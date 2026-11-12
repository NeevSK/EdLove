import { createFileRoute } from '@tanstack/react-router';
import { DocumentReaderDesk } from '../../../../../app/(sanctuary)/library/reader/[bookId]/DocumentReaderDesk';
import { useSession } from '../../../../surface/session';

export const Route = createFileRoute('/_app/library/reader/$bookId')({
  component: LibraryReaderBookIdScreen,
});

function LibraryReaderBookIdScreen() {
  const { bookId } = Route.useParams();
  const { capacity, displayName } = useSession();
  return <DocumentReaderDesk bookId={bookId} displayName={displayName} capacity={capacity} />;
}
