import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useGurudeviView: vi.fn(),
}));

vi.mock('../../../lib/runtime/useGurudeviView', () => ({
  useGurudeviView: mocks.useGurudeviView,
}));

import { FloorAtmosphere } from '../../../app/(sanctuary)/components/FloorAtmosphere';

const viewAllowing = (allowAmbientEffects: boolean) => ({
  experience: { allowAmbientEffects },
  reading: { visibility: 'active' },
});

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
    mocks.useGurudeviView.mockReturnValue(viewAllowing(true));

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

  it('does not start the particle loop when verger disallows ambient effects', () => {
    mocks.useGurudeviView.mockReturnValue(viewAllowing(false));

    render(<FloorAtmosphere kind="celestial-embers" />);

    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
    expect(requestFrame).not.toHaveBeenCalled();
  });

  it('does not start the particle loop before verger is known', () => {
    mocks.useGurudeviView.mockReturnValue(null);

    render(<FloorAtmosphere kind="celestial-embers" />);

    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();
    expect(requestFrame).not.toHaveBeenCalled();
  });
});
