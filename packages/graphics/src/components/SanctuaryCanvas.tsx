import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';

interface SanctuaryCanvasProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  width?: number;
  height?: number;
  render?: {
    skia?: () => React.ReactNode;
    standard?: () => React.ReactNode;
  };
}

/**
 * SanctuaryCanvas provides a platform-aware rendering surface.
 * It supports a hybrid rendering pattern:
 * 1. An optional 'render' prop for platform-specific high-perf drawing.
 * 2. 'children' for standard React Native component layering.
 */
export const SanctuaryCanvas: React.FC<SanctuaryCanvasProps> = ({
  children,
  style,
  width,
  height,
  render,
}) => {
  const standardContent = render?.standard ? render.standard() : null;
  
  if (Platform.OS === 'web') {
    return (
      <View style={[{ width, height, overflow: 'hidden' }, style]}>
        {standardContent}
        {children}
      </View>
    );
  }

  // On native, we'll eventually wrap this with Skia Canvas if skia render is provided
  return (
    <View style={[{ width, height }, style]}>
      {standardContent}
      {children}
    </View>
  );
};
