import { describe, expect, it } from 'vitest';
import { systemTextAllowance, TEXT_GROWTH_CAP } from '../../../theme/native/style';

describe('text growth cap', () => {
  it("lets the phone's text size fill only the room left by the reading size", () => {
    expect(systemTextAllowance(1)).toBeCloseTo(TEXT_GROWTH_CAP);
    expect(systemTextAllowance(1.3) * 1.3).toBeCloseTo(TEXT_GROWTH_CAP);
  });

  it('never shrinks words below their own size', () => {
    expect(systemTextAllowance(3)).toBe(1);
  });
});
