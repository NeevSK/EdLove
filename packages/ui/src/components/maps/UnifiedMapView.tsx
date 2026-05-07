import React from 'react';

const ReactNativeMaps = require('react-native-maps') as {
  default: React.ComponentType<any>;
  PROVIDER_DEFAULT?: string;
  PROVIDER_GOOGLE?: string;
};
const MapViewRN = ReactNativeMaps.default;
const PROVIDER_DEFAULT = ReactNativeMaps.PROVIDER_DEFAULT ?? 'default';
const PROVIDER_GOOGLE = ReactNativeMaps.PROVIDER_GOOGLE ?? 'google';

export interface UnifiedMapViewProps {
  style?: any;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  provider?: 'default' | 'google' | 'maplibre';
  customMapStyle?: any[];
  rotateEnabled?: boolean;
  children?: React.ReactNode;
}

/**
 * UnifiedMapView - Platform Generic Map Primitive
 * Abstracted from library package to be consumable by all modules.
 */
export const UnifiedMapView = React.forwardRef<any, UnifiedMapViewProps>(
  ({ region, children, style, provider = 'default', ...props }, ref) => {
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
