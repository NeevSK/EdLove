import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import MapViewRN, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import ML from '@maplibre/maplibre-react-native';
import { useMap } from './MapProvider';

// Initialize MapLibre
ML.setAccessToken(null); // MapLibre doesn't require a token for standard use, but can be set if using a provider

interface UnifiedMapViewProps extends ViewProps {
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

export const UnifiedMapView = React.forwardRef<any, UnifiedMapViewProps>(({ 
  region, 
  children, 
  style, 
  styleURL,
  ...props 
}, ref) => {
  const { provider } = useMap();

  if (provider === 'maplibre') {
    const MLMapView = ML.MapView as any;
    const MLCamera = ML.Camera as any;
    
    return (
      <MLMapView 
        ref={ref}
        style={[styles.map, style as any]} 
        styleURL={styleURL || (ML as any).StyleURL?.Default}
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
      style={[styles.map, style]}
      initialRegion={region}
      {...props}
    >
      {children}
    </MapViewRN>
  );
});

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
