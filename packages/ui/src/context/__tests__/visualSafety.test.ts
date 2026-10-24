import { experienceOf } from '@repo/core/governor';
import { isVisualSafeModeEnabled } from '../visualSafety';

/** A high phone with nothing lowered: everything the safe mode must take away. */
const capabilities = () =>
  experienceOf(
    { levels: {}, capacityClass: 'high' },
    { fidelity: 'auto', safeMode: isVisualSafeModeEnabled() },
  );

describe('visual safe mode', () => {
  afterEach(() => {
    globalThis.__GURUDEVI_VISUAL_SAFE_MODE__ = undefined;
    delete process.env.EXPO_PUBLIC_GURUDEVI_VISUAL_SAFE_MODE;
  });

  it('is off unless something turns it on', () => {
    expect(isVisualSafeModeEnabled()).toBe(false);
    expect(capabilities().allowBlur).toBe(true);
  });

  it('removes expensive layers without changing the device identity', () => {
    globalThis.__GURUDEVI_VISUAL_SAFE_MODE__ = true;
    const safe = capabilities();

    expect(safe.deviceTier).toBe('high');
    expect(safe.allowBlur).toBe(false);
    expect(safe.allowSubtleAnimation).toBe(false);
    expect(safe.imageCachePolicy).toBe('disk');
    expect(safe.maxCelebrationParticles).toBe(0);
  });

  it('also honors the deployment-level environment override', () => {
    process.env.EXPO_PUBLIC_GURUDEVI_VISUAL_SAFE_MODE = 'true';
    expect(capabilities().quality).toBe('essential');
  });
});
