import { Button, type MediaAdapterSet, Text } from '@repo/ui/components/native';
import type {
  AudioAdapterProps,
  CaptureResult,
  FileKind,
  FileRef,
  RecorderPort,
} from '@repo/ui/theme';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { View } from 'react-native';

/**
 * The mobile app's media adapters: the kit's ports filled with the native
 * modules this app owns (expo-audio, expo-document-picker, expo-image-picker).
 * Registered once at boot (`registerAppCatalog`); screens never import these.
 */

const MIME_BY_KIND: Partial<Record<FileKind, string[]>> = {
  image: ['image/*'],
  audio: ['audio/*'],
  video: ['video/*'],
  pdf: ['application/pdf'],
  document: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
  ],
  sheet: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
  slides: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  markdown: ['text/markdown', 'text/plain'],
  text: ['text/plain'],
};

async function pickFiles(options: {
  accept?: readonly FileKind[];
  multiple: boolean;
}): Promise<CaptureResult<FileRef[]>> {
  const type = options.accept?.flatMap((k) => MIME_BY_KIND[k] ?? []) ?? ['*/*'];
  const result = await DocumentPicker.getDocumentAsync({
    type: type.length > 0 ? type : ['*/*'],
    multiple: options.multiple,
    copyToCacheDirectory: true,
  });
  if (result.canceled) return { status: 'cancelled' };
  return {
    status: 'ok',
    value: result.assets.map((a) => ({ name: a.name, uri: a.uri, mime: a.mimeType, size: a.size })),
  };
}

async function pickImage(source: 'camera' | 'library'): Promise<CaptureResult<FileRef>> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    // Compressed before it ever leaves the phone: school data plans are small.
    quality: 0.7,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return { status: 'cancelled' };
  const asset = result.assets[0];
  if (!asset) return { status: 'cancelled' };
  return {
    status: 'ok',
    value: {
      name: asset.fileName ?? `photo-${Date.now()}.jpg`,
      uri: asset.uri,
      mime: asset.mimeType,
      size: asset.fileSize,
    },
  };
}

function useRecorder(): RecorderPort {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 250);
  const prepare = useCallback(async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) return false;
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    return true;
  }, [recorder]);
  const start = useCallback(async () => {
    recorder.record();
  }, [recorder]);
  const stop = useCallback(async () => {
    const durationMs = state.durationMillis;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });
    const uri = recorder.uri;
    if (!uri) throw new Error('The recording was not saved.');
    return { name: `voice-${Date.now()}.m4a`, uri, mime: 'audio/mp4', durationMs };
  }, [recorder, state.durationMillis]);
  return { prepare, start, stop, elapsedMs: state.durationMillis, recording: state.isRecording };
}

function formatSeconds(s: number): string {
  const total = Math.max(0, Math.floor(s));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** A plain, labelled player: play or pause, and where it is. No autoplay. */
function ExpoAudioAdapter({ file, accessibilityLabel, onError, labels }: AudioAdapterProps) {
  const player = useAudioPlayer({ uri: file.uri });
  const status = useAudioPlayerStatus(player);
  const toggle = () => {
    try {
      if (status.playing) player.pause();
      else {
        if (status.didJustFinish) void player.seekTo(0);
        player.play();
      }
    } catch {
      // A clip the platform cannot play falls back to its file card.
      onError();
    }
  };
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
    >
      <Button
        label={status.playing ? labels.pause : labels.play}
        variant="secondary"
        size="sm"
        onPress={toggle}
      />
      <Text kind="caption" tone="soft">
        {formatSeconds(status.currentTime)} / {formatSeconds(status.duration)}
      </Text>
    </View>
  );
}

export const mobileMediaAdapters: MediaAdapterSet = {
  audio: ExpoAudioAdapter,
  capture: { pickFiles, pickImage, useRecorder },
};
