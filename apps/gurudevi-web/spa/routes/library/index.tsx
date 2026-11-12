import { createFileRoute } from '@tanstack/react-router';
import { LibraryFloor } from '../../../app/(sanctuary)/library/LibraryFloor';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/library/')({
  component: LibraryScreen,
});

function LibraryScreen() {
  const { surface, accountId, displayName } = useSession();
  return (
    <LibraryFloor
      accountId={accountId}
      displayName={displayName}
      mode={surface === 'explore' ? 'explore' : 'account'}
    />
  );
}
