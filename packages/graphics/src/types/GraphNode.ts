/**
 * GraphNode — Canonical, perspective-agnostic knowledge node.
 *
 * This is the single source of truth for all visualization perspectives.
 * Every perspective receives this type and uses only the fields it needs.
 */
export interface GraphNode {
    id: string;
    label: string;
    type: 'topic' | 'resource' | 'persona' | 'collection' | 'school';
    group: string;

    // Populated by layout algorithms — NOT set by data layer
    x?: number;
    y?: number;

    // D3 internal (force simulation) — keep for type safety, never set manually
    fx?: number | null;
    fy?: number | null;
    vx?: number;
    vy?: number;

    // Perspective support flags — populated from API or inferred
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

    // Mind map / tree hierarchy (Vastu): parent reference for tree layout
    parentId?: string;

    // Rich metadata
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

    // Visual hints (optional overrides from data)
    isHero?: boolean;
    isPathway?: boolean;
}

export type PerspectiveId = 'astro' | 'terra' | 'dharma' | 'vastu' | 'jyoti' | 'vatya';
