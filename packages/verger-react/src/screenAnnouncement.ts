import { useEffect } from 'react';
import { useVerger } from './vergerStore';

/**
 * Tells the bound verger which screen the app shows (R3), whenever `name` changes: verger starts a
 * new regime for its frames loop, and verger-p5 recalls what it settled on there last time (R4).
 * `transitionMs`: work the app expects on arrival (a navigation animation), not judged as stress.
 * `null` announces nothing (no route yet).
 */
export function useScreenAnnouncement(name: string | null, transitionMs?: number): void {
  const verger = useVerger();
  useEffect(() => {
    if (!verger || name === null) return;
    // The shells' clock (`performance.now()`), so the event orders with every other event.
    verger.dispatch(
      transitionMs === undefined
        ? { type: 'screen', at: performance.now(), name }
        : { type: 'screen', at: performance.now(), name, transitionMs },
    );
  }, [verger, name, transitionMs]);
}
