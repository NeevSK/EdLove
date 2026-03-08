import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, StatusBar, TouchableOpacity, View, LayoutChangeEvent } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
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
    const videoRef = useRef<Video>(null);
    const progressBarWidth = useRef<number>(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [positionMillis, setPositionMillis] = useState(0);
    const [durationMillis, setDurationMillis] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [hasError, setHasError] = useState(false);

    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
            if ((status as { error?: string }).error) setHasError(true);
            return;
        }
        setIsPlaying(status.isPlaying);
        setPositionMillis(status.positionMillis);
        setDurationMillis(status.durationMillis ?? 0);
    }, []);

    const handlePlayPause = useCallback(async () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            await videoRef.current.pauseAsync();
        } else {
            await videoRef.current.playAsync();
        }
    }, [isPlaying]);

    const handleSeekBy = useCallback(async (deltaMs: number) => {
        if (!videoRef.current || durationMillis === 0) return;
        const next = Math.max(0, Math.min(durationMillis, positionMillis + deltaMs));
        await videoRef.current.setPositionAsync(next);
    }, [positionMillis, durationMillis]);

    const handleProgressTap = useCallback(async (x: number, barWidth: number) => {
        if (!videoRef.current || durationMillis === 0 || barWidth === 0) return;
        const ratio = Math.max(0, Math.min(1, x / barWidth));
        await videoRef.current.setPositionAsync(ratio * durationMillis);
    }, [durationMillis]);

    const progressWidth = durationMillis > 0 ? `${(positionMillis / durationMillis) * 100}%` : '0%';

    if (hasError || !url) {
        return (
            <Box sx={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                <Text color="white" size="lg" style={{ textAlign: 'center', padding: Theme.spacing.xl }}>
                    Unable to load video. Please check the URL and try again.
                </Text>
                <SanctuaryButton onPress={() => navigation.goBack()} leftIcon={X}>
                    Go Back
                </SanctuaryButton>
            </Box>
        );
    }

    return (
        <Box sx={{ flex: 1, backgroundColor: 'black' }}>
            <StatusBar hidden={!showControls} />

            <Pressable
                onPress={() => setShowControls(c => !c)}
                sx={{ flex: 1 }}
                accessibilityLabel="Toggle controls"
            >
                <Video
                    ref={videoRef}
                    source={{ uri: url }}
                    style={StyleSheet.absoluteFill}
                    resizeMode={ResizeMode.CONTAIN}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    useNativeControls={false}
                />
            </Pressable>

            {showControls && (
                <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill} pointerEvents="box-none">
                    <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: Theme.spacing.md }}>
                        {/* Header */}
                        <HStack justifyContent="space-between" alignItems="center">
                            <VStack sx={{ flex: 1, marginRight: Theme.spacing.md }}>
                                <Text color="white" size="lg" bold numberOfLines={1}>{title}</Text>
                                <Text color={Theme.colors.starlightGray} size="sm" numberOfLines={1}>{creator}</Text>
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
                        <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <HStack space="xl" alignItems="center">
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
                        <VStack space="sm">
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={(e) => {
                                    const { locationX } = e.nativeEvent;
                                    handleProgressTap(locationX, progressBarWidth.current);
                                }}
                                onLayout={(e: LayoutChangeEvent) => {
                                    progressBarWidth.current = e.nativeEvent.layout.width;
                                }}
                                accessibilityLabel="Seek in video"
                            >
                                <View style={styles.progressTrack}>
                                    <View style={[styles.progressFill, { width: progressWidth as any }]} />
                                </View>
                            </TouchableOpacity>

                            <HStack justifyContent="space-between" alignItems="center">
                                <Text color="white" size="xs">
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
