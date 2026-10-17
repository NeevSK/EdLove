import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import { Box } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import { tokens } from '@repo/ui/tokens';
import { Image } from 'expo-image';
import type React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export interface HeroBannerProps {
  title: string;
  subtitle?: string;
  imageUri: string;
  onPress?: () => void;
  badge?: string;
}

const NETFLIX_TOKENS = {
  canvas: '#000000',
  surface: '#141414',
  surfaceElevated: '#232323',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  accent: '#E50914',
} as const;

export function HeroBanner({ title, subtitle, imageUri, onPress, badge }: HeroBannerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const visualCapabilities = useVisualCapabilities();
  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      exiting={FadeOut.duration(400)}
      style={{
        width: screenWidth,
        height: 280,
        backgroundColor: NETFLIX_TOKENS.canvas,
      }}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={styles.pressable}
      >
        <Image
          source={{ uri: imageUri }}
          cachePolicy={visualCapabilities.imageCachePolicy}
          allowDownscaling
          decodeFormat={
            Platform.OS === 'android' ? visualCapabilities.imageDecodeFormat : undefined
          }
          contentFit="cover"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: screenWidth,
            height: 280,
          }}
        />
        <View style={styles.overlay} />
        <View style={styles.contentContainer}>
          {badge && (
            <Box
              className="bg-phase-danger px-3 py-1 rounded mb-2 self-start"
              style={styles.badge}
            >
              <Text className="text-white" style={tokens.typography.roles.label}>
                {badge}
              </Text>
            </Box>
          )}
          <Text
            className="text-white font-bold"
            style={styles.title}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className="text-white mt-1"
              style={styles.subtitle}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
  },
  badge: {
    backgroundColor: NETFLIX_TOKENS.accent,
  },
  title: {
    ...tokens.typography.roles.display,
    color: NETFLIX_TOKENS.textPrimary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...tokens.typography.roles.body,
    color: NETFLIX_TOKENS.textSecondary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
