import { coreRuntime, useStore } from '@repo/core/logic';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useThemedColors } from '@repo/ui/hooks';
import {
  ArrowLeft,
  CirclePlay,
  ExternalLink,
  Globe,
  QrCode,
  Share2,
  Sparkles,
} from '@repo/ui/icons';
import {
  Box,
  HStack,
  Pressable,
  Icon as SanctuaryIcon,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { openExternalURL } from '@repo/ui/utils';
import { safeBack } from '@repo/ui/utils/navigation';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { libraryAPI } from '@library/api/library';
import { ResourceShareQRModal } from '@library/components/ResourceShareQRModal';
import type { LibraryResource } from '@library/types';
import { buildLibraryExternalLinkOptions } from '@library/utils/externalLinks';
import {
  buildLibraryResourceShareUrl,
  buildResourceCompanionLinks,
  type ResourceCompanionLink,
} from '@library/utils/resourceLinks';

function ActionButton({
  label,
  icon,
  onPress,
  accent = false,
  textColor,
  accessibilityHint = 'Triggers action',
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  accent?: boolean;
  textColor?: string;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label || 'action'}
      accessibilityHint={accessibilityHint}
      className={`min-h-[44px] rounded-2xl border px-3.5 py-2.5 flex-row items-center justify-center gap-2 ${
        accent ? 'bg-phase-accent border-phase-accent' : 'bg-phase-surface/80 border-phase-border'
      }`}
    >
      {icon}
      {label ? (
        <Text
          className="text-[13px] font-bold"
          style={textColor ? { color: textColor } : { color: accent ? 'white' : undefined }}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

function CompanionLinkCard({
  link,
  onPress,
  textColor,
  secondaryTextColor,
}: {
  link: ResourceCompanionLink;
  onPress: (link: ResourceCompanionLink) => void;
  textColor: string;
  secondaryTextColor: string;
}) {
  const handlePress = useCallback(() => {
    onPress(link);
  }, [link, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={link.label}
      accessibilityHint={link.description}
      className="rounded-[22px] border border-phase-border bg-white dark:bg-phase-surface p-4 active:opacity-80"
    >
      <HStack className="items-center justify-between gap-3">
        <VStack className="flex-1 gap-1">
          <Text className="text-[15px] font-bold" style={{ color: textColor }}>
            {link.label}
          </Text>
          <Text className="text-[13px] leading-5" style={{ color: secondaryTextColor }}>
            {link.description}
          </Text>
        </VStack>
        <SanctuaryIcon as={ExternalLink} size={18} color={secondaryTextColor} />
      </HStack>
    </Pressable>
  );
}

function RelatedResourceCard({
  item,
  onPress,
}: {
  item: LibraryResource;
  onPress: (item: LibraryResource) => void;
}) {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      accessibilityHint="Navigates to the details page for this resource"
      className="rounded-[22px] border border-phase-border bg-white dark:bg-phase-surface p-4 active:opacity-80"
    >
      <HStack className="items-center justify-between gap-3">
        <VStack className="flex-1 gap-1">
          <Text className="text-[15px] font-bold text-phaseText-primary">{item.title}</Text>
          <Text className="text-[13px] leading-5 text-phaseText-secondary">
            {item.topics?.[0] || item.subjects?.[0] || 'Related resource'}
          </Text>
        </VStack>
        <SanctuaryIcon as={Sparkles} size={18} color={Theme.colors.sanctuarySaffron} />
      </HStack>
    </Pressable>
  );
}

export default function ResourceHubScreen() {
  const router = useRouter();
  const colors = useThemedColors();
  const { user } = useStore();
  const [qrVisible, setQrVisible] = useState(false);

  const { resourceId } = useLocalSearchParams<{ resourceId?: string }>();

  const {
    data: resource,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['library', 'resource-hub', resourceId, user?.id || 'guest'],
    queryFn: () => libraryAPI.getResourceById(resourceId!, user?.id),
    enabled: !!resourceId,
  });

  const primaryContext = useMemo(() => {
    if (!resource) return null;
    return resource.topics?.[0] || resource.subjects?.[0] || resource.tags?.[0] || resource.title;
  }, [resource]);

  const { data: relatedResources } = useQuery({
    queryKey: ['library', 'resource-hub', 'related', resourceId, primaryContext],
    enabled: !!resourceId && !!primaryContext,
    queryFn: async () => {
      if (!resource) return [] as LibraryResource[];

      let related = await libraryAPI.getResources({
        topic: resource.topics?.[0],
        subject: resource.topics?.[0] ? undefined : resource.subjects?.[0],
        limit: 8,
      });

      if (related.length <= 1) {
        related = await libraryAPI.searchLibrary({
          query: primaryContext || resource.title,
          limit: 8,
        });
      }

      return related.filter((item: LibraryResource) => item.id !== resource.id).slice(0, 6);
    },
  });

  const companionLinks = useMemo(
    () => (resource ? buildResourceCompanionLinks(resource) : []),
    [resource],
  );

  const handleBack = useCallback(() => {
    safeBack('/library');
  }, []);

  const navigateIntoLibrary = useCallback(
    (screen: string, params: Record<string, unknown>) => {
      if (screen === 'ResourceHub') {
        router.push({
          pathname: '/library/resource/[resourceId]',
          params: params as { resourceId: string },
        });
      }
    },
    [router],
  );

  const handlePrimaryAction = useCallback(
    (item: LibraryResource) => {
      if (!item.url) return;

      if (item.type === 'pdf') {
        router.push({
          pathname: '/library/document/[resourceId]',
          params: {
            resourceId: item.id,
            title: item.title,
            url: item.url,
            creator: item.creator_name ?? '',
          },
        });
        return;
      }

      if (item.type === 'video' || item.type === 'movie_trailer') {
        router.push({
          pathname: '/library/video/[resourceId]',
          params: {
            resourceId: item.id,
            title: item.title,
            url: item.url,
            creator: item.creator_name ?? '',
          },
        });
        return;
      }

      if (item.type === 'doc' || item.format === 'document') {
        router.push({
          pathname: '/library/document/[resourceId]',
          params: {
            resourceId: item.id,
            title: item.title,
            url: item.url,
            creator: item.creator_name ?? '',
          },
        });
        return;
      }

      openExternalURL(item.url, buildLibraryExternalLinkOptions(item, 'Resource hub')).catch(
        (err) => console.error("Couldn't open resource source", err),
      );
    },
    [router],
  );

  const handleCompanionOpen = useCallback((link: ResourceCompanionLink) => {
    openExternalURL(link.url, {
      title: link.label,
      sourceLabel: 'Resource hub',
      sourceBadge: 'External context',
      trustLevel: link.kind === 'primary' ? 'verified' : 'external',
    }).catch((err) => console.error("Couldn't open companion link", err));
  }, []);

  const handleShare = useCallback(async (item: LibraryResource) => {
    const shareUrl = buildLibraryResourceShareUrl(item.id);
    await coreRuntime.share.share({
      message: `Explore "${item.title}" on Gurudevi\n${shareUrl}`,
      url: shareUrl,
      title: item.title,
    });
  }, []);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handlePrimaryPress = useCallback(() => {
    if (resource) {
      handlePrimaryAction(resource);
    }
  }, [resource, handlePrimaryAction]);

  const handleSharePress = useCallback(() => {
    if (resource) {
      void handleShare(resource);
    }
  }, [resource, handleShare]);

  const handleShowQr = useCallback(() => {
    setQrVisible(true);
  }, []);

  const handleHideQr = useCallback(() => {
    setQrVisible(false);
  }, []);

  const handleRelatedPress = useCallback(
    (item: LibraryResource) => {
      navigateIntoLibrary('ResourceHub', {
        resourceId: item.id,
      });
    },
    [navigateIntoLibrary],
  );

  if (!resourceId) {
    return (
      <ScreenWrapper>
        <VStack className="flex-1 items-center justify-center gap-3.5 px-6">
          <Text className="text-xl font-extrabold text-phaseText-primary">Resource not found</Text>
          <Text className="text-center text-phaseText-secondary">
            This link does not include a valid Gurudevi resource id.
          </Text>
          <ActionButton
            label="Back to Library"
            icon={<SanctuaryIcon as={ArrowLeft} size={16} color="white" />}
            onPress={handleBack}
            accent
          />
        </VStack>
      </ScreenWrapper>
    );
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <VStack className="flex-1 items-center justify-center gap-3.5">
          <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
          <Text className="text-[13px] text-phaseText-secondary">Loading resource hub...</Text>
        </VStack>
      </ScreenWrapper>
    );
  }

  if (error || !resource) {
    return (
      <ScreenWrapper>
        <VStack className="flex-1 items-center justify-center gap-3.5 px-6">
          <Text className="text-xl font-extrabold text-phaseText-primary">
            We couldn{"'"}t load this resource
          </Text>
          <Text className="text-center text-phaseText-secondary">
            {String((error as Error)?.message || 'The resource may have moved or been removed.')}
          </Text>
          <HStack className="gap-2.5">
            <ActionButton
              label="Back"
              icon={<SanctuaryIcon as={ArrowLeft} size={16} color={colors.textPrimary} />}
              onPress={handleBack}
            />
            <ActionButton
              label="Retry"
              icon={<SanctuaryIcon as={Sparkles} size={16} color="white" />}
              onPress={handleRetry}
              accent
            />
          </HStack>
        </VStack>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll={false}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Box className="px-4 pt-4">
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Back to Library"
            accessibilityHint="Navigates back to the library screen"
            className="min-h-[42px] self-start rounded-2xl border border-phase-border bg-phase-surface/50 px-3.5 py-2.5 flex-row items-center gap-2"
          >
            <SanctuaryIcon as={ArrowLeft} size={16} color={colors.textPrimary} />
            <Text className="text-[13px] font-bold text-phaseText-primary">Back to Library</Text>
          </Pressable>
        </Box>

        <Box className="px-4 pt-4">
          <Box className="rounded-[28px] bg-white dark:bg-phase-surface border border-phase-border p-5 mb-6 shadow-sm">
            <HStack className="items-center justify-between gap-3 mb-3">
              <Box className="px-2.5 py-1 rounded-full bg-amber-500/10">
                <Text className="text-[11px] font-extrabold text-amber-500 uppercase tracking-widest">
                  Resource hub
                </Text>
              </Box>
              {resource.verified ? (
                <Box className="px-2.5 py-1 rounded-full bg-emerald-500/10">
                  <Text className="text-[11px] font-extrabold text-emerald-500 uppercase">
                    Verified
                  </Text>
                </Box>
              ) : null}
            </HStack>

            <Text className="text-[28px] font-extrabold leading-8 mb-2.5 text-phaseText-primary">
              {resource.title}
            </Text>
            {resource.description ? (
              <Text className="text-[14px] leading-5 mb-3.5 text-phaseText-secondary">
                {resource.description}
              </Text>
            ) : null}

            <HStack className="flex-wrap gap-2 mb-4">
              {resource.subjects?.slice(0, 3).map((subject: string) => (
                <Box
                  key={subject}
                  className="px-2.5 py-1.5 rounded-full bg-phase-surface border border-phase-border"
                >
                  <Text className="text-[12px] text-phaseText-secondary">{subject}</Text>
                </Box>
              ))}
              {resource.topics?.slice(0, 2).map((topic: string) => (
                <Box
                  key={topic}
                  className="px-2.5 py-1.5 rounded-full bg-phase-surface border border-phase-border"
                >
                  <Text className="text-[12px] text-phaseText-secondary">{topic}</Text>
                </Box>
              ))}
            </HStack>

            <HStack className="flex-wrap gap-2.5 mt-4">
              <ActionButton
                label={
                  resource.type === 'movie_trailer' || resource.type === 'video'
                    ? 'Open player'
                    : 'Open source'
                }
                icon={
                  resource.type === 'movie_trailer' || resource.type === 'video' ? (
                    <SanctuaryIcon as={CirclePlay} size={16} color="white" />
                  ) : (
                    <SanctuaryIcon as={ExternalLink} size={16} color="white" />
                  )
                }
                onPress={handlePrimaryPress}
                accent
              />
              <ActionButton
                label="Share link"
                icon={<SanctuaryIcon as={Share2} size={16} color={colors.textPrimary} />}
                onPress={handleSharePress}
              />
              <ActionButton
                label=""
                icon={<SanctuaryIcon as={QrCode} size={16} color={colors.textPrimary} />}
                onPress={handleShowQr}
              />
            </HStack>
          </Box>

          {companionLinks.length > 0 ? (
            <VStack className="mb-6 gap-3">
              <Text className="text-[19px] font-extrabold text-phaseText-primary mb-1">
                Entry points around this resource
              </Text>
              <VStack className="gap-3">
                {companionLinks.map((link) => (
                  <CompanionLinkCard
                    key={link.id}
                    link={link}
                    onPress={handleCompanionOpen}
                    textColor={colors.textPrimary}
                    secondaryTextColor={colors.textSecondary}
                  />
                ))}
              </VStack>
            </VStack>
          ) : null}

          {resource.copyright_notice ? (
            <Box className="mb-6 p-4 rounded-[22px] bg-white dark:bg-phase-surface border border-phase-border shadow-sm">
              <HStack className="items-start gap-2.5">
                <SanctuaryIcon as={Globe} size={18} color={Theme.colors.sanctuarySaffron} />
                <VStack className="flex-1 gap-1">
                  <Text className="text-[14px] font-extrabold text-phaseText-primary">
                    Usage notice
                  </Text>
                  <Text className="text-[13px] leading-5 text-phaseText-secondary">
                    {resource.copyright_notice}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ) : null}

          <VStack className="mb-6 gap-3">
            <Text className="text-[19px] font-extrabold text-phaseText-primary mb-1">
              Related inside Gurudevi
            </Text>
            {relatedResources && relatedResources.length > 0 ? (
              <VStack className="gap-3">
                {relatedResources.map((item: LibraryResource) => (
                  <RelatedResourceCard key={item.id} item={item} onPress={handleRelatedPress} />
                ))}
              </VStack>
            ) : (
              <Box className="p-4 rounded-[22px] bg-white dark:bg-phase-surface border border-phase-border">
                <Text className="text-[13px] leading-5 text-phaseText-secondary">
                  We don{"'"}t have companion Gurudevi resources clustered around this one yet. As
                  the library grows, this hub will deepen.
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </ScrollView>

      <ResourceShareQRModal
        visible={qrVisible}
        onClose={handleHideQr}
        resourceId={resource.id}
        resourceTitle={resource.title}
        resourceType={resource.type}
        resourceThumbnailUrl={resource.url}
      />
    </ScreenWrapper>
  );
}
