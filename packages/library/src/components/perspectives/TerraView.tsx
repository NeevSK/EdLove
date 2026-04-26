import type { GraphNode, PerspectiveViewProps } from '@repo/graphics';
import { Box, Theme, useThemedColors } from '@repo/ui';
import type React from 'react';
import { useMemo, useRef } from 'react';
import { UnifiedMapView } from '../maps/UnifiedMapView';
import { UnifiedMarker } from '../maps/UnifiedMarker';

/**
 * TerraView — The "Geographical" Perspective (Native).
 *
 * Renders nodes on a real-world map using a unified map component.
 * Features custom dark-mode styling for the "Sanctuary" aesthetic.
 */
export const TerraView: React.FC<PerspectiveViewProps> = ({ data, onNodePress }) => {
  const colors = useThemedColors();
  const mapRef = useRef<any>(null);

  // Filter nodes with geo data
  const geoNodes = useMemo(() => data.nodes.filter((n) => n.geo), [data.nodes]);

  // Initial region focusing on Sri Lanka if no data, or on nodes if present
  const initialRegion = useMemo(() => {
    if (geoNodes.length === 0) {
      return {
        latitude: 7.8731,
        longitude: 80.7718,
        latitudeDelta: 3.0,
        longitudeDelta: 3.0,
      };
    }

    const lats = geoNodes.map((n) => n.geo!.lat);
    const lngs = geoNodes.map((n) => n.geo!.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.1, (maxLat - minLat) * 1.5),
      longitudeDelta: Math.max(0.1, (maxLng - minLng) * 1.5),
    };
  }, [geoNodes]);

  // Dark Map Style (Sanctuary Ink / Obsidian)
  const mapStyle = [
        { "elementType": "geometry", "stylers": [{ "color": "#1A1610" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1A1610" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#8C8273" }] },
        { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#F6BF8C" }] },
        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#8C8273" }] },
        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#2A2318" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#3D3528" }] },
        { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#1A1610" }] },
        { "featureType": "road", "labels.text.fill", "stylers": [{ "color": "#6A6358" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0F172A" }] },
        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#2563EB" }] }
    ];

  return (
    <Box className="absolute inset-0 bg-[#1A1610]">
      <UnifiedMapView
        ref={mapRef}
        className="absolute inset-0"
        region={initialRegion}
        customMapStyle={mapStyle}
        rotateEnabled={false}
      >
        {geoNodes.map((node) => (
          <UnifiedMarker
            key={node.id}
            id={node.id}
            coordinate={{
              latitude: node.geo!.lat,
              longitude: node.geo!.lng,
            }}
            title={node.label}
            description={node.type}
            onPress={() => onNodePress?.(node)}
            pinColor={node.type === 'school' ? Theme.colors.sanctuarySaffron : colors.action}
          />
        ))}
      </UnifiedMapView>
    </Box>
  );
};
