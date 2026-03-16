import React, { useState, useMemo, useCallback } from 'react';
import {
    LibraryThumbnailCard,
    openExternalURL,
    WebScreenHeader,
    useRegisterFAB,
    SmartShelf,
} from '@repo/ui';
import {
    useRoleFeatures,
    useStore,
    useUserRole,
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
import { 
    useLibrary, 
    LIBRARY_UI_CATEGORIES, 
    libraryAPI, 
    AddResourceModal, 
    getOrderedShelfDefs, 
    LibraryResource, 
    CreateResourceInput,
    UniversalPerspective 
} from '@repo/library';
import { useNavigation } from '@react-navigation/native';
import { StackFallback } from '../components/web/WebScreenShimmer';

export default function LibraryScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role } = useUserRole();
    const { isGuest } = useRoleFeatures();
    const { user, showToast } = useStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');
    const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'most_endorsed' | 'most_bookmarked'>('recent');
    const [viewMode, setViewMode] = useState<'shelf' | 'grid' | 'list' | 'map'>('shelf');
    const [showAddResource, setShowAddResource] = useState(false);

    const isTeacherOrCurator = role === 'teacher' || role === 'principal' || role === 'founder';
    const isSearchMode = searchQuery.trim().length > 0 || selectedCategoryId !== 'All';
    const resourceTypeFilter = useMemo(() => {
        if (selectedCategoryId === 'All' || ['trending', 'bookmarks', 'activity'].includes(selectedCategoryId)) return undefined;
        return selectedCategoryId as any;
    }, [selectedCategoryId]);

    const libraryFilters = useMemo(() => (
        isSearchMode
            ? { type: resourceTypeFilter, search: searchQuery || undefined, sort_by: selectedSort, limit: 100 }
            : { limit: 100, sort_by: selectedSort }
    ), [isSearchMode, resourceTypeFilter, searchQuery, selectedSort]);

    const {
        resources,
        loading,
        fetchNextResources,
        fetchResources,
        hasNextResources,
        isFetchingNextResources,
        collections,
    } = useLibrary(libraryFilters);

    // Grouping logic for shelves
    const trending = useMemo(() =>
        [...resources].sort((a, b) => (b.endorsements ?? 0) - (a.endorsements ?? 0)).slice(0, 10),
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
        openExternalURL(resource.url).catch((err: any) => console.error("Couldn't load page", err));
    }, [navigation]);

    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
    const handleBookmark = useCallback(async (resource: LibraryResource) => {
        if (!user?.id) return;
        setBookmarkedIds(prev => {
            const next = new Set(prev);
            if (next.has(resource.id)) { next.delete(resource.id); } else { next.add(resource.id); }
            return next;
        });
        try {
            await libraryAPI.bookmarkResource(resource.id, user.id);
            // Growth signal + Impact Ripple — fire-and-forget (errors logged, don't block UX)
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
    }, [user?.id]);
    
    // Register FAB globally
    useRegisterFAB({
        tabType: 'library',
        onPress: () => setShowAddResource(true),
        icon: <Plus size={24} color="#FFF" />,
        visible: isTeacherOrCurator && !isGuest
    });

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                {/* 1. GREETING */}
                <WebScreenHeader
                    title="The Sanctuary"
                    note="Gurudevi Knowledge Hub"
                    timeText="Curated Wisdom"
                    actions={(
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {isTeacherOrCurator && !isGuest && (
                                <button
                                    className="premium-button"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '13px' }}
                                    onClick={() => setShowAddResource(true)}
                                >
                                    <Plus size={15} />
                                    Contribute Resource
                                </button>
                            )}
                            <button
                                className="secondary-button"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '13px' }}
                                onClick={() => navigation.navigate('LibraryMap')}
                            >
                                <MapIcon size={15} />
                                Knowledge Map
                            </button>
                        </div>
                    )}
                />

                {/* 2. FILTERS & SEARCH */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
                    {/* Search + Sort row */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                            flex: 1,
                            minWidth: '200px',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.5)',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)'
                        }}>
                            <Search size={18} color="var(--ink-ghost)" />
                            <input
                                className="search-input"
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '14px',
                                    padding: '8px 0',
                                    color: 'var(--ink)',
                                    outline: 'none'
                                }}
                                placeholder={t('library.searchPlaceholder') || 'Explore the sanctuary...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-ghost)', fontSize: '16px', padding: '0 4px', lineHeight: 1 }}
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Sort selector */}
                        <select
                            value={selectedSort}
                            onChange={(e) => setSelectedSort(e.target.value as typeof selectedSort)}
                            style={{
                                padding: '10px 14px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                background: 'rgba(255,255,255,0.5)',
                                color: 'var(--ink)',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                outline: 'none',
                                fontFamily: 'var(--font-body, DM Sans, sans-serif)',
                                flexShrink: 0,
                            }}
                            aria-label={t('library.sort.label') || 'Sort library resources'}
                        >
                            <option value="recent">{t('library.sort.recent') || 'Most Recent'}</option>
                            <option value="popular">{t('library.sort.popular') || 'Most Popular'}</option>
                            <option value="most_endorsed">{t('library.sort.endorsed') || 'Most Endorsed'}</option>
                            <option value="most_bookmarked">{t('library.sort.bookmarked') || 'Most Bookmarked'}</option>
                        </select>

                        {/* View mode toggle (Always visible in search, relevant for results) */}
                        <div style={{ display: 'flex', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                            <button
                                onClick={() => setViewMode('shelf')}
                                style={{ padding: '10px 14px', border: 'none', cursor: 'pointer', background: viewMode === 'shelf' ? 'var(--action)' : 'rgba(255,255,255,0.5)', color: viewMode === 'shelf' ? '#fff' : 'var(--ink-ghost)', display: 'flex', alignItems: 'center' }}
                                aria-label="Shelf view"
                                title="Shelf view"
                            >
                                <Layers size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{ padding: '10px 14px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? 'var(--action)' : 'rgba(255,255,255,0.5)', color: viewMode === 'grid' ? '#fff' : 'var(--ink-ghost)', display: 'flex', alignItems: 'center' }}
                                aria-label="Grid view"
                                title="Grid view"
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{ padding: '10px 14px', border: 'none', cursor: 'pointer', background: viewMode === 'list' ? 'var(--action)' : 'rgba(255,255,255,0.5)', color: viewMode === 'list' ? '#fff' : 'var(--ink-ghost)', display: 'flex', alignItems: 'center' }}
                                aria-label="List view"
                                title="List view"
                            >
                                <List size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                style={{ padding: '10px 14px', border: 'none', cursor: 'pointer', background: viewMode === 'map' ? 'var(--action)' : 'rgba(255,255,255,0.5)', color: viewMode === 'map' ? '#fff' : 'var(--ink-ghost)', display: 'flex', alignItems: 'center' }}
                                aria-label="Map view"
                                title="Map view"
                            >
                                <MapIcon size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="filter-scroll" style={{
                        display: 'flex',
                        gap: '8px',
                        overflowX: 'auto',
                        paddingBottom: '8px',
                        scrollbarWidth: 'none'
                    }}>
                        {['All', 'trending', 'bookmarks', 'activity'].map(id => (
                            <button
                                key={id}
                                className={`top-tab ${selectedCategoryId === id ? 'active' : ''}`}
                                onClick={() => setSelectedCategoryId(id)}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                {id === 'All' ? 'All Resources' : id.charAt(0).toUpperCase() + id.slice(1)}
                            </button>
                        ))}
                        <div style={{ width: '1px', background: 'var(--border)', margin: '0 8px' }} />
                        {LIBRARY_UI_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`top-tab ${selectedCategoryId === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategoryId(cat.id)}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                {cat.en}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. CONTENT AREA */}
                {loading && resources.length === 0 ? (
                    <StackFallback variant="cards" />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
                        
                        {/* HERO BANNER (Only in default mode) */}
                        {!isSearchMode && heroResource && (
                            <HeroBanner resource={heroResource} onClick={() => handleOpenResource(heroResource)} />
                        )}

                        {isSearchMode ? (
                            /* SEARCH / FILTERED RESULTS VIEW - Switches between modes */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '16px' }}>
                                    {searchQuery ? `Found ${resources.length} findings for "${searchQuery}"` : `Showing ${selectedCategoryId} curated findings`}
                                </div>
                                
                                {viewMode === 'shelf' && (
                                    <>
                                        {orderedShelfDefs.map(shelf => {
                                            const shelfItems = resources.filter(res => shelf.types.includes(res.type));
                                            if (shelfItems.length === 0) return null;
                                            return (
                                                <SmartShelf key={`search-shelf-${shelf.id}`} title={shelf.label}>
                                                    <div style={{ display: 'flex', gap: '20px' }}>
                                                        {shelfItems.map(res => (
                                                            <div key={`search-${res.id}`} style={{ width: '280px', flexShrink: 0 }}>
                                                                <LibraryThumbnailCard
                                                                    title={res.title}
                                                                    type={res.type}
                                                                    subject={res.subjects?.[0] ?? 'General'}
                                                                    thumbnailUrl={res.media?.url || (res as any).thumbnail_url || (res.type === 'video' || res.type === 'movie_trailer' ? getYoutubeThumbnail(res.url) : undefined)}
                                                                    endorsements={res.endorsements}
                                                                    verified={res.verified}
                                                                    onPress={() => handleOpenResource(res)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </SmartShelf>
                                            );
                                        })}

                                        {/* Fallback for items that don't match any shelf */}
                                        {resources.filter(res => !orderedShelfDefs.some(s => s.types.includes(res.type))).length > 0 && (
                                            <SmartShelf title="Diverse Findings">
                                                <div style={{ display: 'flex', gap: '20px' }}>
                                                    {resources.filter(res => !orderedShelfDefs.some(s => s.types.includes(res.type))).map(res => (
                                                        <div key={`search-other-${res.id}`} style={{ width: '280px', flexShrink: 0 }}>
                                                            <LibraryThumbnailCard
                                                                title={res.title}
                                                                type={res.type}
                                                                subject={res.subjects?.[0] ?? 'General'}
                                                                thumbnailUrl={res.media?.url || (res as any).thumbnail_url || (res.type === 'video' || res.type === 'movie_trailer' ? getYoutubeThumbnail(res.url) : undefined)}
                                                                endorsements={res.endorsements}
                                                                verified={res.verified}
                                                                onPress={() => handleOpenResource(res)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </SmartShelf>
                                        )}
                                    </>
                                )}

                                {viewMode === 'grid' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                                        {resources.map(res => (
                                            <LibraryThumbnailCard
                                                key={`grid-${res.id}`}
                                                title={res.title}
                                                type={res.type}
                                                subject={res.subjects?.[0] ?? 'General'}
                                                thumbnailUrl={res.media?.url || (res as any).thumbnail_url || (res.type === 'video' || res.type === 'movie_trailer' ? getYoutubeThumbnail(res.url) : undefined)}
                                                endorsements={res.endorsements}
                                                verified={res.verified}
                                                onPress={() => handleOpenResource(res)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {viewMode === 'list' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {resources.map(res => (
                                            <div 
                                                key={`list-${res.id}`}
                                                onClick={() => handleOpenResource(res)}
                                                style={{ 
                                                    display: 'flex', 
                                                    gap: '20px', 
                                                    padding: '16px', 
                                                    background: 'rgba(255,255,255,0.5)', 
                                                    borderRadius: '16px', 
                                                    border: '1px solid var(--border)',
                                                    cursor: 'pointer',
                                                    alignItems: 'center'
                                                }}
                                                className="sanctuary-card"
                                            >
                                                <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: 'var(--action-soft)', flexShrink: 0 }}>
                                                    {(res.media?.url || getYoutubeThumbnail(res.url)) ? (
                                                        <img src={res.media?.url || getYoutubeThumbnail(res.url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--action)' }}>
                                                            <Plus size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--action)', marginBottom: '4px' }}>{res.type.toUpperCase()}</div>
                                                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink)' }}>{res.title}</div>
                                                    <div style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginTop: '2px' }}>{res.subjects?.[0]} • {res.creator_name}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--action)', fontSize: '13px', fontWeight: '600' }}>
                                                    <Play size={14} fill="currentColor" />
                                                    View
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {viewMode === 'map' && (
                                    <div style={{ height: '600px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.05)' }}>
                                        <UniversalPerspective 
                                            topology={{
                                                nodes: resources.map(res => ({
                                                    id: res.id,
                                                    label: res.title,
                                                    type: res.type === 'video' ? 'persona' : 'topic',
                                                    group: res.subjects?.[0] ?? 'General'
                                                })),
                                                links: resources.slice(0, -1).map((res, i) => ({
                                                    source: res.id,
                                                    target: resources[i+1].id,
                                                    relationship: 'related'
                                                })),
                                                context: { title: 'Knowledge Constellation' }
                                            } as any}
                                            onNodePress={(node) => {
                                                const res = resources.find(r => r.id === node.id);
                                                if (res) handleOpenResource(res);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* DEFAULT VIEW - Netflix Style Shelves */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                                {/* Featured Collections */}
                                {collections.length > 0 && (
                                    <SmartShelf title="Featured Collections">
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            {collections.map((col: any) => (
                                                <div key={`col-${col.id}`} style={{ 
                                                    width: '240px', 
                                                    height: '140px', 
                                                    borderRadius: '16px', 
                                                    background: 'var(--action-soft)', 
                                                    padding: '20px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    border: '1px solid var(--border)',
                                                    transition: 'transform 0.2s',
                                                }}
                                                className="sanctuary-card"
                                                >
                                                    <div style={{ fontSize: '12px', color: 'var(--action)', fontWeight: '800', marginBottom: '8px' }}>COLLECTION</div>
                                                    <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--ink)' }}>{col.name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '4px' }}>{col.resource_ids?.length ?? 0} items</div>
                                                </div>
                                            ))}
                                        </div>
                                    </SmartShelf>
                                )}

                                {/* Categorized Shelves */}
                                {orderedShelfDefs.map(shelf => {
                                    const shelfItems = resources.filter(res => shelf.types.includes(res.type));
                                    if (shelfItems.length === 0) return null;
                                    return (
                                        <SmartShelf key={`default-shelf-${shelf.id}`} title={shelf.label}>
                                            <div style={{ display: 'flex', gap: '20px' }}>
                                                {shelfItems.map(res => (
                                                    <div key={`res-${res.id}`} style={{ width: '280px', flexShrink: 0 }}>
                                                        <LibraryThumbnailCard
                                                            title={res.title}
                                                            type={res.type}
                                                            subject={res.subjects?.[0] ?? 'General'}
                                                            thumbnailUrl={res.media?.url || (res as any).thumbnail_url || (res.type === 'video' || res.type === 'movie_trailer' ? getYoutubeThumbnail(res.url) : undefined)}
                                                            endorsements={res.endorsements}
                                                            verified={res.verified}
                                                            onPress={() => handleOpenResource(res)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </SmartShelf>
                                    );
                                })}
                            </div>
                        )}

                        {hasNextResources && (
                            <button
                                className="top-tab"
                                style={{ alignSelf: 'center', padding: '12px 32px' }}
                                onClick={() => fetchNextResources()}
                                disabled={isFetchingNextResources}
                            >
                                {isFetchingNextResources ? 'Loading…' : 'Load More Findings'}
                            </button>
                        )}
                    </div>
                )}
            </div>


            {/* Add Resource Modal — teachers/curators can contribute */}
            {isTeacherOrCurator && !isGuest && (
                <AddResourceModal
                    isOpen={showAddResource}
                    onClose={() => setShowAddResource(false)}
                    onAdd={async (data) => {
                        if (!user?.id) return;
                        try {
                            // Map AddResourceModal's simplified data shape → CreateResourceInput
                            const input: CreateResourceInput = {
                                title: data.title,
                                description: data.description,
                                type: data.type as any,
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
                            const created = await libraryAPI.createResource(input, user.id, role ?? 'teacher');
                            // Trigger ETL enrichment asynchronously (topic extraction + embedding)
                            supabase.functions.invoke('library-etl', {
                                body: { resourceId: created.id, action: 'enrich' },
                            }).catch((err) => console.warn('[LibraryScreen] ETL enrichment failed:', err));
                            setShowAddResource(false);
                            showToast('Resource contributed! It will be reviewed before publishing.', 'success');
                            // Refresh library list
                            fetchResources();
                        } catch (err: any) {
                            showToast(err.message ?? 'Failed to add resource', 'error');
                        }
                    }}
                />
            )}
        </div>
    );
}

function HeroBanner({ resource, onClick }: { resource: LibraryResource; onClick: () => void }) {
    return (
        <div 
            onClick={onClick}
            style={{
                height: '320px',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                marginBottom: '40px',
                background: 'var(--action-soft)',
            }}
        >
            {resource.media?.url && (
                <img 
                    src={resource.media.url} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    alt={resource.title}
                />
            )}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '40px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    color: 'var(--sanctuary-saffron, #F5A623)',
                }}>
                    <span style={{ background: 'var(--sanctuary-saffron, #F5A623)', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>FEATURED</span>
                    {resource.subjects?.[0] && <span>• {resource.subjects[0].toUpperCase()}</span>}
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>{resource.title}</h1>
                <p style={{ fontSize: '14px', opacity: 0.8, maxWidth: '600px', margin: 0, lineHeight: '1.5' }}>{resource.description}</p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <button className="premium-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Play size={16} fill="currentColor" />
                        Open Now
                    </button>
                </div>
            </div>
        </div>
    );
}
