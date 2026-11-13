import type { GurudeviExperience } from '@repo/core/verger/experience';
import type { DetailTier, FloorControls, MotionLevel } from './types';

const DETAIL: Record<GurudeviExperience['quality'], DetailTier> = {
  full: 'rich',
  reduced: 'balanced',
  essential: 'essential',
};

/**
 * The floor's dials from verger's view of this device, the same on web and
 * phone: verger's quality sets how much detail fits, and motion is only what
 * verger allows. With no reading yet, the floor starts balanced and calm.
 */
export function floorControlsOf(experience: GurudeviExperience | null | undefined): FloorControls {
  if (!experience) return { detail: 'balanced', motion: 'reduced' };
  const motion: MotionLevel = experience.allowRichAnimation
    ? 'full'
    : experience.allowSubtleAnimation
      ? 'reduced'
      : 'none';
  return { detail: DETAIL[experience.quality], motion };
}

/** The phone stage's tier (verger's reading as the phone shell keeps it). */
export type FloorStageTier = 'rich' | 'middle' | 'floor' | 'bare';

const STAGE: Record<FloorStageTier, FloorControls> = {
  rich: { detail: 'rich', motion: 'full' },
  middle: { detail: 'balanced', motion: 'reduced' },
  floor: { detail: 'essential', motion: 'reduced' },
  bare: { detail: 'essential', motion: 'none' },
};

/** The same dials read from the phone's stage tier. */
export function floorControlsOfStage(tier: FloorStageTier | string | undefined): FloorControls {
  return STAGE[tier as FloorStageTier] ?? { detail: 'balanced', motion: 'reduced' };
}
