import { createFileRoute } from '@tanstack/react-router';
import { CuratorReviewDesk } from '../../../app/(sanctuary)/library/curator/CuratorReviewDesk';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/library/curator')({
  component: LibraryCuratorScreen,
});

function LibraryCuratorScreen() {
  const { displayName, capacity } = useSession();
  return <CuratorReviewDesk displayName={displayName} capacity={capacity} />;
}
