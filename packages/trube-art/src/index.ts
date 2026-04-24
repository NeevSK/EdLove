export * from './core/types';
export * from './core/presets';
export * from './core/scores';
export * from './core/surface';
export * from './core/render-plan';
export * from './core/stage';
export * from './core/ornament';
export * from './core/motif';
export * from './core/soul/SoulLibrary';

// Native Components
export { TrubeCanvas } from './native/TrubeCanvas';
export { TrubeOrnament } from './native/TrubeOrnament';
export { TrubeMotif } from './native/TrubeMotif';
export { TrubeStage } from './native/TrubeStage';
export { TrubeView } from './native/TrubeView';
export { CompatibilityRenderer } from './native/renderers/CompatibilityRenderer';

/**
 * Initializes the Tr\u00FCbe-Art library and pre-warms the soul layer.
 * This should be called at the very beginning of the app lifecycle
 * to ensure zero-jank shader rendering.
 */
export function initializeTrubeArt() {
  const { soulLibrary } = require('./core/soul/SoulLibrary');
  soulLibrary.prewarm();
}

export { default as TrubeLabScreen } from './screens/TrubeLabScreen';