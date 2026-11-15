import { type GroundPolicy, groundPolicyOf } from '@repo/core/logic/workspace/groundPlan';
import { useMemo } from 'react';
import { useComfort } from './ComfortPreferences';
import { useVisualCapabilities } from './VisualCapabilities';

/**
 * The phone's ground policy: the person's Lively/Balanced/Calm (Comfort.ground, a Visual
 * setting) through the shared `groundPolicyOf`, with verger's quality able only to calm it.
 * Every phone screen and the room ground read this; nothing else decides loudness.
 */
export function useGroundPolicy(): GroundPolicy {
  const { ground } = useComfort();
  const { quality } = useVisualCapabilities();
  return useMemo(
    () => groundPolicyOf({ liveliness: ground, experience: { quality } }),
    [ground, quality],
  );
}
