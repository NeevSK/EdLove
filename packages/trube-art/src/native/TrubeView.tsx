import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import type {
  TrubeEnvironment,
  TrubeQuality,
  TrubeSurfaceName,
  TrubeSurfaceSpec,
} from '@repo/trube-art/core/types';
import { TrubeCanvas } from '@repo/trube-art/native/TrubeCanvas';

export interface TrubeViewProps {
  surface: TrubeSurfaceSpec | TrubeSurfaceName;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  quality?: TrubeQuality;
  environment?: TrubeEnvironment;
  paused?: boolean;
  cornerRadius?: number;
  children?: React.ReactNode;
}

export function TrubeView({
  surface,
  style,
  contentStyle,
  quality = 'auto',
  environment,
  paused = false,
  cornerRadius = 0,
  children,
}: TrubeViewProps) {
  return (
    <View
      style={[
        {
          overflow: 'hidden',
          borderRadius: cornerRadius,
        },
        style,
      ]}
    >
      <TrubeCanvas
        cornerRadius={cornerRadius}
        environment={environment}
        paused={paused}
        quality={quality}
        style={StyleSheet.absoluteFill}
        surface={surface}
      />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
