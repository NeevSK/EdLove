import { describe, expect, it } from 'vitest';
import { fraction, snap, valueAt } from '../range';

const r = { min: 0, max: 10, step: 2 };

describe('slider range maths', { tags: ['unit'] }, () => {
  it('clamps and snaps to the nearest step from min', () => {
    expect(snap(-3, r)).toBe(0);
    expect(snap(3.1, r)).toBe(4);
    expect(snap(2.9, r)).toBe(2);
    expect(snap(99, r)).toBe(10);
    expect(snap(5, { min: 1, max: 9, step: 2 })).toBe(5);
  });

  it('keeps the step’s precision (no 0.30000000000000004)', () => {
    expect(snap(0.3, { min: 0, max: 1, step: 0.1 })).toBe(0.3);
  });

  it('maps positions along the track to values and back', () => {
    expect(valueAt(0, 200, r)).toBe(0);
    expect(valueAt(100, 200, r)).toBe(6);
    expect(valueAt(260, 200, r)).toBe(10);
    expect(valueAt(50, 0, r)).toBe(0);
    expect(fraction(5, r)).toBe(0.5);
    expect(fraction(5, { min: 5, max: 5, step: 1 })).toBe(0);
  });
});
