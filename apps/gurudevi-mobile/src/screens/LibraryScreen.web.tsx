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
    Globe
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLibrary, LIBRARY_UI_CATEGORIES } from '@repo/library';
import { LibraryResource } from '@repo/library';
import { useNavigation } from '@react-navigation/native';
import { StackFallback } from '../components/web/WebScreenShimmer';

export default function LibraryScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role } = useUserRole();
    const { isGuest } = useRoleFeatures();
    const { user } = useStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');
    const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'most_endorsed' | 'most_bookmarked'>('recent');

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
        openExternalURL(resource.url).catch((err: any) => console.error("Couldn't load page", err));
    }, [navigation]);

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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '32px' }}>
                            {resources.map(res => (
                                <div key={res.id} className="sanctuary-card" onClick={() => handleOpenResource(res)}>
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

                        {hasNextResources && (
                            <button
                                className="top-tab"
                                style={{ alignSelf: 'center', padding: '12px 32px' }}
                                onClick={() => fetchNextResources()}
                                disabled={isFetchingNextResources}
                            >
                                {isFetchingNextResources ? 'Loading...' : 'Load More Findings'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <LotusPetalFAB />
        </div>
    );
}
