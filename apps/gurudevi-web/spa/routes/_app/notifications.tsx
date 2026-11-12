import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { NotificationsFloor } from '../../../app/(sanctuary)/notifications/NotificationsFloor';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/_app/notifications')({
  loader: ({ context }) => context.queryClient.ensureQueryData(context.sources.notifications()),
  component: NotificationsScreen,
});

function NotificationsScreen() {
  const { sources } = Route.useRouteContext();
  const { data } = useSuspenseQuery(sources.notifications());
  const { displayName } = useSession();
  return <NotificationsFloor displayName={displayName} notifications={data} />;
}
