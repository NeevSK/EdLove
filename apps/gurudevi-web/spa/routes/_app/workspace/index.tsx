import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';
import { WorkspaceFloor } from '../../../../app/(sanctuary)/workspace/WorkspaceFloor';
import { Notice } from '../../../surface/Notice';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/')({
  head: () => ({ meta: [{ title: 'Workspace | Gurudevi App' }] }),
  validateSearch: z.object({
    task: z.enum(['attendance']).optional().catch(undefined),
    classroom: z.string().optional(),
    date: z.string().optional(),
  }),
  component: WorkspaceScreen,
});

function WorkspaceScreen() {
  const { accountId, activeScope, capacity, displayName, surface } = useSession();
  const { task } = Route.useSearch();

  return (
    <WorkspaceFloor
      key={accountId}
      mode={surface === 'explore' ? 'explore' : 'account'}
      displayName={displayName}
      capacity={capacity}
      scope={activeScope}
      subjectId={accountId}
      task={task}
    />
  );
}
