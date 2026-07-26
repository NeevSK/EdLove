import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import type { TrubeEnvironment, TrubeStageSpec } from '@/core/types';
import { TrubeCanvas } from '@/native/TrubeCanvas';

export interface TrubeStageProps {
  stage: TrubeStageSpec;
  style?: StyleProp<ViewStyle>;
  environment?: TrubeEnvironment;
  paused?: boolean;
  cornerRadius?: number;
}

function resolveLayerStyle(
  role: TrubeStageSpec['layers'][number]['role'],
  opacity: number,
): ViewStyle {
  if (role === 'air') {
    return {
      opacity,
      transform: [{ scale: 1.02 }],
    };
  }

  if (role === 'shimmer') {
    return {
      opacity,
      transform: [{ scale: 1.01 }],
    };
  }

  return { opacity };
}

export function TrubeStage({
  stage,
  style,
  environment,
  paused = false,
  cornerRadius = 0,
}: TrubeStageProps) {
  return (
    <View
      style={[
        styles.host,
        stage.background ? { backgroundColor: stage.background } : null,
        cornerRadius > 0 ? { borderRadius: cornerRadius } : null,
        style,
      ]}
    >
      {stage.layers.map((layer, index) => (
        <TrubeCanvas
          key={
            layer.id ??
            `${typeof layer.surface === 'string' ? layer.surface : layer.surface.name}-${index}`
          }
          cornerRadius={cornerRadius}
          environment={environment}
          paused={paused}
          quality={layer.quality ?? 'auto'}
          style={[StyleSheet.absoluteFill, resolveLayerStyle(layer.role, layer.opacity ?? 1)]}
          surface={layer.surface}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    overflow: 'hidden',
  },
});
