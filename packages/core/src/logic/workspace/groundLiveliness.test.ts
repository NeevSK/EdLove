import { describe, expect, it } from 'vitest';
import { GROUND_STAGE_DEFAULTS } from './groundPlan';
import {
  GROUND_LIVELINESS_DIALS,
  groundDialOf,
  groundVeilOf,
  isGroundLiveliness,
  MAX_GROUND_VEIL,
} from './groundLiveliness';

const rank = { full: 0, calm: 1 } as const;

describe('ground liveliness', () => {
  it('balanced is the planner default', () => {
    expect(groundDialOf()).toBe(GROUND_STAGE_DEFAULTS);
  });

  it('calm is never livelier than balanced, nor balanced than lively', () => {
    for (const stage of ['room', 'screen', 'focus'] as const) {
      const d = GROUND_LIVELINESS_DIALS;
      expect(rank[d.calm[stage]]).toBeGreaterThanOrEqual(rank[d.balanced[stage]]);
      expect(rank[d.balanced[stage]]).toBeGreaterThanOrEqual(rank[d.lively[stage]]);
      expect(groundVeilOf(stage, 'calm')).toBeGreaterThanOrEqual(groundVeilOf(stage, 'lively'));
    }
  });

  it('never hides the world completely', () => {
    expect(groundVeilOf('focus', 'calm', 0.9)).toBe(MAX_GROUND_VEIL);
    expect(isGroundLiveliness('calm')).toBe(true);
    expect(isGroundLiveliness('loud')).toBe(false);
  });
});
