import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { growthSignalsAPI, impactRipplesAPI } from '@repo/core/api/client';
import { usePendingGateAction } from '@repo/core/hooks';
import { setPendingGateAction, usePermissions, useStore, useTemporalStore } from '@repo/core/logic';
import type { User } from '@repo/core/types';
import { libraryAPI } from '@repo/library/api/library';
import { CollectionPickerModal } from '@repo/library/components/CollectionPickerModal';
import { LibraryThumbnailCard } from '@repo/library/components/LibraryThumbnailCard';
import { ResourceList } from '@repo/library/components/ResourceList';
import { LIBRARY_UI_CATEGORIES } from '@repo/library/constants/categories';
import { getOrderedShelfDefs } from '@repo/library/constants/shelf';
import { useLibrary } from '@repo/library/hooks/useLibrary';
import type {
  CreateResourceInput,
  KnowledgeTopology,
  LayoutResult,
  LibraryCollection,
  LibraryResource,
  ResourceFilters,
  ResourceType,
  ResourceVisibility,
} from '@repo/library/types';
import { buildLibraryExternalLinkOptions } from '@repo/library/utils/externalLinks';
import { buildLibraryResourceOpenParams } from '@repo/library/utils/resourceLinks';
import {
  AssetCreationModal,
  CollectionCreationModal,
} from '@repo/ui/components/media/AssetCreationPortal';
import { ResourceActionSheet } from '@repo/ui/components/media/ResourceActionSheet';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import { SmartShelf } from '@repo/ui/components/SmartShelf';
import { UniversalPerspective } from '@repo/ui/components/visualization';
import { WebScreenHeader } from '@repo/ui/components/WebScreenHeader.web';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { useResponsive } from '@repo/ui/hooks';
import {
  Bookmark,
  Clock,
  EllipsisVertical,
  Flame,
  Globe,
  Layers,
  LayoutGrid,
  Library,
  List,
  Lock,
  Map as MapIcon,
  Pen,
  Play,
  Plus,
  Search,
  Trash2,
  Users,
} from '@repo/ui/icons';
import { Box } from '@repo/ui/primitives';
import { resolveBlockingScreenState } from '@repo/ui/state/screenState';
import { openExternalURL, showExternalLinkOptions } from '@repo/ui/utils';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

function StackFallback() {
  const { t } = useTranslation();

  return (
    <div
      className="sanctuary-card"
      role="status"
      aria-live="polite"
      style={{ padding: '48px 32px', display: 'grid', placeItems: 'center', gap: '12px' }}
    >
      <BrandPulse size={32} accessibilityLabel={t('library.loadingSanctuary', 'Loading the sanctuary')} />
      <span>{t('library.loadingSanctuary', 'Loading the sanctuary...')}</span>
    </div>
  );
}

function getLibraryCreateErrorMessage(err: unknown): string {
  const apiError = err as {
    message?: unknown;
    code?: unknown;
    details?: { devDetails?: { code?: unknown; message?: unknown; hint?: unknown } } | undefined;
  } | null;
  const nestedError = apiError?.details?.devDetails;
  const rawMessage =
    typeof nestedError?.message === 'string'
      ? nestedError.message
      : err instanceof Error
        ? err.message
        : typeof apiError?.message === 'string'
          ? apiError.message
          : typeof err === 'string'
            ? err
            : '';
  const code =
    typeof nestedError?.code === 'string'
      ? nestedError.code
      : apiError && typeof apiError.code === 'string'
        ? apiError.code
        : '';
  const hint = typeof nestedError?.hint === 'string' ? nestedError.hint : '';
  const signal = `${code} ${rawMessage} ${hint}`.toLowerCase();

  if (
    code === '42501' ||
    signal.includes('row-level security') ||
    signal.includes('permission denied') ||
    signal.includes('violates row-level security policy') ||
    signal.includes('failed to create resource')
  ) {
    return 'Your account is hitting the library onboarding or RLS gate. The DB is rejecting the insert, so the next step is to apply the onboarding migration and re-test.';
  }

  return rawMessage || 'Failed to add resource';
}

export default function LibraryScreenWeb() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useResponsive();
  const isCompactWeb = width < 920;
  const collectionsSectionRef = useRef<HTMLDivElement>(null);
  const { can } = usePermissions();
  const { isPastView } = useTemporalStore();

  const pending = usePendingGateAction();
  const user = useStore((state) => state.user);
  const showToast = useStore((state) => state.showToast);

  interface LibraryState {
    searchQuery: string;
    debouncedSearchQuery: string;
    selectedCategoryId: string;
    selectedSort: 'recent' | 'popular' | 'most_endorsed' | 'most_bookmarked';
    viewMode: 'shelf' | 'grid' | 'list' | 'map';
    refreshing: boolean;
    isSyncing: boolean;
    fallbackAttempted: boolean;
    fallbackError: string | null;
    isFetchingPublic: boolean;
    publicCollections: LibraryCollection[];
    selectedResource: LibraryResource | null;
    isActionSheetVisible: boolean;
    isCollectionPickerVisible: boolean;
    isCollectionCreationVisible: boolean;
    isAssetCreationVisible: boolean;
    isAddingToCollection: boolean;
    syncError: string | null;
  }

  const initialState: LibraryState = {
    searchQuery: '',
    debouncedSearchQuery: '',
    selectedCategoryId: 'All',
    selectedSort: 'recent',
    viewMode: 'shelf',
    refreshing: false,
    isSyncing: false,
    fallbackAttempted: false,
    fallbackError: null,
    isFetchingPublic: false,
    publicCollections: [],
    selectedResource: null,
    isActionSheetVisible: false,
    isCollectionPickerVisible: false,
    isCollectionCreationVisible: false,
    isAssetCreationVisible: false,
    isAddingToCollection: false,
    syncError: null,
  };

  type LibraryAction =
    | { type: 'SET_SEARCH'; query: string }
    | { type: 'SET_DEBOUNCED_SEARCH'; query: string }
    | { type: 'SET_CATEGORY'; id: string }
    | { type: 'SET_SORT'; sort: LibraryState['selectedSort'] }
    | { type: 'SET_VIEW_MODE'; mode: LibraryState['viewMode'] }
    | { type: 'SET_SYNCING'; isSyncing: boolean }
    | { type: 'SET_SYNC_ERROR'; error: string | null }
    | { type: 'SET_REFRESHING'; refreshing: boolean }
    | { type: 'SET_FETCHING_PUBLIC'; isFetching: boolean }
    | { type: 'SET_PUBLIC_COLLECTIONS'; collections: LibraryCollection[] }
    | { type: 'MARK_FALLBACK_ATTEMPTED' }
    | { type: 'SET_FALLBACK_ERROR'; error: string | null }
    | { type: 'RETRY_PUBLIC_FALLBACK' }
    | { type: 'SET_SELECTED_RESOURCE'; resource: LibraryResource | null }
    | { type: 'SET_ADDING_TO_COLLECTION'; isAdding: boolean }
    | {
        type: 'SET_MODAL';
        name: 'actionSheet' | 'picker' | 'collectionCreation' | 'assetCreation';
        isOpen: boolean;
      };

  function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
    switch (action.type) {
      case 'SET_SEARCH':
        return { ...state, searchQuery: action.query };
      case 'SET_DEBOUNCED_SEARCH':
        return { ...state, debouncedSearchQuery: action.query };
      case 'SET_CATEGORY':
        return { ...state, selectedCategoryId: action.id };
      case 'SET_SORT':
        return { ...state, selectedSort: action.sort };
      case 'SET_VIEW_MODE':
        return { ...state, viewMode: action.mode };
      case 'SET_SYNCING':
        return { ...state, isSyncing: action.isSyncing };
      case 'SET_SYNC_ERROR':
        return { ...state, syncError: action.error };
      case 'SET_REFRESHING':
        return { ...state, refreshing: action.refreshing };
      case 'SET_FETCHING_PUBLIC':
        return { ...state, isFetchingPublic: action.isFetching };
      case 'SET_PUBLIC_COLLECTIONS':
        return { ...state, publicCollections: action.collections };
      case 'MARK_FALLBACK_ATTEMPTED':
        return { ...state, fallbackAttempted: true };
      case 'SET_FALLBACK_ERROR':
        return { ...state, fallbackError: action.error };
      case 'RETRY_PUBLIC_FALLBACK':
        return { ...state, fallbackAttempted: false, fallbackError: null };
      case 'SET_SELECTED_RESOURCE':
        return { ...state, selectedResource: action.resource };
      case 'SET_MODAL':
        if (action.name === 'actionSheet') return { ...state, isActionSheetVisible: action.isOpen };
        if (action.name === 'picker') return { ...state, isCollectionPickerVisible: action.isOpen };
        if (action.name === 'collectionCreation')
          return { ...state, isCollectionCreationVisible: action.isOpen };
        if (action.name === 'assetCreation')
          return { ...state, isAssetCreationVisible: action.isOpen };
        return state;
      case 'SET_ADDING_TO_COLLECTION':
        return { ...state, isAddingToCollection: action.isAdding };
      default:
        return state;
    }
  }

  const [
    {
      searchQuery,
      debouncedSearchQuery,
      selectedCategoryId,
      selectedSort,
      viewMode,
      refreshing: _refreshing,
      isSyncing: _isSyncing,
      syncError,
      fallbackAttempted,
      fallbackError,
      isFetchingPublic: _isFetchingPublic,
      publicCollections,
      selectedResource,
      isActionSheetVisible,
      isCollectionPickerVisible,
      isCollectionCreationVisible,
      isAssetCreationVisible,
      isAddingToCollection,
    },
    dispatch,
  ] = useReducer(libraryReducer, initialState);

  // Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch({ type: 'SET_DEBOUNCED_SEARCH', query: searchQuery });
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Resume-after-upgrade: open Add Resource modal if it was the gated action.
  useEffect(() => {
    if (!pending.action) return;
    if (pending.action.kind !== 'library_open_add_resource') return;
    if (!can('create', 'LibraryResource')) return;
    if (isPastView) return;

    // Use a microtask to avoid synchronous state update during render/effect cycle
    void Promise.resolve().then(() => {
      dispatch({ type: 'SET_MODAL', name: 'assetCreation', isOpen: true });
      void pending.clear().catch(() => {});
    });
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
    resources: rawResources,
    isLoadingResources,
    isFetchingNextResources,
    hasNextResources,
    fetchNextResources,
    fetchResources,
    categories: rawCategories,
    isLoadingCategories,
    collections: rawCollections,
    isLoadingCollections,
    totalResourcesCount,
    totalCollectionsCount,
    createResource,
    endorseResource,
    bookmarkResource,
    isBookmarking,
    addToCollection,
    updateCollection,
    deleteCollection,
    createCollection,
    syncLibrary,
    loading,
    error: libraryError,
  } = useLibrary(libraryFilters as ResourceFilters, libraryFilters as ResourceFilters);

  // Sync Library on mount (Parity)
  useEffect(() => {
    dispatch({ type: 'SET_SYNCING', isSyncing: true });
    dispatch({ type: 'SET_SYNC_ERROR', error: null });
    syncLibrary()
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'The library could not sync.';
        console.error('Library sync failed:', err);
        dispatch({ type: 'SET_SYNC_ERROR', error: message });
      })
      .finally(() => dispatch({ type: 'SET_SYNCING', isSyncing: false }));
  }, [syncLibrary]);

  const retryLibraryLoad = useCallback(() => {
    dispatch({ type: 'SET_SYNC_ERROR', error: null });
    void Promise.all([fetchResources(), syncLibrary()]).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'The library could not refresh.';
      dispatch({ type: 'SET_SYNC_ERROR', error: message });
    });
  }, [fetchResources, syncLibrary]);

  // Public Collection Fallback (Parity)
  const isFetchingPublicRef = useRef(false);

  useEffect(() => {
    if (
      !loading &&
      rawResources.length === 0 &&
      rawCollections.length === 0 &&
      publicCollections.length === 0 &&
      !fallbackAttempted &&
      !isFetchingPublicRef.current
    ) {
      isFetchingPublicRef.current = true;
      dispatch({ type: 'SET_FETCHING_PUBLIC', isFetching: true });
      libraryAPI
        .getCollections({
          limit: 10,
          visibility: 'public',
        })
        .then((cols: any) => {
          dispatch({ type: 'SET_PUBLIC_COLLECTIONS', collections: cols });
          dispatch({ type: 'SET_FALLBACK_ERROR', error: null });
          dispatch({ type: 'MARK_FALLBACK_ATTEMPTED' });
        })
        .catch(() => {
          dispatch({
            type: 'SET_FALLBACK_ERROR',
            error: 'Public collections could not be loaded. Your personal library is still available.',
          });
          dispatch({ type: 'MARK_FALLBACK_ATTEMPTED' });
        })
        .finally(() => {
          dispatch({ type: 'SET_FETCHING_PUBLIC', isFetching: false });
          isFetchingPublicRef.current = false;
        });
    }
  }, [
    loading,
    rawResources.length,
    rawCollections.length,
    publicCollections.length,
    fallbackAttempted,
  ]);

  const resources = useMemo(() => rawResources, [rawResources]);
  const categories = useMemo(() => rawCategories, [rawCategories]);
  const collections = useMemo(
    () => (rawCollections.length > 0 ? rawCollections : publicCollections),
    [rawCollections, publicCollections],
  );
  const retryPublicCollectionsFallback = useCallback(() => {
    dispatch({ type: 'RETRY_PUBLIC_FALLBACK' });
  }, []);
  const blockingScreenState = resolveBlockingScreenState({
    hasContent: resources.length > 0 || collections.length > 0,
    isLoading: loading,
    error: libraryError,
  });

  const handleEndReached = useCallback(() => {
    if (hasNextResources && !isFetchingNextResources) {
      void fetchNextResources();
    }
  }, [hasNextResources, isFetchingNextResources, fetchNextResources]);

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

  const diverseFindings = useMemo(
    () => resources.filter((res) => !orderedShelfDefs.some((s) => s.types.includes(res.type))),
    [resources, orderedShelfDefs],
  );

  const mapTopology = useMemo(
    () => ({
      nodes: resources.map((res: LibraryResource) => ({
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
        .map((res: LibraryResource, i: number) => {
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

  const handleOpenResource = useCallback(
    (resource: LibraryResource) => {
      if (!resource.url) return;
      if (resource.type === 'pdf') {
        router.push({
          pathname: '/library/document/[resourceId]',
          params: buildLibraryResourceOpenParams(resource),
        });
        return;
      }
      if (resource.type === 'video' || resource.type === 'movie_trailer') {
        router.push({
          pathname: '/library/video/[resourceId]',
          params: buildLibraryResourceOpenParams(resource),
        });
        return;
      }
      openExternalURL(resource.url, buildLibraryExternalLinkOptions(resource)).catch(() => {
        showToast(t('library.openFailed', 'Could not open this resource. Please try again.'), 'error');
      });
    },
    [router, showToast, t],
  );

  const handleOpenResourceOptions = useCallback(
    (resource: LibraryResource) => {
      if (
        !resource.url ||
        resource.type === 'pdf' ||
        resource.type === 'video' ||
        resource.type === 'movie_trailer'
      ) {
        return;
      }

      showExternalLinkOptions(resource.url, buildLibraryExternalLinkOptions(resource)).catch(() => {
        showToast(t('library.linkOptionsFailed', 'Could not show link options. Please try again.'), 'error');
      });
    },
    [showToast, t],
  );

  const handleLongPressResource = useCallback((res: LibraryResource) => {
    dispatch({ type: 'SET_SELECTED_RESOURCE', resource: res });
    dispatch({ type: 'SET_MODAL', name: 'actionSheet', isOpen: true });
  }, []);

  const handleAddToCollection = useCallback(
    async (collectionId: string) => {
      if (isPastView || !selectedResource) return;
      try {
        await libraryAPI.addToCollection(collectionId, selectedResource.id);
        dispatch({ type: 'SET_MODAL', name: 'picker', isOpen: false });
        showToast('Added to collection!', 'success');
      } catch (err) {
        console.error('Failed to add to collection:', err);
        showToast('Failed to add to collection.', 'error');
      }
    },
    [isPastView, selectedResource, showToast],
  );

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
              schoolId: user.school_id ?? undefined,
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
        showToast(
          t('library.bookmarkFailed', 'Could not save bookmark. Please try again.'),
          'error',
        );
      }
    },
    [isPastView, user, showToast, t],
  );

  const canCreate = can('create', 'LibraryResource');
  const handleAddResourcePress = useCallback(() => {
    if (isPastView) {
      showToast(
        t('library.pastReadonly', 'Past view is read-only. Return to today to contribute.'),
        'info',
      );
      return;
    }
    if (!canCreate) {
      setPendingGateAction({
        kind: 'library_open_add_resource',
        createdAt: Date.now(),
      }).catch(() => {});
      router.push('/auth');
      return;
    }
    dispatch({ type: 'SET_MODAL', name: 'assetCreation', isOpen: true });
  }, [canCreate, isPastView, router, showToast, t]);

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

  const getTopFilterLabel = useCallback(
    (id: string) => {
      if (id === 'All') return t('library.filter.allResources', 'All Resources');
      if (id === 'trending') return t('library.filter.trending', 'Trending');
      if (id === 'bookmarks') return t('library.filter.bookmarks', 'Bookmarks');
      if (id === 'activity') return t('library.filter.activity', 'Activity');
      return id;
    },
    [t],
  );

  const getCategoryLabel = useCallback(
    (id: string, fallback: string) => t('library.category.' + id, fallback),
    [t],
  );

  const handleBrowse = useCallback(() => {
    dispatch({ type: 'SET_SEARCH', query: '' });
    dispatch({ type: 'SET_CATEGORY', id: 'All' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCollections = useCallback(() => {
    dispatch({ type: 'SET_SEARCH', query: '' });
    dispatch({ type: 'SET_CATEGORY', id: 'All' });
    collectionsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="sanctuary-screen">
      <div className="sanctuary-container" style={{ maxWidth: isCompactWeb ? '760px' : '1180px' }}>
        <WebScreenHeader
          title={t('library.web.title', 'The Sanctuary')}
          note={t('library.web.note', 'Gurudevi Knowledge Hub')}
          timeText={t('library.web.timeText', 'Curated Wisdom')}
          actions={
            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {canContribute && (
                <button
                  type="button"
                  className="premium-button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                    fontSize: '13px',
                  }}
                  onClick={() =>
                    dispatch({
                      type: 'SET_MODAL',
                      name: 'collectionCreation',
                      isOpen: true,
                    })
                  }
                  disabled={isPastView}
                >
                  <Library size={15} />
                  {t('library.newCollection', '+ Collection')}
                </button>
              )}
              {canContribute && (
                <button
                  type="button"
                  className="secondary-button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                    fontSize: '13px',
                    marginLeft: '8px',
                  }}
                  onClick={handleAddResourcePress}
                  disabled={isPastView}
                >
                  <Plus size={15} />
                  {t('library.contributeResource', 'Contribute Resource')}
                </button>
              )}
              <button
                type="button"
                className="secondary-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                  fontSize: '13px',
                  marginLeft: '8px',
                }}
                onClick={() => router.push('/library/map')}
              >
                <MapIcon size={15} />
                {t('library.knowledgeMap', 'Knowledge Map')}
              </button>
            </div>
          }
        />
        {/* No temporal filter in library tab */}

        <nav
          aria-label={t('library.web.sectionNavigation', 'Library sections')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isCompactWeb ? '4px' : '8px',
            marginBottom: isCompactWeb ? '24px' : '32px',
            padding: '4px',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            background: 'var(--scene-interactive)',
            width: 'fit-content',
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={handleBrowse}
            aria-current={!searchQuery && selectedCategoryId === 'All' ? 'page' : undefined}
            className="top-tab"
            style={{
              border: 'none',
              background:
                !searchQuery && selectedCategoryId === 'All' ? 'var(--action)' : 'transparent',
              color:
                !searchQuery && selectedCategoryId === 'All'
                  ? 'var(--text-on-action)'
                  : 'var(--ink-soft)',
              whiteSpace: 'nowrap',
            }}
          >
            {t('library.web.browse', 'Browse')}
          </button>
          <button
            type="button"
            onClick={handleCollections}
            aria-controls="library-collections"
            className="top-tab"
            style={{ border: 'none', background: 'transparent', whiteSpace: 'nowrap' }}
          >
            {t('library.web.collections', 'Collections')}
          </button>
          {canContribute && (
            <button
              type="button"
              onClick={handleAddResourcePress}
              disabled={isPastView}
              className="top-tab"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--action)',
                whiteSpace: 'nowrap',
              }}
            >
              {t('library.web.contribute', 'Contribute')}
            </button>
          )}
        </nav>

        {/* 2. FILTERS & SEARCH */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div className="sanctuary-search-shell" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={18} color="var(--ink-ghost)" />
              <input
                className="search-input"
                style={{ padding: '8px 0' }}
                placeholder={t('library.searchPlaceholder', 'Explore the sanctuary...')}
                value={searchQuery}
                onChange={(e) => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_SEARCH', query: '' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink-ghost)',
                    fontSize: '16px',
                    padding: '0 4px',
                    lineHeight: 1,
                  }}
                  aria-label={t('library.clearSearch', 'Clear search')}
                >
                  &#10005;
                </button>
              )}
            </div>

            <select
              value={selectedSort}
              onChange={(e) =>
                dispatch({
                  type: 'SET_SORT',
                  sort: e.target.value as LibraryState['selectedSort'],
                })
              }
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
                type="button"
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'shelf' })}
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'shelf' ? 'var(--action)' : 'var(--scene-interactive)',
                  color: viewMode === 'shelf' ? 'var(--text-on-action)' : 'var(--ink-ghost)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={t('library.viewMode.shelf', 'Shelf view')}
                title={t('library.viewMode.shelf', 'Shelf view')}
              >
                <Layers size={16} />
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'grid' })}
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'grid' ? 'var(--action)' : 'var(--scene-interactive)',
                  color: viewMode === 'grid' ? 'var(--text-on-action)' : 'var(--ink-ghost)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={t('library.viewMode.grid', 'Grid view')}
                title={t('library.viewMode.grid', 'Grid view')}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'list' })}
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'list' ? 'var(--action)' : 'var(--scene-interactive)',
                  color: viewMode === 'list' ? 'var(--text-on-action)' : 'var(--ink-ghost)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={t('library.viewMode.list', 'List view')}
                title={t('library.viewMode.list', 'List view')}
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'map' })}
                style={{
                  padding: '10px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'map' ? 'var(--action)' : 'var(--scene-interactive)',
                  color: viewMode === 'map' ? 'var(--text-on-action)' : 'var(--ink-ghost)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={t('library.viewMode.map', 'Map view')}
                title={t('library.viewMode.map', 'Map view')}
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
                  type="button"
                  key={id}
                  className={`top-tab ${selectedCategoryId === id ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_CATEGORY', id })}
                  style={{
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon size={14} />
                  {getTopFilterLabel(id)}
                </button>
              );
            })}
            <div
              style={{
                width: '1px',
                background: 'var(--border)',
                margin: '0 8px',
              }}
            />
            {LIBRARY_UI_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.id}
                className={`top-tab ${selectedCategoryId === cat.id ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_CATEGORY', id: cat.id })}
                style={{ whiteSpace: 'nowrap' }}
              >
                {getCategoryLabel(cat.id, cat.en)}
              </button>
            ))}
          </div>
        </div>

        {/* 3. CONTENT AREA */}
        {blockingScreenState === 'error' ? (
          <BrandedErrorState
            title={t('library.loadFailedTitle', 'Library unavailable')}
            message={t(
              'library.loadFailedMessage',
              'We could not load your library. Please check your connection and try again.',
            )}
          >
            <button type="button" className="premium-button" onClick={retryLibraryLoad}>
              {t('common.tryAgain', 'Try again')}
            </button>
          </BrandedErrorState>
        ) : blockingScreenState === 'loading' ? (
          <StackFallback />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
              paddingBottom: '60px',
            }}
          >
            {syncError ? (
              <div
                role="status"
                aria-live="polite"
                className="sanctuary-card"
                style={{ padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}
              >
                <span style={{ flex: 1, color: 'var(--ink-soft)', fontSize: '14px' }}>
                  {t(
                    'library.syncFailedMessage',
                    'Your latest library changes have not synced yet. You can keep browsing saved content.',
                  )}
                </span>
                <button type="button" className="secondary-button" onClick={retryLibraryLoad}>
                  {t('common.retry', 'Retry')}
                </button>
              </div>
            ) : null}
            {fallbackError ? (
              <div
                role="status"
                aria-live="polite"
                className="sanctuary-card"
                style={{ padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}
              >
                <span style={{ flex: 1, color: 'var(--ink-soft)', fontSize: '14px' }}>
                  {fallbackError}
                </span>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={retryPublicCollectionsFallback}
                >
                  {t('common.retry', 'Retry')}
                </button>
              </div>
            ) : null}
            {!isSearchMode && heroResource && (
              <HeroBanner
                resource={heroResource}
                onClick={() => handleOpenResource(heroResource)}
              />
            )}

            {isSearchMode ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: 'var(--ink-ghost)',
                    marginBottom: '16px',
                  }}
                >
                  {debouncedSearchQuery
                    ? t('library.foundResults', {
                        count: resources.length,
                        query: debouncedSearchQuery,
                      })
                    : t('library.showingCurated', {
                        category: getCategoryLabel(selectedCategoryId, selectedCategoryId),
                      })}
                </div>

                {viewMode === 'shelf' && (
                  <>
                    {categories.length > 0 && (
                      <SmartShelf
                        title={t('library.shelfTitle.matchingCategories', 'Matching Categories')}
                      >
                        <SanctuaryFlashList
                          data={categories}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          keyExtractor={(col: LibraryCollection) => `search-cat-${col.id}`}
                          estimatedItemSize={320}
                          contentContainerStyle={{ paddingBottom: 16 }}
                          renderItem={({ item: col }: { item: LibraryCollection }) => (
                            <Box className="mr-5 w-[320px]">
                              <LibraryThumbnailCard
                                title={col.name}
                                type="collection"
                                subject={
                                  col.subjects?.[0] || t('library.curatedCollection', 'Curated')
                                }
                                onPress={() =>
                                  router.push({
                                    pathname: '/library/collections/[id]',
                                    params: {
                                      id: col.id,
                                      title: col.name,
                                    },
                                  })
                                }
                              />
                            </Box>
                          )}
                        />
                      </SmartShelf>
                    )}

                    {collections.length > 0 && (
                      <SmartShelf
                        title={t('library.shelfTitle.matchingCollections', 'Matching Collections')}
                      >
                        <SanctuaryFlashList
                          data={collections}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          keyExtractor={(col: LibraryCollection) => `search-col-${col.id}`}
                          estimatedItemSize={320}
                          contentContainerStyle={{ paddingBottom: 16 }}
                          renderItem={({ item: col }: { item: LibraryCollection }) => (
                            <Box className="mr-5 w-[320px]">
                              <LibraryThumbnailCard
                                title={col.name}
                                type="collection"
                                subject={
                                  col.subjects?.[0] || t('library.curatedCollection', 'Curated')
                                }
                                onPress={() =>
                                  router.push({
                                    pathname: '/library/collections/[id]',
                                    params: {
                                      id: col.id,
                                      title: col.name,
                                    },
                                  })
                                }
                              />
                            </Box>
                          )}
                        />
                      </SmartShelf>
                    )}
                    {orderedShelfDefs.map((shelf) => {
                      const shelfItems = resources.filter((res) => shelf.types.includes(res.type));
                      if (shelfItems.length === 0) return null;
                      return (
                        <SmartShelf
                          key={`search-shelf-${shelf.id}`}
                          title={t('library.shelf.' + shelf.id, shelf.label)}
                        >
                          <SanctuaryFlashList
                            data={shelfItems}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(res) => `search-${shelf.id}-${res.id}`}
                            estimatedItemSize={280}
                            contentContainerStyle={{ paddingBottom: 16 }}
                            renderItem={({ item: res }) => (
                              <Box className="mr-5 w-[280px]">
                                <LibraryThumbnailCard
                                  resource={res}
                                  has_bookmarked={bookmarkedIds.has(res.id)}
                                  onBookmarkToggle={() => handleBookmark(res)}
                                  onPress={handleOpenResource}
                                  onLongPress={handleLongPressResource}
                                />
                              </Box>
                            )}
                          />
                        </SmartShelf>
                      );
                    })}

                    {diverseFindings.length > 0 && (
                      <SmartShelf
                        title={t('library.shelfTitle.diverseFindings', 'Diverse Findings')}
                      >
                        <SanctuaryFlashList
                          data={diverseFindings}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          keyExtractor={(res) => `search-other-${res.id}`}
                          estimatedItemSize={280}
                          contentContainerStyle={{ paddingBottom: 16 }}
                          renderItem={({ item: res }) => (
                            <Box className="mr-5 w-[280px]">
                              <LibraryThumbnailCard
                                resource={res}
                                has_bookmarked={bookmarkedIds.has(res.id)}
                                onBookmarkToggle={() => handleBookmark(res)}
                                onPress={handleOpenResource}
                                onLongPress={handleLongPressResource}
                              />
                            </Box>
                          )}
                        />
                      </SmartShelf>
                    )}
                  </>
                )}

                {(viewMode === 'grid' || viewMode === 'list') && (
                  <ResourceList
                    resources={resources}
                    viewMode={viewMode}
                    onOpenResource={handleOpenResource}
                    onOpenResourceOptions={handleOpenResourceOptions}
                    onEndReached={handleEndReached}
                    refreshing={loading}
                    onRefresh={() => {
                      void fetchResources();
                    }}
                  />
                )}

                {viewMode === 'map' && (
                  <div className="sanctuary-map-stage" style={{ height: '600px' }}>
                    <UniversalPerspective
                      data={mapTopology as unknown as KnowledgeTopology}
                      layout={mapLayout as unknown as LayoutResult}
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
              <div
                id="library-collections"
                ref={collectionsSectionRef}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '48px',
                }}
              >
                <SanctuaryPulse
                  resourceCount={totalResourcesCount}
                  collectionCount={totalCollectionsCount}
                  bookmarkCount={bookmarkedIds.size}
                />

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr)',
                    gap: '12px',
                  }}
                >
                  <DoorwayCard
                    eyebrow="Knowledge map"
                    title="Enter the Cosmos"
                    description="Move from shelves into a calmer constellation view when you want relationships, not just search results."
                    accent="rgba(132, 111, 212, 0.14)"
                    ctaLabel="Open map"
                    onClick={() => router.push('/library/map')}
                  />
                  {canReview && (
                    <button
                      type="button"
                      onClick={() => router.push('/library/review')}
                      style={{
                        alignSelf: 'start',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--ink-ghost)',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      Curator review · publish contributions
                    </button>
                  )}
                </div>

                {categories.length > 0 && (
                  <SmartShelf
                    title={t('library.shelfTitle.featuredCategories', 'Featured Categories')}
                  >
                    <SanctuaryFlashList
                      data={categories}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(col: LibraryCollection) => `feat-cat-${col.id}`}
                      estimatedItemSize={320}
                      contentContainerStyle={{ paddingBottom: 16 }}
                      renderItem={({ item: col }: { item: LibraryCollection }) => (
                        <Box className="mr-5">
                          <CollectionPreviewCard
                            title={col.name}
                            typeLabel={
                              col.is_virtual ? t('library.dynamic') : t('library.collection')
                            }
                            resourceCount={col.used_by_count ?? col.resource_ids?.length ?? 0}
                            thumbnailUrl={col.thumbnail_url}
                            onClick={() =>
                              router.push({
                                pathname: '/library/collections/[id]',
                                params: {
                                  id: col.id,
                                  title: col.name,
                                },
                              })
                            }
                          />
                        </Box>
                      )}
                    />
                  </SmartShelf>
                )}

                {collections.length > 0 && (
                  <SmartShelf
                    title={t('library.shelfTitle.featuredCollections', 'Featured Collections')}
                  >
                    <SanctuaryFlashList
                      data={collections}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(col: LibraryCollection) => `feat-col-${col.id}`}
                      estimatedItemSize={320}
                      contentContainerStyle={{ paddingBottom: 16 }}
                      renderItem={({ item: col }: { item: LibraryCollection }) => {
                        const isOwner = !!user?.id && col.creator_id === user.id;
                        return (
                          <Box className="mr-5">
                            <CollectionPreviewCard
                              title={col.name}
                              typeLabel={
                                col.is_virtual ? t('library.dynamic') : t('library.collection')
                              }
                              resourceCount={col.used_by_count ?? col.resource_ids?.length ?? 0}
                              thumbnailUrl={col.thumbnail_url}
                              visibility={col.visibility}
                              isOwner={isOwner}
                              onClick={() =>
                                router.push({
                                  pathname: '/library/collections/[id]',
                                  params: {
                                    id: col.id,
                                    title: col.name,
                                  },
                                })
                              }
                              onChangeVisibility={(v) =>
                                updateCollection({ id: col.id, updates: { visibility: v } as any })
                              }
                              onDelete={() => {
                                if (
                                  window.confirm(`Delete "${col.name}"? This cannot be undone.`)
                                ) {
                                  deleteCollection(col.id);
                                }
                              }}
                              onEdit={() =>
                                router.push({
                                  pathname: '/library/collections/[id]',
                                  params: { id: col.id, title: col.name },
                                })
                              }
                            />
                          </Box>
                        );
                      }}
                    />
                  </SmartShelf>
                )}

                {orderedShelfDefs.map((shelf) => {
                  const shelfItems = resources.filter((res) => shelf.types.includes(res.type));
                  if (shelfItems.length === 0) return null;
                  return (
                    <SmartShelf
                      key={`default-shelf-${shelf.id}`}
                      title={t('library.shelf.' + shelf.id, shelf.label)}
                    >
                      <SanctuaryFlashList
                        data={shelfItems}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(res) => `shelf-${shelf.id}-${res.id}`}
                        estimatedItemSize={280}
                        contentContainerStyle={{ paddingBottom: 16 }}
                        renderItem={({ item: res }) => (
                          <Box className="mr-5 w-[280px]">
                            <LibraryThumbnailCard
                              resource={res}
                              has_bookmarked={bookmarkedIds.has(res.id)}
                              onBookmarkToggle={() => handleBookmark(res)}
                              onPress={handleOpenResource}
                              onLongPress={handleLongPressResource}
                            />
                          </Box>
                        )}
                      />
                    </SmartShelf>
                  );
                })}
              </div>
            )}

            {hasNextResources && (
              <button
                type="button"
                className="top-tab"
                style={{ alignSelf: 'center', padding: '12px 32px' }}
                onClick={() => {
                  void fetchNextResources();
                }}
                disabled={isFetchingNextResources}
              >
                {isFetchingNextResources ? t('library.loadingMore') : t('library.loadMoreFindings')}
              </button>
            )}
          </div>
        )}
      </div>

      <CollectionPickerModal
        visible={isCollectionPickerVisible}
        onClose={() => dispatch({ type: 'SET_MODAL', name: 'picker', isOpen: false })}
        collections={collections}
        onSelect={(col) => {
          void handleAddToCollection(col);
        }}
        isAdding={isAddingToCollection}
      />

      <CollectionCreationModal
        isOpen={isCollectionCreationVisible}
        onClose={() => dispatch({ type: 'SET_MODAL', name: 'collectionCreation', isOpen: false })}
        onSubmit={async (data) => {
          if (!user?.id) return;
          try {
            await createCollection({
              input: {
                ...data,
                resource_ids: [],
                subject: data.name,
                grades: [],
                visibility: 'school',
              },
              creatorId: user.id,
            });
            showToast(t('library.collectionCreated', 'Collection created!'), 'success');
            dispatch({
              type: 'SET_MODAL',
              name: 'collectionCreation',
              isOpen: false,
            });
          } catch (_err) {
            showToast(t('library.collectionCreateFailed', 'Failed to create collection'), 'error');
          }
        }}
      />

      <AssetCreationModal
        isOpen={isAssetCreationVisible}
        onClose={() => dispatch({ type: 'SET_MODAL', name: 'assetCreation', isOpen: false })}
        title={selectedCategoryId === 'All' ? 'Add New Resource' : `Add ${selectedCategoryId}`}
        onAdd={(data) => {
          void (async () => {
            if (!user?.id) return;
            try {
              const input: CreateResourceInput = {
                title: data.title,
                description: data.description,
                type: (selectedCategoryId === 'All'
                  ? 'lesson'
                  : selectedCategoryId) as ResourceType,
                format:
                  data.url.includes('youtube') ||
                  data.url.includes('youtu.be') ||
                  data.url.includes('vimeo')
                    ? 'video'
                    : data.url.match(/\.pdf(\?|$)/i)
                      ? 'document'
                      : 'document',
                url: data.url,
                // DB column is `subjects TEXT[]` — send as array
                subject: data.tags?.[0] ?? 'General',
                subjects: data.tags && data.tags.length > 0 ? data.tags : ['General'],
                topics: data.tags ?? [],
                grades: [],
                difficulty: 'intermediate',
                // DB column is `language TEXT[]` — must be an array
                language: 'english',
                languages: ['english'],
                visibility: 'school',
              };
              const creatorRole =
                user.capacity ??
                (user as User & { authority?: string; role?: string }).authority ??
                (user as User & { authority?: string; role?: string }).role ??
                'student';
              const created = await libraryAPI.createResource(input, user.id, creatorRole);
              supabase.functions
                .invoke('library-etl', {
                  body: { resourceId: created.id, action: 'enrich' },
                })
                .catch((err) => console.warn('[LibraryScreen] ETL enrichment failed:', err));
              dispatch({
                type: 'SET_MODAL',
                name: 'assetCreation',
                isOpen: false,
              });
              showToast('Resource contributed! It will be reviewed before publishing.', 'success');
              void fetchResources();
            } catch (err: unknown) {
              console.error('[LibraryScreen] resource create failed:', err);
              showToast(getLibraryCreateErrorMessage(err), 'error');
            }
          })();
        }}
      />

      {selectedResource && (
        <ResourceActionSheet
          visible={isActionSheetVisible}
          onClose={() => dispatch({ type: 'SET_MODAL', name: 'actionSheet', isOpen: false })}
          resource={{
            ...selectedResource,
            has_bookmarked: bookmarkedIds.has(selectedResource.id),
          }}
          onBookmark={() => {
            void handleBookmark(selectedResource);
          }}
          onShare={() => {
            if (!selectedResource.url) return;
            void navigator.clipboard.writeText(selectedResource.url);
            showToast('Link copied to clipboard!', 'success');
          }}
          onAddToCollection={() => dispatch({ type: 'SET_MODAL', name: 'picker', isOpen: true })}
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
    {
      label: 'Resources',
      value: resourceCount,
      accent: 'rgba(221,155,40,0.14)',
    },
    {
      label: 'Categories',
      value: collectionCount,
      accent: 'rgba(103,152,214,0.14)',
    },
    {
      label: 'Bookmarks',
      value: bookmarkCount,
      accent: 'rgba(90,154,124,0.14)',
    },
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
      <div
        style={{
          fontSize: '24px',
          fontWeight: '800',
          color: 'var(--ink)',
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '14px',
          lineHeight: 1.55,
          color: 'var(--ink-ghost)',
          maxWidth: '48ch',
        }}
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
  thumbnailUrl,
  onClick,
  visibility,
  isOwner = false,
  onChangeVisibility,
  onDelete,
  onEdit,
}: {
  title: string;
  typeLabel: string;
  resourceCount: number;
  thumbnailUrl?: string;
  onClick: () => void;
  visibility?: ResourceVisibility;
  isOwner?: boolean;
  onChangeVisibility?: (v: ResourceVisibility) => void;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const visConfig: Record<string, { icon: any; color: string; label: string }> = {
    private: { icon: Lock, color: '#e88c30', label: t('library.visibility.private', 'Private') },
    personal: { icon: Lock, color: '#e88c30', label: t('library.visibility.private', 'Private') },
    shared: { icon: Users, color: '#6798d6', label: t('library.visibility.shared', 'Shared') },
    public: { icon: Globe, color: '#34a853', label: t('library.visibility.public', 'Public') },
    class: { icon: Users, color: '#6798d6', label: t('library.visibility.class', 'Class') },
    school: { icon: Users, color: '#6798d6', label: t('library.visibility.school', 'School') },
    grade: { icon: Users, color: '#6798d6', label: t('library.visibility.grade', 'Grade') },
  };
  const vc = visibility ? (visConfig[visibility] ?? visConfig.public) : null;
  const cardBackground = thumbnailUrl
    ? `linear-gradient(180deg, rgba(18,20,24,0.12), rgba(18,20,24,0.78)), url(${thumbnailUrl}) center/cover no-repeat`
    : 'linear-gradient(160deg, rgba(221,155,40,0.14) 0%, rgba(103,152,214,0.12) 52%, rgba(255,255,255,0.92) 100%)';

  const visOptions: { value: ResourceVisibility; label: string; icon: any; color: string }[] = [
    {
      value: 'private',
      label: t('library.visibility.private', 'Private'),
      icon: Lock,
      color: '#e88c30',
    },
    {
      value: 'shared',
      label: t('library.visibility.shared', 'Shared'),
      icon: Users,
      color: '#6798d6',
    },
    {
      value: 'public',
      label: t('library.visibility.public', 'Public'),
      icon: Globe,
      color: '#34a853',
    },
  ];

  return (
    <div style={{ position: 'relative' }}>
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
          border:
            isOwner && vc && vc.color !== '#34a853'
              ? `1px solid ${vc.color}55`
              : '1px solid var(--border)',
          background: cardBackground,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        {/* Type label row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              fontSize: '11px',
              color: thumbnailUrl ? 'rgba(255,255,255,0.84)' : 'var(--action)',
              fontWeight: '800',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {typeLabel}
          </div>
          {/* Visibility badge */}
          {vc && isOwner && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '999px',
                background: `${vc.color}18`,
                border: `1px solid ${vc.color}40`,
              }}
            >
              <vc.icon size={11} color={vc.color} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: vc.color }}>{vc.label}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontWeight: '700',
            fontSize: '20px',
            color: thumbnailUrl ? '#fff' : 'var(--ink)',
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: thumbnailUrl ? 'rgba(255,255,255,0.76)' : 'var(--ink-ghost)',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          <span>
            {t('library.resourcesCount', {
              count: resourceCount,
              defaultValue: '{{count}} resources',
            })}
          </span>
          <span style={{ color: thumbnailUrl ? '#fff' : 'var(--action)' }}>
            {t('library.actions.open', 'Open')}
          </span>
        </div>
      </button>

      {/* ⋯ owner menu button */}
      {isOwner && (
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            style={{
              background: 'rgba(0,0,0,0.08)',
              border: 'none',
              borderRadius: '8px',
              padding: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EllipsisVertical size={15} color="var(--ink)" />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: 'var(--surface)',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                minWidth: '200px',
                padding: '8px',
                zIndex: 100,
              }}
            >
              {/* Edit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit?.();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 10px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                }}
              >
                <Pen size={14} color="var(--ink)" /> {t('library.actions.edit', 'Edit')}
              </button>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '4px 0' }} />

              {/* Visibility options */}
              <div
                style={{
                  padding: '4px 10px 2px',
                  fontSize: '10px',
                  fontWeight: 800,
                  color: 'var(--ink-ghost)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {t('library.visibility.label', 'Visibility')}
              </div>
              {visOptions.map((opt) => {
                const isActive = visibility === opt.value;
                const Ic = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      if (!isActive) onChangeVisibility?.(opt.value);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      background: isActive ? `${opt.color}14` : 'none',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: isActive ? 'default' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isActive ? opt.color : 'var(--ink)',
                    }}
                  >
                    <Ic size={13} color={isActive ? opt.color : 'var(--ink-ghost)'} />
                    {opt.label}
                    {isActive ? ' ✓' : ''}
                  </button>
                );
              })}

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '4px 0' }} />

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete?.();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 10px',
                  background: 'rgba(220,60,60,0.08)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#dc3c3c',
                }}
              >
                <Trash2 size={14} color="#dc3c3c" /> {t('library.actions.delete', 'Delete')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HeroBanner({ resource, onClick }: { resource: LibraryResource; onClick: () => void }) {
  const { width } = useResponsive();
  const artwork = resource.media?.url || resource.thumbnail_url;

  return (
    <button
      type="button"
      className="sanctuary-hero-panel"
      onClick={onClick}
      style={{
        minHeight: width < 720 ? '300px' : '344px',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        marginBottom: '40px',
        border: '1px solid var(--border)',
        background:
          'linear-gradient(135deg, rgba(221,155,40,0.14) 0%, rgba(103,152,214,0.12) 48%, rgba(255,255,255,0.92) 100%)',
        display: 'grid',
        gridTemplateColumns: width < 720 ? '1fr' : 'minmax(0, 1.08fr) minmax(320px, 0.92fr)',
        padding: '0',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          minHeight: width < 720 ? '190px' : '344px',
          background: artwork
            ? `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), url(${artwork}) center/cover no-repeat`
            : 'linear-gradient(180deg, rgba(221,155,40,0.18) 0%, rgba(103,152,214,0.18) 100%)',
          borderRight: '1px solid rgba(120, 120, 120, 0.12)',
        }}
      />
      <div
        style={{
          padding: width < 720 ? '24px' : '40px',
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
        <div
          style={{
            fontSize: '36px',
            fontWeight: '800',
            color: 'var(--ink)',
            lineHeight: 1.05,
          }}
        >
          {resource.title}
        </div>
        <div
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: 'var(--ink-ghost)',
            maxWidth: '40ch',
          }}
        >
          {resource.description}
        </div>
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--action)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--action)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Play size={20} fill="currentColor" />
          </div>
          Open Resource
        </div>
      </div>
    </button>
  );
}
