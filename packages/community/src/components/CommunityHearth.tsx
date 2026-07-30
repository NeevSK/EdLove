import { GlassCard } from '@repo/ui/components/GlassCard';
import { Heart, Megaphone, Sparkles, Users } from '@repo/ui/icons';
import { Box, FlatList, Heading, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, useWindowDimensions } from 'react-native';

import type { CommunityPost as Post, SanctuaryManifesto } from '@community/types/Community';

interface CommunityHearthProps {
  manifestos?: SanctuaryManifesto[];
  spotlightPost?: Post;
  userVibe?: string;
  userId: string;
  onEndorseManifesto?: (id: string) => void;
  onPressSpotlight?: (id: string) => void;
}

const AUTO_SWIPE_INTERVAL = 8000;

export default function CommunityHearth({
  manifestos = [],
  spotlightPost,
  userVibe = 'active',
  onEndorseManifesto,
  onPressSpotlight,
}: CommunityHearthProps) {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleEndorse = React.useCallback(
    (id: string) => {
      onEndorseManifesto?.(id);
    },
    [onEndorseManifesto],
  );

  const handleSpotlightPress = React.useCallback(() => {
    if (spotlightPost) {
      onPressSpotlight?.(spotlightPost.id);
    }
  }, [onPressSpotlight, spotlightPost]);

  const Separator = React.useCallback(() => <Box className="w-4" />, []);

  // Responsive card width
  const CARD_WIDTH = Platform.OS === 'web' ? Math.min(windowWidth - 120, 700) : windowWidth * 0.85;

  const SNAP_INTERVAL = CARD_WIDTH + 16;

  useEffect(() => {
    if (!manifestos?.length) return;
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % manifestos.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, AUTO_SWIPE_INTERVAL);
    return () => clearInterval(interval);
  }, [activeIndex, manifestos?.length, manifestos]);

  const renderManifesto = ({ item }: { item: SanctuaryManifesto }) => (
    <GlassCard
      className="p-6 rounded-3xl min-h-[180px] border border-white/10"
      style={{ width: CARD_WIDTH }}
    >
      <VStack className="gap-4">
        <HStack className="items-center gap-2">
          <Icon as={Sparkles} size="xs" className="text-phase-interactive" />
          <Text className="font-bold text-phase-interactive uppercase tracking-wider text-[10px]">
            {t('community.manifestoTopic') || 'Community Manifesto'}
          </Text>
        </HStack>

        <VStack className="gap-1">
          <Heading className="text-lg font-bold text-ink">{item.title}</Heading>
          <Text className="text-sm text-ink/60 leading-relaxed" numberOfLines={3}>
            {item.content}
          </Text>
        </VStack>

        <HStack className="justify-between items-center mt-2">
          <HStack className="items-center gap-1.5">
            <Icon as={Users} size="xs" className="text-ink/40" />
            <Text className="text-xs text-ink/40 font-medium">
              {item.endorsement_count || 0} {t('community.endorsers') || 'Endorsers'}
            </Text>
          </HStack>

          <Pressable
            accessibilityLabel={t('community.endorse') || 'Endorse Manifesto'}
            accessibilityRole="button"
            onPress={() => handleEndorse(item.id)}
            className="flex-row items-center bg-phase-interactive px-4 py-2.5 rounded-2xl active:opacity-80 shadow-sm"
          >
            <Icon as={Heart} size="sm" className="text-white fill-white" />
            <Text className="text-xs font-bold text-white ml-2">
              {t('community.endorse') || 'Endorse'}
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    </GlassCard>
  );

  return (
    <Box className="py-6">
      <VStack className="gap-6">
        <HStack className="justify-between items-center px-6">
          <VStack className="gap-0.5">
            <Heading className="text-2xl font-bold text-ink">
              {t('community.hearthTitle') || 'The Hearth'}
            </Heading>
            <Text className="text-xs text-ink/60">
              {t('community.hearthSubtitle') || 'Where the community pulse beats strongest'}
            </Text>
          </VStack>
          <Box className="bg-phase-interactive/10 px-3.5 py-1.5 rounded-full border border-phase-interactive/20">
            <Text className="text-[10px] font-bold text-phase-interactive tracking-widest">
              {userVibe.toUpperCase()}
            </Text>
          </Box>
        </HStack>

        <FlatList
          ref={flatListRef}
          data={manifestos}
          renderItem={renderManifesto}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP_INTERVAL}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20 }}
          ItemSeparatorComponent={Separator}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
            setActiveIndex(index);
          }}
          accessibilityLabel={t('community.manifestoCarousel') || 'Community Manifestos'}
        />

        {spotlightPost && (
          <Box className="px-6 mt-2">
            <Pressable
              accessibilityLabel={t('community.viewSpotlight') || 'View Spotlight Post'}
              accessibilityRole="button"
              onPress={handleSpotlightPress}
            >
              <GlassCard className="p-5 rounded-3xl border-l-4 border-l-phase-interactive border border-border">
                <HStack className="items-center gap-4">
                  <Box className="w-12 h-12 rounded-2xl bg-phase-interactive/10 items-center justify-center">
                    <Icon as={Megaphone} size="md" className="text-phase-interactive" />
                  </Box>
                  <VStack className="flex-1 gap-0.5">
                    <Text className="text-[10px] font-bold text-phase-interactive uppercase tracking-[2px]">
                      {t('community.spotlight') || 'SPOTLIGHT'}
                    </Text>
                    <Text
                      className="text-sm font-semibold text-ink leading-tight"
                      numberOfLines={2}
                    >
                      {spotlightPost.content}
                    </Text>
                  </VStack>
                </HStack>
              </GlassCard>
            </Pressable>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
