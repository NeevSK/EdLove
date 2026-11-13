import { createFileRoute } from '@tanstack/react-router';
import { SchoolFloor } from '../../../../app/(sanctuary)/workspace/school/SchoolFloor';
import { useSession } from '../../../surface/session';

/**
 * Who may edit the school profile. Interim, until the signed capability snapshot decides it
 * (docs/architecture/places-roles-and-features.md, step 5); kept as it was so nothing changes.
 */
const SCHOOL_LEADERS = [
  'principal',
  'assistantprincipal',
  'sectionhead',
  'section_head',
  'gradehead',
  'founder',
  'developer',
  'admin',
];
const SCHOOL_LEADER_ROLES = ['principal', 'admin', 'founder'];

function leadsSchool(capacity: string, roles: readonly string[] = []): boolean {
  return (
    SCHOOL_LEADERS.includes(capacity.toLowerCase()) ||
    roles.some((role) => SCHOOL_LEADER_ROLES.includes(role.toLowerCase()))
  );
}

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
        isLeader={
          surface === 'sanctuary' && leadsSchool(session.capacity, session.activeScope?.roles)
        }
      />
    </main>
  );
}
