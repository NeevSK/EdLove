/**
 * VoiceJournaling.web.tsx \u2014 Pattern A: web fallback
 *
 * On native, VoiceJournaling uses `expo-audio` (useAudioRecorder, useAudioPlayer,
 * AudioModule, RecordingPresets) which are JSI-bridged native modules.
 * On web Metro resolves this file instead.
 *
 * We implement a best-effort web experience:
 *  - MediaRecorder API for recording (supported in Chrome, Firefox, Edge, Safari 14.1+)
 *  - <audio> element for playback
 *  - Text fallback message if browser doesn't support MediaRecorder
 *  - Saves transcribed/recorded blobs to Supabase storage on submit
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    ButtonText,
    Pressable,
} from '@repo/ui';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    cancelAnimation,
} from 'react-native-reanimated';
import { Mic, Square, Play, Trash2, Check } from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { saveVoiceJournalRecord } from '../api/selfFeatureRepository';

interface VoiceJournalingProps {
    userId?: string;
    onComplete?: () => void;
}

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing' | 'unsupported';

export default function VoiceJournaling({ userId, onComplete }: VoiceJournalingProps) {
    const { t } = useTranslation();
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    // Animation values
    const pulseScale = useSharedValue(1);
    const waveHeight = useSharedValue(20);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const waveStyle = useAnimatedStyle(() => ({
        height: waveHeight.value,
        borderRadius: waveHeight.value / 2,
    }));

    // Check browser support on mount
    useEffect(() => {
        if (typeof window === 'undefined' || !window.MediaRecorder) {
            setRecordingState('unsupported');
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (durationTimer.current) clearInterval(durationTimer.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const startRecording = useCallback(async () => {
        if (recordingState === 'unsupported') return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';
            const recorder = new MediaRecorder(stream, { mimeType });
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorderRef.current = recorder;
            recorder.start(100);
            setRecordingState('recording');
            setRecordingDuration(0);

            // Start duration counter
            durationTimer.current = setInterval(() => {
                setRecordingDuration(d => {
                    if (d >= 120) { // 2 min max
                        stopRecording();
                        return d;
                    }
                    return d + 1;
                });
            }, 1000);

            // Animations
            pulseScale.value = withRepeat(
                withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                -1, true,
            );
            waveHeight.value = withRepeat(
                withTiming(40, { duration: 600, easing: Easing.inOut(Easing.ease) }),
                -1, true,
            );
        } catch (err) {
            setRecordingState('unsupported');
        }
    }, [recordingState]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (durationTimer.current) clearInterval(durationTimer.current);
        cancelAnimation(pulseScale);
        cancelAnimation(waveHeight);
        pulseScale.value = withTiming(1);
        waveHeight.value = withTiming(20);
        setRecordingState('recorded');
    }, []);

    const playRecording = useCallback(() => {
        if (!audioUrl) return;
        if (!audioRef.current) {
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onended = () => setRecordingState('recorded');
        }
        audioRef.current.play();
        setRecordingState('playing');
    }, [audioUrl]);

    const discardRecording = useCallback(() => {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setRecordingDuration(0);
        setRecordingState('idle');
    }, [audioUrl]);

    const saveRecording = useCallback(async () => {
        if (!audioUrl || !userId) { onComplete?.(); return; }
        try {
            const response = await fetch(audioUrl);
            const blob = await response.blob();
            await saveVoiceJournalRecord(userId, {
                durationSeconds: recordingDuration,
                blob,
                extension: 'webm',
                contentType: 'audio/webm',
            });
        } catch {
            // fire-and-forget \u2014 primary value is the recording itself
        }
        discardRecording();
        onComplete?.();
    }, [audioUrl, userId, recordingDuration, discardRecording, onComplete]);

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    // \u2500\u2500 Unsupported \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    if (recordingState === 'unsupported') {
        return (
            <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center', gap: Theme.spacing.md }}>
                <Text style={{ fontSize: 36 }}>🎙️</Text>
                <Heading size="md" style={{ textAlign: 'center', color: Theme.colors.inkTruth }}>
                    Voice Journaling
                </Heading>
                <Text style={{ textAlign: 'center', color: Theme.colors.willow, lineHeight: 22 }}>
                    Your browser doesn't support microphone access, or permission was denied.
                    {'\n\n'}Try Chrome, Firefox, or Safari 14.1+ and allow microphone access when prompted.
                </Text>
                {onComplete && (
                    <Button variant="outline" onPress={onComplete}>
                        <ButtonText>Close</ButtonText>
                    </Button>
                )}
            </Box>
        );
    }

    // ── Main UI ──────────────────────────────────────────────────────────────────────────
    return (
        <VStack
            sx={{
                padding: Theme.spacing.xl,
                gap: Theme.spacing.lg,
                alignItems: 'center',
                backgroundColor: Theme.colors.vellum,
            }}
        >
            <Heading size="lg" style={{ color: Theme.colors.inkTruth, textAlign: 'center' }}>
                Voice Journal
            </Heading>
            <Text style={{ color: Theme.colors.willow, textAlign: 'center', lineHeight: 22, maxWidth: 320 }}>
                {recordingState === 'idle' && 'Tap the mic to start. Speak for up to 2 minutes.'}
                {recordingState === 'recording' && `Recording... ${formatDuration(recordingDuration)}`}
                {recordingState === 'recorded' && `Recording saved (${formatDuration(recordingDuration)}). Play back or save it.`}
                {recordingState === 'playing' && 'Playing back...'}
            </Text>

            {/* Animated mic / wave */}
            <View style={styles.visualizerContainer}>
                {(recordingState === 'recording' || recordingState === 'playing') ? (
                    <Animated.View style={[styles.waveBar, waveStyle, { backgroundColor: Theme.colors.sanctuarySaffron }]} />
                ) : null}

                <Animated.View style={[
                    styles.micButton,
                    {
                        backgroundColor: recordingState === 'recording'
                            ? Theme.colors.error ?? '#E53E3E'
                            : Theme.colors.sanctuarySaffron,
                    },
                    pulseStyle,
                ]}>
                    <Pressable
                        onPress={recordingState === 'recording' ? stopRecording : startRecording}
                        style={styles.micInner}
                        accessibilityRole="button"
                        accessibilityLabel={recordingState === 'recording' ? 'Stop recording' : 'Start recording'}
                    >
                        {recordingState === 'recording'
                            ? <Square size={28} color="#fff" fill="#fff" />
                            : <Mic size={28} color="#fff" />
                        }
                    </Pressable>
                </Animated.View>
            </View>

            {/* Playback / save controls — shown when recording is ready */}
            {(recordingState === 'recorded' || recordingState === 'playing') && (
                <HStack sx={{ gap: Theme.spacing.md }}>
                    <Pressable
                        onPress={discardRecording}
                        style={[styles.actionBtn, { borderColor: Theme.colors.border }]}
                        accessibilityLabel="Discard recording"
                    >
                        <Trash2 size={20} color={Theme.colors.willow} />
                    </Pressable>
                    <Pressable
                        onPress={recordingState === 'playing' ? undefined : playRecording}
                        style={[styles.actionBtn, { borderColor: Theme.colors.sanctuarySaffron + '50', opacity: recordingState === 'playing' ? 0.5 : 1 }]}
                        accessibilityLabel="Play recording"
                    >
                        <Play size={20} color={Theme.colors.sanctuarySaffron} fill={Theme.colors.sanctuarySaffron} />
                    </Pressable>
                    <Pressable
                        onPress={saveRecording}
                        style={[styles.actionBtn, { backgroundColor: Theme.colors.sanctuarySaffron, borderColor: Theme.colors.sanctuarySaffron }]}
                        accessibilityLabel="Save recording"
                    >
                        <Check size={20} color="#fff" />
                    </Pressable>
                </HStack>
            )}
        </VStack>
    );
}

const styles = StyleSheet.create({
    visualizerContainer: {
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
    },
    waveBar: {
        position: 'absolute',
        width: 4,
        borderRadius: 2,
    },
    micButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Theme.colors.shadowViolet,
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    micInner: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
