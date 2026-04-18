import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Platform } from 'react-native';
import {
    Box,
    GlobalHeader,
    HStack,
    Heading,
    HorizontalChipRow,
    PositiveInvitation,
    SanctuaryButton,
    SanctuaryFlashList,
    ScreenWrapper,
    Text,
    VStack,
    useBottomTabPadding,
    useRegisterFAB,
} from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    CommunityStackParamList,
    communityAPI,
    setPendingGateAction,
    usePermissions,
    useStore,
    useTemporalStore,
    useTracking,
} from '@repo/core';
import { Plus } from 'lucide-react-native';
import CreateGroupModal from '../components/CreateGroupModal';
import CreatePostModal from '../components/CreatePostModal';
import CommunityHearth from '../components/CommunityHearth';
import { CommentSheet } from '../components/CommentSheet';
import PostCard from '../components/PostCard';
import SocialShieldModal from '../components/SocialShieldModal';
import { useCommunity } from '../hooks/useCommunity';
import { useCommunityGroups } from '../hooks/useCommunityGroups';
import { useManifestos } from '../hooks/useManifestos';
import type { AnnouncementWithAuthor, DirectConversation } from '../types';
import AnnouncementsScreen from './AnnouncementsScreen';
import DirectMessagesListScreen from './DirectMessagesListScreen';
import GroupsScreen from './GroupsScreen';
import {
    deriveCommunityPulse,
    getCommunityFilterOptions,
    getCommunityModeOptions,
    mapCommunitySurfaceSlots,
    type CommunityWorkspaceMode,
} from './communityWorkspace.shared';

type Navigation = NativeStackNavigationProp<CommunityStackParamList>;

export default function CommunityScreen() {
    const navigation = useNavigation<Navigation>();
    const bottomPadding = useBottomTabPadding();
    const { discoverFeature } = useTracking();
    const { can } = usePermissions();
    const { isPastView } = useTemporalStore();
    const { user } = useStore();

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
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    
    // Comment State
    const [commentPostId, setCommentPostId] = useState<string | null>(null);
    const [commentPostAuthorId, setCommentPostAuthorId] = useState<string | undefined>(undefined);
    const [commentPostType, setCommentPostType] = useState<string | undefined>(undefined);

    const [reportPostId, setReportPostId] = useState<string | undefined>(undefined);
    const [reportTargetUserId, setReportTargetUserId] = useState<string | undefined>(undefined);
    const [reportTargetUserName, setReportTargetUserName] = useState<string | undefined>(undefined);
    const [showReportModal, setShowReportModal] = useState(false);
    const [conversations, setConversations] = useState<DirectConversation[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [announcementCount, setAnnouncementCount] = useState(0);

    const {
        posts,
        groups,
        loading,
        fetchPosts,
        fetchGroups,
        fetchNextPosts,
        hasNextPosts,
        isFetchingNextPosts,
    } = useCommunity(selectedFilter !== 'all' ? selectedFilter : undefined);
    const { sanctuaryGroups, galaxyGroups } = useCommunityGroups({ schoolId });
    const { manifestos } = useManifestos(schoolId || 'default', user?.id ?? undefined);

    const pulse = useMemo(
        () => deriveCommunityPulse(posts, groups, manifestos, conversations),
        [conversations, groups, manifestos, posts]
    );
    const filters = useMemo(() => getCommunityFilterOptions(groups), [groups]);
    const workspaceSlots = useMemo(() => mapCommunitySurfaceSlots(Platform.OS as any, userId), [userId]);
    const modeChips = useMemo(
        () =>
            getCommunityModeOptions(canReadAnnouncements).map((mode) => ({
                label: mode.label,
                value: mode.key,
            })),
        [canReadAnnouncements]
    );

    useRegisterFAB({
        tabType: 'community',
        visible: !isPastView && (canCreatePost || canCreateGroup),
        icon: <Plus size={24} color="#FFF" />,
        onPress: () => {
            if (activeMode === 'circles' && canCreateGroup) {
                setShowCreateGroup(true);
                return;
            }
            if (canCreatePost) {
                setShowCreatePost(true);
                return;
            }
            if (canCreateGroup) {
                setShowCreateGroup(true);
            }
        },
    });

    useEffect(() => {
        discoverFeature('section_community');
    }, [discoverFeature]);

    useEffect(() => {
        if (activeMode !== 'messages' || !canReadMessages) {
            return;
        }

        let cancelled = false;
        setLoadingMessages(true);
        communityAPI
            .getDirectConversations()
            .then((data) => {
                if (!cancelled) {
                    setConversations(data as DirectConversation[]);
                }
            })
            .catch((error) => {
                console.error('[CommunityScreen] Failed to load direct conversations', error);
            })
            .finally(() => {
                if (!cancelled) {
                    setLoadingMessages(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [activeMode, canReadMessages]);

    useEffect(() => {
        if (!canReadAnnouncements || activeMode !== 'announcements' || !schoolId) {
            return;
        }

        let cancelled = false;
        communityAPI
            .getAnnouncements(schoolId)
            .then((data) => {
                if (!cancelled) {
                    setAnnouncementCount((data as AnnouncementWithAuthor[]).length);
                }
            })
            .catch((error) => {
                console.error('[CommunityScreen] Failed to load announcements', error);
            });

        return () => {
            cancelled = true;
        };
    }, [activeMode, canReadAnnouncements, schoolId]);

    const openGuestUpgrade = () => {
        setPendingGateAction({ kind: 'community_open_create_group', createdAt: Date.now() }).catch(() => {});
        navigation.navigate('Auth' as never);
    };

    const renderModeGate = (
        title: string,
        description: string,
        actionLabel = 'Create account'
    ) => (
        <Box className="px-4 py-8">
            <PositiveInvitation
                title={title}
                description={description}
                type="guest"
                context="community"
                actionLabel={actionLabel}
                onAction={openGuestUpgrade}
            />
        </Box>
    );

    const renderHero = () => (
        <Box className="mx-4 mt-3 px-5 py-5 rounded-[28px] bg-[#F7F0E5] border border-outline-variant">
            <VStack space="md">
                <VStack space="xs">
                    <Text className="text-muted-foreground text-[12px] font-bold uppercase tracking-wider">
                        {workspaceSlots.hearth ? 'Community workspace' : 'Community'}
                    </Text>
                    <Heading size="2xl" className="text-foreground">
                        The Heart
                    </Heading>
                    <Text className="text-muted-foreground leading-relaxed">
                        Shared pulse, groups, and conversation. Presence leads before activity so the sanctuary feels alive before it feels busy.
                    </Text>
                </VStack>

                <HStack className="gap-2 flex-wrap items-center">
                    <HeroPill label={`${pulse.circlesActive} circles`} />
                    <HeroPill label={`${pulse.newPostsToday} new posts`} />
                    <HeroPill label={`${pulse.messagesOpen} conversations`} />
                    {canReadAnnouncements ? <HeroPill label={`${announcementCount} announcements`} /> : null}
                </HStack>

                <HorizontalChipRow
                    chips={modeChips}
                    selectedValue={activeMode}
                    onSelect={(value) => setActiveMode(value as CommunityWorkspaceMode)}
                    center={false}
                />
            </VStack>
        </Box>
    );

    const renderHearthCard = () => (
        <Box className="mx-4 mt-4 rounded-3xl border border-outline-variant bg-[#FBF5EA] overflow-hidden">
            <VStack space="md" className="px-4 pt-4 pb-2">
                <VStack space="xs">
                    <Heading size="md" className="text-foreground">
                        Community hearth
                    </Heading>
                    <Text className="text-muted-foreground leading-snug">
                        Presence, welcome, and manifesto energy stay first so the community feels alive before it feels busy.
                    </Text>
                </VStack>
                <HStack className="justify-between gap-3 flex-wrap">
                    <PulseCard label="Members seen" value={String(pulse.membersSeen || 0)} />
                    <PulseCard label="Active manifestos" value={String(pulse.manifestosActive)} />
                    <PulseCard label="Joined circles" value={String(sanctuaryGroups.length)} />
                </HStack>
            </VStack>
            <CommunityHearth manifestos={manifestos} userId={userId} />
        </Box>
    );

    const renderComposeCard = () => (
        <Box className="mx-4 mt-4 px-4 py-4 rounded-[22px] border border-outline-variant bg-[#F9F2E4]">
            <VStack space="md">
                <VStack space="xs">
                    <Heading size="sm">Compose into the circle</Heading>
                    <Text className="text-muted-foreground leading-snug">
                        Posting feels like contribution, not just a button.
                    </Text>
                </VStack>
                <HStack className="gap-2 flex-wrap">
                    <SanctuaryButton action="primary" size="sm" onPress={() => (canCreatePost ? setShowCreatePost(true) : openGuestUpgrade())}>
                        <Text className="text-white font-bold">New Post</Text>
                    </SanctuaryButton>
                    <SanctuaryButton action="secondary" size="sm" onPress={() => (canCreateGroup ? setShowCreateGroup(true) : openGuestUpgrade())}>
                        <Text className="text-foreground font-bold">New Group</Text>
                    </SanctuaryButton>
                    {sanctuaryGroups[0] ? (
                        <SanctuaryButton
                            action="secondary"
                            size="sm"
                            onPress={() =>
                                navigation.navigate('GroupDetails', {
                                    groupId: sanctuaryGroups[0].id,
                                    groupName: sanctuaryGroups[0].name,
                                })
                            }
                        >
                            <Text className="text-foreground font-bold">Open Circle</Text>
                        </SanctuaryButton>
                    ) : null}
                </HStack>
            </VStack>
        </Box>
    );

    const renderFilterRow = () => (
        <Box className="mt-4 px-4">
            <HorizontalChipRow
                chips={filters}
                selectedValue={selectedFilter}
                onSelect={(value) => {
                    setSelectedFilter(value);
                    fetchPosts(value === 'all' ? undefined : value);
                }}
                center={false}
            />
        </Box>
    );

    const renderFeed = () => {
        if (!canReadFeed) {
            return renderModeGate(
                'Become a citizen of the hearth',
                'Create an account and receive a positive invitation into circles, posts, and the living community feed.'
            );
        }

        return (
            <SanctuaryFlashList
                data={posts}
                keyExtractor={(item) => item.id}
                estimatedItemSize={260}
                renderItem={({ item }) => (
                    <Box className="px-4 pb-4">
                        <PostCard
                            post={item}
                            currentUserId={user?.id}
                            onPress={() => {
                                if (item.group_id) {
                                    navigation.navigate('GroupDetails', {
                                        groupId: item.group_id,
                                        groupName: item.group_name ?? 'Circle',
                                    });
                                }
                            }}
                            onLike={() => {
                                if (user?.id) {
                                    communityAPI.togglePostReaction(item.id, user.id).catch(console.error);
                                }
                            }}
                            onComment={() => {
                                setCommentPostId(item.id);
                                setCommentPostAuthorId(item.author_id ?? undefined);
                                setCommentPostType(item.post_type);
                            }}
                            onReport={() => {
                                setReportPostId(item.id);
                                setReportTargetUserId(item.author_id);
                                setReportTargetUserName(item.author_name);
                                setShowReportModal(true);
                            }}
                            onAuthorPress={() => {
                                if (item.author_id && !item.is_anonymous) {
                                    navigation.navigate('PublicProfile', {
                                        id: item.author_id,
                                        type: 'user',
                                    });
                                }
                            }}
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
                    !loading ? (
                        <Box className="px-4 pt-8">
                            <PositiveInvitation
                                title="Seed the first note"
                                description="The feed opens when circles begin speaking. Start a post or join a circle to let the sanctuary resonate."
                                context="community"
                                actionLabel={canCreatePost ? 'Create first post' : 'Explore circles'}
                                onAction={() => {
                                    if (canCreatePost) {
                                        setShowCreatePost(true);
                                    } else {
                                        setActiveMode('circles');
                                    }
                                }}
                            />
                        </Box>
                    ) : null
                }
                onEndReached={() => {
                    if (hasNextPosts) {
                        fetchNextPosts();
                    }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingNextPosts ? (
                        <ActivityIndicator style={{ marginVertical: 16 }} color="#E67E22" />
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
                'Create your account to enter joined circles, discover new groups, and contribute to shared resonance.'
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
                            userId={user?.id ?? undefined}
                            schoolId={schoolId}
                            onCreatePost={() => setShowCreatePost(true)}
                            onCreateGroup={() => setShowCreateGroup(true)}
                            onNavigateToGroup={(groupId: string) => {
                                const selected = [...sanctuaryGroups, ...galaxyGroups].find((group) => group.id === groupId);
                                navigation.navigate('GroupDetails', {
                                    groupId,
                                    groupName: selected?.name,
                                });
                            }}
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
                'Create an account to continue private conversations without leaving the sanctuary shell.'
            );
        }

        return (
            <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + 32 }}>
                {renderHero()}
                <Box className="px-4 pt-4">
                    <SectionCard title="Direct conversations" description="Messages stay close to the hearth without overtaking the workspace.">
                        {loadingMessages ? (
                            <Box className="py-8 items-center">
                                <ActivityIndicator color="#E67E22" />
                            </Box>
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
                'Attach to a sanctuary and accept your invitation to receive school-wide guidance here.'
            );
        }

        return (
            <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + 32 }}>
                {renderHero()}
                <Box className="px-4 pt-4">
                    <SectionCard title="School guidance" description="Announcements remain reachable without crowding the feed.">
                        <AnnouncementsScreen schoolId={schoolId} userId={user.id} userAuthority={userAuthority} />
                    </SectionCard>
                </Box>
            </ScrollView>
        );
    };

    return (
        <ScreenWrapper scroll={false} noTopInset>
            <Box className="flex-1 bg-secondary-50">
                <GlobalHeader title="Community" />

                {activeMode === 'feed' && renderFeed()}
                {activeMode === 'circles' && renderCircles()}
                {activeMode === 'messages' && renderMessages()}
                {activeMode === 'announcements' && renderAnnouncements()}

                <CreatePostModal
                    isOpen={showCreatePost && !isPastView}
                    onClose={() => setShowCreatePost(false)}
                    groupId={selectedFilter !== 'all' ? selectedFilter : undefined}
                />

                <CreateGroupModal
                    isOpen={showCreateGroup && !isPastView}
                    onClose={() => {
                        setShowCreateGroup(false);
                        fetchGroups();
                    }}
                />

                <SocialShieldModal
                    isOpen={showReportModal}
                    onClose={() => {
                        setShowReportModal(false);
                        setReportPostId(undefined);
                        setReportTargetUserId(undefined);
                        setReportTargetUserName(undefined);
                    }}
                    postId={reportPostId}
                    targetUserId={reportTargetUserId}
                    targetUserName={reportTargetUserName}
                />

                <CommentSheet
                    postId={commentPostId}
                    postAuthorId={commentPostAuthorId}
                    currentUserId={user?.id}
                    postType={commentPostType}
                    onClose={() => setCommentPostId(null)}
                />
            </Box>
        </ScreenWrapper>
    );
}

function HeroPill({ label }: { label: string }) {
    return (
        <Box className="px-3 py-2 rounded-full bg-white/55">
            <Text className="text-[12px] font-bold">{label}</Text>
        </Box>
    );
}

function PulseCard({ label, value }: { label: string; value: string }) {
    return (
        <Box className="flex-1 min-w-[92px] px-3 py-3 rounded-[18px] bg-white/60">
            <Text className="text-[11px] text-muted-foreground uppercase">{label}</Text>
            <Text className="mt-1 text-[22px] font-bold text-foreground">{value}</Text>
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
        <Box className="rounded-3xl border border-outline-variant bg-[#FCF8F1] overflow-hidden">
            <VStack space="xs" className="px-4 pt-4 pb-2">
                <Heading size="sm">{title}</Heading>
                <Text className="text-muted-foreground leading-snug">{description}</Text>
            </VStack>
            {children}
        </Box>
    );
}
