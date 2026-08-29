import type { PerspectiveViewProps } from '@repo/core/types';
import type React from 'react';
import { useMemo } from 'react';
import { useThemedColors } from '@repo/ui/hooks/useThemedColors';
import { Box } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import { UnifiedMapView } from '@repo/ui/components/maps/UnifiedMapView';
import { UnifiedMarker } from '@repo/ui/components/maps/UnifiedMarker';
// @ts-ignore
import lkEduData from '@intuitui-labs/lk-edu-geo/data/lk-edu-data.json';

/**
 * TerraView - The Geographical Perspective.
 */
export const TerraView: React.FC<PerspectiveViewProps> = ({ data, onNodePress }) => {
  const colors = useThemedColors();
  const geoNodes = useMemo(() => data.nodes.filter((n: any) => n.geo), [data.nodes]);
  // LK Edu Geo districts for powerhouse choropleth (first 5 for demo)
  const districtMarkers = useMemo(() => {
    try {
      const districts = (lkEduData as unknown as { districts?: { id: string; name: string; lat?: number; lng?: number }[] }).districts ?? [];
      return districts.slice(0, 5).map((d) => ({ id: `district-${d.id}`, label: d.name, geo: { lat: d.lat ?? 7.9, lng: d.lng ?? 80.7 } }));
    } catch {
      return [];
    }
  }, []);

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
