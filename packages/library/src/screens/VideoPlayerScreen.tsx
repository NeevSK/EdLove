import React, { useState, useRef, useCallback, useEffect } from 'react';
import { coreRuntime } from '@repo/core';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
    Box,
    VStack,
    HStack,
    Text,
    useTheme,
    Theme,
    SanctuaryButton,
    Pressable,
    formatTimeMs,
    AnimatedView,
    FadeIn
} from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import { Play, Pause, RotateCcw, RotateCw, X } from 'lucide-react-native';

interface VideoPlayerScreenProps {
    route: {
        params: {
            resourceId: string;
            title: string;
            url: string;
            creator: string;
        };
    };
    navigation: any;
}

export default function VideoPlayerScreen({ route }: VideoPlayerScreenProps) {
    const { title, creator, url } = route.params;
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const progressBarWidth = useRef<number>(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [positionMillis, setPositionMillis] = useState(0);
    const [durationMillis, setDurationMillis] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Sync status bar visibility
    useEffect(() => {
        coreRuntime.ui.setStatusBarHidden(!showControls, 'fade');
        return () => {
             // Reset status bar when leaving
             coreRuntime.ui.setStatusBarHidden(false, 'fade');
        };
    }, [showControls]);

    // Initialise expo-video player
    const player = useVideoPlayer(url, (player) => {
        player.loop = false;
        player.play();
    });

    // Sync state with player
    useEffect(() => {
        const interval = setInterval(() => {
            if (player) {
                setIsPlaying(player.playing);
                setPositionMillis(player.currentTime * 1000);
                setDurationMillis(player.duration * 1000);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [player]);

    const handlePlayPause = useCallback(() => {
        if (!player) return;
        if (isPlaying) {
            player.pause();
        } else {
            player.play();
        }
    }, [player, isPlaying]);

    const handleSeekBy = useCallback((deltaMs: number) => {
        if (!player || durationMillis === 0) return;
        player.currentTime += deltaMs / 1000;
    }, [player, durationMillis]);

    const handleProgressTap = useCallback((x: number, barWidth: number) => {
        if (!player || durationMillis === 0 || barWidth === 0) return;
        const ratio = Math.max(0, Math.min(1, x / barWidth));
        player.currentTime = (ratio * durationMillis) / 1000;
    }, [player, durationMillis]);

    const progressPercentage = durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0;

    if (hasError || !url) {
        return (
            <Box className="flex-1 bg-black items-center justify-center">
                <Text className="text-white text-lg text-center p-8">
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

            <Pressable
                onPress={() => setShowControls(c => !c)}
                className="flex-1"
                accessibilityLabel="Toggle controls"
            >
                <VideoView
                    player={player}
                    className="absolute inset-0"
                    contentFit="contain"
                    nativeControls={false}
                />
            </Pressable>

            {showControls && (
                <AnimatedView entering={FadeIn} className="absolute inset-0" pointerEvents="box-none">
                    <Box className="flex-1 bg-black/40 p-4">
                        {/* Header */}
                        <HStack className="justify-between items-center">
                            <VStack className="flex-1 mr-4">
                                <Text className="text-white text-lg font-bold" numberOfLines={1}>{title}</Text>
                                <Text className="text-phaseText-tertiary text-sm" numberOfLines={1}>{creator}</Text>
                            </VStack>
                            <SanctuaryButton
                                onPress={() => navigation.goBack()}
                                variant="ghost"
                                size="sm"
                                leftIcon={X}
                                accessibilityLabel="Close video"
                            >
                                {''}
                            </SanctuaryButton>
                        </HStack>

                        {/* Centre play controls */}
                        <Box className="flex-1 justify-center items-center">
                            <HStack className="gap-8 items-center">
                                <SanctuaryButton
                                    variant="ghost"
                                    leftIcon={RotateCcw}
                                    onPress={() => handleSeekBy(-10000)}
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
                                    onPress={() => handleSeekBy(10000)}
                                    accessibilityLabel="Forward 10 seconds"
                                >
                                    {''}
                                </SanctuaryButton>
                            </HStack>
                        </Box>

                        {/* Footer: progress + time */}
                        <VStack className="gap-2">
                            <Pressable
                                onPress={(e: any) => {
                                    const { locationX } = e.nativeEvent;
                                    handleProgressTap(locationX, progressBarWidth.current);
                                }}
                                onLayout={(e: any) => {
                                    progressBarWidth.current = e.nativeEvent.layout.width;
                                }}
                                accessibilityLabel="Seek in video"
                            >
                                <Box className="h-1 w-full bg-white/20 rounded-sm overflow-hidden">
                                    <Box 
                                        className="h-1 bg-phase-accent rounded-sm" 
                                        style={{ width: `${progressPercentage}%` }} 
                                    />
                                </Box>
                            </Pressable>

                            <HStack className="justify-between items-center">
                                <Text className="text-white text-xs">
                                    {formatTimeMs(positionMillis)} / {formatTimeMs(durationMillis)}
                                </Text>
                            </HStack>
                        </VStack>
                    </Box>
                </AnimatedView>
            )}
        </Box>
    );
}
