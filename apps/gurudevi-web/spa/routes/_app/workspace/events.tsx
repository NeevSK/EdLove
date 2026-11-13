import { createFileRoute } from '@tanstack/react-router';
import { EventsFloor } from '../../../../app/(sanctuary)/workspace/events/EventsFloor';

export const Route = createFileRoute('/_app/workspace/events')({
  head: () => ({ meta: [{ title: 'Programs & Events ERP | Gurudevi Sanctuary' }] }),
  component: WorkspaceEventsScreen,
});

function WorkspaceEventsScreen() {
  return <EventsFloor schoolId="school-ananda-colombo" />;
}
