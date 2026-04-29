import type React from 'react';

export interface UnifiedMarkerProps {
  id?: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  onPress?: () => void;
  pinColor?: string;
  children?: React.ReactNode;
}
