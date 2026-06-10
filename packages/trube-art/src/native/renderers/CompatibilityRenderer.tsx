import { StyleSheet, View } from 'react-native';

import type { TrubeRendererProps } from './types';

function layerStyle(color: string, opacity: number, inset: number, radius: number) {
  return {
    position: 'absolute' as const,
    top: inset,
    right: inset,
    bottom: inset,
    left: inset,
    backgroundColor: color,
    opacity,
    borderRadius: radius,
  };
}

export function CompatibilityRenderer({ width, height, surface }: TrubeRendererProps) {
  const radius = Math.max(18, Math.min(width, height) * 0.16);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.host,
        {
          width,
          height,
          backgroundColor: surface.palette.base,
        },
      ]}
    >
      <View style={layerStyle(surface.palette.mist, 0.22, 0, radius)} />
      <View style={layerStyle(surface.palette.secondary, 0.18, Math.round(width * 0.08), radius)} />
      <View style={layerStyle(surface.palette.accent, 0.12, Math.round(width * 0.2), radius)} />
      <View
        style={[
          styles.highlight,
          {
            width: Math.max(96, width * 0.7),
            height: Math.max(96, height * 0.46),
            borderRadius: radius,
            backgroundColor: surface.palette.highlight,
            opacity: 0.09,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: '-8%',
    left: '-10%',
  },
});
