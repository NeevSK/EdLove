import type { LibraryResource } from '@repo/library/types';
import { Play } from '@repo/ui/icons';
import {
  Box,
  HStack,
  Icon,
  ImageBackground,
  LinearGradient,
  Pressable,
  Text,
  useTheme,
} from '@repo/ui/primitives';
import { memo, useCallback } from 'react';

export type HeroBannerProps = Readonly<{
  resource: LibraryResource;
  onPress: (resource: LibraryResource) => void;
}>;

export const HeroBanner = memo(({ resource, onPress }: HeroBannerProps) => {
  const theme = useTheme();
  const handlePress = useCallback(() => {
    onPress(resource);
  }, [resource, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Featured resource: ${resource.title}`}
      accessibilityHint="Opens the featured resource"
    >
      <Box className="h-[240px] overflow-hidden bg-phase-surface/50 mb-md mx-md rounded-3xl border border-phase-border">
        {resource.media?.url ? (
          <ImageBackground
            source={{ uri: resource.media.url as string }}
            className="flex-1"
            resizeMode="cover"
          >
            <HeroOverlay resource={resource} theme={theme} />
          </ImageBackground>
        ) : (
          <Box className="flex-1">
            <LinearGradient
              colors={[`${theme.accent.action}18`, `${theme.accent.reward}16`]}
              className="flex-1"
            />
            <HeroOverlay resource={resource} theme={theme} />
          </Box>
        )}
      </Box>
    </Pressable>
  );
});

HeroBanner.displayName = 'HeroBanner';

export function HeroOverlay({ resource, theme }: { resource: LibraryResource; theme: any }) {
  return (
    <Box className="absolute inset-0 justify-end p-6">
      <LinearGradient
        colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.1)', 'rgba(252,249,242,0.94)']}
        className="absolute inset-0"
      />
      <Box className="bg-[#FCF9F2]/90 rounded-[20px] p-5 border border-white/50">
        <Box
          className="self-start px-2 py-1 rounded-full mb-2"
          style={{ backgroundColor: `${theme.accent.action}18` }}
        >
          <Text
            className="text-[10px] font-extrabold tracking-widest"
            style={{ color: theme.accent.action }}
          >
            ✧ FEATURED
          </Text>
        </Box>
        <Text className="text-[22px] font-extrabold leading-7 mb-1.5 text-phaseText-primary">
          {resource.title}
        </Text>
        {resource.description && (
          <Text
            className="text-[13px] leading-[18px] mb-3 text-phaseText-secondary"
            numberOfLines={3}
          >
            {resource.description}
          </Text>
        )}
        <HStack className="items-center gap-2.5">
          <Box
            className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl"
            style={{ backgroundColor: theme.accent.action }}
          >
            <Icon as={Play} size={14} color="white" fill="white" />
            <Text className="text-white font-bold text-[13px]">Open</Text>
          </Box>
          {resource.creator_name ? (
            <Text className="text-[12px] text-phaseText-secondary font-semibold">
              Curated by {resource.creator_name}
            </Text>
          ) : null}
        </HStack>
      </Box>
    </Box>
  );
}
