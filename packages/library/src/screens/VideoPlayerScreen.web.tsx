/**
 * @deprecated Legacy React Native Web screen.
 * In accordance with AGENTS.md, all modern web experiences are built in `apps/gurudevi-web`.
 * For modern web lecture playback, chapters, and reflection notes, use `apps/gurudevi-web/app/(sanctuary)/library/video/[videoId]`.
 * Retained solely as a backward-compatible source and historical reference.
 */
import { VideoPlayer } from '@repo/ui/components/media/VideoPlayer';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useCallback } from 'react';

/**
 * VideoPlayerScreen (Web) - Thin navigation shell around the shared UI VideoPlayer.
 * Promotes platform-wide consumption of media tools.
 */
export default function VideoPlayerScreen() {
  const { title, creator, url } = useLocalSearchParams<{
    resourceId: string;
    title: string;
    url: string;
    creator: string;
  }>();
  const router = useRouter();

  const handleClose = useCallback(() => {
    safeBack('/library');
  }, [router]);

  return <VideoPlayer url={url} title={title} creator={creator} onClose={handleClose} />;
}
