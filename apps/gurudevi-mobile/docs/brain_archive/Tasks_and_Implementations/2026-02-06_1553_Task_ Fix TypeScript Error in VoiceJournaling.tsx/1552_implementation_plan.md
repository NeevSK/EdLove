# Implementation Plan - Fix expo-audio API Usage in VoiceJournaling.tsx

The `VoiceJournaling.tsx` component is using an outdated or incorrect API for `expo-audio`, leading to TypeScript errors. Specifically, `prepareRecordingAsync` needs to be renamed to `prepareToRecordAsync`, and the `AudioMode` configuration needs to be updated.

## Proposed Changes

### apps/gurudevi-mobile/src/components/self/VoiceJournaling.tsx

#### [MODIFY] [VoiceJournaling.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/self/VoiceJournaling.tsx)

- Update imports to include `setAudioModeAsync` directly from `expo-audio`.
- Update `useEffect` that calls `AudioModule.setAudioModeAsync` to use the standalone `setAudioModeAsync` and updated property names:
  - `playsInSilentModeIOS` -> `playsInSilentMode`
  - `interruptionModeIOS` -> `interruptionMode` (change value `1` to `'doNotMix'`)
  - `allowsRecordingIOS` -> `allowsRecording`
- Rename `recorder.prepareRecordingAsync()` to `recorder.prepareToRecordAsync()` in `startRecording`.

## Verification Plan

### Automated Tests
- Since this is a TypeScript/Lint error, I will verify the fix by running a lint check or checking the file again for any remaining errors if the environment supports it.

### Manual Verification
- Verify that the app starts without errors.
- Verify that voice recording still works as expected (requires physical device or proper simulator setup, but I can at least verify that the code compiles).
