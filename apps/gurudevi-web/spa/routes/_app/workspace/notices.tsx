import { createFileRoute } from '@tanstack/react-router';
import { NoticesFloor } from '../../../../app/(sanctuary)/workspace/notices/NoticesFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/notices')({
  head: () => ({ meta: [{ title: 'School Notices & Circulars | Gurudevi Sanctuary' }] }),
  component: WorkspaceNoticesScreen,
});

function WorkspaceNoticesScreen() {
  const { capacity, displayName } = useSession();
  return <NoticesFloor displayName={displayName} initialCapacity={capacity} />;
}
