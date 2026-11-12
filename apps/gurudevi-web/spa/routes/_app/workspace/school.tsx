import { createFileRoute } from '@tanstack/react-router';
import { SchoolFloor } from '../../../../app/(sanctuary)/workspace/school/SchoolFloor';
import { schoolLeadership } from '../../../../lib/sanctuary/capacityAccess';
import { useSession } from '../../../surface/session';

/** The school a person without a school bond sees: the sample institution. */
const SAMPLE_SCHOOL_ID = 'school-ananda-colombo';

export const Route = createFileRoute('/_app/workspace/school')({
  component: WorkspaceSchoolScreen,
});

function WorkspaceSchoolScreen() {
  const session = useSession();
  const { activeScope, surface } = session;
  const schoolId = activeScope?.entityType === 'SCHOOL' ? activeScope.entityId : SAMPLE_SCHOOL_ID;
  return (
    <main id="main-content" className="sanctuary-container">
      <SchoolFloor
        schoolId={schoolId}
        isLeader={surface === 'sanctuary' && schoolLeadership(session)}
      />
    </main>
  );
}
