import type { GraphNode } from './GraphNode';

export type LinkRelationship =
    | 'prerequisite'   // Must complete source before target
    | 'related'        // Topically associated
    | 'leads_to'       // Source directly prepares for target
    | 'part_of'        // Source is a sub-component of target
    | 'example'        // Source illustrates target
    | 'path'           // Explicit curated learning sequence
    | 'topic_association'; // Loose semantic grouping

/**
 * GraphLink — A directed edge between two GraphNodes.
 *
 * `source` and `target` start as string IDs (from API).
 * After D3 force simulation resolves them, they become GraphNode references.
 * The union type reflects this D3 lifecycle.
 */
export interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    relationship?: LinkRelationship;
    value?: number;          // Edge weight — influences force distance
    isPathway?: boolean;     // Highlights as a canonical learning path
}
