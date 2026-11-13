import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';
import { WorkspaceFloor } from '../../../../app/(sanctuary)/workspace/WorkspaceFloor';
import { Notice } from '../../../surface/Notice';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/')({
  head: () => ({ meta: [{ title: 'Workspace | Gurudevi Sanctuary' }] }),
  validateSearch: z.object({
    task: z.string().optional(),
    classroom: z.string().optional(),
    date: z.string().optional(),
  }),
  component: WorkspaceScreen,
});

function WorkspaceScreen() {
  const { accountId, activeScope, capacity, displayName, surface } = useSession();

  if (activeScope?.entityType === 'PERSONAL_CLASSROOM') {
    return (
      <Notice
        title="Choose a classroom or school bond"
        detail={
          capacity.toLowerCase() === 'teacher'
            ? 'Your personal Sanctuary is ready. Ask your school administrator to connect your account to a school and assign your classrooms. When you have a school or classroom bond, select it to open your shared workspace.'
            : 'Personal Sanctuary keeps your private Self work together. Classroom attendance opens only in an institutional classroom or school scope.'
        }
        action={
          <>
            <Link to="/self">Return to Self</Link>
            <Link to="/welcome">Guest House</Link>
          </>
        }
      />
    );
  }

  return (
    <WorkspaceFloor
      key={accountId}
      mode={surface === 'explore' ? 'explore' : 'account'}
      displayName={displayName}
      capacity={capacity}
      scope={activeScope}
      subjectId={accountId}
    />
  );
}
