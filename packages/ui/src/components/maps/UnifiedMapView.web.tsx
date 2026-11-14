import { Box, Text } from '@repo/ui/primitives';
import type React from 'react';

export interface UnifiedMapViewProps {
  style?: React.ComponentProps<typeof Box>['style'];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  children?: React.ReactNode;
  ref?: React.Ref<React.ComponentRef<typeof Box>>;
}

/**
 * UnifiedMapView (Web Shim)
 * Prevents native pollution by ensuring react-native-maps is never imported on web.
 */
export function UnifiedMapView({ children, style, ref }: UnifiedMapViewProps) {
  return (
    <Box
      ref={ref}
      className="flex-1 items-center justify-center bg-phase-surface/10 rounded-2xl border border-phase-border"
      style={style}
    >
      <Text className="text-phaseText-tertiary font-bold uppercase tracking-widest text-xs">
        [ Geovisualization Service (Web Portal) ]
      </Text>
      {children}
    </Box>
  );
}
