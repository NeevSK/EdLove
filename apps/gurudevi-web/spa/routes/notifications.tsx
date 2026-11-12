import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { NotificationsFloor } from '../../app/(sanctuary)/notifications/NotificationsFloor';
import { useSession } from '../surface/session';

export const Route = createFileRoute('/notifications')({
  component: NotificationsScreen,
});

function NotificationsScreen() {
  const { displayName } = useSession();
  const { sources } = Route.useRouteContext();
  const { data: notifications } = useSuspenseQuery(sources.notifications());
  return <NotificationsFloor displayName={displayName} notifications={notifications} />;
}
