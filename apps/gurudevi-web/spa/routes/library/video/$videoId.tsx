import { createFileRoute } from '@tanstack/react-router';
import { VideoPlayerDesk } from '../../../../app/(sanctuary)/library/video/[videoId]/VideoPlayerDesk';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/library/video/$videoId')({
  component: LibraryVideoVideoidScreen,
});

function LibraryVideoVideoidScreen() {
  const { videoId } = Route.useParams();
  const { displayName } = useSession();
  return <VideoPlayerDesk videoId={videoId} displayName={displayName} />;
}
