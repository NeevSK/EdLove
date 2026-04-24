import React, { useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
    WebScreenHeader,
    useTheme,
    Text,
    Box,
    VStack,
    HStack,
    openExternalURL,
    showExternalLinkOptions,
    SanctuaryButton,
    ActivityIndicator
} from '@repo/ui';
import { LibraryThumbnailCard } from '../components/LibraryThumbnailCard';
import { useTranslation } from 'react-i18next';
import type { LibraryResource } from '../types';
import { useCollection } from '../hooks/useLibrary';
import { buildLibraryExternalLinkOptions } from '../utils/externalLinks';
import { useStore } from '@repo/core';
import { ArrowLeft, Library, RefreshCw } from 'lucide-react-native';

function LoadingState() {
    return (
        <Box className="flex-1 items-center justify-center p-20 bg-phase-surface">
            <VStack className="items-center gap-4">
                <ActivityIndicator size="large" />
                <Text className="text-phaseText-tertiary animate-pulse font-medium">Restoring collection...</Text>
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
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { id } = route?.params || {};
    
    const { user } = useStore();
    const theme = useTheme();
    const { t } = useTranslation();

    const { collection, isLoading, error, refetch } = useCollection(id, user?.id);

    const handleOpenResource = useCallback((resource: LibraryResource) => {
        if (!resource.url) return;
        if (resource.type === 'pdf') {
            navigation.navigate('PDFViewer', {
                resourceId: resource.id,
                title: resource.title,
                url: resource.url,
                creator: resource.creator_name,
            });
            return;
        }
        if (resource.type === 'video' || resource.type === 'movie_trailer') {
            navigation.navigate('VideoPlayer', {
                resourceId: resource.id,
                title: resource.title,
                url: resource.url,
                creator: resource.creator_name ?? '',
            });
            return;
        }
        openExternalURL(resource.url, buildLibraryExternalLinkOptions(resource, 'Collection')).catch((err: any) => console.error("Couldn't load page", err));
    }, [navigation]);

    const handleOpenResourceOptions = useCallback((resource: LibraryResource) => {
        if (!resource.url || resource.type === 'pdf' || resource.type === 'video' || resource.type === 'movie_trailer') {
            return;
        }

        showExternalLinkOptions(resource.url, buildLibraryExternalLinkOptions(resource, 'Collection')).catch((err: any) =>
            console.error("Couldn't show external link options", err)
        );
    }, []);

    const getYoutubeThumbnail = (url?: string) => {
        if (!url) return undefined;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
        return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : undefined;
    };

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
                            onPress={() => navigation.goBack()} 
                            leftIcon={ArrowLeft}
                            className="flex-1"
                        >
                            {t('library.goBack')}
                        </SanctuaryButton>
                        <SanctuaryButton 
                            onPress={() => refetch()} 
                            leftIcon={RefreshCw}
                            className="flex-1"
                        >
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
                    note={collection.is_virtual ? t('library.dynamicCollection') : t('library.curatedCollection')}
                    actions={(
                        <SanctuaryButton 
                            variant="ghost" 
                            onPress={() => navigation.goBack()} 
                            leftIcon={ArrowLeft}
                            size="sm"
                        >
                            {t('library.backToLibrary')}
                        </SanctuaryButton>
                    )}
                />

                <Box className="mt-8 mb-10 p-8 rounded-3xl bg-white/5 border border-white/5">
                    <Text className="text-lg text-phaseText-primary leading-8 mb-6 font-medium">
                        {collection.description || t('library.noDescription')}
                    </Text>
                    <HStack className="items-center gap-6">
                        <Box className="px-4 py-1.5 rounded-full bg-phase-accent/10 border border-phase-accent/20">
                            <Text className="text-xs font-black text-phase-accent uppercase tracking-wider">
                                {t('library.resourcesCount', { count: collection.resources.length })}
                            </Text>
                        </Box>
                        {collection.creator_name && (
                            <HStack className="gap-1.5 items-center">
                                <Text className="text-sm text-phaseText-tertiary">{t('library.curatedBy')}</Text>
                                <Text className="text-sm font-bold text-phaseText-secondary">{collection.creator_name}</Text>
                            </HStack>
                        )}
                        <Box className="w-1 h-1 rounded-full bg-white/20" />
                        <Text className="text-sm text-phaseText-tertiary">
                            {collection.is_virtual ? t('library.dynamic') : t('library.collection')}
                        </Text>
                    </HStack>
                </Box>

                <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {collection.resources.map((res: LibraryResource) => (
                        <LibraryThumbnailCard
                            key={res.id}
                            title={res.title}
                            type={res.type}
                            subject={res.subjects?.[0] ?? 'General'}
                            thumbnailUrl={res.media?.url || (res as any).thumbnail_url || (res.type === 'video' || res.type === 'movie_trailer' ? getYoutubeThumbnail(res.url) : undefined)}
                            endorsements={res.endorsements || 0}
                            verified={res.verified}
                            onPress={() => handleOpenResource(res)}
                            onLongPress={res.url ? () => handleOpenResourceOptions(res) : undefined}
                        />
                    ))}
                    {collection.resources.length === 0 && (
                        <Box className="col-span-full py-20 items-center">
                            <Text className="text-phaseText-muted italic">{t('library.emptyCollection')}</Text>
                        </Box>
                    )}
                </Box>
            </VStack>
        </Box>
    );
}
