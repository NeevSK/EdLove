'use client';

import type { FidelityPreference } from '@repo/core/verger';
import { useSyncExternalStore } from 'react';

/**
 * The user's visual-detail choice on the web (R12), as `fidelity` on the phone: `auto` lets the
 * device and verger decide; `low` stills ambient effects and steps the rest down; `high` lifts
 * the device-class ceilings (verger still lowers under real stress). Kept in this browser's
 * storage, like the other appearance settings; unreadable storage reads as `auto`.
 */
export const WEB_FIDELITY_KEY = 'gurudevi_verger_fidelity';
const CHANGED = 'gurudevi:fidelity';
const CHOICES: readonly FidelityPreference[] = ['auto', 'low', 'high'];

/** A choice storage refused to keep: it still holds for this page. */
let unsaved: FidelityPreference | null = null;

const isFidelity = (value: string | null): value is FidelityPreference =>
  value !== null && (CHOICES as readonly string[]).includes(value);

export function readWebFidelity(): FidelityPreference {
  if (typeof window === 'undefined') return 'auto';
  if (unsaved !== null) return unsaved;
  try {
    const stored = window.localStorage.getItem(WEB_FIDELITY_KEY);
    return isFidelity(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

/** Saves the choice and tells this page; other tabs hear it through the `storage` event. */
export function writeWebFidelity(fidelity: FidelityPreference): void {
  try {
    window.localStorage.setItem(WEB_FIDELITY_KEY, fidelity);
    unsaved = null;
  } catch (error) {
    // The choice still applies to this page; it is not remembered.
    unsaved = fidelity;
    console.warn('[verger] fidelity not saved', error);
  }
  window.dispatchEvent(new Event(CHANGED));
}

const subscribe = (listener: () => void) => {
  window.addEventListener(CHANGED, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(CHANGED, listener);
    window.removeEventListener('storage', listener);
  };
};

/** The saved choice, live; `auto` on the server and while hydrating. */
export function useWebFidelity(): FidelityPreference {
  return useSyncExternalStore(subscribe, readWebFidelity, () => 'auto');
}
