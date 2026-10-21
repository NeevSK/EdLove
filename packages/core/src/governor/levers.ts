import type { LeverSpec, LeverTarget, VisualImpact } from './types';

const IMPACT_RANK: Record<VisualImpact, number> = { low: 0, medium: 1, high: 2 };

/**
 * Picks the lever to lower next (Unity Adaptive Performance's order): levers aimed at the
 * current bottleneck first, then the least visible change, then the lever lowered least so
 * far, then a stable id order so the choice is deterministic.
 */
export function chooseLeverToLower(
  levers: readonly LeverSpec[],
  levels: Readonly<Record<string, number>>,
  bottleneck: readonly LeverTarget[],
  strict = false,
): LeverSpec | null {
  // Strict: only levers that relieve the bottleneck (a workload is never lowered for a
  // resource it does not spend). Non-strict ordering is kept for callers that want a fallback.
  const candidates = levers.filter(
    (lever) => (levels[lever.id] ?? 0) < lever.maxLevel && (!strict || bottleneck.includes(lever.target)),
  );
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) => {
    const aTargets = bottleneck.includes(a.target) ? 0 : 1;
    const bTargets = bottleneck.includes(b.target) ? 0 : 1;
    if (aTargets !== bTargets) return aTargets - bTargets;
    const impact = IMPACT_RANK[a.visualImpact] - IMPACT_RANK[b.visualImpact];
    if (impact !== 0) return impact;
    const progress = (levels[a.id] ?? 0) / a.maxLevel - (levels[b.id] ?? 0) / b.maxLevel;
    if (progress !== 0) return progress;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return sorted[0] ?? null;
}

export function validateLevers(levers: readonly LeverSpec[]): void {
  const seen = new Set<string>();
  for (const lever of levers) {
    if (seen.has(lever.id)) throw new Error(`Duplicate governor lever "${lever.id}"`);
    seen.add(lever.id);
    if (!Number.isInteger(lever.maxLevel) || lever.maxLevel < 1) {
      throw new Error(`Lever "${lever.id}" needs an integer maxLevel of at least 1`);
    }
    if (lever.levels.length !== lever.maxLevel + 1) {
      throw new Error(`Lever "${lever.id}" must describe ${lever.maxLevel + 1} levels`);
    }
  }
}

/**
 * Gurudevi's levers. Consumers own what each level means; the descriptions are the contract.
 * Adding a lever never changes another lever's behaviour, only the order levers are lowered in.
 */
export const GURUDEVI_LEVERS: readonly LeverSpec[] = [
  {
    id: 'refresh-rate',
    maxLevel: 1,
    visualImpact: 'medium',
    target: 'gpu',
    ambient: false,
    motion: false,
    levels: ['the display maximum', 'capped (config refreshCapHz)'],
  },
  {
    // The last UI-thread containment step: Reanimated decides reduced motion when an animation
    // starts, so this stops new and restarted animations app-wide, registered or not. It does
    // not stop loops already running, nor CSS animations (Reanimated 4.7.1).
    id: 'global-motion',
    maxLevel: 1,
    visualImpact: 'high',
    target: 'gpu',
    ambient: false,
    motion: true,
    levels: ['animations run', 'reduced motion forced for all Reanimated animations'],
    closedLoopOnly: true,
  },
  {
    id: 'ambient-motion',
    maxLevel: 2,
    visualImpact: 'low',
    target: 'gpu',
    ambient: true,
    motion: true,
    levels: ['full motion', 'paced at half the refresh rate', 'still'],
  },
  {
    id: 'loading-shimmer',
    maxLevel: 1,
    visualImpact: 'low',
    target: 'gpu',
    ambient: true,
    motion: true,
    levels: ['animated shimmer', 'static placeholder'],
  },
  {
    id: 'particles',
    maxLevel: 2,
    visualImpact: 'low',
    target: 'gpu',
    ambient: true,
    motion: true,
    levels: ['full count', 'half count', 'none'],
  },
  {
    id: 'blur',
    maxLevel: 2,
    visualImpact: 'medium',
    target: 'gpu',
    ambient: false,
    motion: false,
    levels: ['full radius', 'reduced radius', 'flat tint'],
  },
  {
    id: 'glass-material',
    maxLevel: 2,
    visualImpact: 'medium',
    target: 'gpu',
    ambient: false,
    motion: false,
    levels: ['refraction', 'blur only', 'flat fallback colour'],
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
    ambient: false,
    motion: false,
    levels: ['prefetch next screens', 'prefetch on idle only', 'no prefetch'],
  },
];
