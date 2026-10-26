import type { Verger, VergerSnapshot } from '@repo/verger-core';
import { useSyncExternalStore } from 'react';

/**
 * The process's verger, bound by a platform shell (`VergerRoot` on React Native, `VergerBrowser`
 * on the web). One per process, like the platform under it, so hooks read it directly through
 * `useSyncExternalStore`: no Context, no provider in the tree.
 */
let bound: Verger | null = null;
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) listener();
};
const subscribeBinding = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const noSubscription = () => () => {};

/**
 * Binds `verger` during its shell's first render when nothing is bound yet, so the shell's
 * children read it on their very first render (as a Context value would be): no frame passes at
 * full quality on a phone whose floors say otherwise. Nothing can be subscribed yet, since the
 * shell is their ancestor, so no other component is updated during render. Returns whether it
 * bound; the shell still calls `bindVerger` in an effect, which owns the unbinding.
 */
export function bindVergerEarly(verger: Verger): boolean {
  if (bound !== null) return false;
  bound = verger;
  return true;
}

/** Makes `verger` the one hooks read; returns a function that unbinds it (only if still bound). */
export function bindVerger(verger: Verger): () => void {
  if (bound !== verger) {
    bound = verger;
    notify();
  }
  return () => {
    if (bound !== verger) return;
    bound = null;
    notify();
  };
}

/** Verger itself, for the lab and diagnostics (`configure`, `tune`, `outcomes`); null if unbound. */
export function useVerger(): Verger | null {
  return useSyncExternalStore(
    subscribeBinding,
    () => bound,
    () => null,
  );
}

/** The snapshot in force (verger's, or its floors while off); null when no verger is bound. */
export function useVergerSnapshot(): VergerSnapshot | null {
  const verger = useVerger();
  return useSyncExternalStore(
    verger?.subscribe ?? noSubscription,
    () => verger?.getSnapshot() ?? null,
    () => null,
  );
}

/** One lever's applied level (0 = full quality); its floor while verger is off; 0 if unbound. */
export function useLeverLevel(id: string): number {
  const verger = useVerger();
  return useSyncExternalStore(
    verger?.subscribe ?? noSubscription,
    () => verger?.getSnapshot()?.levels[id] ?? 0,
    () => 0,
  );
}
