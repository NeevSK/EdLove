import { mediaInitialState, mediaReducer } from '@repo/core/logic';
import { Pause, Play, RotateCcw, RotateCw, X } from 'lucide-react-native';
import type React from 'react';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../components/ui/box';
import { HStack } from '../../components/ui/hstack';
import { Text } from '../../components/ui/text';
import { VStack } from '../../components/ui/vstack';
import { useTheme } from '../../hooks/useTheme';
import { formatTimeMs } from '../../utils/dateTimeUtils';
import { SanctuaryButton } from '../SanctuaryButton';

export interface VideoPlayerProps {
  url: string;
  title?: string;
  creator?: string;
  onClose?: () => void;
}

/**
 * VideoPlayer (Web) - Standard HTML5 video implementation with shared Sanctuary aesthetics.
 */
export function VideoPlayer({ url, title, creator, onClose }: VideoPlayerProps) {
  const theme = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useReducer(mediaReducer, mediaInitialState);
  const { isPlaying, positionMillis, durationMillis, showControls, hasError } = state;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      dispatch({
        type: 'SET_PROGRESS',
        position: video.currentTime * 1000,
        duration: video.duration * 1000,
      });
    };

    const handlePlay = () => dispatch({ type: 'SET_PLAYING', payload: true });
    const handlePause = () => dispatch({ type: 'SET_PLAYING', payload: false });
    const handleError = () => dispatch({ type: 'SET_ERROR', payload: true });

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying]);

  const handleSeekBy = useCallback((deltaMs: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime += deltaMs / 1000;
  }, []);

  const handleToggleControls = useCallback(() => {
    dispatch({ type: 'TOGGLE_CONTROLS' });
  }, []);

  const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;

    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    video.currentTime = ratio * video.duration;
  }, []);

  const progressPercentage = durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0;

  if (hasError || !url) {
    return (
      <Box className="flex-1 bg-black items-center justify-center h-full">
        <Text className="text-white text-lg text-center p-8">
          Unable to load video. Please check the URL and try again.
        </Text>
        {onClose && (
          <SanctuaryButton onPress={onClose} leftIcon={X}>
            Close
          </SanctuaryButton>
        )}
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-black relative w-full h-full group overflow-hidden">
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain"
        onClick={handleToggleControls}
        autoPlay
      />

      {showControls && (
        <Box className="absolute inset-0 bg-black/40 p-4 transition-opacity duration-300 pointer-events-none">
          <Box className="flex-1 flex flex-col justify-between pointer-events-auto">
            {/* Header */}
            <HStack className="justify-between items-center">
              <VStack className="flex-1 mr-4">
                {title && <Text className="text-white text-lg font-bold">{title}</Text>}
                {creator && <Text className="text-phaseText-tertiary text-sm">{creator}</Text>}
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
            <Box className="flex-1 flex items-center justify-center">
              <HStack className="gap-8 items-center">
                <SanctuaryButton
                  variant="ghost"
                  leftIcon={RotateCcw}
                  onPress={() => handleSeekBy(-10000)}
                >
                  {''}
                </SanctuaryButton>

                <Pressable
                  onPress={handlePlayPause}
                  className="w-20 h-20 rounded-full bg-phase-accent flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  style={{
                    boxShadow: `0 0 20px ${theme.accent.action}80`,
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
                  onPress={() => handleSeekBy(10000)}
                >
                  {''}
                </SanctuaryButton>
              </HStack>
            </Box>

            {/* Footer */}
            <VStack className="gap-2">
              <div
                ref={progressBarRef}
                onClick={handleProgressBarClick}
                className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer group/progress"
              >
                <div
                  className="h-full bg-phase-accent transition-all duration-100"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <HStack className="justify-between items-center">
                <Text className="text-white text-xs">
                  {formatTimeMs(positionMillis)} / {formatTimeMs(durationMillis)}
                </Text>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
