import React, { useState, useMemo, useCallback } from 'react';
import {
    openExternalURL,
    showExternalLinkOptions,
    WebScreenHeader,
    useRegisterFAB,
    SmartShelf,
    TemporalNavigator,
} from '@repo/ui';
import { LibraryThumbnailCard } from '../components/LibraryThumbnailCard';
import {
    useStore,
    usePermissions,
    useTemporalStore,
    usePendingGateAction,
    setPendingGateAction,
    growthSignalsAPI,
    impactRipplesAPI,
    supabase
} from '@repo/core';
import {
    Search,
    Plus,
    Layers,
    Flame,
    Bookmark,
    Clock,
    Globe,
    LayoutGrid,
    List,
    Map as MapIcon,
    Play
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLibrary } from '../hooks/useLibrary';
import { LIBRARY_UI_CATEGORIES } from '../constants/categories';
import { getOrderedShelfDefs } from '../constants/shelf';
import { libraryAPI } from '../api/library';
import AddResourceModal from '../components/AddResourceModal';
import { UniversalPerspective } from '../components/perspectives/UniversalPerspective';
import { buildLibraryExternalLinkOptions } from '../utils/externalLinks';
import type { LibraryResource, CreateResourceInput, ResourceType } from '../types';
import { useNavigation, NavigationProp } from '@react-navigation/native';
function StackFallback() {
    return <div className="sanctuary-card" style={{ padding: '32px', textAlign: 'center' }}>Loading the sanctuary...</div>;
}

export default function LibraryScreenWeb() {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp<Record<string, unknown>>>();
    const { can } = usePermissions();
    const { isPastView } = useTemporalStore();
    
    const pending = usePendingGateAction();
    const { user, showToast } = useStore(state => ({ user: state.user, showToast: state.showToast }));

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');
    const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'most_endorsed' | 'most_bookmarked'>('recent');
    const [viewMode, setViewMode] = useState<'shelf' | 'grid' | 'list' | 'map'>('shelf');
    const [showAddResource, setShowAddResource] = useState(false);

    // Search Debouncing
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Resume-after-upgrade: open Add Resource modal if it was the gated action.
    React.useEffect(() => {
        if (!pending.action) return;
        if (pending.action.kind !== 'library_open_add_resource') return;
        if (!can('create', 'LibraryResource')) return;
        if (isPastView) return;
        setShowAddResource(true);
        pending.clear().catch(() => { });
    }, [pending, can, isPastView]);

    const canContribute = can('create', 'LibraryResource');
    const isSearchMode = searchQuery.trim().length > 0 || selectedCategoryId !== 'All';
    const resourceTypeFilter = useMemo(() => {
        if (selectedCategoryId === 'All' || ['trending', 'bookmarks', 'activity'].includes(selectedCategoryId)) return undefined;
        return selectedCategoryId as ResourceType;
    }, [selectedCategoryId]);

    const libraryFilters = useMemo(() => (
        isSearchMode
            ? { type: resourceTypeFilter, search: debouncedSearchQuery || undefined, sort_by: selectedSort, limit: 100 }
            : { limit: 100, sort_by: selectedSort }
    ), [isSearchMode, resourceTypeFilter, debouncedSearchQuery, selectedSort]);

    const {
        resources,
        loading,
        fetchNextResources,
        fetchResources,
        hasNextResources,
        isFetchingNextResources,
        collections,
    } = useLibrary(libraryFilters as import('../types').ResourceFilters, libraryFilters as import('../types').CollectionFilters);

    // Grouping logic for shelves
    const trending = useMemo(() =        [...resources].sort((a, b) => (b.endorsements ?? 0) - (a.endorsements ?? 0)).slice(0, 10),
        [resources]);

    const heroResource = useMemo(() => trending[0] ?? resources[0] ?? null, [trending, resources]);

    const orderedShelfDefs = useMemo(() => getOrderedShelfDefs(user?.orientation_seeds), [user?.orientation_seeds]);

    const getYoutubeThumbnail = (url?: string) => {
        if (!url) return undefined;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
        return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : undefined;
    };

    const handleOpenResource = useCallback((resource: LibraryResource) => {
        if (!resource.url) return;
        if (resource.type === 'pdf') {
            // Navigate to the full inline PDFViewerScreen (packages/library/src/screens/PDFViewerScreen.web.tsx)
            navigation.navigate('PDFViewer', {
                resourceId: resource.id,
                title: resource.title,
                url: resource.url,
                creator: resource.creator_name,
            });
            return;
        }
        if (resource.type === 'video' || resource.type === 'movie_trailer') {
            // Navigate to the full VideoPlayerScreen (packages/library/src/screens/VideoPlayerScreen.web.tsx)
            navigation.navigate('VideoPlayer', {
                resourceId: resource.id,
                title: resource.title,
                url: resource.url,
                creator: resource.creator_name ?? '',
            });
            return;
        }
        openExternalURL(resource.url, buildLibraryExternalLinkOptions(resource)).catch((err: Error) => console.error("Couldn't load page", err));
    }, [navigation]);

    const handleOpenResourceOptions = useCallback((resource: LibraryResource) => {
        if (!resource.url || resource.type === 'pdf' || resource.type === 'video' || resource.type === 'movie_trailer') {
            return;
        }

        showExternalLinkOptions(resource.url, buildLibraryExternalLinkOptions(resource)).catch((err: Error) =            console.error("Couldn't show external link options", err)
        );
    }, []);

    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
    const handleBookmark = useCallback(async (resource: LibraryResource) => {
        if (isPastView || !user?.id) return;
        setBookmarkedIds(prev => {
            const next = new Set(prev);
            if (next.has(resource.id)) { next.delete(resource.id); } else { next.add(resource.id); }
            return next;
        });
        try {
            await libraryAPI.bookmarkResource(resource.id, user.id);
            // Growth signal + Impact Ripple \u2014 fire-and-forget (errors logged, don't block UX)
            growthSignalsAPI.emitSignal(user.id, 'resource_read').catch((err) => console.warn('[LibraryScreen] growth signal failed:', err));
            if (resource.creator_id && resource.creator_id !== user.id) {
                impactRipplesAPI.createRipple({
                    recipientUserId: resource.creator_id,
                    actorUserId: user.id,
                    rippleType: 'resource_saved',
                    schoolId: user.school_id,
                    sourceEntityType: 'resource',
                    sourceEntityId: resource.id,
                }).catch((err) => console.warn('[LibraryScreen] impact ripple failed:', err));
            }
        } catch (err) {
            console.error('[LibraryScreen] bookmark failed:', err);
            // Revert optimistic update
            setBookmarkedIds(prev => {
                const next = new Set(prev);
                if (next.has(resource.id)) { next.delete(resource.id); } else { next.add(resource.id); }
                return next;
            });
            showToast('Could not save bookmark. Please try again.', 'error');
        }
    }, [isPastView, user?.id, user?.school_id, showToast]);

    const canCreate = can('create', 'LibraryResource');
    const handleAddResourcePress = useCallback(() => {
        if (isPastView) {
            showToast('Past view is read-only. Return to today to contribute.', 'info');
            return;
        }
        if (!canCreate) {
            setPendingGateAction({ kind: 'library_open_add_resource', createdAt: Date.now() }).catch(() => { });
            navigation.navigate('Auth');
            return;
        }
        setShowAddResource(true);
    }, [canCreate, isPastView, navigation, showToast]);
    
    // Register FAB globally - memoized to prevent infinite loop or excessive updates
    const fabConfig = useMemo(() => ({
        tabType: 'library' as const,
        onPress: handleAddResourcePress,
        icon: <Plus size={24} color="#FCF9F2" />,
        visible: canCreate && !isPastView
    }), [handleAddResourcePress, canCreate, isPastView]);

    useRegisterFAB(fabConfig);

    return (
        <div className="sanctuary-screen"            <div className="sanctuary-container"                {/* 1. GREETING */}
                <WebScreenHeader
                    title="The Sanctuary"
                    note="Gurudevi Knowledge Hub"
                    timeText="Curated Wisdom"
                    actions={(>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}                            {canContribute && (
                                <button
                                    className='premium-button'
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '13px' }}
                                    onClick={handleAddResourcePress}
                                    disabled={isPastView}>
                                                                    <Plus size={15} /                                    >{t('library.contributeResource') || 'Contribute Resource'}
                                </button                            )}
                            <button
                                className="secondary-button"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '13px' }}
                                onClick={() => navigation.navigate('LibraryMap')}
                                                            <MapIcon size={15} /                                >Knowledge Map
                            </button                        </div                    )}
                /                <div style={{ marginBottom: '20px' }}                    <TemporalNavigator /                </div
                {/* 2. FILTERS & SEARCH */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}                    {/* Search + Sort row */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}                        <div className="sanctuary-search-shell" style={{
                            flex: 1,
                            minWidth: '200px',>
                        }}                            <Search size={18} color="var(--ink-ghost)" /                            ><input
                                className="search-input"
                                style={{ padding: '8px 0' }}
                                placeholder={t('library.searchPlaceholder') || 'Explore the sanctuary...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            /                            >{searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-ghost)', fontSize: '16px', padding: '0 4px', lineHeight: 1 }}
                                    aria-label="Clear search"
                                                                    &#10005;
                                </button                            )}
                        </div>
                        {/* Sort selector */}
                        <select
                            value={selectedSort}
                            onChange={(e) => setSelectedSort(e.target.value as typeof selectedSort)}
                            style={{
                                padding: '10px 14px',
                                borderRadius: '14px',
                                border: '1px solid var(--scene-interactive-border)',
                                background: 'linear-gradient(180deg, var(--scene-elevated) 0%, var(--scene-interactive) 100%)',
                                color: 'var(--ink)',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                outline: 'none',
                                fontFamily: 'var(--font-body, DM Sans, sans-serif)',
                                flexShrink: 0,
                            }}
                            aria-label={t('library.sort.label')}
                                                    <option value="recent">{t('library.sort.recent')}</option                            ><option value="popular">{t('library.sort.popular')}</option                            ><option value="most_endorsed">{t('library.sort.endorsed')}</option                            ><option value="most_bookmarked">{t('library.sort.bookmarked')}</option                        ></select
                        {/* View mode toggle (Always visible in search, relevant for results) */}
                        <div style={{ display: 'flex', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}                            <button
                                onClick={() => setViewMode('shelf')}
                                style={{ padding: '10px 14px', border: 'none', cursor: 'pointer', background: viewMode === 'shelf' ? 'var(--action)' : 'var(--scene-interactive)', color: viewMode === 'shelf' ? 'var(--text-on-action)' : 'var(--ink-ghost)', display: 'flex', alignItems: 'center' }}
                                aria-label="Shelf view"
                                title="Shelf view"
                                                            <Layers size={16} /                            ></button                            <button
                                onClick={() => setViewMode('grid')}
                                style={{ padding: '10px 14px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? 'var(--action)' : 'var(--scene-interactive)', color: viewMode === 'grid' ? 'var(--text-on-action)' : 'var(--ink-ghost)', display: 'flex', alignItems: 'center' }}
                                aria-label="Grid view"
                                title="Grid view"
                                                            <LayoutGrid size={16} /                            </button                            <button
                                onClick={() => setViewMode('list')}
                                style={{ padding: '10px 14px', border: 'none', cursor: 'pointer', background: viewMode === 'list' ? 'var(--action)' : 'var(--scene-interactive)', color: viewMode === 'list' ? 'var(--text-on-action)' : 'var(--ink-ghost)', display: 'flex', alignItems: 'center' }}
                                aria-label="List view"
                                title="List view"
                                                            <List size={16} /                            </button                            <button
                                onClick={() => setViewMode('map')}
                                style={{ padding: '10px 14px', border: 'none', cursor: 'pointer', background: viewMode === 'map' ? 'var(--action)' : 'var(--scene-interactive)', color: viewMode === 'map' ? 'var(--text-on-action)' : 'var(--ink-ghost)', display: 'flex', alignItems: 'center' }}
                                aria-label="Map view"
                                title="Map view"
                                                            <MapIcon size={16} /                            </button                        </div                    </div
                    <div className="filter-scroll" style={{
                        display: 'flex',
                        gap: '8px',
                        overflowX: 'auto',
                        paddingBottom: '8px',
                        scrollbarWidth: 'none'>
                    }}                        {['All', 'trending', 'bookmarks', 'activity'].map(id => {
                            const Icon = id === 'All' ? Globe : id === 'trending' ? Flame : id === 'bookmarks' ? Bookmark : Clock;
                            return (
                                <button
                                    key={id}
                                    className={`top-tab ${selectedCategoryId === id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategoryId(id)}
                                    style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                                    <Icon size={14} /                                    >{id === 'All' ? 'All Resources' : id.charAt(0).toUpperCase() + id.slice(1)}
                                </button                            );
                        })}
                        <div style={{ width: '1px', background: 'var(--border)', margin: '0 8px' }} /                        >{LIBRARY_UI_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`top-tab ${selectedCategoryId === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategoryId(cat.id)}
                                style={{ whiteSpace: 'nowrap' }}
                                                            {cat.en}
                            </button                        ))}
                    </div                </div
                {/* 3. CONTENT AREA */}
                {loading && resources.length === 0 ? (
                    <StackFallback /                >) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}                        
                        {/* HERO BANNER (Only in default mode) */}>
                        {!isSearchMode && heroResource && (
                            <HeroBanner resource={heroResource} onClick={() => handleOpenResource(heroResource)} /                        >)}

                        {isSearchMode ? (
                            /* SEARCH / FILTERED RESULTS VIEW - Switches between modes */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}                                <div style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '16px' }}                                    {debouncedSearchQuery 
                                        ? t('library.foundResults', { count: resources.length, query: debouncedSearchQuery })
                                        : t('library.showingCurated', { category: selectedCategoryId })>
                                    }
                                </div                                >
                                {viewMode === 'shelf' && (
                                    <                                        {collections.length > 0 && (
                                            <SmartShelf title="Matching Collections"                                                <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px' }}                                                    {collections.map(col => (
                                                        <div key={`search-col-${col.id}`} style={{ width: '320px', flexShrink: 0 }}                                                            <LibraryThumbnailCard
                                                                title={col.name}
                                                                type="collection"
                                                                subject={col.subjects?.[0] || 'Curated'}
                                                                onPress={() => navigation.navigate('CollectionDetail', { id: col.id, title: col.name })}
                                                            /                                                        ></div                                                    ))}
                                                </div                                            </SmartShelf                                        )}
                                        {orderedShelfDefs.map(shelf => {
                                            const shelfItems = resources.filter(res => shelf.types.includes(res.type));
                                            if (shelfItems.length === 0) return null;
                                            return (
                                                <SmartShelf key={`search-shelf-${shelf.id}`} title={shelf.label}                                                    <div style={{ display: 'flex', gap: '20px' }}                                                        {shelfItems.map(res => (
                                                            <div key={`search-${res.id}`} style={{ width: '280px', flexShrink: 0 }}                                                                 <LibraryThumbnailCard
                                                                    title={res.title}
                                                                    type={res.type}
                                                                    subject={res.subjects?.[0] ?? 'General'}
                                                                    thumbnailUrl={res.media?.url || res.thumbnail_url || (res.type === 'video' || res.type === 'movie_trailer' ? getYoutubeThumbnail(res.url) : undefined)}
                                                                    endorsements={res.endorsements}
                                                                    verified={res.verified}
                                                                    has_bookmarked={bookmarkedIds.has(res.id)}
                                                                    onBookmarkToggle={() => handleBookmark(res)}
                                                                    onPress={() => handleOpenResource(res)}
                                                                    onLongPress={res.url ? () => handleOpenResourceOptions(res) : undefined}
                                                                /                                                            ></div                                                        ))}
                                                    </div                                                </SmartShelf                                            );
                                        })}

                                        {/* Fallback for items that don't match any shelf */}
                                        {resources.filter(res => !orderedShelfDefs.some(s => s.types.includes(res.type))).length > 0 && (
                                            <SmartShelf title="Diverse Findings"                                                <div style={{ display: 'flex', gap: '20px' }}                                                    {resources.filter(res => !orderedShelfDefs.some(s => s.types.includes(res.type))).map(res => (
                                                        <div key={`search-other-${res.id}`} style={{ width: '280px', flexShrink: 0 }}                                                            <LibraryThumbnailCard
                                                                title={res.title}
                                                                type={res.type}
                                                                subject={res.subjects?.[0] ?? 'General'}
                                                                thumbnailUrl={res.media?.url || res.thumbnail_url || (res.type === 'video' || res.type === 'movie_trailer' ? getYoutubeThumbnail(res.url) : undefined)}
                                                                endorsements={res.endorsements}
                                                                verified={res.verified}
                                                                onPress={() => handleOpenResource(res)}
                                                                onLongPress={res.url ? () => handleOpenResourceOptions(res) : undefined}
                                                            /                                                        ></div                                                    ))}
                                                </div                                            </SmartShelf                                        )}
                                    </                                )}

                                {viewMode === 'grid' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}                                        {resources.map(res => (
                                            <LibraryThumbnailCard
                                                key={`grid-${res.id}`}
                                                title={res.title}
                                                type={res.type}
                                                subject={res.subjects?.[0] ?? 'General'}
                                                thumbnailUrl={res.media?.url || res.thumbnail_url || (res.type === 'video' || res.type === 'movie_trailer' ? getYoutubeThumbnail(res.url) : undefined)}
                                                endorsements={res.endorsements}
                                                verified={res.verified}
                                                onPress={() => handleOpenResource(res)}
                                                onLongPress={res.url ? () => handleOpenResourceOptions(res) : undefined}
                                            /                                        >))}
                                    </div                                )}

                                {viewMode === 'list' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}                                        {resources.map(res => (
                                            <div 
                                                key={`list-${res.id}`}
                                                onClick={() => handleOpenResource(res)}
                                                style={{ 
                                                    display: 'flex', 
                                                    gap: '20px', 
                                                    padding: '16px', 
                                                    background: 'linear-gradient(180deg, var(--scene-elevated) 0%, var(--scene-surface) 100%)', 
                                                    borderRadius: '16px', 
                                                    border: '1px solid var(--border)',
                                                    cursor: 'pointer',
                                                    alignItems: 'center'
                                                }}
                                                className="sanctuary-card"
                                                                                            <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: 'var(--action-soft)', flexShrink: 0 }}                                                    {(res.media?.url || getYoutubeThumbnail(res.url)) ? (
                                                        <img src={res.media?.url || getYoutubeThumbnail(res.url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /                                                    >) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--action)' }}                                                            <Plus size={24} /                                                        ></div                                                    )}
                                                </div                                                <div style={{ flex: 1 }}                                                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--action)', marginBottom: '4px' }}>{res.type.toUpperCase()}</div                                                    ><div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink)' }}>{res.title}</div                                                    ><div style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginTop: '2px' }}>{res.subjects?.[0]} \u00E2\u20AC\u00A2 {res.creator_name}</div                                                ></div                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--action)', fontSize: '13px', fontWeight: '600' }}                                                    <Play size={14} fill="currentColor" /                                                    >{t('library.view')}
                                                </div                                            </div                                        ))}
                                    </div                                )}

                                {viewMode === 'map' && (
                                    <div className="sanctuary-map-stage" style={{ height: '600px' }}                                        <UniversalPerspective 
                                            topology={{
                                                nodes: resources.map(res => ({
                                                    id: res.id,
                                                    label: res.title,
                                                    type: res.type === 'video' ? 'persona' : 'topic',
                                                    group: res.subjects?.[0] ?? 'General'
                                                })),
                                                links: resources
                                                    .slice(0, -1)
                                                    .map((res, i) => {
                                                        const target = resources[i + 1];
                                                        if (!target) return null;
                                                        return {
                                                            source: res.id,
                                                            target: target.id,
                                                            relationship: 'related' as const,
                                                            value: 1,
                                                        };
                                                    })
                                                    .filter(Boolean),
                                                context: { title: t('library.knowledgeConstellation') }
                                            } as import('../types').KnowledgeTopology}
                                            onNodePress={(node) => {
                                                const res = resources.find(r => r.id === node.id);
                                                if (res) handleOpenResource(res);
                                            }}
                                        /                                    ></div                                )}
                            </div                        ) : (
                            /* DEFAULT VIEW - Netflix Style Shelves */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}                                {/* Featured Collections */}
                                {collections.length > 0 && (
                                    <SmartShelf title="Featured Collections"                                        <div style={{ display: 'flex', gap: '20px' }}                                            {collections.map((col: import('../types').LibraryCollection) => (
                                                <div 
                                                    key={`col-${col.id}`} 
                                                    style={{ 
                                                        width: '240px', 
                                                        height: '140px', 
                                                        borderRadius: '16px', 
                                                        background: 'var(--action-soft)', 
                                                        padding: '24px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        border: '1px solid var(--border)',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        position: 'relative',
                                                        overflow: 'hidden'>
                                                    }}
                                                    className="sanctuary-card"
                                                    onClick={() => navigation.navigate('CollectionDetail', { id: col.id, title: col.name })}
                                                                                                    <div style={{ fontSize: '11px', color: 'var(--action)', fontWeight: '800', marginBottom: '8px', letterSpacing: '0.05em' }}                                                        {col.is_virtual ? t('library.dynamic') : t('library.collection')}
                                                    </div                                                    <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--ink)', lineHeight: '1.2' }}>{col.name}</div                                                    ><div style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginTop: '8px', fontWeight: '500' }}                                                        {col.used_by_count ?? col.resource_ids?.length ?? 0} {t('library.resources')}
                                                    </div                                                    >
                                                    {/* Subtle accent line */}
                                                    <div style={{ 
                                                        position: 'absolute', 
                                                        bottom: 0, 
                                                        left: 0, 
                                                        right: 0, 
                                                        height: '4px', 
                                                        background: 'var(--action)', 
                                                        opacity: 0.3 >
                                                    }} /                                                ></div                                            ))}
                                        </div                                    </SmartShelf                                )}

                                {/* Categorized Shelves */}
                                {orderedShelfDefs.map(shelf => {
                                    const shelfItems = resources.filter(res => shelf.types.includes(res.type));
                                    if (shelfItems.length === 0) return null;
                                    return (
                                        <SmartShelf key={`default-shelf-${shelf.id}`} title={shelf.label}                                            <div style={{ display: 'flex', gap: '20px' }}                                                {shelfItems.map(res => (
                                                    <div key={`res-${res.id}`} style={{ width: '280px', flexShrink: 0 }}                                                        <LibraryThumbnailCard
                                                            title={res.title}
                                                            type={res.type}
                                                            subject={res.subjects?.[0] ?? 'General'}
                                                            thumbnailUrl={res.media?.url || res.thumbnail_url || (res.type === 'video' || res.type === 'movie_trailer' ? getYoutubeThumbnail(res.url) : undefined)}
                                                            endorsements={res.endorsements}
                                                            verified={res.verified}
                                                            has_bookmarked={bookmarkedIds.has(res.id)}
                                                            onBookmarkToggle={() => handleBookmark(res)}
                                                            onPress={() => handleOpenResource(res)}
                                                            onLongPress={res.url ? () => handleOpenResourceOptions(res) : undefined}
                                                        /                                                    ></div                                                ))}
                                            </div                                        </SmartShelf                                    );
                                })}
                            </div                        )}

                        {hasNextResources && (
                            <button
                                className="top-tab"
                                style={{ alignSelf: 'center', padding: '12px 32px' }}
                                onClick={() => fetchNextResources()}
                                disabled={isFetchingNextResources}
                                                            {isFetchingNextResources ? t('library.loadingMore') : t('library.loadMoreFindings')}
                            </button                        )}
                    </div                )}
            </div>

            {/* Add Resource Modal \u2014 teachers/curators can contribute */}
            {can('create', 'LibraryResource') && can('create', 'LibraryResource') && (
                <AddResourceModal
                    isOpen={showAddResource && !isPastView}
                    onClose={() => setShowAddResource(false)}
                    onAdd={async (data) => {
                        if (!user?.id) return;
                        try {
                            // Map AddResourceModal's simplified data shape \u00E2\u2020\u2019 CreateResourceInput
                            const input: CreateResourceInput = {
                                title: data.title,
                                description: data.description,
                                type: data.type as import('../types').ResourceType,
                                format: (data.url.includes('youtube') || data.url.includes('youtu.be') || data.url.includes('vimeo'))
                                    ? 'video'
                                    : data.url.match(/\.pdf(\?|$)/i)
                                        ? 'document'
                                        : 'document', // Mapped to 'document' as 'link' is not a ResourceFormat
                                url: data.url,
                                subject: data.tags[0] ?? 'General',
                                topics: data.tags,
                                grades: [],
                                difficulty: 'intermediate',
                                language: 'english',
                                visibility: 'school',
                            };
                            const created = await libraryAPI.createResource(input, user.id, user.authority || 'student');
                            // Trigger ETL enrichment asynchronously (topic extraction + embedding)
                            supabase.functions.invoke('library-etl', {
                                body: { resourceId: created.id, action: 'enrich' },
                            }).catch((err) => console.warn('[LibraryScreen] ETL enrichment failed:', err));
                            setShowAddResource(false);
                            showToast('Resource contributed! It will be reviewed before publishing.', 'success');
                            // Refresh library list
                            fetchResources();
                        } catch (err: unknown) {
                            showToast((err as Error).message ?? 'Failed to add resource', 'error');
                        }
                    }}
                /            >)}
        </div    );
}

function HeroBanner({ resource, onClick }: { resource: LibraryResource; onClick: () => void }) {
    return (
        <div
            className="sanctuary-hero-panel"
            onClick={onClick}
            style={{
                height: '320px',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                marginBottom: '40px',
                background: 'linear-gradient(180deg, var(--action-soft) 0%, var(--scene-surface) 100%)',>
            }}
                    {resource.media?.url && (
                <img 
                    src={resource.media.url} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    alt={resource.title}
                /            >)}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '40px',
                color: 'var(--text-on-danger)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 1,>
            }}                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    color: 'var(--sanctuary-saffron)',
                }}                    {resource.subjects?.[0] && <span>| {resource.subjects[0].toUpperCase()}</span>}
                    {resource.subjects?.[0] && <span>&bull; {resource.subjects[0].toUpperCase()}</span>}
                </div                <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>{resource.title}</h1                ><p style={{ fontSize: '14px', opacity: 0.8, maxWidth: '600px', margin: 0, lineHeight: '1.5' }}>{resource.description}</p                ><div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}                    <button className="premium-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}                        <Play size={16} fill="currentColor" /                        >Open Now
                    </button                </div            </div        </div    );
}
