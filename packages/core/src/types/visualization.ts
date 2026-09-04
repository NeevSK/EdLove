import type {
  GraphNode,
  KnowledgeTopology,
  LayoutResult,
  PerspectiveId,
} from '@repo/core/types/topology';
import type React from 'react';

/**
 * PerspectiveViewProps - Props passed to every perspective renderer.
 *
 * Pre-computed layout data provided by @repo/graphics, consumed by @repo/ui.
 */
export interface PerspectiveViewProps {
  data: KnowledgeTopology;
  layout: LayoutResult;
  selectedNode?: GraphNode | null;
  onNodePress?: (node: GraphNode) => void;
  /** Screen dimensions - renderers use this to scale the canvas */
  width: number;
  height: number;
}

/**
 * PerspectiveRenderer - The swappable renderer contract.
 */
export interface PerspectiveRenderer {
  id: PerspectiveId;
  label: string;
  description: string;

  /**
   * Pure function - inspects the topology and returns true if this
   * perspective can meaningfully render the given data.
   */
  validate: (data: KnowledgeTopology) => boolean;

  /** The React component that renders this perspective */
  Component: React.ComponentType<PerspectiveViewProps>;
}
