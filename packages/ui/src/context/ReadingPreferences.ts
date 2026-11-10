/**
 * The person's reading settings (size, weight, tracking, line spacing), kept on the phone and
 * applied by the kit's `typeStyle` to every word. Load once at start; changes save at once.
 */

import { storage } from '@repo/core/lib/storage';
import { useSyncExternalStore } from 'react';
import {
  getReading,
  type Reading,
  STANDARD_READING,
  setReading,
  subscribeWorldFonts,
} from '../theme/native/style';

const READING_KEY = '@gurudevi/reading';

function parse(raw: string | null | undefined): Partial<Reading> | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<Reading>;
    return typeof v === 'object' && v !== null ? v : null;
  } catch {
    return null;
  }
}

/** Apply the saved settings; safe to call more than once. */
export async function loadReading(): Promise<void> {
  try {
    const saved = parse(await storage.getStringAsync(READING_KEY));
    if (saved) setReading(saved);
  } catch (error) {
    console.warn('[reading] could not load settings; using standard reading.', error);
  }
}

/** Change and save the reading settings. */
export function updateReading(next: Partial<Reading>): void {
  setReading(next);
  try {
    storage.set(READING_KEY, JSON.stringify(getReading()));
  } catch (error) {
    console.warn('[reading] could not save settings.', error);
  }
}

export function resetReading(): void {
  updateReading(STANDARD_READING);
}

/** The current reading settings, re-rendering when they change. */
export function useReading(): Reading {
  return useSyncExternalStore(subscribeWorldFonts, getReading, getReading);
}
