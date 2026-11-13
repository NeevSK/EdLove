import { TimeProfileSchema } from '@repo/core/logic/registry/timeProfile';
import { describe, expect, it } from 'vitest';
import { WORKSPACE_FEATURES } from '../workspaceFeatureRegistry';

describe('Work room features and the time lens', () => {
  it('gives every feature a valid profile that agrees with its review/plan flags', () => {
    for (const f of WORKSPACE_FEATURES) {
      expect(TimeProfileSchema.safeParse(f.time).success, f.id).toBe(true);
      if (f.time.home === 'timeless') {
        expect(f.temporalCapabilities, f.id).toEqual({ hasReview: false, hasPlan: false });
        continue;
      }
      expect(f.time.modes.includes('review'), f.id).toBe(f.temporalCapabilities.hasReview);
      expect(f.time.modes.includes('plan'), f.id).toBe(f.temporalCapabilities.hasPlan);
    }
  });

  it('puts lesson plans and the timetable at home in the future, marks in the past', () => {
    const home = (id: string) => WORKSPACE_FEATURES.find((f) => f.id === id)?.time.home;
    expect(home('plan')).toBe('plan');
    expect(home('timetable')).toBe('plan');
    expect(home('gradebook')).toBe('review');
    expect(home('attendance')).toBe('current');
  });
});
