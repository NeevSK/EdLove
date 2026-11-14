import { VERGER_BUILTIN_LEVERS } from '../builtins';
import type { LeverSpec } from '../types';

/**
 * A neutral host for verger's own tests. Its lever names are deliberately unlike any real app,
 * so a test that passes here cannot depend on an app's names.
 */
export const SAMPLE_LEVERS: readonly LeverSpec[] = [
  ...VERGER_BUILTIN_LEVERS,
  {
    id: 'sparkle',
    maxLevel: 2,
    visualImpact: 'low',
    target: 'gpu',
    ambient: true,
    motion: true,
    levels: ['on', 'slow', 'off'],
  },
  {
    id: 'frosting',
    maxLevel: 2,
    visualImpact: 'medium',
    target: 'gpu',
    ambient: false,
    motion: false,
    levels: ['full', 'light', 'none'],
    requires: [
      { capability: 'renderEffect', otherwiseLevel: 2 },
      { capability: 'runtimeShader', otherwiseLevel: 1 },
    ],
  },
  {
    id: 'rows-ahead',
    maxLevel: 2,
    visualImpact: 'low',
    target: 'cpu',
    ambient: false,
    motion: false,
    levels: ['many', 'few', 'none'],
  },
  {
    id: 'photo-cache',
    maxLevel: 2,
    visualImpact: 'low',
    target: 'memory',
    ambient: false,
    motion: false,
    levels: ['large', 'small', 'none'],
  },
  {
    id: 'warm-ahead',
    maxLevel: 2,
    visualImpact: 'low',
    target: 'energy',
    ambient: false,
    motion: false,
    levels: ['eager', 'idle only', 'off'],
    whenHidden: 2,
  },
];
