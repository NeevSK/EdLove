import { type NavigationProp, useNavigation } from '@react-navigation/native';
import { growthSignalsAPI, impactRipplesAPI, usePermissions } from '@repo/core';
import { usePendingGateAction } from '@repo/core/hooks';
import { setPendingGateAction, useStore, useTemporalStore } from '@repo/core/logic';
import { supabase } from '@repo/core/native';

import { useResponsive } from '@repo/ui/hooks';
import { AssetCreationModal } from '@repo/ui/components/media/AssetCreationPortal';
import { SmartShelf } from '@repo/ui/components/SmartShelf';
import { UniversalPerspective } from '@repo/ui/components/visualization';
import { openExternalURL, showExternalLinkOptions } from '@repo/ui/utils';
import { TemporalNavigator } from '@repo/ui/components/TemporalNavigator';
import { WebScreenHeader } from '@repo/ui/components/WebScreenHeader.web';
import { useRegisterFAB } from '@repo/ui/context/FABContext';

import {
  Bookmark,
  Clock,
  Flame,
  Globe,
  Layers,
  LayoutGrid,
  List,
  Map as MapIcon,
  Play,
  Plus,
  Search,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { libraryAPI } from '../api/library';
import { LibraryThumbnailCard } from '../components/LibraryThumbnailCard';
import { LIBRARY_UI_CATEGORIES } from '../constants/categories';
import { getOrderedShelfDefs } from '../constants/shelf';
import { useLibrary } from '../hooks/useLibrary';
import type { CreateResourceInput, LibraryResource, ResourceType } from '../types';
import { buildLibraryExternalLinkOptions } from '../utils/externalLinks';

function StackFallback() {
  return (
    <div className="sanctuary-card" style={{ padding: '32px', textAlign: 'center' }}>
      Loading the sanctuary...
    </div>
  );
}

export default function LibraryScreenWeb() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<Record<string, unknown>>>();
  const { width } = useResponsive();
  const { can } = usePermissions();
  const { isPastView } = useTemporalStore();

  const pending = usePendingGateAction();
  const { user, showToast } = useStore((state) => ({
    user: state.user,
    showToast: state.showToast,
  }));

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('All');
  const [selectedSort, setSelectedSort] = useState<
    'recent' | 'popular' | 'most_endorsed' | 'most_bookmarked'
  >('recent');
  const [viewMode, setViewMode] = useState<'shelf' | 'grid' | 'list' | 'map'>('shelf');
  const [showAddResource, setShowAddResource] = useState(false);

  // Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Resume-after-upgrade: open Add Resource modal if it was the gated action.
  useEffect(() => {
    if (!pending.action) return;
    if (pending.action.kind !== 'library_open_add_resource') return;
    if (!can('create', 'LibraryResource')) return;
    if (isPastView) return;
    setShowAddResource(true);
    pending.clear().catch(() => {});
  }, [pending, can, isPastView]);

  const canContribute = can('create', 'LibraryResource');
  const canReview = can('manage', 'LibraryReview') || can('manage', 'LibraryCuratorDashboard');
  const isSearchMode = searchQuery.trim().length > 0 || selectedCategoryId !== 'All';
  const resourceTypeFilter = useMemo(() => {
    if (
      selectedCategoryId === 'All' ||
      ['trending', 'bookmarks', 'activity'].includes(selectedCategoryId)
    )
      return undefined;
    return selectedCategoryId as ResourceType;
  }, [selectedCategoryId]);

  const libraryFilters = useMemo(
    () =>
      isSearchMode
        ? {
            type: resourceTypeFilter,
            search: debouncedSearchQuery || undefined,
            sort_by: selectedSort,
            limit: 100,
          }
        : { limit: 100, sort_by: selectedSort },
    [isSearchMode, resourceTypeFilter, debouncedSearchQuery, selectedSort],
  );

  const {
    resources,
    loading,
    fetchNextResources,
    fetchResources,
    hasNextResources,
    isFetchingNextResources,
    collections,
  } = useLibrary(libraryFilters as any, libraryFilters as any);

  // Grouping logic for shelves
  const trending = useMemo(
    () => [...resources].sort((a, b) => (b.endorsements ?? 0) - (a.endorsements ?? 0)).slice(0, 10),
    [resources],
  );

  const heroResource = useMemo(() => trending[0] ?? resources[0] ?? null, [trending, resources]);

  const orderedShelfDefs = useMemo(
    () => getOrderedShelfDefs(user?.orientation_seeds),
    [user?.orientation_seeds],
  );
  const mapTopology = useMemo(
    () => ({
      nodes: resources.map((res) => ({
        id: res.id,
        label: res.title,
        type: (res.type === 'video' ? 'persona' : 'topic') as
          | 'resource'
          | 'topic'
          | 'persona'
          | 'collection',
        group: res.subjects?.[0] ?? 'General',
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
        .filter((link): link is NonNullable<typeof link> => link !== null),
      context: { title: t('library.knowledgeConstellation') },
    }),
    [resources, t],
  );
  const mapLayout = useMemo(() => {
    const spacing = Math.max(width / Math.max(mapTopology.nodes.length, 1), 120);
    return {
      positions: new Map(
        mapTopology.nodes.map((node, index) => [
          node.id,
          {
            x: 120 + (index % 4) * spacing,
            y: 120 + Math.floor(index / 4) * 160,
          },
        ]),
      ),
      bounds: {
        minX: 0,
        minY: 0,
        maxX: Math.max(width, 720),
        maxY: Math.max(600, Math.ceil(mapTopology.nodes.length / 4) * 180 + 120),
      },
    };
  }, [mapTopology.nodes, width]);

  const getYoutubeThumbnail = (url?: string) => {
    if (!url) return undefined;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/,
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : undefined;
  };

  const handleOpenResource = useCallback(
    (resource: LibraryResource) => {
      if (!resource.url) return;
      if (resource.type === 'pdf') {
        navigation.navigate('PDFViewer', {
          resourceId: resource.id,
          title: resource.title,
          url: resource.url,
          creator: resource.creator_name,
        });
        return;
      }
      if (resource.type === 'video' || resource.type === 'movie_trailer') {
        navigation.navigate('VideoPlayer', {
          resourceId: resource.id,
          title: resource.title,
          url: resource.url,
          creator: resource.creator_name ?? '',
        });
        return;
      }
      openExternalURL(resource.url, buildLibraryExternalLinkOptions(resource)).catch((err: Error) =>
        console.error("Couldn't load page", err),
      );
    },
    [navigation],
  );

  const handleOpenResourceOptions = useCallback((resource: LibraryResource) => {
    if (
      !resource.url ||
      resource.type === 'pdf' ||
      resource.type === 'video' ||
      resource.type === 'movie_trailer'
    ) {
      return;
    }

    showExternalLinkOptions(resource.url, buildLibraryExternalLinkOptions(resource)).catch(
      (err: Error) => console.error("Couldn't show external link options", err),
    );
  }, []);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const handleBookmark = useCallback(
    async (resource: LibraryResource) => {
      if (isPastView || !user?.id) return;
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (next.has(resource.id)) {
          next.delete(resource.id);
        } else {
          next.add(resource.id);
        }
        return next;
      });
      try {
        await libraryAPI.bookmarkResource(resource.id, user.id);
        growthSignalsAPI.emitSilent({
          user_id: user.id,
          event_type: 'resource_read',
          event_metadata: {
            resource_id: resource.id,
            school_id: user.school_id ?? undefined,
          },
        });
        if (resource.creator_id && resource.creator_id !== user.id) {
          impactRipplesAPI
            .createRipple({
              recipientUserId: resource.creator_id,
              actorUserId: user.id,
              rippleType: 'resource_saved',
              schoolId: user.school_id,
              sourceEntityType: 'resource',
              sourceEntityId: resource.id,
            })
            .catch((err) => console.warn('[LibraryScreen] impact ripple failed:', err));
        }
      } catch (err) {
        console.error('[LibraryScreen] bookmark failed:', err);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (next.has(resource.id)) {
            next.delete(resource.id);
          } else {
            next.add(resource.id);
          }
          return next;
        });
        showToast('Could not save bookmark. Please try again.', 'error');
      }
    },
    [isPastView, user?.id, user?.school_id, showToast],
  );

  const canCreate = can('create', 'LibraryResource');
  const handleAddResourcePress = useCallback(() => {
    if (isPastView) {
      showToast('Past view is read-only. Return to today to contribute.', 'info');
      return;
    }
    if (!canCreate) {
      setPendingGateAction({ kind: 'library_open_add_resource', createdAt: Date.now() }).catch(
        () => {},
      );
      navigation.navigate('Auth');
      return;
    }
    setShowAddResource(true);
  }, [canCreate, isPastView, navigation, showToast]);

  const fabConfig = useMemo(
    () => ({
      tabType: 'library' as const,
      onPress: handleAddResourcePress,
      icon: <Plus size={24} color="#FCF9F2" />,
      visible: canCreate && !isPastView,
    }),
    [handleAddResourcePress, canCreate, isPastView],
  );

  useRegisterFAB(fabConfig);

  return (
    <div className="sanctuary-screen">
      <div className="sanctuary-container">
        <WebScreenHeader
          title="The Sanctuary"
          note="Gurudevi Knowledge Hub"
          timeText="Curated Wisdom"
          actions={
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {canContribute && (
                <button
                  className="premium-button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                    fontSize: '13px',
                  }}
                  onClick={handleAddResourcePress}
                  disabled={isPastView}
                >
                  <Plus size={15} />
                  {t('library.contributeResource') || 'Contribute Resource'}
                </button>
              )}
              <button
                className="secondary-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                  fontSize: '13px',
                }}
                onClick={() => navigation.navigate('LibraryMap')}
              >
                <MapIcon size={15} />
                Knowledge Map
              </button>
            </div>
          }
        />
        <div style={{ marginBottom: '20px' }}>
          <TemporalNavigator />
        </div>

        {/* 2. FILTERS & SEARCH */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="sanctuary-search-shell" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={18} color="var(--ink-ghost)" />
              <input
                className="search-input"
                style={{ padding: '8px 0' }}
                placeholder={t('library.searchPlaceholder') || 'Explore the sanctuary...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink-ghost)',
                    fontSize: '16px',
                    padding: '0 4px',
                    lineHeight: 1,
                  }}
                  aria-label="Clear search"
                >
                  &#10005;
                </button>
              )}
            </div>

            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              style={{
                padding: '10px 14px',
                borderRadius: '14px',
                border: '1px solid var(--scene-interactive-border)',
                background:
                  'linear-gradient(180deg, var(--scene-elevated) 0%, var(--scene-interactive) 100%)',
                color: 'var(--ink)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'var(--font-body, DM Sans, sans-serif)',
                flexShrink: 0,
              }}
              aria-label={t('library.sort.label')}
            >
              <option value="recent">{t('library.sort.recent')}</option>
              <option value="popular">{t('library.sort.popular')}</option>
              <option value="most_endorsed">{t('library.sort.endorsed')}</option>
              <option value="most_bookmarked">{t('library.sort.bookmarked')}</option>
            </select>

            <div
              style={{
                display: 'flex',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setViewMode('shelf')}
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'shelf' ? 'var(--action)' : 'var(--scene-interactive)',
                  color: viewMode === 'shelf' ? 'var(--text-on-action)' : 'var(--ink-ghost)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Shelf view"
                title="Shelf view"
              >
                <Layers size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'grid' ? 'var(--action)' : 'var(--scene-interactive)',
                  color: viewMode === 'grid' ? 'var(--text-on-action)' : 'var(--ink-ghost)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Grid view"
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'list' ? 'var(--action)' : 'var(--scene-interactive)',
                  color: viewMode === 'list' ? 'var(--text-on-action)' : 'var(--ink-ghost)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="List view"
                title="List view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'map' ? 'var(--action)' : 'var(--scene-interactive)',
                  color: viewMode === 'map' ? 'var(--text-on-action)' : 'var(--ink-ghost)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Map view"
                title="Map view"
              >
                <MapIcon size={16} />
              </button>
            </div>
          </div>

          <div
            className="filter-scroll"
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
            }}
          >
            {['All', 'trending', 'bookmarks', 'activity'].map((id) => {
              const Icon =
                id === 'All'
                  ? Globe
                  : id === 'trending'
                    ? Flame
                    : id === 'bookmarks'
                      ? Bookmark
                      : Clock;
              return (
                <button
                  key={id}
                  className={`top-tab ${selectedCategoryId === id ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryId(id)}
                  style={{
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon size={14} />
                  {id === 'All' ? 'All Resources' : id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              );
            })}
            <div style={{ width: '1px', background: 'var(--border)', margin: '0 8px' }} />
            {LIBRARY_UI_CATEGORIES.map((cat) => (
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
          <StackFallback />
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}
          >
            {!isSearchMode && heroResource && (
              <HeroBanner
                resource={heroResource}
                onClick={() => handleOpenResource(heroResource)}
              />
            )}

            {isSearchMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '16px' }}>
                  {debouncedSearchQuery
                    ? t('library.foundResults', {
                        count: resources.length,
                        query: debouncedSearchQuery,
                      })
                    : t('library.showingCurated', { category: selectedCategoryId })}
                </div>

                {viewMode === 'shelf' && (
                  <>
                    {collections.length > 0 && (
                      <SmartShelf title="Matching Collections">
                        <div
                          style={{
                            display: 'flex',
                            gap: '20px',
                            overflowX: 'auto',
                            paddingBottom: '16px',
                          }}
                        >
                          {collections.map((col) => (
                            <div
                              key={`search-col-${col.id}`}
                              style={{ width: '320px', flexShrink: 0 }}
                            >
                              <LibraryThumbnailCard
                                title={col.name}
                                type="collection"
                                subject={col.subjects?.[0] || 'Curated'}
                                onPress={() =>
                                  navigation.navigate('CollectionDetail', {
                                    id: col.id,
                                    title: col.name,
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </SmartShelf>
                    )}
                    {orderedShelfDefs.map((shelf) => {
                      const shelfItems = resources.filter((res) => shelf.types.includes(res.type));
                      if (shelfItems.length === 0) return null;
                      return (
                        <SmartShelf key={`search-shelf-${shelf.id}`} title={shelf.label}>
                          <div
                            style={{
                              display: 'flex',
                              gap: '20px',
                              overflowX: 'auto',
                              paddingBottom: '16px',
                            }}
                          >
                            {shelfItems.map((res) => (
                              <div
                                key={`search-${res.id}`}
                                style={{ width: '280px', flexShrink: 0 }}
                              >
                                <LibraryThumbnailCard
                                  title={res.title}
                                  type={res.type}
                                  subject={res.subjects?.[0] ?? 'General'}
                                  thumbnailUrl={
                                    res.media?.url ||
                                    res.thumbnail_url ||
                                    (res.type === 'video' || res.type === 'movie_trailer'
                                      ? getYoutubeThumbnail(res.url)
                                      : undefined)
                                  }
                                  endorsements={res.endorsements}
                                  verified={res.verified}
                                  has_bookmarked={bookmarkedIds.has(res.id)}
                                  onBookmarkToggle={() => handleBookmark(res)}
                                  onPress={() => handleOpenResource(res)}
                                  onLongPress={
                                    res.url ? () => handleOpenResourceOptions(res) : undefined
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </SmartShelf>
                      );
                    })}

                    {resources.filter(
                      (res) => !orderedShelfDefs.some((s) => s.types.includes(res.type)),
                    ).length > 0 && (
                      <SmartShelf title="Diverse Findings">
                        <div
                          style={{
                            display: 'flex',
                            gap: '20px',
                            overflowX: 'auto',
                            paddingBottom: '16px',
                          }}
                        >
                          {resources
                            .filter(
                              (res) => !orderedShelfDefs.some((s) => s.types.includes(res.type)),
                            )
                            .map((res) => (
                              <div
                                key={`search-other-${res.id}`}
                                style={{ width: '280px', flexShrink: 0 }}
                              >
                                <LibraryThumbnailCard
                                  title={res.title}
                                  type={res.type}
                                  subject={res.subjects?.[0] ?? 'General'}
                                  thumbnailUrl={
                                    res.media?.url ||
                                    res.thumbnail_url ||
                                    (res.type === 'video' || res.type === 'movie_trailer'
                                      ? getYoutubeThumbnail(res.url)
                                      : undefined)
                                  }
                                  endorsements={res.endorsements}
                                  verified={res.verified}
                                  onPress={() => handleOpenResource(res)}
                                  onLongPress={
                                    res.url ? () => handleOpenResourceOptions(res) : undefined
                                  }
                                />
                              </div>
                            ))}
                        </div>
                      </SmartShelf>
                    )}
                  </>
                )}

                {viewMode === 'grid' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '24px',
                    }}
                  >
                    {resources.map((res) => (
                      <LibraryThumbnailCard
                        key={`grid-${res.id}`}
                        title={res.title}
                        type={res.type}
                        subject={res.subjects?.[0] ?? 'General'}
                        thumbnailUrl={
                          res.media?.url ||
                          res.thumbnail_url ||
                          (res.type === 'video' || res.type === 'movie_trailer'
                            ? getYoutubeThumbnail(res.url)
                            : undefined)
                        }
                        endorsements={res.endorsements}
                        verified={res.verified}
                        onPress={() => handleOpenResource(res)}
                        onLongPress={res.url ? () => handleOpenResourceOptions(res) : undefined}
                      />
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {resources.map((res) => (
                      <div
                        key={`list-${res.id}`}
                        onClick={() => handleOpenResource(res)}
                        style={{
                          display: 'flex',
                          gap: '20px',
                          padding: '16px',
                          background:
                            'linear-gradient(180deg, var(--scene-elevated) 0%, var(--scene-surface) 100%)',
                          borderRadius: '16px',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          alignItems: 'center',
                        }}
                        className="sanctuary-card"
                      >
                        <div
                          style={{
                            width: '120px',
                            height: '80px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: 'var(--action-soft)',
                            flexShrink: 0,
                          }}
                        >
                          {res.media?.url || getYoutubeThumbnail(res.url) ? (
                            <img
                              src={res.media?.url || getYoutubeThumbnail(res.url)}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              alt={res.title}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--action)',
                              }}
                            >
                              <Plus size={24} />
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: '800',
                              color: 'var(--action)',
                              marginBottom: '4px',
                            }}
                          >
                            {res.type.toUpperCase()}
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink)' }}>
                            {res.title}
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              color: 'var(--ink-ghost)',
                              marginTop: '2px',
                            }}
                          >
                            {res.subjects?.[0]} &bull; {res.creator_name}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--action)',
                            fontSize: '13px',
                            fontWeight: '600',
                          }}
                        >
                          <Play size={14} fill="currentColor" />
                          {t('library.view')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'map' && (
                  <div className="sanctuary-map-stage" style={{ height: '600px' }}>
                    <UniversalPerspective
                      data={mapTopology as any}
                      layout={mapLayout as any}
                      width={Math.max(width, 720)}
                      height={600}
                      onNodePress={(node) => {
                        const res = resources.find((r) => r.id === node.id);
                        if (res) handleOpenResource(res);
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* DEFAULT VIEW */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                <SanctuaryPulse
                  resourceCount={resources.length}
                  collectionCount={collections.length}
                  bookmarkCount={bookmarkedIds.size}
                />

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: canReview
                      ? 'minmax(0, 1.2fr) minmax(280px, 0.8fr)'
                      : '1fr',
                    gap: '20px',
                  }}
                >
                  <DoorwayCard
                    eyebrow="Knowledge map"
                    title="Enter the Cosmos"
                    description="Move from shelves into a calmer constellation view when you want relationships, not just search results."
                    accent="rgba(132, 111, 212, 0.14)"
                    ctaLabel="Open map"
                    onClick={() => navigation.navigate('LibraryMap')}
                  />
                  {canReview && (
                    <DoorwayCard
                      eyebrow="Curator pathway"
                      title="Review and publish"
                      description="Contributors and reviewers can move straight into publishing flow without turning the whole library into a workspace canvas."
                      accent="rgba(221, 155, 40, 0.16)"
                      ctaLabel="Curator review"
                      onClick={() => navigation.navigate('CuratorReview')}
                    />
                  )}
                </div>

                {collections.length > 0 && (
                  <SmartShelf title="Featured Collections">
                    <div
                      style={{
                        display: 'flex',
                        gap: '20px',
                        overflowX: 'auto',
                        paddingBottom: '16px',
                      }}
                    >
                      {collections.map((col: any) => (
                        <CollectionPreviewCard
                          key={`col-${col.id}`}
                          title={col.name}
                          typeLabel={
                            col.is_virtual ? t('library.dynamic') : t('library.collection')
                          }
                          resourceCount={col.used_by_count ?? col.resource_ids?.length ?? 0}
                          onClick={() =>
                            navigation.navigate('CollectionDetail', { id: col.id, title: col.name })
                          }
                        />
                      ))}
                    </div>
                  </SmartShelf>
                )}

                {orderedShelfDefs.map((shelf) => {
                  const shelfItems = resources.filter((res) => shelf.types.includes(res.type));
                  if (shelfItems.length === 0) return null;
                  return (
                    <SmartShelf key={`default-shelf-${shelf.id}`} title={shelf.label}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '20px',
                          overflowX: 'auto',
                          paddingBottom: '16px',
                        }}
                      >
                        {shelfItems.map((res) => (
                          <div key={`res-${res.id}`} style={{ width: '280px', flexShrink: 0 }}>
                            <LibraryThumbnailCard
                              title={res.title}
                              type={res.type}
                              subject={res.subjects?.[0] ?? 'General'}
                              thumbnailUrl={
                                res.media?.url ||
                                res.thumbnail_url ||
                                (res.type === 'video' || res.type === 'movie_trailer'
                                  ? getYoutubeThumbnail(res.url)
                                  : undefined)
                              }
                              endorsements={res.endorsements}
                              verified={res.verified}
                              has_bookmarked={bookmarkedIds.has(res.id)}
                              onBookmarkToggle={() => handleBookmark(res)}
                              onPress={() => handleOpenResource(res)}
                              onLongPress={
                                res.url ? () => handleOpenResourceOptions(res) : undefined
                              }
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
                {isFetchingNextResources ? t('library.loadingMore') : t('library.loadMoreFindings')}
              </button>
            )}
          </div>
        )}
      </div>

      {can('create', 'LibraryResource') && (
        <AssetCreationModal
          isOpen={showAddResource && !isPastView}
          onClose={() => setShowAddResource(false)}
          onAdd={async (data) => {
            if (!user?.id) return;
            try {
              const input: CreateResourceInput = {
                title: data.title,
                description: data.description,
                type: data.type as any,
                format:
                  data.url.includes('youtube') ||
                  data.url.includes('youtu.be') ||
                  data.url.includes('vimeo')
                    ? 'video'
                    : data.url.match(/\.pdf(\?|$)/i)
                      ? 'document'
                      : 'document',
                url: data.url,
                subject: data.tags[0] ?? 'General',
                topics: data.tags,
                grades: [],
                difficulty: 'intermediate',
                language: 'english',
                visibility: 'school',
              };
              const created = await libraryAPI.createResource(
                input,
                user.id,
                (user as any).authority || 'student',
              );
              supabase.functions
                .invoke('library-etl', {
                  body: { resourceId: created.id, action: 'enrich' },
                })
                .catch((err) => console.warn('[LibraryScreen] ETL enrichment failed:', err));
              setShowAddResource(false);
              showToast('Resource contributed! It will be reviewed before publishing.', 'success');
              fetchResources();
            } catch (err: unknown) {
              showToast((err as Error).message ?? 'Failed to add resource', 'error');
            }
          }}
        />
      )}
    </div>
  );
}

function SanctuaryPulse({
  resourceCount,
  collectionCount,
  bookmarkCount,
}: {
  resourceCount: number;
  collectionCount: number;
  bookmarkCount: number;
}) {
  const items = [
    { label: 'Resources', value: resourceCount, accent: 'rgba(221,155,40,0.14)' },
    { label: 'Collections', value: collectionCount, accent: 'rgba(103,152,214,0.14)' },
    { label: 'Bookmarks', value: bookmarkCount, accent: 'rgba(90,154,124,0.14)' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '14px',
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="sanctuary-card"
          style={{
            padding: '18px 20px',
            borderRadius: '18px',
            border: '1px solid var(--border)',
            background: `linear-gradient(180deg, ${item.accent} 0%, rgba(255,255,255,0.88) 100%)`,
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.04em',
              color: 'var(--ink-ghost)',
              marginBottom: '8px',
            }}
          >
            {item.label}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--ink)' }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function DoorwayCard({
  eyebrow,
  title,
  description,
  accent,
  ctaLabel,
  onClick,
}: {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  ctaLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="sanctuary-card"
      onClick={onClick}
      style={{
        padding: '24px',
        borderRadius: '22px',
        border: '1px solid var(--border)',
        background: `linear-gradient(135deg, ${accent} 0%, rgba(255,255,255,0.9) 100%)`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '12px',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: '800',
          letterSpacing: '0.05em',
          color: 'var(--ink-ghost)',
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </div>
      <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', lineHeight: 1.1 }}>
        {title}
      </div>
      <div
        style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--ink-ghost)', maxWidth: '48ch' }}
      >
        {description}
      </div>
      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--action)' }}>{ctaLabel}</div>
    </button>
  );
}

function CollectionPreviewCard({
  title,
  typeLabel,
  resourceCount,
  onClick,
}: {
  title: string;
  typeLabel: string;
  resourceCount: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="sanctuary-card"
      onClick={onClick}
      style={{
        width: '264px',
        minHeight: '184px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        background:
          'linear-gradient(160deg, rgba(221,155,40,0.14) 0%, rgba(103,152,214,0.12) 52%, rgba(255,255,255,0.92) 100%)',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          color: 'var(--action)',
          fontWeight: '800',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {typeLabel}
      </div>
      <div style={{ fontWeight: '700', fontSize: '20px', color: 'var(--ink)', lineHeight: 1.15 }}>
        {title}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--ink-ghost)',
          fontSize: '13px',
          fontWeight: '600',
        }}
      >
        <span>{resourceCount} resources</span>
        <span style={{ color: 'var(--action)' }}>Open</span>
      </div>
    </button>
  );
}

function HeroBanner({ resource, onClick }: { resource: LibraryResource; onClick: () => void }) {
  const artwork = resource.media?.url || resource.thumbnail_url;

  return (
    <button
      type="button"
      className="sanctuary-hero-panel"
      onClick={onClick}
      style={{
        minHeight: '344px',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        marginBottom: '40px',
        border: '1px solid var(--border)',
        background:
          'linear-gradient(135deg, rgba(221,155,40,0.14) 0%, rgba(103,152,214,0.12) 48%, rgba(255,255,255,0.92) 100%)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.08fr) minmax(320px, 0.92fr)',
        padding: '0',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          minHeight: '344px',
          background: artwork
            ? `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), url(${artwork}) center/cover no-repeat`
            : 'linear-gradient(180deg, rgba(221,155,40,0.18) 0%, rgba(103,152,214,0.18) 100%)',
          borderRight: '1px solid rgba(120, 120, 120, 0.12)',
        }}
      />
      <div
        style={{
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '18px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '0.08em',
            color: 'var(--action)',
            textTransform: 'uppercase',
          }}
        >
          <span>Featured</span>
          {resource.subjects?.[0] ? <span>{resource.subjects[0]}</span> : null}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: '800',
              margin: 0,
              color: 'var(--ink)',
              lineHeight: 1.02,
            }}
          >
            {resource.title}
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--ink-ghost)',
              maxWidth: '42ch',
              margin: 0,
              lineHeight: '1.6',
            }}
          >
            {resource.description ||
              'Open the lead resource and move directly into reading, video, or study without leaving the sanctuary flow.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            className="premium-button"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Play size={16} fill="currentColor" />
            Open Now
          </div>
          {resource.creator_name ? (
            <div style={{ fontSize: '13px', color: 'var(--ink-ghost)', fontWeight: '600' }}>
              Curated by {resource.creator_name}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}
