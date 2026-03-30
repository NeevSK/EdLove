import React, { useState, useRef, useCallback, useEffect } from 'react';
import { StyleSheet, StatusBar, View, LayoutChangeEvent, GestureResponderEvent } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
    Box,
    VStack,
    HStack,
    Text,
    useThemedColors,
    Theme,
    SanctuaryButton,
    Pressable,
    formatTimeMs,
} from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import { Play, Pause, RotateCcw, RotateCw, X } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

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
    const colors = useThemedColors();
    const progressBarWidth = useRef<number>(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [positionMillis, setPositionMillis] = useState(0);
    const [durationMillis, setDurationMillis] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [hasError, setHasError] = useState(false);

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

    const progressWidth = durationMillis > 0 ? `${(positionMillis / durationMillis) * 100}%` : '0%';

    if (hasError || !url) {
        return (
            <Box sx={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}
                <Text color="white" size="lg" style={{ textAlign: 'center', padding: Theme.spacing.xl }}
                    Unable to load video. Please check the URL and try again.
                </Text
                <SanctuaryButton onPress={() => navigation.goBack()} leftIcon={X}
                    Go Back
                </SanctuaryButton
            </Box
        );
    }

    return (
        <Box sx={{ flex: 1, backgroundColor: 'black' }}
            <StatusBar hidden={!showControls} /

            <Pressable
                onPress={() => setShowControls(c => !c)}
                sx={{ flex: 1 }}
                accessibilityLabel="Toggle controls"
            
                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFill}
                    contentFit="contain"
                    nativeControls={false}
                /
            </Pressable

            {showControls && (
                <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill} pointerEvents="box-none"
                    <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: Theme.spacing.md }}
                        {/* Header */}
                        <HStack justifyContent="space-between" alignItems="center"
                            <VStack sx={{ flex: 1, marginRight: Theme.spacing.md }}
                                <Text color="white" size="lg" bold numberOfLines={1}>{title}</Text
                                <Text color={Theme.colors.starlightGray} size="sm" numberOfLines={1}>{creator}</Text
                            </VStack
                            <SanctuaryButton
                                onPress={() => navigation.goBack()}
                                variant="ghost"
                                size="sm"
                                leftIcon={X}
                                accessibilityLabel="Close video"
                            
                                {''}
                            </SanctuaryButton
                        </HStack

                        {/* Centre play controls */}
                        <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                            <HStack space="xl" alignItems="center"
                                <SanctuaryButton
                                    variant="ghost"
                                    leftIcon={RotateCcw}
                                    onPress={() => handleSeekBy(-10000)}
                                    accessibilityLabel="Rewind 10 seconds"
                                
                                    {''}
                                </SanctuaryButton
                                <Pressable
                                    onPress={handlePlayPause}
                                    accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
                                    accessibilityRole="button"
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 40,
                                        backgroundColor: Theme.colors.sanctuarySaffron,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shadowColor: Theme.colors.sanctuarySaffron,
                                        shadowRadius: 20,
                                        shadowOpacity: 0.5,
                                    }}
                                
                                    {isPlaying ? (
                                        <Pause color="white" size={40} fill="white" /
                                    ) : (
                                        <Play color="white" size={40} fill="white" /
                                    )}
                                </Pressable
                                <SanctuaryButton
                                    variant="ghost"
                                    leftIcon={RotateCw}
                                    onPress={() => handleSeekBy(10000)}
                                    accessibilityLabel="Forward 10 seconds"
                                
                                    {''}
                                </SanctuaryButton
                            </HStack
                        </Box

                        {/* Footer: progress + time */}
                        <VStack space="sm"
                            <Pressable
                                onPress={(e: GestureResponderEvent) => {
                                    const { locationX } = (e as any).nativeEvent;
                                    handleProgressTap(locationX, progressBarWidth.current);
                                }}
                                onLayout={(e: LayoutChangeEvent) => {
                                    progressBarWidth.current = e.nativeEvent.layout.width;
                                }}
                                accessibilityLabel="Seek in video"
                            
                                <View style={styles.progressTrack}
                                    <View style={[styles.progressFill, { width: progressWidth as any }]} /
                                </View
                            </Pressable

                            <HStack justifyContent="space-between" alignItems="center"
                                <Text color="white" size="xs"
                                    {formatTimeMs(positionMillis)} / {formatTimeMs(durationMillis)}
                                </Text
                            </HStack
                        </VStack
                    </Box
                </Animated.View
            )}
        </Box
    );
}

const styles = StyleSheet.create({
    progressTrack: {
        height: 4,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: 4,
        backgroundColor: Theme.colors.sanctuarySaffron,
        borderRadius: 2,
    },
});
