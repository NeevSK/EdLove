import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { Heart, Megaphone, Sparkles, Users } from '@repo/ui/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, useWindowDimensions, View, Text, Pressable } from 'react-native';

import type { CommunityPost as Post } from '@repo/core/types/Community';
import type { SanctuaryManifesto } from '@repo/core/types/Growth';

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
  const flashListRef = useRef<FlashListRef<SanctuaryManifesto>>(null);
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

  const Separator = React.useCallback(() => <View className="w-4" />, []);

  // Responsive card width
  const CARD_WIDTH = Platform.OS === 'web' ? Math.min(windowWidth - 120, 700) : windowWidth * 0.85;

  const SNAP_INTERVAL = CARD_WIDTH + 16;

  useEffect(() => {
    if (!manifestos?.length) return;
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % manifestos.length;
      flashListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, AUTO_SWIPE_INTERVAL);
    return () => clearInterval(interval);
  }, [activeIndex, manifestos?.length, manifestos]);

  const renderManifesto = ({ item }: { item: SanctuaryManifesto }) => (
    <View
      className="p-6 rounded-3xl min-h-[180px] border border-white/10"
      style={{ width: CARD_WIDTH }}
    >
      <View className="gap-4">
        <View className="flex-row items-center items-center gap-2">
          <Sparkles size={12} className="text-phase-interactive" />
          <Text className="font-bold text-phase-interactive uppercase tracking-wider text-[10px]">
            {t('community.manifestoTopic') || 'Community Manifesto'}
          </Text>
        </View>

        <View className="gap-1">
          <Text className="text-lg font-bold text-ink">{item.title}</Text>
          <Text className="text-sm text-ink/60 leading-relaxed" numberOfLines={3}>
            {item.content}
          </Text>
        </View>

        <View className="flex-row items-center justify-between items-center mt-2">
          <View className="flex-row items-center items-center gap-1.5">
            <Users size={12} className="text-ink/40" />
            <Text className="text-xs text-ink/40 font-medium">
              {item.endorsement_count || 0} {t('community.endorsers') || 'Endorsers'}
            </Text>
          </View>

          <Pressable
            accessibilityLabel={t('community.endorse') || 'Endorse Manifesto'}
            accessibilityRole="button"
            onPress={() => handleEndorse(item.id)}
            className="flex-row items-center bg-phase-interactive px-4 py-2.5 rounded-2xl active:opacity-80 shadow-sm"
          >
            <Heart size={16} className="text-white fill-white" />
            <Text className="text-xs font-bold text-white ml-2">
              {t('community.endorse') || 'Endorse'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View className="py-6">
      <View className="gap-6">
        <View className="flex-row items-center justify-between items-center px-6">
          <View className="gap-0.5">
            <Text className="text-2xl font-bold text-ink">
              {t('community.hearthTitle', 'The Hearth')}
            </Text>
            <Text className="text-xs text-ink/60">
              {t('community.hearthSubtitle', 'Where the community pulse beats strongest')}
            </Text>
          </View>
          <View className="bg-phase-interactive/10 px-3.5 py-1.5 rounded-full border border-phase-interactive/20">
            <Text className="text-[10px] font-bold text-phase-interactive tracking-widest">
              {userVibe.toUpperCase()}
            </Text>
          </View>
        </View>

        <FlashList
          ref={flashListRef}
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
          <View className="px-6 mt-2">
            <Pressable
              accessibilityLabel={t('community.viewSpotlight') || 'View Spotlight Post'}
              accessibilityRole="button"
              onPress={handleSpotlightPress}
            >
              <View className="p-5 rounded-3xl border-l-4 border-l-phase-interactive border border-border">
                <View className="flex-row items-center items-center gap-4">
                  <View className="w-12 h-12 rounded-2xl bg-phase-interactive/10 items-center justify-center">
                    <Megaphone size={20} className="text-phase-interactive" />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-[10px] font-bold text-phase-interactive uppercase tracking-[2px]">
                      {t('community.spotlight') || 'SPOTLIGHT'}
                    </Text>
                    <Text
                      className="text-sm font-semibold text-ink leading-tight"
                      numberOfLines={2}
                    >
                      {spotlightPost.content}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
