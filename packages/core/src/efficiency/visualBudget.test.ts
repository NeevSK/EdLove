import { describe, expect, it } from 'vitest';
import { type RuntimeVisualSignals, resolveRuntimeVisualBudget } from './visualBudget';

const capable: RuntimeVisualSignals = {
  deviceTier: 'high',
  networkQuality: 'excellent',
  isDataSaverMode: false,
  isBatterySaverMode: false,
  isReducedMotionEnabled: false,
  isDocumentVisible: true,
};

describe('resolveRuntimeVisualBudget', () => {
  it('uses a bounded rich budget on capable devices', () => {
    expect(resolveRuntimeVisualBudget(capable)).toMatchObject({
      quality: 'rich',
      maxCanvasPixels: 3_000_000,
      maxDevicePixelRatio: 1.5,
      particleCount: 30,
    });
  });

  it('turns decorative rendering off for low memory, data saver, and hidden pages', () => {
    for (const signals of [
      { ...capable, deviceTier: 'low' as const },
      { ...capable, isDataSaverMode: true },
      { ...capable, isDocumentVisible: false },
      { ...capable, networkQuality: 'offline' as const },
    ]) {
      expect(resolveRuntimeVisualBudget(signals)).toMatchObject({
        allowAnimation: false,
        allowBlur: false,
        particleCount: 0,
        maxCanvasPixels: 0,
      });
    }
  });

  it('preserves a still visual budget when reduced motion is enabled', () => {
    expect(resolveRuntimeVisualBudget({ ...capable, isReducedMotionEnabled: true })).toMatchObject({
      quality: 'rich',
      allowAnimation: false,
      allowBlur: true,
      particleCount: 0,
    });
  });

  it('limits canvas work for balanced devices', () => {
    expect(resolveRuntimeVisualBudget({ ...capable, deviceTier: 'medium' })).toMatchObject({
      quality: 'balanced',
      maxCanvasPixels: 1_500_000,
      particleCount: 12,
      allowBlur: false,
    });
  });
});
