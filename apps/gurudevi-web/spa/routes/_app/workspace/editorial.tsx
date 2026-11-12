import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { EditorialCommonsFloor } from '../../../../app/(sanctuary)/workspace/editorial/EditorialCommonsFloor';
import { EditorialFloor } from '../../../../app/(sanctuary)/workspace/editorial/EditorialFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/editorial')({
  validateSearch: z.object({ view: z.enum(['commons']).optional().catch(undefined) }),
  component: WorkspaceEditorialScreen,
});

function WorkspaceEditorialScreen() {
  const { accountId, displayName, surface } = useSession();
  const { view } = Route.useSearch();

  if (surface === 'explore') return <EditorialCommonsFloor mode="explore" />;
  if (view === 'commons')
    return <EditorialCommonsFloor key={accountId} mode="account" subjectId={accountId} />;
  return (
    <EditorialFloor
      key={accountId}
      authorName={displayName}
      schoolId={accountId}
      isFaculty={true}
    />
  );
}
