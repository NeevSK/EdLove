import { useFidelityOptional } from './FidelityProvider';
import { useRealityOptional } from './RealityProvider';
import { useSensoryPreferencesOptional } from './SensoryProvider';
import type { VisualCapabilities } from './types';
import { resolveVisualCapabilities } from './visualPolicy';
import { applyVisualSafeMode } from './visualSafety';
import { useMemo } from 'react';

export function useVisualCapabilities(): VisualCapabilities {
  const { reality } = useRealityOptional();
  const { fidelityLevel } = useFidelityOptional();
  const sensoryPreferences = useSensoryPreferencesOptional();

  return useMemo(
    () => applyVisualSafeMode(resolveVisualCapabilities(reality, fidelityLevel, sensoryPreferences)),
    [reality, fidelityLevel, sensoryPreferences],
  );
}
