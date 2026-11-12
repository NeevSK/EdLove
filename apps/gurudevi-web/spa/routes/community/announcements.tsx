import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementsFloor } from '../../../app/(sanctuary)/community/announcements/AnnouncementsFloor';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/community/announcements')({
  component: CommunityAnnouncementsScreen,
});

function CommunityAnnouncementsScreen() {
  const { surface, displayName } = useSession();
  const { sources } = Route.useRouteContext();
  const { data: announcements } = useSuspenseQuery(sources.announcements());
  return (
    <AnnouncementsFloor
      announcements={announcements}
      displayName={displayName}
      isExplore={surface === 'explore'}
    />
  );
}
