import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useBrowserVisualBudget: vi.fn(),
}));

vi.mock('../../../lib/runtime/useBrowserVisualBudget', () => ({
  useBrowserVisualBudget: mocks.useBrowserVisualBudget,
}));

import { FloorAtmosphere } from '../../../app/(sanctuary)/components/FloorAtmosphere';

const balancedBudget = {
  quality: 'balanced' as const,
  allowAnimation: true,
  allowBlur: false,
  maxCanvasPixels: 1_500_000,
  maxDevicePixelRatio: 1,
  particleCount: 12,
  minFrameIntervalMs: 50,
};

describe('FloorAtmosphere runtime budget', () => {
  let frameCallbacks: FrameRequestCallback[];
  let requestFrame: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    frameCallbacks = [];
    requestFrame = vi.fn((callback: FrameRequestCallback) => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });
    vi.stubGlobal('requestAnimationFrame', requestFrame);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    mocks.useBrowserVisualBudget.mockReturnValue(balancedBudget);

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does not start an animation loop when a 2D canvas context is unavailable', () => {
    const { unmount } = render(<FloorAtmosphere kind="celestial-embers" />);
    expect(requestFrame).not.toHaveBeenCalled();

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not start the particle loop when animation is disabled by the budget', () => {
    mocks.useBrowserVisualBudget.mockReturnValue({
      ...balancedBudget,
      allowAnimation: false,
    });

    render(<FloorAtmosphere kind="celestial-embers" />);

    expect(requestFrame).not.toHaveBeenCalled();
  });
});
