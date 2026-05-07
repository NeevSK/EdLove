import {
  Canvas,
  ColorMatrix,
  Group,
  RadialGradient,
  Rect,
  RoundedRect,
  Turbulence,
  vec,
} from '@shopify/react-native-skia';
import type React from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { View } from '../primitives';

import { useTheme } from '../hooks/useTheme';

interface LivingCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  width: number; // Required - Skia needs explicit dimensions
  height: number; // Required
  baseColor?: string; // Explicit override
  warmCenter?: boolean; // Default true - warm center, cool edges
  cornerRadius?: number; // Default 16
  grainOpacity?: number; // Default 0.04
}

export const LivingCard: React.FC<LivingCardProps> = ({
  children,
  style,
  width,
  height,
  baseColor,
  warmCenter = true,
  cornerRadius = 16,
  grainOpacity = 0.04,
}) => {
  const { glass, isDark } = useTheme();

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(width, height) * 0.7;

  // Use tokens for resonance colors
  const resolvedBase = baseColor || glass.surface.bg;
  const warmCenterColor = isDark
    ? 'rgba(61, 53, 40, 0.98)' // Shroud-ish
    : 'rgba(253, 245, 228, 0.98)'; // Silk-ish
  const coolEdgeColor = isDark
    ? 'rgba(26, 22, 16, 0.95)' // Obsidian-ish
    : 'rgba(235, 228, 215, 0.98)'; // Linen-ish

  return (
    <View style={[{ width, height }, style]}>
      {/* Skia living background */}
      <Canvas style={StyleSheet.absoluteFill}>
        <Group>
          {/* Base rounded rect */}
          <RoundedRect
            x={0}
            y={0}
            width={width}
            height={height}
            r={cornerRadius}
            color={resolvedBase}
          />

          {/* Subsurface scattering - warm center, cool edges */}
          {warmCenter && (
            <RoundedRect x={0} y={0} width={width} height={height} r={cornerRadius}>
              <RadialGradient
                c={vec(centerX, centerY * 0.6)} // Center slightly high - light from above
                r={radius}
                colors={[warmCenterColor, coolEdgeColor]}
                positions={[0, 1]}
              />
            </RoundedRect>
          )}

          {/* Fine grain texture - organic surface */}
          <Rect x={0} y={0} width={width} height={height}>
            <Turbulence freqX={0.8} freqY={0.8} octaves={3} seed={5} />
            <ColorMatrix
              matrix={[
                1,
                0,
                0,
                0,
                0.01,
                0,
                1,
                0,
                0,
                0.005,
                0,
                0,
                1,
                0,
                -0.005,
                0,
                0,
                0,
                grainOpacity,
                0,
              ]}
            />
          </Rect>
        </Group>
      </Canvas>

      {/* Children - existing card content completely unchanged */}
      <View style={[StyleSheet.absoluteFill, { borderRadius: cornerRadius, overflow: 'hidden' }]}>
        {children}
      </View>
    </View>
  );
};
