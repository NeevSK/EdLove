/**
 * Tells the world layer which faces it can draw with.
 *
 * - Native: every world's faces are embedded at build time (expo-font plugin
 *   in app.json), so they are ready at first paint and nothing loads. A dev
 *   client built before a face was added simply lacks it, and text keeps the
 *   system face until the client is rebuilt.
 * - Web: only the faces of the active world and language load, so a reader
 *   never downloads the other ten worlds.
 *
 * Until a face is known to be there, components use the platform serif and
 * the system sans, so nothing waits on fonts or draws in the wrong face.
 */

import { useEnvironment } from '@repo/ui/context';
import { fontNamesOf } from '@repo/ui/world';
import { registerAvailableFonts } from '@repo/ui/world/native';
import * as Font from 'expo-font';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { WORLD_FONT_FILES } from './worldFontFiles';

// Test doubles of expo-font may not have it; then text keeps the system faces.
if (Platform.OS !== 'web' && typeof Font.getLoadedFonts === 'function') {
  registerAvailableFonts(Font.getLoadedFonts());
}

const started = new Set<string>();

export function WorldFonts() {
  const { worldId, language } = useEnvironment();

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const lang = language === 'si' || language === 'ta' ? language : 'en';
    const wanted = fontNamesOf(worldId, lang).filter(
      (name) => !started.has(name) && WORLD_FONT_FILES[name],
    );
    if (wanted.length === 0) return;
    for (const name of wanted) started.add(name);
    Font.loadAsync(
      Object.fromEntries(wanted.map((name) => [name, WORLD_FONT_FILES[name] as number])),
    )
      .then(() => registerAvailableFonts(wanted))
      .catch((error: unknown) => {
        for (const name of wanted) started.delete(name);
        console.warn('[world-fonts] faces unavailable; using system fonts.', error);
      });
  }, [worldId, language]);

  return null;
}
