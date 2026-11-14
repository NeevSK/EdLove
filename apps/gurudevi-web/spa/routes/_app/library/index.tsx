import { createFileRoute } from '@tanstack/react-router';
import { LibraryFloor } from '../../../../app/(sanctuary)/library/LibraryFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/library/')({
  head: () => ({ meta: [{ title: 'Library | Gurudevi Sanctuary' }] }),
  component: LibraryScreen,
});

function LibraryScreen() {
  const { accountId, displayName, surface } = useSession();
  return (
    <LibraryFloor
      mode={surface === 'explore' ? 'explore' : 'account'}
      accountId={accountId}
      displayName={displayName}
    />
  );
}
