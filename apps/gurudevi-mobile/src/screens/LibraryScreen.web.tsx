import React, { useState, useMemo, useCallback } from 'react';
import {
    openExternalURL,
    LibraryThumbnailCard,
    LotusPetalFAB,
} from '@repo/ui';
import {
    useUserRole,
    useRoleFeatures,
    useStore,
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
            : { limit: 100 }
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
                    <div style={{
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
                            placeholder="Explore the sanctuary..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                    <div style={{ padding: '80px 0', textAlign: 'center' }}>
                        <p style={{ color: 'var(--ink-ghost)' }}>Assembling knowledge base...</p>
                    </div>
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
