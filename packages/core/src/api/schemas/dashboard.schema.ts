import { z } from 'zod';

/**
 * PerspectiveIdSchema  The distinct visualization modes.
 */
export const PerspectiveIdSchema = z.enum(['astro', 'terra', 'dharma', 'vastu', 'jyoti', 'vatya']);

/**
 * LinkRelationshipSchema  Semantic meaning of the edge.
 */
export const LinkRelationshipSchema = z.enum([
    'prerequisite',
    'related',
    'leads_to',
    'part_of',
    'example',
    'path',
    'topic_association'
]);

/**
 * GraphNodeSchema  Canonical node representation.
 */
export const GraphNodeSchema = z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['topic', 'resource', 'persona', 'collection', 'school']),
    group: z.string(),
    x: z.number().optional(),
    y: z.number().optional(),
    fx: z.number().nullable().optional(),
    fy: z.number().nullable().optional(),
    vx: z.number().optional(),
    vy: z.number().optional(),
    supportedPerspectives: z.array(PerspectiveIdSchema).optional(),
    geo: z.object({
        lat: z.number(),
        lng: z.number(),
        provinceId: z.string(),
        districtId: z.string(),
    }).optional(),
    path: z.object({
        order: z.number(),
        dependencies: z.array(z.string()),
    }).optional(),
    parentId: z.string().optional(),
    metadata: z.object({
        description: z.string().optional(),
        subjects: z.array(z.string()).optional(),
        topics: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        thumbnail: z.string().optional(),
        duration: z.string().optional(),
        is_ministry_official: z.boolean().optional(),
        attributes: z.record(z.string(), z.number()).optional(),
    }).optional(),
    isHero: z.boolean().optional(),
    isPathway: z.boolean().optional(),
});

/**
 * GraphLinkSchema  A directed edge between two nodes.
 */
export const GraphLinkSchema = z.object({
    source: z.union([z.string(), GraphNodeSchema]),
    target: z.union([z.string(), GraphNodeSchema]),
    relationship: LinkRelationshipSchema.optional(),
    value: z.number().optional(),
    isPathway: z.boolean().optional(),
});

/**
 * KnowledgeTopologySchema  The complete data envelope.
 */
export const KnowledgeTopologySchema = z.object({
    nodes: z.array(GraphNodeSchema),
    links: z.array(GraphLinkSchema),
    supportedPerspectives: z.array(PerspectiveIdSchema).optional(),
    context: z.object({
        focusRegion: z.string().optional(),
        zoomLevel: z.number().optional(),
        title: z.string().optional(),
    }).optional(),
});

/**
 * PulseMetricsSchema  Realtime school pulse indicators.
 */
export const PulseMetricsSchema = z.object({
    resonance_score: z.number().min(0).max(100),
    aggregated_mood: z.enum(['joy', 'peace', 'focus', 'struggle', 'unknown']),
    trend: z.enum(['rising', 'stable', 'failing']),
    participation_rate: z.number().min(0).max(100),
    top_subjects: z.array(z.string()),
    interaction_volume: z.number(),
});

export type MappingTopologyZod = z.infer<typeof KnowledgeTopologySchema>;
export type PulseMetricsZod = z.infer<typeof PulseMetricsSchema>;
