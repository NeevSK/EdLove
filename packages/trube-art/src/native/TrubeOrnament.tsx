import React from 'react';
import { Canvas, Circle, Line, vec, Group } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { useTrubeTime } from '../core/soul/TimeLayer';
import type { StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';
import { View } from 'react-native';

import type { TrubeOrnamentSpec } from '../core/ornament';
import { resolveOrnament } from '../core/ornament';

export interface TrubeOrnamentProps {
  ornament: TrubeOrnamentSpec;
  color: string;
  style?: StyleProp<ViewStyle>;
  cornerRadius?: number;
}

export function TrubeOrnament({
  ornament,
  color,
  style,
  cornerRadius = 0,
}: TrubeOrnamentProps) {
  const [bounds, setBounds] = React.useState({ width: 0, height: 0 });
  const resolved = React.useMemo(() => resolveOrnament(ornament), [ornament]);
  const { entropy } = useTrubeTime('skymorphic', true);

  const driftX = useDerivedValue(() => Math.sin(entropy.value * 1.8) * 4.0);
  const driftY = useDerivedValue(() => Math.cos(entropy.value * 1.2) * 4.0);
  const breathingOpacity = useDerivedValue(() => 0.75 + 0.25 * Math.sin(entropy.value * 3.0));

  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBounds((current) =      current.width === width && current.height === height ? current : { width, height },
    );
  }, []);

  return (
    <View
      onLayout={onLayout}
      pointerEvents="none"
      style={[
        {
          overflow: 'hidden',
          borderRadius: cornerRadius,
        },
        style,
      ]}
          {bounds.width > 0 && bounds.height > 0 ? (
        <Canvas style={{ flex: 1 }}          <Group 
            opacity={breathingOpacity}
            transform={[{ translateX: driftX as any }, { translateY: driftY as any }]}
                      {resolved.edges.map((edge, index) => {
              const from = resolved.nodes[edge.from];
              const to = resolved.nodes[edge.to];
              if (!from || !to) {
                return null;
              }

              return (
                <Line
                  key={`edge-${index}`}
                  color={color}
                  opacity={edge.alpha}
                  p1={vec(from.x * bounds.width, from.y * bounds.height)}
                  p2={vec(to.x * bounds.width, to.y * bounds.height)}
                  strokeWidth={edge.width}
                /              );
            })}
            {resolved.nodes.map((node, index) => (
              <Circle
                key={`node-${index}`}
                color={color}
                cx={node.x * bounds.width}
                cy={node.y * bounds.height}
                opacity={node.alpha}
                r={node.r}
              /            ))}
          </Group        </Canvas      ) : null}
    </View  );
}
