import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { FeatureGuard } from '@repo/core/src/permissions/guards/FeatureGuard';

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
  
  return (
    <FeatureGuard feature="isGraphicsEngineEnabled">
      {Platform.OS === 'web' ? (
        <View style={[{ width, height, overflow: 'hidden' }, style]}>
          {standardContent}
          {children}
        </View>
      ) : (
        <View style={[{ width, height }, style]}>
          {standardContent}
          {children}
        </View>
      )}
    </FeatureGuard>
  );
};
