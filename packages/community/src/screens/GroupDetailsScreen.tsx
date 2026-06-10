import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '@repo/core/api';
import {
  clearPendingGateAction,
  getPendingGateAction,
  setPendingGateAction,
  usePermissions,
} from '@repo/core/logic';

import { useStore } from '@repo/core/store';
import type { CommunityStackParamList } from '@repo/core/types';
import { QRBuilder, QRCodeGenerator } from '@repo/scanner-kit';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import { SanctuaryCard } from '@repo/ui/components/SanctuaryCard';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useLotusToast } from '@repo/ui/hooks';
import {
  ChevronLeft,
  MessageSquare,
  MoreVertical,
  QrCode,
  Settings,
  UserPlus,
  Users,
} from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  HStack,
  Icon,
  Image,
  Pressable,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FadeInDown } from 'react-native-reanimated';
import { communityAPI } from '../api/community';
import { CommentSheet } from '../components/CommentSheet';
import GroupMemberManagement from '../components/GroupMemberManagement';
import { PinnedResourcesShelf } from '../components/PinnedResourcesShelf';
import PostCard from '../components/PostCard';
import SocialShieldModal from '../components/SocialShieldModal';
import { useCommunity } from '../hooks/useCommunity';

type GroupDetailsRouteProp = {
  key: string;
  name: 'GroupDetails';
  params: {
    groupId: string;
  };
};

export default function GroupDetailsScreen() {
  const route = useRoute<GroupDetailsRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
  const { t } = useTranslation();
  const { groupId } = route.params;
  const { can, flags } = usePermissions();
  const user = useStore((state) => state.user);
  const { showToast } = useLotusToast();
  const { joinGroup, isJoiningGroup, posts, fetchPosts } = useCommunity();

  const [group, setGroup] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | undefined>(undefined);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentPostAuthorId, setCommentPostAuthorId] = useState<string | undefined>();
  const [commentPostType, setCommentPostType] = useState<string | undefined>();
  const canJoinGroup = can('create', 'Group') || can('create', 'CommunityGroup');
  const canManageGroup = can('manage', 'Group') || can('manage', 'CommunityGroup');

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('community_groups')
          .select('*, creator:users!community_groups_created_by_fkey(full_name, avatar_url)')
          .eq('id', groupId)
          .single();

        if (data) {
          setGroup(data);

          if (user?.id) {
            const { data: memberData } = await supabase
              .from('community_group_members')
              .select('id')
              .eq('group_id', groupId)
              .eq('user_id', user.id)
              .maybeSingle();

            setIsMember(!!memberData);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void fetchGroup();
    void fetchPosts(groupId);
  }, [groupId, user?.id, fetchPosts]);

  const handleBack = React.useCallback(() => navigation.goBack(), [navigation]);
  const handleShowAdmin = React.useCallback(() => setShowAdmin(true), []);
  const handleHideAdmin = React.useCallback(() => setShowAdmin(false), []);
  const handleShowQR = React.useCallback(() => setShowQRModal(true), []);
  const handleHideQR = React.useCallback(() => setShowQRModal(false), []);
  const handleChatNavigate = React.useCallback(() => {
    navigation.navigate('GroupChat', { groupId, groupName: group?.name });
  }, [navigation, groupId, group?.name]);

  const handlePostLike = React.useCallback(
    (postId: string) => {
      if (user?.id) {
        communityAPI.togglePostReaction(postId, user.id).catch(console.error);
      }
    },
    [user?.id],
  );

  const handlePostComment = React.useCallback((id: string, authorId?: string, type?: string) => {
    setCommentPostId(id);
    setCommentPostAuthorId(authorId);
    setCommentPostType(type);
  }, []);

  const handlePostPressEmpty = React.useCallback(() => {}, []);

  const handlePostReport = React.useCallback((id: string) => {
    setReportPostId(id);
    setShowReportModal(true);
  }, []);

  const handleJoin = React.useCallback(async () => {
    if (!canJoinGroup || !user?.id) {
      await setPendingGateAction({
        kind: 'community_join_group',
        // eslint-disable-next-line no-restricted-syntax
        createdAt: Date.now(),
        groupId,
        joinPolicy: group?.join_policy || 'open',
      });
      showToast({
        message:
          t('community.groups.joinAuthRequired') ||
          "To join this group, let's create an account first!",
      });
      navigation.navigate('Auth' as any);
      return;
    }

    try {
      await joinGroup({
        groupId,
        userId: user.id,
        joinPolicy: group?.join_policy || 'open',
      });

      if (group?.join_policy === 'open') {
        setIsMember(true);
        showToast({
          message: t('community.groups.joinedSuccess') || 'Welcome to the circle!',
          type: 'success',
        });
      } else {
        showToast({
          message: t('community.groups.joinRequested'),
          type: 'success',
        });
      }
    } catch (_err) {
      showToast({
        message: t('common.error'),
        type: 'error',
      });
    }
  }, [canJoinGroup, user?.id, groupId, group?.join_policy, showToast, t, navigation, joinGroup]);

  useEffect(() => {
    let cancelled = false;
    const maybeReplayJoin = async () => {
      if (!canJoinGroup) return;
      if (!user?.id) return;
      if (isMember) return;
      const pending = await getPendingGateAction();
      if (!pending || pending.kind !== 'community_join_group') return;
      if (pending.groupId !== groupId) return;
      if (cancelled) return;
      await clearPendingGateAction();
      await handleJoin();
    };
    maybeReplayJoin().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [canJoinGroup, groupId, user?.id, isMember, handleJoin]);

  if (loading) {
    return (
      <ScreenWrapper noTopInset className="bg-phase-canvas">
        <Box className="flex-1 justify-center items-center">
          <Spinner />
          <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-widest mt-4">
            Calibrating Resonance...
          </Text>
        </Box>
      </ScreenWrapper>
    );
  }

  if (!group) return null;

  const isAdmin = group.created_by === user?.id || canManageGroup;

  if (showAdmin && isAdmin) {
    return (
      <Box className="flex-1 bg-phase-canvas">
        <HStack className="p-4 pt-10 items-center bg-phase-surface border-b border-border gap-4">
          <Pressable onPress={handleHideAdmin}>
            <Icon as={ChevronLeft} size="md" className="text-ink" />
          </Pressable>
          <Text className="font-black text-lg text-ink">{t('community.groups.manage')}</Text>
        </HStack>
        <GroupMemberManagement groupId={groupId} />
      </Box>
    );
  }

  const renderHeader = () => (
    <VStack className="p-5 gap-6">
      <AnimatedView entering={FadeInDown.duration(600).springify()}>
        <SanctuaryCard className="bg-phase-surface border border-border rounded-[32px] overflow-hidden p-6 shadow-sm">
          <VStack className="gap-5">
            <HStack className="items-center gap-5">
              <Box
                className={`w-18 h-18 rounded-3xl justify-center items-center overflow-hidden border-2 border-border ${group.image_url ? 'bg-transparent' : 'bg-phase-interactive'}`}
              >
                {group.image_url ? (
                  <Image source={{ uri: group.image_url }} className="w-full h-full" />
                ) : (
                  <Text className="text-3xl font-black text-white">
                    {group.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </Box>
              <VStack className="flex-1 gap-1">
                <HStack className="items-center gap-2 flex-wrap">
                  <Text className="font-black text-2xl text-ink" numberOfLines={2}>
                    {group.name}
                  </Text>
                  {group.classroom_id && (
                    <Box className="px-2 py-0.5 bg-phase-interactive/10 rounded-full border border-phase-interactive/20">
                      <Text className="text-phase-interactive text-[10px] font-black uppercase">
                        CLASSROOM
                      </Text>
                    </Box>
                  )}
                </HStack>
                <HStack className="items-center gap-1.5">
                  <Icon as={Users} size="xs" className="text-ink/40" />
                  <Text className="text-ink/60 text-xs font-bold uppercase tracking-wider">
                    {group.member_count || 0} {t('community.groups.members')}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            <Text className="text-ink/70 text-sm leading-relaxed font-medium">
              {group.description || t('community.groups.noDesc')}
            </Text>

            {!isAdmin && (
              <Box className="mt-1">
                <SanctuaryButton
                  action={isMember ? 'secondary' : 'primary'}
                  onPress={isMember ? () => {} : handleJoin}
                  isDisabled={isMember}
                  className="h-12 rounded-xl"
                >
                  <HStack className="items-center gap-2">
                    {isJoiningGroup ? (
                      <Spinner />
                    ) : (
                      <>
                        <Icon
                          as={isMember ? Users : UserPlus}
                          size="sm"
                          className={isMember ? 'text-ink/60' : 'text-white'}
                        />
                        <Text
                          className={isMember ? 'text-ink/60 font-bold' : 'text-white font-bold'}
                        >
                          {isMember
                            ? t('community.groups.member') || 'Member'
                            : t('community.groups.join')}
                        </Text>
                      </>
                    )}
                  </HStack>
                </SanctuaryButton>
              </Box>
            )}
          </VStack>
        </SanctuaryCard>
      </AnimatedView>

      <PinnedResourcesShelf resources={[]} />

      <HStack className="items-center px-1 gap-2">
        <Box className="w-8 h-8 rounded-full bg-phase-interactive/10 items-center justify-center">
          <Icon as={MessageSquare} size="xs" className="text-phase-interactive" />
        </Box>
        <Text className="font-black text-sm uppercase tracking-[2px] text-ink/40">
          {t('community.groups.feed')}
        </Text>
      </HStack>
    </VStack>
  );

  return (
    <ScreenWrapper noTopInset scroll={false} className="bg-phase-canvas">
      <Box className="flex-1">
        {/* Custom Precise Header */}
        <HStack className="p-4 items-center justify-between border-b border-border/10 bg-phase-canvas">
          <HStack className="items-center gap-4">
            <Pressable
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-phase-surface border border-border items-center justify-center"
            >
              <Icon as={ChevronLeft} size="sm" className="text-ink" />
            </Pressable>
            <Text className="font-black text-lg text-ink max-w-[200px]" numberOfLines={1}>
              {group.name}
            </Text>
          </HStack>

          <HStack className="items-center gap-3">
            <Pressable
              onPress={handleChatNavigate}
              className="w-10 h-10 rounded-xl bg-phase-surface border border-border items-center justify-center"
            >
              <Icon as={MessageSquare} size="sm" className="text-ink/60" />
            </Pressable>
            {isAdmin && (
              <Pressable
                onPress={handleShowAdmin}
                className="w-10 h-10 rounded-xl bg-phase-surface border border-border items-center justify-center"
              >
                <Icon as={Settings} size="sm" className="text-ink/60" />
              </Pressable>
            )}
            <Pressable
              onPress={handleShowQR}
              className="w-10 h-10 rounded-xl bg-phase-surface border border-border items-center justify-center"
            >
              <Icon as={QrCode} size="sm" className="text-ink/60" />
            </Pressable>
            <Pressable className="w-10 h-10 rounded-xl bg-phase-surface border border-border items-center justify-center">
              <Icon as={MoreVertical} size="sm" className="text-ink/60" />
            </Pressable>
          </HStack>
        </HStack>

        <SanctuaryFlashList
          data={posts}
          estimatedItemSize={280}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }: { item: any; index: number }) => (
            <AnimatedView
              entering={FadeInDown.duration(400)
                .delay(index * 150)
                .springify()}
            >
              <Box className="px-5 pb-5">
                <PostCard
                  post={item}
                  currentUserId={user?.id}
                  onPress={handlePostPressEmpty}
                  onLike={() => handlePostLike(item.id)}
                  onComment={() => handlePostComment(item.id, item.author_id, item.post_type)}
                  onReport={
                    flags.isSocialShieldEnabled ? () => handlePostReport(item.id) : undefined
                  }
                />
              </Box>
            </AnimatedView>
          )}
          ListEmptyComponent={
            posts.length === 0 ? (
              <VStack className="py-20 items-center justify-center gap-4">
                <Box className="w-16 h-16 rounded-full bg-ink/5 items-center justify-center">
                  <Icon as={MessageSquare} size="lg" className="text-ink/20" />
                </Box>
                <Text className="text-ink/40 text-sm font-bold text-center px-10">
                  {t('community.groups.emptyFeed') ||
                    'The feed is quiet. Start a resonance in this circle!'}
                </Text>
              </VStack>
            ) : null
          }
        />

        <SocialShieldModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setReportPostId(undefined);
          }}
          postId={reportPostId}
          groupId={groupId}
        />

        <CommentSheet
          postId={commentPostId}
          postAuthorId={commentPostAuthorId}
          currentUserId={user?.id}
          postType={commentPostType}
          onClose={() => setCommentPostId(null)}
        />

        <SanctuaryModal
          isOpen={showQRModal}
          onClose={handleHideQR}
          title={t('community.groups.qrTitle')}
        >
          <VStack className="items-center py-8 gap-8">
            <Box className="p-6 bg-white rounded-[40px] shadow-2xl">
              <QRCodeGenerator value={QRBuilder.group(group.id, group.handle)} size={220} />
            </Box>
            <VStack className="items-center gap-2 px-10">
              <Text className="font-black text-2xl text-center text-ink">{group.name}</Text>
              {group.handle && (
                <Text className="text-phase-interactive text-sm font-bold">@{group.handle}</Text>
              )}
              <Text className="text-xs text-ink/40 text-center mt-3 font-medium leading-relaxed">
                {t('community.groups.qrHint')}
              </Text>
            </VStack>

            <SanctuaryButton
              action="secondary"
              className="w-full h-14 rounded-2xl border-border bg-ink/5"
              onPress={handleHideQR}
            >
              <Text className="text-ink font-bold">{t('common.close') || 'Close'}</Text>
            </SanctuaryButton>
          </VStack>
        </SanctuaryModal>
      </Box>
    </ScreenWrapper>
  );
}
