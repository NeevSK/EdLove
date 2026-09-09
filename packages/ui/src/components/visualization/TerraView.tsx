import type { PerspectiveViewProps } from '@repo/core/types';
import { UnifiedMapView } from '@repo/ui/components/maps/UnifiedMapView';
import { UnifiedMarker } from '@repo/ui/components/maps/UnifiedMarker';
import { useThemedColors } from '@repo/ui/hooks/useThemedColors';
import { Box } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import type React from 'react';
import { useMemo } from 'react';

// Representative Sri Lankan districts for geo perspective choropleth demo
const DEMO_DISTRICTS = [
  { id: 'district-D_11', label: 'Colombo', geo: { lat: 6.9271, lng: 79.8612 } },
  { id: 'district-D_21', label: 'Kandy', geo: { lat: 7.2906, lng: 80.6337 } },
  { id: 'district-D_81', label: 'Galle', geo: { lat: 6.0535, lng: 80.221 } },
  { id: 'district-D_41', label: 'Jaffna', geo: { lat: 9.6615, lng: 80.0255 } },
  { id: 'district-D_51', label: 'Anuradhapura', geo: { lat: 8.3114, lng: 80.4037 } },
];

/**
 * TerraView - The Geographical Perspective.
 */
export const TerraView: React.FC<PerspectiveViewProps> = ({ data, onNodePress }) => {
  const colors = useThemedColors();
  const geoNodes = useMemo(() => data.nodes.filter((n: any) => n.geo), [data.nodes]);
  const districtMarkers = DEMO_DISTRICTS;

  const initialRegion = useMemo(() => {
    if (geoNodes.length === 0) {
      return {
        latitude: 7.8731,
        longitude: 80.7718,
        latitudeDelta: 3.0,
        longitudeDelta: 3.0,
      };
    }
    const lats = geoNodes.map((n: any) => n.geo!.lat);
    const lngs = geoNodes.map((n: any) => n.geo!.lng);
    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitudeDelta: 1.0,
      longitudeDelta: 1.0,
    };
  }, [geoNodes]);

  return (
    <Box className="absolute inset-0 bg-[#1A1610]">
      <UnifiedMapView style={{ flex: 1 }} region={initialRegion} rotateEnabled={false}>
        {geoNodes.map((node: any) => (
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
        {districtMarkers.map((d) => (
          <UnifiedMarker
            key={d.id}
            id={d.id}
            coordinate={{ latitude: d.geo.lat, longitude: d.geo.lng }}
            title={d.label}
            description="District"
            pinColor={Theme.colors.sageGreen}
          />
        ))}
      </UnifiedMapView>
    </Box>
  );
};
