/**
 * LibraryScreen â€” Netflix-Style Holistic Digital Library
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
import { Map as MapIcon, Play, Plus, FileText } from 'lucide-react-native';
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
import CuratorReviewScreen from './CuratorReviewScreen'; // Added for completeness if needed in exports

// Shelf definitions
const SHELF_DEFS = [
    { id: 'movie_trailer', label: 'ðŸŽ¬ Inspiring Films', types: ['movie_trailer'] },
    { id: 'map', label: 'ðŸ—ºï¸ Maps & Visuals', types: ['map', 'infographic'] },
    { id: 'story', label: 'ðŸ“– Stories', types: ['story'] },
    { id: 'circular', label: 'ðŸ“‹ Edu Circulars', types: ['circular'] },
    { id: 'guide', label: 'ðŸ‘©â€ðŸ« Teacher Guides', types: ['guide'] },
    { id: 'tech_guide', label: 'ðŸ’¡ Tech Guides', types: ['tech_guide'] },
    { id: 'video', label: 'ðŸŽ¥ Videos', types: ['video'] },
    { id: 'doc', label: 'ðŸ“„ Documents', types: ['pdf', 'doc', 'lesson', 'worksheet', 'reading', 'pedagogy'] },
    { id: 'link', label: 'ðŸŒ Web Resources', types: ['link'] },
] as const;


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
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');
    const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'most_endorsed' | 'most_bookmarked'>('recent');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();
    const { discoverFeature } = useTracking();

    React.useEffect(() => {
        discoverFeature('section_library');

        // Trigger knowledge index sync (Whispered Moment)
        setIsSyncing(true);
        syncLibrary()
            .catch(err => console.error('Library sync failed in background:', err))
            .finally(() => setIsSyncing(false));
    }, []);

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
        syncLibrary,
    } = useLibrary(
        isSearchMode
            ? { type: resourceTypeFilter, search: searchQuery || undefined, sort_by: selectedSort }
            : { limit: 60 }
    );

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

    const trending = useMemo(() =>
        [...resources].sort((a, b) => (b.endorsements ?? 0) - (a.endorsements ?? 0)).slice(0, 10),
        [resources]);

    const newArrivals = useMemo(() =>
        [...resources].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 10),
        [resources]);

    const heroResource = trending[0] ?? newArrivals[0] ?? null;

    const { deskItems, removeFromDeskLocal, user } = useStore();

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
        { label: 'ðŸ• Recent', value: 'recent' },
        { label: 'ðŸ”¥ Popular', value: 'popular' },
        { label: 'â­ Endorsed', value: 'most_endorsed' },
        { label: 'ðŸ”– Saved', value: 'most_bookmarked' },
    ], []);

    const handleEndReached = useCallback(() => {
        if (hasNextResources && !isFetchingNextResources) fetchNextResources();
    }, [hasNextResources, isFetchingNextResources, fetchNextResources]);

    // Register FAB globally
    useRegisterFAB({
        tabType: 'library',
        onPress: () => setIsAddModalOpen(true),
        visible: !loading
    });

    const renderShelf = useCallback((label: string, items: LibraryResource[], onSeeAll?: () => void) => {
        if (items.length === 0) return null;
        return (
            <SmartShelf key={label} title={label} onSeeAll={onSeeAll}>
                {items.map(res => (
                    <LibraryThumbnailCard
                        key={res.id}
                        title={res.title}
                        type={res.type}
                        subject={res.subjects?.[0] || ''}
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

            {loading && !refreshing ? (
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
                            <SmartShelf title="â–¶ Continue Learning">
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
                            <SmartShelf title="ðŸ“š Featured Collections">
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
                        )}

                        {orderedShelfDefs.map(shelf => {
                            const items = resources.filter(r => (shelf.types as readonly string[]).includes(r.type));
                            return renderShelf(shelf.label, items);
                        })}

                        {trending.length > 0 && renderShelf('â­ Trending', trending)}
                        {newArrivals.length > 0 && renderShelf('âœ¨ New Arrivals', newArrivals)}

                        {resources.length === 0 && (
                            <PositiveInvitation
                                context="library"
                                onAction={() => setIsAddModalOpen(true)}
                            />
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
                <RNText style={heroBannerStyles.featuredText}>âœ¦ FEATURED</RNText>
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
                            Â© {resource.copyright_notice}
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
});

