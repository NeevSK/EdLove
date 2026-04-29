import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type CommunityStackParamList, FeatureGuard } from '@repo/core';
import { useTracking } from '@repo/core/hooks';
import { useStore, useTemporalStore } from '@repo/core/logic';

import {
  Box,
  FadeInDown,
  GlobalHeader,
  Heading,
  PositiveInvitation,
  SanctuaryFlashList,
  ScreenWrapper,
  Text,
  useThemedColors,
  VStack,
} from '@repo/ui';
import {
  HorizontalChipRow,
  SanctuaryButton,
  TemporalNavigator,
  useBottomTabPadding,
} from '@repo/ui/components';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { Theme } from '@repo/ui/theme';

import { Mail, PenTool } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { communityAPI } from '../api/community';
import CommunityHearth from '../components/CommunityHearth';
import CreateGroupModal from '../components/CreateGroupModal';
import CreatePostModal from '../components/CreatePostModal';
import PostCard from '../components/PostCard';
import SocialShieldModal from '../components/SocialShieldModal';
import { useCommunity } from '../hooks/useCommunity';
import { useCommunityFilters } from '../hooks/useCommunityFilters';
import { useManifestos } from '../hooks/useManifestos';
import DirectMessagesListScreen from './DirectMessagesListScreen';
import GroupsScreen from './GroupsScreen';

type TabType = 'feed' | 'groups' | 'dms';

type FeedFilter = 'all' | string;

export default function CommunityScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
  const { schoolId, userId } = useStore((state: any) => ({
    schoolId: state.user?.school_id,
    userId: state.user?.id,
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
  const [_searchQuery, _setSearchQuery] = useState('');
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
  }, [discoverFeature]);

  const { manifestos, endorse, unendorse } = useManifestos(
    schoolId || 'default',
    userId ?? undefined,
  );

  // Filtered data for FlatList
  const listData = useMemo(() => posts, [posts]);

  // Derived gating
  const hasJoinedGroups = useMemo(() => (groups || []).some((g) => g.is_member), [groups]);

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
    icon: activeTab === 'dms' ? <Mail size={24} color="white" /> : undefined,
  });

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

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
        <ScreenWrapper scroll={false} noTopInset={true}>
            <Box className="flex-1" style={{ backgroundColor: colors.secondary }}>
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
                                <VStack className="gap-4 py-4">
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
                                    <VStack className="gap-8 items-center p-10 mt-10">
                                        <Box className="p-6" style={{ backgroundColor: `${Theme.colors.gurudeviViolet}11`, borderRadius: Theme.corners.full }}>
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
                                <VStack className="gap-4 py-4">
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
                            <VStack className="flex-1 justify-center p-8">
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
                            <VStack className="flex-1 justify-center p-8">
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
                    onCreated={(_groupId) => {
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
