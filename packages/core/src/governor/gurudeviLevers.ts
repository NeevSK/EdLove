import { type LeverSpec, VERGER_GLOBAL_MOTION, VERGER_REFRESH_CAP } from '@repo/verger-core';

/**
 * Gurudevi's levers. Consumers own what each level means; the descriptions are the contract.
 * Adding a lever never changes another lever's behaviour, only the order levers are lowered in.
 */
/** Gurudevi's own levers: the app-specific half of its manifest. */
export const GURUDEVI_APP_LEVERS: readonly LeverSpec[] = [
  {
    id: 'ambient-motion',
    maxLevel: 2,
    visualImpact: 'low',
    target: 'gpu',
    // Animated on the UI thread every frame.
    alsoRelieves: ['cpu'],
    ambient: true,
    motion: true,
    levels: ['full motion', 'paced at half the refresh rate', 'still'],
    whenBatteryLow: 1,
  },
  {
    id: 'loading-shimmer',
    maxLevel: 1,
    visualImpact: 'low',
    target: 'gpu',
    // Animated on the UI thread every frame.
    alsoRelieves: ['cpu'],
    ambient: true,
    motion: true,
    levels: ['animated shimmer', 'static placeholder'],
  },
  {
    id: 'particles',
    maxLevel: 2,
    visualImpact: 'low',
    target: 'gpu',
    // Animated on the UI thread every frame.
    alsoRelieves: ['cpu'],
    ambient: true,
    motion: true,
    levels: ['full count', 'half count', 'none'],
    whenBatteryLow: 1,
  },
  {
    id: 'blur',
    maxLevel: 2,
    visualImpact: 'medium',
    target: 'gpu',
    ambient: false,
    motion: false,
    levels: ['full radius', 'reduced radius', 'flat tint'],
    requires: [{ capability: 'renderEffect', otherwiseLevel: 2 }],
  },
  {
    id: 'glass-material',
    maxLevel: 2,
    visualImpact: 'medium',
    target: 'gpu',
    ambient: false,
    motion: false,
    levels: ['refraction', 'blur only', 'flat fallback colour'],
    requires: [
      { capability: 'renderEffect', otherwiseLevel: 2 },
      { capability: 'runtimeShader', otherwiseLevel: 1 },
    ],
  },
  {
    id: 'image-decode',
    maxLevel: 2,
    visualImpact: 'medium',
    target: 'memory',
    ambient: false,
    motion: false,
    levels: ['display resolution', 'three quarters', 'half resolution'],
  },
  {
    id: 'image-cache',
    maxLevel: 2,
    visualImpact: 'low',
    target: 'memory',
    ambient: false,
    motion: false,
    levels: ['full memory cache', 'half', 'quarter'],
  },
  {
    id: 'list-window',
    maxLevel: 2,
    visualImpact: 'medium',
    target: 'cpu',
    ambient: false,
    motion: false,
    levels: ['wide render window', 'default', 'narrow'],
  },
  {
    id: 'transitions',
    maxLevel: 2,
    visualImpact: 'high',
    target: 'cpu',
    ambient: false,
    motion: true,
    levels: ['full transitions', 'short fades', 'instant'],
  },
  {
    id: 'prefetch',
    maxLevel: 2,
    visualImpact: 'low',
    target: 'energy',
    alsoRelieves: ['network'],
    ambient: false,
    motion: false,
    levels: ['prefetch next screens', 'prefetch on idle only', 'no prefetch'],
    whenHidden: 2,
    // No metered limit: most of Gurudevi's users are always on metered mobile data, so metered is
    // home. What it should mean here is an open choice (stage-and-chairs.md).
    whenDataSaver: 2,
    whenBatteryLow: 1,
    whenOffline: 2,
  },
];

/** Every lever Gurudevi governs: its own, plus verger's built-in hardware and motion levers. */
export const GURUDEVI_LEVERS: readonly LeverSpec[] = [
  VERGER_REFRESH_CAP,
  VERGER_GLOBAL_MOTION,
  ...GURUDEVI_APP_LEVERS,
];
