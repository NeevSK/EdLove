import { experienceOf } from '@repo/core/governor';
import { useVergerSnapshot } from '@repo/verger-react';
import { useMemo } from 'react';
import { useFidelityOptional } from './FidelityProvider';
import { useSensoryPreferencesOptional } from './SensoryProvider';
import type { VisualCapabilities } from './types';
import { isVisualSafeModeEnabled } from './visualSafety';

/** Outside verger's provider nothing is known about the phone: no floor, only the user's settings. */
const UNGOVERNED = { levels: {}, capacityClass: 'unknown' } as const;

/**
 * What components may spend: verger's levels and the phone's class, read through Gurudevi's view
 * (`experienceOf`), with the user's own settings and the emergency safe mode.
 */
export function useVisualCapabilities(): VisualCapabilities {
  const { fidelityLevel } = useFidelityOptional();
  const sensoryPreferences = useSensoryPreferencesOptional();
  const snapshot = useVergerSnapshot();
  const levels = snapshot?.levels ?? UNGOVERNED.levels;
  const capacityClass = snapshot?.capacityClass ?? UNGOVERNED.capacityClass;

  return useMemo(
    () =>
      experienceOf(
        { levels, capacityClass },
        { fidelity: fidelityLevel, ...sensoryPreferences, safeMode: isVisualSafeModeEnabled() },
      ),
    [levels, capacityClass, fidelityLevel, sensoryPreferences],
  );
}
