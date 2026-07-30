import { Canvas, Rect, RuntimeShader } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import { useTrubeTime } from '@repo/trube-art/core/soul/TimeLayer';
import { driverManager } from '@repo/trube-art/native/DriverManager';
import type { TrubeRendererProps } from '@repo/trube-art/native/renderers/types';

export function WaterSurfaceRendererSkia({ width, height, surface, plan }: TrubeRendererProps) {
  const skiaDriver = driverManager.getSkiaDriver();
  const effect = skiaDriver.getEffect('water-surface');
  const { time, entropy } = useTrubeTime('water-surface', plan.animationEnabled);

  if (!effect) return null;

  const uniforms = skiaDriver.buildUniforms(surface, time.value, entropy.value, width, height);

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Rect x={0} y={0} width={width} height={height}>
        <RuntimeShader source={effect} uniforms={uniforms} />
      </Rect>
    </Canvas>
  );
}
