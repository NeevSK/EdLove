import { useVideoPlayer, VideoView } from 'expo-video';
import type { VideoAdapterProps } from '../../../theme/contracts';

/**
 * Default video adapter on native: expo-video (installed with the kit) with
 * the platform's own controls, so play, seek, captions and full screen work
 * the way the person already knows. It never starts by itself.
 */
export function ExpoVideoAdapter({ file, accessibilityLabel }: VideoAdapterProps) {
  const player = useVideoPlayer({ uri: file.uri }, (p) => {
    p.loop = false;
  });
  return (
    <VideoView
      player={player}
      nativeControls
      contentFit="contain"
      allowsPictureInPicture={false}
      accessibilityLabel={accessibilityLabel}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
