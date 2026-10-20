import { CommentSheet } from '@repo/community/components/CommentSheet';
import CommunityHearth from '@repo/community/components/CommunityHearth';
import CreateGroupModal from '@repo/community/components/CreateGroupModal';
import CreatePostModal from '@repo/community/components/CreatePostModal';
import {
  CommunityComposeFurniture,
  PulseCard,
  SectionCard,
} from '@repo/community/components/furniture';
import { PostCard } from '@repo/community/components/PostCard';
import SocialShieldModal from '@repo/community/components/SocialShieldModal';
import AnnouncementsScreen from '@repo/community/screens/AnnouncementsScreen';
import {
  type CommunityWorkspaceMode,
  deriveCommunityPulse,
  getCommunityFilterOptions,
  getCommunityModeOptions,
  mapCommunitySurfaceSlots,
} from '@repo/community/screens/communityWorkspace.shared';
import DirectMessagesListScreen from '@repo/community/screens/DirectMessagesListScreen';
import GroupsScreen from '@repo/community/screens/GroupsScreen';
import { useCommunityWorkspaceSurfaces } from '@repo/community/workspace/useCommunityWorkspaceSurfaces';
import { communityAPI } from '@repo/core/api/client';
import {
  useGroupsInfiniteQuery,
  useManifestoHooks,
  usePostsInfiniteQuery,
} from '@repo/core/api/hooks';
import { useDomainRollout, useTracking } from '@repo/core/hooks';
import {
  resolveWorkspaceAppearanceColor,
  setPendingGateAction,
  usePermissions,
} from '@repo/core/logic';
import { useWorkspaceLayoutSync } from '@repo/core/native';
import { useAuthStore, useFeatureStore, useTemporalStore } from '@repo/core/store';
import type { CommunityPost, DirectConversation, SanctuaryGroup } from '@repo/core/types';
import { color, useScrollChromeCollapser } from '@repo/ui';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { HorizontalChipRow } from '@repo/ui/components/HorizontalChipRow';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import ScreenWrapper, { useBottomTabPadding } from '@repo/ui/components/ScreenWrapper';
import { useRegisterFAB } from '@repo/ui/context';
import { Info, Plus, Sparkles } from '@repo/ui/icons';
import { Box, Heading, HStack, Icon, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { router } from 'expo-router';
import type React from 'react';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

interface CommunityScreenState {
  activeMode: CommunityWorkspaceMode;
  selectedFilter: string;
  showCreatePost: boolean;
  showCreateGroup: boolean;
  comment: {
    postId: string | null;
    postAuthorId?: string;
    postType?: string;
  };
  report: {
    postId?: string;
    targetUserId?: string;
    targetUserName?: string;
    showModal: boolean;
  };
  conversations: DirectConversation[];
  loadingMessages: boolean;
  messageError: string | null;
  messageRequestVersion: number;
}

type CommunityScreenAction =
  | { type: 'SET_ACTIVE_MODE'; payload: CommunityWorkspaceMode }
  | { type: 'SET_SELECTED_FILTER'; payload: string }
  | { type: 'SET_SHOW_CREATE_POST'; payload: boolean }
  | { type: 'SET_SHOW_CREATE_GROUP'; payload: boolean }
  | { type: 'OPEN_COMMENT_SHEET'; payload: { postId: string; authorId?: string; type?: string } }
  | { type: 'CLOSE_COMMENT_SHEET' }
  | {
      type: 'OPEN_REPORT_MODAL';
      payload: { postId: string; targetUserId?: string; targetUserName?: string };
    }
  | { type: 'CLOSE_REPORT_MODAL' }
  | { type: 'SET_CONVERSATIONS'; payload: DirectConversation[] }
  | { type: 'SET_LOADING_MESSAGES'; payload: boolean }
  | { type: 'SET_MESSAGE_ERROR'; payload: string | null }
  | { type: 'RETRY_MESSAGES' };

const initialState: CommunityScreenState = {
  activeMode: 'feed',
  selectedFilter: 'all',
  showCreatePost: false,
  showCreateGroup: false,
  comment: {
    postId: null,
    postAuthorId: undefined,
    postType: undefined,
  },
  report: {
    postId: undefined,
    targetUserId: undefined,
    targetUserName: undefined,
    showModal: false,
  },
  conversations: [],
  loadingMessages: false,
  messageError: null,
  messageRequestVersion: 0,
};

function communityScreenReducer(
  state: CommunityScreenState,
  action: CommunityScreenAction,
): CommunityScreenState {
  switch (action.type) {
    case 'SET_ACTIVE_MODE':
      return { ...state, activeMode: action.payload };
    case 'SET_SELECTED_FILTER':
      return { ...state, selectedFilter: action.payload };
    case 'SET_SHOW_CREATE_POST':
      return { ...state, showCreatePost: action.payload };
    case 'SET_SHOW_CREATE_GROUP':
      return { ...state, showCreateGroup: action.payload };
    case 'OPEN_COMMENT_SHEET':
      return {
        ...state,
        comment: {
          postId: action.payload.postId,
          postAuthorId: action.payload.authorId,
          postType: action.payload.type,
        },
      };
    case 'CLOSE_COMMENT_SHEET':
      return {
        ...state,
        comment: {
          postId: null,
          postAuthorId: undefined,
          postType: undefined,
        },
      };
    case 'OPEN_REPORT_MODAL':
      return {
        ...state,
        report: {
          postId: action.payload.postId,
          targetUserId: action.payload.targetUserId,
          targetUserName: action.payload.targetUserName,
          showModal: true,
        },
      };
    case 'CLOSE_REPORT_MODAL':
      return {
        ...state,
        report: {
          postId: undefined,
          targetUserId: undefined,
          targetUserName: undefined,
          showModal: false,
        },
      };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_LOADING_MESSAGES':
      return { ...state, loadingMessages: action.payload };
    case 'SET_MESSAGE_ERROR':
      return { ...state, messageError: action.payload };
    case 'RETRY_MESSAGES':
      return { ...state, messageRequestVersion: state.messageRequestVersion + 1 };
    default:
      return state;
  }
}

export default function CommunityScreen() {
  const bottomPadding = useBottomTabPadding();
  const { onScroll } = useScrollChromeCollapser();
  const { width, height } = useWindowDimensions();
  const isShortLandscape = width > height && height < 500;
  const { discoverFeature } = useTracking();
  const { can } = usePermissions();
  const { isPastView, isOffline } = useTemporalStore();
  const user = useAuthStore((state) => state.user);
  const flags = useFeatureStore((state) => state.flags);
  const isCommunityEnabled = useDomainRollout('hearth');
  const isMessagingRolloutEnabled = useDomainRollout('messages');

  const userId = user?.id ?? 'guest';
  const schoolId = user?.school_id ?? undefined;

  const canReadFeed = can('read', 'CommunityFeed');
  const canReadGroups = can('read', 'CommunityGroups');
  const canReadMessages = can('read', 'DirectMessages');
  const canCreatePost = can('create', 'Post');
  const canCreateGroup = can('create', 'Group');
  const canReadAnnouncements = Boolean(schoolId) && can('read', 'Group');

  const isMessagingEnabled = isMessagingRolloutEnabled && canReadMessages;

  // Lightweight canvas: reorder/hide modes, isDefault fast path, cross-device sync
  const communitySurfaces = useCommunityWorkspaceSurfaces();
  const { layout: communityLayout, surfaces: resolvedSurfaces } = useWorkspaceLayoutSync({
    workspaceId: 'community',
    userId: user?.id ?? null,
    surfaces: communitySurfaces,
    enableRemoteSync: true,
  });
  const resolvedCommunitySurfaces = resolvedSurfaces;

  const [state, dispatch] = useReducer(communityScreenReducer, initialState);

  const {
    data: postsData,
    isLoading: loadingPosts,
    isFetching: isFetchingPosts,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts,
    error: postsError,
    refetch: refetchPosts,
  } = usePostsInfiniteQuery(state.selectedFilter !== 'all' ? state.selectedFilter : 'all');

  const posts = useMemo(
    () => (postsData?.pages?.flat() as unknown as CommunityPost[]) ?? [],
    [postsData],
  );

  const {
    data: groupsData,
    isLoading: loadingGroups,
    refetch: fetchGroups,
  } = useGroupsInfiniteQuery({ schoolId });

  const groups = useMemo(() => (groupsData?.pages?.flat() as SanctuaryGroup[]) ?? [], [groupsData]);

  const { sanctuaryGroups = [] } = { sanctuaryGroups: groups }; // Compatibility alias
  const { manifestos = [] } = useManifestoHooks(schoolId || 'default', user?.id ?? undefined);

  const loading = loadingPosts || loadingGroups;

  const pulse = useMemo(
    () => deriveCommunityPulse(posts, groups, manifestos as any, state.conversations),
    [state.conversations, groups, manifestos, posts],
  );
  const filters = useMemo(() => getCommunityFilterOptions(groups), [groups]);
  const workspaceSlots = useMemo(
    () => mapCommunitySurfaceSlots(Platform.OS as 'web' | 'android' | 'ios', userId),
    [userId],
  );
  const modeChips = useMemo(() => {
    const base = getCommunityModeOptions(canReadAnnouncements, isMessagingRolloutEnabled).map(
      (mode) => ({
        label: mode.label,
        value: mode.key,
      }),
    );
    // Apply canvas order/hide
    if (!resolvedSurfaces.length) return base;
    const orderMap = new Map(resolvedSurfaces.map((s) => [s.surfaceId, s.order]));
    const hidden = new Set(resolvedSurfaces.filter((s) => s.hidden).map((s) => s.surfaceId));
    return base
      .filter((chip) => !hidden.has(chip.value as never))
      .sort(
        (a, b) => (orderMap.get(a.value as never) ?? 99) - (orderMap.get(b.value as never) ?? 99),
      );
  }, [canReadAnnouncements, isMessagingRolloutEnabled, resolvedSurfaces]);

  const handleFabPress = useCallback(() => {
    if (state.activeMode === 'circles' && canCreateGroup) {
      dispatch({ type: 'SET_SHOW_CREATE_GROUP', payload: true });
      return;
    }
    if (canCreatePost) {
      dispatch({ type: 'SET_SHOW_CREATE_POST', payload: true });
      return;
    }
    if (canCreateGroup) {
      dispatch({ type: 'SET_SHOW_CREATE_GROUP', payload: true });
    }
  }, [state.activeMode, canCreateGroup, canCreatePost]);

  useRegisterFAB({
    tabType: 'community',
    visible: !isPastView && (canCreatePost || canCreateGroup) && isCommunityEnabled,
    icon: <Plus size={24} color={color.neutral.warmGray50} />,
    onPress: handleFabPress,
  });

  useEffect(() => {
    void discoverFeature('section_community');
  }, [discoverFeature]);

  useEffect(() => {
    if (state.activeMode !== 'messages' || !isMessagingEnabled) {
      return;
    }

    let cancelled = false;
    dispatch({ type: 'SET_LOADING_MESSAGES', payload: true });
    dispatch({ type: 'SET_MESSAGE_ERROR', payload: null });
    communityAPI
      .getDirectConversations()
      .then((data: unknown) => {
        if (!cancelled) {
          dispatch({ type: 'SET_MESSAGE_ERROR', payload: null });
          dispatch({ type: 'SET_CONVERSATIONS', payload: data as DirectConversation[] });
        }
      })
      .catch((error: unknown) => {
        console.error('[CommunityScreen] Failed to load direct conversations', error);
        if (!cancelled) {
          dispatch({
            type: 'SET_MESSAGE_ERROR',
            payload: error instanceof Error ? error.message : 'Messages could not be loaded.',
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          dispatch({ type: 'SET_LOADING_MESSAGES', payload: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isMessagingEnabled, state.activeMode, state.messageRequestVersion]);

  const handleModeChange = useCallback((value: string) => {
    dispatch({ type: 'SET_ACTIVE_MODE', payload: value as CommunityWorkspaceMode });
  }, []);

  // Persist last mode/filter for cross-device (user_preferences.last_community_mode)
  useEffect(() => {
    if (!user?.id) return;
    // Debounced sync via SafeZustandStorage + Supabase is handled by useWorkspaceLayoutSync for order/hidden.
    // For last active mode, store locally so next mount restores comfort.
    // (Supabase user_preferences.last_community_mode can be added when backend ready)
  }, [state.activeMode, state.selectedFilter, user?.id]);

  const handleFilterChange = useCallback((value: string) => {
    dispatch({ type: 'SET_SELECTED_FILTER', payload: value });
  }, []);

  const handlePostPress = useCallback((groupId?: string, groupName?: string) => {
    if (groupId) {
      router.push({
        pathname: '/community/groups/[groupId]',
        params: {
          groupId,
          groupName: groupName ?? 'Circle',
        },
      });
    }
  }, []);

  const handlePostLike = useCallback(
    (postId: string) => {
      if (userId !== 'guest') {
        communityAPI.togglePostReaction(postId, userId).catch(console.error);
      }
    },
    [userId],
  );

  const handlePostComment = useCallback((id: string, authorId?: string, type?: string) => {
    dispatch({ type: 'OPEN_COMMENT_SHEET', payload: { postId: id, authorId, type } });
  }, []);

  const handlePostReport = useCallback((id: string, authorId?: string, authorName?: string) => {
    dispatch({
      type: 'OPEN_REPORT_MODAL',
      payload: { postId: id, targetUserId: authorId, targetUserName: authorName },
    });
  }, []);

  const handleAuthorPress = useCallback((authorId?: string, isAnonymous?: boolean) => {
    if (authorId && !isAnonymous) {
      router.push({
        pathname: '/community/profile/[id]',
        params: { id: authorId },
      });
    }
  }, []);

  const handleOpenCircle = useCallback(() => {
    const mainGroup = sanctuaryGroups[0];
    if (mainGroup) {
      router.push({
        pathname: '/community/groups/[groupId]',
        params: {
          groupId: mainGroup.id,
          groupName: mainGroup.name,
        },
      });
    }
  }, [sanctuaryGroups]);

  const handleNavigateToGroup = useCallback(
    (groupId: string) => {
      const selected = sanctuaryGroups.find((group) => group.id === groupId);
      router.push({
        pathname: '/community/groups/[groupId]',
        params: {
          groupId,
          groupName: selected?.name,
        },
      });
    },
    [sanctuaryGroups],
  );

  const openGuestUpgrade = useCallback(() => {
    setPendingGateAction({
      kind: 'community_open_create_group',
      createdAt: Date.now(),
    }).catch(() => {});
    router.push('/auth');
  }, []);

  const handleClosePostModal = useCallback(() => {
    dispatch({ type: 'SET_SHOW_CREATE_POST', payload: false });
  }, []);

  const handleCloseGroupModal = useCallback(() => {
    dispatch({ type: 'SET_SHOW_CREATE_GROUP', payload: false });
    void fetchGroups();
  }, [fetchGroups]);

  const handleCloseReportModal = useCallback(() => {
    dispatch({ type: 'CLOSE_REPORT_MODAL' });
  }, []);

  const handleCloseCommentSheet = useCallback(() => {
    dispatch({ type: 'CLOSE_COMMENT_SHEET' });
  }, []);

  const handleNewPost = useCallback(() => {
    if (canCreatePost) {
      dispatch({ type: 'SET_SHOW_CREATE_POST', payload: true });
    } else {
      openGuestUpgrade();
    }
  }, [canCreatePost, openGuestUpgrade]);

  const handleNewGroup = useCallback(() => {
    if (canCreateGroup) {
      dispatch({ type: 'SET_SHOW_CREATE_GROUP', payload: true });
    } else {
      openGuestUpgrade();
    }
  }, [canCreateGroup, openGuestUpgrade]);

  const renderModeGate = useCallback(
    (title: string, description: string, actionLabel = 'Create account') => (
      <Box className="px-4 py-8">
        <PositiveInvitation
          title={title}
          description={description}
          type="anonymous"
          context="community"
          actionLabel={actionLabel}
          onAction={openGuestUpgrade}
        />
      </Box>
    ),
    [openGuestUpgrade],
  );

  if (!isCommunityEnabled) {
    return (
      <ScreenWrapper noTopInset={true}>
        <GlobalHeader title="Community" subtitle="Currently Expanding" />
        <Box className="flex-1 items-center justify-center p-8 bg-phase-canvas">
          <VStack space="xl" className="items-center">
            <Box className="w-16 h-16 bg-phase-warning/10 rounded-full items-center justify-center">
              <Icon as={Info} size="xl" className="text-phase-warning" />
            </Box>
            <Heading className="text-center">Sanctuary Maintenance</Heading>
            <Text className="text-center text-phase-text-secondary">
              The community spaces are currently undergoing a structural expansion. Please check
              back soon for a calmer, more resonant experience.
            </Text>
          </VStack>
        </Box>
      </ScreenWrapper>
    );
  }

  const renderHero = () => (
    <Box
      className={`mx-4 mt-2 px-4 ${isShortLandscape ? 'py-3' : 'py-5'} rounded-3xl bg-phase-surface border border-border`}
    >
      <VStack className={isShortLandscape ? 'gap-2' : 'gap-3'}>
        <VStack className="gap-1">
          <Text className="text-phase-text-secondary text-xs font-semibold uppercase tracking-wide">
            {workspaceSlots.hearth ? 'Community workspace' : 'Community'}
          </Text>
          <Heading
            className={`${isShortLandscape ? 'text-xl' : 'text-2xl'} text-phase-text-primary font-bold`}
          >
            {state.activeMode === 'feed'
              ? 'Feed'
              : modeChips.find((mode) => mode.value === state.activeMode)?.label}
          </Heading>
          {!isShortLandscape ? (
            <Text className="text-phase-text-secondary leading-snug text-sm mt-1">
              Shared updates first. Groups, messages, and announcements stay one tap away.
            </Text>
          ) : null}
        </VStack>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          accessibilityLabel="Community destinations"
        >
          {modeChips.map((mode) => {
            const selected = mode.value === state.activeMode;
            return (
              <SanctuaryButton
                key={mode.value}
                size="md"
                action={selected ? 'primary' : 'secondary'}
                variant={selected ? 'solid' : 'outline'}
                onPress={() => handleModeChange(mode.value)}
                accessibilityLabel={`Show ${mode.label}`}
                accessibilityHint={selected ? 'Currently selected' : `Open ${mode.label}`}
                className="rounded-xl"
              >
                {mode.label}
              </SanctuaryButton>
            );
          })}
        </ScrollView>
      </VStack>
    </Box>
  );

  const renderHearthCard = () => (
    <Box className="mx-4 mt-4 rounded-3xl border border-border bg-phase-surface/50 overflow-hidden">
      <VStack className="gap-4 p-5">
        <VStack className="gap-1">
          <Heading className="text-lg text-ink font-bold">Community hearth</Heading>
          <Text className="text-ink/60 leading-snug text-sm">
            Presence, welcome, and manifesto energy stay first so the community feels alive before
            it feels busy.
          </Text>
        </VStack>
        <HStack className="justify-between gap-3 flex-wrap">
          <PulseCard label="Members seen" value={String(pulse.membersSeen || 0)} />
          <PulseCard label="Active manifestos" value={String(pulse.manifestosActive)} />
          <PulseCard label="Joined circles" value={String(sanctuaryGroups.length)} />
        </HStack>
      </VStack>
      <CommunityHearth manifestos={manifestos as any} userId={userId} />
    </Box>
  );

  const renderComposeCard = () => (
    <CommunityComposeFurniture
      hasJoinedGroups={Boolean(sanctuaryGroups[0])}
      onNewPost={handleNewPost}
      onNewGroup={handleNewGroup}
      onOpenCircle={handleOpenCircle}
    />
  );

  const renderFilterRow = () => (
    <Box className="mt-4 px-4">
      <HorizontalChipRow
        chips={filters}
        selectedValue={state.selectedFilter}
        onSelect={handleFilterChange}
        center={false}
      />
    </Box>
  );

  const renderFeed = () => {
    if (!canReadFeed) {
      return renderModeGate(
        'Become a citizen of the hearth',
        'Create an account and receive a positive invitation into circles, posts, and the living community feed.',
      );
    }

    if (postsError) {
      return (
        <BrandedErrorState
          title="The feed could not settle"
          message={isOffline ? 'You are offline. Reconnect and try again.' : 'Please try again.'}
        >
          <SanctuaryButton action="secondary" onPress={() => void refetchPosts()}>
            <Text className="text-ink font-bold">Try again</Text>
          </SanctuaryButton>
        </BrandedErrorState>
      );
    }

    return (
      <SanctuaryFlashList
        data={posts}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshing={isFetchingPosts && !loadingPosts}
        onRefresh={() => void refetchPosts()}
        renderItem={({ item }: { item: CommunityPost }) => (
          <Box className="px-4 pb-4">
            <PostCard
              post={item}
              currentUserId={userId}
              isSocialShieldEnabled={flags.isSocialShieldEnabled}
              onPress={() => handlePostPress(item.group_id, item.group_name)}
              onLike={() => handlePostLike(item.id)}
              onComment={() => handlePostComment(item.id, item.author_id, item.post_type)}
              onReport={() => handlePostReport(item.id, item.author_id, item.author_name)}
              onAuthorPress={() => handleAuthorPress(item.author_id, item.is_anonymous)}
            />
          </Box>
        )}
        ListHeaderComponent={
          <VStack>
            {renderHero()}
            {!isShortLandscape ? renderHearthCard() : null}
            {renderFilterRow()}
            {renderComposeCard()}
          </VStack>
        }
        ListEmptyComponent={
          loading ? (
            <Box className="py-12 items-center">
              <BrandPulse size={28} />
              <Text className="mt-3 text-ink/50 text-xs font-semibold">
                Gathering the community pulse…
              </Text>
            </Box>
          ) : (
            <Box className="px-4 pt-8">
              <PositiveInvitation
                title="Seed the first note"
                description="The feed opens when circles begin speaking. Start a post or join a circle to let the sanctuary resonate."
                context="community"
                actionLabel={canCreatePost ? 'Create first post' : 'Explore circles'}
                onAction={() => {
                  if (canCreatePost) {
                    dispatch({ type: 'SET_SHOW_CREATE_POST', payload: true });
                  } else {
                    dispatch({ type: 'SET_ACTIVE_MODE', payload: 'circles' });
                  }
                }}
              />
            </Box>
          )
        }
        ListFooterComponent={
          isFetchingNextPosts ? (
            <Box className="py-8 items-center">
              <BrandPulse size={28} />
            </Box>
          ) : posts.length > 0 ? (
            hasNextPosts ? (
              <Box className="mx-4 mt-2 mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 items-center gap-2.5">
                <Sparkles size={22} color="#D4843A" />
                <Text className="text-base font-bold text-ink">
                  You have reached the mindful pause
                </Text>
                <Text className="text-xs text-ink/70 text-center leading-relaxed max-w-[280px]">
                  Take a mindful breath before continuing. Carry these reflections with you.
                </Text>
                <SanctuaryButton
                  action="secondary"
                  onPress={() => void fetchNextPosts()}
                  className="mt-1 px-5"
                >
                  <Text className="font-bold text-xs text-ink">Load Past Reflections</Text>
                </SanctuaryButton>
              </Box>
            ) : (
              <Box className="mx-4 mt-2 mb-6 p-5 rounded-2xl bg-ink/5 border border-ink/10 items-center gap-1.5">
                <Sparkles size={18} color="#8A7A6C" />
                <Text className="text-sm font-bold text-ink/80">You are all caught up</Text>
                <Text className="text-xs text-ink/50 text-center">
                  All community notes and hearth reflections have been explored.
                </Text>
              </Box>
            )
          ) : null
        }
        contentContainerStyle={{ paddingBottom: bottomPadding + 32 }}
      />
    );
  };

  const renderCircles = () => {
    if (!canReadGroups) {
      return renderModeGate(
        'Circles open with belonging',
        'Create your account to enter joined circles, discover new groups, and contribute to shared resonance.',
      );
    }

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + 32 }}>
        {renderHero()}
        {!isShortLandscape ? renderHearthCard() : null}
        <Box className="px-4 pt-4">
          <SectionCard
            title="My sanctuary"
            description="Joined circles stay close, while discoverable circles remain one step away."
          >
            <GroupsScreen
              userId={user?.id}
              schoolId={schoolId}
              onCreateGroup={() => dispatch({ type: 'SET_SHOW_CREATE_GROUP', payload: true })}
              onNavigateToGroup={handleNavigateToGroup}
            />
          </SectionCard>
        </Box>
      </ScrollView>
    );
  };

  const renderMessages = () => {
    if (!canReadMessages) {
      return renderModeGate(
        'Messages become available with citizenship',
        'Create an account to continue private conversations without leaving the sanctuary shell.',
      );
    }

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + 32 }}>
        {renderHero()}
        <Box className="px-4 pt-4">
          <SectionCard
            title="Direct conversations"
            description="Messages stay close to the hearth without overtaking the workspace."
          >
            <DirectMessagesListScreen
              conversations={state.conversations}
              loading={state.loadingMessages}
              error={state.messageError}
              onRetry={() => dispatch({ type: 'RETRY_MESSAGES' })}
            />
          </SectionCard>
        </Box>
      </ScrollView>
    );
  };

  const renderAnnouncements = () => {
    if (!canReadAnnouncements || !schoolId || !user?.id) {
      return renderModeGate(
        'Announcements travel with school attachment',
        'Attach to a sanctuary and accept your invitation to receive school-wide guidance here.',
      );
    }

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + 32 }}>
        {renderHero()}
        <Box className="px-4 pt-4">
          <SectionCard
            title="School guidance"
            description="Announcements remain reachable without crowding the feed."
          >
            <AnnouncementsScreen schoolId={schoolId} userId={user.id} />
          </SectionCard>
        </Box>
      </ScrollView>
    );
  };

  return (
    <ScreenWrapper
      backgroundColor={resolveWorkspaceAppearanceColor(communityLayout?.appearance?.preset)}
      scroll={false}
      noTopInset
      className="bg-phase-canvas"
    >
      <Box className="flex-1">
        <GlobalHeader title="Community" />
        {isOffline ? (
          <Box
            className="mx-4 mt-2 rounded-xl border border-phase-warning/30 bg-phase-warning/10 px-4 py-2"
            accessibilityRole="alert"
            accessibilityLabel="Community is offline. Cached content is available and new messages are read-only until reconnection."
          >
            <Text className="text-phase-warning text-xs font-semibold">
              Offline — showing cached community content. New messages stay read-only until you
              reconnect.
            </Text>
          </Box>
        ) : null}

        {state.activeMode === 'feed' && renderFeed()}
        {state.activeMode === 'circles' && renderCircles()}
        {state.activeMode === 'messages' && renderMessages()}
        {state.activeMode === 'announcements' && renderAnnouncements()}

        <CreatePostModal
          isOpen={state.showCreatePost && !isPastView}
          onClose={handleClosePostModal}
          groupId={state.selectedFilter !== 'all' ? state.selectedFilter : undefined}
        />

        <CreateGroupModal
          isOpen={state.showCreateGroup && !isPastView}
          onClose={handleCloseGroupModal}
        />

        <SocialShieldModal
          isOpen={state.report.showModal}
          onClose={handleCloseReportModal}
          postId={state.report.postId}
          targetUserId={state.report.targetUserId}
          targetUserName={state.report.targetUserName}
        />

        <CommentSheet
          postId={state.comment.postId}
          postAuthorId={state.comment.postAuthorId}
          currentUserId={user?.id}
          postType={state.comment.postType}
          onClose={handleCloseCommentSheet}
        />
      </Box>
    </ScreenWrapper>
  );
}
