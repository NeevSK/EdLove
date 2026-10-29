import { isValidElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SuccessCheck } from '../components/Success';

const capabilities = vi.hoisted(() => ({ allowSubtleAnimation: false }));

vi.mock('@repo/ui/context/VisualCapabilities', () => ({
  useVisualCapabilities: () => capabilities,
}));

vi.mock('../theme/native/WorldContext', () => ({
  useWorld: () => ({ tokens: { sunken: '#123456', lampDeep: '#654321' } }),
}));

describe('SuccessCheck native style boundary', () => {
  it.each([false, true])('renders with subtle motion %s', (allowSubtleAnimation) => {
    capabilities.allowSubtleAnimation = allowSubtleAnimation;
    const callerStyle = { opacity: 0.75 };
    const element = SuccessCheck({ size: 64, style: callerStyle });

    expect(isValidElement(element)).toBe(true);
    expect(element.props.style).toEqual([
      { width: 64, height: 64 },
      expect.any(Object),
      callerStyle,
    ]);
  });
});
