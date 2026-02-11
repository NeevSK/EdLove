/**
 * VOICE JOURNALING
 * Speak pain, feel release (2 min → peace for hours)
 * Perfect for exhausted teachers who can't type
 * Respects "works on what they have" (voice > typing)
 * 
 * Features:
 * - Voice recording with visualization
 * - Playback and review
 * - Option to save or discard
 * - Integrates with venting space
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    ButtonText,
    Pressable,
} from '@/ui';
import { StyleSheet, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    cancelAnimation,
} from 'react-native-reanimated';
import { Mic, Square, Play, Trash2, Check } from 'lucide-react-native';
import { useAudioRecorder, useAudioPlayer, AudioModule, RecordingPresets, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { Theme, typography } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';
import { hapticLight, hapticMedium } from '../../utils/haptics';

interface VoiceJournalingProps {
    userId?: string;
    onComplete?: () => void;
}

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing';

export default function VoiceJournaling({ userId, onComplete }: VoiceJournalingProps) {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recordingUri, setRecordingUri] = useState<string | null>(null);

    // Expo Audio Hooks
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [playerSource, setPlayerSource] = useState<string | null>(null);
    const player = useAudioPlayer(playerSource);
    const playerStatus = useAudioPlayerStatus(player);

    // Animation values
    const pulseScale = useSharedValue(1);
    const waveHeight = useSharedValue(20);

    useEffect(() => {
        // Just set up audio mode if needed, permissions are handled by expo-audio recorder
        setAudioModeAsync({
            playsInSilentMode: true,
            interruptionMode: 'doNotMix',
            allowsRecording: true,
        });

        return () => {
            // Cleanup happens via hooks
        };
    }, []);

    useEffect(() => {
        if (recordingState === 'recording') {
            // Start pulse animation
            pulseScale.value = withRepeat(
                withTiming(1.3, {
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            );

            // Animate wave height (simulating audio visualization)
            waveHeight.value = withRepeat(
                withTiming(60, {
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            );

            // Track duration
            const interval = setInterval(() => {
                setRecordingDuration(d => d + 1);
            }, 1000);

            return () => {
                clearInterval(interval);
                cancelAnimation(pulseScale);
                cancelAnimation(waveHeight);
            };
        } else {
            cancelAnimation(pulseScale);
            cancelAnimation(waveHeight);
            pulseScale.value = withTiming(1);
            waveHeight.value = withTiming(20);
        }
    }, [recordingState]);

    // Handle playback finish
    useEffect(() => {
        if (playerStatus.didJustFinish) {
            setRecordingState('recorded');
        }
    }, [playerStatus.didJustFinish]);

    const startRecording = async () => {
        try {
            const permission = await AudioModule.requestRecordingPermissionsAsync();
            if (!permission.granted) return;

            hapticMedium();
            await recorder.prepareToRecordAsync();
            recorder.record();
            setRecordingState('recording');
            setRecordingDuration(0);
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    };

    const stopRecording = async () => {
        try {
            hapticMedium();
            await recorder.stop();
            setRecordingUri(recorder.uri);
            setRecordingState('recorded');
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    };

    const playRecording = async () => {
        if (!recordingUri) return;

        try {
            setPlayerSource(recordingUri);
            setRecordingState('playing');
            player.play();
        } catch (error) {
            console.error('Failed to play recording:', error);
        }
    };

    const saveRecording = async () => {
        if (!recordingUri || !userId) return;

        try {
            hapticMedium();

            const { error } = await supabase
                .from('voice_journals')
                .insert([
                    {
                        user_id: userId,
                        duration_seconds: recordingDuration,
                        created_at: new Date().toISOString(),
                    },
                ]);

            if (error) {
                console.error('Failed to save voice journal:', error);
            } else {
                resetRecording();
                onComplete?.();
            }
        } catch (error) {
            console.error('Error saving voice journal:', error);
        }
    };

    const discardRecording = async () => {
        hapticLight();
        resetRecording();
    };

    const resetRecording = () => {
        setRecordingUri(null);
        setPlayerSource(null);
        setRecordingState('idle');
        setRecordingDuration(0);
    };

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const waveStyle = useAnimatedStyle(() => ({
        height: waveHeight.value,
    }));

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
            {/* Header */}
            <VStack space="xs">
                <Heading color={Theme.colors.sacredWhite} size="lg">
                    Voice Journaling
                </Heading>
                <Text color={Theme.colors.mistGray} size="sm">
                    Speak your truth, release your burden
                </Text>
            </VStack>

            {/* Recording Visualization */}
            <Box
                sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: Theme.spacing.xl,
                    backgroundColor: Theme.colors.deepIndigo,
                    borderRadius: Theme.corners.comfortable,
                    minHeight: 200,
                }}
            >
                {recordingState === 'idle' ? (
                    <VStack space="md" sx={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 64 }}>🎙️</Text>
                        <Text color={Theme.colors.mistGray} size="sm" textAlign="center">
                            Tap to start speaking
                        </Text>
                    </VStack>
                ) : recordingState === 'recording' ? (
                    <VStack space="lg" sx={{ alignItems: 'center' }}>
                        <Animated.View style={pulseStyle}>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    backgroundColor: Theme.colors.emberRed,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Mic color={Theme.colors.white} size={32} />
                            </Box>
                        </Animated.View>

                        {/* Simple wave visualization */}
                        <HStack space="xs" sx={{ alignItems: 'center' }}>
                            {[...Array(5)].map((_, i) => (
                                <Animated.View
                                    key={i}
                                    style={[
                                        waveStyle,
                                        {
                                            width: 4,
                                            backgroundColor: Theme.colors.sanctuarySaffron,
                                            borderRadius: 2,
                                        },
                                    ]}
                                />
                            ))}
                        </HStack>

                        <Text
                            color={Theme.colors.emberRed}
                            size="xl"
                            sx={{ fontWeight: typography.fontWeight.semibold }}
                        >
                            {formatDuration(recordingDuration)}
                        </Text>
                    </VStack>
                ) : (
                    <VStack space="md" sx={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 64 }}>✓</Text>
                        <Text
                            color={Theme.colors.sageGreen}
                            size="lg"
                            sx={{ fontWeight: typography.fontWeight.medium }}
                        >
                            Recording complete
                        </Text>
                        <Text color={Theme.colors.mistGray} size="sm">
                            {formatDuration(recordingDuration)}
                        </Text>
                    </VStack>
                )}
            </Box>

            {/* Controls */}
            <VStack space="md">
                {recordingState === 'idle' && (
                    <Button
                        size="lg"
                        action="primary"
                        onPress={startRecording}
                        sx={{
                            borderRadius: Theme.corners.full,
                            backgroundColor: Theme.colors.sanctuarySaffron,
                        }}
                    >
                        <Mic
                            color={Theme.colors.white}
                            size={20}
                            style={{ marginRight: Theme.spacing.sm }}
                        />
                        <ButtonText>Start Recording</ButtonText>
                    </Button>
                )}

                {recordingState === 'recording' && (
                    <Button
                        size="lg"
                        action="primary"
                        onPress={stopRecording}
                        sx={{
                            borderRadius: Theme.corners.full,
                            backgroundColor: Theme.colors.emberRed,
                        }}
                    >
                        <Square
                            color={Theme.colors.white}
                            size={20}
                            style={{ marginRight: Theme.spacing.sm }}
                        />
                        <ButtonText>Stop</ButtonText>
                    </Button>
                )}

                {(recordingState === 'recorded' || recordingState === 'playing') && (
                    <HStack space="md" justifyContent="center">
                        <Button
                            size="md"
                            variant="outline"
                            onPress={discardRecording}
                            isDisabled={recordingState === 'playing'}
                            sx={{
                                borderRadius: Theme.corners.full,
                                borderColor: Theme.colors.dimGray,
                            }}
                        >
                            <Trash2
                                color={Theme.colors.dimGray}
                                size={16}
                                style={{ marginRight: Theme.spacing.xs }}
                            />
                            <ButtonText color={Theme.colors.dimGray}>Discard</ButtonText>
                        </Button>

                        <Button
                            size="md"
                            variant="outline"
                            onPress={playRecording}
                            isDisabled={recordingState === 'playing'}
                            sx={{
                                borderRadius: Theme.corners.full,
                                borderColor: Theme.colors.sanctuarySaffron,
                            }}
                        >
                            <Play
                                color={Theme.colors.sanctuarySaffron}
                                size={16}
                                style={{ marginRight: Theme.spacing.xs }}
                            />
                            <ButtonText color={Theme.colors.sanctuarySaffron}>
                                {recordingState === 'playing' ? 'Playing...' : 'Play'}
                            </ButtonText>
                        </Button>

                        <Button
                            size="md"
                            onPress={saveRecording}
                            isDisabled={recordingState === 'playing'}
                            sx={{
                                borderRadius: Theme.corners.full,
                                backgroundColor: Theme.colors.sageGreen,
                            }}
                        >
                            <Check
                                color={Theme.colors.white}
                                size={16}
                                style={{ marginRight: Theme.spacing.xs }}
                            />
                            <ButtonText>Save</ButtonText>
                        </Button>
                    </HStack>
                )}
            </VStack>

            {/* Privacy note */}
            <Box
                sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: Theme.colors.midnightBlue,
                    borderRadius: Theme.corners.comfortable,
                }}
            >
                <Text color={Theme.colors.mistGray} size="xs" textAlign="center">
                    🔒 Your voice recording is private and stored securely
                </Text>
            </Box>
        </VStack>
    );
}
