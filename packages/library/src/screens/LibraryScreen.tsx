/**
 * LibraryScreen \u2014 Netflix-Style Holistic Digital Library
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    ScrollView,
    ActivityIndicator,
    View,
    Text as RNText,
    ImageBackground,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    Platform,
    Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Box,
    VStack,
    HStack,
    Text,
    useThemedColors,
    SkeletonCard,
    PositiveInvitation,
    Theme,
    GlobalHeader,
    ScreenWrapper,
    SmartShelf,
    useBottomTabPadding,
    useRegisterFAB,
    FadeInDown,
    HorizontalChipRow,
    openExternalURL,
    showExternalLinkOptions,
    TemporalNavigator,
    CollectionCard,
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
    const colors = useThemedColors();

    return (
        <Animated.View entering={FadeInDown.delay(200).springify()}            <Pressable onPress={onPress}                <Box sx={{
                    margin: Theme.spacing.md,
                    borderRadius: 24,
                    overflow: 'hidden',
                    backgroundColor: colors.secondary,
                    borderWidth: 1,
                    borderColor: colors.border,
                }}                    <LinearGradient
                        colors={[`${Theme.colors.gurudeviViolet}26`, 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    /                    ><HStack sx={{ p: 20, gap: 16, alignItems: 'center' }}                        <Box sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: colors.overlay,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}                            <MapIcon size={32} color={Theme.colors.sanctuarySaffron} /                        ></Box                        <VStack sx={{ flex: 1, gap: 4 }}                            <Text sx={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}                                Enter the Cosmos
                            </Text                            <Text sx={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}                                Explore the hidden connections between knowledge and shared wisdom.
                            </Text                        </VStack                        <Box sx={{
                            padding: 10,
                            backgroundColor: colors.overlay,
                            borderRadius: 12
                        }}                            <Play size={16} color={colors.textPrimary} fill={colors.textPrimary} /                        ></Box                    </HStack                </Box            </Pressable        </Animated.View    );
}

function CuratorInvitation({ onPress }: { onPress: () => void }) {
    const colors = useThemedColors();

    return (
        <Animated.View entering={FadeInDown.delay(300).springify()}            <Pressable onPress={onPress}                <Box sx={{
                    margin: Theme.spacing.md,
                    marginTop: 0,
                    borderRadius: 24,
                    overflow: 'hidden',
                    backgroundColor: colors.secondary,
                    borderWidth: 1,
                    borderColor: Theme.colors.sanctuarySaffron + '33',
                }}                    <HStack sx={{ p: 16, gap: 16, alignItems: 'center' }}                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: Theme.colors.sanctuarySaffron + '11',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}                            <FileText size={24} color={Theme.colors.sanctuarySaffron} /                        ></Box                        <VStack sx={{ flex: 1, gap: 2 }}                            <Text sx={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}                                Curator Dashboard
                            </Text                            <Text sx={{ fontSize: 12, color: colors.textSecondary }}                                Review {'&'} publish new knowledge streams.
                            </Text                        </VStack                        <Plus size={16} color={colors.textSecondary} /                    ></HStack                </Box            </Pressable        </Animated.View    );
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

    const colors = useThemedColors();
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

    const trending = useMemo(() =        [...resources].sort((a, b) => (b.endorsements ?? 0) - (a.endorsements ?? 0)).slice(0, 10),
        [resources]);

    const newArrivals = useMemo(() =        [...resources].sort((a, b) =            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        ).slice(0, 10),
        [resources]);

    const heroResource = trending[0] ?? newArrivals[0] ?? null;

    // (moved up)

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
        showExternalLinkOptions(resource.url, buildLibraryExternalLinkOptions(resource)).catch((err) =            console.error("Couldn't show external link options", err)
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
        { label: `\uD83D\uDD52 ${t('library.sort.recent')}`, value: 'recent' },
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
            <Box sx={{ marginBottom: Theme.spacing.lg }}                <SmartShelf key={label} title={label} onSeeAll={onSeeAll}                    {items.map(res => (
                        <LibraryThumbnailCard>
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
                        /                    >))}
                </SmartShelf            </Box        );
    }, [handleOpenResource]);

    return (
        <ScreenWrapper scroll={!isSearchMode} noTopInset={true}            <GlobalHeader>
                title={t('tabs.library') || 'Library'}
                subtitle={t('library.knowledgeSanctuary')}
                showSearch
                searchProps={{
                    value: searchQuery,
                    onChangeText: setSearchQuery,
                    placeholder: t('library.searchPlaceholder')
                }}
                rightAction={
                    <HStack sx={{ gap: 8, alignItems: 'center' }}                        {isSyncing && (>
                            <Animated.View entering={FadeInDown}                                <Box sx={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.sanctuarySaffron }} /                            ></Animated.View                        >)}
                        <TouchableOpacity>
                            onPress={() => navigation.navigate('LibraryMap' as any)}
                            style={styles.mapToggleButton}
                                                    <MapIcon size={20} color={colors.textPrimary} /                        ></TouchableOpacity                    </HStack                }
            /            ><Box sx={{ px: Theme.spacing.md, pb: Theme.spacing.sm }}                <TemporalNavigator /            ></Box
            {libraryError ? (
                <VStack sx={{ p: Theme.spacing.md, mt: Theme.spacing.lg, alignItems: 'center', gap: 12 }}                    <Text sx={{ color: colors.error, textAlign: 'center' }}                        {t('library.errorLoading') || 'Failed to load sanctuary wisdom.'}>
                    </Text                    <TouchableOpacity onPress={() => fetchResources()}                        <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '700' }}>Retry</Text                    ></TouchableOpacity                </VStack            ) : (loading || isFetchingPublic) && !refreshing ? (
                <VStack sx={{ p: Theme.spacing.md, mt: Theme.spacing.lg, gap: 16 }}                    <SkeletonCard height={200} /                    ><SkeletonCard height={160} /                    ><SkeletonCard height={160} /                ></VStack            ) : (
                <Box sx={{ flex: 1 }}                    {!isSearchMode && (>
                        <HStack sx={{ px: Theme.spacing.md, py: 12, gap: 12 }}                            <TouchableOpacity >
                                onPress={() => !isPastView && setIsAddCollectionModalOpen(true)}
                                style={[styles.actionBtn, { borderColor: Theme.colors.sanctuarySaffron + '88' }]}
                                                            <Library size={14} color={Theme.colors.sanctuarySaffron} /                                ><Text sx={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>+ Collection</Text                            ></TouchableOpacity                        </HStack                    )}

                    <Box sx={{ flex: 1, backgroundColor: colors.secondary }}                        <Animated.View entering={FadeInDown.delay(100).springify()}                            <HorizontalChipRow>
                                chips={chipData}
                                selectedValue={selectedCategoryId}
                                onSelect={setSelectedCategoryId}
                                size="sm"
                            /                        ></Animated.View                        
                        <Animated.View entering={FadeInDown.delay(160).springify()}                            <HStack sx={{ px: Theme.spacing.md, pb: Theme.spacing.sm, justifyContent: 'space-between', alignItems: 'center' }}                                <Box sx={{ flex: 1 }}                                    <HorizontalChipRow>
                                        chips={sortChips}
                                        selectedValue={selectedSort}
                                        onSelect={(v) => setSelectedSort(v as typeof selectedSort)}
                                        size="sm"
                                    /                                ></Box                                <HStack sx={{ gap: 4, backgroundColor: colors.overlay, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: colors.border }}                                    <TouchableOpacity 
                                        onPress={() => setViewMode('shelf')} 
                                        style={[styles.toggleBtn, viewMode === 'shelf' && { backgroundColor: Theme.colors.sanctuarySaffron }]}
                                                                            <Layers size={14} color={viewMode === 'shelf' ? Theme.colors.sacredWhite : colors.textSecondary} /                                    ></TouchableOpacity                                    <TouchableOpacity 
                                        onPress={() => setViewMode('grid')} 
                                        style={[styles.toggleBtn, viewMode === 'grid' && { backgroundColor: Theme.colors.sanctuarySaffron }]}
                                                                            <LayoutGrid size={14} color={viewMode === 'grid' ? Theme.colors.sacredWhite : colors.textSecondary} /                                    </TouchableOpacity                                    <TouchableOpacity >
                                        onPress={() => setViewMode('list')} 
                                        style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: Theme.colors.sanctuarySaffron }]}
                                                                            <List size={14} color={viewMode === 'list' ? Theme.colors.sacredWhite : colors.textSecondary} /                                    </TouchableOpacity                                </HStack                            </HStack                        </Animated.View>
                        {viewMode === 'shelf' && !isSearchMode ? (>
                            <ScrollView >
                                style={{ flex: 1 }}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: bottomPadding + Theme.spacing.xl }}
                                refreshControl={>
                                    <ActivityIndicator animating={refreshing} color={Theme.colors.sanctuarySaffron} /                                >}
                                                            {heroResource && (
                                    <HeroBanner resource={heroResource} onPress={() => handleOpenResource(heroResource)} /                                >)}
                                <MapInvitation onPress={() => navigation.navigate('LibraryMap' as any)} /                                ><FeatureGuard action="manage" subject="LibraryCuratorDashboard"                                    <CuratorInvitation onPress={() => navigation.navigate('CuratorReview' as any)} /                                ></FeatureGuard                                <Box sx={{ paddingTop: Theme.spacing.md }}                                    {deskItems && deskItems.filter((r: any) => r.type === 'resource').length > 0 && (
                                        <SmartShelf title="\u25B6 Continue Learning"                                            {deskItems.filter((r: any) => r.type === 'resource').map((res: any) => (
                                                <LibraryThumbnailCard>
                                                    key={res.id}
                                                    title={res.title}
                                                    type={res.type}
                                                    onPress={() => handleOpenResource(res)}
                                                    onLongPress={res.url ? () => handleOpenResourceOptions(res) : undefined}
                                                /                                            >))}
                                        </SmartShelf                                    )}
                                    {bookmarkedResources.length > 0 && (
                                        <SmartShelf title="\uD83D\uDD16 My Bookmarks"                                            {bookmarkedResources.map((res: any) => (
                                                <LibraryThumbnailCard>
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
                                                /                                            >))}
                                        </SmartShelf                                    )}
                                    {collections.length > 0 && (
                                        <Box sx={{ marginBottom: Theme.spacing.lg }}                                            <SmartShelf title={rawUserCollections.length > 0 ? "\uD83D\uDCDA Your Collections" : "\uD83C\uDF1F Discover Collections"}                                                {collections.map((col: any) => (
                                                    <CollectionCard>
                                                        key={col.id}
                                                        title={col.name}
                                                        creator={col.creator_name}
                                                        resourceCount={col.resource_ids?.length || 0}
                                                        subjectTag={col.subjects?.[0] || 'General'}
                                                        thumbnailUrl={col.thumbnail_url}
                                                        verified={col.is_official}
                                                        contextData={col}
                                                        onPress={(collection) =                                                            navigation.navigate('CollectionDetail', { id: collection.id, title: collection.name })
                                                        }
                                                    /                                                >))}
                                            </SmartShelf                                        </Box                                    )}
                                    {orderedShelfDefs.map(shelf => {
                                        const items = resources.filter((r: LibraryResource) => (shelf.types as readonly string[]).includes(r.type));
                                        return renderShelf(shelf.label, items);
                                    })}
                                    {trending.length > 0 && renderShelf('\u2B50 Trending', trending)}
                                    {newArrivals.length > 0 && renderShelf('\u2728 New Arrivals', newArrivals)}
                                </Box                            </ScrollView                        ) : (
                            <ResourceList>
                                resources={resources}
                                onOpenResource={handleOpenResource}
                                onOpenResourceOptions={handleOpenResourceOptions}
                                onPullToDesk={(res) => console.log('Pull', res.id)}
                                viewMode={viewMode === 'grid' ? 'grid' : 'list'}
                                ListHeaderComponent={
                                    <Box sx={{ p: Theme.spacing.md }}                                        <Text sx={{ fontSize: 13, color: colors.textSecondary }}                                            {searchQuery ? `Found ${resources.length} resources for "${searchQuery}"` : `Showing curated findings`}>
                                        </Text                                    </Box                                }
                                onEndReached={handleEndReached}
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            /                        >)}
                    </Box                </Box            )}

            <AddResourceModal>
                isOpen={isAddModalOpen && !isPastView}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddResource}
            /
            ><AddCollectionModal
                isOpen={isAddCollectionModalOpen && !isPastView}
                onClose={() => setIsAddCollectionModalOpen(false)}
                onAdd={handleCreateCollection}
            /
            >{selectedResource && (
                <ResourceActionSheet>
                    visible={isActionSheetVisible}
                    onClose={() => setIsActionSheetVisible(false)}
                    resource={selectedResource}
                    onBookmark={() => handleBookmark(selectedResource)}
                    onAddToCollection={() => setIsCollectionPickerVisible(true)}
                    onShare={() => handleShare(selectedResource)}
                /            >)}

            <CollectionPickerModal>
                visible={isCollectionPickerVisible}
                onClose={() => setIsCollectionPickerVisible(false)}
                collections={rawUserCollections as any}
                onSelect={handleAddToCollection}
                isAdding={isAddingToCollection}
            /        ></ScreenWrapper    );
}

interface HeroBannerProps {
    resource: LibraryResource;
    onPress: () => void;
}

const HERO_HEIGHT = 220;

function HeroBanner({ resource, onPress }: HeroBannerProps) {
    const colors = useThemedColors();
    return (
        <Pressable onPress={onPress}            <Box sx={{ height: HERO_HEIGHT, overflow: 'hidden', backgroundColor: colors.secondary, mb: Theme.spacing.md }}                {resource.media?.url ? (>
                    <ImageBackground source={{ uri: resource.media.url as string }} style={{ flex: 1 }} resizeMode="cover"                        <HeroOverlay resource={resource} colors={colors} /                    ></ImageBackground                ) : (
                    <Box sx={{ flex: 1, backgroundColor: `${colors.action}18` }}                        <HeroOverlay resource={resource} colors={colors} /                    ></Box                )}
            </Box        </Pressable    );
}

function HeroOverlay({ resource, colors }: { resource: LibraryResource; colors: any }) {
    return (
        <LinearGradient >
            colors={['transparent', `${colors.obsidian}88`, `${colors.obsidian}EE`]}
            style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: Theme.spacing.lg }}
                    <Box sx={{ alignSelf: 'flex-start', backgroundColor: Theme.colors.sanctuarySaffron, px: 8, py: 3, borderRadius: 4, mb: 8 }}                <Text sx={{ fontSize: 10, fontWeight: '800', color: Theme.colors.sacredWhite, letterSpacing: 1 }}>\u2727 FEATURED</Text            ></Box            ><Text sx={{ fontSize: 22, fontWeight: '800', lineHeight: 28, mb: 6, color: colors.textPrimary }}>{resource.title}</Text            >{resource.description && (
                <Text sx={{ fontSize: 13, lineHeight: 18, mb: 12, color: colors.textSecondary }} numberOfLines={2}                    {resource.description}>
                </Text            )}>
            <HStack sx={{ alignItems: 'center', gap: 10 }}                <Box sx={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Theme.colors.sanctuarySaffron, px: 14, py: 8, borderRadius: 12 }}                    <Play size={14} color={Theme.colors.sacredWhite} fill={Theme.colors.sacredWhite} /                    ><Text sx={{ color: Theme.colors.sacredWhite, fontWeight: '700', fontSize: 13 }}>Open</Text                ></Box            </HStack        </LinearGradient    );
}

const styles = StyleSheet.create({
    mapToggleButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: Theme.colors.glass.light.highlight,
        borderWidth: 1,
        borderColor: Theme.colors.glass.light.border,
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
        backgroundColor: Theme.colors.glass.light.highlight,
        borderWidth: 1,
        borderColor: Theme.colors.glass.light.border,
    },
});
