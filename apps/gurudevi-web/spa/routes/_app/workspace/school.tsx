import { createFileRoute } from '@tanstack/react-router';
import { isOnWorkspaceFloor } from '@repo/core/logic/places/workspaceCatalog';
import { SchoolFloor } from '../../../../app/(sanctuary)/workspace/school/SchoolFloor';
import { useSession } from '../../../surface/session';

/** The school a person without a school bond sees: the sample institution. */
const SAMPLE_SCHOOL_ID = 'school-ananda-colombo';

export const Route = createFileRoute('/_app/workspace/school')({
  head: () => ({ meta: [{ title: 'School Profile | Gurudevi Sanctuary' }] }),
  component: WorkspaceSchoolScreen,
});

function WorkspaceSchoolScreen() {
  const session = useSession();
  const { activeScope, capacity } = session;
  const schoolId = activeScope?.entityType === 'SCHOOL' ? activeScope.entityId : SAMPLE_SCHOOL_ID;
  const isLeader = isOnWorkspaceFloor(capacity, 'school');

  return (
    <main id="main-content" className="sanctuary-container">
      <SchoolFloor
        schoolId={schoolId}
        isLeader={isLeader}
      />
    </main>
  );
}
