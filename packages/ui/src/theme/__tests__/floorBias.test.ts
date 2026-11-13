import { describe, expect, it } from 'vitest';
import { worldFloorBias } from '../floorBias';
import { WORLD_IDS } from '../worlds';

describe('world floor bias', () => {
  it('reads each world’s character', () => {
    expect(worldFloorBias('wewa').densityShift).toBe(-1);
    expect(worldFloorBias('spark').densityShift).toBe(1);
    expect(worldFloorBias('classic').densityShift).toBe(0);
    expect(worldFloorBias('sanctuary').depthCues).toContain('light');
    expect(worldFloorBias('classic').depthCues).not.toContain('light');
  });

  it('gives every world a bias', () => {
    for (const id of WORLD_IDS) expect(worldFloorBias(id).depthCues?.length).toBeGreaterThan(0);
  });
});
