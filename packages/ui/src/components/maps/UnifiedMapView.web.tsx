import { Box, Text } from '@repo/ui/primitives';
import React from 'react';

export interface UnifiedMapViewProps {
  style?: any;
  region?: any;
  children?: React.ReactNode;
}

/**
 * UnifiedMapView (Web Shim)
 * Prevents native pollution by ensuring react-native-maps is never imported on web.
 */
export const UnifiedMapView = React.forwardRef<any, UnifiedMapViewProps>(
  ({ children, style }, ref) => {
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
  },
);
