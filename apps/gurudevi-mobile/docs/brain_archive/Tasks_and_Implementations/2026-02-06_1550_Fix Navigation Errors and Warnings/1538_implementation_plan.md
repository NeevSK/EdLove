# Fix Navigation and Deprecation Warnings

## User Review Required
> [!IMPORTANT]
> I will replace `SafeAreaView` from `react-native` with `react-native-safe-area-context`. This is a standard fix for the deprecation warning.
> I will also fix the critical crash in `TabNavigator` by correctly rendering the `Classroom` screen.

## Proposed Changes

### Navigation Fix
#### [MODIFY] [TabNavigator.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/navigation/TabNavigator.tsx)
- Remove conflicting `component` prop on `Classroom` tab screen.
- Keep the `children` render function to ensuring `ClassroomStackNavigator` is wrapped in `ErrorBoundary`.

### Deprecation Fixes
#### [MODIFY] [VoiceJournaling.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/components/self/VoiceJournaling.tsx)
- Replace `expo-av` imports with `expo-audio`.
- Update `Audio` usage to use the new `expo-audio` API (e.g., `useAudioRecorder`, `useAudioPlayer`).

#### [MODIFY] [App.tsx](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/App.tsx)
- Find and replace `SafeAreaView` from `react-native` with `SafeAreaView` from `react-native-safe-area-context`.

### Translation Fix
#### [MODIFY] [en.json](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/i18n/locales/en.json)
- Add missing keys in `tabs` object:
  - `"school": "School"`
  - `"section": "Section"`

## Verification Plan
### Automated Tests
- None available for this specific UI logic.
### Manual Verification
- **Run the app**: Verify the "Render Error" is gone.
- **Check Terminal**: Verify `SafeAreaView` and `expo-av` warnings are gone.
- **Check UI**: Verify "Classroom" tab loads correctly and "Voice Journaling" still works.
