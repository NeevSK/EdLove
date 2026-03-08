import React, { useState, useMemo, useCallback } from 'react';
import {
    LibraryThumbnailCard,
    LotusPetalFAB,
    openExternalURL,
} from '@repo/ui';
import {
    useRoleFeatures,
    useStore,
    useUserRole,
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
    X,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLibrary, LIBRARY_UI_CATEGORIES } from '@repo/library';
import { LibraryResource } from '@repo/library';
import { StackFallback } from '../components/web/WebScreenShimmer';

export default function LibraryScreen() {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const { isGuest } = useRoleFeatures();
    const { user } = useStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');
    const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'most_endorsed' | 'most_bookmarked'>('recent');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const isSearchMode = searchQuery.trim().length > 0 || selectedCategoryId !== 'All';
    const resourceTypeFilter = useMemo(() => {
        if (selectedCategoryId === 'All' || ['trending', 'bookmarks', 'activity'].includes(selectedCategoryId)) return undefined;
        return selectedCategoryId as any;
    }, [selectedCategoryId]);

    const {
        resources,
        loading,
        fetchNextResources,
        hasNextResources,
        isFetchingNextResources,
    } = useLibrary(
        isSearchMode
            ? { type: resourceTypeFilter, search: searchQuery || undefined, sort_by: selectedSort }
            : { limit: 100, sort_by: selectedSort }
    );

    const [openVideoResource, setOpenVideoResource] = useState<LibraryResource | null>(null);

    const handleOpenResource = useCallback((resource: LibraryResource) => {
        if (!resource.url) return;
        if (resource.type === 'pdf') {
            // Open PDFs in a new browser tab — browser's built-in viewer handles it natively
            window.open(resource.url, '_blank', 'noopener,noreferrer');
            return;
        }
        if (resource.type === 'video' || resource.type === 'movie_trailer') {
            // Open video inline in a simple overlay player
            setOpenVideoResource(resource);
            return;
        }
        openExternalURL(resource.url).catch((err: any) => console.error("Couldn't load page", err));
    }, []);

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                {/* 1. GREETING */}
                <div className="greeting">
                    <div className="greeting-time">Curated Wisdom</div>
                    <h1 className="greeting-main">The Sanctuary</h1>
                    <p className="greeting-note">Gurudevi Knowledge Hub</p>
                </div>

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
                                            subject={res.subject}
                                            thumbnailUrl={res.media?.url as string | undefined}
                                            endorsements={res.endorsements}
                                            verified={res.verified}
                                            onPress={() => handleOpenResource(res)}
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
                                            {res.type === 'video' ? '🎬' : res.type === 'pdf' ? '📄' : res.type === 'audio' ? '🎵' : res.type === 'link' ? '🔗' : '📚'}
                                        </div>
                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.title}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '3px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                {res.subject && <span>{res.subject}</span>}
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

            <LotusPetalFAB />

            {/* ── Inline video overlay ─────────────────────────────────── */}
            {openVideoResource && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(15,13,10,0.92)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '32px',
                    }}
                    onClick={() => setOpenVideoResource(null)}
                >
                    <div
                        style={{ width: '100%', maxWidth: '900px', background: 'var(--ink)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <div>
                                <div style={{ fontWeight: '700', color: 'white', fontSize: '16px' }}>{openVideoResource.title}</div>
                                {openVideoResource.creator_name && (
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{openVideoResource.creator_name}</div>
                                )}
                            </div>
                            <button
                                onClick={() => setOpenVideoResource(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: '4px' }}
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <video
                            src={openVideoResource.url}
                            controls
                            autoPlay
                            style={{ width: '100%', display: 'block', maxHeight: '70vh', background: '#000' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
