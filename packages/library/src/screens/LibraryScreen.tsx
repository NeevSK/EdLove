import React, { useState, useMemo } from 'react';
import { FlatList, RefreshControl, ActivityIndicator } from 'react-native';
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
    SmartShelf,
    CollectionCard,
    useBottomTabPadding,
    LotusPetalFAB,
    FadeInDown,
    SanctuaryButton,
    LivingGlow,
    HorizontalChipRow,
    SanctuaryChip
} from '@repo/ui';
import Animated from 'react-native-reanimated';
import AddResourceModal from '../components/AddResourceModal';
import { ResourceList } from '../components/ResourceList';
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, Plus, Zap } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { useLibrary } from '../hooks/useLibrary';
import { LibraryResource } from '../types';
import {
    useUserRole,
    useRoleFeatures,
    useTracking,
    supabase,
    useStore,
    isDemo
} from '@repo/core';

// Categories are now managed in @repo/library for Scalable Modularity
import { LIBRARY_UI_CATEGORIES } from '../constants/categories'; // I'll need to create this or check where it is

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

            // This should ideally call a library hook/api
            // For now keeping logic but we'll harden next
            onRefresh();
        } catch (err) {
            console.error('Failed to create resource', err);
        }
    };

    const handleOpenResource = (url: string) => {
        if (!url) return;
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    const chipData = useMemo(() => LIBRARY_UI_CATEGORIES.map(cat => ({
        label: cat.en,
        value: cat.id
    })), []);

    const { deskItems, removeFromDeskLocal } = useStore();
    const handleCollectionPullToDesk = (id: string, name: string) => { };
    const newArrivals = useMemo(() => resources.slice(0, 5), [resources]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchResources();
        setRefreshing(false);
    };

    const renderHeader = () => (
        <VStack space="md" py="$4" px={Theme.spacing.md}>
            <Animated.View entering={FadeInDown.delay(150).springify()}>
                <VStack space="xs">
                    <Text color={colors.text} size="lg" bold>
                        {t('library.categories') || 'Categories'}
                    </Text>
                    <HorizontalChipRow
                        chips={chipData}
                        selectedValue={selectedCategoryId}
                        onSelect={setSelectedCategoryId}
                        size="sm"
                        paddingHorizontal={0} // Padding handled by parent container
                    />
                </VStack>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).springify()}>
                <VStack space="xs" mt="$2">
                    <Text color={colors.textSecondary} size="sm" bold mb="$1">
                        {t('library.collections') || 'Popular Collections'}
                    </Text>
                    <HStack space="sm" flexWrap="wrap">
                        {['Grade 10', 'Mathematics', 'Past Papers', '2026 Reform'].map(tag => (
                            <SanctuaryChip
                                key={tag}
                                label={tag}
                                selected={searchQuery === tag}
                                onPress={() => setSearchQuery(tag)}
                                variant="tag"
                                size="sm"
                            />
                        ))}
                    </HStack>
                </VStack>
            </Animated.View>

            <VStack sx={{ paddingBottom: Theme.spacing.md }}>
                {deskItems && deskItems.length > 0 && (
                    <SmartShelf
                        title={t('library.continueLearning') || 'Continue Learning'}
                        horizontalPadding={Theme.spacing.md}
                    >
                        {deskItems.filter((res: any) => res.type === 'resource').map((res: any) => (
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

                <HStack
                    sx={{
                        paddingHorizontal: Theme.spacing.md,
                        paddingBottom: Theme.spacing.sm,
                        alignItems: 'center',
                        gap: Theme.spacing.sm,
                        marginTop: Theme.spacing.md
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

            <Box sx={{ flex: 1, backgroundColor: colors.secondary }}>
                <ResourceList
                    resources={resources}
                    onOpenResource={(res) => handleOpenResource(res.url || '')}
                    onPullToDesk={(res) => console.log('Pull to desk', res.id)}
                    ListHeaderComponent={renderHeader()}
                    ListFooterComponent={isFetchingNextResources ? (
                        <ActivityIndicator size="small" color={Theme.colors.sanctuarySaffron} style={{ padding: 20 }} />
                    ) : null}
                    onEndReached={() => {
                        if (hasNextResources && !isFetchingNextResources) {
                            fetchNextResources();
                        }
                    }}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />

                <LotusPetalFAB
                    currentTab="library"
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
