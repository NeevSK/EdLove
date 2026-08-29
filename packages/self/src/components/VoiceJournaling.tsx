/**
 * VOICE SANCTUARY
 * Voice-based journaling for emotional release.
 * Simple, focused, and intimate interface.
 */

import { Check, Mic, Square, Volume2, X } from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Easing,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AudioModule } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { saveVoiceJournalRecord } from '@repo/self/api/selfFeatureRepository';
import { Observe } from 'expo-observe';

interface VoiceJournalingProps {
  userId?: string;
  onFinished?: (uri: string) => void;
}

export const VoiceJournaling: React.FC<VoiceJournalingProps> = ({ userId, onFinished }) => {
  const { t } = useTranslation();
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'finished'>('idle');
  const [duration, setDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const recorderRef = useRef<InstanceType<typeof AudioModule.AudioRecorder> | null>(null);

  // Animation shared values
  const pulseScale = useSharedValue(1);
  const [graph0, graph1, graph2, graph3, graph4] = [
    useSharedValue(10),
    useSharedValue(25),
    useSharedValue(40),
    useSharedValue(20),
    useSharedValue(35),
  ];

  // One animated style per waveform bar; hooks stay unconditional and top-level.
  const audioGraphStyles = [
    useAnimatedStyle(() => ({ height: graph0.value })),
    useAnimatedStyle(() => ({ height: graph1.value })),
    useAnimatedStyle(() => ({ height: graph2.value })),
    useAnimatedStyle(() => ({ height: graph3.value })),
    useAnimatedStyle(() => ({ height: graph4.value })),
  ];

  useEffect(() => {
    if (recordingState === 'recording') {
      pulseScale.value = withRepeat(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );

      // Random-ish animation for the wave
      for (const [i, val] of [graph0, graph1, graph2, graph3, graph4].entries()) {
        val.value = withRepeat(
          withTiming(15 + Math.random() * 40, {
            duration: 400 + i * 100,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true,
        );
      }

      const interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      pulseScale.value = withTiming(1);
      for (const val of [graph0, graph1, graph2, graph3, graph4]) {
        val.value = withTiming(4);
      }
    }
    return;
  }, [recordingState, pulseScale, graph0, graph1, graph2, graph3, graph4]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    hapticLight();
    if (Platform.OS === 'web') {
      setRecordingState('recording');
      setDuration(0);
      return;
    }
    try {
      const { status } = await AudioModule.requestRecordingPermissionsAsync();
      if (status !== 'granted') return;
      const rec: InstanceType<typeof AudioModule.AudioRecorder> = new (AudioModule.AudioRecorder as unknown as { new (opts?: unknown): InstanceType<typeof AudioModule.AudioRecorder> })({
        extension: '.m4a',
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
      } as unknown as never);
      await rec.prepareToRecordAsync();
      recorderRef.current = rec;
      rec.record();
      setRecordingState('recording');
      setDuration(0);
    } catch (e) {
      console.warn('[voice] start failed', e);
      setRecordingState('idle');
    }
  };

  const handleStop = async () => {
    hapticLight();
    if (Platform.OS === 'web') {
      setRecordingState('finished');
      return;
    }
    try {
      const rec = recorderRef.current;
      if (!rec) {
        setRecordingState('finished');
        return;
      }
      await rec.stop();
      const uri = (rec as unknown as { uri: string | null }).uri ?? null;
      setRecordedUri(uri);
      setRecordingState('finished');
      if (uri) {
        try {
          const dir = `${FileSystem.documentDirectory}voice-journals/`;
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
          const dest = `${dir}voice_${Date.now()}.m4a`;
          await FileSystem.copyAsync({ from: uri, to: dest }).catch(() => {});
        } catch {}
      }
    } catch (e) {
      console.warn('[voice] stop failed', e);
      setRecordingState('finished');
    }
  };

  const handleReset = () => {
    hapticLight();
    setRecordingState('idle');
    setDuration(0);
    setRecordedUri(null);
    recorderRef.current = null;
  };

  const handleConfirm = async () => {
    hapticSuccess();
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (userId) {
        let blob: Blob | undefined;
        if (recordedUri && Platform.OS !== 'web') {
          try {
            const base64 = await FileSystem.readAsStringAsync(recordedUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
            blob = new Blob([bytes], { type: 'audio/m4a' });
          } catch {}
        }
        await saveVoiceJournalRecord(userId, {
          durationSeconds: duration,
          blob,
          extension: 'm4a',
          contentType: 'audio/m4a',
        });
        try {
          (Observe as unknown as { logEvent: (n: string, o?: unknown) => void }).logEvent('self_voice_recorded', {
            attributes: { durationSeconds: duration, hasBlob: !!blob },
          } as unknown as never);
        } catch {}
      }
    } catch (e) {
      console.warn('[voice] save failed', e);
    } finally {
      setIsSaving(false);
    }
    onFinished?.(recordedUri ?? 'mock-uri');
    handleReset();
  };

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(pulseScale.value, [1, 1.2], [0.3, 0.6]),
  }));

  return (
    <VStack className="p-lg gap-lg items-center bg-obsidian rounded-comfortable border border-white/5 shadow-xl">
      <VStack className="items-center gap-1">
        <Heading size="md" className="text-sacredWhite">
          {t('self.voiceJournal') || 'Voice Sanctuary'}
        </Heading>
        <Text className="text-mistGray text-xs italic">
          {recordingState === 'recording'
            ? t('self.recordingHint') || 'The void is listening...'
            : t('self.voiceJournalSubtitle') || 'Speak your truth, let it go.'}
        </Text>
      </VStack>

      {/* Recording Visual */}
      <Box className="w-40 h-40 items-center justify-center relative my-4">
        {recordingState === 'recording' && (
          <AnimatedView
            style={[pulseAnimatedStyle]}
            className="absolute w-32 h-32 rounded-full bg-sanctuarySaffron"
          />
        )}

        <Button
          onPress={recordingState === 'recording' ? handleStop : handleStart}
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
        </Button>
      </Box>

      {/* Waveform / Status */}
      <VStack className="items-center gap-4 w-full">
        {recordingState === 'recording' && (
          <HStack className="items-center gap-1.5 h-12">
            {audioGraphStyles.map((style, i) => (
              <AnimatedView
                key={i}
                style={style}
                className="w-1 bg-sanctuarySaffron rounded-full"
              />
            ))}
          </HStack>
        )}

        <VStack className="items-center">
          <Text
            className={`text-4xl font-black ${recordingState === 'recording' ? 'text-sanctuarySaffron' : 'text-sacredWhite'}`}
          >
            {formatDuration(duration)}
          </Text>
          <Text className="text-mistGray text-xs mt-1">
            {recordingState === 'recording'
              ? t('self.recording') || 'Active Recording'
              : t('self.tapToStart') || 'Tap the Mic to Begin'}
          </Text>
        </VStack>
      </VStack>

      {/* Controls */}
      {recordingState === 'finished' && (
        <AnimatedView entering={FadeInUp} className="w-full">
          <HStack className="justify-center gap-6 mt-2">
            <Button
              onPress={handleReset}
              variant="outline"
              className="w-14 h-14 rounded-full border-white/10 bg-white/5 p-0 items-center justify-center"
            >
              <Icon as={X} size={24} className="text-mistGray" />
            </Button>

            <Button
              onPress={handleConfirm}
              className="w-14 h-14 rounded-full bg-emeraldGreen p-0 items-center justify-center shadow-lg shadow-emeraldGreen/30"
            >
              <Icon as={Check} size={24} className="text-white" />
            </Button>
          </HStack>
        </AnimatedView>
      )}

      {/* Philosophy Note */}
      <Box className="mt-4 p-md bg-white/5 rounded-comfort border border-white/5 w-full">
        <HStack className="items-center gap-2 justify-center">
          <Icon as={Volume2} size={12} className="text-dimGray" />
          <Text className="text-dimGray text-[10px] italic">
            Your voice is a vessel for healing. Release it.
          </Text>
        </HStack>
      </Box>
    </VStack>
  );
};

export default VoiceJournaling;
