import { Canvas, Rect, RuntimeShader } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import { useTrubeTime } from '../../core/soul/TimeLayer';
import { driverManager } from '../DriverManager';
import type { TrubeRendererProps } from '../renderers/types';

export function EveningSkyRendererSkia({ width, height, surface, plan }: TrubeRendererProps) {
  const skiaDriver = driverManager.getSkiaDriver();
  const effect = skiaDriver.getEffect('evening-sky');
  const { time, entropy } = useTrubeTime('evening-sky', plan.animationEnabled);

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
