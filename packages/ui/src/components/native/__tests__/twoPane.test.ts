import { describe, expect, it } from 'vitest';
import { TWO_PANE_MIN, twoPaneOf } from '../Layout/TwoPane';

describe('twoPaneOf', () => {
  it('shows one at a time on a phone', () => {
    expect(twoPaneOf(411).split).toBe(false);
    expect(twoPaneOf(TWO_PANE_MIN - 1).split).toBe(false);
  });
  it('splits beside a rail on a tablet, the list held between 300 and 400', () => {
    expect(twoPaneOf(TWO_PANE_MIN)).toEqual({ split: true, listWidth: 300 });
    expect(twoPaneOf(1100).listWidth).toBe(396);
    expect(twoPaneOf(1600).listWidth).toBe(400);
  });
});
