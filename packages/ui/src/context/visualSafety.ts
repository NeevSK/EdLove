import type { VisualCapabilities } from './types';

declare global {
  // The native shell or a remote-config bridge may set this emergency override.
  var __GURUDEVI_VISUAL_SAFE_MODE__: boolean | undefined;
}

export function isVisualSafeModeEnabled(): boolean {
  return (
    globalThis.__GURUDEVI_VISUAL_SAFE_MODE__ === true ||
    process.env.EXPO_PUBLIC_GURUDEVI_VISUAL_SAFE_MODE === 'true'
  );
}

export function applyVisualSafeMode(capabilities: VisualCapabilities): VisualCapabilities {
  if (!isVisualSafeModeEnabled()) return capabilities;

  return {
    ...capabilities,
    quality: 'essential',
    allowAmbientEffects: false,
    allowBlur: false,
    allowRichAnimation: false,
    allowSubtleAnimation: false,
    imageCachePolicy: 'disk',
    imageDecodeFormat: 'rgb',
    shouldPrefetchAssets: false,
    maxCelebrationParticles: 0,
    experience: {
      ...capabilities.experience,
      motion: 'off',
      visualEffects: 'essential',
      haptics: 'essential',
      sound: 'off',
      celebration: 'essential',
      maxParticles: 0,
      maxConcurrentSounds: 0,
      allowAssetPrefetch: false,
    },
  };
}
