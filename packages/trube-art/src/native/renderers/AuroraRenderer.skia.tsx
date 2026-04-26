import { Canvas, Rect, RuntimeShader, Skia } from '@shopify/react-native-skia';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useTrubeTime } from '../../core/soul/TimeLayer';
import { driverManager } from '../DriverManager';
import type { TrubeRendererProps } from '../renderers/types';

export function AuroraRendererSkia({ width, height, surface, plan }: TrubeRendererProps) {
  const skiaDriver = driverManager.getSkiaDriver();
  const effect = skiaDriver.getEffect('aurora');
  const { time, entropy } = useTrubeTime('aurora', plan.animationEnabled);

  if (!effect) return null;

  const uniforms = skiaDriver.buildUniforms(surface, time.value, entropy.value, width, height);

  return (
    <Canvas style={StyleSheet.absoluteFill}      <Rect x={0} y={0} width={width} height={height}        <RuntimeShader source={effect} uniforms={uniforms} /      </Rect    </Canvas  );
}
