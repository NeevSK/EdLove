import { useStore } from '@repo/core/logic';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import { WebScreenHeader } from '@repo/ui/components/WebScreenHeader.web';
import { ArrowLeft, Library, RefreshCw } from '@repo/ui/icons';
import { ActivityIndicator, Box, HStack, Text, useTheme, VStack } from '@repo/ui/primitives';
import { openExternalURL, showExternalLinkOptions } from '@repo/ui/utils';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LibraryThumbnailCard } from '@repo/library/components/LibraryThumbnailCard';
import { useCollection } from '@repo/library/hooks/useLibrary';
import type { LibraryResource } from '@repo/library/types';
import { buildLibraryExternalLinkOptions } from '@repo/library/utils/externalLinks';

function LoadingState() {
  return (
    <Box className="flex-1 items-center justify-center p-20 bg-phase-surface">
      <VStack className="items-center gap-4">
        <ActivityIndicator size="large" />
        <Text className="text-phaseText-tertiary animate-pulse font-medium">
          Restoring collection...
        </Text>
      </VStack>
    </Box>
  );
}

/**
 * CollectionDetailScreenWeb  Web-optimized view for library collections.
 *
 * Sanctuary V3: Migrated to className utilities and standardized @repo/ui primitives.
 * Uses responsive grid for resource cards.
 */
export default function CollectionDetailScreenWeb() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user } = useStore();
  const theme = useTheme();
  const { t } = useTranslation();

  const { collection, isLoading, error, refetch } = useCollection(id, user?.id);

  const handleOpenResource = useCallback(
    (resource: LibraryResource) => {
      if (!resource.url) return;
      if (resource.type === 'pdf') {
        router.push({
          pathname: '/library/document/[resourceId]',
          params: {
            resourceId: resource.id,
            title: resource.title,
            url: resource.url,
            creator: resource.creator_name ?? '',
          },
        });
        return;
      }
      if (resource.type === 'video' || resource.type === 'movie_trailer') {
        router.push({
          pathname: '/library/video/[resourceId]',
          params: {
            resourceId: resource.id,
            title: resource.title,
            url: resource.url,
            creator: resource.creator_name ?? '',
          },
        });
        return;
      }
      openExternalURL(resource.url, buildLibraryExternalLinkOptions(resource, 'Collection')).catch(
        (err: any) => console.error("Couldn't load page", err),
      );
    },
    [router],
  );

  const handleOpenResourceOptions = useCallback((resource: LibraryResource) => {
    if (
      !resource.url ||
      resource.type === 'pdf' ||
      resource.type === 'video' ||
      resource.type === 'movie_trailer'
    ) {
      return;
    }

    showExternalLinkOptions(
      resource.url,
      buildLibraryExternalLinkOptions(resource, 'Collection'),
    ).catch((err: any) => console.error("Couldn't show external link options", err));
  }, []);

  const _getYoutubeThumbnail = (url?: string) => {
    if (!url) return undefined;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/,
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : undefined;
  };

  const renderResource = useCallback(
    ({ item }: { item: LibraryResource }) => (
      <Box className="p-3">
        <LibraryThumbnailCard
          resource={item}
          onPress={handleOpenResource}
          onLongPress={handleOpenResourceOptions}
        />
      </Box>
    ),
    [handleOpenResource, handleOpenResourceOptions],
  );

  if (isLoading || !id) return <LoadingState />;

  if (error || !collection) {
    return (
      <Box className="flex-1 bg-phase-surface items-center justify-center p-10">
        <VStack className="max-w-md w-full p-10 rounded-[32px] bg-white/5 border border-white/10 items-center gap-6">
          <Box className="w-16 h-16 rounded-2xl bg-phase-accent/20 items-center justify-center">
            <Library size={32} color={theme.accent.action} />
          </Box>
          <VStack className="items-center gap-2">
            <Text className="text-xl font-bold text-phaseText-primary text-center">
              {error ? t('library.errorLoading') : t('library.emptyTitle')}
            </Text>
            <Text className="text-md text-phaseText-secondary text-center leading-6">
              {error ? String(error) : t('library.emptyDesc')}
            </Text>
          </VStack>
          <HStack className="gap-3 w-full">
            <SanctuaryButton
              variant="outline"
              onPress={() => safeBack('/library')}
              leftIcon={ArrowLeft}
              className="flex-1"
            >
              {t('library.goBack')}
            </SanctuaryButton>
            <SanctuaryButton onPress={() => refetch()} leftIcon={RefreshCw} className="flex-1">
              {t('library.retry') || 'Retry'}
            </SanctuaryButton>
          </HStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-phase-surface">
      <VStack className="max-w-screen-xl mx-auto w-full px-6 py-8">
        <WebScreenHeader
          title={collection.name}
          note={
            collection.is_virtual ? t('library.dynamicCollection') : t('library.curatedCollection')
          }
          actions={
            <SanctuaryButton
              variant="ghost"
              onPress={() => safeBack('/library')}
              leftIcon={ArrowLeft}
              size="sm"
            >
              {t('library.backToLibrary')}
            </SanctuaryButton>
          }
        />

        <Box className="mt-8 mb-10 p-8 rounded-3xl bg-white/5 border border-white/5">
          <Text className="text-lg text-phaseText-primary leading-8 mb-6 font-medium">
            {collection.description || t('library.noDescription')}
          </Text>
          <HStack className="items-center gap-6">
            <Box className="px-4 py-1.5 rounded-full bg-phase-accent/10 border border-phase-accent/20">
              <Text className="text-xs font-black text-phase-accent uppercase tracking-wider">
                {t('library.resourcesCount', {
                  count: collection.resources.length,
                })}
              </Text>
            </Box>
            {collection.creator_name && (
              <HStack className="gap-1.5 items-center">
                <Text className="text-sm text-phaseText-tertiary">{t('library.curatedBy')}</Text>
                <Text className="text-sm font-bold text-phaseText-secondary">
                  {collection.creator_name}
                </Text>
              </HStack>
            )}
            <Box className="w-1 h-1 rounded-full bg-white/20" />
            <Text className="text-sm text-phaseText-tertiary">
              {collection.is_virtual ? t('library.dynamic') : t('library.collection')}
            </Text>
          </HStack>
        </Box>

        <SanctuaryFlashList
          data={collection.resources}
          renderItem={renderResource}
          keyExtractor={(item: LibraryResource) => item.id}
          numColumns={4}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <Box className="py-20 items-center">
              <Text className="text-phaseText-muted italic">{t('library.emptyCollection')}</Text>
            </Box>
          }
        />
      </VStack>
    </Box>
  );
}
