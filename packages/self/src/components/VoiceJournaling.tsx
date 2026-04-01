import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { 
    VStack, 
    HStack, 
    Text, 
    Theme, 
    useThemedColors,
    GlassCard,
    Box
} from '@repo/ui';
import { Mic, Square, Check, X, Play, Pause } from 'lucide-react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    Easing,
    interpolate
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

// Mocking audio for now as per @repo/core patterns if not available
const AudioModule = {
    startRecording: async () => {},
    stopRecording: async () => ({ uri: 'mock-uri', duration: 1000 }),
    playAsync: async (uri: string) => {},
};

export const VoiceJournaling: React.FC = () => {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'finished'>('idle');
    const [duration, setDuration] = useState(0);
    const pulseScale = useSharedValue(1);
    const waveHeight = useSharedValue(10);

    useEffect(() => {
        if (recordingState === 'recording') {
            pulseScale.value = withRepeat(
                withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
            waveHeight.value = withRepeat(
                withTiming(40, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );

            const interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            pulseScale.value = withTiming(1);
            waveHeight.value = withTiming(10);
        }
    }, [recordingState]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = async () => {
        setRecordingState('recording');
        setDuration(0);
        await AudioModule.startRecording();
    };

    const handleStop = async () => {
        setRecordingState('finished');
        await AudioModule.stopRecording();
    };

    const handleReset = () => {
        setRecordingState('idle');
        setDuration(0);
    };

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: interpolate(pulseScale.value, [1, 1.2], [0.6, 1])
    }));

    const waveStyle = useAnimatedStyle(() => ({
        height: waveHeight.value,
    }));

    return (
        <GlassCard style={styles.container}>
            <VStack space="xl" alignItems="center">
                <Text fontWeight="700" size="lg">
                    {t('self.voiceJournal') || 'Voice Sanctuary'}
                </Text>

                <Box style={styles.recordOuter}>
                    {recordingState === 'recording' && (
                        <Animated.View style={[styles.pulseCircle, pulseStyle]} />
                    )}
                    <TouchableOpacity 
                        onPress={recordingState === 'recording' ? handleStop : handleStart}
                        style={[
                            styles.recordBtn, 
                            recordingState === 'recording' && styles.recordBtnActive
                        ]}
                    >
                        {recordingState === 'recording' ? (
                            <Square size={32} color="white" fill="white" />
                        ) : (
                            <Mic size={32} color="white" />
                        )}
                    </TouchableOpacity>
                </Box>

                <VStack space="xs" alignItems="center">
                    <Text size="xl" fontWeight="800" color={recordingState === 'recording' ? Theme.colors.sanctuarySaffron : colors.text}>
                        {formatDuration(duration)}
                    </Text>
                    <Text size="xs" color={colors.textSecondary}>
                        {recordingState === 'recording' ? t('self.recording') || 'Listening...' : t('self.tapToStart') || 'Tap to start reflecting'}
                    </Text>
                </VStack>

                {recordingState === 'finished' && (
                    <HStack space="md">
                        <TouchableOpacity onPress={handleReset} style={styles.actionBtn}>
                            <X size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnConfirm]}>
                            <Check size={20} color="white" />
                        </TouchableOpacity>
                    </HStack>
                )}
            </VStack>
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        borderRadius: 24,
    },
    recordOuter: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Theme.colors.sanctuarySaffron,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: Theme.colors.sanctuarySaffron,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    recordBtnActive: {
        backgroundColor: '#EF4444',
        shadowColor: '#EF4444',
    },
    pulseCircle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Theme.colors.sanctuarySaffron,
    },
    actionBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnConfirm: {
        backgroundColor: Theme.colors.sageGreen,
    }
});
