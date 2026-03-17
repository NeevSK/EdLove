import { useMemo } from 'react';
import { 
    forceLayout, 
    treeLayout, 
    pathLayout, 
    geoLayout,
    type KnowledgeTopology, 
    type LayoutResult, 
    type PerspectiveId 
} from '@repo/graphics';

interface LayoutOptions {
    width: number;
    height: number;
    perspective: PerspectiveId;
}

/**
 * usePerspectiveLayout — React hook for @repo/graphics.
 * 
 * Computes the optimal layout for a given topology and perspective.
 * Memoized to avoid re-running expensive D3 math on every render.
 */
export function usePerspectiveLayout(
    topology: KnowledgeTopology | null,
    options: LayoutOptions
): LayoutResult | null {
    const { width, height, perspective } = options;

    return useMemo(() => {
        if (!topology) return null;

        switch (perspective) {
            case 'astro':
                return forceLayout(topology, { width, height, ticks: 300 });
            case 'vastu':
                return treeLayout(topology, undefined, { width, height });
            case 'dharma':
                return pathLayout(topology, { orchardWidth: width * 0.8 });
            case 'terra':
                return geoLayout(topology, width, height);
            case 'jyoti':
                // Jyoti (charts) layout is handled by the charted lib or simple bar math
                return { 
                    positions: new Map(), 
                    bounds: { width, height, minX: 0, minY: 0 } 
                };
            default:
                return forceLayout(topology, { width, height, ticks: 100 });
        }
    }, [topology, perspective, width, height]);
}
