import type { DepthCue, WorldFloorBias } from '@repo/core/logic/floor';
import type { WorldDefinition, WorldId } from './types';
import { WORLDS } from './worlds';

/**
 * What a world asks of every floor: how roomy its rooms start, which depth
 * cues suit it, and its motion ceiling. A room follows this until the person
 * changes every room or just one (core logic/floor/settings).
 *
 * Read from the world's own character so a new world needs nothing extra:
 * slow, unhurried worlds (tempo 1.15 and above) start roomier; fast ones
 * (0.8 and below) start tighter; a world with a glow may light its lit piece.
 * A world that wants something else says so in WORLD_FLOOR_OVERRIDES.
 */
export const WORLD_FLOOR_OVERRIDES: Partial<Record<WorldId, Partial<WorldFloorBias>>> = {};

export function worldFloorBiasOf(world: WorldDefinition): WorldFloorBias {
  const { tempo, axis, settle } = world.motion;
  const densityShift: -1 | 0 | 1 = tempo >= 1.15 ? -1 : tempo <= 0.8 ? 1 : 0;
  const depthCues: DepthCue[] = ['overlap', 'scale'];
  if (world.style.primary.glow) depthCues.push('light');
  return {
    densityShift,
    depthCues,
    motion: axis === 'none' && settle === 'none' ? 'reduced' : 'full',
    ...WORLD_FLOOR_OVERRIDES[world.id],
  };
}

/** The floor bias for a world by id. */
export function worldFloorBias(id: WorldId): WorldFloorBias {
  return worldFloorBiasOf(WORLDS[id]);
}
