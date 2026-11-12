import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../../../app/(sanctuary)/components/SanctuaryShell';
import { DocumentReaderDesk } from '../../../../app/(sanctuary)/library/reader/[bookId]/DocumentReaderDesk';

export const Route = createFileRoute('/library/reader/$bookId')({
  component: ExploreRoute,
});

function ExploreRoute() {
  const { bookId } = Route.useParams();
  return (
    <SanctuaryShell
      displayName="Guest Explorer"
      navigationPrefix=""
      showAccountNavigation={true}
      isExploreMode={true}
    >
      <DocumentReaderDesk bookId={bookId} displayName="Guest Explorer" />
    </SanctuaryShell>
  );
}
