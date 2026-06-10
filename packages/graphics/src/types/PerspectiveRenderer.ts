import type { GraphNode, KnowledgeTopology, LayoutResult, PerspectiveId } from '@repo/core/types';
import type React from 'react';

/**
 * PerspectiveViewProps  Props passed to every perspective renderer.
 *
 * The renderer is a "thin consumer"  it receives pre-computed layout
 * positions and just draws. No D3, no simulation logic inside renderers.
 */
export interface PerspectiveViewProps {
  data: KnowledgeTopology;
  layout: LayoutResult;
  selectedNode?: GraphNode | null;
  onNodePress?: (node: GraphNode) => void;
  /** Screen dimensions  renderers use this to scale the canvas */
  width: number;
  height: number;
}

/**
 * PerspectiveRenderer  The swappable renderer contract.
 *
 * Each perspective (Astro, Vastu, Jyoti, Terra, Dharma) implements this
 * interface. The `MapScreen` kernel picks the active renderer and passes
 * it pre-computed layout data.
 *
 * KEY RULE: The Component must have both `.tsx` (native) and `.web.tsx`
 * (web) implementations if the rendering strategy differs.
 */
export interface PerspectiveRenderer {
  id: PerspectiveId;
  label: string;
  description: string;

  /**
   * Pure function  inspects the topology and returns true if this
   * perspective can meaningfully render the given data.
   * Used by `getAvailablePerspectives()` to auto-enable/disable tabs.
   */
  validate: (data: KnowledgeTopology) => boolean;

  /** The React component that renders this perspective */
  Component: React.ComponentType<PerspectiveViewProps>;
}
