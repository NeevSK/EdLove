import { useNavigation } from '@react-navigation/native';
import {
  communityAPI,
  setPendingGateAction,
  usePendingGateAction,
  usePermissions,
  useStore,
} from '@repo/core';
import {
  Box,
  Heading,
  Icon,
  PositiveInvitation,
  Spinner,
  Text,
  VStack,
  WebScreenHeader,
} from '@repo/ui';
import { Bell, Compass, Info, Plus, Shield, Users2 } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { CommentSheet } from '../components/CommentSheet';
import CommunityHearth from '../components/CommunityHearth';
import CreateGroupModal from '../components/CreateGroupModal';
import CreatePostModal from '../components/CreatePostModal';
import PostCard from '../components/PostCard';
import { useCommunity } from '../hooks/useCommunity';
import { useCommunityGroups } from '../hooks/useCommunityGroups';
import { useManifestos } from '../hooks/useManifestos';
import { useNotifications } from '../hooks/useNotifications';
import type { AnnouncementWithAuthor, DirectConversation } from '../types';
import AnnouncementsScreen from './AnnouncementsScreen';
import {
  type CommunityWorkspaceMode,
  deriveCommunityPulse,
  getCommunityFilterOptions,
  getCommunityModeOptions,
  getCommunityQuickPaths,
  mapCommunitySurfaceSlots,
} from './communityWorkspace.shared';

export default function CommunityScreenWeb() {
  const navigation = useNavigation<any>();
  const { can } = usePermissions();
  const { user, flags } = useStore();
  const { isCommunityEnabled, isMessagingEnabled, isSocialShieldEnabled } = flags;
  const pending = usePendingGateAction();
  const { unreadCount } = useNotifications();

  const userId = user?.id ?? 'guest';
  const schoolId = user?.school_id ?? undefined;
  const userAuthority = (user?.authority as any) ?? 'student';

  const canReadFeed = can('read', 'CommunityFeed');
  const canReadGroups = can('read', 'CommunityGroups');
  const canReadMessages = can('read', 'DirectMessages');
  const canCreatePost = can('create', 'Post');
  const canCreateGroup = can('create', 'Group');
  const canReadAnnouncements = Boolean(schoolId) && can('read', 'Group');

  const [activeMode, setActiveMode] = useState<CommunityWorkspaceMode>('feed');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentPostAuthorId, setCommentPostAuthorId] = useState<string | undefined>(undefined);
  const [commentPostType, setCommentPostType] = useState<string | undefined>(undefined);
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [announcementCount, setAnnouncementCount] = useState(0);

  const { posts, isLoadingPosts, fetchPosts, fetchGroups } = useCommunity(
    selectedFilter !== 'all' ? selectedFilter : undefined,
  );

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

  const { sanctuaryGroups, galaxyGroups } = useCommunityGroups({ schoolId, searchQuery });
  const { manifestos } = useManifestos(schoolId, user?.id);

  const slots = useMemo(() => mapCommunitySurfaceSlots('web', userId), [userId]);
  const pulse = useMemo(
    () =>
      deriveCommunityPulse(posts, [...sanctuaryGroups, ...galaxyGroups], manifestos, conversations),
    [conversations, galaxyGroups, manifestos, posts, sanctuaryGroups],
  );
  const filters = useMemo(
    () => getCommunityFilterOptions([...sanctuaryGroups, ...galaxyGroups]),
    [galaxyGroups, sanctuaryGroups],
  );
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
    return posts.filter(
      (post) =>
        post.content?.toLowerCase().includes(query) ||
        post.author_name?.toLowerCase().includes(query) ||
        post.group_name?.toLowerCase().includes(query) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [posts, searchQuery]);

  useEffect(() => {
    if (!pending.action) return;
    if (pending.action.kind === 'community_open_create_group' && canCreateGroup) {
      setShowCreateGroup(true);
      pending.clear().catch(() => {});
    }
  }, [canCreateGroup, pending]);

  useEffect(() => {
    if (activeMode !== 'messages' || !canReadMessages) return;
    let cancelled = false;
    setLoadingMessages(true);
    communityAPI
      .getDirectConversations()
      .then((data) => {
        if (!cancelled) setConversations(data as DirectConversation[]);
      })
      .catch((error) => {
        console.error('[CommunityScreen.web] Failed to load direct conversations', error);
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeMode, canReadMessages]);

  useEffect(() => {
    if (!canReadAnnouncements || !schoolId) return;
    let cancelled = false;
    communityAPI
      .getAnnouncements(schoolId)
      .then((data) => {
        if (!cancelled) setAnnouncementCount((data as AnnouncementWithAuthor[]).length);
      })
      .catch((error) => {
        console.error('[CommunityScreen.web] Failed to load announcements', error);
      });
    return () => {
      cancelled = true;
    };
  }, [canReadAnnouncements, schoolId]);

  const openAuthFlow = () => {
    setPendingGateAction({ kind: 'community_open_create_group', createdAt: Date.now() }).catch(
      () => {},
    );
    navigation.navigate('Auth');
  };

  const handleOpenGroup = (groupId: string, groupName?: string) => {
    navigation.navigate('GroupDetails', { groupId, groupName });
  };

  const renderGuestGate = (title: string, description: string) => (
    <div className="community-empty-card">
      <PositiveInvitation
        title={title}
        description={description}
        type="guest"
        context="community"
        actionLabel="Create account"
        onAction={openAuthFlow}
      />
    </div>
  );

  const renderPostStream = () => {
    if (!canReadFeed) {
      return renderGuestGate(
        'The hearth opens with citizenship',
        'Create an account to join circles, post with intention, and let your community feed emerge.',
      );
    }

    if (isLoadingPosts) {
      return (
        <div className="community-empty-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Spinner />
        </div>
      );
    }

    if (filteredPosts.length === 0) {
      return (
        <div className="community-empty-card">
          <h3>Start the next note</h3>
          <p>Your circles are ready for a first post, question, or shared resource.</p>
          <button
            className="premium-button"
            onClick={() => (canCreatePost ? setShowCreatePost(true) : openAuthFlow())}
          >
            {canCreatePost ? 'New Post' : 'Create account'}
          </button>
        </div>
      );
    }

    return filteredPosts.map((post) => (
      <PostCard
        key={post.id}
        post={post}
        currentUserId={user?.id}
        isSocialShieldEnabled={isSocialShieldEnabled}
        onPress={() => {
          if (post.group_id) handleOpenGroup(post.group_id, post.group_name ?? 'Circle');
        }}
        onLike={() => {
          if (user?.id) communityAPI.togglePostReaction(post.id, user.id).catch(console.error);
        }}
        onComment={() => {
          setCommentPostId(post.id);
          setCommentPostAuthorId(post.author_id ?? undefined);
          setCommentPostType(post.post_type);
        }}
        onAuthorPress={() => {
          if (post.author_id && !post.is_anonymous && navigation?.navigate) {
            navigation.navigate('PublicProfile', {
              id: post.author_id,
              type: 'user',
            });
          }
        }}
      />
    ));
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
            className="community-message-row"
            onClick={() => {
              navigation.navigate('DirectMessage', {
                conversationId: conversation.id,
                userName: conversation.other_user_name,
              });
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

    return (
      <AnnouncementsScreen schoolId={schoolId} userId={user.id} userAuthority={userAuthority} />
    );
  };

  const renderActiveSurface = () => {
    switch (activeMode) {
      case 'circles':
        return renderCircles();
      case 'messages':
        return renderMessages();
      case 'announcements':
        return renderAnnouncements();
      case 'feed':
      default:
        return renderPostStream();
    }
  };

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
                className="premium-button"
                onClick={() => (canCreatePost ? setShowCreatePost(true) : openAuthFlow())}
              >
                <Plus size={15} />
                New Post
              </button>
              <button
                className="secondary-button"
                onClick={() => (canCreateGroup ? setShowCreateGroup(true) : openAuthFlow())}
              >
                <Users2 size={15} />
                New Group
              </button>
              <button className="secondary-button" aria-label="Notifications">
                <Bell size={15} />
                {unreadCount > 0 ? `${unreadCount}` : '0'}
              </button>
            </div>
          }
        />

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
                    className={`community-mode-button ${activeMode === mode.key ? 'active' : ''}`}
                    onClick={() => setActiveMode(mode.key)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="community-rail-card">
              <span className="community-section-eyebrow">Joined circles</span>
              <div className="community-chip-stack">
                {sanctuaryGroups.slice(0, 4).map((group) => (
                  <button
                    key={group.id}
                    className={`community-chip ${selectedFilter === group.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFilter(group.id);
                      setActiveMode('feed');
                      fetchPosts(group.id);
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
                    className="community-quick-path"
                    onClick={() => setActiveMode(path.key as CommunityWorkspaceMode)}
                  >
                    <strong>{path.title}</strong>
                    <span>{path.description}</span>
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <main className="community-center-column">
            <section className="community-hearth-card">
              <div className="community-hearth-copy">
                <div>
                  <span className="community-section-eyebrow">The Community Hearth</span>
                  <h2>Presence, welcome, manifestos, and spotlight belong together.</h2>
                  <p>
                    The school should feel emotionally alive before it feels operational. That is
                    why the hearth remains first.
                  </p>
                </div>

                <div className="community-pulse-box">
                  <span className="community-section-eyebrow">Community pulse</span>
                  <strong>{pulse.membersSeen} school members seen this cycle</strong>
                  <span>{pulse.circlesActive} circles active</span>
                  <span>{pulse.newPostsToday} new posts today</span>
                </div>
              </div>
              <CommunityHearth manifestos={manifestos} userId={userId} />
            </section>

            <section className="community-search-row">
              <div className="community-search-shell">
                <Compass size={16} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search posts, circles, members, announcements..."
                  aria-label="Search community"
                />
              </div>
              <div className="community-mode-inline">
                {modeOptions.map((mode) => (
                  <button
                    key={mode.key}
                    className={`community-inline-chip ${activeMode === mode.key ? 'active' : ''}`}
                    onClick={() => setActiveMode(mode.key)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </section>

            {(activeMode === 'feed' || activeMode === 'circles') && (
              <section className="community-compose-card">
                <div>
                  <span className="community-section-eyebrow">Compose into the right circle</span>
                  <h3>Contribution before utility.</h3>
                  <p>
                    New Post and New Group stay visible, but composition is framed as contribution
                    to shared resonance rather than just pressing a tool button.
                  </p>
                </div>
                <div className="community-action-row">
                  <button
                    className="premium-button"
                    onClick={() => (canCreatePost ? setShowCreatePost(true) : openAuthFlow())}
                  >
                    New Post
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => (canCreateGroup ? setShowCreateGroup(true) : openAuthFlow())}
                  >
                    New Group
                  </button>
                  {sanctuaryGroups[0] && (
                    <button
                      className="secondary-button"
                      onClick={() => {
                        const mainGroup = sanctuaryGroups[0];
                        if (mainGroup) {
                          handleOpenGroup(mainGroup.id, mainGroup.name);
                        }
                      }}
                    >
                      Open Circle
                    </button>
                  )}
                </div>
                <div className="community-filter-row">
                  {filters.map((filter) => (
                    <button
                      key={filter.value}
                      className={`community-inline-chip ${selectedFilter === filter.value ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedFilter(filter.value);
                        fetchPosts(filter.value === 'all' ? undefined : filter.value);
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="community-main-stream">{renderActiveSurface()}</section>
          </main>

          <aside className="community-right-rail">
            <section className="community-rail-card">
              <span className="community-section-eyebrow">Context</span>
            </section>
            <section className="community-rail-card">
              <strong>Community pulse</strong>
              <p>Live presence and school energy remain visible without stealing the page.</p>
            </section>
            <section className="community-rail-card">
              <strong>Joined circles</strong>
              <p>Fast routes into the groups you already belong to.</p>
            </section>
            <section className="community-rail-card">
              <strong>Trust + safety</strong>
              <p>Shielding, reporting, and guest/citizen gating stay easy to reach.</p>
            </section>
            <section className="community-rail-card">
              <strong>Messages</strong>
              <p>Direct conversations remain one step away from the hearth.</p>
            </section>
          </aside>
        </div>
      </div>

      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => {
          setShowCreatePost(false);
          fetchPosts(selectedFilter === 'all' ? undefined : selectedFilter);
        }}
        groupId={selectedFilter !== 'all' ? selectedFilter : undefined}
      />

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => {
          setShowCreateGroup(false);
          fetchGroups?.();
        }}
      />

      <CommentSheet
        postId={commentPostId}
        postAuthorId={commentPostAuthorId}
        currentUserId={user?.id}
        postType={commentPostType}
        onClose={() => setCommentPostId(null)}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
                .community-screen .sanctuary-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .community-layout {
                    display: grid;
                    grid-template-columns: 218px minmax(0, 812px) 290px;
                    gap: 24px;
                    align-items: start;
                }
                .community-left-rail,
                .community-right-rail,
                .community-center-column {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .community-rail-card,
                .community-hearth-card,
                .community-compose-card,
                .community-empty-card {
                    border-radius: 24px;
                    border: 1px solid rgba(42, 35, 24, 0.08);
                    background: linear-gradient(180deg, rgba(252, 247, 238, 0.98) 0%, rgba(248, 242, 232, 0.98) 100%);
                    padding: 20px;
                }
                .community-hearth-card {
                    padding: 28px;
                }
                .community-hearth-copy {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 300px;
                    gap: 20px;
                    margin-bottom: 18px;
                }
                .community-hearth-copy h2,
                .community-compose-card h3,
                .community-empty-card h3 {
                    margin: 8px 0;
                    font-size: 24px;
                    line-height: 1.2;
                    color: #2d2418;
                }
                .community-hearth-copy p,
                .community-compose-card p,
                .community-empty-card p,
                .community-rail-card p {
                    margin: 0;
                    color: rgba(45, 36, 24, 0.72);
                    line-height: 1.6;
                }
                .community-section-eyebrow {
                    display: inline-block;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: rgba(45, 36, 24, 0.58);
                    margin-bottom: 10px;
                }
                .community-mode-stack,
                .community-chip-stack,
                .community-quick-paths,
                .community-mode-inline,
                .community-action-row,
                .community-filter-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .community-mode-button,
                .community-inline-chip,
                .community-chip {
                    border: 1px solid rgba(42, 35, 24, 0.08);
                    background: rgba(255, 255, 255, 0.8);
                    color: #4d4030;
                    border-radius: 999px;
                    padding: 10px 14px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .community-mode-button.active,
                .community-inline-chip.active,
                .community-chip.active {
                    background: rgba(182, 224, 205, 0.45);
                    color: #22594b;
                }
                .community-pulse-box {
                    border-radius: 22px;
                    background: rgba(227, 232, 255, 0.65);
                    padding: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    color: #2d2418;
                }
                .community-search-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 14px;
                    align-items: center;
                }
                .community-search-shell {
                    flex: 1;
                    min-width: 280px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border: 1px solid rgba(42, 35, 24, 0.08);
                    background: rgba(255, 255, 255, 0.78);
                    border-radius: 999px;
                    padding: 12px 16px;
                }
                .community-search-shell input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #2d2418;
                    font-size: 14px;
                }
                .community-main-stream {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                .community-circle-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 14px;
                }
                .community-circle-card {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    width: 100%;
                    text-align: left;
                    border: 1px solid rgba(42, 35, 24, 0.08);
                    background: rgba(255, 255, 255, 0.84);
                    border-radius: 20px;
                    padding: 16px;
                    cursor: pointer;
                }
                .community-circle-avatar,
                .community-message-avatar {
                    width: 46px;
                    height: 46px;
                    border-radius: 999px;
                    background: rgba(182, 224, 205, 0.55);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: #22594b;
                    flex-shrink: 0;
                }
                .community-circle-copy,
                .community-message-copy {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 0;
                }
                .community-circle-copy span,
                .community-message-copy span,
                .community-circle-copy small {
                    color: rgba(45, 36, 24, 0.68);
                    line-height: 1.4;
                }
                .community-message-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .community-message-row,
                .community-quick-path {
                    border: 1px solid rgba(42, 35, 24, 0.08);
                    background: rgba(255, 255, 255, 0.82);
                    border-radius: 18px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    cursor: pointer;
                    text-align: left;
                    width: 100%;
                }
                .community-quick-path {
                    flex-direction: column;
                    align-items: flex-start;
                }
                .community-message-row small {
                    margin-left: auto;
                    color: rgba(45, 36, 24, 0.58);
                }
                .community-icon-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: rgba(45, 36, 24, 0.72);
                    margin-top: 12px;
                }
                @media (max-width: 1260px) {
                    .community-layout {
                        grid-template-columns: 218px minmax(0, 1fr);
                    }
                    .community-right-rail {
                        display: none;
                    }
                }
                @media (max-width: 920px) {
                    .community-layout {
                        grid-template-columns: 1fr;
                    }
                    .community-left-rail {
                        order: 2;
                    }
                    .community-hearth-copy {
                        grid-template-columns: 1fr;
                    }
                }
            `,
        }}
      />
    </div>
  );
}
