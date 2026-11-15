/**
 * Fonts on demand. Today every world's faces ship inside the app (about 8.4 MB, embedded at build
 * time), so nothing needs downloading. This is the path for faces that will not ship inside the
 * app (the "world" tier in scripts/fonts/world-fonts.json): fetch the file once from its
 * open-licence source, keep it on the phone, and register it so text switches to it.
 *
 * The person decides whether downloads may use mobile data; on Wi-Fi they always may.
 */

import { storage } from '@repo/core/lib/storage';
import { registerAvailableFonts } from '@repo/ui/theme/native';
import { Directory, File, Paths } from 'expo-file-system';
import * as Font from 'expo-font';
import * as Network from 'expo-network';
import { useSyncExternalStore } from 'react';

const CELLULAR_KEY = '@gurudevi/fonts_on_mobile_data';
const SAVED_KEY = '@gurudevi/downloaded_fonts';

/** A face that can be fetched: its name in the world's faces, and where its file lives. */
export interface FontSource {
  name: string;
  url: string;
}

let cellular = false;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export function useFontsOnMobileData(): [boolean, (v: boolean) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => cellular,
    () => cellular,
  );
  return [
    value,
    (v: boolean) => {
      cellular = v;
      storage.set(CELLULAR_KEY, v);
      for (const l of listeners) l();
    },
  ];
}

function fontsDir(): Directory {
  const dir = new Directory(Paths.document, 'fonts');
  if (!dir.exists) dir.create();
  return dir;
}

async function savedFaces(): Promise<Record<string, string>> {
  try {
    return JSON.parse((await storage.getStringAsync(SAVED_KEY)) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

/** At start: read the preference and register faces downloaded before. */
export async function restoreDownloadedFonts(): Promise<void> {
  try {
    cellular = (await storage.getStringAsync(CELLULAR_KEY)) === 'true';
    const saved = await savedFaces();
    const present = Object.entries(saved).filter(([, uri]) => new File(uri).exists);
    if (present.length === 0) return;
    await Font.loadAsync(Object.fromEntries(present));
    registerAvailableFonts(present.map(([name]) => name));
  } catch (error) {
    console.warn('[fonts] could not restore downloaded faces.', error);
  }
}

/** Whether downloading is allowed on the current connection. */
export async function mayDownload(): Promise<boolean> {
  const state = await Network.getNetworkStateAsync();
  if (!state.isConnected) return false;
  return state.type !== Network.NetworkStateType.CELLULAR || cellular;
}

/** Download, keep and register faces not yet on the phone. Returns the names now available. */
export async function downloadFonts(sources: readonly FontSource[]): Promise<string[]> {
  const loaded = new Set(Font.getLoadedFonts?.() ?? []);
  const wanted = sources.filter((s) => !loaded.has(s.name));
  if (wanted.length === 0 || !(await mayDownload())) return [];
  const saved = await savedFaces();
  const done: string[] = [];
  for (const source of wanted) {
    try {
      const file = await File.downloadFileAsync(
        source.url,
        new File(fontsDir(), `${source.name}.ttf`),
      );
      await Font.loadAsync({ [source.name]: file.uri });
      saved[source.name] = file.uri;
      done.push(source.name);
    } catch (error) {
      console.warn(`[fonts] ${source.name} could not be downloaded; the system face stays.`, error);
    }
  }
  storage.set(SAVED_KEY, JSON.stringify(saved));
  registerAvailableFonts(done);
  return done;
}
