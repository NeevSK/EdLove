import React, { useState } from 'react';
import { StyleSheet, Dimensions, StatusBar } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    useThemedColors,
    Theme,
    ScreenWrapper,
    SanctuaryButton,
    Pressable,
} from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import { Play, Pause, RotateCcw, RotateCw, Maximize, X } from 'lucide-react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

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
    const { title, creator } = route.params;
    const navigation = useNavigation<any>();
    const colors = useThemedColors();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(124); // 2:04
    const [duration, setDuration] = useState(480); // 8:00
    const [showControls, setShowControls] = useState(true);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <Box sx={{ flex: 1, backgroundColor: 'black' }}>
            <StatusBar hidden={!showControls} />

            {/* Video Content Placeholder */}
            <Pressable
                onPress={() => setShowControls(!showControls)}
                sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
                <Box sx={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: Theme.colors.ink, alignItems: 'center', justifyContent: 'center' }}>
                    <Play color={Theme.colors.sanctuarySaffron} size={64} opacity={0.3} />
                </Box>
            </Pressable>

            {/* Controls Overlay */}
            {showControls && (
                <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill}>
                    <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: Theme.spacing.md }}>
                        {/* Header */}
                        <HStack justifyContent="space-between" alignItems="center">
                            <VStack>
                                <Text color="white" size="lg" bold>{title}</Text>
                                <Text color={Theme.colors.starlightGray} size="sm">{creator}</Text>
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

                        <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <HStack space="xl" alignItems="center">
                                <SanctuaryButton
                                    variant="ghost"
                                    leftIcon={RotateCcw}
                                    onPress={() => { }}
                                    accessibilityLabel="Rewind 10 seconds"
                                >
                                    {''}
                                </SanctuaryButton>
                                <Pressable
                                    onPress={() => setIsPlaying(!isPlaying)}
                                    accessibilityLabel={isPlaying ? "Pause video" : "Play video"}
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
                                        shadowOpacity: 0.5
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
                                    onPress={() => { }}
                                    accessibilityLabel="Forward 10 seconds"
                                >
                                    {''}
                                </SanctuaryButton>
                            </HStack>
                        </Box>

                        {/* Footer Controls */}
                        <VStack space="sm">
                            {/* Progress Bar Placeholder */}
                            <Box sx={{ height: 4, width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, position: 'relative' }}>
                                <Box sx={{ height: 4, width: '30%', backgroundColor: Theme.colors.sanctuarySaffron, borderRadius: 2 }} />
                            </Box>

                            <HStack justifyContent="space-between" alignItems="center">
                                <Text color="white" size="xs">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </Text>
                                <HStack space="sm">
                                    <SanctuaryButton
                                        variant="ghost"
                                        size="xs"
                                        leftIcon={Maximize}
                                        onPress={() => { }}
                                    >
                                        {''}
                                    </SanctuaryButton>
                                </HStack>
                            </HStack>
                        </VStack>
                    </Box>
                </Animated.View>
            )}
        </Box>
    );
}
