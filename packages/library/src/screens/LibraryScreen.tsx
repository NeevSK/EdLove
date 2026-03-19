/**
 * LibraryScreen — Netflix-Style Holistic Digital Library
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
    CollectionCard,
    LibraryThumbnailCard,
    useBottomTabPadding,
    useRegisterFAB,
    FadeInDown,
    HorizontalChipRow,
    openExternalURL,
} from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import AddResourceModal from '../components/AddResourceModal';
import { ResourceList } from '../components/ResourceList';
import { Map as MapIcon, Play, Plus, FileText, Layers, LayoutGrid, List } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLibrary } from '../hooks/useLibrary';
import { LibraryResource } from '../types';
import {
    useUserRole,
    useRoleFeatures,
    useTracking,
    supabase,
    useStore,
} from '@repo/core';
import { LIBRARY_UI_CATEGORIES } from '../constants/categories';
import { libraryAPI } from '../api/library';
import { SHELF_DEFS, getOrderedShelfDefs } from '../constants/shelf';

// Local shelf definitions removed in favor of shared constants


function MapInvitation({ onPress }: { onPress: () => void }) {
    const colors = useThemedColors();

    return (
        <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Pressable onPress={onPress}>
                <Box sx={{
                    margin: Theme.spacing.md,
                    borderRadius: 24,
                    overflow: 'hidden',
                    backgroundColor: colors.secondary,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                }}>
                    <LinearGradient
                        colors={['rgba(138, 43, 226, 0.2)', 'rgba(0, 0, 0, 0)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <HStack sx={{ p: 20, gap: 16, alignItems: 'center' }}>
                        <Box sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <MapIcon size={32} color={Theme.colors.sanctuarySaffron} />
                        </Box>
                        <VStack sx={{ flex: 1, gap: 4 }}>
                            <Text sx={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
                                Enter the Cosmos
                            </Text>
                            <Text sx={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                                Explore the hidden connections between knowledge and shared wisdom.
                            </Text>
                        </VStack>
                        <Box sx={{
                            padding: 10,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 12
                        }}>
                            <Play size={16} color={colors.textPrimary} fill={colors.textPrimary} />
                        </Box>
                    </HStack>
                </Box>
            </Pressable>
        </Animated.View>
    );
}

function CuratorInvitation({ onPress }: { onPress: () => void }) {
    const colors = useThemedColors();

    return (
        <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Pressable onPress={onPress}>
                <Box sx={{
                    margin: Theme.spacing.md,
                    marginTop: 0,
                    borderRadius: 24,
                    overflow: 'hidden',
                    backgroundColor: colors.secondary,
                    borderWidth: 1,
                    borderColor: Theme.colors.sanctuarySaffron + '33',
                }}>
                    <HStack sx={{ p: 16, gap: 16, alignItems: 'center' }}>
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: Theme.colors.sanctuarySaffron + '11',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <FileText size={24} color={Theme.colors.sanctuarySaffron} />
                        </Box>
                        <VStack sx={{ flex: 1, gap: 2 }}>
                            <Text sx={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>
                                Curator Dashboard
                            </Text>
                            <Text sx={{ fontSize: 12, color: colors.textSecondary }}>
                                Review {'&'} publish new knowledge streams.
                            </Text>
                        </VStack>
                        <Plus size={16} color={colors.textSecondary} />
                    </HStack>
                </Box>
            </Pressable>
        </Animated.View>
    );
}

export default function LibraryScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role } = useUserRole();
    const { isGuest } = useRoleFeatures();

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');
    const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'most_endorsed' | 'most_bookmarked'>('recent');
    const [viewMode, setViewMode] = useState<'shelf' | 'grid' | 'list'>('shelf');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [fallbackAttempted, setFallbackAttempted] = useState(false);
    const isFetchingPublicRef = React.useRef(false);

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

    const {
        resources: rawResources,
        collections: rawCollections,
        loading,
        error: libraryError,
        fetchResources,
        fetchNextResources,
        hasNextResources,
        isFetchingNextResources,
        syncLibrary,
    } = useLibrary(libraryFilters, libraryFilters);

    const [publicCollections, setPublicCollections] = useState<any[]>([]);
    const [isFetchingPublic, setIsFetchingPublic] = useState(false);

    React.useEffect(() => {
        discoverFeature('section_library');

        // Trigger knowledge index sync (Whispered Moment)
        setIsSyncing(true);
        syncLibrary()
            .catch(err => console.error('Library sync failed in background:', err))
            .finally(() => setIsSyncing(false));
    }, []);

    React.useEffect(() => {
        if (!loading && rawResources.length === 0 && rawCollections.length === 0 && publicCollections.length === 0 && !fallbackAttempted && !isFetchingPublicRef.current) {
            console.log('📚 LibraryScreen: Attempting public collection fallback fetch');
            isFetchingPublicRef.current = true;
            setIsFetchingPublic(true);
            libraryAPI.getCollections({ limit: 10, visibility: 'public' })
                .then(cols => {
                    setPublicCollections(cols);
                    setFallbackAttempted(true); // Successfully attempted, don't loop
                })
                .catch(err => {
                    console.error('Failed to fetch public fallback:', err);
                    setFallbackAttempted(true); // Stop retrying on failure
                })
                .finally(() => {
                    setIsFetchingPublic(false);
                    isFetchingPublicRef.current = false;
                });
        }
    }, [loading, rawResources.length, rawCollections.length, publicCollections.length, fallbackAttempted]);

    const resources = useMemo(() => rawResources, [rawResources]);
    const collections = useMemo(() => 
        rawCollections.length > 0 ? rawCollections : publicCollections
    , [rawCollections, publicCollections]);

    const trending = useMemo(() =>
        [...resources].sort((a, b) => (b.endorsements ?? 0) - (a.endorsements ?? 0)).slice(0, 10),
        [resources]);

    const newArrivals = useMemo(() =>
        [...resources].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 10),
        [resources]);

    const heroResource = trending[0] ?? newArrivals[0] ?? null;

    const { deskItems, user } = useStore();

    const orientationSeeds = user?.orientation_seeds ?? null;
    const orderedShelfDefs = useMemo(() => getOrderedShelfDefs(orientationSeeds), [orientationSeeds]);

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
        openExternalURL(resource.url).catch(err => console.error("Couldn't load page", err));
    }, [navigation]);

    const handleAddResource = useCallback(async () => {
        try {
            await fetchResources();
        } catch (err) {
            console.error('Failed to refresh after add', err);
        }
    }, [fetchResources]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchResources();
        if (resources.length === 0) {
            const pub = await libraryAPI.getCollections({ limit: 10, visibility: 'public' });
            setPublicCollections(pub);
        }
        setRefreshing(false);
    }, [fetchResources, resources.length]);

    const chipData = useMemo(() => LIBRARY_UI_CATEGORIES.map(cat => ({
        label: cat.en,
        value: cat.id,
    })), []);

    const sortChips = useMemo(() => [
        { label: `🕒 ${t('library.sort.recent')}`, value: 'recent' },
        { label: `🔥 ${t('library.sort.popular')}`, value: 'popular' },
        { label: `🌟 ${t('library.sort.most_endorsed')}`, value: 'most_endorsed' },
        { label: `🔖 ${t('library.sort.most_bookmarked')}`, value: 'most_bookmarked' },
    ], [t]);

    const handleEndReached = useCallback(() => {
        if (hasNextResources && !isFetchingNextResources) fetchNextResources();
    }, [hasNextResources, isFetchingNextResources, fetchNextResources]);

    // Register FAB globally — memoized to prevent infinite loop
    const fabConfig = useMemo(() => ({
        tabType: 'library' as const,
        onPress: () => setIsAddModalOpen(true),
        visible: !loading
    }), [loading]);

    useRegisterFAB(fabConfig);

    const getYoutubeThumbnail = (url?: string) => {
        if (!url) return undefined;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
        return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : undefined;
    };

    const renderShelf = useCallback((label: string, items: LibraryResource[], onSeeAll?: () => void) => {
        if (items.length === 0) return null;
        return (
            <Box sx={{ marginBottom: Theme.spacing.lg }}>
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
                        />
                    ))}
                </SmartShelf>
            </Box>
        );
    }, [handleOpenResource]);

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
                    <HStack sx={{ gap: 8, alignItems: 'center' }}>
                        {isSyncing && (
                            <Animated.View entering={FadeInDown}>
                                <Box sx={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.sanctuarySaffron }} />
                            </Animated.View>
                        )}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('LibraryMap' as any)}
                            style={styles.mapToggleButton}
                        >
                            <MapIcon size={20} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </HStack>
                }
            />

            {libraryError ? (
                <VStack space="md" px={Theme.spacing.md} mt={Theme.spacing.lg} alignItems="center">
                    <Text sx={{ color: colors.error, textAlign: 'center' }}>
                        {t('library.errorLoading') || 'Failed to load sanctuary wisdom.'}
                    </Text>
                    <Text sx={{ color: colors.textSecondary, fontSize: 12 }}>{libraryError}</Text>
                    <TouchableOpacity onPress={() => fetchResources()}>
                        <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '700' }}>Retry</Text>
                    </TouchableOpacity>
                </VStack>
            ) : (loading || isFetchingPublic) && !refreshing ? (
                <VStack space="md" px={Theme.spacing.md} mt={Theme.spacing.lg}>
                    <SkeletonCard height={200} />
                    <SkeletonCard height={160} />
                    <SkeletonCard height={160} />
                </VStack>
            ) : isSearchMode ? (
                <Box sx={{ flex: 1, backgroundColor: colors.secondary }}>
                    <Animated.View entering={FadeInDown.delay(100).springify()}>
                        <HorizontalChipRow
                            chips={chipData}
                            selectedValue={selectedCategoryId}
                            onSelect={setSelectedCategoryId}
                            size="sm"
                        />
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(160).springify()}>
                        <HStack sx={{ px: Theme.spacing.md, pb: Theme.spacing.sm, justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ flex: 1 }}>
                                <HorizontalChipRow
                                    chips={sortChips}
                                    selectedValue={selectedSort}
                                    onSelect={(v) => setSelectedSort(v as typeof selectedSort)}
                                    size="sm"
                                />
                            </Box>
                            
                            {/* View Mode Toggle */}
                            <HStack sx={{ gap: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                <TouchableOpacity 
                                    onPress={() => setViewMode('shelf')} 
                                    style={[styles.toggleBtn, viewMode === 'shelf' && { backgroundColor: Theme.colors.sanctuarySaffron }]}
                                >
                                    <Layers size={14} color={viewMode === 'shelf' ? '#fff' : colors.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => setViewMode('grid')} 
                                    style={[styles.toggleBtn, viewMode === 'grid' && { backgroundColor: Theme.colors.sanctuarySaffron }]}
                                >
                                    <LayoutGrid size={14} color={viewMode === 'grid' ? '#fff' : colors.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => setViewMode('list')} 
                                    style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: Theme.colors.sanctuarySaffron }]}
                                >
                                    <List size={14} color={viewMode === 'list' ? '#fff' : colors.textSecondary} />
                                </TouchableOpacity>
                            </HStack>
                        </HStack>
                    </Animated.View>

                    {viewMode === 'shelf' ? (
                        <ScrollView style={{ flex: 1 }}>
                            <Box sx={{ p: Theme.spacing.md }}>
                                <Text sx={{ fontSize: 13, color: colors.textSecondary, marginBottom: Theme.spacing.md }}>
                                    {searchQuery ? `Found ${resources.length} findings and ${collections.length} collections for "${searchQuery}"` : `Showing curated findings`}
                                </Text>

                                {collections.length > 0 && (
                                    <Box sx={{ mb: Theme.spacing.lg }}>
                                        <SmartShelf title="📚 Matching Collections">
                                            {collections.map((col: any) => (
                                                <CollectionCard
                                                    key={col.id}
                                                    title={col.name}
                                                    creator={col.creator_name}
                                                    resourceCount={col.resource_ids?.length ?? 0}
                                                    subjectTag={col.subjects?.[0] || ''}
                                                    onPress={() => navigation.navigate('CollectionDetail', { id: col.id, title: col.name })}
                                                />
                                            ))}
                                        </SmartShelf>
                                    </Box>
                                )}
                                
                                {orderedShelfDefs.map(shelf => {
                                    // Memoize or at least keep local to avoid double-filtering in larger components
                                    const shelfItems = resources.filter(res => shelf.types.includes(res.type));
                                    if (shelfItems.length === 0) return null;
                                    return renderShelf(shelf.label, shelfItems);
                                })}

                                {resources.filter(res => !orderedShelfDefs.some(s => s.types.includes(res.type))).length > 0 && (
                                    (() => {
                                        const diverseItems = resources.filter(res => !orderedShelfDefs.some(s => s.types.includes(res.type)));
                                        return renderShelf('Diverse Findings', diverseItems);
                                    })()
                                )}
                            </Box>
                        </ScrollView>
                    ) : (
                        <ResourceList
                            resources={resources}
                            onOpenResource={handleOpenResource}
                            onPullToDesk={(res) => console.log('Pull to desk', res.id)}
                            viewMode={viewMode === 'grid' ? 'grid' : 'list'}
                            ListHeaderComponent={<Box sx={{ p: Theme.spacing.md, pb: 0 }}>
                                <Text sx={{ fontSize: 13, color: colors.textSecondary }}>
                                    {searchQuery ? `Found ${resources.length} findings for "${searchQuery}"` : `Showing curated findings`}
                                </Text>
                            </Box>}
                            ListFooterComponent={isFetchingNextResources ? (
                                <ActivityIndicator size="small" color={Theme.colors.sanctuarySaffron} style={{ padding: 20 }} />
                            ) : null}
                            onEndReached={handleEndReached}
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    )}
                </Box>
            ) : (
                <ScrollView
                    style={{ flex: 1, backgroundColor: colors.primary }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: bottomPadding + Theme.spacing.xl }}
                >
                    {heroResource && (
                        <HeroBanner resource={heroResource} onPress={() => handleOpenResource(heroResource)} />
                    )}

                    <MapInvitation onPress={() => navigation.navigate('LibraryMap' as any)} />

                    {(role === 'founder' || role === 'admin' || role === 'developer') && (
                        <CuratorInvitation onPress={() => navigation.navigate('CuratorReview' as any)} />
                    )}

                    <Box sx={{ paddingTop: Theme.spacing.md }}>
                        <Animated.View entering={FadeInDown.delay(100).springify()}>
                            <HorizontalChipRow
                                chips={chipData}
                                selectedValue={selectedCategoryId}
                                onSelect={setSelectedCategoryId}
                                size="sm"
                            />
                        </Animated.View>

                        {deskItems && deskItems.filter((r: any) => r.type === 'resource').length > 0 && (
                            <SmartShelf title="▶ Continue Learning">
                                {deskItems.filter((r: any) => r.type === 'resource').map((res: any) => (
                                    <LibraryThumbnailCard
                                        key={res.id}
                                        title={res.title}
                                        type={res.type}
                                        thumbnailUrl={res.thumbnailUrl}
                                        onPress={() => handleOpenResource(res)}
                                    />
                                ))}
                            </SmartShelf>
                        )}

                        {collections.length > 0 && (
                            <Box sx={{ marginBottom: Theme.spacing.lg }}>
                                <SmartShelf title={rawCollections.length > 0 ? "📚 Featured Collections" : "🌟 Discover Sanctuary Collections"}>
                                    {collections.map((col: any) => (
                                        <CollectionCard
                                            key={col.id}
                                            title={col.name}
                                            creator={col.creator_name}
                                            resourceCount={col.resource_ids?.length ?? 0}
                                            subjectTag={col.subjects?.[0] || ''}
                                            onPullToDesk={() => { }}
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

                        {resources.length === 0 && rawCollections.length === 0 && !isFetchingPublic && (
                             <VStack sx={{ mt: Theme.spacing.xl, alignItems: 'center', opacity: 0.8 }}>
                                <PositiveInvitation
                                    context="library"
                                    onAction={() => setIsAddModalOpen(true)}
                                />
                                <Text sx={{ color: colors.textSecondary, fontSize: 13, mt: Theme.spacing.md }}>
                                    Your personal sanctuary is quiet.
                                </Text>
                             </VStack>
                        )}
                    </Box>
                </ScrollView>
            )}

            <AddResourceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddResource}
            />
        </ScreenWrapper>
    );
}

const HERO_HEIGHT = 220;

function HeroBanner({ resource, onPress }: HeroBannerProps) {
    const colors = useThemedColors();

    return (
        <Pressable onPress={onPress} style={heroBannerStyles.pressable}>
            <View style={[heroBannerStyles.container, { backgroundColor: colors.secondary }]}>
                {resource.media?.url ? (
                    <ImageBackground
                        source={{ uri: resource.media.url as string }}
                        style={heroBannerStyles.image}
                        resizeMode="cover"
                    >
                        <HeroOverlay resource={resource} colors={colors} />
                    </ImageBackground>
                ) : (
                    <View style={[heroBannerStyles.fallback, { backgroundColor: Theme.colors.sanctuarySaffron + '18' }]}>
                        <HeroOverlay resource={resource} colors={colors} />
                    </View>
                )}
            </View>
        </Pressable>
    );
}

function HeroOverlay({ resource, colors }: { resource: LibraryResource; colors: any }) {
    const gradientColors: [string, string, string] = [
        'transparent',
        colors.primary + 'BB',
        colors.primary,
    ];

    return (
        <LinearGradient colors={gradientColors} style={heroBannerStyles.gradient}>
            <View style={heroBannerStyles.featuredBadge}>
                <RNText style={heroBannerStyles.featuredText}>✧ FEATURED</RNText>
            </View>
            <RNText style={[heroBannerStyles.heroTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                {resource.title}
            </RNText>
            {resource.description ? (
                <RNText style={[heroBannerStyles.heroDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {resource.description}
                </RNText>
            ) : null}
            <View style={heroBannerStyles.playRow}>
                <View style={heroBannerStyles.playBtn}>
                    <Play size={14} color="#fff" fill="#fff" />
                    <RNText style={heroBannerStyles.playText}>Open</RNText>
                </View>
                {resource.copyright_notice && (
                    <View style={heroBannerStyles.copyrightBadge}>
                        <RNText style={heroBannerStyles.copyrightText} numberOfLines={1}>
                            © {resource.copyright_notice}
                        </RNText>
                    </View>
                )}
            </View>
        </LinearGradient>
    );
}

interface HeroBannerProps {
    resource: LibraryResource;
    onPress: () => void;
}

const heroBannerStyles = StyleSheet.create({
    pressable: { marginBottom: Theme.spacing.md },
    container: { height: HERO_HEIGHT, overflow: 'hidden' },
    image: { flex: 1 },
    fallback: { flex: 1 },
    gradient: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.lg,
        paddingTop: Theme.spacing.xl,
    },
    featuredBadge: {
        alignSelf: 'flex-start',
        backgroundColor: Theme.colors.sanctuarySaffron,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginBottom: Theme.spacing.sm,
    },
    featuredText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1 },
    heroTitle: { fontSize: 22, fontWeight: '800', lineHeight: 28, marginBottom: 6 },
    heroDesc: { fontSize: 13, lineHeight: 18, marginBottom: Theme.spacing.sm },
    playRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    playBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Theme.colors.sanctuarySaffron,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Theme.corners.comfortable,
    },
    playText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    copyrightBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.2)',
        maxWidth: 200,
    },
    copyrightText: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
});

const styles = StyleSheet.create({
    mapToggleButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginRight: 4,
    },
    toggleBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
