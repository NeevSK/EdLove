import { View } from '@repo/ui/primitives';
import {
  BlurMask,
  Canvas,
  LinearGradient,
  Paint,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import type React from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';

interface TemporalGlassProps {
  children: React.ReactNode;
  style?: ViewStyle;
  width: number;
  height: number;
  phase: 'predawn' | 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'dusk' | 'night';
  cornerRadius?: number;
}

// Phase-specific edge colors
const PHASE_EDGES = {
  predawn: { top: 'rgba(184,169,224,0.20)', bottom: 'rgba(107,100,128,0.08)' },
  dawn: { top: 'rgba(212,132,58,0.22)', bottom: 'rgba(139,191,122,0.08)' },
  morning: { top: 'rgba(212,132,58,0.18)', bottom: 'rgba(139,191,122,0.12)' },
  midday: { top: 'rgba(125,212,192,0.18)', bottom: 'rgba(107,100,128,0.08)' },
  afternoon: { top: 'rgba(212,132,58,0.20)', bottom: 'rgba(184,169,224,0.08)' },
  evening: { top: 'rgba(212,132,58,0.28)', bottom: 'rgba(184,169,224,0.10)' },
  dusk: { top: 'rgba(184,169,224,0.22)', bottom: 'rgba(107,100,128,0.12)' },
  night: { top: 'rgba(184,169,224,0.24)', bottom: 'rgba(125,212,192,0.08)' },
};

export const TemporalGlass: React.FC<TemporalGlassProps> = ({
  children,
  style,
  width,
  height,
  phase,
  cornerRadius = 20,
}) => {
  const edges = PHASE_EDGES[phase] || PHASE_EDGES.midday;

  return (
    <View style={[{ width, height }, style]}>
      <Canvas style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        {cornerRadius > 0 ? (
          <>
            {/* Outer luminous edge - only for rounded cards */}
            <RoundedRect
              x={0.5}
              y={0.5}
              width={width - 1}
              height={height - 1}
              r={cornerRadius}
              style="stroke"
              strokeWidth={1}
            >
              <LinearGradient
                start={vec(width / 2, 0)}
                end={vec(width / 2, height)}
                colors={[edges.top, edges.bottom]}
              />
            </RoundedRect>

            {/* Inner top highlight */}
            <RoundedRect
              x={2}
              y={2}
              width={width - 4}
              height={height * 0.3}
              r={cornerRadius - 2}
              style="stroke"
              strokeWidth={0.5}
            >
              <Paint color={edges.top} opacity={0.6}>
                <BlurMask blur={4} style="normal" />
              </Paint>
            </RoundedRect>
          </>
        ) : (
          // Flat bar mode (tab bar) - only a 1px top edge gradient, no rect border
          <RoundedRect x={0} y={0} width={width} height={1} r={0} style="fill">
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, 0)}
              colors={[edges.bottom, edges.top, edges.bottom]}
            />
          </RoundedRect>
        )}
      </Canvas>

      {/* Existing BlurView children - completely unchanged */}
      <View style={[StyleSheet.absoluteFill, { borderRadius: cornerRadius, overflow: 'hidden' }]}>
        {children}
      </View>
    </View>
  );
};
