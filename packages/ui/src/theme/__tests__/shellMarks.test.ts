import { describe, expect, it } from 'vitest';
import { fitRadius, roomMarkOf } from '../shellMarks';
import { WORLD_IDS, WORLDS } from '../worlds';

describe('shell marks', () => {
  it('gives every world a room mark', () => {
    for (const id of WORLD_IDS) {
      expect(['well', 'underline', 'glow', 'frame']).toContain(roomMarkOf(id));
    }
  });

  it('keeps pills as pills and never exceeds half the size', () => {
    expect(fitRadius(999, 32)).toBe(16);
    expect(fitRadius(12, 56)).toBeCloseTo(12 * (56 / 46));
    for (const id of WORLD_IDS) {
      const r = fitRadius(WORLDS[id].style.corner.control, 56);
      const corners = typeof r === 'number' ? [r] : r;
      for (const c of corners) expect(c).toBeLessThanOrEqual(28);
    }
  });

  it('keeps a shaped world shaped (Spark cuts two corners, Kele is a leaf)', () => {
    expect(fitRadius(WORLDS.spark.style.corner.chip, 32)).toEqual([
      0,
      expect.any(Number),
      0,
      expect.any(Number),
    ]);
    const kele = fitRadius(WORLDS.kele.style.corner.control, 56) as readonly number[];
    expect(kele[0]).toBeGreaterThan(kele[1] ?? 0);
  });
});
