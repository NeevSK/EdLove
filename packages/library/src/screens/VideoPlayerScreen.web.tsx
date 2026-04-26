/**
 * VideoPlayerScreen.web.tsx  Pattern A: full web replacement
 *
 * On native, VideoPlayerScreen wraps expo-video's components with custom
 * controls. On web we use the browser-native <video> element instead, which
 * gives us full codec support, captions, and picture-in-picture for free.
 *
 * On web Metro resolves this file instead of VideoPlayerScreen.tsx.
 * No expo-av or expo-video import here.
 */

import { useNavigation } from '@react-navigation/native';
import {
  Box,
  formatTimeSecs,
  HStack,
  Pressable,
  SanctuaryButton,
  Text,
  Theme,
  useThemedColors,
  VStack,
} from '@repo/ui';
import { Maximize, Pause, Play, RotateCcw, RotateCw, X } from 'lucide-react-native';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface VideoPlayerScreenProps {
  route: {
    params: {
      resourceId: string;
      title: string;
      url: string;
      creator: string;
    };
  };
  navigation?: any;
}

export default function VideoPlayerScreen({ route }: VideoPlayerScreenProps) {
  const { title, creator, url } = route.params;
  const navigation = useNavigation<any>();
  const colors = useThemedColors();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-hide controls after 3 s of inactivity
  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const handlePlayPause = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
    resetHideTimer();
  }, [resetHideTimer]);

  const handleSeekBy = useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
      resetHideTimer();
    },
    [resetHideTimer],
  );

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const v = videoRef.current;
      if (!v || v.duration === 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      v.currentTime = ratio * v.duration;
      resetHideTimer();
    },
    [resetHideTimer],
  );

  const handleFullscreen = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
    else if ((v as any).webkitRequestFullscreen) (v as any).webkitRequestFullscreen();
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (hasError || !url) {
    return (
      <Box className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg text-center p-xl">
          Unable to load video. Please check the URL and try again.
        </Text>
        <SanctuaryButton onPress={() => navigation.goBack()} leftIcon={X}>
          Go Back
        </SanctuaryButton>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-black">
      {/* Browser-native <video> element - full codec + PiP support */}
      <Pressable
        onPress={() => {
          setShowControls((c) => !c);
          resetHideTimer();
        }}
        className="absolute inset-0"
        accessibilityLabel="Toggle controls"
      >
        {/* @ts-ignore - 'video' is a valid DOM element in react-native-web */}
        <video
          ref={videoRef}
          src={url}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
          onDurationChange={() => setDuration(videoRef.current?.duration ?? 0)}
          onError={() => setHasError(true)}
        />
      </Pressable>

      {/* Overlay controls */}
      {showControls && (
        <Box className="absolute inset-0 bg-black/35 justify-between" pointerEvents="box-none">
          {/* Header */}
          <Box className="flex-row items-center px-4 pt-5 pb-3 gap-3" pointerEvents="auto">
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityLabel="Close video"
              className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
            >
              <X size={22} color="#fff" />
            </Pressable>
            <VStack className="flex-1">
              <Text className="text-white text-base font-bold" numberOfLines={1}>
                {title}
              </Text>
              {creator ? <Text className="text-white/60 text-xs">{creator}</Text> : null}
            </VStack>
            <Pressable
              onPress={handleFullscreen}
              accessibilityLabel="Enter fullscreen"
              className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
            >
              <Maximize size={20} color="#fff" />
            </Pressable>
          </Box>

          {/* Playback buttons */}
          <Box className="flex-row items-center justify-center gap-8" pointerEvents="auto">
            <Pressable
              onPress={() => handleSeekBy(-10)}
              className="items-center justify-center w-[52px] h-[52px]"
              accessibilityLabel="Rewind 10 seconds"
            >
              <RotateCcw size={28} color="#fff" />
              <Text className="text-white text-[11px] mt-[-4px]">10</Text>
            </Pressable>
            <Pressable
              onPress={handlePlayPause}
              className="w-[72px] h-[72px] rounded-full bg-[#D4843AD9] items-center justify-center"
              accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={36} color="#fff" fill="#fff" />
              ) : (
                <Play size={36} color="#fff" fill="#fff" />
              )}
            </Pressable>
            <Pressable
              onPress={() => handleSeekBy(10)}
              className="items-center justify-center w-[52px] h-[52px]"
              accessibilityLabel="Skip 10 seconds"
            >
              <RotateCw size={28} color="#fff" />
              <Text className="text-white text-[11px] mt-[-4px]">10</Text>
            </Pressable>
          </Box>

          {/* Progress bar + timestamps */}
          <Box className="flex-row items-center px-4 pb-6 gap-2.5" pointerEvents="auto">
            <Text
              className="text-white/80 text-xs min-w-9 text-center"
              style={{ fontVariant: ['tabular-nums'] as any }}
            >
              {formatTimeSecs(currentTime)}
            </Text>
            {/* @ts-ignore - onClick on div in react-native-web */}
            <div
              className="flex-1 h-[5px] rounded-[3px] bg-white/25 cursor-pointer overflow-hidden"
              onClick={handleProgressClick}
              role="slider"
              aria-label="Video progress"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: 'rgba(212, 132, 58, 1)',
                  borderRadius: 3,
                  transition: 'width 0.1s linear',
                  width: `${progress}%`,
                }}
              />
            </div>
            <Text
              className="text-white/80 text-xs min-w-9 text-center"
              style={{ fontVariant: ['tabular-nums'] as any }}
            >
              {formatTimeSecs(duration)}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
