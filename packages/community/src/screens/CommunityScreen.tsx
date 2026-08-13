import { communityAPI } from '@repo/core/api';
import {
  useAnnouncementsQuery,
  useGroupsInfiniteQuery,
  useManifestoHooks,
  usePostsInfiniteQuery,
} from '@repo/core/api/hooks';
import { useDomainRollout, useTracking } from '@repo/core/hooks';
import { setPendingGateAction, usePermissions } from '@repo/core/logic';
import { useStore, useTemporalStore } from '@repo/core/store';
import type { CommunityPost, DirectConversation, SanctuaryGroup } from '@repo/core/types';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { HorizontalChipRow } from '@repo/ui/components/HorizontalChipRow';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { BrandedErrorState } from '@repo/ui/components/ErrorState';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import ScreenWrapper, { useBottomTabPadding } from '@repo/ui/components/ScreenWrapper';
import { useRegisterFAB } from '@repo/ui/context';
import { Info, Plus } from '@repo/ui/icons';
import { Box, Heading, HStack, Icon, ScrollView, Spinner, Text, VStack } from '@repo/ui/primitives';
import { router } from 'expo-router';
import type React from 'react';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Platform } from 'react-native';
import { CommentSheet } from '@repo/community/components/CommentSheet';
import CommunityHearth from '@repo/community/components/CommunityHearth';
import CreateGroupModal from '@repo/community/components/CreateGroupModal';
import CreatePostModal from '@repo/community/components/CreatePostModal';
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
  | { type: 'SET_MESSAGE_ERROR'; payload: string | null };

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
    default:
      return state;
  }
}

export default function CommunityScreen() {
  const bottomPadding = useBottomTabPadding();
  const { discoverFeature } = useTracking();
  const { can } = usePermissions();
  const { isPastView, isOffline } = useTemporalStore();
  const { user, flags } = useStore();
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

  const [state, dispatch] = useReducer(communityScreenReducer, initialState);

  const {
    data: postsData,
    isLoading: loadingPosts,
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
  const { data: announcements = [] } = useAnnouncementsQuery(schoolId || '');
  const announcementCount = announcements?.length ?? 0;

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
  const modeChips = useMemo(
    () =>
      getCommunityModeOptions(canReadAnnouncements, isMessagingRolloutEnabled).map((mode) => ({
        label: mode.label,
        value: mode.key,
      })),
    [canReadAnnouncements, isMessagingRolloutEnabled],
  );

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
    icon: <Plus size={24} color="#FFF" />,
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
  }, [state.activeMode, isMessagingEnabled]);

  const handleModeChange = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_ACTIVE_MODE', payload: value as CommunityWorkspaceMode });
      if (value === 'messages' && isMessagingEnabled) {
        dispatch({ type: 'SET_LOADING_MESSAGES', payload: true });
      }
    },
    [isMessagingEnabled],
  );

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
    <Box className="mx-4 mt-3 px-5 py-6 rounded-3xl bg-phase-surface border border-border">
      <VStack className="gap-4">
        <VStack className="gap-1">
          <Text className="text-ink/60 text-[10px] font-bold uppercase tracking-[2px]">
            {workspaceSlots.hearth ? 'Community workspace' : 'Community'}
          </Text>
          <Heading className="text-3xl text-ink font-bold">The Heart</Heading>
          <Text className="text-ink/60 leading-relaxed text-sm mt-1">
            Shared pulse, groups, and conversation. Presence leads before activity so the sanctuary
            feels alive before it feels busy.
          </Text>
        </VStack>

        <HStack className="gap-2 flex-wrap items-center">
          <HeroPill label={`${pulse.circlesActive} circles`} />
          <HeroPill label={`${pulse.newPostsToday} new posts`} />
          <HeroPill label={`${pulse.messagesOpen} conversations`} />
          {canReadAnnouncements ? <HeroPill label={`${announcementCount} announcements`} /> : null}
        </HStack>

        <Box className="pt-2">
          <HorizontalChipRow
            chips={modeChips}
            selectedValue={state.activeMode}
            onSelect={handleModeChange}
            center={false}
          />
        </Box>
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
    <Box className="mx-4 mt-4 px-5 py-5 rounded-3xl border border-border bg-phase-surface">
      <VStack className="gap-4">
        <VStack className="gap-1">
          <Heading className="text-md text-ink font-bold">Compose into the circle</Heading>
          <Text className="text-ink/60 text-sm leading-snug">
            Posting feels like contribution, not just a button.
          </Text>
        </VStack>
        <HStack className="gap-3 flex-wrap">
          <SanctuaryButton
            action="primary"
            size="sm"
            onPress={handleNewPost}
            className="bg-phase-interactive rounded-xl"
          >
            <Text className="text-white font-bold">New Post</Text>
          </SanctuaryButton>
          <SanctuaryButton
            action="secondary"
            size="sm"
            onPress={handleNewGroup}
            className="bg-phase-surface border-border rounded-xl"
          >
            <Text className="text-ink font-bold">New Group</Text>
          </SanctuaryButton>
          {sanctuaryGroups[0] && (
            <SanctuaryButton
              action="secondary"
              size="sm"
              onPress={handleOpenCircle}
              className="bg-phase-surface border-border rounded-xl"
            >
              <Text className="text-ink font-bold">Open Circle</Text>
            </SanctuaryButton>
          )}
        </HStack>
      </VStack>
    </Box>
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
        estimatedItemSize={260}
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
            {renderHearthCard()}
            {renderFilterRow()}
            {renderComposeCard()}
          </VStack>
        }
        ListEmptyComponent={
          loading ? (
            <Box className="py-12 items-center">
              <Spinner />
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
          ) : null
        }
        onEndReached={() => {
          if (hasNextPosts) {
            void fetchNextPosts();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPosts ? (
            <Box className="py-8 items-center">
              <Spinner />
            </Box>
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
        {renderHearthCard()}
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
            {state.loadingMessages ? (
              <Box className="py-12 items-center">
                <Spinner />
              </Box>
            ) : state.messageError ? (
              <BrandedErrorState
                title="Messages are resting"
                message={
                  isOffline
                    ? 'Direct messages are available when you are back online.'
                    : state.messageError
                }
              >
                <SanctuaryButton
                  action="secondary"
                  onPress={() => dispatch({ type: 'SET_ACTIVE_MODE', payload: 'messages' })}
                >
                  <Text className="text-ink font-bold">Try again</Text>
                </SanctuaryButton>
              </BrandedErrorState>
            ) : (
              <DirectMessagesListScreen />
            )}
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
    <ScreenWrapper scroll={false} noTopInset className="bg-phase-canvas">
      <Box className="flex-1">
        <GlobalHeader title="Community" />
        {isOffline ? (
          <Box className="mx-4 mt-2 rounded-xl border border-phase-warning/30 bg-phase-warning/10 px-4 py-2">
            <Text className="text-phase-warning text-xs font-semibold">
              Offline — showing what is already here. New community messages stay read-only until you reconnect.
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

function HeroPill({ label }: { label: string }) {
  return (
    <Box className="px-3 py-1.5 rounded-full bg-white/40 border border-white/20">
      <Text className="text-[10px] font-bold text-ink uppercase tracking-wide">{label}</Text>
    </Box>
  );
}

function PulseCard({ label, value }: { label: string; value: string }) {
  return (
    <Box className="flex-1 min-w-[92px] px-3 py-4 rounded-2xl bg-white/30 border border-white/20">
      <Text className="text-[9px] text-ink/40 font-bold uppercase tracking-wider">{label}</Text>
      <Heading className="mt-1 text-2xl font-bold text-ink">{value}</Heading>
    </Box>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Box className="rounded-3xl border border-border bg-phase-surface/30 overflow-hidden mb-4">
      <VStack className="gap-1 p-5">
        <Heading className="text-md text-ink font-bold">{title}</Heading>
        <Text className="text-ink/60 text-xs leading-snug">{description}</Text>
      </VStack>
      {children}
    </Box>
  );
}
