import React, { useState, useMemo } from 'react';
import { FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Box, VStack, HStack, Text, Pressable, useThemedColors, SkeletonCard, PositiveInvitation, Theme, GlobalHeader, ScreenWrapper, LibraryResourceCard, ResourceType } from '@repo/ui';
import LotusPetalFAB from '../components/shared/LotusPetalFAB';
import AddResourceModal from '../components/library/AddResourceModal';
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, Plus, Zap } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { api } from '../lib/api';
import { isDemo } from '../lib/api/demo';
import { useLibrary, LibraryResource } from '@repo/library';
import { useUserRole, useTracking, supabase, LIBRARY_RESOURCE_CATEGORIES } from '@repo/core';

// Categories for display (including "All")
const LIB_UI_CATEGORIES = [{ id: 'All', en: 'All', si: 'සියල්ල', ta: 'அனைத்தும்' }, ...LIBRARY_RESOURCE_CATEGORIES];

export default function LibraryScreen() {
    const { t } = useTranslation();
    const { role } = useUserRole();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const colors = useThemedColors();
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
        </VStack>
    );

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

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchResources();
        setRefreshing(false);
    };

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

            <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
                <FlatList
                    data={resources}
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
                    contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, paddingBottom: 100 }}
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
