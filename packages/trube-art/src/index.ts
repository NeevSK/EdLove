export * from '@/core/motif';
export * from '@/core/ornament';
export * from '@/core/presets';
export * from '@/core/render-plan';
export * from '@/core/scores';
export * from '@/core/soul/SoulLibrary';
export * from '@/core/stage';
export * from '@/core/surface';
export * from '@/core/types';
export { CompatibilityRenderer } from '@/native/renderers/CompatibilityRenderer';
// Native Components
export { TrubeCanvas } from '@/native/TrubeCanvas';
export { TrubeMotif } from '@/native/TrubeMotif';
export { TrubeOrnament } from '@/native/TrubeOrnament';
export { TrubeStage } from '@/native/TrubeStage';
export { TrubeView } from '@/native/TrubeView';

/**
 * Initializes the Tr\u00FCbe-Art library and pre-warms the soul layer.
 * This should be called at the very beginning of the app lifecycle
 * to ensure zero-jank shader rendering.
 */
export function initializeTrubeArt() {
  const { soulLibrary } = require('./core/soul/SoulLibrary');
  soulLibrary.prewarm();
}

export { default as TrubeLabScreen } from '@/screens/TrubeLabScreen';
