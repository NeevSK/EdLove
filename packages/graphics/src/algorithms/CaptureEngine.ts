import { GraphNode, KnowledgeTopology } from '@repo/core/types';

/**
 * CaptureEngine  Prepares and optimizes visualizations for static export.
 *
 * Used for including maps/charts in generated PDF/HTML reports.
 */
export const CaptureEngine = {
  /**
   * Prepares the topology for a high-res capture.
   * Removes temporary UI states, filters out irrelevant nodes for a report view.
   */
  prepareForCapture: (topology: KnowledgeTopology) => {
    // Rule: Report views should only show the primary knowledge structure.
    // We filter out any 'persona' or helper nodes that might be in the live view.
    return {
      ...topology,
      nodes: topology.nodes.filter((n: GraphNode) => n.type !== 'persona'),
    };
  },

  /**
   * Web-only: Converts an SVG element to a DataURL (PNG).
   * This is used in the web app to "snapshot" the visualization before attaching to a report.
   */
  svgToDataURL: async (svgElement: SVGSVGElement): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const svgSize = svgElement.getBoundingClientRect();
        canvas.width = svgSize.width * 2; // High-res
        canvas.height = svgSize.height * 2;

        img.onload = () => {
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        };

        img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
      } catch (err) {
        reject(err);
      }
    });
  },
};
