import { useNavigation } from '@react-navigation/native';
import { VideoPlayer } from '@repo/ui';
import React, { useCallback } from 'react';

interface VideoPlayerScreenProps {
  route: {
    params: {
      resourceId: string;
      title: string;
      url: string;
      creator: string;
    };
  };
}

/**
 * VideoPlayerScreen (Web) - Thin navigation shell around the shared UI VideoPlayer.
 * Promotes platform-wide consumption of media tools.
 */
export default function VideoPlayerScreen({ route }: VideoPlayerScreenProps) {
  const { title, creator, url } = route.params;
  const navigation = useNavigation<any>();

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return <VideoPlayer url={url} title={title} creator={creator} onClose={handleClose} />;
}
