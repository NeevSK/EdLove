import React, { useState, useEffect, useMemo } from 'react';
import { RefreshControl, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { Box, VStack, HStack, Text, Pressable, useThemedColors, SkeletonCard, GlobalHeader, ScreenWrapper, PositiveInvitation, Theme, useBottomTabPadding, useRegisterFAB, FadeInDown, HorizontalChipRow, SanctuaryFlashList, Heading, SanctuaryButton } from '@repo/ui';
import Animated from 'react-native-reanimated';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import CreateGroupModal from '../components/CreateGroupModal';
import SocialShieldModal from '../components/SocialShieldModal';
import GroupsScreen from './GroupsScreen';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Users, PenTool } from 'lucide-react-native';
import { useCommunity } from '../hooks/useCommunity';
import { useCommunityFilters } from '../hooks/useCommunityFilters';
import { useCommunityGroups } from '../hooks/useCommunityGroups';
import { Post, Group } from '../types';
import { useTracking, supabase, isDemo, useTemporalStore, FeatureGuard, useStore } from '@repo/core';
import { TemporalNavigator } from '@repo/ui';
import { CommunityPresence } from '@repo/self';
import ManifestoCard from '../components/ManifestoCard';
import CommunityHearth from '../components/CommunityHearth';
import { useManifestos } from '../hooks/useManifestos';
import { communityAPI } from '../api/community';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '@repo/core';
import { Mail } from 'lucide-react-native';
import DirectMessagesListScreen from './DirectMessagesListScreen';

type TabType = 'feed' | 'groups' | 'dms';

type FeedFilter = 'all' | string;

export default function CommunityScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
    const { schoolId, userId } = useStore((state: any) => ({
        schoolId: state.user?.school_id,
        userId: state.user?.id
    }));
    const {
        posts,
        groups,
        loading,
        fetchPosts,
        fetchGroups,
        fetchNextPosts,
        hasNextPosts,
        isFetchingNextPosts,
    } = useCommunity();
    const [activeTab, setActiveTab] = useState<TabType>('feed');
    const [activeFeedFilter, setActiveFeedFilter] = useState<FeedFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [createPostGroupId, setCreatePostGroupId] = useState<string | undefined>(undefined);
    const [reportPostId, setReportPostId] = useState<string | undefined>(undefined);
    const [reportTargetUserId, setReportTargetUserId] = useState<string | undefined>(undefined);
    const [reportTargetUserName, setReportTargetUserName] = useState<string | undefined>(undefined);
    const [showReportModal, setShowReportModal] = useState(false);
    const colors = useThemedColors();
    const { discoverFeature } = useTracking();
    const bottomPadding = useBottomTabPadding();
    const { viewDate, isPastView } = useTemporalStore();
    const { t: translate } = useTranslation();

    useEffect(() => {
        discoverFeature('section_community');
    }, []);

    const { manifestos, endorse, unendorse } = useManifestos(schoolId || 'default', userId ?? undefined);

    // Filtered data for FlatList
    const listData = useMemo(() => posts, [posts]);

    // Derived gating
    const hasJoinedGroups = useMemo(() => (groups || []).some(g => g.is_member), [groups]);

    // Derived feed filter chips via shared hook
    const feedFilterChips = useCommunityFilters(groups, t('community.filters.allUpdates'));

    // Register FAB globally
    useRegisterFAB({
        tabType: 'community',
        visible: !!userId,
        onPress: () => {
            if (activeTab === 'dms') {
                setActiveTab('groups');
            } else {
                handleOpenCreatePost();
            }
        },
        icon: activeTab === 'dms' ? <Mail size={24} color="white" /> : undefined
    });

    // Initial data load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([fetchGroups(), fetchPosts('all')]);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleOpenCreatePost = (groupId?: string) => {
        if (!hasJoinedGroups && !groupId) {
            // If they haven't joined anything, they can't post to 'general' yet (user rule)
            // Instead, we guide them to the groups tab
            setActiveTab('groups');
            return;
        }
        setCreatePostGroupId(groupId);
        setShowCreateModal(true);
    };

    const renderFeedFilterChips = () => (
        <Animated.View entering={FadeInDown.delay(300).springify()}
            <HorizontalChipRow
                chips={feedFilterChips}
                selectedValue={activeFeedFilter}
                onSelect={(value) => {
                    setActiveFeedFilter(value);
                    fetchPosts(value);
                }}
            /
        </Animated.View
    );

    const renderCommunityHearth = () => {
        return (
            <Box mt="$4"
                <CommunityHearth
                    manifestos={manifestos}
                    userId={userId || 'guest'}
                    onPressSpotlight={(postId) => {
                        // Spotlight usually leads to a specific post view or group
                        console.log('Spotlight pressed:', postId);
                    }}
                /
            </Box
        );
    };

    return (
        <ScreenWrapper scroll={false} noTopInset={true}
            <Box sx={{ flex: 1, backgroundColor: colors.secondary }}
                <GlobalHeader title={t('community.title')} /

                {/* Sub-Tabs via Chips - ALWAYS VISIBLE for navigation awareness */}
                <Animated.View entering={FadeInDown.delay(150).springify()}
                    <HorizontalChipRow
                        chips={[
                            { label: t('community.tabs.resonantFeed'), value: 'feed' },
                            { label: t('community.tabs.infiniteGalaxy'), value: 'groups' },
                            { label: t('community.tabs.dms'), value: 'dms' }
                        ]}
                        selectedValue={activeTab}
                        onSelect={(value) => setActiveTab(value as TabType)}
                        paddingHorizontal={Theme.spacing.md}
                        center={true}
                    /
                </Animated.View

                {/* Main Content Area with Capability-Based Gating */}
                {activeTab === 'feed' && (
                    <FeatureGuard 
                        action="read" 
                        subject="CommunityFeed"
                        fallback={
                            <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + Theme.spacing.xl }}
                                <VStack space="md" sx={{ paddingVertical: Theme.spacing.md }}
                                    {renderCommunityHearth()}
                                    <Box px="$4"
                                        <PositiveInvitation
                                            type="guest"
                                            title={t('community.guestTitle')}
                                            description={t('community.guestDesc')}
                                            onAction={() => navigation.navigate('Auth' as never)}
                                        /
                                    </Box
                                </VStack
                            </ScrollView
                        }
                    
                        <SanctuaryFlashList
                            data={listData}
                            keyExtractor={(item) => item.id}
                            estimatedItemSize={Theme.listSizes.communityCard}
                            renderItem={({ item, index }) => (
                                <Animated.View entering={FadeInDown.duration(400).delay(index * 150).springify()}
                                    <PostCard
                                        post={item}
                                        onPress={() => { }}
                                        onLike={() => {
                                            if (userId) communityAPI.togglePostReaction(item.id, userId).catch(console.error);
                                        }}
                                        onReport={() => {
                                            setReportPostId(item.id);
                                            setReportTargetUserId(item.author_id);
                                            setReportTargetUserName(item.author_name ?? undefined);
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
                                        isSample={item.id.startsWith('stub-') || item.id.startsWith('mock-')}
                                        currentUserId={userId ?? undefined}
                                    /
                                </Animated.View
                            )}
                            ListEmptyComponent={
                                !loading ? (
                                    <VStack space="xl" alignItems="center" sx={{ padding: Theme.spacing['2xl'], marginTop: Theme.spacing['2xl'] }}
                                        <Box sx={{
                                            padding: Theme.spacing.xl,
                                            backgroundColor: Theme.colors.gurudeviViolet + '11',
                                            borderRadius: Theme.corners.full
                                        }}
                                            <PenTool size={48} color={Theme.colors.gurudeviViolet} /
                                        </Box
                                        <VStack space="sm" alignItems="center"
                                            <Heading size="md" textAlign="center" color={Theme.colors.gurudeviViolet}
                                                {t('community.empty.title') || 'Your Sanctuary is Waiting for its First Spark'}
                                            </Heading
                                            <Text textAlign="center" color={colors.textSecondary}
                                                {t('community.empty.desc') || 'Share a thought, a lesson, or a moment of grace to seed your school\'s collective wisdom.'}
                                            </Text
                                        </VStack
                                        <SanctuaryButton
                                            onPress={() => hasJoinedGroups ? handleOpenCreatePost() : setActiveTab('groups')}
                                            action="primary"
                                            size="lg"
                                        
                                            {hasJoinedGroups
                                                ? (t('community.empty.button') || 'Seed Your First Post')
                                                : (t('community.empty.joinFirst') || 'Join your first Circle')}
                                        </SanctuaryButton
                                    </VStack
                                ) : null
                            }
                            ListHeaderComponent={
                                <VStack space="md" sx={{ paddingVertical: Theme.spacing.md }}
                                    <TemporalNavigator /
                                    {renderCommunityHearth()}
                                    {renderFeedFilterChips()}
                                </VStack
                            }
                            onRefresh={onRefresh}
                            refreshing={refreshing}
                            onEndReached={() => hasNextPosts && fetchNextPosts()}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                isFetchingNextPosts ? (
                                    <ActivityIndicator style={{ marginVertical: Theme.spacing.md }} color={Theme.colors.sanctuarySaffron} /
                                ) : null
                            }
                            contentContainerStyle={{ paddingBottom: bottomPadding + Theme.spacing.xl }}
                        /
                    </FeatureGuard
                )}

                {activeTab === 'groups' && (
                    <FeatureGuard 
                        action="read" 
                        subject="CommunityGroups"
                        fallback={
                            <VStack sx={{ flex: 1, justifyContent: 'center', padding: Theme.spacing.xl }}
                                <PositiveInvitation
                                    type="guest"
                                    title={t('community.groups.guestTitle')}
                                    description={t('community.groups.guestDesc')}
                                    onAction={() => navigation.navigate('Auth' as never)}
                                /
                            </VStack
                        }
                    
                        <GroupsScreen
                            userId={userId ?? undefined}
                            schoolId={schoolId || undefined}
                            onCreatePost={handleOpenCreatePost}
                            onCreateGroup={() => setShowCreateGroupModal(true)}
                            onNavigateToGroup={(groupId: string) => {
                                navigation.navigate('GroupDetails', { groupId });
                            }}
                        /
                    </FeatureGuard
                )}

                {activeTab === 'dms' && (
                    <FeatureGuard 
                        action="read" 
                        subject="DirectMessages"
                        fallback={
                            <VStack sx={{ flex: 1, justifyContent: 'center', padding: Theme.spacing.xl }}
                                <PositiveInvitation
                                    type="guest"
                                    title={t('community.dms.guestTitle')}
                                    description={t('community.dms.guestDesc')}
                                    onAction={() => navigation.navigate('Auth' as never)}
                                /
                            </VStack
                        }
                    
                        <DirectMessagesListScreen /
                    </FeatureGuard
                )}

                <CreatePostModal
                    isOpen={showCreateModal}
                    onClose={() => { setShowCreateModal(false); setCreatePostGroupId(undefined); }}
                    groupId={createPostGroupId}
                /

                <CreateGroupModal
                    isOpen={showCreateGroupModal}
                    onClose={() => setShowCreateGroupModal(false)}
                    onCreated={(groupId) => {
                        fetchGroups();
                    }}
                /

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
                /
            </Box 
        </ScreenWrapper 
    );
}
