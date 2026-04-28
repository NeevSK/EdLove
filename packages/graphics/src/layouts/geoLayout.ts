import type { GraphNode, KnowledgeTopology, LayoutResult } from '@repo/core';

/**
 * geoLayout \u2014 Converts lat/lng geo coordinates to { x, y } canvas positions.
 *
 * For the Terra (Geo Map) perspective, nodes with `geo` data are projected
 * onto a 2D canvas. react-native-maps handles the actual map rendering,
 * so this layout is used by web-based Leaflet overlays that need SVG coordinates.
 *
 * Uses a simple equirectangular (Plate Carr\u00E9e) projection.
 */
export function geoLayout(
  topology: KnowledgeTopology,
  canvasWidth: number = 800,
  canvasHeight: number = 600,
): LayoutResult & { hasGeoData: boolean } {
  const geoNodes = topology.nodes.filter((n: GraphNode) => n.geo);

  if (geoNodes.length === 0) {
    return {
      positions: new Map(),
      bounds: { width: canvasWidth, height: canvasHeight, minX: 0, minY: 0 },
      hasGeoData: false,
    };
  }

  const lats = geoNodes.map((n) => n.geo!.lat);
  const lngs = geoNodes.map((n) => n.geo!.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const padding = 60;
  const usableWidth = canvasWidth - padding * 2;
  const usableHeight = canvasHeight - padding * 2;

  const positions = new Map<string, { x: number; y: number }>();

  for (const node of geoNodes) {
    const x = padding + ((node.geo!.lng - minLng) / lngRange) * usableWidth;
    // Invert y: latitude increases going north (up), but canvas y increases going down
    const y = padding + ((maxLat - node.geo!.lat) / latRange) * usableHeight;
    positions.set(node.id, { x, y });
  }

  return {
    positions,
    bounds: { width: canvasWidth, height: canvasHeight, minX: 0, minY: 0 },
    hasGeoData: true,
  };
}
