/**
 * PerspectiveId — The distinct 4D-6D visualization modes supported by the platform.
 */
export type PerspectiveId = 'astro' | 'terra' | 'dharma' | 'vastu' | 'jyoti' | 'vatya';

/**
 * LinkRelationship — Semantic meaning of the edge between two nodes.
 */
export type LinkRelationship =
    | 'prerequisite'   // Must complete source before target
    | 'related'        // Topically associated
    | 'leads_to'       // Source directly prepares for target
    | 'part_of'        // Source is a sub-component of target
    | 'example'        // Source illustrates target
    | 'path'           // Explicit curated learning sequence
    | 'topic_association'; // Loose semantic grouping

/**
 * GraphNode — Canonical, perspective-agnostic knowledge node.
 */
export interface GraphNode {
    id: string;
    label: string;
    type: 'topic' | 'resource' | 'persona' | 'collection' | 'school';
    group: string;

    // Populated by layout algorithms — NOT set by data layer
    x?: number;
    y?: number;

    // D3 internal (force simulation)
    fx?: number | null;
    fy?: number | null;
    vx?: number;
    vy?: number;

    // Perspective support flags
    supportedPerspectives?: PerspectiveId[];

    // Terra perspective: geographical positioning
    geo?: {
        lat: number;
        lng: number;
        provinceId: string;
        districtId: string;
    };

    // Dharma perspective: sequential learning path
    path?: {
        order: number;
        dependencies: string[];
    };

    // Vastu perspective: tree hierarchy
    parentId?: string;

    // Metadata
    metadata?: {
        description?: string;
        subjects?: string[];
        topics?: string[];
        tags?: string[];
        thumbnail?: string;
        duration?: string;
        is_ministry_official?: boolean;
        attributes?: Record<string, number>;
    };

    // Visual hints
    isHero?: boolean;
    isPathway?: boolean;
}

/**
 * GraphLink — A directed edge between two GraphNodes.
 */
export interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    relationship?: LinkRelationship;
    value?: number;
    isPathway?: boolean;
}

/**
 * KnowledgeTopology — The complete data envelope for any visualization.
 */
export interface KnowledgeTopology {
    nodes: GraphNode[];
    links: GraphLink[];
    supportedPerspectives?: PerspectiveId[];
    context?: {
        focusRegion?: string;
        zoomLevel?: number;
        title?: string;
    };
}

/**
 * LayoutResult — The output of any layout algorithm.
 */
export interface LayoutResult {
    positions: Map<string, { x: number; y: number }>;
    bounds: { width: number; height: number; minX: number; minY: number };
}
