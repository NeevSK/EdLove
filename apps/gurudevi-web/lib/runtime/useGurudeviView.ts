'use client';

import { experienceOf, type GurudeviExperience, type WallpaperReading } from '@repo/core/verger';
import { useVergerSnapshot } from '@repo/verger-react';
import { useMemo } from 'react';
import { useWebFidelity } from './webFidelity';

export interface GurudeviView {
  readonly experience: GurudeviExperience;
  readonly reading: WallpaperReading;
}

/**
 * What the page may spend, from verger (`experienceOf`, Gurudevi's view, as on the phone), or
 * null until verger is known: on the server and while hydrating, so nothing optional is
 * requested before the browser has been read. The user's visual-detail setting applies here as
 * it does in verger (R12).
 */
export function useGurudeviView(): GurudeviView | null {
  const snapshot = useVergerSnapshot();
  const fidelity = useWebFidelity();
  return useMemo(
    () =>
      snapshot === null ? null : { experience: experienceOf(snapshot, { fidelity }), reading: snapshot },
    [snapshot, fidelity],
  );
}
