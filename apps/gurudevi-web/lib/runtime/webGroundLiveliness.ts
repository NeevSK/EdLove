'use client';

import {
  DEFAULT_GROUND_LIVELINESS,
  type GroundLiveliness,
  isGroundLiveliness,
} from '@repo/core/logic/workspace/groundPlan';
import { useSyncExternalStore } from 'react';

/**
 * The person's "World behind screens" choice on the web, as `Comfort.ground` on the phone: how
 * lively the world's ground is behind every screen. The floor engine's `groundPolicyOf` turns it,
 * with verger, into how strong the ground is per kind of screen; no screen decides that itself.
 * Kept in this browser's storage beside Visual detail; unreadable storage reads as the default.
 */
export const WEB_GROUND_LIVELINESS_KEY = 'gurudevi_ground_liveliness';
const CHANGED = 'gurudevi:ground-liveliness';

/** A choice storage refused to keep: it still holds for this page. */
let unsaved: GroundLiveliness | null = null;

export function readWebGroundLiveliness(): GroundLiveliness {
  if (typeof window === 'undefined') return DEFAULT_GROUND_LIVELINESS;
  if (unsaved !== null) return unsaved;
  try {
    const stored = window.localStorage.getItem(WEB_GROUND_LIVELINESS_KEY);
    return isGroundLiveliness(stored) ? stored : DEFAULT_GROUND_LIVELINESS;
  } catch {
    return DEFAULT_GROUND_LIVELINESS;
  }
}

/** Saves the choice and tells this page; other tabs hear it through the `storage` event. */
export function writeWebGroundLiveliness(liveliness: GroundLiveliness): void {
  try {
    window.localStorage.setItem(WEB_GROUND_LIVELINESS_KEY, liveliness);
    unsaved = null;
  } catch {
    // The choice still applies to this page; it is not remembered.
    unsaved = liveliness;
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

/** The saved choice, live; the default on the server and while hydrating. */
export function useWebGroundLiveliness(): GroundLiveliness {
  return useSyncExternalStore(subscribe, readWebGroundLiveliness, () => DEFAULT_GROUND_LIVELINESS);
}
