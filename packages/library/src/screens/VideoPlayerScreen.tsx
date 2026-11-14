import { VideoPlayer } from '@repo/ui/components/media/VideoPlayer';
import { useLocalSearchParams } from 'expo-router';
import { useNavigator } from '@repo/ui/components/native/navigation';

import { useCallback } from 'react';

/**
 * VideoPlayerScreen - Thin navigation shell around the shared UI VideoPlayer.
 * Promotes platform-wide consumption of media tools.
 */
export default function VideoPlayerScreen() {
  const { title, creator, url } = useLocalSearchParams<{
    resourceId: string;
    title: string;
    url: string;
    creator: string;
  }>();
  const router = useNavigator();

  const handleClose = useCallback(() => {
    router.back('/library');
  }, [router]);

  return <VideoPlayer url={url} title={title} creator={creator} onClose={handleClose} />;
}
