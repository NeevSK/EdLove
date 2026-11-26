/**
 * Companions: the person's own pets and friends, living on the world's floor. Nothing here is a
 * fixed list of animals. A companion is whatever the person says it is: a name, what kind it is
 * in their own words ("our tabby", "a parrot called Kiri"), an optional photo, a tone from the
 * world's palette, and how it likes to be (resting, wandering, perching up high). Any number can
 * be kept; one is out on the floor at a time, or none.
 *
 * Kept on the phone (no account needed), applied by the floor's companion layer.
 */

import { storage } from '@repo/core/lib/storage.adapter';
import { useSyncExternalStore } from 'react';

export type CompanionTone = 'lamp' | 'glow' | 'ornament' | 'ink';
export type CompanionWay = 'rest' | 'wander' | 'perch';

export interface Companion {
  id: string;
  name: string;
  /** In the person's own words. */
  kind: string;
  /** A photo on this phone (a file URI), drawn as the companion's face. */
  photo?: string;
  tone: CompanionTone;
  way: CompanionWay;
  addedAt: string;
}

export interface CompanionsState {
  companions: readonly Companion[];
  /** Who is out on the floor now, or null for nobody. */
  out: string | null;
}

const KEY = '@gurudevi/companions';
const EMPTY: CompanionsState = { companions: [], out: null };

let state: CompanionsState = EMPTY;
const listeners = new Set<() => void>();

function emit(next: CompanionsState) {
  state = next;
  try {
    storage.set(KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('[companions] could not save.', error);
  }
  for (const l of listeners) l();
}

function valid(c: unknown): c is Companion {
  if (typeof c !== 'object' || c === null) return false;
  const v = c as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.name === 'string' && typeof v.kind === 'string';
}

/** Read the saved companions once at start. */
export async function loadCompanions(): Promise<void> {
  try {
    const raw = await storage.getStringAsync(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<CompanionsState>;
    const companions = Array.isArray(parsed.companions) ? parsed.companions.filter(valid) : [];
    const out = companions.some((c) => c.id === parsed.out) ? (parsed.out as string) : null;
    state = { companions, out };
    for (const l of listeners) l();
  } catch (error) {
    console.warn('[companions] could not load.', error);
  }
}

export function addCompanion(input: Omit<Companion, 'id' | 'addedAt'>): Companion {
  const companion: Companion = {
    ...input,
    name: input.name.trim().slice(0, 40),
    kind: input.kind.trim().slice(0, 60),
    id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    addedAt: new Date().toISOString(),
  };
  // A first companion comes straight out onto the floor.
  emit({ companions: [...state.companions, companion], out: state.out ?? companion.id });
  return companion;
}

export function updateCompanion(
  id: string,
  patch: Partial<Omit<Companion, 'id' | 'addedAt'>>,
): void {
  emit({
    ...state,
    companions: state.companions.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  });
}

export function removeCompanion(id: string): void {
  const companions = state.companions.filter((c) => c.id !== id);
  emit({ companions, out: state.out === id ? (companions[0]?.id ?? null) : state.out });
}

export function letOut(id: string | null): void {
  emit({ ...state, out: id && state.companions.some((c) => c.id === id) ? id : null });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const get = () => state;

export function useCompanions(): CompanionsState {
  return useSyncExternalStore(subscribe, get, get);
}

/** The companion out on the floor, if any. */
export function useCompanionOut(): Companion | null {
  const s = useCompanions();
  return s.companions.find((c) => c.id === s.out) ?? null;
}
