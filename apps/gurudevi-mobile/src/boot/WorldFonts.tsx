/**
 * Loads the faces the worlds are written in, and tells the world layer.
 *
 * - Latin (Newsreader for voice, Inter for working text) loads at start:
 *   six small files, about 1.4 MB, in the background after first paint.
 * - Sinhala and Tamil load only when that language is chosen, so a phone
 *   reading in English never holds them in memory.
 *
 * Deep imports keep the bundle to these weights only; importing a package's
 * index would bundle every weight it ships.
 *
 * Until a face arrives (or if loading fails) components use the platform
 * serif and system sans, so nothing waits on fonts.
 */

import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Newsreader_400Regular } from '@expo-google-fonts/newsreader/400Regular';
import { Newsreader_400Regular_Italic } from '@expo-google-fonts/newsreader/400Regular_Italic';
import { Newsreader_500Medium } from '@expo-google-fonts/newsreader/500Medium';
import { useEnvironment } from '@repo/ui/context';
import { registerWorldFonts } from '@repo/ui/world/native';
import * as Font from 'expo-font';
import { useEffect } from 'react';

const LATIN = {
  'Newsreader-Regular': Newsreader_400Regular,
  'Newsreader-Italic': Newsreader_400Regular_Italic,
  'Newsreader-Medium': Newsreader_500Medium,
  'Inter-Regular': Inter_400Regular,
  'Inter-Medium': Inter_500Medium,
  'Inter-SemiBold': Inter_600SemiBold,
} as const;

async function loadSinhala() {
  const [{ NotoSerifSinhala_400Regular }, { NotoSansSinhala_400Regular }] = await Promise.all([
    import('@expo-google-fonts/noto-serif-sinhala/400Regular'),
    import('@expo-google-fonts/noto-sans-sinhala/400Regular'),
  ]);
  await Font.loadAsync({
    'NotoSerifSinhala-Regular': NotoSerifSinhala_400Regular,
    'NotoSansSinhala-Regular': NotoSansSinhala_400Regular,
  });
  registerWorldFonts({
    si: { serif: 'NotoSerifSinhala-Regular', sans: 'NotoSansSinhala-Regular' },
  });
}

async function loadTamil() {
  const [{ NotoSerifTamil_400Regular }, { NotoSansTamil_400Regular }] = await Promise.all([
    import('@expo-google-fonts/noto-serif-tamil/400Regular'),
    import('@expo-google-fonts/noto-sans-tamil/400Regular'),
  ]);
  await Font.loadAsync({
    'NotoSerifTamil-Regular': NotoSerifTamil_400Regular,
    'NotoSansTamil-Regular': NotoSansTamil_400Regular,
  });
  registerWorldFonts({ ta: { serif: 'NotoSerifTamil-Regular', sans: 'NotoSansTamil-Regular' } });
}

let latinStarted = false;
const scriptStarted = { si: false, ta: false };

export function WorldFonts() {
  const { language } = useEnvironment();

  useEffect(() => {
    if (latinStarted) return;
    latinStarted = true;
    Font.loadAsync(LATIN)
      .then(() =>
        registerWorldFonts({
          serif: {
            regular: 'Newsreader-Regular',
            italic: 'Newsreader-Italic',
            medium: 'Newsreader-Medium',
          },
          sans: {
            regular: 'Inter-Regular',
            medium: 'Inter-Medium',
            semibold: 'Inter-SemiBold',
            bold: 'Inter-SemiBold',
          },
        }),
      )
      .catch((error: unknown) => {
        latinStarted = false;
        console.warn('[world-fonts] Latin faces unavailable; using system fonts.', error);
      });
  }, []);

  useEffect(() => {
    if (language !== 'si' && language !== 'ta') return;
    if (scriptStarted[language]) return;
    scriptStarted[language] = true;
    (language === 'si' ? loadSinhala() : loadTamil()).catch((error: unknown) => {
      scriptStarted[language] = false;
      console.warn(`[world-fonts] ${language} faces unavailable; using system fonts.`, error);
    });
  }, [language]);

  return null;
}
