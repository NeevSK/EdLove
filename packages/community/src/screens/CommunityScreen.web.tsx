import { communityAPI } from '@repo/core/api';
import { useManifestoHooks, useNotificationHooks } from '@repo/core/api/hooks';
import { useDomainRollout, usePendingGateAction } from '@repo/core/hooks';
import { setPendingGateAction, usePermissions, useStore } from '@repo/core/logic';
import { useTemporalStore } from '@repo/core/store';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { SanctuaryFlashList } from '@repo/ui/components/SanctuaryFlashList';
import { WebScreenHeader } from '@repo/ui/components/WebScreenHeader.web';
import { Bell, Compass, Info, Plus, Shield, Users } from '@repo/ui/icons';
import { Box, Heading, Icon, Spinner, Text, VStack } from '@repo/ui/primitives';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { CommentSheet } from '@repo/community/components/CommentSheet';
import CommunityHearth from '@repo/community/components/CommunityHearth';
import CreateGroupModal from '@repo/community/components/CreateGroupModal';
import CreatePostModal from '@repo/community/components/CreatePostModal';
import { PostCard } from '@repo/community/components/PostCard';
import { useCommunity } from '@repo/community/hooks/useCommunity';
import { useCommunityGroups } from '@repo/community/hooks/useCommunityGroups';
import AnnouncementsScreen from '@repo/community/screens/AnnouncementsScreen';
import {
  type CommunityWorkspaceMode,
  deriveCommunityPulse,
  getCommunityFilterOptions,
  getCommunityModeOptions,
  getCommunityQuickPaths,
  mapCommunitySurfaceSlots,
} from '@repo/community/screens/communityWorkspace.shared';
import type { CommunityPost, DirectConversation } from '@repo/community/types';
import { directMessageRoute } from '@repo/community/navigation/communityRoutes';

type CommunityState = {
  activeMode: CommunityWorkspaceMode;
  selectedFilter: string;
  searchQuery: string;
  showCreatePost: boolean;
  showCreateGroup: boolean;
  commentPostId: string | null;
  commentPostAuthorId: string | undefined;
  commentPostType: string | undefined;
  conversations: DirectConversation[];
  loadingMessages: boolean;
  announcementCount: number;
};

type CommunityAction =
  | { type: 'SET_MODE'; mode: CommunityWorkspaceMode }
  | { type: 'SET_FILTER'; filter: string }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'TOGGLE_CREATE_POST'; show: boolean }
  | { type: 'TOGGLE_CREATE_GROUP'; show: boolean }
  | {
      type: 'OPEN_COMMENTS';
      postId: string;
      authorId?: string;
      postType?: string;
    }
  | { type: 'CLOSE_COMMENTS' }
  | { type: 'SET_CONVERSATIONS'; conversations: DirectConversation[] }
  | { type: 'SET_LOADING_MESSAGES'; loading: boolean }
  | { type: 'SET_ANNOUNCEMENT_COUNT'; count: number };

function communityReducer(state: CommunityState, action: CommunityAction): CommunityState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, activeMode: action.mode };
    case 'SET_FILTER':
      return { ...state, selectedFilter: action.filter };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    case 'TOGGLE_CREATE_POST':
      return { ...state, showCreatePost: action.show };
    case 'TOGGLE_CREATE_GROUP':
      return { ...state, showCreateGroup: action.show };
    case 'OPEN_COMMENTS':
      return {
        ...state,
        commentPostId: action.postId,
        commentPostAuthorId: action.authorId,
        commentPostType: action.postType,
      };
    case 'CLOSE_COMMENTS':
      return {
        ...state,
        commentPostId: null,
        commentPostAuthorId: undefined,
        commentPostType: undefined,
      };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.conversations };
    case 'SET_LOADING_MESSAGES':
      return { ...state, loadingMessages: action.loading };
    case 'SET_ANNOUNCEMENT_COUNT':
      return { ...state, announcementCount: action.count };
    default:
      return state;
  }
}

const initialState: CommunityState = {
  activeMode: 'feed',
  selectedFilter: 'all',
  searchQuery: '',
  showCreatePost: false,
  showCreateGroup: false,
  commentPostId: null,
  commentPostAuthorId: undefined,
  commentPostType: undefined,
  conversations: [],
  loadingMessages: false,
  announcementCount: 0,
};

export default function CommunityScreenWeb() {
  const { can } = usePermissions();
  const { user, flags } = useStore();
  const isCommunityEnabled = useDomainRollout('hearth');
  const isMessagingRolloutEnabled = useDomainRollout('messages');
  const { isSocialShieldEnabled } = flags;
  const pending = usePendingGateAction();
  const { unreadCount } = useNotificationHooks();
  const isOffline = useTemporalStore((state) => state.isOffline);

  const userId = user?.id ?? 'guest';
  const schoolId = user?.school_id ?? undefined;
  const canReadFeed = can('read', 'CommunityFeed');
  const canReadGroups = can('read', 'CommunityGroups');
  const canReadMessages = can('read', 'DirectMessages');
  const isMessagingEnabled = isMessagingRolloutEnabled && canReadMessages;
  const canCreatePost = can('create', 'Post');
  const canCreateGroup = can('create', 'Group');
  const canReadAnnouncements = Boolean(schoolId) && can('read', 'Group');

  const [state, dispatch] = useReducer(communityReducer, initialState);
  const {
    activeMode,
    selectedFilter,
    searchQuery,
    showCreatePost,
    showCreateGroup,
    commentPostId,
    commentPostAuthorId,
    commentPostType,
    conversations,
    loadingMessages,
  } = state;

  const {
    posts,
    isLoadingPosts,
    error: postsError,
    fetchPosts,
    fetchGroups,
    fetchNextPosts,
    hasNextPosts,
    isFetchingNextPosts,
  } = useCommunity(
    selectedFilter !== 'all' ? selectedFilter : undefined,
  );

  const { sanctuaryGroups, galaxyGroups } = useCommunityGroups({
    schoolId,
    searchQuery,
  });
  const { manifestos } = useManifestoHooks(schoolId, user?.id);

  const slots = useMemo(() => mapCommunitySurfaceSlots('web', userId), [userId]);
  const pulse = useMemo(
    () =>
      deriveCommunityPulse(
        posts as unknown as CommunityPost[],
        [...sanctuaryGroups, ...galaxyGroups],
        manifestos as any,
        conversations,
      ),
    [conversations, galaxyGroups, manifestos, posts, sanctuaryGroups],
  );
  const filters = useMemo(
    () => getCommunityFilterOptions([...sanctuaryGroups, ...galaxyGroups]),
    [galaxyGroups, sanctuaryGroups],
  );
  // Suppress unused warning if it's planned for future
  void filters;

  const modeOptions = useMemo(
    () => getCommunityModeOptions(canReadAnnouncements, isMessagingEnabled),
    [canReadAnnouncements, isMessagingEnabled],
  );
  const quickPaths = useMemo(
    () => getCommunityQuickPaths(canReadAnnouncements),
    [canReadAnnouncements],
  );

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return posts;
    return (posts as CommunityPost[]).filter(
      (post) =>
        post.content?.toLowerCase().includes(query) ||
        post.author_name?.toLowerCase().includes(query) ||
        post.group_name?.toLowerCase().includes(query) ||
        post.tags?.some((tag: string) => tag.toLowerCase().includes(query)),
    );
  }, [posts, searchQuery]);

  useEffect(() => {
    if (!pending.action || !isCommunityEnabled) return;
    if (pending.action.kind === 'community_open_create_group' && canCreateGroup) {
      dispatch({ type: 'TOGGLE_CREATE_GROUP', show: true });
      pending.clear().catch(() => {});
    }
  }, [canCreateGroup, pending, isCommunityEnabled]);

  useEffect(() => {
    if (!isCommunityEnabled || activeMode !== 'messages' || !canReadMessages) return;
    let cancelled = false;
    dispatch({ type: 'SET_LOADING_MESSAGES', loading: true });
    communityAPI
      .getDirectConversations()
      .then((data: any) => {
        if (!cancelled)
          dispatch({
            type: 'SET_CONVERSATIONS',
            conversations: data as DirectConversation[],
          });
      })
      .catch((error: any) => {
        console.error('[CommunityScreen.web] Failed to load direct conversations', error);
      })
      .finally(() => {
        if (!cancelled) dispatch({ type: 'SET_LOADING_MESSAGES', loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [activeMode, canReadMessages, isCommunityEnabled]);

  useEffect(() => {
    if (!isCommunityEnabled || !canReadAnnouncements || !schoolId) return;
    let cancelled = false;
    communityAPI
      .getAnnouncements(schoolId)
      .then((data: any) => {
        if (!cancelled)
          dispatch({
            type: 'SET_ANNOUNCEMENT_COUNT',
            count: (data as unknown[]).length,
          });
      })
      .catch((error: any) => {
        console.error('[CommunityScreen.web] Failed to load announcements', error);
      });
    return () => {
      cancelled = true;
    };
  }, [canReadAnnouncements, schoolId, isCommunityEnabled]);

  const openAuthFlow = useCallback(() => {
    setPendingGateAction({
      kind: 'community_open_create_group',
      createdAt: Date.now(),
    }).catch(() => {});
    router.push('/auth');
  }, []);

  const handleOpenGroup = useCallback((groupId: string, groupName?: string) => {
    router.push({
      pathname: '/community/groups/[groupId]',
      params: { groupId, groupName },
    });
  }, []);

  const renderGuestGate = (title: string, description: string) => (
    <div className="community-empty-card">
      <PositiveInvitation
        title={title}
        description={description}
        type="anonymous"
        context="community"
        actionLabel="Create account"
        onAction={openAuthFlow}
      />
    </div>
  );

  const renderPostItem = useCallback(
    ({ item: post }: { item: CommunityPost }) => (
      <PostCard
        key={post.id}
        post={post}
        currentUserId={user?.id}
        isSocialShieldEnabled={isSocialShieldEnabled}
        onPress={() => {
          if (post.group_id) handleOpenGroup(post.group_id, post.group_name ?? 'Circle');
        }}
        onLike={() => {
          if (user?.id)
            communityAPI
              .togglePostReaction(post.id, user.id)
              .catch((err: any) => console.error('[CommunityScreen.web] Like failed', err));
        }}
        onComment={() => {
          dispatch({
            type: 'OPEN_COMMENTS',
            postId: post.id,
            authorId: post.author_id ?? undefined,
            postType: post.post_type,
          });
        }}
        onAuthorPress={() => {
          if (post.author_id && !post.is_anonymous) {
            router.push({
              pathname: '/community/profile/[id]',
              params: { id: post.author_id },
            });
          }
        }}
      />
    ),
    [user, isSocialShieldEnabled, handleOpenGroup],
  );

  const renderPostStream = () => {
    if (!canReadFeed) {
      return renderGuestGate(
        'The Hearth opens with citizenship',
        "The Community Hearth is currently in 'View Only' mode for Wanderers. Create an account to join circles, share your resonance, and contribute to the collective pulse.",
      );
    }

    if (isLoadingPosts) {
      return (
        <div className="community-empty-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Spinner />
        </div>
      );
    }

    if (postsError) {
      return (
        <div className="community-empty-card">
          <h3>The feed could not settle</h3>
          <p>{isOffline ? 'You are offline. Reconnect and try again.' : postsError}</p>
          <button type="button" className="secondary-button" onClick={() => void fetchPosts()}>
            Try again
          </button>
        </div>
      );
    }

    return (
      <div style={{ flex: 1, minHeight: '500px' }}>
        <SanctuaryFlashList
          data={filteredPosts as CommunityPost[]}
          renderItem={renderPostItem}
          keyExtractor={(item: CommunityPost) => item.id}
          estimatedItemSize={240}
          onEndReached={() => {
            if (hasNextPosts && !isFetchingNextPosts) void fetchNextPosts();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPosts ? <div className="community-pagination-status">Loading older notes…</div> : null
          }
        />
      </div>
    );
  };

  const renderCircles = () => {
    if (!canReadGroups) {
      return renderGuestGate(
        'Circles are part of belonging',
        'Create an account to discover groups, join your sanctuary circles, and contribute to shared resonance.',
      );
    }

    const visibleGroups = searchQuery
      ? [...sanctuaryGroups, ...galaxyGroups].filter(
          (group) =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : [...sanctuaryGroups, ...galaxyGroups];

    return (
      <div className="community-circle-grid">
        {visibleGroups.map((group) => (
          <button
            key={group.id}
            type="button"
            className="community-circle-card"
            onClick={() => handleOpenGroup(group.id, group.name)}
          >
            <div className="community-circle-avatar">{group.name.charAt(0).toUpperCase()}</div>
            <div className="community-circle-copy">
              <strong>{group.name}</strong>
              <span>{group.description || 'Shared resonance and practical conversation.'}</span>
              <small>{group.member_count} members</small>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderMessages = () => {
    if (!canReadMessages) {
      return renderGuestGate(
        'Messages become available with citizenship',
        'Create an account to continue 1:1 conversations from within the community shell.',
      );
    }

    if (loadingMessages) {
      return (
        <div className="community-empty-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Spinner />
        </div>
      );
    }

    if (conversations.length === 0) {
      return (
        <div className="community-empty-card">
          <h3>No direct conversations yet</h3>
          <p>Messages stay close by, but they only appear once you begin a 1:1 thread.</p>
        </div>
      );
    }

    return (
      <div className="community-message-list">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            className="community-message-row"
            onClick={() => {
              router.push(directMessageRoute(conversation.id, conversation.other_user_name));
            }}
          >
            <div className="community-message-avatar">
              {conversation.other_user_name
                .split(' ')
                .map((word) => word[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="community-message-copy">
              <strong>{conversation.other_user_name}</strong>
              <span>Continue the conversation from the hearth.</span>
            </div>
            <small>{new Date(conversation.updated_at).toLocaleDateString()}</small>
          </button>
        ))}
      </div>
    );
  };

  const renderAnnouncements = () => {
    if (!canReadAnnouncements || !schoolId || !user?.id) {
      return renderGuestGate(
        'Announcements require school attachment',
        'Attach to a sanctuary and accept your invitation to receive school-wide guidance here.',
      );
    }

    return <AnnouncementsScreen schoolId={schoolId} userId={user.id} />;
  };

  const renderActiveSurface = () => {
    switch (activeMode) {
      case 'circles':
        return renderCircles();
      case 'messages':
        return renderMessages();
      case 'announcements':
        return renderAnnouncements();
      default:
        return renderPostStream();
    }
  };

  if (!isCommunityEnabled) {
    return (
      <Box className="flex-1 bg-phase-canvas">
        <WebScreenHeader title="Community" />
        <Box className="flex-1 items-center justify-center p-12">
          <VStack space="xl" className="items-center max-w-md">
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
      </Box>
    );
  }

  return (
    <div className="sanctuary-screen community-screen">
      <div className="sanctuary-container">
        <WebScreenHeader
          title="The Heart becomes the center of community."
          note="Same capabilities, wiser order: pulse first, conversation second, circles and messages close by, trust visible but quiet."
          timeText="Community workspace"
          actions={
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="premium-button"
                onClick={() =>
                  canCreatePost
                    ? dispatch({ type: 'TOGGLE_CREATE_POST', show: true })
                    : openAuthFlow()
                }
              >
                <Plus size={15} />
                New Post
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  canCreateGroup
                    ? dispatch({ type: 'TOGGLE_CREATE_GROUP', show: true })
                    : openAuthFlow()
                }
              >
                <Users size={15} />
                New Group
              </button>
              <button
                type="button"
                className="secondary-button"
                aria-label="Notifications"
                onClick={() => router.push('/notifications')}
              >
                <Bell size={15} />
                {unreadCount > 0 ? `${unreadCount}` : '0'}
              </button>
            </div>
          }
        />

        {isOffline ? (
          <div className="community-offline-banner" role="status">
            Offline — showing cached community data. New messages remain read-only until you reconnect.
          </div>
        ) : null}

        <div className="community-layout">
          <aside className="community-left-rail">
            <section className="community-rail-card">
              <span className="community-section-eyebrow">
                {slots.modes ? 'Modes' : 'Community'}
              </span>
              <div className="community-mode-stack">
                {modeOptions.map((mode) => (
                  <button
                    key={mode.key}
                    type="button"
                    className={`community-mode-button ${activeMode === mode.key ? 'active' : ''}`}
                    onClick={() => dispatch({ type: 'SET_MODE', mode: mode.key })}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="community-rail-card">
              <span className="community-section-eyebrow">
                {sanctuaryGroups.length > 0 ? 'Joined circles' : 'Discover circles'}
              </span>
              <div className="community-chip-stack">
                {(sanctuaryGroups.length > 0 ? sanctuaryGroups : galaxyGroups)
                  .slice(0, 4)
                  .map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      className={`community-chip ${selectedFilter === group.id ? 'active' : ''}`}
                      onClick={() => {
                        if (canReadFeed) {
                          dispatch({ type: 'SET_FILTER', filter: group.id });
                          dispatch({ type: 'SET_MODE', mode: 'feed' });
                          void fetchPosts(group.id);
                        } else {
                          handleOpenGroup(group.id, group.name);
                        }
                      }}
                    >
                      {group.name}
                    </button>
                  ))}
              </div>
            </section>

            <section className="community-rail-card">
              <span className="community-section-eyebrow">Trust</span>
              <p>Social shield and positive safety cues stay visible in the shell.</p>
              <div className="community-icon-row">
                <Shield size={16} />
                <span>Safety and reporting remain one step away.</span>
              </div>
            </section>

            <section className="community-rail-card">
              <span className="community-section-eyebrow">Quick path</span>
              <div className="community-quick-paths">
                {quickPaths.map((path) => (
                  <button
                    key={path.key}
                    type="button"
                    className="community-quick-path"
                    onClick={() =>
                      dispatch({
                        type: 'SET_MODE',
                        mode: path.key as CommunityWorkspaceMode,
                      })
                    }
                  >
                    <strong>{path.title}</strong>
                    <span>{path.description}</span>
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <main className="community-center-column">
            <section className="community-hearth-card" aria-label="Community hearth">
              <CommunityHearth manifestos={manifestos as any} userId={userId} />
            </section>

            <section className="community-search-row">
              <div className="community-search-shell">
                <Compass size={16} />
                <input
                  value={searchQuery}
                  onChange={(event) => dispatch({ type: 'SET_SEARCH', query: event.target.value })}
                  placeholder="Search posts, circles, members, announcements..."
                  aria-label="Search community"
                />
              </div>
            </section>

            <section className="community-main-stream">{renderActiveSurface()}</section>
          </main>

          <aside className="community-right-rail">
            <section className="community-rail-card">
              <span className="community-section-eyebrow">Context</span>
              <p>
                Your personal community dashboard provides a tailored view of what matters most
                right now.
              </p>
            </section>
            <section className="community-rail-card">
              <span className="community-section-eyebrow">Hearth Pulse</span>
              <div className="community-stat-list">
                <div className="community-stat-item">
                  <strong>{pulse.membersSeen}</strong>
                  <span>Active today</span>
                </div>
                <div className="community-stat-item">
                  <strong>{pulse.circlesActive}</strong>
                  <span>Active circles</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => dispatch({ type: 'TOGGLE_CREATE_POST', show: false })}
        onSuccess={() => void fetchPosts()}
      />

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => dispatch({ type: 'TOGGLE_CREATE_GROUP', show: false })}
        onSuccess={() => void fetchGroups()}
      />

      <CommentSheet
        postId={commentPostId}
        postAuthorId={commentPostAuthorId}
        postType={commentPostType}
        onClose={() => dispatch({ type: 'CLOSE_COMMENTS' })}
      />

      <style>{`
                .community-screen {
                    background: var(--phase-canvas);
                    min-height: 100vh;
                    padding-bottom: 80px;
                }

                .community-layout {
                    display: grid;
                    grid-template-columns: 240px 1fr 300px;
                    gap: 32px;
                    margin-top: 32px;
                }

                .community-rail-card {
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }

                .community-section-eyebrow {
                    display: block;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--ink-light);
                    margin-bottom: 16px;
                }

                .community-main-stream {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    min-height: 100vh;
                }

                .community-mode-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .community-mode-button {
                    text-align: left;
                    padding: 12px 16px;
                    border-radius: 12px;
                    font-weight: 600;
                    color: var(--ink);
                    transition: all 0.2s;
                    background: transparent;
                    border: none;
                }

                .community-mode-button.active {
                    background: var(--phase-interactive-light);
                    color: var(--phase-interactive);
                }

                .community-chip-stack {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .community-chip {
                    padding: 8px 16px;
                    background: var(--phase-canvas);
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    border: 1px solid var(--border);
                    cursor: pointer;
                }

                .community-chip.active {
                    background: var(--ink);
                    color: white;
                    border-color: var(--ink);
                }

                .community-hearth-card {
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 32px;
                    padding: 40px;
                    margin-bottom: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .community-hearth-copy {
                    display: grid;
                    grid-template-columns: 1fr 240px;
                    gap: 40px;
                }

                .community-hearth-copy h2 {
                    font-size: 32px;
                    font-weight: 800;
                    line-height: 1.1;
                    margin-bottom: 16px;
                }

                .community-pulse-box {
                    background: var(--phase-canvas);
                    border-radius: 24px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .community-search-row {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 16px;
                    margin-bottom: 32px;
                    align-items: center;
                }

                .community-search-shell {
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 0 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    height: 56px;
                }

                .community-search-shell input {
                    border: none;
                    flex: 1;
                    font-size: 16px;
                    outline: none;
                    background: transparent;
                }

                .community-mode-inline {
                    display: none;
                }

                .community-offline-banner {
                    margin-top: 16px;
                    padding: 10px 14px;
                    border: 1px solid var(--phase-warning);
                    border-radius: 12px;
                    color: var(--phase-warning);
                    background: var(--phase-warning-light);
                    font-size: 13px;
                }

                .community-pagination-status {
                    padding: 16px;
                    text-align: center;
                    color: var(--ink-light);
                    font-size: 13px;
                }

                .community-inline-chip {
                    padding: 8px 20px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 600;
                    background: white;
                    border: 1px solid var(--border);
                    cursor: pointer;
                }

                .community-inline-chip.active {
                    background: var(--phase-interactive);
                    color: white;
                    border-color: var(--phase-interactive);
                }

                .community-empty-card {
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 32px;
                    padding: 60px 40px;
                    text-align: center;
                }

                .community-circle-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }

                .community-circle-card {
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 24px;
                    display: flex;
                    gap: 16px;
                    text-align: left;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .community-circle-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.05);
                }

                .community-circle-avatar {
                    width: 48px;
                    height: 48px;
                    background: var(--phase-interactive-light);
                    color: var(--phase-interactive);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: 800;
                    flex-shrink: 0;
                }

                .community-circle-copy {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .community-circle-copy strong {
                    font-size: 16px;
                }

                .community-circle-copy span {
                    font-size: 13px;
                    color: var(--ink-light);
                    line-height: 1.4;
                }

                .community-stat-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .community-stat-item {
                    display: flex;
                    flex-direction: column;
                }

                .community-stat-item strong {
                    font-size: 24px;
                    font-weight: 800;
                }

                .community-stat-item span {
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--ink-light);
                }

                @media (max-width: 1200px) {
                    .community-layout {
                        grid-template-columns: 200px 1fr;
                    }
                    .community-right-rail {
                        display: none;
                    }
                }

                @media (max-width: 900px) {
                    .community-layout {
                        grid-template-columns: 1fr;
                    }
                    .community-left-rail {
                        display: none;
                    }
                }
            `}</style>
    </div>
  );
}
