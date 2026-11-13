import { createFileRoute } from '@tanstack/react-router';
import { TuitionFloor } from '../../../../app/(sanctuary)/workspace/tuition/TuitionFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/tuition')({
  component: WorkspaceTuitionScreen,
});

function WorkspaceTuitionScreen() {
  const { capacity, displayName } = useSession();
  return <TuitionFloor displayName={displayName} capacity={capacity} />;
}
