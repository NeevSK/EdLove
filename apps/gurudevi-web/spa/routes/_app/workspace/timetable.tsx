import { createFileRoute } from '@tanstack/react-router';
import { TimetableFloor } from '../../../../app/(sanctuary)/workspace/timetable/TimetableFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/timetable')({
  head: () => ({ meta: [{ title: 'Timetable | Gurudevi Sanctuary' }] }),
  component: WorkspaceTimetableScreen,
});

function WorkspaceTimetableScreen() {
  const { capacity, displayName } = useSession();
  return <TimetableFloor displayName={displayName} capacity={capacity} />;
}
