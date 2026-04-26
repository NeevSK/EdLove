import { useNavigation, useRoute } from '@react-navigation/native';
import { useStore } from '@repo/core';
import {
  Box,
  HStack,
  Icon,
  Pressable,
  ScreenWrapper,
  ScrollView,
  Text,
  Theme,
  useThemedColors,
  VStack,
} from '@repo/ui';
import { ArrowLeft } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { LibraryThumbnailCard } from '../components/LibraryThumbnailCard';
import { useCollection } from '../hooks/useLibrary';
import type { LibraryResource } from '../types';

export default function CollectionDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const colors = useThemedColors();
  const { user } = useStore();
  const { id } = route?.params || {};

  const { collection, isLoading, error, refetch } = useCollection(id, user?.id);

  const handleOpenResource = useCallback(
    (resource: LibraryResource) => {
      navigation.navigate('ResourceHub', { resourceId: resource.id });
    },
    [navigation],
  );

  const getYoutubeThumbnail = (url?: string) => {
    if (!url) return undefined;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/,
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : undefined;
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center">
          <Text className="text-phaseText-secondary">Loading collection...</Text>
        </Box>
      </ScreenWrapper>
    );
  }

  if (error || !collection) {
    return (
      <ScreenWrapper>
        <VStack className="flex-1 items-center justify-center p-lg gap-3">
          <Text className="text-xl font-extrabold text-phaseText-primary">
            Collection unavailable
          </Text>
          <Text className="text-center text-phaseText-secondary">
            {String(error || 'We could not load this collection right now.')}
          </Text>
          <HStack className="gap-2.5 mt-2">
            <Pressable
              onPress={() => navigation.goBack()}
              className="h-10 px-6 rounded-xl border border-phase-border bg-phase-interactive/5 items-center justify-center"
            >
              <Text className="font-bold text-phaseText-primary">Back</Text>
            </Pressable>
            <Pressable
              onPress={() => refetch()}
              className="h-10 px-6 rounded-xl bg-phase-accent items-center justify-center"
            >
              <Text className="font-bold text-white">Retry</Text>
            </Pressable>
          </HStack>
        </VStack>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll={false}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <Box className="px-md pt-md">
          <Pressable
            onPress={() => navigation.goBack()}
            className="flex-row items-center gap-2 px-3.5 py-2.5 rounded-xl border border-phase-border bg-phase-surface/50 self-start"
          >
            <Icon as={ArrowLeft} size={16} color={colors.textPrimary} />
            <Text className="text-[13px] font-bold text-phaseText-primary">Back to Library</Text>
          </Pressable>
        </Box>

        <Box className="px-md pt-md">
          <Box className="p-lg rounded-[24px] bg-phase-surface border border-phase-border mb-lg shadow-sm">
            <Text className="text-[26px] font-extrabold text-phaseText-primary mb-2">
              {collection.name}
            </Text>
            <Text className="text-sm leading-6 text-phaseText-secondary mb-3">
              {collection.description || 'Curated resources gathered into one place.'}
            </Text>
            <Text className="text-[12px] text-phaseText-secondary">
              {collection.resources.length} resources
              {collection.creator_name ? ` • Curated by ${collection.creator_name}` : ''}
            </Text>
          </Box>

          <VStack className="gap-3.5">
            {collection.resources.map((resource) => (
              <LibraryThumbnailCard
                key={resource.id}
                title={resource.title}
                type={resource.type}
                subject={resource.subjects?.[0] || 'General'}
                thumbnailUrl={
                  resource.media?.url ||
                  resource.thumbnail_url ||
                  (resource.type === 'video' || resource.type === 'movie_trailer'
                    ? getYoutubeThumbnail(resource.url)
                    : undefined)
                }
                endorsements={resource.endorsements}
                verified={resource.verified}
                onPress={() => handleOpenResource(resource)}
              />
            ))}
          </VStack>
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}
