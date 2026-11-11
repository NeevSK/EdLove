/**
 * The person's comfort: how big the things they touch are, whether the world keeps its ornaments,
 * whether contrast is always raised, and which hand they type numbers with. Kept on the phone and
 * read by the world (sizes, ornaments, contrast) and the keypad (hand). Presets set text and
 * comfort together for the people the app serves: older teachers, young learners, everyone else.
 */

import { storage } from '@repo/core/lib/storage';
import { useSyncExternalStore } from 'react';
import type { ComfortSize } from '../theme/types';
import { getReading, type Reading } from '../theme/native/style';
import { updateReading } from './ReadingPreferences';

export interface Comfort {
  size: ComfortSize;
  simple: boolean;
  /** `system` follows the phone's setting; `more` always raises contrast. */
  contrast: 'system' | 'more';
  /** The side a keypad docks to when the phone is on its side. */
  hand: 'right' | 'left';
  /** Outdoors in bright light: strongest inks, light palette, plain floor. A quick switch, not a preset. */
  sunlight: boolean;
}

export const STANDARD_COMFORT: Comfort = {
  size: 'standard',
  simple: false,
  contrast: 'system',
  hand: 'right',
  sunlight: false,
};

export type ComfortPresetId = 'clear' | 'standard' | 'young' | 'compact';

export interface ComfortPreset {
  id: ComfortPresetId;
  label: string;
  /** Who it is for, in a few words. */
  hint: string;
  comfort: Omit<Comfort, 'hand' | 'sunlight'>;
  reading: Reading;
}

/** One tap sets text and controls together; each part can still be tuned after. */
export const COMFORT_PRESETS: readonly ComfortPreset[] = [
  {
    id: 'clear',
    label: 'Large and clear',
    hint: 'Bigger words and buttons, a plain look, strong contrast',
    comfort: { size: 'large', simple: true, contrast: 'more' },
    reading: { scale: 1.3, weight: 50, tracking: 0.02, lines: 1.2 },
  },
  {
    id: 'standard',
    label: 'Standard',
    hint: 'As each world was designed',
    comfort: { size: 'standard', simple: false, contrast: 'system' },
    reading: { scale: 1, weight: 0, tracking: 0, lines: 1 },
  },
  {
    id: 'young',
    label: 'Young learner',
    hint: 'Big, friendly targets, the world in full',
    comfort: { size: 'large', simple: false, contrast: 'system' },
    reading: { scale: 1.15, weight: 25, tracking: 0.02, lines: 1.15 },
  },
  {
    id: 'compact',
    label: 'Compact',
    hint: 'More on one screen, for busy days',
    comfort: { size: 'compact', simple: false, contrast: 'system' },
    reading: { scale: 0.95, weight: 0, tracking: 0, lines: 1 },
  },
];

const KEY = '@gurudevi/comfort';
/** Whose comfort this is: on a shared phone each account keeps its own. */
let owner: string | null = null;
const keyOf = () => (owner ? `${KEY}:${owner}` : KEY);
let comfort: Comfort = STANDARD_COMFORT;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getComfort(): Comfort {
  return comfort;
}

function sanitize(v: Partial<Comfort>, base: Comfort): Comfort {
  return {
    size: v.size === 'compact' || v.size === 'large' || v.size === 'standard' ? v.size : base.size,
    simple: typeof v.simple === 'boolean' ? v.simple : base.simple,
    contrast: v.contrast === 'more' || v.contrast === 'system' ? v.contrast : base.contrast,
    hand: v.hand === 'left' || v.hand === 'right' ? v.hand : base.hand,
    sunlight: typeof v.sunlight === 'boolean' ? v.sunlight : base.sunlight,
  };
}

/** Apply the saved comfort; safe to call more than once. */
export async function loadComfort(account?: string | null): Promise<void> {
  if (account !== undefined) owner = account;
  try {
    // An account without its own comfort yet starts from what the phone already shows.
    const raw =
      (await storage.getStringAsync(keyOf())) ?? (owner ? await storage.getStringAsync(KEY) : null);
    if (!raw) {
      // Someone new on a shared phone does not inherit the last person's comfort.
      if (account !== undefined && comfort !== STANDARD_COMFORT) {
        comfort = STANDARD_COMFORT;
        emit();
      }
      return;
    }
    const parsed = JSON.parse(raw) as Partial<Comfort>;
    if (parsed && typeof parsed === 'object') {
      comfort = sanitize(parsed, STANDARD_COMFORT);
      emit();
    }
  } catch (error) {
    console.warn('[comfort] could not load; using standard.', error);
  }
}

/** Change and save the comfort settings. */
export function updateComfort(next: Partial<Comfort>): void {
  const merged = sanitize(next, comfort);
  if (JSON.stringify(merged) === JSON.stringify(comfort)) return;
  comfort = merged;
  emit();
  try {
    storage.set(keyOf(), JSON.stringify(comfort));
  } catch (error) {
    console.warn('[comfort] could not save.', error);
  }
}

/** Set a preset: comfort and reading together (the hand stays the person's). */
export function applyComfortPreset(id: ComfortPresetId): void {
  const preset = COMFORT_PRESETS.find((p) => p.id === id);
  if (!preset) return;
  updateComfort(preset.comfort);
  updateReading(preset.reading);
}

/** The preset the current settings match exactly, if any. */
export function matchingPreset(
  c: Comfort = comfort,
  r: Reading = getReading(),
): ComfortPresetId | null {
  const same = (a: Reading, b: Reading) =>
    Math.abs(a.scale - b.scale) < 0.001 &&
    a.weight === b.weight &&
    Math.abs(a.tracking - b.tracking) < 0.001 &&
    Math.abs(a.lines - b.lines) < 0.001;
  const hit = COMFORT_PRESETS.find(
    (p) =>
      p.comfort.size === c.size &&
      p.comfort.simple === c.simple &&
      p.comfort.contrast === c.contrast &&
      same(p.reading, r),
  );
  return hit?.id ?? null;
}

export function useComfort(): Comfort {
  return useSyncExternalStore(subscribe, getComfort, getComfort);
}
