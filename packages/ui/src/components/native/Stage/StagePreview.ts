/**
 * Pins for the stage, set by the on-phone World Showcase: a tier cap, an hour of the day and a
 * sky, so a person can see every world at every tier and time without waiting for them. Nothing
 * here is saved; the showcase clears it on leave and the stage goes back to verger and the clock.
 */

import { useSyncExternalStore } from 'react';
import type { SceneWeather } from '../../../theme/scene';
import type { StageTier } from '../../../theme/stage';

export interface StagePreview {
  /** Cap the tier below what verger allows; verger's tier when unset. */
  cap?: StageTier;
  /** A pinned minute after midnight; the clock's when unset. */
  minute?: number;
  /** A pinned sky; the forecast's when unset. */
  weather?: SceneWeather;
}

let current: StagePreview = {};
const listeners = new Set<() => void>();

export function getStagePreview(): StagePreview {
  return current;
}

/** Merge pins into the preview; pass `undefined` for a key to unpin it. */
export function setStagePreview(next: Partial<StagePreview>): void {
  const merged: StagePreview = { ...current, ...next };
  for (const key of Object.keys(merged) as (keyof StagePreview)[]) {
    if (merged[key] === undefined) delete merged[key];
  }
  current = merged;
  for (const l of listeners) l();
}

export function clearStagePreview(): void {
  if (Object.keys(current).length === 0) return;
  current = {};
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStagePreview(): StagePreview {
  return useSyncExternalStore(subscribe, getStagePreview, getStagePreview);
}
