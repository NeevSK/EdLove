'use client';

import { experienceOf, type GurudeviExperience, type WallpaperReading } from '@repo/core/verger';
import { useVergerSnapshot } from '@repo/verger-react';
import { useMemo } from 'react';

export interface GurudeviView {
  readonly experience: GurudeviExperience;
  readonly reading: WallpaperReading;
}

/**
 * What the page may spend, from verger (`experienceOf`, Gurudevi's view, as on the phone), or
 * null until verger is known: on the server and while hydrating, so nothing optional is
 * requested before the browser has been read. The web has no fidelity setting yet: `auto`.
 */
export function useGurudeviView(): GurudeviView | null {
  const snapshot = useVergerSnapshot();
  return useMemo(
    () =>
      snapshot === null
        ? null
        : { experience: experienceOf(snapshot, { fidelity: 'auto' }), reading: snapshot },
    [snapshot],
  );
}
