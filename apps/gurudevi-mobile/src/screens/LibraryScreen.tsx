import React, { useState, useMemo } from 'react';
import { FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Box, VStack, HStack, Text, Pressable, useThemedColors, SkeletonCard, PositiveInvitation, Theme, GlobalHeader, ScreenWrapper, LibraryResourceCard, ResourceType, SmartShelf, CollectionCard, useBottomTabPadding } from '@repo/ui';
import LotusPetalFAB from '../components/shared/LotusPetalFAB';
import AddResourceModal from '../components/library/AddResourceModal';
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, Plus, Zap } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { api } from '../lib/api';
import { isDemo } from '../lib/api/demo';
import { useLibrary, LibraryResource } from '@repo/library';
import { useUserRole, useRoleFeatures, useTracking, supabase, LIBRARY_RESOURCE_CATEGORIES, useStore } from '@repo/core';

// Categories for display (including "All")
const LIB_UI_CATEGORIES = [{ id: 'All', en: 'All', si: 'සියල්ල', ta: 'அனைத்தும்' }, ...LIBRARY_RESOURCE_CATEGORIES];

export default function LibraryScreen() {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const { isGuest } = useRoleFeatures();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();
    const { discoverFeature } = useTracking();

    React.useEffect(() => {
        discoverFeature('section_library');
    }, []);

    // Map category to API type
    const resourceTypeFilter = useMemo(() => {
        if (selectedCategoryId === 'All') return undefined;
        return selectedCategoryId as any;
    }, [selectedCategoryId]);

    const {
        resources,
        collections,
        loading,
        fetchResources,
        fetchNextResources,
        hasNextResources,
        isFetchingNextResources
    } = useLibrary({
        type: resourceTypeFilter,
        search: searchQuery || undefined
    });

    const handleAddResource = async (data: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await api.library.createResource({
                ...data,
                subject: 'General', // Default or pick from context
                grades: [10], // Default or pick from context
                language: 'english',
                visibility: 'public',
                format: 'document'
            }, user.id, role || 'teacher');
            await fetchResources();
        } catch (err) {
            console.error('Failed to create resource', err);
        }
    };

    const handleOpenResource = (url: string) => {
        if (!url) return;
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    const renderCategoryItem = ({ item: cat }: { item: any }) => (
        <Pressable
            onPress={() => setSelectedCategoryId(cat.id)}
            accessibilityRole="button"
            accessibilityLabel={cat.en}
            accessibilityState={{ selected: selectedCategoryId === cat.id }}
        >
            <Box
                sx={{
                    paddingHorizontal: Theme.spacing.lg,
                    paddingVertical: Theme.spacing.sm,
                    backgroundColor: selectedCategoryId === cat.id
                        ? Theme.colors.sanctuarySaffron
                        : colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    borderWidth: 1,
                    borderColor: selectedCategoryId === cat.id
                        ? Theme.colors.sanctuarySaffron
                        : colors.border,
                    marginRight: 12
                }}
            >
                <Text
                    color={selectedCategoryId === cat.id
                        ? Theme.colors.white
                        : colors.text
                    }
                    size="sm"
                    bold={selectedCategoryId === cat.id}
                >
                    {cat.en}
                </Text>
            </Box>
        </Pressable>
    );

    const { deskItems, removeFromDeskLocal } = useStore();
    const handleCollectionPullToDesk = (id: string, name: string) => { };
    const newArrivals = useMemo(() => resources.slice(0, 5), [resources]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchResources();
        setRefreshing(false);
    };

    const renderHeader = () => (
        <VStack space="md" py="$4">
            <VStack space="xs">
                <Text color={colors.text} size="lg" bold>
                    {t('library.categories') || 'Categories'}
                </Text>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={LIB_UI_CATEGORIES}
                    renderItem={renderCategoryItem}
                    keyExtractor={(cat) => cat.id}
                />
            </VStack>

            {/* Quick Collections / Tags Bar */}
            <VStack space="xs" mt="$2">
                <Text color={colors.textSecondary} size="sm" bold>
                    {t('library.collections') || 'Popular Collections'}
                </Text>
                <HStack space="sm" flexWrap="wrap">
                    {['Grade 10', 'Mathematics', 'Past Papers', '2026 Reform'].map(tag => (
                        <Pressable
                            key={tag}
                            onPress={() => setSearchQuery(tag)}
                        >
                            <Box sx={{
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 12,
                                backgroundColor: colors.tertiary,
                                borderWidth: 1,
                                borderColor: colors.border
                            }}>
                                <Text size="xs" color={colors.textSecondary}>#{tag}</Text>
                            </Box>
                        </Pressable>
                    ))}
                </HStack>
            </VStack>

            <VStack sx={{ paddingBottom: Theme.spacing.md }}>
                {/* ── Continue Learning (Desk) ── */}
                {deskItems && deskItems.length > 0 && (
                    <SmartShelf
                        title={t('library.continueLearning') || 'Continue Learning'}
                        horizontalPadding={Theme.spacing.md}
                    >
                        {deskItems.map((res: any) => (
                            <CollectionCard
                                key={res.id}
                                title={res.title}
                                creator={res.creator_name || 'Personal Desk'}
                                resourceCount={1}
                                subjectTag={res.type}
                                thumbnailUrl={res.thumbnailUrl}
                                verified={true}
                                onPress={() => handleOpenResource(res.url || '')}
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
                        {collections.map((col: any) => (
                            <CollectionCard
                                key={col.id}
                                title={col.name}
                                creator={col.creator_name}
                                resourceCount={col.resource_ids?.length ?? 0}
                                subjectTag={col.subject}
                                onPullToDesk={() => handleCollectionPullToDesk(col.id, col.name)}
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
        </VStack>
    );

    const getEmptyComponent = () => {
        if (loading && !refreshing) {
            return (
                <VStack space="md">
                    <SkeletonCard height={120} />
                    <SkeletonCard height={120} />
                    <SkeletonCard height={120} />
                </VStack>
            );
        }
        return (
            <PositiveInvitation
                context="library"
                onAction={() => setIsAddModalOpen(true)}
            />
        );
    };

    const renderResourceItem = ({ item: res }: { item: LibraryResource }) => (
        <LibraryResourceCard
            key={res.id}
            title={isDemo() ? `(Sample) ${res.title}` : res.title}
            type={res.type as ResourceType}
            isPublic={res.visibility === 'public'}
            onPress={() => handleOpenResource(res.url || '')}
            onLike={() => console.log('Like', res.id)}
            onaddToDesk={() => console.log('Add to desk', res.id)}
        />
    );

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
                <FlatList
                    data={newArrivals}
                    renderItem={renderResourceItem}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={getEmptyComponent()}
                    ListFooterComponent={isFetchingNextResources ? (
                        <ActivityIndicator size="small" color={Theme.colors.sanctuarySaffron} style={{ padding: 20 }} />
                    ) : null}
                    onEndReached={() => {
                        if (hasNextResources && !isFetchingNextResources) {
                            fetchNextResources();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Theme.colors.sanctuarySaffron}
                        />
                    }
                    contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, paddingBottom: bottomPadding }}
                />

                <LotusPetalFAB
                    onPress={() => setIsAddModalOpen(true)}
                />

                <AddResourceModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddResource}
                />
            </Box>
        </ScreenWrapper>
    );
}
