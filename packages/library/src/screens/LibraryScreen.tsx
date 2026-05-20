/**
 * LibraryScreen — Netflix-Style Holistic Digital Library
 */

import { useNavigation } from '@react-navigation/native';
import { identityAPI } from '@repo/core/api';
import { useTracking } from '@repo/core/hooks';
import { coreRuntime, FeatureGuard, useStore, useTemporalStore } from '@repo/core/logic';
import { CollectionCard } from '@repo/ui/components/CollectionCard';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { HorizontalChipRow } from '@repo/ui/components/HorizontalChipRow';
import {
  AssetCreationModal,
  CollectionCreationModal,
} from '@repo/ui/components/media/AssetCreationPortal';
import { ResourceActionSheet } from '@repo/ui/components/media/ResourceActionSheet';
import ScreenWrapper, { useBottomTabPadding } from '@repo/ui/components/ScreenWrapper';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { SmartShelf } from '@repo/ui/components/SmartShelf';
import { TemporalNavigator } from '@repo/ui/components/TemporalNavigator';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import {
  AnimatedView,
  Box,
  FlatList,
  HStack,
  Icon,
  ImageBackground,
  LinearGradient,
  Pressable,
  RefreshControl,
  Text,
  useTheme,
  VStack,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { openExternalURL, showExternalLinkOptions } from '@repo/ui/utils';
import {
  FileText,
  Layers,
  LayoutGrid,
  Library,
  List,
  Map as MapIcon,
  Play,
  Plus,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FadeInDown } from 'react-native-reanimated';
import { libraryAPI } from '../api/library';
import { CollectionPickerModal } from '../components/CollectionPickerModal';
import { LibraryThumbnailCard } from '../components/LibraryThumbnailCard';
import { ResourceList } from '../components/ResourceList';
import { getOrderedShelfDefs } from '../constants/shelf';
import { useBookmarkedResources, useLibrary } from '../hooks/useLibrary';
import type { LibraryResource } from '../types';
import { buildLibraryExternalLinkOptions } from '../utils/externalLinks';

const LIBRARY_UI_CATEGORIES = [
  { id: 'All', en: 'All' },
  { id: 'video', en: 'Videos' },
  { id: 'pdf', en: 'Documents' },
  { id: 'link', en: 'Web Resources' },
  { id: 'text', en: 'Articles' },
  { id: 'note', en: 'Personal Notes' },
];

const MapInvitation = React.memo(({ onPress }: { onPress: () => void }) => {
  const theme = useTheme();

  return (
    <AnimatedView entering={FadeInDown.delay(200).springify()}>
      <Pressable
        onPress={onPress}
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

const CuratorInvitation = React.memo(({ onPress }: { onPress: () => void }) => {
  const theme = useTheme();

  return (
    <AnimatedView entering={FadeInDown.delay(300).springify()}>
      <Pressable
        onPress={onPress}
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

export default function LibraryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  // --- 1. STATE MACHINE (Mechanism) ---
  interface LibraryState {
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

  // --- 2. ATOMIC SELECTORS & DERIVATIONS ---
  const isPastView = useTemporalStore((state) => state.isPastView);
  const viewDate = useTemporalStore((state) => state.viewDate);
  const viewScale = useTemporalStore((state) => state.viewScale);
  const deskItems = useStore((state) => state.deskItems);
  const user = useStore((state) => state.user);
  const _showToast = useStore((state) => state.showToast);

  // Search Debouncing (Orchestrated by Reducer)
  React.useEffect(() => {
    const handler = setTimeout(() => {
      dispatch({ type: 'SET_DEBOUNCED_SEARCH', query: searchQuery });
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const theme = useTheme();
  const bottomPadding = useBottomTabPadding();
  const { discoverFeature } = useTracking();

  const isSearchMode = searchQuery.trim().length > 0 || selectedCategoryId !== 'All';

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

  const orientationSeeds = user?.orientation_seeds ?? null;
  const orderedShelfDefs = useMemo(() => getOrderedShelfDefs(orientationSeeds), [orientationSeeds]);

  const {
    resources: rawResources,
    collections: rawUserCollections,
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
  } = useLibrary(libraryFilters, libraryFilters);

  // Get Bookmarks
  const {
    resources: bookmarkedResources,
    isLoading: loadingBookmarks,
    refetch: refetchBookmarks,
  } = useBookmarkedResources(user?.id);

  React.useEffect(() => {
    discoverFeature('section_library');
    dispatch({ type: 'SET_SYNCING', isSyncing: true });
    syncLibrary()
      .catch((err) => console.error('Library sync failed:', err))
      .finally(() => dispatch({ type: 'SET_SYNCING', isSyncing: false }));
  }, [syncLibrary, discoverFeature]);

  React.useEffect(() => {
    if (
      !loading &&
      rawResources.length === 0 &&
      rawUserCollections.length === 0 &&
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
          viewDate,
          viewScale,
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
    rawUserCollections.length,
    publicCollections.length,
    fallbackAttempted,
    viewDate,
    viewScale,
  ]);

  const resources = useMemo(() => rawResources, [rawResources]);
  const collections = useMemo(
    () => (rawUserCollections.length > 0 ? rawUserCollections : publicCollections),
    [rawUserCollections, publicCollections],
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

  const handleOpenResource = useCallback(
    (resource: LibraryResource) => {
      if (!resource.url) return;
      if (resource.type === 'pdf') {
        navigation.navigate('PDFViewer', {
          resourceId: resource.id,
          title: resource.title,
          url: resource.url,
        });
        return;
      }
      if (resource.type === 'video' || resource.type === 'movie_trailer') {
        navigation.navigate('VideoPlayer', {
          resourceId: resource.id,
          title: resource.title,
          url: resource.url,
          creator: resource.creator_name,
        });
        return;
      }
      openExternalURL(resource.url, buildLibraryExternalLinkOptions(resource)).catch((err) =>
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
    showExternalLinkOptions(resource.url, buildLibraryExternalLinkOptions(resource)).catch((err) =>
      console.error("Couldn't show external link options", err),
    );
  }, []);

  const handleAddResource = useCallback(async () => {
    try {
      await fetchResources();
      await refetchBookmarks();
    } catch (err) {
      console.error('Failed to refresh after add', err);
    }
  }, [fetchResources, refetchBookmarks]);

  const handleBookmark = useCallback(
    async (resource: LibraryResource) => {
      if (isPastView || !user?.id) return;
      try {
        await bookmarkResource({ resourceId: resource.id, userId: user.id });
        await refetchBookmarks();
      } catch (err) {
        console.error('Failed to bookmark:', err);
      }
    },
    [isPastView, user?.id, bookmarkResource, refetchBookmarks],
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
    async (collectionId: string) => {
      if (isPastView || !selectedResource) return;
      try {
        await addToCollection({
          collectionId,
          resourceId: selectedResource.id,
        });
        dispatch({ type: 'SET_MODAL', name: 'picker', isOpen: false });
      } catch (err) {
        console.error('Failed to add to collection:', err);
      }
    },
    [isPastView, selectedResource, addToCollection],
  );

  const onRefresh = useCallback(async () => {
    dispatch({ type: 'SET_REFRESHING', refreshing: true });
    await fetchResources();
    const userId = await identityAPI.getMyInternalId();

    if (resources.length === 0) {
      const pub = await libraryAPI.getCollections({
        limit: 10,
        visibility: 'public',
        userId: userId ?? undefined,
        viewDate,
        viewScale,
      });
      dispatch({ type: 'SET_PUBLIC_COLLECTIONS', collections: pub });
    }
    dispatch({ type: 'SET_REFRESHING', refreshing: false });
  }, [fetchResources, resources.length, viewDate, viewScale]);

  const handleCreateCollection = useCallback(
    async (data: any) => {
      if (isPastView) return;
      try {
        const userId = await identityAPI.getMyInternalId();
        if (!userId) return;

        await libraryAPI.createCollection(
          {
            ...data,
            resource_ids: [],
            subject: '',
            grades: [],
          },
          userId,
        );

        await fetchResources();
        dispatch({ type: 'SET_REFRESHING', refreshing: true });
        setTimeout(() => dispatch({ type: 'SET_REFRESHING', refreshing: false }), 500);
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
    if (hasNextResources && !isFetchingNextResources) fetchNextResources();
  }, [hasNextResources, isFetchingNextResources, fetchNextResources]);

  const fabConfig = useMemo(
    () => ({
      tabType: 'library' as const,
      onPress: () => dispatch({ type: 'SET_MODAL', name: 'add', isOpen: true }),
      visible: !loading && !isPastView,
    }),
    [loading, isPastView],
  );

  useRegisterFAB(fabConfig);

  const handleLongPressResource = useCallback((res: LibraryResource) => {
    dispatch({ type: 'SET_SELECTED_RESOURCE', resource: res });
    dispatch({ type: 'SET_MODAL', name: 'actionSheet', isOpen: true });
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

  return (
    <ScreenWrapper scroll={!isSearchMode} noTopInset={true}>
      <GlobalHeader
        title={t('tabs.library') || 'Library'}
        subtitle={t('library.knowledgeSanctuary')}
        showSearch
        searchProps={{
          value: searchQuery,
          onChangeText: (text) => dispatch({ type: 'SET_SEARCH', query: text }),
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
              onPress={() => navigation.navigate('LibraryMap' as any)}
              className="p-2 rounded-xl bg-phase-interactive/10 border border-phase-interactive/15 mr-1"
            >
              <Icon as={MapIcon} size={20} color={theme.text.primary} />
            </Pressable>
          </HStack>
        }
      />
      <Box className="px-md pb-sm">
        <TemporalNavigator />
      </Box>

      {libraryError ? (
        <VStack className="p-md mt-lg items-center gap-3">
          <Text className="text-phase-danger text-center">
            {t('library.errorLoading') || 'Failed to load sanctuary wisdom.'}
          </Text>
          <Pressable onPress={() => fetchResources()}>
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
          {!isSearchMode && (
            <FeatureGuard feature="isLibraryManagementEnabled" action="create" subject="Library">
              <HStack className="px-md py-3 gap-3">
                <Pressable
                  onPress={() =>
                    !isPastView &&
                    dispatch({
                      type: 'SET_MODAL',
                      name: 'collection',
                      isOpen: true,
                    })
                  }
                  className="flex-row items-center gap-2 px-4 py-2.5 rounded-2xl bg-phase-interactive/10 border border-phase-interactive/50"
                >
                  <Icon as={Library} size={14} color={theme.accent.action} />
                  <Text className="text-[13px] font-bold text-phaseText-primary">+ Collection</Text>
                </Pressable>
              </HStack>
            </FeatureGuard>
          )}

          <Box className="flex-1 bg-phase-surface">
            <AnimatedView entering={FadeInDown.delay(100).springify()}>
              <HorizontalChipRow
                chips={chipData}
                selectedValue={selectedCategoryId}
                onSelect={(id) => dispatch({ type: 'SET_CATEGORY', id })}
                size="sm"
              />
            </AnimatedView>

            <AnimatedView entering={FadeInDown.delay(160).springify()}>
              <HStack className="px-md pb-sm justify-between items-center">
                <Box className="flex-1">
                  <HorizontalChipRow
                    chips={sortChips}
                    selectedValue={selectedSort}
                    onSelect={(v) => dispatch({ type: 'SET_SORT', sort: v as any })}
                    size="sm"
                  />
                </Box>
                <HStack className="gap-1 p-1 rounded-xl border border-phase-border bg-phase-surface/80">
                  <Pressable
                    onPress={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'shelf' })}
                    className={`w-8 h-8 rounded-lg justify-center items-center ${viewMode === 'shelf' ? 'bg-phase-interactive' : ''}`}
                  >
                    <Icon
                      as={Layers}
                      size={14}
                      color={viewMode === 'shelf' ? theme.text.inverse : theme.text.secondary}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'grid' })}
                    className={`w-8 h-8 rounded-lg justify-center items-center ${viewMode === 'grid' ? 'bg-phase-interactive' : ''}`}
                  >
                    <Icon
                      as={LayoutGrid}
                      size={14}
                      color={viewMode === 'grid' ? theme.text.inverse : theme.text.secondary}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'list' })}
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
                <FlatList
                  data={useMemo(() => {
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

                    const deskItemsResources =
                      deskItems?.filter((r: any) => r.type === 'resource') || [];
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

                    if (collections.length > 0) {
                      rows.push({
                        type: 'COLLECTIONS',
                        id: 'collections',
                        items: collections,
                        isUser: rawUserCollections.length > 0,
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
                        label: '⭐ Trending',
                        items: trending,
                      });
                    }

                    if (newArrivals.length > 0) {
                      rows.push({
                        type: 'SHELF',
                        id: 'shelf-new',
                        label: '✨ New Arrivals',
                        items: newArrivals,
                      });
                    }

                    return rows;
                  }, [
                    heroResource,
                    resources,
                    bookmarkedResources,
                    collections,
                    deskItems,
                    rawUserCollections,
                    orderedShelfDefs,
                    trending,
                    newArrivals,
                  ])}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    switch (item.type) {
                      case 'PULSE':
                        return (
                          <SanctuaryPulse
                            resourceCount={resources.length}
                            collectionCount={collections.length}
                            bookmarkCount={bookmarkedResources.length}
                          />
                        );
                      case 'HERO':
                        return (
                          <HeroBanner
                            resource={item.resource}
                            onPress={() => handleOpenResource(item.resource)}
                          />
                        );
                      case 'MAP_INVITATION':
                        return (
                          <MapInvitation onPress={() => navigation.navigate('LibraryMap' as any)} />
                        );
                      case 'CURATOR_INVITATION_GUARD':
                        return (
                          <FeatureGuard
                            feature="isLibraryManagementEnabled"
                            action="manage"
                            subject="LibraryCuratorDashboard"
                          >
                            <CuratorInvitation
                              onPress={() => navigation.navigate('CuratorReview' as any)}
                            />
                          </FeatureGuard>
                        );
                      case 'CONTINUE_LEARNING':
                        return (
                          <SmartShelf title="▶ Continue Learning">
                            {item.items.map((res: any) => (
                              <LibraryThumbnailCard
                                key={`continue-${res.id}`}
                                title={res.title}
                                type={res.type}
                                onPress={() => handleOpenResource(res)}
                                onLongPress={
                                  res.url ? () => handleOpenResourceOptions(res) : undefined
                                }
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
                      case 'COLLECTIONS':
                        return (
                          <Box className="mb-lg">
                            <SmartShelf
                              title={
                                item.isUser ? '📚 Your Collections' : '🌟 Discover Collections'
                              }
                            >
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
                                  onPress={(collection) =>
                                    navigation.navigate('CollectionDetail', {
                                      id: collection.id,
                                      title: collection.name,
                                    })
                                  }
                                />
                              ))}
                            </SmartShelf>
                          </Box>
                        );
                      case 'SHELF':
                        return renderShelf(item.label, item.items);
                      default:
                        return null;
                    }
                  }}
                  contentContainerStyle={{
                    paddingBottom: bottomPadding + 40,
                    paddingTop: Theme.spacing.md,
                  }}
                  showsVerticalScrollIndicator={false}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                  removeClippedSubviews={coreRuntime.device.getMetadata().platform !== 'web'}
                  initialNumToRender={4}
                  maxToRenderPerBatch={2}
                  windowSize={5}
                />
              </Box>
            ) : (
              <ResourceList
                resources={resources}
                onOpenResource={handleOpenResource}
                onOpenResourceOptions={handleOpenResourceOptions}
                onPullToDesk={(res) => console.log('Pull', res.id)}
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
        </Box>
      )}

      <AssetCreationModal
        isOpen={isAddModalOpen && !isPastView}
        onClose={() => dispatch({ type: 'SET_MODAL', name: 'add', isOpen: false })}
        onAdd={handleAddResource}
      />
      <CollectionCreationModal
        isOpen={isAddCollectionModalOpen && !isPastView}
        onClose={() => dispatch({ type: 'SET_MODAL', name: 'collection', isOpen: false })}
        onSubmit={handleCreateCollection}
      />
      {selectedResource && (
        <ResourceActionSheet
          visible={isActionSheetVisible}
          onClose={() => dispatch({ type: 'SET_MODAL', name: 'actionSheet', isOpen: false })}
          resource={selectedResource}
          onBookmark={() => handleBookmark(selectedResource)}
          onAddToCollection={() => dispatch({ type: 'SET_MODAL', name: 'picker', isOpen: true })}
          onShare={() => handleShare(selectedResource)}
        />
      )}

      <CollectionPickerModal
        visible={isCollectionPickerVisible}
        onClose={() => dispatch({ type: 'SET_MODAL', name: 'picker', isOpen: false })}
        collections={rawUserCollections as any}
        onSelect={handleAddToCollection}
        isAdding={isAddingToCollection}
      />
    </ScreenWrapper>
  );
}

interface HeroBannerProps {
  resource: LibraryResource;
  onPress: () => void;
}

const _HERO_HEIGHT = 220;

const SanctuaryPulse = React.memo(
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
          label: 'Collections',
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

const HeroBanner = React.memo(({ resource, onPress }: HeroBannerProps) => {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress}>
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
