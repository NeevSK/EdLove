import React, { useState, useEffect } from 'react';
import {
    useTheme,
    PositiveInvitation,
    LotusPetalFAB,
    Theme,
    useThemedColors,
    WebScreenHeader,
    Avatar,
    AvatarFallbackText,
    AvatarImage,
    HStack,
    VStack,
    Text,
    Box,
    SanctuaryFlashList,
} from '@repo/ui';
import { 
    usePendingGateAction, 
    useStore, 
    setPendingGateAction,
    communityAPI,
    usePermissions 
} from '@repo/core';
import { useCommunity } from '../hooks/useCommunity';
import { useCommunityGroups } from '../hooks/useCommunityGroups';
import { useManifestos } from '../hooks/useManifestos';
import { useNotifications } from '../hooks/useNotifications';
import CommunityHearth from '../components/CommunityHearth';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import CreateGroupModal from '../components/CreateGroupModal';
import { CommentSheet } from '../components/CommentSheet';

import { CommunityPresence } from '@repo/self';
import {
    Hash,
    MessageSquare,
    Trophy,
    Compass,
    Activity,
    Users2,
    Heart,
    Flame,
    Plus,
    PenLine,
    ArrowRight,
    Globe,
    Lock,
    Bell,
} from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';
// Replaced relative path import with a generic fallback or prop-injected component if needed
// For now, I'll assume standard components or placeholders for internal app-only parts
// import { StackFallback } from '../components/web/WebScreenShimmer'; 
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';

// Simple fallback for StackFallback if not available in repo/ui
const StackFallback = ({ variant }: { variant?: string }) => (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}        {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '100px', backgroundColor: 'var(--background-alt)', borderRadius: '12px', opacity: 0.5 }} /        >))}
    </div);

type CommunityTab = 'feed' | 'groups' | 'dms';
type GroupsSubTab = 'joined' | 'global';

export default function CommunityScreenWeb() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { context, can } = usePermissions();
    const { user } = useStore();
    const pending = usePendingGateAction();

    const [activeTab, setActiveTab] = useState<CommunityTab>('feed');
    const [groupsSubTab, setGroupsSubTab] = useState<GroupsSubTab>('joined');
    const [selectedGroupId, setSelectedGroupId] = useState<string | 'all' | 'my' | 'pulse'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);

    // Comment sheet state
    const [commentPostId, setCommentPostId] = useState<string | null>(null);
    const [commentPostAuthorId, setCommentPostAuthorId] = useState<string | undefined>();
    const [commentPostType, setCommentPostType] = useState<string | undefined>();

    // Notification badge
    const { unreadCount: notifCount } = useNotifications();

    // DM Logic
    const [conversations, setConversations] = useState<any[]>([]);
    const [loadingDMs, setLoadingDMs] = useState(false);

    // Real data wiring
    const { posts, isLoadingPosts, fetchPosts } = useCommunity(
        selectedGroupId === 'all' || selectedGroupId === 'my' || selectedGroupId === 'pulse'
            ? undefined
            : selectedGroupId
    );
    const {
        sanctuaryGroups: joinedGroups,
        galaxyGroups: discoverGroups,
        loading: isLoadingGroups,
        fetchGroups
    } = useCommunityGroups({ 
        schoolId: user?.school_id,
        searchQuery: searchQuery,
        isPublicOnly: groupsSubTab === 'global' && !searchQuery
    });

    const { manifestos } = useManifestos(user?.school_id, user?.id);

    const isEcosystemRole = can('manage', 'Ecosystem');
    const colors = useThemedColors();

    // Fetch DMs when activeTab is 'dms'
    useEffect(() => {
        if (activeTab === 'dms' && can('create', 'DirectMessage')) {
            setLoadingDMs(true);
            communityAPI.getDirectConversations()
                .then(data => setConversations(data as any[]))
                .catch(console.error)
                .finally(() => setLoadingDMs(false));
        } else if (activeTab === 'dms' && !can('create', 'DirectMessage')) {
            setConversations([]);
        }
    }, [activeTab, can]);

    // Resume-after-upgrade: open Create Group modal if it was the gated action.
    useEffect(() => {
        if (!pending.action) return;
        if (pending.action.kind !== 'community_open_create_group') return;
        if (!can('create', 'CommunityGroup')) return;
        setShowCreateGroup(true);
        pending.clear().catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pending.action, can]);

    // Feed should be group-bounded
    useEffect(() => {
        if (activeTab !== 'feed') return;
        if (!can('read', 'CommunityFeed')) return;
        if (selectedGroupId !== 'all' && selectedGroupId !== 'my' && selectedGroupId !== 'pulse') return;
        const firstJoined = joinedGroups?.[0]?.id;
        if (firstJoined) setSelectedGroupId(firstJoined);
    }, [activeTab, can, joinedGroups, selectedGroupId]);

    // Client-side search filter  runs over fetched posts and groups
    const q = searchQuery.toLowerCase().trim();
    const filteredPosts = q
        ? (posts || []).filter(p =            p.content?.toLowerCase().includes(q) ||
            p.author_name?.toLowerCase().includes(q) ||
            p.subject?.toLowerCase().includes(q) ||
            (p.tags || []).some((tag: string) => tag.toLowerCase().includes(q))
          )
        : posts;

    const allGroups = [...(joinedGroups || []), ...(discoverGroups || [])];
    const filteredGroups = q
        ? allGroups.filter(g =            g.name?.toLowerCase().includes(q) ||
            g.description?.toLowerCase().includes(q)
          )
        : null; // null = not in search mode, show normal group sidebar

    return (
        <div className="sanctuary-screen"            <div className="sanctuary-container"                {/* 1. GREETING */}>
                    <WebScreenHeader>
                        title={t('community.title') || "The Heart"}
                        note={t('community.subtitle') || "Ecosystem Resonance"}
                        timeText={isEcosystemRole ? "Architect's Stream" : "Global Resonance"}
                    actions={(can('create', 'CommunityPost') || can('create', 'CommunityGroup')) ? (>
                        <                            <button
                                className="premium-button"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                                onClick={() => {
                                    if (!can('create', 'CommunityPost')) {
                                        setPendingGateAction({ kind: 'community_open_create_group', createdAt: Date.now() }).catch(() => { });
                                        navigation.navigate('Auth');
                                        return;
                                    }
                                    setShowCreatePost(true);
                                }}
                                                            <PenLine size={15} /                                >{t('community.actions.newPost') || "New Post"}
                            </button                            ><button
                                className="secondary-button"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                                onClick={() => {
                                    if (!can('create', 'CommunityGroup')) {
                                        setPendingGateAction({ kind: 'community_open_create_group', createdAt: Date.now() }).catch(() => { });
                                        navigation.navigate('Auth');
                                        return;
                                    }
                                    setShowCreateGroup(true);
                                }}
                                                            <Plus size={15} /                                >{t('community.actions.newGroup') || "New Group"}
                            </button                            >{/* Notification bell with unread badge */}
                            <div style={{ position: 'relative', display: 'inline-flex' }}                                <button>
                                    className="secondary-button"
                                    style={{ display: 'inline-flex', alignItems: 'center', padding: '8px' }}
                                    title="Notifications"
                                    onClick={() => {/* TODO: open notifications panel */}}
                                                                    <Bell size={17} /                                ></button                                >{notifCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        minWidth: '16px',
                                        height: '16px',
                                        borderRadius: '8px',
                                        backgroundColor: 'var(--error)',
                                        color: 'var(--text-on-danger)',
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 3px',
                                        lineHeight: 1,
                                    }}                                        {notifCount > 99 ? '99+' : notifCount}
                                    </span                                )}
                            </div                        </                    ) : undefined}
                /
                {/* 2. COMMUNITY GRID */}
                <div className="community-grid">
                    {/* LEFT: Sanctuary Explorer */}
                    <aside className="community-sidebar"                        <nav className="sidebar-nav" style={{ gap: '8px' }}                            <SidebarItem>
                                icon={<Compass size={18} />}
                                label={t('community.tabs.feed') || "Feed"}
                                active={activeTab === 'feed'}
                                onClick={() => setActiveTab('feed')}
                            /                            ><SidebarItem
                                icon={<Users2 size={18} />}
                                label={t('community.tabs.groups') || "Groups"}
                                active={activeTab === 'groups'}
                                onClick={() => setActiveTab('groups')}
                            /                            ><SidebarItem
                                icon={<MessageSquare size={18} />}
                                label={t('community.tabs.dms') || "Messages"}
                                active={activeTab === 'dms'}
                                onClick={() => setActiveTab('dms')}
                            /                        ></nav
                        >{activeTab === 'feed' && (
                            <                                <div className="sidebar-divider" style={{ margin: '20px 16px 12px 16px', opacity: 0.1, backgroundColor: 'var(--ink)' }} /                                ><div style={{ padding: '0 16px' }}                                    <div className="sidebar-group-label" style={{ marginBottom: '12px', opacity: 0.6 }}>{t('community.filters.title') || "Filters"}</div                                    ><SidebarItem
                                        icon={<Activity size={16} />}
                                        label={t('community.filters.allUpdates') || "All Updates"}
                                        active={selectedGroupId === 'all'}
                                        onClick={() => setSelectedGroupId('all')}
                                    /                                    ><SidebarItem
                                        icon={<Heart size={16} />}
                                        label={t('community.filters.joined') || "Joined"}
                                        active={selectedGroupId === 'pulse'}
                                        onClick={() => setSelectedGroupId('pulse')}
                                    /                                ></div                            ></                        )}

                        {activeTab === 'groups' && (
                            <                                <div className="sidebar-divider" style={{ margin: '20px 16px 12px 16px', opacity: 0.1, backgroundColor: 'var(--ink)' }} /                                ><div style={{ padding: '0 16px' }}                                    <div className="sidebar-group-label" style={{ marginBottom: '12px', opacity: 0.6 }}>{t('community.groups.myGroups') || "My Sanctuary"}</div                                    ><div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}                                        {joinedGroups?.map((g) => (
                                            <button>
                                                key={g.id}
                                                className={`sidebar-item ${selectedGroupId === g.id ? 'active' : ''}`}
                                                style={{ padding: '8px 12px' }}
                                                onClick={() => { setSelectedGroupId(g.id); }}
                                                                                            <span className="sidebar-icon"                                                    <Hash size={14} /                                                ></span                                                ><span className="sidebar-label" style={{ fontWeight: '400' }}>{g.name}</span                                            ></button                                        ))}
                                    </div                                </div                            </                        )}
                    </aside>
                    {/* CENTER: Main Feed / Groups / DMs */}
                    <div className="community-feed"                        {/*  Responsive Upper Bar (Hidden on Desktop via CSS)  */}>
                        <div className="community-sub-nav"                            <button>
                                className={`sub-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
                                onClick={() => setActiveTab('feed')}
                                                            <Compass size={16} /                                ><span>{t('community.tabs.feed') || "Feed"}</span                            ></button                            ><button
                                className={`sub-nav-item ${activeTab === 'groups' ? 'active' : ''}`}
                                onClick={() => setActiveTab('groups')}
                                                            <Users2 size={16} /                                ><span>{t('community.tabs.groups') || "Groups"}</span                            ></button                            <button
                                className={`sub-nav-item ${activeTab === 'dms' ? 'active' : ''}`}
                                onClick={() => setActiveTab('dms')}
                                                            <MessageSquare size={16} /                                ><span>{t('community.tabs.dms') || "DMs"}</span                            ></button                        </div
                        {/* Search bar (Persistent across Feed and Groups) */}
                        {activeTab !== 'dms' && (
                            <div className="sanctuary-search-shell" style={{ marginBottom: '16px' }}                                <Compass size={16} color="var(--ink-ghost)" /                                ><input
                                    placeholder={t('community.search.placeholder') || 'Search posts, groups, members&'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label="Search community"
                                /                                >{searchQuery && (
                                    <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-ghost)', fontSize: '16px', lineHeight: 1 }} aria-label="Clear search"></button                                >)}
                            </div                        )}

                        {activeTab === 'feed' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}                                {!can('read', 'CommunityFeed') ? (>
                                    <div className="sanctuary-card" style={{ padding: '28px' }}                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}                                            The Feed is born from Groups>
                                        </h3                                        ><p style={{ marginTop: 8, marginBottom: 16, color: 'var(--ink-ghost)' }}                                            As a wanderer, you can discover groups and explore the ecosystem. Upgrade your account to join circles and let your feed emerge.
                                        </p                                        <PositiveInvitation
                                            title="Become a Citizen"
                                            description="Create an account to join groups, post, and build resonance."
                                            type="guest"
                                            context="community"
                                            actionLabel="Create account"
                                            onAction={() => navigation.navigate('Auth')}
                                        /                                        ><div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}                                            <button
                                                className="secondary-button"
                                                onClick={() => setActiveTab('groups')}
                                                                                            Explore groups
                                            </button                                        </div                                    </div                                ) : (!joinedGroups || joinedGroups.length === 0) ? (
                                    <div className="sanctuary-card" style={{ padding: '28px' }}                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}                                            Your feed will appear after you join a group>
                                        </h3                                        ><p style={{ marginTop: 8, marginBottom: 16, color: 'var(--ink-ghost)' }}                                            Posts live inside circles. Discover a group first, then your feed becomes meaningful.>
                                        </p                                        ><button
                                            className="premium-button"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                            onClick={() => setActiveTab('groups')}
                                                                                    Explore Groups <ArrowRight size={16} /                                        ></button                                    </div                                ) : isLoadingPosts ? (
                                    <StackFallback variant="cards" /                                >) : (() => {
                                    const isConcreteGroup = selectedGroupId !== 'all' && selectedGroupId !== 'my' && selectedGroupId !== 'pulse';
                                    const visiblePosts = isConcreteGroup
                                        ? (filteredPosts || []).filter(p => p.group_id === selectedGroupId)
                                        : [];
                                    if (visiblePosts.length === 0) {
                                        return (
                                            <div style={{ padding: '80px 40px', textAlign: 'center' }}                                                <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic' }}                                                    {q ? `No posts match "${searchQuery}"` : t('community.empty.title')}>
                                                </p                                            ></div                                        );>
                                    }
                                    return visiblePosts.map((post) => (
                                        <PostCard>
                                            key={post.id}
                                            post={post}
                                            currentUserId={user?.id}
                                            onPress={() => {
                                                if (post.group_id) {
                                                    navigation.navigate('GroupDetails', {
                                                        groupId: post.group_id,
                                                        groupName: post.group_name ?? 'Group',
                                                    });
                                                }
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
                                                if (post.author_id && !post.is_anonymous) {
                                                    navigation.navigate('PublicProfile', {
                                                        id: post.author_id,
                                                        type: 'user',
                                                    });
                                                }
                                            }}
                                        /                                    >));
                                })()}
                            </div                        >)}

                        {activeTab === 'groups' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}                                <div style={{ display: 'flex', gap: '8px' }}                                    <button >
                                        className={`top-tab ${groupsSubTab === 'joined' ? 'active' : ''}`}
                                        onClick={() => setGroupsSubTab('joined')}
                                                                            <Lock size={14} style={{ marginRight: 4 }} /                                        >{t('community.groups.joinedTitle') || "Joined Schools"}
                                    </button                                    ><button 
                                        className={`top-tab ${groupsSubTab === 'global' ? 'active' : ''}`}
                                        onClick={() => setGroupsSubTab('global')}
                                                                            <Globe size={14} style={{ marginRight: 4 }} /                                        >{t('community.tabs.infiniteGalaxy') || "Global Groups"}
                                    </button                                </div
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}                                    {(groupsSubTab === 'joined' ? joinedGroups : discoverGroups)?.map(g => {
                                        const initials = (g.name || 'G').charAt(0).toUpperCase();
                                        const isJoined = groupsSubTab === 'joined' || g.is_member;
                                        
                                        return (
                                            <button>
                                                key={g.id}
                                                onClick={() => navigation.navigate('GroupDetails', { groupId: g.id, groupName: g.name })}
                                                className="sanctuary-card interactive group-web-card"
                                                style={{ 
                                                    padding: '16px', 
                                                    textAlign: 'left', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '16px',
                                                    background: 'linear-gradient(180deg, var(--scene-elevated) 0%, var(--scene-surface) 100%)',
                                                    border: '1px solid var(--scene-surface-border)',
                                                    borderRadius: '16px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                                                            {/* Modern Avatar Placeholder */}
                                                <div className="sanctuary-icon-well soft" style={{
                                                    width: '52px', 
                                                    height: '52px', 
                                                    borderRadius: '26px', 
                                                    fontSize: '20px',
                                                    fontWeight: '700',
                                                    color: g.is_public ? 'var(--reward)' : 'var(--action)',
                                                    background: g.is_public
                                                        ? 'linear-gradient(180deg, var(--reward-soft), rgba(var(--reward-rgb), 0.14))'
                                                        : 'linear-gradient(180deg, var(--action-soft), rgba(var(--action-rgb), 0.14))',
                                                    border: g.is_public
                                                        ? '1px solid rgba(var(--reward-rgb), 0.18)'
                                                        : '1px solid rgba(var(--action-rgb), 0.18)'
                                                }}                                                    {initials}>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}                                                        <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}                                                            {g.name}>
                                                        </span                                                        >{g.join_policy === 'invite_only' && <Lock size={12} color="var(--ink-ghost)" />}
                                                    </div                                                    ><div style={{ fontSize: '13px', color: 'var(--ink-ghost)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}                                                        {g.description || "Building resonance together..."}
                                                    </div                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}                                                        <span style={{ fontSize: '11px', color: 'var(--ink-ghost)', display: 'flex', alignItems: 'center', gap: '4px' }}                                                            <Users2 size={10} /                                                            >{g.member_count} members
                                                        </span                                                        {!isJoined && (
                                                            <span className="status-pill" style={{
                                                                background: 'var(--reward-soft)',
                                                                color: 'var(--reward)',
                                                                borderColor: 'rgba(var(--reward-rgb), 0.18)',
                                                            }}                                                                Discover>
                                                            </span                                                        >)}
                                                    </div                                                </div                                                
                                                <div style={{ color: 'var(--ink-ghost)', opacity: 0.5 }}                                                    {isJoined ? <MessageSquare size={16} /> : <Plus size={16} />}
                                                </div                                            </button                                        );
                                    })}
                                </div                            </div                        )}

                        {activeTab === 'dms' && (
                            <div className="sanctuary-card" style={{ padding: '0', overflow: 'hidden' }}                                {!can('create', 'DirectMessage') ? (>
                                    <div style={{ padding: '56px 32px', textAlign: 'center' }}                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Messages are for Citizens</h3                                        ><p style={{ marginTop: 10, marginBottom: 18, color: 'var(--ink-ghost)' }}                                            Upgrade your account to start private conversations.
                                        </p                                        <PositiveInvitation
                                            title="Unlock Messages"
                                            description="Create an account to join groups and connect 1:1."
                                            type="guest"
                                            context="community"
                                            actionLabel="Create account"
                                            onAction={() => navigation.navigate('Auth')}
                                        /                                    ></div                                ) : loadingDMs ? (
                                    <div style={{ padding: '40px', textAlign: 'center' }}                                        <ActivityIndicator color="var(--action)" /                                    ></div                                ) : conversations.length === 0 ? (
                                    <div style={{ padding: '80px 40px', textAlign: 'center' }}                                        <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic' }}                                            No messages yet. Start a conversation from a user's profile!>
                                        </p                                    </div                                ) : (>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}                                        {conversations.map((item, index) => {
                                            const initials = item.other_user_name?.split(' ').map((w: any) => w[0]).join('').slice(0, 2).toUpperCase();
                                            return (
                                                <button>
                                                    key={item.id}
                                                    onClick={() => navigation.navigate('DirectMessage', {
                                                        conversationId: item.id,
                                                        userName: item.other_user_name
                                                    })}
                                                    style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        padding: '16px 20px', 
                                                        gap: '16px',
                                                        borderBottom: index === conversations.length - 1 ? 'none' : '1px solid var(--border)',
                                                        textAlign: 'left',
                                                        width: '100%',
                                                        background: 'transparent'
                                                    }}
                                                    className="interactive-row"
                                                                                                    <div style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'var(--action-soft)', overflow: 'hidden' }}                                                        {item.other_user_avatar 
                                                            ? <img src={item.other_user_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /                                                            >: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--action)', fontWeight: '700' }}>{initials}</div                                                        >}
                                                    </div                                                    ><div style={{ flex: 1 }}                                                        <div style={{ fontWeight: '700', fontSize: '15px' }}>{item.other_user_name}</div                                                        ><div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '2px' }}>Tap to continue conversation</div                                                    ></div                                                    <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}                                                        {new Date(item.updated_at).toLocaleDateString()}
                                                    </div                                                </button                                            );
                                        })}
                                    </div                                )}
                            </div                        )}
                    </div>
                    {/* RIGHT: Presence & Stats */}
                    <aside className="community-panel"                        <CommunityHearth>
                            manifestos={manifestos}
                            userId={user?.id || 'guest'}
                        /                    ></aside                </div            </div
            {/* Create Post Modal */}
            <CreatePostModal/>
                isOpen={showCreatePost}
                onClose={() => { setShowCreatePost(false); fetchPosts?.(); }}
                groupId={typeof selectedGroupId === 'string' && selectedGroupId !== 'all' && selectedGroupId !== 'my' && selectedGroupId !== 'pulse' ? selectedGroupId : undefined}
            /
            >{/* Create Group Modal */}
            <CreateGroupModal/>
                isOpen={showCreateGroup}
                onClose={() => { setShowCreateGroup(false); fetchGroups?.(); }}
            /
            >{/* Comment Sheet  slides up over the feed when a comment button is tapped */}
            <CommentSheet>
                postId={commentPostId}
                postAuthorId={commentPostAuthorId}
                currentUserId={user?.id}
                postType={commentPostType}
                onClose={() => setCommentPostId(null)}
            /            
            ><style dangerouslySetInnerHTML={{ __html: `
                .interactive-row:hover {
                    background: var(--background-alt) !important;
                }
            ` }} /        ></div    >);
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button>
            onClick={onClick}
            className={`sidebar-item ${active ? 'active' : ''}`}
                    {React.cloneElement(icon, {
                size: 18,
                className: 'sidebar-icon',
                color: active ? 'var(--water)' : 'var(--ink-ghost)'
            })}
            <span className="sidebar-label">{label}</span        ></button    >);
}
