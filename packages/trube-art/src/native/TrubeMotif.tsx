import { Canvas, Group, Path, Skia } from '@shopify/react-native-skia';
import React from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import type { TrubeMotifSpec } from '../core/motif';
import { resolveMotif } from '../core/motif';
import { useTrubeTime } from '../core/soul/TimeLayer';

export interface TrubeMotifProps {
  motif: TrubeMotifSpec;
  color: string;
  style?: StyleProp<ViewStyle>;
  cornerRadius?: number;
}

export function TrubeMotif({ motif, color, style, cornerRadius = 0 }: TrubeMotifProps) {
  const [bounds, setBounds] = React.useState({ width: 0, height: 0 });
  const resolved = React.useMemo(() => resolveMotif(motif), [motif]);
  const { entropy } = useTrubeTime('silk', true); // Use silk-rate for motif breathing

  const breathingOpacity = useDerivedValue(() => {
    // Subtle breathing: oscillate between 0.7 and 1.0 based on entropy
    return 0.85 + 0.15 * Math.sin(entropy.value * 5.0);
  }, [entropy]);

  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBounds(
      (current =
        current.width === width && current.height === height ? current : { width, height }),
    );
  }, []);

  const scale = React.useMemo(
    () => Math.min(bounds.width, bounds.height) / 100,
    [bounds.height, bounds.width],
  );
  const translateX = React.useMemo(() => (bounds.width - scale * 100) / 2, [bounds.width, scale]);
  const translateY = React.useMemo(() => (bounds.height - scale * 100) / 2, [bounds.height, scale]);

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
        <Canvas style={{ flex: 1 }}          <Group opacity={breathingOpacity}            {resolved.strokes.map((stroke, index) => {
              const path = Skia.Path.MakeFromSVGString(stroke.svg);
              if (!path) {
                return null;
              }

              return (
                <Path
                  key={`motif-stroke-${index}`}
                  color={color}
                  opacity={stroke.alpha}
                  path={path}
                  style="stroke"
                  strokeCap="round"
                  strokeJoin="round"
                  strokeWidth={stroke.width}
                  transform={[{ translateX }, { translateY }, { scale }]}
                /              );
            })}
          </Group        </Canvas      ) : null}
    </View  );
}
