import React from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { createRenderPlan } from '@repo/trube-art/core/render-plan';
import type { TrubeScoreName } from '@repo/trube-art/core/scores';
import { resolveSurface } from '@repo/trube-art/core/surface';
import type {
  TrubeEnvironment,
  TrubeQuality,
  TrubeSurfaceName,
  TrubeSurfaceSpec,
} from '@repo/trube-art/core/types';
import { UnifiedRenderer } from '@repo/trube-art/native/renderers/UnifiedRenderer';
import { useTrubeEnvironment } from '@repo/trube-art/native/TrubeProvider';

export interface TrubeCanvasProps {
  score?: TrubeScoreName;
  surface?: TrubeSurfaceSpec | TrubeSurfaceName;
  style?: StyleProp<ViewStyle>;
  quality?: TrubeQuality;
  environment?: TrubeEnvironment;
  paused?: boolean;
  cornerRadius?: number;
  debugOverlay?: boolean;
}

export function TrubeCanvas({
  score,
  surface: surfaceProp,
  style,
  quality = 'auto',
  environment: environmentProp,
  paused = false,
  cornerRadius = 0,
  debugOverlay = false,
}: TrubeCanvasProps) {
  const { environment: globalEnv } = useTrubeEnvironment();
  const environment = React.useMemo(
    () => ({
      ...globalEnv,
      ...environmentProp,
    }),
    [globalEnv, environmentProp],
  );

  const [bounds, setBounds] = React.useState({ width: 0, height: 0 });

  const stageSpec = React.useMemo(() => {
    if (score) {
      const { getScorePreset } = require('../core/scores');
      return getScorePreset(score).stage;
    }
    if (surfaceProp) {
      return {
        kind: 'trube-stage' as const,
        layers: [{ surface: surfaceProp, role: 'body' as const }],
      };
    }
    return null;
  }, [score, surfaceProp]);

  // For backward compatibility and single-surface legacy path
  const resolvedSurface = React.useMemo(() => {
    if (surfaceProp) return resolveSurface(surfaceProp);
    if (stageSpec && stageSpec.layers.length > 0) {
      return resolveSurface(stageSpec.layers[0].surface);
    }
    return null;
  }, [surfaceProp, stageSpec]);

  const basePlan = React.useMemo(() => {
    const input = surfaceProp || stageSpec?.layers[0]?.surface;
    if (!input) return null;
    return createRenderPlan(input, quality, environment);
  }, [
    environment?.capabilityTier,
    environment?.lowPowerMode,
    environment?.pixelRatio,
    environment?.prefersReducedMotion,
    environment?.thermalState,
    quality,
    surfaceProp,
    stageSpec,
    environment,
  ]);

  const plan = React.useMemo(() => {
    if (!basePlan) return null;
    return paused
      ? {
          ...basePlan,
          animationEnabled: false,
          updateIntervalMs: 0,
        }
      : basePlan;
  }, [basePlan, paused]);

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBounds((current) =>
      current.width === width && current.height === height ? current : { width, height },
    );
  }, []);

  const { status: prewarmStatus } = require('../core/useGPUPrewarm').useGPUPrewarm();

  return (
    <View
      onLayout={handleLayout}
      pointerEvents="none"
      style={[
        {
          overflow: 'hidden',
          borderRadius: cornerRadius,
          backgroundColor: '#000', // Solid floor
        },
        style,
      ]}
    >
      {bounds.width > 0 &&
        bounds.height > 0 &&
        stageSpec &&
        plan &&
        prewarmStatus !== 'warming' && (
          <>
            <UnifiedRenderer
              height={bounds.height}
              plan={plan}
              stage={stageSpec}
              surface={resolvedSurface!}
              width={bounds.width}
            />
            {debugOverlay && (
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {/* Performance Metrics Placeholder */}
              </View>
            )}
          </>
        )}
    </View>
  );
}
