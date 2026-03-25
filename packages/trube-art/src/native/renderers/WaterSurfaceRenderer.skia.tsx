import React from 'react';
import { Canvas, Rect, Skia, RuntimeShader } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';

import { driverManager } from '../DriverManager';
import type { TrubeRendererProps } from '../renderers/types';
import { useTrubeTime } from '../../core/soul/TimeLayer';

export function WaterSurfaceRendererSkia({ width, height, surface, plan }: TrubeRendererProps) {
  const skiaDriver = driverManager.getSkiaDriver();
  const effect = skiaDriver.getEffect('water-surface');
  const { time, entropy } = useTrubeTime('water-surface', plan.animationEnabled);

  if (!effect) return null;

  const uniforms = skiaDriver.buildUniforms(
    surface,
    time.value,
    entropy.value,
    width,
    height
  );

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Rect x={0} y={0} width={width} height={height}>
        <RuntimeShader source={effect} uniforms={uniforms} />
      </Rect>
    </Canvas>
  );
}
