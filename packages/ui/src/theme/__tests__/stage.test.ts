import { experienceOf } from '@repo/core/verger';
import { describe, expect, it } from 'vitest';
import { atLeast, STAGE_TIERS, stageNamed, stageOf, stageTierOf } from '../stage';

const budget = (capacityClass: 'high' | 'low' | 'unknown', fidelity: 'auto' | 'low' | 'high' = 'auto', safe = false) =>
  experienceOf({ levels: {}, capacityClass }, { fidelity, safeMode: safe });

describe('stage: verger decides, the stage only names it', () => {
  it('gives a capable phone the rich tier', () => {
    expect(stageTierOf(budget('high'))).toBe('rich');
  });

  it('gives a low phone the floor tier, alive but without a frame loop', () => {
    const stage = stageOf(budget('low'));
    expect(stage.tier).toBe('floor');
    expect(stage.fps).toBe(0);
    expect(stage.overlays).toBe(true);
  });

  it("follows the person's visual detail choice through verger", () => {
    expect(stageTierOf(budget('high', 'low'))).toBe('floor');
    expect(stageTierOf(budget('low', 'high'))).not.toBe('floor');
  });

  it('goes bare when motion is off (safe mode)', () => {
    const stage = stageOf(budget('high', 'auto', true));
    expect(stage.tier).toBe('bare');
    expect(stage.overlays).toBe(false);
    expect(stage.transition).toBe('none');
  });

  it('a cap only ever lowers the tier', () => {
    expect(stageOf(budget('high'), 'floor').tier).toBe('floor');
    expect(stageOf(budget('low'), 'rich').tier).toBe('floor');
  });

  it('costs fall as the tier falls', () => {
    const tiers = STAGE_TIERS.map(stageNamed);
    for (let i = 1; i < tiers.length; i++) {
      expect(tiers[i]!.fps).toBeLessThanOrEqual(tiers[i - 1]!.fps);
      expect(tiers[i]!.particles).toBeLessThanOrEqual(tiers[i - 1]!.particles);
    }
    expect(atLeast('rich', 'middle')).toBe(true);
    expect(atLeast('floor', 'middle')).toBe(false);
  });
});
