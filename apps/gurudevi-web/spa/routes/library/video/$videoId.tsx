import { createFileRoute } from '@tanstack/react-router';
import { SanctuaryShell } from '../../../../app/(sanctuary)/components/SanctuaryShell';
import { VideoPlayerDesk } from '../../../../app/(sanctuary)/library/video/[videoId]/VideoPlayerDesk';

export const Route = createFileRoute('/library/video/$videoId')({
  component: ExploreRoute,
});

function ExploreRoute() {
  const { videoId } = Route.useParams();
  return (
    <SanctuaryShell
      displayName="Guest Explorer"
      navigationPrefix=""
      showAccountNavigation={true}
      isExploreMode={true}
    >
      <VideoPlayerDesk videoId={videoId} displayName="Guest Explorer" />
    </SanctuaryShell>
  );
}
