import type { RuntimeDeviceTier, RuntimeNetworkQuality } from './runtimeConditions';

export interface RuntimeVisualSignals {
  deviceTier: RuntimeDeviceTier;
  networkQuality: RuntimeNetworkQuality;
  isDataSaverMode: boolean;
  isBatterySaverMode: boolean;
  isReducedMotionEnabled: boolean;
  isDocumentVisible: boolean;
}

export interface RuntimeVisualBudget {
  quality: 'essential' | 'balanced' | 'rich';
  allowAnimation: boolean;
  allowBlur: boolean;
  maxCanvasPixels: number;
  maxDevicePixelRatio: number;
  particleCount: number;
  minFrameIntervalMs: number;
}

export function resolveRuntimeVisualBudget(signals: RuntimeVisualSignals): RuntimeVisualBudget {
  const conservative =
    signals.deviceTier === 'low' || signals.isDataSaverMode || signals.isBatterySaverMode;

  if (!signals.isDocumentVisible) {
    return {
      quality: 'essential',
      allowAnimation: false,
      allowBlur: false,
      maxCanvasPixels: 0,
      maxDevicePixelRatio: 1,
      particleCount: 0,
      minFrameIntervalMs: 1000,
    };
  }

  if (conservative || signals.networkQuality === 'offline' || signals.networkQuality === 'poor') {
    return {
      quality: 'essential',
      allowAnimation: false,
      allowBlur: false,
      maxCanvasPixels: 0,
      maxDevicePixelRatio: 1,
      particleCount: 0,
      minFrameIntervalMs: 1000,
    };
  }

  if (signals.deviceTier === 'medium' || signals.networkQuality === 'fair') {
    return {
      quality: 'balanced',
      allowAnimation: !signals.isReducedMotionEnabled,
      allowBlur: false,
      maxCanvasPixels: 1_500_000,
      maxDevicePixelRatio: 1,
      particleCount: signals.isReducedMotionEnabled ? 0 : 12,
      minFrameIntervalMs: 50,
    };
  }

  return {
    quality: 'rich',
    allowAnimation: !signals.isReducedMotionEnabled,
    allowBlur: true,
    maxCanvasPixels: 3_000_000,
    maxDevicePixelRatio: 1.5,
    particleCount: signals.isReducedMotionEnabled ? 0 : 30,
    minFrameIntervalMs: 33,
  };
}
