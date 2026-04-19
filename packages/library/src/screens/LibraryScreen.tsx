/**
 * LibraryScreen — Netflix-Style Holistic Digital Library
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    ScrollView as RNScrollView,
    ActivityIndicator,
    View,
    Text as RNText,
    ImageBackground,
    StyleSheet,
    Platform,
    Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    useTheme,
    Theme,
    SkeletonCard,
    useBottomTabPadding,
    useRegisterFAB,
    FadeInDown,
    HorizontalChipRow,
    TemporalNavigator,
    CollectionCard,
    GlobalHeader,
    useLotusToast,
    SmartShelf,
    ScreenWrapper,
    Pressable,
    RefreshControl,
    ScrollView,
    Icon,
    openExternalURL,
    showExternalLinkOptions,
} from '@repo/ui';
import { LibraryThumbnailCard } from '../components/LibraryThumbnailCard';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import AddResourceModal from '../components/AddResourceModal';
import AddCollectionModal from '../components/AddCollectionModal';
import { ResourceList } from '../components/ResourceList';
import { Map as MapIcon, Play, Plus, FileText, Layers, LayoutGrid, List, Library } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLibrary, useBookmarkedResources } from '../hooks/useLibrary';
import { ResourceActionSheet } from '../components/ResourceActionSheet';
import { CollectionPickerModal } from '../components/CollectionPickerModal';
import { LibraryResource, LibraryCollection } from '../types';
import {
    useTracking,
    supabase,
    useStore,
    FeatureGuard,
    identityAPI,
    useTemporalStore,
} from '@repo/core';
import { libraryAPI } from '../api/library';
import { SHELF_DEFS, getOrderedShelfDefs } from '../constants/shelf';
import { buildLibraryExternalLinkOptions } from '../utils/externalLinks';

const LIBRARY_UI_CATEGORIES = [
    { id: 'All', en: 'All' },
    { id: 'video', en: 'Videos' },
    { id: 'pdf', en: 'Documents' },
    { id: 'link', en: 'Web Resources' },
    { id: 'text', en: 'Articles' },
    { id: 'note', en: 'Personal Notes' }
];

function MapInvitation({ onPress }: { onPress: () => void }) {
    const theme = useTheme();

    return (
        <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Pressable 
                onPress={onPress}
                className="m-md rounded-[24px] overflow-hidden bg-phase-surface border border-phase-border">
                <LinearGradient
                    colors={[`${theme.accent.action}16`, `${theme.accent.reward}0D`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                <HStack className="p-5 gap-4 items-center">
                    <Box className="w-[60px] h-[60px] rounded-[30px] bg-white/10 justify-center items-center">
                        <Icon as={MapIcon} size={32} color={theme.accent.action} />
                    </Box>
                    <VStack className="flex-1 gap-1">
                        <Text className="text-[10px] font-extrabold text-phaseText-secondary uppercase tracking-widest">
                            Knowledge map
                        </Text>
                        <Text className="text-lg font-extrabold text-phaseText-primary">
                            Enter the Cosmos
                        </Text>
                        <Text className="text-[13px] text-phaseText-secondary leading-5">
                            Shift from shelves into constellation-style discovery when you want relationships, not just a list.
                        </Text>
                    </VStack>
                    <Box className="p-2.5 bg-phase-accent rounded-xl">
                        <Icon as={Play} size={16} color="white" fill="white" />
                    </Box>
                </HStack>
            </Pressable>
        </Animated.View>
    );
}

function CuratorInvitation({ onPress }: { onPress: () => void }) {
    const theme = useTheme();

    return (
        <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Pressable 
                onPress={onPress}
                className="m-md mt-0 rounded-[24px] overflow-hidden bg-phase-surface border border-phase-accent/20">
                <LinearGradient
                    colors={[`${theme.accent.action}14`, 'rgba(255,255,255,0.2)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
                <HStack className="p-4 gap-4 items-center">
                    <Box className="w-12 h-12 rounded-full bg-phase-accent/10 justify-center items-center">
                        <Icon as={FileText} size={24} color={theme.accent.action} />
                    </Box>
                    <VStack className="flex-1 gap-0.5">
                        <Text className="text-[10px] font-extrabold text-phaseText-secondary uppercase tracking-widest">
                            Curator pathway
                        </Text>
                        <Text className="text-base font-extrabold text-phaseText-primary">
                            Curator Dashboard
                        </Text>
                        <Text className="text-[12px] text-phaseText-secondary">
                            Review, polish, and publish new knowledge streams without leaving the sanctuary shell.
                        </Text>
                    </VStack>
                    <Icon as={Plus} size={16} color={theme.text.secondary} />
                </HStack>
            </Pressable>
        </Animated.View>
    );
}

export default function LibraryScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { isPastView, viewDate, viewScale } = useTemporalStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');
    const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'most_endorsed' | 'most_bookmarked'>('recent');
    const [viewMode, setViewMode] = useState<'shelf' | 'grid' | 'list'>('shelf');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [fallbackAttempted, setFallbackAttempted] = useState(false);
    const isFetchingPublicRef = React.useRef(false);
    
    // Resource Actions State
    const [selectedResource, setSelectedResource] = useState<LibraryResource | null>(null);
    const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
    const [isCollectionPickerVisible, setIsCollectionPickerVisible] = useState(false);

    // Search Debouncing
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const theme = useTheme();
    const bottomPadding = useBottomTabPadding();
    const { discoverFeature } = useTracking();

    const isSearchMode = searchQuery.trim().length > 0 || selectedCategoryId !== 'All';

    const resourceTypeFilter = useMemo(() => {
        if (selectedCategoryId === 'All') return undefined;
        return selectedCategoryId as any;
    }, [selectedCategoryId]);

    const libraryFilters = useMemo(() => (
        isSearchMode
            ? { type: resourceTypeFilter, search: debouncedSearchQuery || undefined, sort_by: selectedSort, limit: 60 }
            : { limit: 60 }
    ), [isSearchMode, resourceTypeFilter, debouncedSearchQuery, selectedSort]);

    const { deskItems, user } = useStore();
    const orientationSeeds = user?.orientation_seeds ?? null;
    const orderedShelfDefs = useMemo(() => getOrderedShelfDefs(orientationSeeds), [orientationSeeds]);

    const {
        resources: rawResources,
        collections: rawUserCollections,
        loading,
        error: libraryError,
        fetchResources,
        fetchNextResources,
        hasNextResources,
        isFetchingNextResources,
        syncLibrary,
        bookmarkResource,
        addToCollection,
        isAddingToCollection,
    } = useLibrary(libraryFilters, libraryFilters);

    // Get Bookmarks
    const { 
        resources: bookmarkedResources, 
        isLoading: loadingBookmarks,
        refetch: refetchBookmarks 
    } = useBookmarkedResources(user?.id);

    const [publicCollections, setPublicCollections] = useState<any[]>([]);
    const [isFetchingPublic, setIsFetchingPublic] = useState(false);

    React.useEffect(() => {
        discoverFeature('section_library');
        setIsSyncing(true);
        syncLibrary()
            .catch(err => console.error('Library sync failed:', err))
            .finally(() => setIsSyncing(false));
    }, []);

    React.useEffect(() => {
        if (!loading && rawResources.length === 0 && rawUserCollections.length === 0 && publicCollections.length === 0 && !fallbackAttempted && !isFetchingPublicRef.current) {
            isFetchingPublicRef.current = true;
            setIsFetchingPublic(true);
            libraryAPI.getCollections({ limit: 10, visibility: 'public', viewDate, viewScale })
                .then(cols => {
                    setPublicCollections(cols);
                    setFallbackAttempted(true);
                })
                .catch(err => {
                    setFallbackAttempted(true);
                })
                .finally(() => {
                    setIsFetchingPublic(false);
                    isFetchingPublicRef.current = false;
                });
        }
    }, [loading, rawResources.length, rawUserCollections.length, publicCollections.length, fallbackAttempted, viewDate, viewScale]);

    const resources = useMemo(() => rawResources, [rawResources]);
    const collections = useMemo(() => 
        rawUserCollections.length > 0 ? rawUserCollections : publicCollections
    , [rawUserCollections, publicCollections]);

    const trending = useMemo(() => 
        [...resources].sort((a, b) => (b.endorsements ?? 0) - (a.endorsements ?? 0)).slice(0, 10),
        [resources]);

    const newArrivals = useMemo(() => 
        [...resources].sort((a, b) => 
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        ).slice(0, 10),
        [resources]);

    const heroResource = trending[0] ?? newArrivals[0] ?? null;

    const handleOpenResource = useCallback((resource: LibraryResource) => {
        if (!resource.url) return;
        if (resource.type === 'pdf') {
            navigation.navigate('PDFViewer', { resourceId: resource.id, title: resource.title, url: resource.url });
            return;
        }
        if (resource.type === 'video' || resource.type === 'movie_trailer') {
            navigation.navigate('VideoPlayer', { resourceId: resource.id, title: resource.title, url: resource.url, creator: resource.creator_name });
            return;
        }
        openExternalURL(resource.url, buildLibraryExternalLinkOptions(resource)).catch(err => console.error("Couldn't load page", err));
    }, [navigation]);

    const handleOpenResourceOptions = useCallback((resource: LibraryResource) => {
        if (!resource.url || resource.type === 'pdf' || resource.type === 'video' || resource.type === 'movie_trailer') {
            return;
        }
        showExternalLinkOptions(resource.url, buildLibraryExternalLinkOptions(resource)).catch((err) => 
            console.error("Couldn't show external link options", err)
        );
    }, []);

    const handleAddResource = useCallback(async () => {
        try {
            await fetchResources();
            await refetchBookmarks();
        } catch (err) {
            console.error('Failed to refresh after add', err);
        }
    }, [fetchResources, refetchBookmarks]);

    const handleBookmark = useCallback(async (resource: LibraryResource) => {
        if (isPastView || !user?.id) return;
        try {
            await bookmarkResource({ resourceId: resource.id, userId: user.id });
            await refetchBookmarks();
        } catch (err) {
            console.error('Failed to bookmark:', err);
        }
    }, [isPastView, user?.id, bookmarkResource, refetchBookmarks]);

    const handleShare = useCallback(async (resource: LibraryResource) => {
        if (!resource.url) return;
        try {
            await Share.share({
                message: `Check out this resource on Polymath: ${resource.title}\n${resource.url}`,
                url: resource.url,
                title: resource.title,
            });
        } catch (err) {
            console.error('Failed to share:', err);
        }
    }, []);

    const handleAddToCollection = useCallback(async (collectionId: string) => {
        if (isPastView || !selectedResource) return;
        try {
            await addToCollection({ collectionId, resourceId: selectedResource.id });
            setIsCollectionPickerVisible(false);
        } catch (err) {
            console.error('Failed to add to collection:', err);
        }
    }, [isPastView, selectedResource, addToCollection]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchResources();
        const userId = await identityAPI.getMyInternalId();
        
        if (resources.length === 0) {
            const pub = await libraryAPI.getCollections({ limit: 10, visibility: 'public', userId: userId ?? undefined, viewDate, viewScale });
            setPublicCollections(pub);
        }
        setRefreshing(false);
    }, [fetchResources, resources.length, viewDate, viewScale]);

    const handleCreateCollection = useCallback(async (data: any) => {
        if (isPastView) return;
        try {
            const userId = await identityAPI.getMyInternalId();
            if (!userId) return;
            
            await libraryAPI.createCollection({
                ...data,
                resource_ids: [],
                subject: '',
                grades: [],
            }, userId);
            
            await fetchResources();
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 500);
        } catch (err) {
            console.error('Failed to create collection:', err);
        }
    }, [fetchResources, isPastView]);

    const chipData = useMemo(() => LIBRARY_UI_CATEGORIES.map(cat => ({
        label: cat.en,
        value: cat.id,
    })), []);

    const sortChips = useMemo(() => [
        { label: `\u23F2\uFE0F ${t('library.sort.recent')}`, value: 'recent' },
        { label: `\uD83D\uDD25 ${t('library.sort.popular')}`, value: 'popular' },
        { label: `\uD83C\uDF1F ${t('library.sort.most_endorsed')}`, value: 'most_endorsed' },
        { label: `\uD83D\uDD16 ${t('library.sort.most_bookmarked')}`, value: 'most_bookmarked' },
    ], [t]);

    const handleEndReached = useCallback(() => {
        if (hasNextResources && !isFetchingNextResources) fetchNextResources();
    }, [hasNextResources, isFetchingNextResources, fetchNextResources]);

    const fabConfig = useMemo(() => ({
        tabType: 'library' as const,
        onPress: () => setIsAddModalOpen(true),
        visible: !loading && !isPastView
    }), [loading, isPastView]);

    useRegisterFAB(fabConfig);

    const getYoutubeThumbnail = (url?: string) => {
        if (!url) return undefined;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
        return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : undefined;
    };

    const renderShelf = useCallback((label: string, items: LibraryResource[], onSeeAll?: () => void) => {
        if (items.length === 0) return null;
        return (
            <Box className="mb-lg">
                <SmartShelf key={label} title={label} onSeeAll={onSeeAll}>
                    {items.map(res => (
                        <LibraryThumbnailCard
                            key={`shelf-${label}-${res.id}`}
                            title={res.title}
                            type={res.type}
                            subject={res.subjects?.[0] || ''}
                            thumbnailUrl={res.media?.url || (res as any).thumbnail_url || (res.type === 'video' || res.type === 'movie_trailer' ? getYoutubeThumbnail(res.url) : undefined)}
                            endorsements={res.endorsements}
                            verified={res.verified}
                            copyrightNotice={res.copyright_notice}
                            onPress={() => handleOpenResource(res)}
                            has_bookmarked={res.has_bookmarked}
                            onBookmarkToggle={() => handleBookmark(res)}
                            onLongPress={() => {
                                setSelectedResource(res);
                                setIsActionSheetVisible(true);
                            }}
                        />
                    ))}
                </SmartShelf>
            </Box>
        );
    }, [handleOpenResource, handleBookmark]);

    return (
        <ScreenWrapper scroll={!isSearchMode} noTopInset={true}>
            <GlobalHeader
                title={t('tabs.library') || 'Library'}
                subtitle={t('library.knowledgeSanctuary')}
                showSearch
                searchProps={{
                    value: searchQuery,
                    onChangeText: setSearchQuery,
                    placeholder: t('library.searchPlaceholder')
                }}
                rightAction={
                    <HStack className="gap-2 items-center">
                        {isSyncing && (
                            <Animated.View entering={FadeInDown}>
                                <Box className="w-2 h-2 rounded-full bg-phase-accent" />
                            </Animated.View>
                        )}
                        <Pressable 
                            onPress={() => navigation.navigate('LibraryMap' as any)}
                            style={styles.mapToggleButton}>
                            <Icon as={MapIcon} size={20} color={theme.text.primary} />
                        </Pressable>
                    </HStack>
                }
            />
            <Box className="px-md pb-sm">
                <TemporalNavigator />
            </Box>

            {libraryError ? (
                <VStack className="p-md mt-lg items-center gap-3">
                    <Text className="text-phase-danger text-center">
                        {t('library.errorLoading') || 'Failed to load sanctuary wisdom.'}
                    </Text>
                    <Pressable onPress={() => fetchResources()}>
                        <Text className="text-phase-accent font-bold">Retry</Text>
                    </Pressable>
                </VStack>
            ) : (loading || isFetchingPublic) && !refreshing ? (
                <VStack className="p-md mt-lg gap-4">
                    <SkeletonCard height={200} />
                    <SkeletonCard height={160} />
                    <SkeletonCard height={160} />
                </VStack>
            ) : (
                <Box className="flex-1">
                    {!isSearchMode && (
                        <FeatureGuard feature="isLibraryManagementEnabled" action="create" subject="Library">
                            <HStack className="px-md py-3 gap-3">
                                <Pressable 
                                    onPress={() => !isPastView && setIsAddCollectionModalOpen(true)}
                                    style={[styles.actionBtn, { borderColor: `${theme.accent.action}88` }]}>
                                    <Icon as={Library} size={14} color={theme.accent.action} />
                                    <Text className="text-[13px] font-bold text-phaseText-primary">+ Collection</Text>
                                </Pressable>
                            </HStack>
                        </FeatureGuard>
                    )}

                    <Box className="flex-1 bg-phase-surface">
                        <Animated.View entering={FadeInDown.delay(100).springify()}>
                            <HorizontalChipRow
                                chips={chipData}
                                selectedValue={selectedCategoryId}
                                onSelect={setSelectedCategoryId}
                                size="sm"
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(160).springify()}>
                        <HStack className="px-md pb-sm justify-between items-center">
                                <Box className="flex-1">
                                    <HorizontalChipRow
                                        chips={sortChips}
                                        selectedValue={selectedSort}
                                        onSelect={(v) => setSelectedSort(v as typeof selectedSort)}
                                        size="sm"
                                    />
                                </Box>
                                <HStack className="gap-1 p-1 rounded-xl border border-phase-border bg-phase-surface/80">
                                    <Pressable 
                                        onPress={() => setViewMode('shelf')} 
                                        style={[styles.toggleBtn, viewMode === 'shelf' && { backgroundColor: theme.accent.action }]}>
                                        <Icon as={Layers} size={14} color={viewMode === 'shelf' ? theme.text.inverse : theme.text.secondary} />
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => setViewMode('grid')} 
                                        style={[styles.toggleBtn, viewMode === 'grid' && { backgroundColor: theme.accent.action }]}>
                                        <Icon as={LayoutGrid} size={14} color={viewMode === 'grid' ? theme.text.inverse : theme.text.secondary} />
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => setViewMode('list')} 
                                        style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: theme.accent.action }]}>
                                        <Icon as={List} size={14} color={viewMode === 'list' ? theme.text.inverse : theme.text.secondary} />
                                    </Pressable>
                                </HStack>
                            </HStack>
                        </Animated.View>

                        {viewMode === 'shelf' && !isSearchMode ? (
                            <ScrollView 
                                className="flex-1"
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: bottomPadding + 40 }}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                                <SanctuaryPulse
                                    resourceCount={resources.length}
                                    collectionCount={collections.length}
                                    bookmarkCount={bookmarkedResources.length}
                                />
                                {heroResource && (
                                    <HeroBanner resource={heroResource} onPress={() => handleOpenResource(heroResource)} />
                                )}
                                <MapInvitation onPress={() => navigation.navigate('LibraryMap' as any)} />
                                <FeatureGuard feature="isLibraryManagementEnabled" action="manage" subject="LibraryCuratorDashboard">
                                    <CuratorInvitation onPress={() => navigation.navigate('CuratorReview' as any)} />
                                </FeatureGuard>
                                <Box className="pt-md">
                                    {deskItems && deskItems.filter((r: any) => r.type === 'resource').length > 0 && (
                                        <SmartShelf title="▶ Continue Learning">
                                            {deskItems.filter((r: any) => r.type === 'resource').map((res: any) => (
                                                <LibraryThumbnailCard
                                                    key={res.id}
                                                    title={res.title}
                                                    type={res.type}
                                                    onPress={() => handleOpenResource(res)}
                                                    onLongPress={res.url ? () => handleOpenResourceOptions(res) : undefined}
                                                />
                                            ))}
                                        </SmartShelf>
                                    )}
                                    {bookmarkedResources.length > 0 && (
                                        <SmartShelf title="🔖 My Bookmarks">
                                            {bookmarkedResources.map((res: any) => (
                                                <LibraryThumbnailCard
                                                    key={`bookmark-${res.id}`}
                                                    title={res.title}
                                                    type={res.type}
                                                    onPress={() => handleOpenResource(res)}
                                                    has_bookmarked={res.has_bookmarked}
                                                    onBookmarkToggle={() => handleBookmark(res)}
                                                    onLongPress={() => {
                                                        setSelectedResource(res);
                                                        setIsActionSheetVisible(true);
                                                    }}
                                                />
                                            ))}
                                        </SmartShelf>
                                    )}
                                    {collections.length > 0 && (
                                        <Box className="mb-lg">
                                            <SmartShelf title={rawUserCollections.length > 0 ? "📚 Your Collections" : "🌟 Discover Collections"}>
                                                {collections.map((col: any) => (
                                                    <CollectionCard
                                                        key={col.id}
                                                        title={col.name}
                                                        creator={col.creator_name}
                                                        resourceCount={col.resource_ids?.length || 0}
                                                        subjectTag={col.subjects?.[0] || 'General'}
                                                        thumbnailUrl={col.thumbnail_url}
                                                        verified={col.is_official}
                                                        contextData={col}
                                                        onPress={(collection) => 
                                                            navigation.navigate('CollectionDetail', { id: collection.id, title: collection.name })
                                                        }
                                                    />
                                                ))}
                                            </SmartShelf>
                                        </Box>
                                    )}
                                    {orderedShelfDefs.map(shelf => {
                                        const items = resources.filter((r: LibraryResource) => (shelf.types as readonly string[]).includes(r.type));
                                        return renderShelf(shelf.label, items);
                                    })}
                                    {trending.length > 0 && renderShelf('⭐ Trending', trending)}
                                    {newArrivals.length > 0 && renderShelf('✨ New Arrivals', newArrivals)}
                                </Box>
                            </ScrollView>
                        ) : (
                            <ResourceList
                                resources={resources}
                                onOpenResource={handleOpenResource}
                                onOpenResourceOptions={handleOpenResourceOptions}
                                onPullToDesk={(res) => console.log('Pull', res.id)}
                                viewMode={viewMode === 'grid' ? 'grid' : 'list'}
                                ListHeaderComponent={
                                    <Box className="p-md">
                                        <Text className="text-[13px] text-phaseText-secondary">
                                            {searchQuery ? `Found ${resources.length} resources for "${searchQuery}"` : `Showing curated findings`}
                                        </Text>
                                    </Box>
                                }
                                onEndReached={handleEndReached}
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        )}
                    </Box>
                </Box>
            )}

            <AddResourceModal
                isOpen={isAddModalOpen && !isPastView}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddResource}
            />
            <AddCollectionModal
                isOpen={isAddCollectionModalOpen && !isPastView}
                onClose={() => setIsAddCollectionModalOpen(false)}
                onSubmit={handleCreateCollection}
            />
            {selectedResource && (
                <ResourceActionSheet
                    visible={isActionSheetVisible}
                    onClose={() => setIsActionSheetVisible(false)}
                    resource={selectedResource}
                    onBookmark={() => handleBookmark(selectedResource)}
                    onAddToCollection={() => setIsCollectionPickerVisible(true)}
                    onShare={() => handleShare(selectedResource)}
                />
            )}

            <CollectionPickerModal
                visible={isCollectionPickerVisible}
                onClose={() => setIsCollectionPickerVisible(false)}
                collections={rawUserCollections as any}
                onSelect={handleAddToCollection}
                isAdding={isAddingToCollection}
            />
        </ScreenWrapper>
    );
}

interface HeroBannerProps {
    resource: LibraryResource;
    onPress: () => void;
}

const HERO_HEIGHT = 220;

function SanctuaryPulse({
    resourceCount,
    collectionCount,
    bookmarkCount,
}: {
    resourceCount: number;
    collectionCount: number;
    bookmarkCount: number;
}) {
    const theme = useTheme();

    const items = [
        { label: 'Resources', value: resourceCount, accent: `${theme.accent.action}18` },
        { label: 'Collections', value: collectionCount, accent: `${theme.accent.reward}16` },
        { label: 'Bookmarks', value: bookmarkCount, accent: `${theme.accent.sageGreen}16` },
    ];

    return (
        <HStack className="px-md pt-sm gap-2.5">
            {items.map((item) => (
                <Box
                    key={item.label}
                    className="flex-1 rounded-[18px] border border-phase-border bg-phase-surface overflow-hidden">
                    <Box 
                        className="px-5 py-4"
                        style={{ backgroundColor: item.accent }}>
                        <Text className="text-[10px] font-extrabold tracking-widest uppercase text-phaseText-secondary">
                            {item.label}
                        </Text>
                        <Text className="text-2xl font-extrabold text-phaseText-primary mt-1">
                            {item.value}
                        </Text>
                    </Box>
                </Box>
            ))}
        </HStack>
    );
}

function HeroBanner({ resource, onPress }: HeroBannerProps) {
    const theme = useTheme();
    return (
        <Pressable onPress={onPress}>
            <Box className="h-[240px] overflow-hidden bg-phase-surface/50 mb-md mx-md rounded-3xl border border-phase-border">
                {resource.media?.url ? (
                    <ImageBackground source={{ uri: resource.media.url as string }} style={{ flex: 1 }} resizeMode="cover">
                        <HeroOverlay resource={resource} theme={theme} />
                    </ImageBackground>
                ) : (
                    <LinearGradient colors={[`${theme.accent.action}18`, `${theme.accent.reward}16`]} style={{ flex: 1 }}>
                        <HeroOverlay resource={resource} theme={theme} />
                    </LinearGradient>
                )}
            </Box>
        </Pressable>
    );
}

function HeroOverlay({ resource, theme }: { resource: LibraryResource; theme: any }) {
    return (
        <LinearGradient
            colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.1)', 'rgba(252,249,242,0.94)']}
            style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 24 }}>
            <Box className="bg-[#FCF9F2]/90 rounded-[20px] p-5 border border-white/50">
                <Box 
                    className="self-start px-2 py-1 rounded-full mb-2"
                    style={{ backgroundColor: `${theme.accent.action}18` }}>
                    <Text 
                        className="text-[10px] font-extrabold tracking-widest"
                        style={{ color: theme.accent.action }}>
                        ✧ FEATURED
                    </Text>
                </Box>
                <Text className="text-[22px] font-extrabold leading-7 mb-1.5 text-phaseText-primary">
                    {resource.title}
                </Text>
                {resource.description && (
                    <Text className="text-[13px] leading-[18px] mb-3 text-phaseText-secondary" numberOfLines={3}>
                        {resource.description}
                    </Text>
                )}
                <HStack className="items-center gap-2.5">
                    <Box 
                        className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl"
                        style={{ backgroundColor: theme.accent.action }}>
                        <Icon as={Play} size={14} color="white" fill="white" />
                        <Text className="text-white font-bold text-[13px]">Open</Text>
                    </Box>
                    {resource.creator_name ? (
                        <Text className="text-[12px] text-phaseText-secondary font-semibold">
                            Curated by {resource.creator_name}
                        </Text>
                    ) : null}
                </HStack>
            </Box>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    mapToggleButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(var(--action-rgb), 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(var(--action-rgb), 0.15)',
        marginRight: 4,
    },
    toggleBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(var(--action-rgb), 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(var(--action-rgb), 0.12)',
    },
});
