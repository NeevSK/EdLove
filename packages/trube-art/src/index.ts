export * from './core/types';
export * from './core/presets';
export * from './core/scores';
export * from './core/surface';
export * from './core/render-plan';
export * from './core/stage';
export * from './core/ornament';
export * from './core/motif';
export * from './core/soul/SoulLibrary';

/**
 * Initializes the Trübe-Art library and pre-warms the soul layer.
 * This should be called at the very beginning of the app lifecycle
 * to ensure zero-jank shader rendering.
 */
export function initializeTrubeArt() {
  const { soulLibrary } = require('./core/soul/SoulLibrary');
  soulLibrary.prewarm();
}
