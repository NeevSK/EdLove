import type { SoundCueSources } from './soundFeedback';

/**
 * The phone's sound files, rendered from the shared recipes in
 * packages/ui/src/sensory/cues.ts by scripts/sounds/build-cues.ts. The web
 * plays the same recipes live.
 */
export const SOUND_CUES: SoundCueSources = {
  success: require('../assets/sounds/success.wav'),
  'sync-restored': require('../assets/sounds/sync-restored.wav'),
  error: require('../assets/sounds/error.wav'),
  milestone: require('../assets/sounds/milestone.wav'),
  'breath-start': require('../assets/sounds/breath-start.wav'),
  'breath-end': require('../assets/sounds/breath-end.wav'),
};
