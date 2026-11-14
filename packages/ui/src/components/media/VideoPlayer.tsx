import { coreRuntime } from '@repo/core/logic';
import { useMachineActor } from '@repo/core/hooks/useMachineActor';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { Pause, Play, RotateCcw, RotateCw, X } from '@repo/ui/icons';
import { createMediaPlaybackActor, mediaPlaybackMachine } from '@repo/ui/machines/mediaPlaybackMachine';
import { Box, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';
import { formatTimeMs } from '@repo/ui/utils/dateTimeUtils';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

export interface VideoPlayerProps {
  url: string;
  title?: string;
  creator?: string;
  onClose?: () => void;
}

/**
 * VideoPlayer - Premium, platform-standard video consumption shell.
 * Uses expo-video for high-performance native playback coordinated by mediaPlaybackMachine.
 */
export function VideoPlayer({ url, title, creator, onClose }: VideoPlayerProps) {
  const theme = useTheme();
  const progressBarWidth = useRef<number>(0);

  const { actor, snapshot } = useMachineActor(
    () => createMediaPlaybackActor({ mediaId: url }),
    [url],
  );
  const { isPlaying, positionMillis, durationMillis, showControls, hasError } = snapshot.context;
  const send = actor.send;

  // Sync status bar visibility
  useEffect(() => {
    coreRuntime.ui.setStatusBarHidden(!showControls, 'fade');
    return () => {
      coreRuntime.ui.setStatusBarHidden(false, 'fade');
    };
  }, [showControls]);

  // Initialise expo-video player
  const player = useVideoPlayer(url, (p: any) => {
    p.loop = false;
    p.play();
  });

  // Sync state with player via native event listeners, eliminating polling intervals
  useEffect(() => {
    if (!player) return;

    const subscriptions: Array<{ remove: () => void }> = [];

    if (typeof (player as any).addListener === 'function') {
      subscriptions.push(
        (player as any).addListener('playingChange', (event: { isPlaying: boolean }) => {
          send({ type: event.isPlaying ? 'PLAY' : 'PAUSE' });
        }),
      );
      subscriptions.push(
        (player as any).addListener(
          'timeUpdate',
          (event: { currentTime: number; currentLiveTimestamp?: number }) => {
            send({
              type: 'PROGRESS_UPDATE',
              position: event.currentTime * 1000,
              duration: (player.duration || 0) * 1000,
            });
          },
        ),
      );
      subscriptions.push(
        (player as any).addListener('playToEnd', () => {
          send({ type: 'PLAYBACK_ENDED' });
        }),
      );
      subscriptions.push(
        (player as any).addListener(
          'statusChange',
          (event: { status: string; error?: { message?: string } }) => {
            if (event.status === 'error' && event.error) {
              send({ type: 'PLAYBACK_ERROR', error: event.error.message || 'Playback error' });
            } else if (event.status === 'loading') {
              send({ type: 'BUFFER_START' });
            } else if (event.status === 'readyToPlay') {
              send({ type: 'BUFFER_END' });
            }
          },
        ),
      );
    }

    return () => {
      subscriptions.forEach((s) => s.remove());
    };
  }, [player, send]);

  const handlePlayPause = useCallback(() => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
      send({ type: 'PAUSE' });
    } else {
      player.play();
      send({ type: 'PLAY' });
    }
  }, [player, isPlaying, send]);

  const handleSeekBy = useCallback(
    (deltaMs: number) => {
      if (!player || durationMillis === 0) return;
      const targetSec = (player.currentTime || 0) + deltaMs / 1000;
      player.currentTime = targetSec;
      send({ type: 'SEEK', positionMillis: targetSec * 1000 });
    },
    [player, durationMillis, send],
  );

  const handleProgressTap = useCallback(
    (x: number, barWidth: number) => {
      if (!player || durationMillis === 0 || barWidth === 0) return;
      const ratio = Math.max(0, Math.min(1, x / barWidth));
      const targetSec = (ratio * durationMillis) / 1000;
      player.currentTime = targetSec;
      send({ type: 'SEEK', positionMillis: targetSec * 1000 });
    },
    [player, durationMillis, send],
  );

  const handleToggleControls = useCallback(() => {
    send({ type: 'TOGGLE_CONTROLS' });
  }, [send]);

  const handleRewind = useCallback(() => handleSeekBy(-10000), [handleSeekBy]);
  const handleForward = useCallback(() => handleSeekBy(10000), [handleSeekBy]);

  const handleProgressBarPress = useCallback(
    (e: any) => {
      const { locationX } = e.nativeEvent;
      handleProgressTap(locationX, progressBarWidth.current);
    },
    [handleProgressTap],
  );

  const handleProgressBarLayout = useCallback((e: any) => {
    progressBarWidth.current = e.nativeEvent.layout.width;
  }, []);

  const progressPercentage = durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0;

  if (hasError || !url) {
    return (
      <Box className="flex-1 bg-phase-surface items-center justify-center">
        <BrandedErrorState
          title={!url ? 'Video unavailable' : 'This video could not be opened'}
          message="Check your connection or try the resource again later."
        >
          {onClose && (
            <SanctuaryButton onPress={onClose} leftIcon={X}>
              Close
            </SanctuaryButton>
          )}
        </BrandedErrorState>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-black">
      <Pressable
        onPress={handleToggleControls}
        className="flex-1"
        accessibilityLabel="Toggle video controls visibility"
        accessibilityRole="button"
      >
        <VideoView
          player={player}
          className="absolute inset-0"
          contentFit="contain"
          nativeControls={false}
        />
      </Pressable>

      {showControls && (
        <Animated.View
          entering={FadeInUp}
          className="absolute inset-0"
          style={{ pointerEvents: 'box-none' }}
        >
          <Box className="flex-1 bg-black/40 p-4">
            {/* Header */}
            <HStack className="justify-between items-center">
              <VStack className="flex-1 mr-4">
                {title && (
                  <Text className="text-white text-lg font-bold" numberOfLines={1}>
                    {title}
                  </Text>
                )}
                {creator && (
                  <Text className="text-phaseText-tertiary text-sm" numberOfLines={1}>
                    {creator}
                  </Text>
                )}
              </VStack>
              {onClose && (
                <SanctuaryButton
                  onPress={onClose}
                  variant="ghost"
                  size="sm"
                  leftIcon={X}
                  accessibilityLabel="Close video"
                >
                  {''}
                </SanctuaryButton>
              )}
            </HStack>

            {/* Centre play controls */}
            <Box className="flex-1 justify-center items-center">
              <HStack className="gap-8 items-center">
                <SanctuaryButton
                  variant="ghost"
                  leftIcon={RotateCcw}
                  onPress={handleRewind}
                  accessibilityLabel="Rewind 10 seconds"
                >
                  {''}
                </SanctuaryButton>
                <Pressable
                  onPress={handlePlayPause}
                  accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
                  accessibilityRole="button"
                  className="w-20 h-20 rounded-full bg-phase-accent items-center justify-center shadow-lg"
                  style={{
                    shadowColor: theme.accent.action,
                    shadowRadius: 20,
                    shadowOpacity: 0.5,
                  }}
                >
                  {isPlaying ? (
                    <Pause color="white" size={40} fill="white" />
                  ) : (
                    <Play color="white" size={40} fill="white" />
                  )}
                </Pressable>
                <SanctuaryButton
                  variant="ghost"
                  leftIcon={RotateCw}
                  onPress={handleForward}
                  accessibilityLabel="Forward 10 seconds"
                >
                  {''}
                </SanctuaryButton>
              </HStack>
            </Box>

            {/* Footer: progress + time */}
            <VStack className="gap-2">
              <Pressable
                onPress={handleProgressBarPress}
                onLayout={handleProgressBarLayout}
                accessibilityLabel={`Seek video position. Progress is ${Math.round(
                  progressPercentage,
                )}%`}
                accessibilityRole="adjustable"
              >
                <Box className="h-1 w-full bg-white/20 rounded-sm overflow-hidden">
                  <Box
                    className="h-1 bg-phase-accent rounded-sm"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </Box>
              </Pressable>

              <HStack className="justify-between items-center">
                <Text
                  className="text-white text-xs"
                  accessibilityLabel={`Current time ${formatTimeMs(positionMillis)} of ${formatTimeMs(
                    durationMillis,
                  )}`}
                >
                  {formatTimeMs(positionMillis)} / {formatTimeMs(durationMillis)}
                </Text>
              </HStack>
            </VStack>
          </Box>
        </Animated.View>
      )}
    </Box>
  );
}
