import { createFileRoute } from '@tanstack/react-router';
import { ClassroomDetailFloor } from '../../../../../app/(sanctuary)/workspace/classroom/[id]/ClassroomDetailFloor';
import { useSession } from '../../../../surface/session';

export const Route = createFileRoute('/_app/workspace/classroom/$id')({
  component: ClassroomScreen,
});

function ClassroomScreen() {
  const { id } = Route.useParams();
  const { displayName, surface } = useSession();
  return (
    <ClassroomDetailFloor
      classroomId={id}
      displayName={displayName}
      isExplore={surface === 'explore'}
    />
  );
}
