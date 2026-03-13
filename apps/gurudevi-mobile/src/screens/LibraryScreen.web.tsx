import React, { useState, useMemo, useCallback } from 'react';
import {
    LibraryThumbnailCard,
    openExternalURL,
    WebScreenHeader,
    useRegisterFAB
} from '@repo/ui';
import {
    useRoleFeatures,
    useStore,
    useUserRole,
    growthSignalsAPI,
    impactRipplesAPI,
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
    Map,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLibrary, LIBRARY_UI_CATEGORIES, libraryAPI, AddResourceModal } from '@repo/library';
import { LibraryResource } from '@repo/library';
import type { CreateResourceInput } from '@repo/library';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@repo/core';
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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showAddResource, setShowAddResource] = useState(false);

    const isTeacherOrCurator = role === 'teacher' || role === 'principal' || role === 'founder';
    const isSearchMode = searchQuery.trim().length > 0 || selectedCategoryId !== 'All';
    const resourceTypeFilter = useMemo(() => {
        if (selectedCategoryId === 'All' || ['trending', 'bookmarks', 'activity'].includes(selectedCategoryId)) return undefined;
        return selectedCategoryId as any;
    }, [selectedCategoryId]);

    const {
        resources,
        loading,
        fetchNextResources,
        fetchResources,
        hasNextResources,
        isFetchingNextResources,
    } = useLibrary(
        isSearchMode
            ? { type: resourceTypeFilter, search: searchQuery || undefined, sort_by: selectedSort }
            : { limit: 100, sort_by: selectedSort }
    );

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
                                <Map size={15} />
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

                        {/* View mode toggle */}
                        <div style={{ display: 'flex', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
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

                {/* 3. CONTENT GRID */}
                {loading && resources.length === 0 ? (
                    <StackFallback variant="cards" />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        {viewMode === 'grid' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '32px' }}>
                                {resources.map(res => (
                                    <div key={res.id} className="sanctuary-card" onClick={() => handleOpenResource(res)} style={{ cursor: 'pointer' }}>
                                        <LibraryThumbnailCard
                                            title={res.title}
                                            type={res.type}
                                            subject={res.subjects?.[0] ?? 'General'}
                                            thumbnailUrl={res.media?.url as string | undefined}
                                            endorsements={res.endorsements}
                                            verified={res.verified}
                                            onPress={() => handleOpenResource(res)}
                                            // onBookmark removed as it's not in LibraryThumbnailCardProps
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* List view — compact rows */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {resources.map(res => (
                                    <button
                                        key={res.id}
                                        className="sanctuary-card"
                                        onClick={() => handleOpenResource(res)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 20px', textAlign: 'left', width: '100%', cursor: 'pointer' }}
                                    >
                                        {/* Type badge */}
                                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--action-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
                                            {res.type === 'video' ? '🎬' : res.type === 'pdf' ? '📄' : res.type === 'link' ? '🔗' : '📚'}
                                        </div>
                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.title}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '3px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                {res.subjects?.[0] && <span>{res.subjects[0]}</span>}
                                                {res.type && <span style={{ textTransform: 'capitalize' }}>{res.type}</span>}
                                            </div>
                                        </div>
                                        {/* Meta */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                                            {res.verified && <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--moss)', background: 'var(--moss-soft)', padding: '2px 8px', borderRadius: '20px' }}>✓ Verified</span>}
                                            {(res.endorsements ?? 0) > 0 && <span style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>👍 {res.endorsements}</span>}
                                        </div>
                                    </button>
                                ))}
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
