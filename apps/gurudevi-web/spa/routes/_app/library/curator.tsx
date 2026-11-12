import { createFileRoute } from '@tanstack/react-router';
import { CuratorReviewDesk } from '../../../../app/(sanctuary)/library/curator/CuratorReviewDesk';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/library/curator')({
  component: LibraryCuratorScreen,
});

function LibraryCuratorScreen() {
  const { capacity, displayName } = useSession();
  return <CuratorReviewDesk displayName={displayName} capacity={capacity} />;
}
