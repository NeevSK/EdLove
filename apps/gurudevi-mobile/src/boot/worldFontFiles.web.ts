/**
 * The world font files, for the web build only. Native builds embed the same
 * files through the expo-font plugin (app.json), so they never import these
 * and the files are not bundled twice. Keep in step with app.json; the test
 * in src/__tests__/boot/worldFontFiles.test.ts checks both against the folder.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
export const WORLD_FONT_FILES: Readonly<Record<string, number>> = {
  'AbhayaLibre-Regular': require('@/assets/fonts/world/AbhayaLibre-Regular.ttf'),
  'AbhayaLibre-SemiBold': require('@/assets/fonts/world/AbhayaLibre-SemiBold.ttf'),
  'Alegreya-Italic-VF': require('@/assets/fonts/world/Alegreya-Italic-VF.ttf'),
  'Alegreya-VF': require('@/assets/fonts/world/Alegreya-VF.ttf'),
  'AlegreyaSans-Bold': require('@/assets/fonts/world/AlegreyaSans-Bold.ttf'),
  'AlegreyaSans-Regular': require('@/assets/fonts/world/AlegreyaSans-Regular.ttf'),
  'Anybody-Italic-VF': require('@/assets/fonts/world/Anybody-Italic-VF.ttf'),
  'Arima-VF': require('@/assets/fonts/world/Arima-VF.ttf'),
  'Catamaran-VF': require('@/assets/fonts/world/Catamaran-VF.ttf'),
  'CormorantGaramond-Italic-VF': require('@/assets/fonts/world/CormorantGaramond-Italic-VF.ttf'),
  'CormorantGaramond-VF': require('@/assets/fonts/world/CormorantGaramond-VF.ttf'),
  'Fraunces-Italic-VF': require('@/assets/fonts/world/Fraunces-Italic-VF.ttf'),
  'Fraunces-VF': require('@/assets/fonts/world/Fraunces-VF.ttf'),
  'GemunuLibre-VF': require('@/assets/fonts/world/GemunuLibre-VF.ttf'),
  'HindMadurai-Medium': require('@/assets/fonts/world/HindMadurai-Medium.ttf'),
  'HindMadurai-Regular': require('@/assets/fonts/world/HindMadurai-Regular.ttf'),
  'IBMPlexSans-Regular': require('@/assets/fonts/world/IBMPlexSans-Regular.ttf'),
  'Inter-VF': require('@/assets/fonts/world/Inter-VF.ttf'),
  'Jost-VF': require('@/assets/fonts/world/Jost-VF.ttf'),
  'Lora-Italic': require('@/assets/fonts/world/Lora-Italic.ttf'),
  'Lora-Regular': require('@/assets/fonts/world/Lora-Regular.ttf'),
  'MuktaMalar-Regular': require('@/assets/fonts/world/MuktaMalar-Regular.ttf'),
  'MuktaMalar-SemiBold': require('@/assets/fonts/world/MuktaMalar-SemiBold.ttf'),
  'Newsreader-Italic-VF': require('@/assets/fonts/world/Newsreader-Italic-VF.ttf'),
  'Newsreader-VF': require('@/assets/fonts/world/Newsreader-VF.ttf'),
  'NotoSansSinhala-VF': require('@/assets/fonts/world/NotoSansSinhala-VF.ttf'),
  'NotoSansSinhala-Width-VF': require('@/assets/fonts/world/NotoSansSinhala-Width-VF.ttf'),
  'NotoSansTamil-VF': require('@/assets/fonts/world/NotoSansTamil-VF.ttf'),
  'NotoSansTamil-Width-VF': require('@/assets/fonts/world/NotoSansTamil-Width-VF.ttf'),
  'NotoSerifSinhala-VF': require('@/assets/fonts/world/NotoSerifSinhala-VF.ttf'),
  'NotoSerifTamil-VF': require('@/assets/fonts/world/NotoSerifTamil-VF.ttf'),
  'Nunito-VF': require('@/assets/fonts/world/Nunito-VF.ttf'),
  'SpaceGrotesk-VF': require('@/assets/fonts/world/SpaceGrotesk-VF.ttf'),
  'Spectral-Italic': require('@/assets/fonts/world/Spectral-Italic.ttf'),
  'Spectral-Regular': require('@/assets/fonts/world/Spectral-Regular.ttf'),
  'Yaldevi-VF': require('@/assets/fonts/world/Yaldevi-VF.ttf'),
};
