import type { PerspectiveViewProps } from '@repo/core';
import type React from 'react';
import { useMemo } from 'react';
import { useThemedColors } from '../../hooks/useThemedColors';
import { Theme } from '../../theme/Theme';
import { Box } from '../../primitives';
import { UnifiedMapView } from '../maps/UnifiedMapView';
import { UnifiedMarker } from '../maps/UnifiedMarker';

/**
 * TerraView - The Geographical Perspective.
 */
export const TerraView: React.FC<PerspectiveViewProps> = ({ data, onNodePress }) => {
  const colors = useThemedColors();
  const geoNodes = useMemo(() => data.nodes.filter((n: any) => n.geo), [data.nodes]);

  const initialRegion = useMemo(() => {
    if (geoNodes.length === 0) {
      return { latitude: 7.8731, longitude: 80.7718, latitudeDelta: 3.0, longitudeDelta: 3.0 };
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
      </UnifiedMapView>
    </Box>
  );
};
