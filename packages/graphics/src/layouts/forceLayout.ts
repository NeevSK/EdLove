import type { KnowledgeTopology, LayoutResult, GraphNode, GraphLink } from '@repo/core';

// D3 force simulation  pure JS, no rendering, works in RN Hermes
import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
    forceCollide,
    type Simulation,
} from 'd3-force';

export interface ForceLayoutOptions {
    width: number;
    height: number;
    linkDistance?: number;
    chargeStrength?: number;
    collideRadius?: number;
    /**
     * Number of simulation ticks to run.
     * ON NATIVE: run to completion (300+) for static positions.
     * ON WEB: can be 0 to get a live simulation reference.
     */
    ticks?: number;
}

const DEFAULT_OPTIONS: Required<ForceLayoutOptions> = {
    width: 800,
    height: 800,
    linkDistance: 120,
    chargeStrength: -300,
    collideRadius: 40,
    ticks: 300,
};

/**
 * forceLayout  Runs a D3 force simulation to completion.
 *
 * Returns a LayoutResult with stable { x, y } for every node.
 * This is "pre-computed" physics: run once, get positions, render static SVG.
 *
 * Key design decision for native:
 *   - No per-frame JS loop. Simulation runs synchronously via ticks,
 *     then we extract all positions in one pass. Zero frame-budget cost.
 *
 * For web, if `ticks` is 0, the simulation is returned via `rawSimulation`
 * for live force animation in the browser.
 */
export function forceLayout(
    topology: KnowledgeTopology,
    options: Partial<ForceLayoutOptions> = {}
): LayoutResult & { rawSimulation?: Simulation<GraphNode, undefined> } {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Deep clone to avoid mutating the original data
    const nodes = topology.nodes.map((n) => ({ ...n }));
    const links = topology.links.map((l) => ({ ...l }));

    const simulation = forceSimulation<GraphNode>(nodes)
        .force(
            'link',
            forceLink<GraphNode, GraphLink>(links as GraphLink[])
                .id((d) => d.id)
                .distance(opts.linkDistance)
                .strength(0.5)
        )
        .force('charge', forceManyBody<GraphNode>().strength(opts.chargeStrength))
        .force('center', forceCenter<GraphNode>(opts.width / 2, opts.height / 2))
        .force('collide', forceCollide<GraphNode>().radius(opts.collideRadius).iterations(2))
        .stop();

    if (opts.ticks === 0) {
        // Web mode  return live simulation for real-time animation
        simulation.restart();
        return { positions: extractPositions(nodes), bounds: computeBounds(nodes, opts), rawSimulation: simulation as Simulation<GraphNode, undefined> };
    }

    // Native mode  pre-compute all ticks synchronously
    for (let i = 0; i < opts.ticks; i++) {
        simulation.tick();
    }

    return {
        positions: extractPositions(nodes),
        bounds: computeBounds(nodes, opts),
    };
}

function extractPositions(nodes: GraphNode[]): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();
    for (const node of nodes) {
        positions.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 });
    }
    return positions;
}

function computeBounds(
    nodes: GraphNode[],
    opts: Required<ForceLayoutOptions
): LayoutResult['bounds'] {
    if (nodes.length === 0) {
        return { width: opts.width, height: opts.height, minX: 0, minY: 0 };
    }
    const xs = nodes.map((n) => n.x ?? 0);
    const ys = nodes.map((n) => n.y ?? 0);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    return { width: maxX - minX, height: maxY - minY, minX, minY };
}
