/**
 * VoiceJournaling.web.tsx
 *
 * Web implementation of the Voice Sanctuary.
 * Uses MediaRecorder API for recording and <audio> for playback.
 * Purged raw HTML fragments and fixed severe syntax corruption in style objects.
 */

import { usePermissions } from '@repo/core/logic';
import { saveVoiceJournalRecord } from '@repo/self/api/selfFeatureRepository';
import { Check, CircleAlert, Mic, Play, Square, Trash2 } from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticSuccess } from '@repo/ui/utils/haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  cancelAnimation,
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface VoiceJournalingProps {
  userId?: string;
  onComplete?: () => void;
}

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing' | 'unsupported';

export default function VoiceJournaling({ userId, onComplete }: VoiceJournalingProps) {
  const { t } = useTranslation();
  const { context } = usePermissions();
  const activeUserId = userId || context.userId;

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation values
  const pulseScale = useSharedValue(1);
  const waveHeight = useSharedValue(12);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const waveStyle = useAnimatedStyle(() => ({
    height: waveHeight.value,
    opacity: interpolate(waveHeight.value, [12, 40], [0.3, 1]),
  }));

  function interpolate(value: number, input: [number, number], output: [number, number]) {
    'worklet';
    const [iMin, iMax] = input;
    const [oMin, oMax] = output;
    return oMin + ((value - iMin) * (oMax - oMin)) / (iMax - iMin);
  }

  // Check browser support
  useEffect(() => {
    if (typeof window === 'undefined' || !window.MediaRecorder) {
      setRecordingState('unsupported');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (durationTimer.current) clearInterval(durationTimer.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (durationTimer.current) clearInterval(durationTimer.current);
    cancelAnimation(pulseScale);
    cancelAnimation(waveHeight);
    pulseScale.value = withTiming(1);
    waveHeight.value = withTiming(12);
    setRecordingState('recorded');
  }, [pulseScale, waveHeight]);

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
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setRecordingState('recording');
      setRecordingDuration(0);

      durationTimer.current = setInterval(() => {
        setRecordingDuration((d) => {
          if (d >= 120) {
            stopRecording();
            return d;
          }
          return d + 1;
        });
      }, 1000);

      pulseScale.value = withRepeat(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
      waveHeight.value = withRepeat(
        withTiming(48, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } catch (_err) {
      setRecordingState('unsupported');
    }
  }, [recordingState, waveHeight, stopRecording, pulseScale]);

  const playRecording = useCallback(() => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setRecordingState('recorded');
    }
    audioRef.current.play();
    setRecordingState('playing');

    waveHeight.value = withRepeat(
      withTiming(32, { duration: 400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [audioUrl, waveHeight]);

  const discardRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    cancelAnimation(waveHeight);
    setAudioUrl(null);
    setRecordingDuration(0);
    setRecordingState('idle');
  }, [audioUrl, waveHeight]);

  const saveRecording = useCallback(async () => {
    if (!audioUrl || !activeUserId) {
      onComplete?.();
      return;
    }
    setSaveError(null);
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      await saveVoiceJournalRecord(activeUserId, {
        durationSeconds: recordingDuration,
        blob,
        extension: 'webm',
        contentType: 'audio/webm',
      });
      hapticSuccess();
    } catch {
      setSaveError('Your recording could not be saved. It is still here—please try again.');
      return;
    }
    discardRecording();
    onComplete?.();
  }, [audioUrl, activeUserId, recordingDuration, discardRecording, onComplete]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (recordingState === 'unsupported') {
    return (
      <VStack className="p-xl gap-md items-center bg-obsidian rounded-comfortable border border-white/5">
        <Icon as={CircleAlert} size={48} className="text-emberRed" />
        <Heading size="md" className="text-center text-sacredWhite">
          Microphone Unavailable
        </Heading>
        <Text className="text-center text-mistGray leading-relaxed max-w-[280px]">
          Your browser doesn't support microphone access, or permission was denied.
        </Text>
        {onComplete && (
          <Button variant="outline" onPress={onComplete} className="mt-4 border-white/10">
            <ButtonText className="text-mistGray">Close</ButtonText>
          </Button>
        )}
      </VStack>
    );
  }

  return (
    <VStack className="p-xl gap-xl items-center bg-obsidian rounded-comfortable border border-white/5 shadow-xl">
      <VStack className="items-center gap-1">
        <Heading size="lg" className="text-sacredWhite text-center">
          Voice Journal
        </Heading>
        <Text className="text-mistGray text-center text-sm max-w-[320px]">
          {recordingState === 'idle' && 'Tap the mic to start. Speak your truth.'}
          {recordingState === 'recording' && `Recording... ${formatDuration(recordingDuration)}`}
          {recordingState === 'recorded' &&
            `Reflection captured (${formatDuration(recordingDuration)}).`}
          {recordingState === 'playing' && 'Replaying your reflection...'}
        </Text>
      </VStack>

      {/* Main Recorder Control */}
      <Box className="w-40 h-40 items-center justify-center relative">
        {(recordingState === 'recording' || recordingState === 'playing') && (
          <AnimatedView
            style={[pulseStyle]}
            className="absolute w-32 h-32 rounded-full bg-sanctuarySaffron/20 border border-sanctuarySaffron/30"
          />
        )}

        <Pressable
          onPress={recordingState === 'recording' ? stopRecording : startRecording}
          accessibilityRole="button"
          accessibilityLabel={recordingState === 'recording' ? 'Stop recording' : 'Start recording'}
          accessibilityHint={
            recordingState === 'recording'
              ? 'Stops the current voice reflection'
              : 'Starts a new voice reflection'
          }
          className={`w-24 h-24 rounded-full items-center justify-center transition-all duration-300 shadow-lg ${
            recordingState === 'recording'
              ? 'bg-emberRed scale-110 shadow-emberRed/30'
              : 'bg-sanctuarySaffron shadow-sanctuarySaffron/30'
          }`}
        >
          <Icon
            as={recordingState === 'recording' ? Square : Mic}
            className="text-white"
            size={32}
            fill={recordingState === 'recording' ? 'white' : 'none'}
          />
        </Pressable>
      </Box>

      {/* Visualizer */}
      {(recordingState === 'recording' || recordingState === 'playing') && (
        <HStack className="items-center gap-1 h-16">
          {[1, 2, 3, 4, 5].map((i) => (
            <AnimatedView
              key={i}
              style={[waveStyle]}
              className="w-1.5 bg-sanctuarySaffron rounded-full"
            />
          ))}
        </HStack>
      )}

      {/* Actions */}
      {(recordingState === 'recorded' || recordingState === 'playing') && (
        <AnimatedView entering={FadeInUp}>
          {saveError ? (
            <Text className="text-sm text-emberRed font-semibold mb-3" accessibilityRole="alert">
              {saveError}
            </Text>
          ) : null}
          <HStack className="gap-6 mt-4">
            <Pressable
              onPress={discardRecording}
              accessibilityRole="button"
              accessibilityLabel="Discard recording"
              accessibilityHint="Deletes this voice reflection"
              className="w-14 h-14 rounded-full border border-white/10 bg-white/5 items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Icon as={Trash2} size={24} className="text-mistGray" />
            </Pressable>

            <Pressable
              onPress={recordingState === 'playing' ? undefined : playRecording}
              disabled={recordingState === 'playing'}
              accessibilityRole="button"
              accessibilityLabel="Play recording"
              accessibilityHint="Replays this voice reflection"
              accessibilityState={{ disabled: recordingState === 'playing' }}
              className={`w-14 h-14 rounded-full border border-sanctuarySaffron/30 items-center justify-center bg-sanctuarySaffron/10 transition-all ${
                recordingState === 'playing'
                  ? 'opacity-50 scale-95'
                  : 'hover:bg-sanctuarySaffron/20'
              }`}
            >
              <Icon as={Play} size={24} className="text-sanctuarySaffron" fill="currentColor" />
            </Pressable>

            <Pressable
              onPress={saveRecording}
              accessibilityRole="button"
              accessibilityLabel="Save recording"
              accessibilityHint="Saves this voice reflection"
              className="w-14 h-14 rounded-full bg-emeraldGreen items-center justify-center shadow-lg shadow-emeraldGreen/30 hover:scale-105 transition-transform"
            >
              <Icon as={Check} size={24} className="text-white" />
            </Pressable>
          </HStack>
        </AnimatedView>
      )}

      {/* Status Footer */}
      {recordingState === 'recording' && (
        <Text className="text-sanctuarySaffron font-black text-2xl tracking-tighter">
          {formatDuration(recordingDuration)}
        </Text>
      )}
    </VStack>
  );
}
