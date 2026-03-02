/**
 * LibraryScreen — Netflix-Style Holistic Digital Library
 *
 * Structure (like Netflix, not a playlist):
 * ┌─────────────────────────────────────────────────┐
 * │  GlobalHeader  (search bar)                     │
 * ├─────────────────────────────────────────────────┤
 * │  Hero Banner  (featured / trending resource)    │
 * ├─────────────────────────────────────────────────┤
 * │  Category chips (scroll left/right)             │
 * ├─────────────────────────────────────────────────┤
 * │  SmartShelf row: Inspiring Films                │
 * │  SmartShelf row: Maps & Visuals                 │
 * │  SmartShelf row: Stories                        │
 * │  SmartShelf row: Edu Circulars                  │
 * │  SmartShelf row: Teacher Guides                 │
 * │  SmartShelf row: Tech Guides                    │
 * │  SmartShelf row: Videos                         │
 * │  SmartShelf row: Documents                      │
 * │  SmartShelf row: Trending (most endorsed)       │
 * │  SmartShelf row: New Arrivals                   │
 * ├─────────────────────────────────────────────────┤
 * │  LotusPetalFAB (add resource)                   │
 * └─────────────────────────────────────────────────┘
 *
 * Search mode: category chips + ResourceList (vertical dense rows)
 * No-search mode: full Netflix shelf layout
 *
 * Copyright policy: externally-sourced content (trailers, circulars, maps)
 * always display a copyright_notice badge.  Contributors are shown the
 * copyright reminder in AddResourceModal when these types are selected.
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
    LotusPetalFAB,
    FadeInDown,
    HorizontalChipRow,
    openExternalURL,
} from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import AddResourceModal from '../components/AddResourceModal';
import { ResourceList } from '../components/ResourceList';
import { useTranslation } from 'react-i18next';
import { Play, Plus } from 'lucide-react-native';
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

// Shelf definitions — each defines which resource types appear in that row
// and the sort order used when the full list is grouped.
const SHELF_DEFS = [
    { id: 'movie_trailer', label: '🎬 Inspiring Films', types: ['movie_trailer'] },
    { id: 'map', label: '🗺️ Maps & Visuals', types: ['map', 'infographic'] },
    { id: 'story', label: '📖 Stories', types: ['story'] },
    { id: 'circular', label: '📋 Edu Circulars', types: ['circular'] },
    { id: 'guide', label: '👩‍🏫 Teacher Guides', types: ['guide'] },
    { id: 'tech_guide', label: '💡 Tech Guides', types: ['tech_guide'] },
    { id: 'video', label: '🎥 Videos', types: ['video'] },
    { id: 'doc', label: '📄 Documents', types: ['pdf', 'doc', 'lesson', 'worksheet', 'reading', 'pedagogy'] },
    { id: 'link', label: '🌐 Web Resources', types: ['link'] },
] as const;

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function LibraryScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role } = useUserRole();
    const { isGuest } = useRoleFeatures();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');
    const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'most_endorsed' | 'most_bookmarked'>('recent');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();
    const { discoverFeature } = useTracking();

    React.useEffect(() => {
        discoverFeature('section_library');
    }, []);

    // In Netflix mode we fetch everything (up to 60 items) and group client-side.
    // In search/filter mode we pass the filter down to the API.
    const isSearchMode = searchQuery.trim().length > 0 || selectedCategoryId !== 'All';

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
        isFetchingNextResources,
    } = useLibrary(
        isSearchMode
            ? { type: resourceTypeFilter, search: searchQuery || undefined, sort_by: selectedSort }
            : { limit: 60 }   // fetch wide for Netflix shelf grouping
    );

    // Group resources by type for the shelf layout
    const shelfData = useMemo(() => {
        const byType: Record<string, LibraryResource[]> = {};
        for (const res of resources) {
            const type = res.type;
            if (!type) continue;
            if (!byType[type]) byType[type] = [];
            byType[type].push(res);
        }
        return byType;
    }, [resources]);

    // Trending = most endorsed across all types
    const trending = useMemo(() =>
        [...resources].sort((a, b) => (b.endorsements ?? 0) - (a.endorsements ?? 0)).slice(0, 10),
        [resources]);

    // New arrivals = most recent
    const newArrivals = useMemo(() =>
        [...resources].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 10),
        [resources]);

    // Hero = first trending item (most endorsed)
    const heroResource = trending[0] ?? newArrivals[0] ?? null;

    const { deskItems, removeFromDeskLocal, user } = useStore();

    /**
     * Orientation-aware shelf ordering.
     * If the user has orientation_seeds, we re-order shelves to match their
     * tendencies WITHOUT ever telling them why the order changed.
     *
     * depth_breadth < 50  → deep content (guides, docs) rises
     * depth_breadth > 50  → visual/exploratory content (maps, stories) rises
     * solo_social   < 50  → individual reflection content (stories, guides) rises
     * solo_social   > 50  → community-adjacent content (films, links) rises
     * reflect_act   < 50  → reading/reflection content rises
     * reflect_act   > 50  → how-to/tech content rises
     */
    const orientationSeeds = user?.orientation_seeds ?? null;
    const orderedShelfDefs = useMemo(() => {
        if (!orientationSeeds) return [...SHELF_DEFS];

        const depthBreadth = orientationSeeds.depth_breadth;
        const soloSocial = orientationSeeds.solo_social;
        const reflectAct = orientationSeeds.reflect_act;

        const priority: Record<string, number> = {
            movie_trailer: soloSocial > 55 ? 10 : 0,
            map: depthBreadth > 55 ? 15 : depthBreadth < 45 ? 5 : 10,
            story: reflectAct < 45 ? 14 : 8,
            circular: 0,
            guide: (depthBreadth < 45 || reflectAct < 45) ? 20 : 10,
            tech_guide: reflectAct > 55 ? 18 : 8,
            video: soloSocial > 55 ? 12 : 6,
            doc: depthBreadth < 45 ? 16 : 8,
            link: depthBreadth > 55 ? 10 : 4,
        };

        return [...SHELF_DEFS].sort((a, b) => (priority[b.id] ?? 0) - (priority[a.id] ?? 0));
    }, [orientationSeeds]);

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
        setRefreshing(false);
    }, [fetchResources]);

    const chipData = useMemo(() => LIBRARY_UI_CATEGORIES.map(cat => ({
        label: cat.en,
        value: cat.id,
    })), []);

    const sortChips = useMemo(() => [
        { label: '🕐 Recent', value: 'recent' },
        { label: '🔥 Popular', value: 'popular' },
        { label: '⭐ Endorsed', value: 'most_endorsed' },
        { label: '🔖 Saved', value: 'most_bookmarked' },
    ], []);

    const handleEndReached = useCallback(() => {
        if (hasNextResources && !isFetchingNextResources) fetchNextResources();
    }, [hasNextResources, isFetchingNextResources, fetchNextResources]);
    const renderShelf = useCallback((label: string, items: LibraryResource[], onSeeAll?: () => void) => {
        if (items.length === 0) return null;
        return (
            <SmartShelf key={label} title={label} onSeeAll={onSeeAll}>
                {items.map(res => (
                    <LibraryThumbnailCard
                        key={res.id}
                        title={res.title}
                        type={res.type}
                        subject={res.subject}
                        thumbnailUrl={res.media?.url as string | undefined}
                        endorsements={res.endorsements}
                        verified={res.verified}
                        copyrightNotice={res.copyright_notice}
                        onPress={() => handleOpenResource(res)}
                    />
                ))}
            </SmartShelf>
        );
    }, [handleOpenResource]);

    // ── Render ────────────────────────────────────────────────

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={t('tabs.library') || 'Library'}
                subtitle={t('library.knowledgeSanctuary')}
                searchProps={{
                    value: searchQuery,
                    onChangeText: setSearchQuery,
                    placeholder: t('library.searchPlaceholder'),
                }}
            />

            {loading && !refreshing ? (
                <VStack space="md" px={Theme.spacing.md} mt={Theme.spacing.lg}>
                    <SkeletonCard height={200} />
                    <SkeletonCard height={160} />
                    <SkeletonCard height={160} />
                </VStack>
            ) : isSearchMode ? (
                /* ── Search / filter mode: vertical list ────────────── */
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
                        <HorizontalChipRow
                            chips={sortChips}
                            selectedValue={selectedSort}
                            onSelect={(v) => setSelectedSort(v as typeof selectedSort)}
                            size="sm"
                        />
                    </Animated.View>
                    <ResourceList
                        resources={resources}
                        onOpenResource={handleOpenResource}
                        onPullToDesk={(res) => console.log('Pull to desk', res.id)}
                        ListFooterComponent={isFetchingNextResources ? (
                            <ActivityIndicator size="small" color={Theme.colors.sanctuarySaffron} style={{ padding: 20 }} />
                        ) : null}
                        onEndReached={handleEndReached}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                </Box>
            ) : (
                /* ── Netflix mode: horizontal shelves ───────────────── */
                <ScrollView
                    style={{ flex: 1, backgroundColor: colors.primary }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: bottomPadding + Theme.spacing.xl }}
                    onScroll={undefined}
                    scrollEventThrottle={0}
                >
                    {/* ── Hero Banner ── */}
                    {heroResource && (
                        <HeroBanner resource={heroResource} onPress={() => handleOpenResource(heroResource)} />
                    )}

                    <Box sx={{ paddingTop: Theme.spacing.md }}>
                        {/* Category chips for quick access */}
                        <Animated.View entering={FadeInDown.delay(100).springify()}>
                            <HorizontalChipRow
                                chips={chipData}
                                selectedValue={selectedCategoryId}
                                onSelect={setSelectedCategoryId}
                                size="sm"
                            />
                        </Animated.View>

                        {/* Continue Learning */}
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

                        {/* Featured Collections */}
                        {collections.length > 0 && (
                            <SmartShelf title="📚 Featured Collections">
                                {collections.map((col: any) => (
                                    <CollectionCard
                                        key={col.id}
                                        title={col.name}
                                        creator={col.creator_name}
                                        resourceCount={col.resource_ids?.length ?? 0}
                                        subjectTag={col.subject}
                                        onPullToDesk={() => { }}
                                    />
                                ))}
                            </SmartShelf>
                        )}

                        {/* Typed shelves */}
                        {orderedShelfDefs.map(shelf => {
                            const items = resources.filter(r => (shelf.types as readonly string[]).includes(r.type));
                            return renderShelf(shelf.label, items);
                        })}

                        {/* Trending shelf */}
                        {trending.length > 0 && renderShelf('⭐ Trending', trending)}

                        {/* New arrivals shelf */}
                        {newArrivals.length > 0 && renderShelf('✨ New Arrivals', newArrivals)}

                        {/* Empty state */}
                        {resources.length === 0 && (
                            <PositiveInvitation
                                context="library"
                                onAction={() => setIsAddModalOpen(true)}
                            />
                        )}
                    </Box>
                </ScrollView>
            )}

            <LotusPetalFAB
                currentTab="library"
                onPress={() => setIsAddModalOpen(true)}
            />

            <AddResourceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddResource}
            />
        </ScreenWrapper>
    );
}

// ============================================================================
// HERO BANNER
// ============================================================================

interface HeroBannerProps {
    resource: LibraryResource;
    onPress: () => void;
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
            {/* Featured badge */}
            <View style={heroBannerStyles.featuredBadge}>
                <RNText style={heroBannerStyles.featuredText}>✦ FEATURED</RNText>
            </View>
            <RNText style={[heroBannerStyles.heroTitle, { color: colors.text }]} numberOfLines={2}>
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
