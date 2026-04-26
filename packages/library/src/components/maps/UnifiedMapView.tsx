import * as MapLibreGL from '@maplibre/maplibre-react-native';
import { Box } from '@repo/ui';
import React from 'react';
import MapViewRN, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { useMap } from './MapProvider';

// Initialize MapLibre
MapLibreGL.setAccessToken(null); // MapLibre doesn't require a token for standard use, but can be set if using a provider

interface UnifiedMapViewProps {
  style?: any;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  styleURL?: string;
  customMapStyle?: any[];
  rotateEnabled?: boolean;
  children?: React.ReactNode;
}

export const UnifiedMapView = React.forwardRef<any, UnifiedMapViewProps>(
  ({ region, children, style, styleURL, ...props }, ref) => {
    const { provider } = useMap();

    if (provider === 'maplibre') {
      const MLMapView = MapLibreGL.MapView as any;
      const MLCamera = MapLibreGL.Camera as any;

      return (
        <MLMapView
          ref={ref}
          style={[{ flex: 1 }, style as any]}
          styleURL={styleURL || (MapLibreGL as any).StyleURL?.Default}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <MLCamera
            centerCoordinate={region ? [region.longitude, region.latitude] : undefined}
            zoomLevel={region ? 12 : undefined}
          />
          {children}
        </MLMapView>
      );
    }

    return (
      <MapViewRN
        ref={ref}
        provider={provider === 'google' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        style={[{ flex: 1 }, style]}
        initialRegion={region}
        {...props}
      >
        {children}
      </MapViewRN>
    );
  },
);
