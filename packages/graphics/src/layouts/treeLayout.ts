import type { GraphNode, KnowledgeTopology, LayoutResult } from '@repo/core/types';
import { type HierarchyNode, hierarchy, tree } from 'd3-hierarchy';

export interface TreeLayoutOptions {
  width: number;
  height: number;
  nodeSize?: [number, number]; // [nodeWidth, nodeHeight]
  orientation?: 'horizontal' | 'vertical';
}

const DEFAULT_OPTIONS: Required<TreeLayoutOptions> = {
  width: 800,
  height: 600,
  nodeSize: [160, 80],
  orientation: 'vertical',
};

/**
 * treeLayout  D3 hierarchy layout for the Vastu (Mind Map) perspective.
 *
 * Builds a proper tree from `parentId` references in nodes.
 * Nodes without a `parentId` are wired to a synthesized root.
 *
 * Returns static { x, y } positions  no live simulation needed.
 */
export function treeLayout(
  topology: KnowledgeTopology,
  rootId?: string,
  options: Partial<TreeLayoutOptions> = {},
): LayoutResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Build a parent-child lookup map
  const nodeMap = new Map<string, GraphNode>();
  for (const node of topology.nodes) {
    nodeMap.set(node.id, node);
  }

  // Determine the root
  const rootNode: GraphNode | undefined = rootId
    ? nodeMap.get(rootId)
    : topology.nodes.find((n: GraphNode) => !n.parentId);

  if (!rootNode) {
    // Fallback: return empty layout if no root
    return {
      positions: new Map(),
      bounds: { width: opts.width, height: opts.height, minX: 0, minY: 0 },
    };
  }

  // Build the hierarchy structure D3 needs
  interface TreeNode {
    id: string;
    children: TreeNode[];
  }

  function buildTree(nodeId: string): TreeNode {
    const children = topology.nodes
      .filter((n: GraphNode) => n.parentId === nodeId)
      .map((n: GraphNode) => buildTree(n.id));
    return { id: nodeId, children };
  }

  const treeData = buildTree(rootNode.id);

  const root: HierarchyNode<TreeNode> = hierarchy(treeData, (d) => d.children);

  const treeLayout = tree<TreeNode>().nodeSize(opts.nodeSize);
  treeLayout(root);

  const positions = new Map<string, { x: number; y: number }>();
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  root.each((d: HierarchyNode<TreeNode>) => {
    if (d.x !== undefined && d.y !== undefined) {
      const x = opts.orientation === 'horizontal' ? d.y : d.x;
      const y = opts.orientation === 'horizontal' ? d.x : d.y;
      positions.set(d.data.id, { x, y });
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  });

  return {
    positions,
    bounds: {
      width: maxX - minX + opts.nodeSize[0],
      height: maxY - minY + opts.nodeSize[1],
      minX,
      minY,
    },
  };
}
