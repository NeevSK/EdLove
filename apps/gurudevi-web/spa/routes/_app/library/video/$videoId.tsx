import { createFileRoute } from '@tanstack/react-router';
import { VideoPlayerDesk } from '../../../../../app/(sanctuary)/library/video/[videoId]/VideoPlayerDesk';
import { useSession } from '../../../../surface/session';

export const Route = createFileRoute('/_app/library/video/$videoId')({
  head: () => ({ meta: [{ title: 'Video Lecture | Gurudevi Sanctuary' }] }),
  component: LibraryVideoVideoIdScreen,
});

function LibraryVideoVideoIdScreen() {
  const { videoId } = Route.useParams();
  const { capacity, displayName } = useSession();
  return <VideoPlayerDesk videoId={videoId} displayName={displayName} capacity={capacity} />;
}
