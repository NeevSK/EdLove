/**
 * Web shim for expo-audio.
 *
 * Provides mock hook implementations to prevent Metro and React from crashing
 * when native `expo-audio` modules are imported in shared components (e.g. VoiceJournaling)
 * on the web.
 */

const _React = require('react');

const AudioModule = {
  requestRecordingPermissionsAsync: async () => ({ granted: false }),
};

const RecordingPresets = {
  HIGH_QUALITY: {},
};

function useAudioRecorder() {
  return {
    prepareToRecordAsync: async () => {},
    record: () => {},
    stop: async () => {},
    uri: null,
  };
}

function useAudioPlayer(_source) {
  return {
    play: () => {},
    pause: () => {},
    stop: () => {},
    seekTo: () => {},
    currentTime: 0,
    duration: 0,
  };
}

function useAudioPlayerStatus(_player) {
  return {
    didJustFinish: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  };
}

async function setAudioModeAsync() {
  return;
}

module.exports = {
  AudioModule,
  RecordingPresets,
  useAudioRecorder,
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
};
