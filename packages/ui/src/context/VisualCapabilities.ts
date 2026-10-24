import { experienceOf } from '@repo/core/governor';
import { useVergerSnapshot } from '@repo/verger-react';
import { useMemo } from 'react';
import { useFidelityOptional } from './FidelityProvider';
import { useRealityOptional } from './RealityProvider';
import { useSensoryPreferencesOptional } from './SensoryProvider';
import type { VisualCapabilities } from './types';
import { resolveVisualCapabilities } from './visualPolicy';
import { applyVisualSafeMode, isVisualSafeModeEnabled } from './visualSafety';

/**
 * What components may spend. Inside verger's provider, verger decides (its levels, read through
 * Gurudevi's view, with the user's own settings); the drift test lists every way that differs
 * from the old governor and why. Outside it (tests, surfaces without verger) the old governor
 * still answers, until it is removed.
 */
export function useVisualCapabilities(): VisualCapabilities {
  const { reality } = useRealityOptional();
  const { fidelityLevel } = useFidelityOptional();
  const sensoryPreferences = useSensoryPreferencesOptional();
  const snapshot = useVergerSnapshot();
  const levels = snapshot?.levels;
  const capacityClass = snapshot?.capacityClass;

  return useMemo(() => {
    const safeMode = isVisualSafeModeEnabled();
    if (levels && capacityClass)
      return experienceOf(
        { levels, capacityClass },
        {
          fidelity: fidelityLevel,
          ...sensoryPreferences,
          safeMode,
        },
      );
    return applyVisualSafeMode(
      resolveVisualCapabilities(reality, fidelityLevel, sensoryPreferences),
    );
  }, [levels, capacityClass, reality, fidelityLevel, sensoryPreferences]);
}
