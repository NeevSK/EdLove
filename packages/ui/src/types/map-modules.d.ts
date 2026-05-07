declare module 'react-native-maps' {
  import type * as React from 'react';

  export const PROVIDER_DEFAULT: string;
  export const PROVIDER_GOOGLE: string;

  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export interface MapViewProps {
    style?: any;
    provider?: string;
    initialRegion?: Region;
    region?: Region;
    rotateEnabled?: boolean;
    customMapStyle?: any[];
    children?: React.ReactNode;
  }

  const MapView: React.ComponentType<MapViewProps>;

  export interface MarkerProps {
    coordinate: { latitude: number; longitude: number };
    title?: string;
    description?: string;
    onPress?: () => void;
    pinColor?: string;
    children?: React.ReactNode;
  }

  export const Marker: React.ComponentType<MarkerProps>;
  export default MapView;
}

declare module '@maplibre/maplibre-react-native' {
  import type * as React from 'react';

  export interface PointAnnotationProps {
    id: string;
    coordinate: [number, number];
    onSelected?: () => void;
    children?: React.ReactNode;
  }

  export interface CalloutProps {
    children?: React.ReactNode;
  }

  export const PointAnnotation: React.ComponentType<PointAnnotationProps>;
  export const Callout: React.ComponentType<CalloutProps>;
}
