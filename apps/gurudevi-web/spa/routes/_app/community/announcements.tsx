import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementsFloor } from '../../../../app/(sanctuary)/community/announcements/AnnouncementsFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/community/announcements')({
  loader: ({ context }) => context.queryClient.ensureQueryData(context.sources.announcements()),
  component: AnnouncementsScreen,
});

function AnnouncementsScreen() {
  const { sources } = Route.useRouteContext();
  const { data } = useSuspenseQuery(sources.announcements());
  const { displayName, surface } = useSession();
  return (
    <AnnouncementsFloor
      announcements={data}
      displayName={displayName}
      isExplore={surface === 'explore'}
    />
  );
}
