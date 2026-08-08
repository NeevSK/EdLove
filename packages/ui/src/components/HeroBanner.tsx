import type React from 'react';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Box, HStack, VStack } from '@repo/ui/gluestack';
import { Theme } from '@repo/ui/theme/Theme';

export interface HeroBannerProps {
  title: string;
  subtitle?: string;
  imageUri: string;
  onPress?: () => void;
  badge?: string;
}

const { width: screenWidth } = Dimensions.get('window');

const NETFLIX_TOKENS = {
  canvas: '#000000',
  surface: '#141414',
  surfaceElevated: '#232323',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  accent: '#E50914',
} as const;

export function HeroBanner({
  title,
  subtitle,
  imageUri,
  onPress,
  badge,
}: HeroBannerProps) {
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
        style={{ flex: 1 }}
      >
        <Image
          source={{ uri: imageUri }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: screenWidth,
            height: 280,
            resizeMode: 'cover',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: Theme.spacing.lg,
            paddingVertical: Theme.spacing.xl,
          }}
        >
          {badge && (
            <Box
              className="bg-phase-danger px-3 py-1 rounded mb-2 self-start"
              style={{ backgroundColor: NETFLIX_TOKENS.accent }}
            >
              <Text className="text-white font-bold text-xs">{badge}</Text>
            </Box>
          )}
          <Text
            className="text-white font-bold"
            style={{
              fontSize: 28,
              lineHeight: 36,
              color: NETFLIX_TOKENS.textPrimary,
              textShadowColor: 'rgba(0,0,0,0.8)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className="text-white mt-1"
              style={{
                fontSize: 14,
                color: NETFLIX_TOKENS.textSecondary,
                textShadowColor: 'rgba(0,0,0,0.8)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}