import { type MapProviderType, useOptionalMap } from '@repo/ui/components/maps/MapProvider';
import type React from 'react';
import MapView, {
  type MapViewProps as NativeMapViewProps,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

export type UnifiedMapViewRef = InstanceType<typeof MapView>;

export type UnifiedMapViewProps = Omit<NativeMapViewProps, 'initialRegion' | 'provider'> & {
  initialRegion?: NativeMapViewProps['initialRegion'];
  provider?: MapProviderType | 'default';
  children?: React.ReactNode;
  ref?: React.Ref<UnifiedMapViewRef>;
};

/**
 * UnifiedMapView - Platform Generic Map Primitive
 * Abstracted from library package to be consumable by all modules.
 */
export function UnifiedMapView({
  ref,
  initialRegion,
  children,
  style,
  provider,
  ...props
}: UnifiedMapViewProps) {
  const mapContext = useOptionalMap();
  const selectedProvider = provider ?? mapContext?.provider ?? 'apple';

  return (
    <MapView
      ref={ref}
      provider={selectedProvider === 'google' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
      style={[{ flex: 1 }, style]}
      initialRegion={initialRegion}
      {...props}
    >
      {children}
    </MapView>
  );
}
