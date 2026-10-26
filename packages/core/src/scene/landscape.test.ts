import { describe, expect, it } from 'vitest';
import { landscapeColours, landscapeOf } from './landscape';
import { daylightAt, skyPaletteAt } from './sky';

describe('landscapeOf', () => {
  it('is seeded: the same room at the same size draws the same scene', () => {
    expect(landscapeOf('school', 390, 760)).toEqual(landscapeOf('school', 390, 760));
  });

  it('draws only finite numbers at phone and tablet sizes', () => {
    for (const [w, h] of [
      [320, 568],
      [390, 844],
      [1024, 768],
    ] as const) {
      const scene = landscapeOf('school', w, h);
      const paths = [
        ...scene.hills.map((hill) => hill.d),
        scene.shore,
        scene.shoreReflection,
        scene.lotusPads,
        ...scene.terraces,
        ...scene.bunds.map((b) => b.d),
        scene.stalks,
        ...scene.palms.flatMap((p) => [p.trunk, p.fronds, p.leaflets]),
      ];
      for (const d of paths) expect(d).not.toMatch(/NaN|Infinity/);
      expect(scene.horizonY).toBeLessThan(scene.waterBottom);
    }
  });

  it('keeps the phone scene light: no kumbuk under 600 wide, no rice stalks below rich', () => {
    expect(landscapeOf('school', 390, 760).kumbuk).toBeNull();
    expect(landscapeOf('school', 1024, 768).kumbuk).not.toBeNull();
    expect(landscapeOf('school', 390, 760, false).stalks).toBe('');
  });

  it('darkens the land at night', () => {
    const day = landscapeColours(
      skyPaletteAt(780, 'yala', 'clear', '#F6C27E'),
      daylightAt(780),
      '#F6C27E',
    );
    const night = landscapeColours(
      skyPaletteAt(1320, 'yala', 'clear', '#F6C27E'),
      daylightAt(1320),
      '#F6C27E',
    );
    expect(day.paddyBase).not.toBe(night.paddyBase);
  });
});
