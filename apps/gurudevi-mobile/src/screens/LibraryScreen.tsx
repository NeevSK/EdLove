import React, { useState, useMemo, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Pressable,
    useThemedColors,
    SkeletonCard,
    PositiveInvitation,
    Theme,
    GlobalHeader,
    ScreenWrapper,
    CollectionCard,
    SmartShelf,
    ResourceType,
} from '@repo/ui';
import LotusPetalFAB from '../components/shared/LotusPetalFAB';
import AddResourceModal from '../components/library/AddResourceModal';
import { useTranslation } from 'react-i18next';
import { BookOpen, Inbox } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { api } from '../lib/api';
import { isDemo } from '../lib/api/demo';
import { useLibrary, LibraryResource, ResourceList } from '@repo/library';
import {
    useUserRole,
    useRoleFeatures,
    useTracking,
    supabase,
    useStore,
    DeskItem,
} from '@repo/core';

export default function LibraryScreen() {
    const { t } = useTranslation();
    const { role } = useUserRole();

    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const colors = useThemedColors();
    const { discoverFeature } = useTracking();

    // Offline-first desk state
    const { deskItems, addToDeskLocal, removeFromDeskLocal } = useStore();

    React.useEffect(() => {
        discoverFeature('section_library');
    }, []);

    const {
        resources,
        collections,
        loading,
        fetchResources,
        fetchNextResources,
        hasNextResources,
        isFetchingNextResources,
    } = useLibrary(
        { search: searchQuery || undefined },
        { visibility: 'public', limit: 10 }
    );

    // "Continue Learning" — items pulled to desk (offline-first from deskItems, hydrated from resources)
    const deskResources = useMemo<LibraryResource[]>(() => {
        if (!deskItems || deskItems.length === 0) return [];

        // Start from locally stored desk items so they show up even before/without fetched resources
        if (!resources || resources.length === 0) {
            // Assume DeskItem is compatible with LibraryResource at runtime; cast for typing
            return deskItems.map((d) => d as unknown as LibraryResource);
        }

        // When resources are available, hydrate deskItems with the freshest data
        const hydratedById = new Map(resources.map((r) => [r.id, r]));

        return deskItems
            .map((d) => hydratedById.get(d.id) ?? (d as unknown as LibraryResource))
            .filter((r): r is LibraryResource => r != null);
    }, [resources, deskItems]);

    // "New Arrivals" — recent public resources not on desk
    const newArrivals = useMemo(
        () => {
            if (!resources || resources.length === 0) return [];
            const deskIds = new Set(deskItems?.map((d) => d.id) ?? []);
            return resources.filter((r) => !deskIds.has(r.id)).slice(0, 20);
        },
        [resources, deskItems]
    );

    const handleAddResource = async (data: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            await api.library.createResource({
                ...data,
                subject: 'General',
                grades: [10],
                language: 'english',
                visibility: 'public',
                format: 'document'
            }, user.id, role || 'teacher');
            await fetchResources();
        } catch (err) {
            console.error('Failed to create resource', err);
        }
    };

    const handleOpenResource = useCallback((resource: LibraryResource) => {
        const url = resource.url || resource.media?.secure_url || resource.media?.url;
        if (!url) return;
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }, []);

    const handlePullToDesk = useCallback((resource: LibraryResource) => {
        const deskItem: DeskItem = {
            id: resource.id,
            title: resource.title,
            type: resource.type,
            url: resource.url || resource.media?.url,
            thumbnailUrl: resource.media?.thumbnail_url,
            addedAt: new Date().toISOString(),
        };
        addToDeskLocal(deskItem);
    }, [addToDeskLocal]);

    const handleCollectionPullToDesk = useCallback((collectionId: string, collectionName: string) => {
        addToDeskLocal({
            id: collectionId,
            title: collectionName,
            type: 'collection',
            addedAt: new Date().toISOString(),
        });
    }, [addToDeskLocal]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchResources();
        setRefreshing(false);
    };

    const isLoading = loading && !refreshing;

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={t('tabs.library') || 'Library'}
                subtitle={t('library.knowledgeSanctuary')}
                searchProps={{
                    value: searchQuery,
                    onChangeText: setSearchQuery,
                    placeholder: t('library.searchPlaceholder')
                }}
            />

            <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
                {isLoading ? (
                    <VStack space="md" sx={{ paddingHorizontal: Theme.spacing.md, paddingTop: Theme.spacing.md }}>
                        <SkeletonCard height={44} />
                        <SkeletonCard height={220} />
                        <SkeletonCard height={120} />
                        <SkeletonCard height={120} />
                    </VStack>
                ) : (
                    <ResourceList
                        resources={newArrivals}
                        onOpenResource={handleOpenResource}
                        onPullToDesk={handlePullToDesk}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        onEndReached={() => {
                            if (hasNextResources && !isFetchingNextResources) {
                                fetchNextResources();
                            }
                        }}
                        ListHeaderComponent={
                            <VStack sx={{ paddingBottom: Theme.spacing.md }}>
                                {/* ── Continue Learning (Desk) ── */}
                                {deskResources.length > 0 && (
                                    <SmartShelf
                                        title={t('library.continueLearning') || 'Continue Learning'}
                                        horizontalPadding={Theme.spacing.md}
                                    >
                                        {deskResources.map((res) => (
                                            <CollectionCard
                                                key={res.id}
                                                title={res.title}
                                                creator={res.creator_name}
                                                resourceCount={1}
                                                subjectTag={res.subject}
                                                thumbnailUrl={res.media?.thumbnail_url}
                                                verified={res.verified}
                                                onPress={() => handleOpenResource(res)}
                                                onPullToDesk={() => removeFromDeskLocal(res.id)}
                                            />
                                        ))}
                                    </SmartShelf>
                                )}

                                {/* ── Featured Collections ── */}
                                {collections.length > 0 && (
                                    <SmartShelf
                                        title={t('library.featuredCollections') || 'Featured Collections'}
                                        horizontalPadding={Theme.spacing.md}
                                    >
                                        {collections.map((col) => (
                                            <CollectionCard
                                                key={col.id}
                                                title={col.name}
                                                creator={col.creator_name}
                                                resourceCount={col.resource_ids?.length ?? 0}
                                                subjectTag={col.subject}
                                                onPullToDesk={() =>
                                                    handleCollectionPullToDesk(col.id, col.name)
                                                }
                                            />
                                        ))}
                                    </SmartShelf>
                                )}

                                {/* ── New Arrivals header ── */}
                                <HStack
                                    sx={{
                                        paddingHorizontal: Theme.spacing.md,
                                        paddingBottom: Theme.spacing.sm,
                                        alignItems: 'center',
                                        gap: Theme.spacing.sm,
                                    }}
                                >
                                    <BookOpen color={colors.text} size={16} />
                                    <Text color={colors.text} size="md" bold>
                                        {t('library.newArrivals') || 'New Arrivals'}
                                    </Text>
                                </HStack>

                                {newArrivals.length === 0 && (
                                    <PositiveInvitation
                                        context="library"
                                        onAction={() => setIsAddModalOpen(true)}
                                    />
                                )}
                            </VStack>
                        }
                        ListFooterComponent={
                            isFetchingNextResources ? (
                                <ActivityIndicator
                                    size="small"
                                    color={Theme.colors.sanctuarySaffron}
                                    style={{ padding: 20 }}
                                />
                            ) : null
                        }
                    />
                )}

                <LotusPetalFAB onPress={() => setIsAddModalOpen(true)} />

                <AddResourceModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddResource}
                />
            </Box>
        </ScreenWrapper>
    );
}

