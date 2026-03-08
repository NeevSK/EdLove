import React, { useState } from 'react';
import {
    useTheme,
    PositiveInvitation,
    LotusPetalFAB,
    Theme,
    useThemedColors
} from '@repo/ui';
import { useUserRole, useStore } from '@repo/core';
import {
    useCommunity,
    useCommunityGroups,
    useManifestos,
    CommunityHearth,
    PostCard,
    communityAPI
} from '@repo/community';
import { CommunityPresence } from '@repo/self';
import {
    Hash,
    MessageSquare,
    Trophy,
    Compass,
    Activity,
    Users2,
    Heart,
    Flame
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';

export default function CommunityScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role, isGuest } = useUserRole();
    const { user } = useStore();

    const [selectedGroupId, setSelectedGroupId] = useState<string | 'all' | 'my' | 'pulse'>('all');
    const [showList, setShowList] = useState<'none' | 'joined' | 'discover'>('none');

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
    } = useCommunityGroups({ schoolId: user?.school_id });

    const { manifestos } = useManifestos(user?.school_id, user?.id);

    const isEcosystemRole = role === 'founder' || role === 'admin' || role === 'developer';
    const colors = useThemedColors();

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                {/* 1. GREETING */}
                <div className="greeting">
                    <div className="greeting-time">{isEcosystemRole ? "Architect's Stream" : "Global Resonance"}</div>
                    <h1 className="greeting-main">The Heart</h1>
                    <p className="greeting-note">Ecosystem Resonance</p>
                </div>

                {/* 2. COMMUNITY GRID */}
                <div className="community-grid">

                    {/* LEFT: Sanctuary Explorer */}
                    <aside className="community-sidebar">
                        <nav className="sidebar-nav" style={{ gap: '8px' }}>
                            <SidebarItem
                                icon={<Compass size={18} />}
                                label={t('community.filters.allUpdates')}
                                active={selectedGroupId === 'all' && showList === 'none'}
                                onClick={() => { setSelectedGroupId('all'); setShowList('none'); }}
                            />
                            <SidebarItem
                                icon={<Users2 size={18} />}
                                label={t('community.groups.sanctuary')}
                                active={selectedGroupId === 'my' && showList === 'none'}
                                onClick={() => { setSelectedGroupId('my'); setShowList('none'); }}
                            />
                            <SidebarItem
                                icon={<Activity size={18} />}
                                label={t('community.tabs.resonantFeed')}
                                active={selectedGroupId === 'pulse' && showList === 'none'}
                                onClick={() => { setSelectedGroupId('pulse'); setShowList('none'); }}
                            />
                            <button
                                className="sidebar-item"
                                onClick={() => navigation.navigate('DirectMessagesList')}
                            >
                                <span className="sidebar-icon">
                                    <MessageSquare size={18} />
                                </span>
                                <span className="sidebar-label">{t('community.tabs.dms')}</span>
                            </button>
                        </nav>

                        <div className="sidebar-divider" style={{ margin: '20px 16px 12px 16px', opacity: 0.1, backgroundColor: 'var(--ink)' }} />

                        <div style={{ padding: '0 16px', marginTop: '12px' }}>
                            <div className="sidebar-group-label" style={{ marginBottom: '12px', opacity: 0.6 }}>{t('community.groups.title')}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {joinedGroups?.map((g) => (
                                    <button
                                        key={g.id}
                                        className={`sidebar-item ${selectedGroupId === g.id ? 'active' : ''}`}
                                        style={{ padding: '8px 12px' }}
                                        onClick={() => { setSelectedGroupId(g.id); setShowList('none'); }}
                                    >
                                        <span className="sidebar-icon">
                                            <Hash size={14} />
                                        </span>
                                        <span className="sidebar-label" style={{ fontWeight: '400' }}>{g.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="sidebar-divider" style={{ margin: '24px 16px 12px 16px', opacity: 0.1, backgroundColor: 'var(--ink)' }} />

                        <div style={{ padding: '0 16px' }}>
                            <div className="sidebar-group-label" style={{ marginBottom: '12px', opacity: 0.6 }}>{t('community.tabs.infiniteGalaxy')}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {discoverGroups?.map((g) => (
                                    <button
                                        key={g.id}
                                        className={`sidebar-item ${selectedGroupId === g.id ? 'active' : ''}`}
                                        style={{ padding: '8px 12px' }}
                                        onClick={() => { setSelectedGroupId(g.id); setShowList('none'); }}
                                    >
                                        <span className="sidebar-icon">
                                            <Hash size={14} />
                                        </span>
                                        <span className="sidebar-label" style={{ fontWeight: '400' }}>{g.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* CENTER: Main Feed */}
                    <div className="community-feed">
                        <div className="community-sub-nav">
                            <button
                                className={`sub-nav-item ${showList === 'none' ? 'active' : ''}`}
                                onClick={() => setShowList('none')}
                            >
                                <Compass size={16} />
                                <span>{t('community.tabs.resonantFeed')}</span>
                            </button>
                            <button
                                className={`sub-nav-item ${showList === 'joined' ? 'active' : ''}`}
                                onClick={() => setShowList('joined')}
                            >
                                <Users2 size={16} />
                                <span>{t('community.groups.sanctuary')}</span>
                            </button>
                            <button
                                className={`sub-nav-item ${showList === 'discover' ? 'active' : ''}`}
                                onClick={() => setShowList('discover')}
                            >
                                <Compass size={16} />
                                <span>{t('community.tabs.infiniteGalaxy')}</span>
                            </button>
                        </div>

                        {showList === 'joined' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>{t('community.groups.joinedTitle')}</h2>
                                {joinedGroups?.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => { setSelectedGroupId(g.id); setShowList('none'); }}
                                        className="sanctuary-card"
                                        style={{ padding: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                                    >
                                        <Hash size={20} color="var(--water)" />
                                        <span style={{ fontWeight: '600' }}>{g.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : showList === 'discover' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>{t('community.tabs.infiniteGalaxy')}</h2>
                                {discoverGroups?.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => { setSelectedGroupId(g.id); setShowList('none'); }}
                                        className="sanctuary-card"
                                        style={{ padding: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                                    >
                                        <Compass size={20} color="var(--moss)" />
                                        <span style={{ fontWeight: '600' }}>{g.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <>
                                {selectedGroupId === 'all' && (
                                    <div style={{ marginBottom: '12px' }}>
                                        {/* Hearth moved to right sidebar for better web utility */}
                                    </div>
                                )}

                                {!isEcosystemRole && isGuest ? (
                                    <div style={{ marginTop: '40px' }}>
                                        <PositiveInvitation
                                            context="community"
                                            onAction={() => navigation.navigate('Auth' as any)}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        {isLoadingPosts ? (
                                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-ghost)' }}>
                                                Channelling Stream...
                                            </div>
                                        ) : (posts?.filter(p => {
                                            if (selectedGroupId === 'all') return true;
                                            if (selectedGroupId === 'my') {
                                                return joinedGroups?.some(g => g.id === p.group_id);
                                            }
                                            if (selectedGroupId === 'pulse') {
                                                return p.post_type === 'announcement' || Object.values(p.reactions || {}).reduce((a, b) => a + (b as number), 0) > 5;
                                            }
                                            return p.group_id === selectedGroupId;
                                        }) || []).length > 0 ? (
                                            (posts?.filter(p => {
                                                if (selectedGroupId === 'all') return true;
                                                if (selectedGroupId === 'my') {
                                                    return joinedGroups?.some(g => g.id === p.group_id);
                                                }
                                                if (selectedGroupId === 'pulse') {
                                                    return p.post_type === 'announcement' || Object.values(p.reactions || {}).reduce((a, b) => a + (b as number), 0) > 5;
                                                }
                                                return p.group_id === selectedGroupId;
                                            }) || []).map((post) => (
                                                <PostCard
                                                    key={post.id}
                                                    post={post}
                                                    currentUserId={user?.id}
                                                    onPress={() => { }}
                                                    onLike={() => {
                                                        if (user?.id) communityAPI.togglePostReaction(post.id, user.id).catch(console.error);
                                                    }}
                                                    onAuthorPress={() => {
                                                        if (post.author_id && !post.is_anonymous) {
                                                            navigation.navigate('UserProfile', {
                                                                userId: post.author_id,
                                                                userName: post.author_name ?? 'Member',
                                                            });
                                                        }
                                                    }}
                                                />
                                            ))
                                        ) : (
                                            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                                                <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic' }}>
                                                    {selectedGroupId === 'my'
                                                        ? t('community.groups.noGalaxyTitle')
                                                        : t('community.empty.title')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* RIGHT: Presence & Stats */}
                    <aside className="community-panel">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                            <div style={{ width: '100%' }}>
                                <CommunityHearth
                                    manifestos={manifestos}
                                    userId={user?.id || 'guest'}
                                    userRole={role}
                                />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* FAB Removed per user request */}
        </div>
    );
}


function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`sidebar-item ${active ? 'active' : ''}`}
        >
            {React.cloneElement(icon, {
                size: 18,
                className: 'sidebar-icon',
                color: active ? 'var(--water)' : 'var(--ink-ghost)'
            })}
            <span className="sidebar-label">{label}</span>
        </button>
    );
}
