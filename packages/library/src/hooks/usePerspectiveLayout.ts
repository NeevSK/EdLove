import {
  forceLayout,
  geoLayout,
  type KnowledgeTopology,
  type LayoutResult,
  type PerspectiveId,
  pathLayout,
  treeLayout,
} from '@repo/graphics';
import { useReality } from '@repo/ui';
import { useMemo } from 'react';

interface LayoutOptions {
  width: number;
  height: number;
  perspective: PerspectiveId;
}

/**
 * usePerspectiveLayout React hook for @repo/graphics.
 *
 * Computes the optimal layout for a given topology and perspective.
 * Memoized and Reality-Aware: Adapts complexity to device capabilities.
 */
export function usePerspectiveLayout(
  topology: KnowledgeTopology | null,
  options: LayoutOptions,
): LayoutResult | null {
  const { width, height, perspective } = options;
  const { reality } = useReality();

  return useMemo(() => {
    if (!topology) return null;

    // Dynamic complexity adjustment based on device tier
    const isLowTier = reality.deviceTier === 'low';
    const forceTicks = isLowTier ? 80 : 300;

    switch (perspective) {
      case 'astro':
        return forceLayout(topology, { width, height, ticks: forceTicks });
      case 'vastu':
        return treeLayout(topology, undefined, { width, height });
      case 'dharma':
        return pathLayout(topology, { orchardWidth: width * 0.8 });
      case 'terra':
        return geoLayout(topology, width, height);
      case 'jyoti':
        return {
          positions: new Map(),
          bounds: { width, height, minX: 0, minY: 0 },
        };
      default:
        return forceLayout(topology, { width, height, ticks: isLowTier ? 50 : 100 });
    }
  }, [topology, perspective, width, height, reality.deviceTier]);
}
