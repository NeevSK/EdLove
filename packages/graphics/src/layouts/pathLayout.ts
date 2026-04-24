import type { KnowledgeTopology, LayoutResult, GraphNode } from '@repo/core';

export interface PathLayoutOptions {
    orchardWidth?: number;    // Total horizontal space for the path
    stepHeight?: number;      // Vertical distance between path steps
    /** Whether to zig-zag the path (true) or keep it linear (false) */
    zigzag?: boolean;
}

const DEFAULT_OPTIONS: Required<PathLayoutOptions> = {
    orchardWidth: 320,
    stepHeight: 120,
    zigzag: true,
};

/**
 * pathLayout  Sequential layout for the Dharma (Learning Path) perspective.
 *
 * Sorts nodes by `path.order`, then assigns { x, y } positions
 * along a zig-zag or linear spine. No physics needed.
 *
 * Returns simple incremental positions for a FlatList-based renderer.
 */
export function pathLayout(
    topology: KnowledgeTopology,
    options: Partial<PathLayoutOptions> = {}
): LayoutResult & { orderedNodes: GraphNode[] } {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const pathNodes = topology.nodes
        .filter((n: GraphNode) => n.path?.order !== undefined)
        .sort((a: GraphNode, b: GraphNode) => (a.path!.order) - (b.path!.order));

    const orphanNodes = topology.nodes.filter((n: GraphNode) => n.path?.order === undefined);

    const orderedNodes = [...pathNodes, ...orphanNodes];

    const positions = new Map<string, { x: number; y: number }>();
    const centerX = opts.orchardWidth / 2;
    const zigzagOffset = opts.orchardWidth * 0.25;

    orderedNodes.forEach((node, index) => {
        let x = centerX;
        if (opts.zigzag) {
            x = index % 2 === 0
                ? centerX - zigzagOffset
                : centerX + zigzagOffset;
        }
        const y = index * opts.stepHeight;
        positions.set(node.id, { x, y });
    });

    const totalHeight = orderedNodes.length * opts.stepHeight;

    return {
        positions,
        orderedNodes,
        bounds: {
            width: opts.orchardWidth,
            height: totalHeight,
            minX: 0,
            minY: 0,
        },
    };
}
