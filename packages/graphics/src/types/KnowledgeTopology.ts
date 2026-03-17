import type { GraphNode, PerspectiveId } from './GraphNode';
import type { GraphLink } from './GraphLink';

/**
 * KnowledgeTopology — The complete data envelope for any visualization.
 *
 * This is what `@repo/library` API returns and what every layout
 * algorithm in `@repo/graphics` consumes.
 */
export interface KnowledgeTopology {
    nodes: GraphNode[];
    links: GraphLink[];

    // Explicitly declared supported perspectives (from API metadata).
    // If absent, `algorithms/perspective.ts` infers from node fields.
    supportedPerspectives?: PerspectiveId[];

    // Optional context for sub-context resolution (zooming into a region)
    context?: {
        focusRegion?: string;
        zoomLevel?: number;
        title?: string;
    };
}

/**
 * LayoutResult — The output of any layout algorithm.
 * Maps node IDs to their computed { x, y } positions.
 */
export interface LayoutResult {
    positions: Map<string, { x: number; y: number }>;
    bounds: { width: number; height: number; minX: number; minY: number };
}
