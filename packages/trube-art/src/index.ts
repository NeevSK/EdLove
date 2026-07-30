export * from '@repo/trube-art/core/motif';
export * from '@repo/trube-art/core/ornament';
export * from '@repo/trube-art/core/presets';
export * from '@repo/trube-art/core/render-plan';
export * from '@repo/trube-art/core/scores';
export * from '@repo/trube-art/core/soul/SoulLibrary';
export * from '@repo/trube-art/core/stage';
export * from '@repo/trube-art/core/surface';
export * from '@repo/trube-art/core/types';
export { CompatibilityRenderer } from '@repo/trube-art/native/renderers/CompatibilityRenderer';
// Native Components
export { TrubeCanvas } from '@repo/trube-art/native/TrubeCanvas';
export { TrubeMotif } from '@repo/trube-art/native/TrubeMotif';
export { TrubeOrnament } from '@repo/trube-art/native/TrubeOrnament';
export { TrubeStage } from '@repo/trube-art/native/TrubeStage';
export { TrubeView } from '@repo/trube-art/native/TrubeView';

/**
 * Initializes the Tr\u00FCbe-Art library and pre-warms the soul layer.
 * This should be called at the very beginning of the app lifecycle
 * to ensure zero-jank shader rendering.
 */
export function initializeTrubeArt() {
  const { soulLibrary } = require('./core/soul/SoulLibrary');
  soulLibrary.prewarm();
}

export { default as TrubeLabScreen } from '@repo/trube-art/screens/TrubeLabScreen';
