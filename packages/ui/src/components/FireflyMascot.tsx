import { trackEvent } from '@repo/core/monitoring';
import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import { tokens } from '@repo/ui/tokens';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import type { MascotArtworkSource } from './Mascot';
import { MascotPod, type MascotPodVariant } from './MascotPod';
import {
  type MascotMode,
  type MascotRole,
  type MascotState,
  type MascotTheme,
  stateFromMascotMode,
} from './mascotTypes';

export interface FireflyMascotProps {
  size?: number;
  mode?: MascotMode;
  glowColor?: string;
  role?: MascotRole;
  state?: MascotState;
  theme?: MascotTheme;
  artwork?: MascotArtworkSource;
  podVariant?: MascotPodVariant;
}

/**
 * Compact Firefly used where a full feedback scene would crowd the interface.
 * Its broad light and simple silhouette remain legible at 18px in an action.
 */
export function FireflyMascot({
  size = 120,
  mode = 'glowing',
  glowColor: glowColorOverride,
  role = 'guide',
  state,
  theme = 'light',
  artwork,
  podVariant,
}: FireflyMascotProps) {
  const visualCapabilities = useVisualCapabilities();
  const [artworkFailed, setArtworkFailed] = useState(false);

  useEffect(() => {
    setArtworkFailed(false);
  }, [artwork?.source]);

  useEffect(() => {
    if (!artworkFailed || !artwork) return;
    trackEvent('mascot_asset_decode_failed', {
      mascot_id: 'firefly',
      state: state ?? stateFromMascotMode(mode),
    });
  }, [artwork, artworkFailed, mode, state]);

  const resolvedState = state ?? stateFromMascotMode(mode);
  const isInterrupted = resolvedState === 'interrupted';
  const roleColor = {
    guide: tokens.colors.primary,
    student: tokens.colors.accentAtmospheric,
    teacher: tokens.colors.accentDepth,
    guardian: tokens.colors.warning,
    host: tokens.colors.accentLiving,
    librarian: tokens.colors.loading,
  }[role];
  const glowColor = glowColorOverride ?? (isInterrupted ? tokens.colors.warning : roleColor);

  const isMicroSize = size < 48;

  const innerContent =
    artwork && !artworkFailed && !isMicroSize ? (
      <View
        style={[
          styles.container,
          {
            height: size,
            width: size,
          },
        ]}
      >
        <Image
          allowDownscaling
          accessibilityLabel={artwork.accessibilityLabel}
          cachePolicy={visualCapabilities.imageCachePolicy}
          contentFit="contain"
          decodeFormat={
            Platform.OS === 'android' ? visualCapabilities.imageDecodeFormat : undefined
          }
          source={artwork.source as any}
          style={{ height: size, width: size }}
          transition={0}
          onError={() => setArtworkFailed(true)}
        />
      </View>
    ) : (
      <View
        testID="firefly-mascot-svg-fallback"
        style={[styles.container, { height: size, width: size }]}
      >
        <Svg height={size} viewBox="0 0 240 260" width={size}>
          <Defs>
            <RadialGradient cx="50%" cy="50%" id="fireflyHalo" r="50%">
              <Stop offset="0" stopColor={glowColor} stopOpacity="0.32" />
              <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient cx="50%" cy="50%" id="fireflyCore" r="50%">
              <Stop offset="0" stopColor={tokens.colors.surface} stopOpacity="0.95" />
              <Stop offset="0.4" stopColor={glowColor} stopOpacity="0.8" />
              <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          {visualCapabilities.allowAmbientEffects ? (
            <Circle
              testID="firefly-mascot-halo"
              cx="120"
              cy="130"
              fill="url(#fireflyHalo)"
              r="106"
            />
          ) : null}
          <Circle cx="120" cy="130" fill="url(#fireflyCore)" r="52" />
          <Circle cx="120" cy="130" fill={glowColor} opacity={isInterrupted ? 0.35 : 0.88} r="18" />
          <Circle cx="120" cy="130" fill={tokens.colors.surface} opacity={0.9} r="8" />
        </Svg>
      </View>
    );

  const effectivePodVariant = podVariant ?? (artwork && !isMicroSize ? 'halo' : undefined);

  if (effectivePodVariant) {
    return (
      <MascotPod glowColor={glowColor} size={size} variant={effectivePodVariant}>
        {innerContent}
      </MascotPod>
    );
  }

  return innerContent;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
