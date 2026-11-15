import { describe, expect, it } from 'vitest';
import { floorFitOf, KIT_FLOOR_FIT, type KitPiece } from '../floorFit';

const pieces = Object.keys(KIT_FLOOR_FIT) as KitPiece[];

describe('kit floor fit', { tags: ['unit', 'a11y'] }, () => {
  it('every interactive piece reaches the platform touch minimum', () => {
    for (const p of pieces) {
      const fit = floorFitOf(p, 'android');
      if (fit.interactive) expect(fit.min.h, p).toBeGreaterThanOrEqual(48);
      const ios = floorFitOf(p, 'ios');
      if (ios.interactive) expect(ios.min.h, p).toBeGreaterThanOrEqual(44);
    }
  });

  it('preferred is never smaller than min', () => {
    for (const p of pieces) {
      const fit = KIT_FLOOR_FIT[p] as {
        min: { h: number; w?: number };
        preferred?: { h?: number; w?: number };
      };
      if (fit.preferred?.h !== undefined)
        expect(fit.preferred.h, p).toBeGreaterThanOrEqual(fit.min.h);
      if (fit.preferred?.w !== undefined && fit.min.w !== undefined)
        expect(fit.preferred.w, p).toBeGreaterThanOrEqual(fit.min.w);
    }
  });

  it('collections say where the reader is', () => {
    for (const p of ['list', 'rail', 'carousel'] as const) {
      expect(KIT_FLOOR_FIT[p].spoken).toContain('{total}');
    }
  });
});
