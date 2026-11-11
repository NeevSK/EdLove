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
/** Whose reading this is: a shared phone keeps each account's own (a grandparent and a child). */
let owner: string | null = null;
const keyOf = () => (owner ? `${READING_KEY}:${owner}` : READING_KEY);

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
export async function loadReading(account?: string | null): Promise<void> {
  if (account !== undefined) owner = account;
  try {
    // An account without its own settings yet starts from what the phone already shows.
    const saved =
      parse(await storage.getStringAsync(keyOf())) ??
      (owner ? parse(await storage.getStringAsync(READING_KEY)) : null);
    if (saved) setReading(saved);
    // Someone new on a shared phone does not inherit the last person's reading.
    else if (account !== undefined) setReading(STANDARD_READING);
  } catch (error) {
    console.warn('[reading] could not load settings; using standard reading.', error);
  }
}

/** Change and save the reading settings. */
export function updateReading(next: Partial<Reading>): void {
  setReading(next);
  try {
    storage.set(keyOf(), JSON.stringify(getReading()));
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
