import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useVisualCapabilities } from '../context/VisualCapabilities';
import { tokens } from '../tokens';

export type MascotPodVariant = 'halo' | 'glassPod' | 'avatar' | 'raw';

export interface MascotPodProps {
  children: ReactNode;
  variant?: MascotPodVariant;
  size?: number;
  glowColor?: string;
  style?: ViewStyle;
}

export function MascotPod({
  children,
  variant = 'halo',
  size = 120,
  glowColor = tokens.colors.primary,
  style,
}: MascotPodProps) {
  const visualCapabilities = useVisualCapabilities();

  if (variant === 'raw') {
    return <View style={[styles.container, style]}>{children}</View>;
  }

  const podRadius = size * 0.5;
  const haloSize = size * 1.4;
  const haloOffset = (haloSize - size) / 2;

  if (variant === 'avatar') {
    return (
      <View
        style={[
          styles.container,
          styles.avatarPod,
          {
            width: size,
            height: size,
            borderRadius: podRadius,
            borderColor: glowColor,
          },
          style,
        ]}
      >
        {visualCapabilities.allowAmbientEffects ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.avatarGlow,
              { borderRadius: podRadius, backgroundColor: glowColor },
            ]}
          />
        ) : null}
        {children}
      </View>
    );
  }

  if (variant === 'glassPod') {
    return (
      <View
        style={[
          styles.container,
          styles.glassPodContainer,
          {
            padding: size * 0.08,
            borderRadius: size * 0.22,
          },
          style,
        ]}
      >
        {visualCapabilities.allowAmbientEffects ? (
          <Svg
            height={haloSize}
            width={haloSize}
            style={[styles.haloSvg, { top: -haloOffset, left: -haloOffset }]}
          >
            <Defs>
              <RadialGradient id="glassPodGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={glowColor} stopOpacity="0.25" />
                <Stop offset="100%" stopColor={glowColor} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle
              cx={haloSize / 2}
              cy={haloSize / 2}
              fill="url(#glassPodGlow)"
              r={haloSize / 2}
            />
          </Svg>
        ) : null}
        {children}
      </View>
    );
  }

  // Default 'halo' variant: Soft ambient SVG halo fading raw image borders into background
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {visualCapabilities.allowAmbientEffects ? (
        <Svg
          height={haloSize}
          width={haloSize}
          style={[styles.haloSvg, { top: -haloOffset, left: -haloOffset }]}
        >
          <Defs>
            <RadialGradient id="haloBg" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={glowColor} stopOpacity="0.38" />
              <Stop offset="65%" stopColor={glowColor} stopOpacity="0.14" />
              <Stop offset="100%" stopColor={glowColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={haloSize / 2} cy={haloSize / 2} fill="url(#haloBg)" r={haloSize / 2} />
        </Svg>
      ) : null}
      <View style={[styles.contentClip, { borderRadius: Math.round(size * 0.28) }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  haloSvg: {
    position: 'absolute',
  },
  contentClip: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarPod: {
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: tokens.colors.surface,
  },
  avatarGlow: {
    opacity: 0.12,
  },
  glassPodContainer: {
    backgroundColor: tokens.colors.glass,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    shadowColor: tokens.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
