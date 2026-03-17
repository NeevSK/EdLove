import type { KnowledgeTopology } from '../types/KnowledgeTopology';
import type { PerspectiveId } from '../types/GraphNode';

/**
 * getAvailablePerspectives — Data-driven perspective enablement.
 *
 * Instead of hardcoding which tabs are enabled, this function
 * inspects the topology and returns which perspectives make sense.
 *
 * This is the "intelligence" layer that lets the UI auto-configure.
 */
export function getAvailablePerspectives(topology: KnowledgeTopology): PerspectiveId[] {
    // If the API explicitly declares supported perspectives, respect it
    if (topology.supportedPerspectives && topology.supportedPerspectives.length > 0) {
        return topology.supportedPerspectives;
    }

    const available: PerspectiveId[] = [];

    // Astro (Knowledge Cosmos): available if there are multiple nodes with links
    if (topology.nodes.length > 1 && topology.links.length > 0) {
        available.push('astro');
    }

    // Terra (Geo Map): available if at least 20% of nodes have geo data
    const geoNodeCount = topology.nodes.filter((n) => n.geo).length;
    if (geoNodeCount > 0 && geoNodeCount / topology.nodes.length >= 0.2) {
        available.push('terra');
    }

    // Dharma (Learning Path): available if nodes have `path.order` fields
    const pathNodeCount = topology.nodes.filter((n) => n.path?.order !== undefined).length;
    if (pathNodeCount >= 3) {
        available.push('dharma');
    }

    // Vastu (Mind Map / Structure): available if nodes have `parentId` relationships
    const treeNodeCount = topology.nodes.filter((n) => n.parentId).length;
    if (treeNodeCount >= 2) {
        available.push('vastu');
    }

    // Jyoti (Analytics / Charts): available if nodes have quantifiable metadata
    const chartableNodeCount = topology.nodes.filter(
        (n) => n.metadata?.subjects && n.metadata.subjects.length > 0
    ).length;
    if (chartableNodeCount >= 3) {
        available.push('jyoti');
    }

    // Always return at least 'astro' if we have any nodes
    if (available.length === 0 && topology.nodes.length > 0) {
        available.push('astro');
    }

    return available;
}
