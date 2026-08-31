import { trackEvent } from '@repo/core/monitoring';
import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import { tokens } from '@repo/ui/tokens';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
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

  const innerContent = artwork && !artworkFailed ? (
    <View
      style={[
        styles.container,
        {
          height: size,
          width: size,
          borderRadius: Math.round(size * 0.12),
          overflow: 'hidden',
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
        source={artwork.source}
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
          <RadialGradient cx="50%" cy="52%" id="fireflyHalo" r="52%">
            <Stop offset="0" stopColor={glowColor} stopOpacity="0.3" />
            <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="fireflyWing" x1="0" x2="1" y1="0" y2="1">
            <Stop offset="0" stopColor={theme === 'dark' ? tokens.colors.accentDepth : tokens.colors.surface} stopOpacity="0.96" />
            <Stop offset="1" stopColor={theme === 'dark' ? tokens.colors.accentAtmospheric : tokens.colors.border} stopOpacity="0.7" />
          </LinearGradient>
          <LinearGradient id="fireflyBody" x1="0" x2="1" y1="0" y2="1">
            <Stop offset="0" stopColor={theme === 'dark' ? tokens.colors.textInverse : tokens.colors.ink} />
            <Stop offset="1" stopColor={tokens.colors.ink} />
          </LinearGradient>
          <RadialGradient cx="50%" cy="35%" id="fireflyLight" r="70%">
            <Stop offset="0" stopColor={tokens.colors.surface} />
            <Stop offset="0.45" stopColor={glowColor} />
            <Stop offset="1" stopColor={tokens.colors.accentAtmospheric} />
          </RadialGradient>
        </Defs>
        <Ellipse cx="120" cy="223" fill={tokens.colors.ink} opacity="0.14" rx="62" ry="10" />
        {visualCapabilities.allowAmbientEffects ? (
          <Circle testID="firefly-mascot-halo" cx="120" cy="125" fill="url(#fireflyHalo)" r="106" />
        ) : null}
        <Path
          d="M108 123 C72 68 32 73 61 134 C75 160 95 158 112 143 Z"
          fill="url(#fireflyWing)"
          stroke={theme === 'dark' ? tokens.colors.accentAtmospheric : tokens.colors.border}
          strokeWidth="3"
        />
        <Path
          d="M132 123 C168 68 208 73 179 134 C165 160 145 158 128 143 Z"
          fill="url(#fireflyWing)"
          stroke={theme === 'dark' ? tokens.colors.accentAtmospheric : tokens.colors.border}
          strokeWidth="3"
        />
        <Path
          d="M108 65 Q96 36 77 42 M132 65 Q144 36 163 42"
          fill="none"
          stroke={theme === 'dark' ? tokens.colors.textInverse : tokens.colors.ink}
          strokeLinecap="round"
          strokeWidth="5"
        />
        <Circle cx="77" cy="42" fill={roleColor} r="5" />
        <Circle cx="163" cy="42" fill={roleColor} r="5" />
        <Circle cx="120" cy="85" fill="url(#fireflyBody)" r="35" />
        <Ellipse cx="120" cy="133" fill="url(#fireflyBody)" rx="31" ry="54" />
        <Path
          d="M96 127 Q120 113 144 127 L139 180 Q120 198 101 180 Z"
          fill="url(#fireflyLight)"
          opacity={isInterrupted ? 0.34 : resolvedState === 'complete' ? 0.98 : resolvedState === 'guiding' || resolvedState === 'curious' ? 0.92 : 0.68}
          stroke={tokens.colors.accentAtmospheric}
          strokeWidth="3"
        />
        <Circle cx="109" cy="82" fill={tokens.colors.textInverse} r="6" />
        <Circle cx="131" cy="82" fill={tokens.colors.textInverse} r="6" />
        <Circle cx="110" cy="83" fill={theme === 'dark' ? tokens.colors.textInverse : tokens.colors.ink} r="2.2" />
        <Circle cx="132" cy="83" fill={theme === 'dark' ? tokens.colors.textInverse : tokens.colors.ink} r="2.2" />
        <Path
          d="M111 99 Q120 106 129 99"
          fill="none"
          stroke={tokens.colors.surface}
          strokeLinecap="round"
          strokeWidth="3"
        />
        <Path
          d="M91 137 Q75 145 72 161 M149 137 Q165 145 168 161 M105 185 Q99 204 88 211 M135 185 Q141 204 152 211"
          fill="none"
          stroke={theme === 'dark' ? tokens.colors.textInverse : tokens.colors.ink}
          strokeLinecap="round"
          strokeWidth="5"
        />
        <Circle cx="78" cy="161" fill={roleColor} r="5" />
        <Circle cx="162" cy="161" fill={roleColor} r="5" />
        <Circle cx="120" cy="153" fill={glowColor} opacity={isInterrupted ? 0.34 : resolvedState === 'complete' ? 0.98 : resolvedState === 'guiding' || resolvedState === 'curious' ? 0.92 : 0.68} r="15" />
      </Svg>
    </View>
  );

  const effectivePodVariant = podVariant ?? (artwork ? 'halo' : undefined);

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
