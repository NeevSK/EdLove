import { createFileRoute } from '@tanstack/react-router';
import { ClassroomInvitation } from '../../../app/(sanctuary)/c/[code]/ClassroomInvitation';

export const Route = createFileRoute('/c/$code')({
  component: ClassroomInvitationScreen,
});

function ClassroomInvitationScreen() {
  const { code } = Route.useParams();
  return <ClassroomInvitation code={code} />;
}
