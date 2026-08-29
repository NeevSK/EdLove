/**
 * LibraryScreen — Netflix-Style Holistic Digital Library
 */

import { identityAPI } from '@repo/core/api/client';
import { useDomainRollout, useTracking } from '@repo/core/hooks';
import { coreRuntime, usePermissions, useStore, useTemporalStore } from '@repo/core/logic';
import { libraryAPI } from '@repo/library/api/library';
import { CollectionPickerModal } from '@repo/library/components/CollectionPickerModal';
import { LibraryThumbnailCard } from '@repo/library/components/LibraryThumbnailCard';
import { ResourceList } from '@repo/library/components/ResourceList';
import { getOrderedShelfDefs } from '@repo/library/constants/shelf';
import { useBookmarkedResources, useLibrary } from '@repo/library/hooks/useLibrary';
import { useLibraryWorkspaceSurfaces } from '@repo/library/workspace/useLibraryWorkspaceSurfaces';
import { useWorkspaceLayoutSync } from '@repo/core/native';
import type { CreateResourceInput, LibraryResource, ResourceType } from '@repo/library/types';
import { buildLibraryExternalLinkOptions } from '@repo/library/utils/externalLinks';
import { buildLibraryResourceOpenParams } from '@repo/library/utils/resourceLinks';
import { CollectionCard } from '@repo/ui/components/CollectionCard';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { HorizontalChipRow } from '@repo/ui/components/HorizontalChipRow';
import {
  AssetCreationModal,
  CollectionCreationModal,
} from '@repo/ui/components/media/AssetCreationPortal';
import { ResourceActionSheet } from '@repo/ui/components/media/ResourceActionSheet';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import ScreenWrapper, { useBottomTabPadding } from '@repo/ui/components/ScreenWrapper';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { SmartShelf } from '@repo/ui/components/SmartShelf';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import {
  FileText,
  Layers,
  LayoutGrid,
  Library,
  List,
  Map as MapIcon,
  FileSpreadsheet,
  Play,
  Plus,
} from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  HStack,
  Icon,
  ImageBackground,
  LinearGradient,
  Pressable,
  Text,
  useTheme,
  VStack,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { openExternalURL, showExternalLinkOptions } from '@repo/ui/utils';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, useWindowDimensions } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

const LIBRARY_UI_CATEGORIES = [
  { id: 'All', en: 'All' },
  { id: 'video', en: 'Videos' },
  { id: 'pdf', en: 'Documents' },
  { id: 'link', en: 'Web Resources' },
  { id: 'text', en: 'Articles' },
  { id: 'note', en: 'Personal Notes' },
];

function getLibraryCreateErrorMessage(error: unknown): string {
  const candidate = error as { message?: unknown; code?: unknown } | null;
  const message = error instanceof Error ? error.message : candidate?.message;
  const code = typeof candidate?.code === 'string' ? candidate.code : '';
  if (code === '42501' || String(message).toLowerCase().includes('permission')) {
    return 'Your current library permission does not allow contributions.';
  }
  return typeof message === 'string' && message.length > 0
    ? message
    : 'We could not add this resource. Please try again.';
}

const MapInvitation = memo(({ onPress }: { onPress: () => void }) => {
  const theme = useTheme();

  return (
    <AnimatedView entering={FadeInDown.delay(200).springify()}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Enter the Cosmos"
        accessibilityHint="Shift from shelves into constellation-style discovery when you want relationships, not just a list"
        className="mx-4 my-4 rounded-[24px] overflow-hidden bg-phase-surface border border-phase-border"
      >
        <Box className="absolute inset-0">
          <LinearGradient
            colors={[`${theme.accent.action}16`, `${theme.accent.reward}0D`]}
            className="flex-1"
          />
        </Box>
        <HStack className="p-5 gap-4 items-center">
          <Box className="w-[60px] h-[60px] rounded-[30px] bg-white/10 justify-center items-center">
            <Icon as={MapIcon} size={32} color={theme.accent.action} />
          </Box>
          <VStack className="flex-1 gap-1">
            <Text className="text-[10px] font-extrabold text-phaseText-secondary uppercase tracking-widest">
              Knowledge map
            </Text>
            <Text className="text-lg font-extrabold text-phaseText-primary">Enter the Cosmos</Text>
            <Text className="text-[13px] text-phaseText-secondary leading-5">
              Shift from shelves into constellation-style discovery when you want relationships, not
              just a list.
            </Text>
          </VStack>
          <Box className="p-2.5 bg-phase-accent rounded-xl">
            <Icon as={Play} size={16} color="white" fill="white" />
          </Box>
        </HStack>
      </Pressable>
    </AnimatedView>
  );
});
MapInvitation.displayName = 'MapInvitation';

const CuratorInvitation = memo(({ onPress }: { onPress: () => void }) => {
  const theme = useTheme();

  return (
    <AnimatedView entering={FadeInDown.delay(300).springify()}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Curator Dashboard"
        accessibilityHint="Review, polish, and publish new knowledge streams without leaving the sanctuary shell"
        className="mx-4 mt-0 mb-4 rounded-[24px] overflow-hidden bg-phase-surface border border-phase-accent/20"
      >
        <Box className="absolute inset-0">
          <LinearGradient
            colors={[`${theme.accent.action}14`, 'rgba(255,255,255,0.2)']}
            className="flex-1"
          />
        </Box>
        <HStack className="p-4 gap-4 items-center">
          <Box className="w-12 h-12 rounded-full bg-phase-accent/10 justify-center items-center">
            <Icon as={FileText} size={24} color={theme.accent.action} />
          </Box>
          <VStack className="flex-1 gap-0.5">
            <Text className="text-[10px] font-extrabold text-phaseText-secondary uppercase tracking-widest">
              Curator pathway
            </Text>
            <Text className="text-base font-extrabold text-phaseText-primary">
              Curator Dashboard
            </Text>
            <Text className="text-[12px] text-phaseText-secondary">
              Review, polish, and publish new knowledge streams without leaving the sanctuary shell.
            </Text>
          </VStack>
          <Icon as={Plus} size={16} color={theme.text.secondary} />
        </HStack>
      </Pressable>
    </AnimatedView>
  );
});
CuratorInvitation.displayName = 'CuratorInvitation';

export default function LibraryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { can } = usePermissions();
  const isLibraryManagementEnabled = useDomainRollout('archive');

  interface LibraryState {
    activeSection: 'browse' | 'collections' | 'contribute';
    searchQuery: string;
    debouncedSearchQuery: string;
    selectedCategoryId: string;
    selectedSort: 'recent' | 'popular' | 'most_endorsed' | 'most_bookmarked';
    viewMode: 'shelf' | 'grid' | 'list';
    isAddModalOpen: boolean;
    isAddCollectionModalOpen: boolean;
    refreshing: boolean;
    isSyncing: boolean;
    fallbackAttempted: boolean;
    isFetchingPublic: boolean;
    publicCollections: any[];
    selectedResource: LibraryResource | null;
    isActionSheetVisible: boolean;
    isCollectionPickerVisible: boolean;
  }

  const initialState: LibraryState = {
    activeSection: 'browse',
    searchQuery: '',
    debouncedSearchQuery: '',
    selectedCategoryId: 'All',
    selectedSort: 'recent',
    viewMode: 'shelf',
    isAddModalOpen: false,
    isAddCollectionModalOpen: false,
    refreshing: false,
    isSyncing: false,
    fallbackAttempted: false,
    isFetchingPublic: false,
    publicCollections: [],
    selectedResource: null,
    isActionSheetVisible: false,
    isCollectionPickerVisible: false,
  };

  const isFetchingPublicRef = useRef(false);

  type LibraryAction =
    | { type: 'SET_SECTION'; section: LibraryState['activeSection'] }
    | { type: 'SET_SEARCH'; query: string }
    | { type: 'SET_DEBOUNCED_SEARCH'; query: string }
    | { type: 'SET_CATEGORY'; id: string }
    | { type: 'SET_SORT'; sort: LibraryState['selectedSort'] }
    | { type: 'SET_VIEW_MODE'; mode: LibraryState['viewMode'] }
    | {
        type: 'SET_MODAL';
        name: 'add' | 'collection' | 'actionSheet' | 'picker';
        isOpen: boolean;
      }
    | { type: 'SET_SYNCING'; isSyncing: boolean }
    | { type: 'SET_REFRESHING'; refreshing: boolean }
    | { type: 'SET_FETCHING_PUBLIC'; isFetching: boolean }
    | { type: 'SET_PUBLIC_COLLECTIONS'; collections: any[] }
    | { type: 'SET_SELECTED_RESOURCE'; resource: LibraryResource | null }
    | { type: 'MARK_FALLBACK_ATTEMPTED' };

  function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
    switch (action.type) {
      case 'SET_SECTION':
        return { ...state, activeSection: action.section };
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
      case 'SET_MODAL':
        if (action.name === 'add') return { ...state, isAddModalOpen: action.isOpen };
        if (action.name === 'collection')
          return { ...state, isAddCollectionModalOpen: action.isOpen };
        if (action.name === 'actionSheet') return { ...state, isActionSheetVisible: action.isOpen };
        if (action.name === 'picker') return { ...state, isCollectionPickerVisible: action.isOpen };
        return state;
      case 'SET_SYNCING':
        return { ...state, isSyncing: action.isSyncing };
      case 'SET_REFRESHING':
        return { ...state, refreshing: action.refreshing };
      case 'SET_FETCHING_PUBLIC':
        return { ...state, isFetchingPublic: action.isFetching };
      case 'SET_PUBLIC_COLLECTIONS':
        return { ...state, publicCollections: action.collections };
      case 'SET_SELECTED_RESOURCE':
        return { ...state, selectedResource: action.resource };
      case 'MARK_FALLBACK_ATTEMPTED':
        return { ...state, fallbackAttempted: true };
      default:
        return state;
    }
  }

  const [
    {
      activeSection,
      searchQuery,
      debouncedSearchQuery,
      selectedCategoryId,
      selectedSort,
      viewMode,
      isAddModalOpen,
      isAddCollectionModalOpen,
      refreshing,
      isSyncing,
      fallbackAttempted,
      isFetchingPublic,
      publicCollections,
      selectedResource,
      isActionSheetVisible,
      isCollectionPickerVisible,
    },
    dispatch,
  ] = useReducer(libraryReducer, initialState);

  const isPastView = useTemporalStore((state) => state.isPastView);
  const deskItems = useStore((state) => state.deskItems);
  const user = useStore((state) => state.user);
  const showToast = useStore((state) => state.showToast);

  // Search Debouncing (Orchestrated by Reducer)
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch({ type: 'SET_DEBOUNCED_SEARCH', query: searchQuery });
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  // Landscape keeps the phone's single reading axis. Two columns are reserved
  // for genuinely wider tablet compositions so short heights never force text
  // into cramped cards.
  const shelfColumns = width >= 700 && width >= height ? 2 : 1;
  const bottomPadding = useBottomTabPadding();
  const { discoverFeature } = useTracking();

  const isSearchMode =
    activeSection === 'browse' && (searchQuery.trim().length > 0 || selectedCategoryId !== 'All');

  const resourceTypeFilter = useMemo(() => {
    if (selectedCategoryId === 'All') return undefined;
    return selectedCategoryId as any;
  }, [selectedCategoryId]);

  const libraryFilters = useMemo(
    () =>
      isSearchMode
        ? {
            type: resourceTypeFilter,
            search: debouncedSearchQuery || undefined,
            sort_by: selectedSort,
            limit: 60,
          }
        : { limit: 60 },
    [isSearchMode, resourceTypeFilter, debouncedSearchQuery, selectedSort],
  );

  // Hybrid canvas: 6 configurable sections with isDefault persistence + cross-device sync
  const librarySurfaces = useLibraryWorkspaceSurfaces();
  const { layout: libraryLayout, surfaces: resolvedSurfaces } = useWorkspaceLayoutSync({
    workspaceId: 'library',
    userId: user?.id ?? null,
    surfaces: librarySurfaces,
    enableRemoteSync: true,
  });
  const resolvedLibrarySurfaces = resolvedSurfaces;

  const orientationSeeds = user?.orientation_seeds ?? null;
  const orderedShelfDefs = useMemo(() => getOrderedShelfDefs(orientationSeeds), [orientationSeeds]);

  const {
    resources: rawResources,
    categories: rawCategories,
    collections: rawCollections,
    loading,
    error: libraryError,
    fetchResources,
    fetchNextResources,
    hasNextResources,
    isFetchingNextResources,
    syncLibrary,
    bookmarkResource,
    addToCollection,
    isAddingToCollection,
    updateCollection,
    deleteCollection,
    createCollection,
    createResource,
    totalResourcesCount,
    totalCollectionsCount,
  } = useLibrary(libraryFilters, libraryFilters);

  // Get Bookmarks
  const { resources: bookmarkedResources, refetch: refetchBookmarks } = useBookmarkedResources(
    user?.id,
  );

  useEffect(() => {
    void discoverFeature('section_library');
    dispatch({ type: 'SET_SYNCING', isSyncing: true });
    void syncLibrary()
      .catch((err) => console.error('Library sync failed:', err))
      .finally(() => dispatch({ type: 'SET_SYNCING', isSyncing: false }));
  }, [syncLibrary, discoverFeature]);

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
          dispatch({ type: 'MARK_FALLBACK_ATTEMPTED' });
        })
        .catch((_err: any) => {
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

  const trending = useMemo(
    () => [...resources].sort((a, b) => (b.endorsements ?? 0) - (a.endorsements ?? 0)).slice(0, 10),
    [resources],
  );

  const newArrivals = useMemo(
    () =>
      [...resources]
        .sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
        )
        .slice(0, 10),
    [resources],
  );

  const heroResource = trending[0] ?? newArrivals[0] ?? null;

  // Shelf data for shelf view mode
  const shelfData = useMemo(() => {
    const rows: any[] = [{ type: 'PULSE', id: 'pulse' }];

    if (heroResource) {
      rows.push({
        type: 'HERO',
        id: 'hero',
        resource: heroResource,
      });
    }

    rows.push({ type: 'MAP_INVITATION', id: 'map-invit' });

    // Only show curator if allowed
    rows.push({
      type: 'CURATOR_INVITATION_GUARD',
      id: 'curator-invit',
    });

    const deskItemsResources = deskItems?.filter((r: any) => r.type === 'resource') || [];
    if (deskItemsResources.length > 0) {
      rows.push({
        type: 'CONTINUE_LEARNING',
        id: 'continue',
        items: deskItemsResources,
      });
    }

    if (bookmarkedResources.length > 0) {
      rows.push({
        type: 'BOOKMARKS',
        id: 'bookmarks',
        items: bookmarkedResources,
      });
    }

    if (categories.length > 0) {
      rows.push({
        type: 'CATEGORIES',
        id: 'categories',
        items: categories,
      });
    }

    if (collections.length > 0) {
      rows.push({
        type: 'COLLECTIONS',
        id: 'collections',
        items: collections,
      });
    }

    // Dynamic shelves
    orderedShelfDefs.forEach((shelf) => {
      const items = resources.filter((r: LibraryResource) =>
        (shelf.types as readonly string[]).includes(r.type),
      );
      if (items.length > 0) {
        rows.push({
          type: 'SHELF',
          id: `shelf-${shelf.label}`,
          label: shelf.label,
          items,
        });
      }
    });

    if (trending.length > 0) {
      rows.push({
        type: 'SHELF',
        id: 'shelf-trending',
        label: 'Trending',
        items: trending,
      });
    }

    if (newArrivals.length > 0) {
      rows.push({
        type: 'SHELF',
        id: 'shelf-new',
        label: 'New Arrivals',
        items: newArrivals,
      });
    }

    return rows;
  }, [
    heroResource,
    resources,
    bookmarkedResources,
    categories,
    collections,
    deskItems,
    orderedShelfDefs,
    trending,
    newArrivals,
  ]);

  // Order configurable shelves by canvas layout (isDefault = opinionated defaults, else codified order)
  const orderedShelfData = useMemo(() => {
    if (!resolvedSurfaces.length) return shelfData;
    const hidden = new Set(resolvedSurfaces.filter((s) => s.hidden).map((s) => s.surfaceId));
    const orderMap = new Map(resolvedSurfaces.map((s) => [s.surfaceId as string, s.order]));
    const surfaceIdForRow = (row: { type: string; id: string }): string | null => {
      if (row.type === 'CONTINUE_LEARNING') return 'continue_learning';
      if (row.type === 'BOOKMARKS') return 'bookmarks';
      if (row.type === 'CATEGORIES') return 'categories';
      if (row.type === 'COLLECTIONS') return 'collections';
      if (row.id === 'shelf-trending') return 'trending';
      if (row.id === 'shelf-new') return 'new_arrivals';
      return null;
    };
    const fixed = shelfData.filter((r) => !surfaceIdForRow(r as { type: string; id: string }));
    const configurable = shelfData
      .filter((r) => surfaceIdForRow(r as { type: string; id: string }))
      .filter((r) => {
        const sid = surfaceIdForRow(r as { type: string; id: string });
        return sid ? !hidden.has(sid as never) : true;
      })
      .sort((a, b) => {
        const aId = surfaceIdForRow(a as { type: string; id: string })!;
        const bId = surfaceIdForRow(b as { type: string; id: string })!;
        return (orderMap.get(aId) ?? 99) - (orderMap.get(bId) ?? 99);
      });
    return [...fixed, ...configurable];
  }, [shelfData, resolvedSurfaces]);

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
      openExternalURL(resource.url, buildLibraryExternalLinkOptions(resource)).catch((err) =>
        console.error("Couldn't load page", err),
      );
    },
    [router],
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
    showExternalLinkOptions(resource.url, buildLibraryExternalLinkOptions(resource)).catch((err) =>
      console.error("Couldn't show external link options", err),
    );
  }, []);

  const handleAddResource = useCallback(
    async (data: { title: string; url: string; description: string; tags: string[] }) => {
      if (isPastView) {
        throw new Error('Past view is read-only. Return to today to contribute.');
      }
      if (!isLibraryManagementEnabled || !can('create', 'LibraryResource')) {
        throw new Error('Your current library permission does not allow contributions.');
      }
      const creatorId = await identityAPI.getMyInternalId();
      if (!creatorId) throw new Error('Sign in before contributing a resource.');

      const input: CreateResourceInput = {
        title: data.title.trim(),
        description: data.description.trim(),
        type: (selectedCategoryId === 'All' ? 'lesson' : selectedCategoryId) as ResourceType,
        format: /\.pdf(\?|$)/i.test(data.url) ? 'document' : 'text',
        url: data.url.trim(),
        subject: data.tags[0] || 'General',
        subjects: data.tags.length > 0 ? data.tags : ['General'],
        topics: data.tags,
        grades: [],
        difficulty: 'intermediate',
        language: 'english',
        languages: ['english'],
        visibility: 'school',
      };
      const creatorRole =
        (user as any)?.capacity ?? (user as any)?.authority ?? (user as any)?.role ?? 'student';
      try {
        await createResource({ input, creatorId, creatorRole });
        await Promise.all([fetchResources(), refetchBookmarks()]);
        showToast('Resource contributed. It will be reviewed before publishing.', 'success');
      } catch (error) {
        const message = getLibraryCreateErrorMessage(error);
        showToast(message, 'error');
        const err = new Error(message);
      (err as { cause?: unknown }).cause = error;
      throw err;
      }
    },
    [
      can,
      createResource,
      fetchResources,
      isLibraryManagementEnabled,
      isPastView,
      refetchBookmarks,
      selectedCategoryId,
      showToast,
      user,
    ],
  );

  const handleBookmark = useCallback(
    (resource: LibraryResource) => {
      if (isPastView || !user?.id) return;
      const bookmark = async () => {
        try {
          await bookmarkResource({ resourceId: resource.id, userId: user.id });
          await refetchBookmarks();
        } catch (err) {
          console.error('Failed to bookmark:', err);
        }
      };
      void bookmark();
    },
    [isPastView, user, bookmarkResource, refetchBookmarks],
  );

  const handleShare = useCallback(async (resource: LibraryResource) => {
    if (!resource.url) return;
    try {
      await coreRuntime.share.share({
        message: `Check out this resource on Polymath: ${resource.title}\n${resource.url}`,
        url: resource.url,
        title: resource.title,
      });
    } catch (err) {
      console.error('Failed to share:', err);
    }
  }, []);

  const handleAddToCollection = useCallback(
    (collectionId: string) => {
      if (isPastView || !selectedResource) return;
      const add = async () => {
        try {
          await addToCollection({
            collectionId,
            resourceId: selectedResource.id,
          });
          dispatch({ type: 'SET_MODAL', name: 'picker', isOpen: false });
        } catch (err) {
          console.error('Failed to add to collection:', err);
        }
      };
      void add();
    },
    [isPastView, selectedResource, addToCollection],
  );

  const onRefresh = useCallback(() => {
    const runRefresh = async () => {
      dispatch({ type: 'SET_REFRESHING', refreshing: true });
      await fetchResources();
      const userId = await identityAPI.getMyInternalId();

      if (resources.length === 0) {
        const pub = await libraryAPI.getCollections({
          limit: 10,
          visibility: 'public',
          userId: userId ?? undefined,
        });
        dispatch({ type: 'SET_PUBLIC_COLLECTIONS', collections: pub });
      }
      dispatch({ type: 'SET_REFRESHING', refreshing: false });
    };
    void runRefresh().catch((err) => console.error('Refresh failed:', err));
  }, [fetchResources, resources.length]);

  const handleCreateCollection = useCallback(
    async (data: { name: string; description: string }) => {
      if (isPastView) return;
      try {
        const userId = await identityAPI.getMyInternalId();
        if (!userId) return;

        await createCollection({
          input: {
            ...data,
            resource_ids: [],
            subject: '',
            grades: [],
            visibility: 'private',
          },
          creatorId: userId,
        });

        dispatch({ type: 'SET_MODAL', name: 'collection', isOpen: false });
      } catch (err) {
        console.error('Failed to create collection:', err);
      }
    },
    [fetchResources, isPastView],
  );

  const chipData = useMemo(
    () =>
      LIBRARY_UI_CATEGORIES.map((cat) => ({
        label: cat.en,
        value: cat.id,
      })),
    [],
  );

  const sortChips = useMemo(
    () => [
      { label: `\u23F2\uFE0F ${t('library.sort.recent')}`, value: 'recent' },
      { label: `\uD83D\uDD25 ${t('library.sort.popular')}`, value: 'popular' },
      {
        label: `\uD83C\uDF1F ${t('library.sort.most_endorsed')}`,
        value: 'most_endorsed',
      },
      {
        label: `\uD83D\uDD16 ${t('library.sort.most_bookmarked')}`,
        value: 'most_bookmarked',
      },
    ],
    [t],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextResources && !isFetchingNextResources) void fetchNextResources();
  }, [hasNextResources, isFetchingNextResources, fetchNextResources]);

  const handleOpenAddModal = useCallback(() => {
    if (isPastView) {
      showToast('Past view is read-only. Return to today to contribute.', 'info');
      return;
    }
    if (!isLibraryManagementEnabled || !can('create', 'LibraryResource')) {
      showToast('Your current library permission does not allow contributions.', 'info');
      return;
    }
    dispatch({ type: 'SET_MODAL', name: 'add', isOpen: true });
  }, [can, isLibraryManagementEnabled, isPastView, showToast]);

  const fabConfig = useMemo(
    () => ({
      tabType: 'library' as const,
      onPress: handleOpenAddModal,
      visible: !loading && !isPastView,
    }),
    [loading, isPastView, handleOpenAddModal],
  );

  useRegisterFAB(fabConfig);

  const handleLongPressResource = useCallback((res: LibraryResource) => {
    dispatch({ type: 'SET_SELECTED_RESOURCE', resource: res });
    dispatch({ type: 'SET_MODAL', name: 'actionSheet', isOpen: true });
  }, []);

  const handleSearchChangeText = useCallback((text: string) => {
    dispatch({ type: 'SET_SEARCH', query: text });
  }, []);

  const handleSelectSection = useCallback((section: LibraryState['activeSection']) => {
    dispatch({ type: 'SET_SECTION', section });
  }, []);

  const handleNavigateToMap = useCallback(() => {
    router.push('/library/map');
  }, [router]);

  const handleNavigateToCuratorReview = useCallback(() => {
    router.push('/library/review');
  }, [router]);

  const handleNavigateToTools = useCallback(() => {
    router.push('/library/tools');
  }, [router]);

  const handleRetry = useCallback(() => {
    void fetchResources();
  }, [fetchResources]);

  const handleSelectCategory = useCallback((id: string) => {
    dispatch({ type: 'SET_CATEGORY', id });
  }, []);

  const handleSelectSort = useCallback((v: string) => {
    dispatch({ type: 'SET_SORT', sort: v as any });
  }, []);

  const handleSetViewModeShelf = useCallback(() => {
    dispatch({ type: 'SET_VIEW_MODE', mode: 'shelf' });
  }, []);

  const handleSetViewModeGrid = useCallback(() => {
    dispatch({ type: 'SET_VIEW_MODE', mode: 'grid' });
  }, []);

  const handleSetViewModeList = useCallback(() => {
    dispatch({ type: 'SET_VIEW_MODE', mode: 'list' });
  }, []);

  const handleCloseAddModal = useCallback(() => {
    dispatch({ type: 'SET_MODAL', name: 'add', isOpen: false });
  }, []);

  const handleOpenCollectionModal = useCallback(() => {
    if (!isPastView) {
      dispatch({
        type: 'SET_MODAL',
        name: 'collection',
        isOpen: true,
      });
    }
  }, [isPastView]);

  const handleCloseCollectionModal = useCallback(() => {
    dispatch({ type: 'SET_MODAL', name: 'collection', isOpen: false });
  }, []);

  const handleCloseActionSheet = useCallback(() => {
    dispatch({ type: 'SET_MODAL', name: 'actionSheet', isOpen: false });
  }, []);

  const handleActionSheetBookmark = useCallback(() => {
    if (selectedResource) {
      void handleBookmark(selectedResource);
    }
  }, [selectedResource, handleBookmark]);

  const handleActionSheetAddToCollection = useCallback(() => {
    dispatch({ type: 'SET_MODAL', name: 'picker', isOpen: true });
  }, []);

  const handleActionSheetShare = useCallback(() => {
    if (selectedResource) {
      void handleShare(selectedResource);
    }
  }, [selectedResource, handleShare]);

  const handleCloseCollectionPicker = useCallback(() => {
    dispatch({ type: 'SET_MODAL', name: 'picker', isOpen: false });
  }, []);

  const handleOpenCollectionDetail = useCallback(
    (collection: any) => {
      router.push({
        pathname: '/library/collections/[id]',
        params: {
          id: collection.id,
          title: collection.name,
        },
      });
    },
    [router],
  );

  const handlePullToDesk = useCallback((res: LibraryResource) => {
    console.log('Pull', res.id);
  }, []);

  const renderShelf = useCallback(
    (label: string, items: LibraryResource[], onSeeAll?: () => void) => {
      if (items.length === 0) return null;
      return (
        <Box className="mb-lg">
          <SmartShelf key={label} title={label} onSeeAll={onSeeAll}>
            {items.map((res) => (
              <LibraryThumbnailCard
                key={`shelf-${label}-${res.id}`}
                resource={res}
                onPress={handleOpenResource}
                onBookmarkToggle={handleBookmark}
                onLongPress={handleLongPressResource}
              />
            ))}
          </SmartShelf>
        </Box>
      );
    },
    [handleOpenResource, handleBookmark, handleLongPressResource],
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  const renderFlatListItem = useCallback(
    ({ item }: { item: any }) => {
      switch (item.type) {
        case 'PULSE':
          return (
            <SanctuaryPulse
              resourceCount={totalResourcesCount}
              collectionCount={totalCollectionsCount}
              bookmarkCount={bookmarkedResources.length}
            />
          );
        case 'HERO':
          return <HeroBanner resource={item.resource} onPress={handleOpenResource} />;
        case 'MAP_INVITATION':
          return <MapInvitation onPress={handleNavigateToMap} />;
        case 'CURATOR_INVITATION_GUARD':
          return isLibraryManagementEnabled && can('manage', 'LibraryCuratorDashboard') ? (
            <CuratorInvitation onPress={handleNavigateToCuratorReview} />
          ) : null;
        case 'CONTINUE_LEARNING':
          return (
            <SmartShelf title="▶ Continue Learning">
              {item.items.map((res: any) => (
                <LibraryThumbnailCard
                  key={`continue-${res.id}`}
                  resource={res}
                  onPress={handleOpenResource}
                  onLongPress={handleOpenResourceOptions}
                />
              ))}
            </SmartShelf>
          );
        case 'BOOKMARKS':
          return (
            <SmartShelf title="🔖 My Bookmarks">
              {item.items.map((res: any) => (
                <LibraryThumbnailCard
                  key={`bookmark-${res.id}`}
                  resource={res}
                  onPress={handleOpenResource}
                  onBookmarkToggle={handleBookmark}
                  onLongPress={handleLongPressResource}
                />
              ))}
            </SmartShelf>
          );
        case 'CATEGORIES':
          return (
            <Box className="mb-lg">
              <SmartShelf title="Discover Categories">
                {item.items.map((col: any) => (
                  <CollectionCard
                    key={col.id}
                    title={col.name}
                    creator={col.creator_name}
                    resourceCount={col.resource_ids?.length || 0}
                    subjectTag={col.subjects?.[0] || 'General'}
                    thumbnailUrl={col.thumbnail_url}
                    verified={col.is_official}
                    contextData={col}
                    onPress={handleOpenCollectionDetail}
                  />
                ))}
              </SmartShelf>
            </Box>
          );
        case 'COLLECTIONS':
          return (
            <Box className="mb-lg">
              <SmartShelf title="Featured Collections">
                {item.items.map((col: any) => {
                  const isOwner = !!user?.id && col.creator_id === user.id;
                  const vis = col.visibility;

                  const handleOwnerLongPress = () => {
                    const visOptions = [
                      {
                        label: vis === 'private' ? 'Private ✓ (current)' : 'Make Private',
                        value: 'private',
                      },
                      {
                        label: vis === 'shared' ? 'Shared ✓ (current)' : 'Make Shared',
                        value: 'shared',
                      },
                      {
                        label: vis === 'public' ? 'Public ✓ (current)' : 'Make Public',
                        value: 'public',
                      },
                    ];
                    Alert.alert(col.name, 'Manage your collection', [
                      ...visOptions
                        .filter((o) => o.value !== vis)
                        .map((o) => ({
                          text: o.label,
                          onPress: () =>
                            updateCollection({
                              id: col.id,
                              updates: { visibility: o.value } as any,
                            }),
                        })),
                      {
                        text: '✏️ Edit (open detail)',
                        onPress: () => handleOpenCollectionDetail(col),
                      },
                      {
                        text: '🗑️ Delete',
                        style: 'destructive' as const,
                        onPress: () =>
                          Alert.alert(
                            'Delete Collection',
                            `Delete "${col.name}"? This cannot be undone.`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: () => deleteCollection(col.id),
                              },
                            ],
                          ),
                      },
                      { text: 'Cancel', style: 'cancel' as const },
                    ]);
                  };

                  return (
                    <Box key={col.id} style={{ position: 'relative' }}>
                      <CollectionCard
                        title={col.name}
                        creator={col.creator_name}
                        resourceCount={col.resource_ids?.length || 0}
                        subjectTag={col.subjects?.[0] || 'General'}
                        thumbnailUrl={col.thumbnail_url}
                        verified={col.is_official}
                        contextData={col}
                        onPress={handleOpenCollectionDetail}
                        onPullToDesk={isOwner ? handleOwnerLongPress : undefined}
                      />
                      {/* Owner visibility badge overlay */}
                      {isOwner && vis !== 'public' && (
                        <Box
                          style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            backgroundColor:
                              vis === 'shared' ? 'rgba(103,152,214,0.88)' : 'rgba(232,140,48,0.88)',
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}
                        >
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: '800',
                            }}
                          >
                            {vis === 'shared' ? 'Shared' : 'Private'}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </SmartShelf>
            </Box>
          );
        case 'SHELF':
          return renderShelf(item.label, item.items);
        default:
          return null;
      }
    },
    [
      resources.length,
      collections.length,
      bookmarkedResources.length,
      handleOpenResource,
      handleNavigateToMap,
      handleNavigateToCuratorReview,
      handleOpenResourceOptions,
      handleBookmark,
      handleLongPressResource,
      handleOpenCollectionDetail,
      renderShelf,
      isLibraryManagementEnabled,
      can,
    ],
  );

  return (
    <ScreenWrapper scroll={!isSearchMode} noTopInset={true}>
      <GlobalHeader
        title={t('tabs.library') || 'Library'}
        subtitle={t('library.knowledgeSanctuary')}
        showSearch
        searchProps={{
          value: searchQuery,
          onChangeText: handleSearchChangeText,
          placeholder: t('library.searchPlaceholder'),
        }}
        rightAction={
          <HStack className="gap-2 items-center">
            {isSyncing && (
              <AnimatedView entering={FadeInDown}>
                <Box className="w-2 h-2 rounded-full bg-phase-accent" />
              </AnimatedView>
            )}
            <Pressable
              onPress={handleNavigateToTools}
              accessibilityRole="button"
              accessibilityLabel="Open document tools"
              accessibilityHint="Convert, edit and export documents"
              className="min-w-11 min-h-11 p-2 rounded-xl bg-phase-interactive/10 border border-phase-interactive/15 mr-1 justify-center items-center"
            >
              <Icon as={FileSpreadsheet} size={20} color={theme.text.primary} />
            </Pressable>
            {activeSection === 'browse' && (
              <Pressable
                onPress={handleNavigateToMap}
                accessibilityRole="button"
                accessibilityLabel="Open knowledge map"
                accessibilityHint="Explore relationships between library resources"
                className="min-w-11 min-h-11 p-2 rounded-xl bg-phase-interactive/10 border border-phase-interactive/15 justify-center items-center"
              >
                <Icon as={MapIcon} size={20} color={theme.text.primary} />
              </Pressable>
            )}
          </HStack>
        }
      />

      <VStack className="px-md pt-sm pb-md gap-2 bg-phase-surface">
        <Text className="text-sm font-bold text-phaseText-primary">Library spaces</Text>
        <HStack
          className="rounded-2xl border border-phase-border bg-phase-surface-light p-1 gap-1"
          accessibilityRole="tablist"
          accessibilityLabel="Choose a library space"
          accessibilityHint="Switch between browsing, collections, and contribution tasks"
        >
          {(
            [
              ['browse', 'Browse', 'Find and open resources'],
              ['collections', 'Collections', 'Explore grouped resources'],
              ['contribute', 'Contribute & Review', 'Add, curate, or review resources'],
            ] as const
          ).map(([section, label, hint]) => {
            const selected = activeSection === section;
            return (
              <Pressable
                key={section}
                onPress={() => handleSelectSection(section)}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityHint={hint}
                accessibilityState={{ selected }}
                className={`min-h-11 flex-1 px-2 rounded-xl justify-center items-center ${selected ? 'bg-phase-interactive' : ''}`}
              >
                <Text
                  className={`text-center text-[14px] font-bold ${selected ? 'text-white' : 'text-phaseText-secondary'}`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      </VStack>

      {libraryError ? (
        <VStack className="p-md mt-lg items-center gap-3">
          <Text className="text-phase-danger text-center">
            {t('library.errorLoading') || 'Failed to load sanctuary wisdom.'}
          </Text>
          <Pressable
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            accessibilityHint="Retries loading sanctuary wisdom"
          >
            <Text className="text-phase-accent font-bold">Retry</Text>
          </Pressable>
        </VStack>
      ) : (loading || isFetchingPublic) && !refreshing ? (
        <VStack className="p-md mt-lg gap-4">
          <SkeletonCard height={200} />
          <SkeletonCard height={160} />
          <SkeletonCard height={160} />
        </VStack>
      ) : (
        <Box className="flex-1">
          {activeSection === 'collections' && (
            <Box className="flex-1 bg-phase-surface px-md pt-md">
              <VStack className="gap-1 mb-md">
                <Text className="text-xl font-extrabold text-phaseText-primary">Collections</Text>
                <Text className="text-sm leading-5 text-phaseText-secondary">
                  Follow a themed path through resources gathered together.
                </Text>
              </VStack>
              {collections.length > 0 ? (
                <SanctuaryFlashList
                  data={[{ type: 'COLLECTIONS', id: 'collections' }]}
                  keyExtractor={keyExtractor}
                  renderItem={renderFlatListItem}
                  estimatedItemSize={280}
                  contentContainerStyle={{ paddingBottom: bottomPadding + 40 }}
                  showsVerticalScrollIndicator={false}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              ) : (
                <VStack className="rounded-2xl border border-phase-border bg-phase-surface-light p-5 gap-2">
                  <Text className="text-base font-bold text-phaseText-primary">
                    No collections yet
                  </Text>
                  <Text className="text-sm leading-5 text-phaseText-secondary">
                    Create a collection from Contribute & Review when you are ready to gather
                    resources.
                  </Text>
                </VStack>
              )}
            </Box>
          )}
          {activeSection === 'contribute' && (
            <VStack className="flex-1 bg-phase-surface px-md pt-md gap-3">
              <VStack className="gap-1 mb-1">
                <Text className="text-xl font-extrabold text-phaseText-primary">
                  Contribute & Review
                </Text>
                <Text className="text-sm leading-5 text-phaseText-secondary">
                  Add useful knowledge, shape collections, or review community submissions.
                </Text>
              </VStack>
              {isLibraryManagementEnabled && can('create', 'LibraryResource') ? (
                <Pressable
                  onPress={handleOpenAddModal}
                  accessibilityRole="button"
                  accessibilityLabel="Add a resource"
                  accessibilityHint="Open the form to contribute a library resource"
                  className="min-h-16 rounded-2xl border border-phase-interactive/40 bg-phase-interactive/10 px-4 py-3 flex-row items-center gap-3"
                >
                  <Icon as={Plus} size={22} color={theme.accent.action} />
                  <VStack className="flex-1 gap-0.5">
                    <Text className="text-base font-bold text-phaseText-primary">
                      Add a resource
                    </Text>
                    <Text className="text-sm text-phaseText-secondary">
                      Share an article, video, note, or link.
                    </Text>
                  </VStack>
                </Pressable>
              ) : (
                <VStack className="rounded-2xl border border-phase-border bg-phase-surface-light p-4 gap-1">
                  <Text className="text-base font-bold text-phaseText-primary">
                    Contributions are unavailable
                  </Text>
                  <Text className="text-sm leading-5 text-phaseText-secondary">
                    Your current account cannot add library resources right now.
                  </Text>
                </VStack>
              )}
              {isLibraryManagementEnabled && can('create', 'Library') && (
                <Pressable
                  onPress={handleOpenCollectionModal}
                  accessibilityRole="button"
                  accessibilityLabel="Create a collection"
                  accessibilityHint="Open the form to create a library collection"
                  className="min-h-16 rounded-2xl border border-phase-border bg-phase-surface-light px-4 py-3 flex-row items-center gap-3"
                >
                  <Icon as={Library} size={22} color={theme.accent.action} />
                  <VStack className="flex-1 gap-0.5">
                    <Text className="text-base font-bold text-phaseText-primary">
                      Create a collection
                    </Text>
                    <Text className="text-sm text-phaseText-secondary">
                      Give related resources one home.
                    </Text>
                  </VStack>
                </Pressable>
              )}
              {isLibraryManagementEnabled && can('manage', 'LibraryCuratorDashboard') ? (
                <CuratorInvitation onPress={handleNavigateToCuratorReview} />
              ) : (
                <Text className="px-1 pt-2 text-sm leading-5 text-phaseText-secondary">
                  Reviews appear here when curator access is enabled for your account.
                </Text>
              )}
            </VStack>
          )}
          {activeSection === 'browse' && (
            <>
              <Box className="flex-1 bg-phase-surface">
                <AnimatedView entering={FadeInDown.delay(100).springify()}>
                  <HorizontalChipRow
                    chips={chipData}
                    selectedValue={selectedCategoryId}
                    onSelect={handleSelectCategory}
                    size="sm"
                  />
                </AnimatedView>

                <AnimatedView entering={FadeInDown.delay(160).springify()}>
                  <HStack className="px-md pb-sm justify-between items-center">
                    <Box className="flex-1">
                      <HorizontalChipRow
                        chips={sortChips}
                        selectedValue={selectedSort}
                        onSelect={handleSelectSort}
                        size="sm"
                      />
                    </Box>
                    <HStack className="gap-1 p-1 rounded-xl border border-phase-border bg-phase-surface/80">
                      <Pressable
                        onPress={handleSetViewModeShelf}
                        accessibilityRole="button"
                        accessibilityLabel="Shelf layout"
                        accessibilityHint="Shows resources in a grouped shelf view"
                        className={`w-8 h-8 rounded-lg justify-center items-center ${viewMode === 'shelf' ? 'bg-phase-interactive' : ''}`}
                      >
                        <Icon
                          as={Layers}
                          size={14}
                          color={viewMode === 'shelf' ? theme.text.inverse : theme.text.secondary}
                        />
                      </Pressable>
                      <Pressable
                        onPress={handleSetViewModeGrid}
                        accessibilityRole="button"
                        accessibilityLabel="Grid layout"
                        accessibilityHint="Shows resources in a grid view"
                        className={`w-8 h-8 rounded-lg justify-center items-center ${viewMode === 'grid' ? 'bg-phase-interactive' : ''}`}
                      >
                        <Icon
                          as={LayoutGrid}
                          size={14}
                          color={viewMode === 'grid' ? theme.text.inverse : theme.text.secondary}
                        />
                      </Pressable>
                      <Pressable
                        onPress={handleSetViewModeList}
                        accessibilityRole="button"
                        accessibilityLabel="List layout"
                        accessibilityHint="Shows resources in a detailed list view"
                        className={`w-8 h-8 rounded-lg justify-center items-center ${viewMode === 'list' ? 'bg-phase-interactive' : ''}`}
                      >
                        <Icon
                          as={List}
                          size={14}
                          color={viewMode === 'list' ? theme.text.inverse : theme.text.secondary}
                        />
                      </Pressable>
                    </HStack>
                  </HStack>
                </AnimatedView>

                {viewMode === 'shelf' && !isSearchMode ? (
                  <Box className="flex-1">
                    <SanctuaryFlashList
                      data={orderedShelfData}
                      keyExtractor={keyExtractor}
                      renderItem={renderFlatListItem}
                      estimatedItemSize={280}
                      contentContainerStyle={{
                        paddingBottom: bottomPadding + 40,
                        paddingTop: Theme.spacing.md,
                      }}
                      showsVerticalScrollIndicator={false}
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      masonry
                      numColumns={shelfColumns}
                    />
                  </Box>
                ) : (
                  <ResourceList
                    resources={resources}
                    onOpenResource={handleOpenResource}
                    onOpenResourceOptions={handleOpenResourceOptions}
                    onPullToDesk={handlePullToDesk}
                    viewMode={viewMode === 'grid' ? 'grid' : 'list'}
                    ListHeaderComponent={
                      <Box className="p-md">
                        <Text className="text-[13px] text-phaseText-secondary">
                          {searchQuery
                            ? `Found ${resources.length} resources for "${searchQuery}"`
                            : `Showing curated findings`}
                        </Text>
                      </Box>
                    }
                    onEndReached={handleEndReached}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                )}
              </Box>
            </>
          )}
        </Box>
      )}

      {isPastView ? (
        <Box className="mx-md mb-sm rounded-xl border border-phase-border bg-phase-interactive/5 px-3 py-2">
          <Text className="text-xs text-phaseText-secondary">
            This is a read-only historical view. Return to today to contribute.
          </Text>
        </Box>
      ) : null}
      {!isLibraryManagementEnabled || !can('create', 'LibraryResource') ? (
        <Box className="mx-md mb-sm rounded-xl border border-phase-border bg-phase-interactive/5 px-3 py-2">
          <Text className="text-xs text-phaseText-secondary">
            {isLibraryManagementEnabled
              ? 'Contributions are unavailable for this account.'
              : 'Contributions are currently unavailable.'}
          </Text>
        </Box>
      ) : null}
      <AssetCreationModal
        isOpen={isAddModalOpen && !isPastView}
        onClose={handleCloseAddModal}
        onAdd={handleAddResource}
      />
      <CollectionCreationModal
        isOpen={isAddCollectionModalOpen && !isPastView}
        onClose={handleCloseCollectionModal}
        onSubmit={handleCreateCollection}
      />
      {selectedResource && (
        <ResourceActionSheet
          visible={isActionSheetVisible}
          onClose={handleCloseActionSheet}
          resource={selectedResource}
          onBookmark={handleActionSheetBookmark}
          onAddToCollection={handleActionSheetAddToCollection}
          onShare={handleActionSheetShare}
        />
      )}

      <CollectionPickerModal
        visible={isCollectionPickerVisible}
        onClose={handleCloseCollectionPicker}
        collections={rawCollections as any}
        onSelect={handleAddToCollection}
        isAdding={isAddingToCollection}
      />
    </ScreenWrapper>
  );
}

interface HeroBannerProps {
  resource: LibraryResource;
  onPress: (resource: LibraryResource) => void;
}

const _HERO_HEIGHT = 220;

const SanctuaryPulse = memo(
  ({
    resourceCount,
    collectionCount,
    bookmarkCount,
  }: {
    resourceCount: number;
    collectionCount: number;
    bookmarkCount: number;
  }) => {
    const theme = useTheme();

    const items = useMemo(
      () => [
        {
          label: 'Resources',
          value: resourceCount,
          accent: `${theme.accent.action}18`,
        },
        {
          label: 'Categories',
          value: collectionCount,
          accent: `${theme.accent.reward}16`,
        },
        {
          label: 'Bookmarks',
          value: bookmarkCount,
          accent: `${theme.accent.sageGreen}16`,
        },
      ],
      [
        resourceCount,
        collectionCount,
        bookmarkCount,
        theme.accent.action,
        theme.accent.reward,
        theme.accent.sageGreen,
      ],
    );

    return (
      <HStack className="px-md pt-sm gap-2.5">
        {items.map((item) => (
          <Box
            key={item.label}
            className="flex-1 rounded-[18px] border border-phase-border bg-phase-surface overflow-hidden"
          >
            <Box className="px-5 py-4" style={{ backgroundColor: item.accent }}>
              <Text className="text-[10px] font-extrabold tracking-widest uppercase text-phaseText-secondary">
                {item.label}
              </Text>
              <Text className="text-2xl font-extrabold text-phaseText-primary mt-1">
                {item.value}
              </Text>
            </Box>
          </Box>
        ))}
      </HStack>
    );
  },
);
SanctuaryPulse.displayName = 'SanctuaryPulse';

const HeroBanner = memo(({ resource, onPress }: HeroBannerProps) => {
  const theme = useTheme();
  const handlePress = useCallback(() => {
    onPress(resource);
  }, [resource, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Featured resource: ${resource.title}`}
      accessibilityHint="Opens the featured resource"
    >
      <Box className="h-[240px] overflow-hidden bg-phase-surface/50 mb-md mx-md rounded-3xl border border-phase-border">
        {resource.media?.url ? (
          <ImageBackground
            source={{ uri: resource.media.url as string }}
            className="flex-1"
            resizeMode="cover"
          >
            <HeroOverlay resource={resource} theme={theme} />
          </ImageBackground>
        ) : (
          <Box className="flex-1">
            <LinearGradient
              colors={[`${theme.accent.action}18`, `${theme.accent.reward}16`]}
              className="flex-1"
            />
            <HeroOverlay resource={resource} theme={theme} />
          </Box>
        )}
      </Box>
    </Pressable>
  );
});
HeroBanner.displayName = 'HeroBanner';

function HeroOverlay({ resource, theme }: { resource: LibraryResource; theme: any }) {
  return (
    <Box className="absolute inset-0 justify-end p-6">
      <LinearGradient
        colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.1)', 'rgba(252,249,242,0.94)']}
        className="absolute inset-0"
      />
      <Box className="bg-[#FCF9F2]/90 rounded-[20px] p-5 border border-white/50">
        <Box
          className="self-start px-2 py-1 rounded-full mb-2"
          style={{ backgroundColor: `${theme.accent.action}18` }}
        >
          <Text
            className="text-[10px] font-extrabold tracking-widest"
            style={{ color: theme.accent.action }}
          >
            ✧ FEATURED
          </Text>
        </Box>
        <Text className="text-[22px] font-extrabold leading-7 mb-1.5 text-phaseText-primary">
          {resource.title}
        </Text>
        {resource.description && (
          <Text
            className="text-[13px] leading-[18px] mb-3 text-phaseText-secondary"
            numberOfLines={3}
          >
            {resource.description}
          </Text>
        )}
        <HStack className="items-center gap-2.5">
          <Box
            className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl"
            style={{ backgroundColor: theme.accent.action }}
          >
            <Icon as={Play} size={14} color="white" fill="white" />
            <Text className="text-white font-bold text-[13px]">Open</Text>
          </Box>
          {resource.creator_name ? (
            <Text className="text-[12px] text-phaseText-secondary font-semibold">
              Curated by {resource.creator_name}
            </Text>
          ) : null}
        </HStack>
      </Box>
    </Box>
  );
}
