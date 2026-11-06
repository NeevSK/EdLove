import { useMap } from '@repo/ui/components/maps/MapProvider';
import type { UnifiedMarkerProps } from '@repo/ui/components/maps/UnifiedMarker.types';
import { Box, Text } from '@repo/ui/primitives';
import type React from 'react';

const MapLibreGL = require('@maplibre/maplibre-react-native') as {
  ViewAnnotation: React.ComponentType<any>;
  Callout: React.ComponentType<any>;
};
const ReactNativeMaps = require('react-native-maps') as {
  Marker: React.ComponentType<any>;
};
const Marker = ReactNativeMaps.Marker;

export const UnifiedMarker: React.FC<UnifiedMarkerProps> = ({
  id,
  coordinate,
  title,
  description,
  onPress,
  pinColor,
  children,
}) => {
  const { provider } = useMap();

  if (provider === 'maplibre') {
    return (
      <MapLibreGL.ViewAnnotation
        id={id || `marker-${coordinate.latitude}-${coordinate.longitude}`}
        lngLat={[coordinate.longitude, coordinate.latitude]}
        onSelect={onPress}
      >
        {(children as React.ReactElement) || (
          <Box
            className="w-[15px] h-[15px] rounded-full border-2 border-white"
            style={{ backgroundColor: pinColor || '#FF0000' }}
          />
        )}
        <MapLibreGL.Callout>
          <Box className="p-2.5 bg-white rounded-lg min-w-[100px] shadow-sm">
            <Text className="font-bold text-sm text-[#000000]">{title}</Text>
            {description && <Text className="text-[12px] text-[#666666]">{description}</Text>}
          </Box>
        </MapLibreGL.Callout>
      </MapLibreGL.ViewAnnotation>
    );
  }

  return (
    <Marker
      coordinate={coordinate}
      title={title}
      description={description}
      onPress={onPress}
      pinColor={pinColor}
    >
      {children}
    </Marker>
  );
};

export default UnifiedMarker;
