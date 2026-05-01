import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePermissions } from '@repo/core/logic';
import { supabase } from '@repo/core/api';;
import { useStore } from '@repo/core/store';
import type { CommunityStackParamList } from '@repo/core/types';
import { GiveThuthimalModal } from '@repo/profile';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import LoadingOverlay from '@repo/ui/components/LoadingOverlay';
import { SanctuaryBackground } from '@repo/ui/components/SanctuaryBackground';
import { UserAvatar } from '@repo/ui/components/UserAvatar';
import { Activity, BadgeCheck, Calendar, Gift, Heart, MapPin, Medal, MessageSquare, Send, Shield } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Heading,
  HStack,
  Text,
  VStack,
} from '@repo/ui/primitives';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { communityAPI } from '../api/community';

/**
 * UserPublicProfileScreen.web
 *
 * Optimized 3-Column Desktop Layout:
 * Left: Profile Card & Actions
 * Center: Public Feed & Contributions
 * Right: Stats, Badges & Relationships
 */
export default function UserPublicProfileScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
  const params = (route as any)?.params ?? {};
  const {
    userId: userIdParam,
    id,
    userName,
  } = params as {
    userId?: string;
    id?: string;
    userName?: string;
  };
  const userId = userIdParam || id || '';
  const { context, can } = usePermissions();
  const currentUserId = context.userId;
  const currentUser = useStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [initiatingDM, setInitiatingDM] = useState(false);
  const [showThuthimal, setShowThuthimal] = useState(false);
  const [stats, setStats] = useState({ posts: 0, endorsements: 0 });

  const loadProfile = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          'id, full_name, authority:role, avatar_url, public_profile, username, bio, school:schools(name)',
        )
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser({
        ...data,
        school_name: (data.school as any)?.name ?? null,
      });

      const [postsRes, endorsementsRes] = await Promise.all([
        supabase
          .from('community_posts')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', userId)
          .eq('is_anonymous', false),
        supabase
          .from('resource_engagements')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('engagement_type', 'endorse'),
      ]);

      setStats({
        posts: postsRes.count ?? 0,
        endorsements: endorsementsRes.count ?? 0,
      });
    } catch (error) {
      console.error('[UserProfile.web] Load Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadProfile();
    } else {
      setUser(null);
      setStats({ posts: 0, endorsements: 0 });
      setLoading(false);
    }
  }, [userId, loadProfile]);

  const handleMessagePress = async () => {
    if (!currentUserId || !userId) return;
    setInitiatingDM(true);
    try {
      const conversationId = await communityAPI.getOrCreateDirectConversation(userId);
      navigation.navigate('DirectMessage', {
        conversationId: conversationId,
        userName: user?.full_name || userName || 'User',
      });
    } catch (error) {
      console.error('[UserProfile.web] DM Error:', error);
    } finally {
      setInitiatingDM(false);
    }
  };

  const isPrivate = user && user.public_profile === false && currentUserId !== userId;

  return (
    <Box className="flex-1 w-full h-full">
      <SanctuaryBackground />

      <HStack className="flex-1">
        {/* 1. Left Column: Profile Card */}
        <Box className="w-[340px] h-full border-r border-outline-variant bg-surface-lowest">
          <VStack className="gap-6 p-8">
            <VStack className="items-center gap-4">
              <HStack className="justify-center mb-4">
                <UserAvatar
                  avatarUrl={user?.avatar_url}
                  fullName={user?.full_name || userName}
                  size={120}
                />
              </HStack>

              <VStack className="items-center gap-1">
                <HStack className="gap-1.5 items-center">
                  <Heading className="text-2xl font-black text-foreground">
                    {user?.full_name || userName}
                  </Heading>
                  <BadgeCheck size={20} color="#E67E22" />
                </HStack>
                <Text className="text-sm text-muted-foreground">@{user?.username || 'member'}</Text>
              </VStack>
            </VStack>

            <VStack className="gap-3">
              {user?.school_name && <InfoRow icon={<MapPin size={16} />} text={user.school_name} />}
              <InfoRow
                icon={<Calendar size={16} />}
                text={t('community.profile.memberOfGurudevi') || 'Member of Gurudevi'}
              />
              <InfoRow
                icon={<Shield size={16} />}
                text={user?.authority?.toUpperCase() || 'MEMBER'}
              />
            </VStack>

            {isPrivate && (
              <HStack className="gap-2 items-center opacity-70 p-3 rounded-xl bg-black/5">
                <Shield size={14} color="rgba(255,255,255,0.6)" />
                <Text className="text-[12px] text-muted-foreground italic">
                  {t('community.profile.privateSanctuary') || 'Private Sanctuary'}
                </Text>
              </HStack>
            )}

            {currentUserId !== userId && (
              <VStack className="gap-2.5 mt-3">
                <Button
                  variant="solid"
                  onPress={handleMessagePress}
                  isDisabled={initiatingDM}
                  className="h-[52px] rounded-[26px]"
                >
                  <ButtonIcon as={Send} size={18} color="white" />
                  <ButtonText className="text-white font-extrabold ml-2">
                    {t('community.profile.sendMessage')}
                  </ButtonText>
                </Button>
                {can('create', { __typename: 'Thuthimal', recipient_id: userId } as any) &&
                  currentUser && (
                    <Button
                      variant="outline"
                      onPress={() => setShowThuthimal(true)}
                      className="h-[52px] rounded-[26px]"
                    >
                      <ButtonIcon as={Gift} size={18} color="#E67E22" />
                      <ButtonText className="font-extrabold ml-2">Send Thuthimal {'=O'}</ButtonText>
                    </Button>
                  )}
              </VStack>
            )}

            {currentUser && (
              <GiveThuthimalModal
                isOpen={showThuthimal}
                onClose={() => setShowThuthimal(false)}
                recipientId={userId}
                recipientName={user?.full_name ?? userName}
                recipientTier={user?.authority ?? 'teacher'}
                giverId={currentUser.id}
                giverName={currentUser.full_name ?? 'A Colleague'}
              />
            )}
          </VStack>
        </Box>

        {/* 2. Center Column: Contributions Feed */}
        <Box className="flex-1 h-full">
          <GlobalHeader
            title={t('community.profile.resonanceSphere') || 'Resonance Sphere'}
            subtitle={`${t('community.profile.publicPresenceOf') || 'Public presence of'} ${user?.full_name || userName}`}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 40 }}>
            <VStack className="gap-6 max-w-[700px] w-full self-center">
              {isPrivate ? (
                <Box className="p-10 rounded-3xl bg-surface-lowest border border-outline-variant items-center gap-4">
                  <Shield size={48} color="rgba(255,255,255,0.4)" />
                  <Text className="text-base text-muted-foreground text-center">
                    {t('community.profile.privateNote') ||
                      'This explorer has chosen to keep their detailed presence private.'}
                  </Text>
                </Box>
              ) : (
                <>
                  <Box className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant">
                    <VStack className="gap-3">
                      <Heading className="text-[18px] font-extrabold text-foreground">
                        {t('community.profile.aspiration')}
                      </Heading>
                      <Text className="text-base leading-relaxed text-muted-foreground">
                        {user?.bio ||
                          t('community.profile.defaultBio') ||
                          'This user is on a journey of growth and resonance within the Gurudevi ecosystem.'}
                      </Text>
                    </VStack>
                  </Box>

                  <Heading className="text-xl font-black text-foreground mt-3">
                    {t('community.profile.publicResonance') || 'Public Resonance'}
                  </Heading>

                  {[1, 2, 3].map((i) => (
                    <Box
                      key={i}
                      className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant"
                    >
                      <VStack className="gap-3">
                        <HStack className="justify-between">
                          <Text className="text-[12px] font-bold text-primary-500">
                            {(t('community.profile.reflection') || 'REFLECTION').toUpperCase()}
                          </Text>
                          <Text className="text-[12px] text-muted-foreground">
                            {t('community.profile.recent') || 'Recent'}
                          </Text>
                        </HStack>
                        <Text className="text-[15px] leading-relaxed text-foreground">
                          The intersection of ancient mindfulness and modern algorithmic efficiency
                          is where true wisdom resides.
                        </Text>
                        <HStack className="gap-4">
                          <HStack className="gap-1 items-center">
                            <Heart size={14} color="rgba(255,255,255,0.4)" />
                            <Text className="text-[13px] text-muted-foreground">--</Text>
                          </HStack>
                          <HStack className="gap-1 items-center">
                            <MessageSquare size={14} color="rgba(255,255,255,0.4)" />
                            <Text className="text-[13px] text-muted-foreground">--</Text>
                          </HStack>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </>
              )}
            </VStack>
          </ScrollView>
        </Box>

        {/* 3. Right Column: Stats & Badges */}
        <Box className="w-[320px] h-full border-l border-outline-variant bg-white/[0.01]">
          <VStack className="gap-8 p-8">
            {!isPrivate && (
              <>
                <VStack className="gap-4">
                  <Heading className="text-[18px] font-extrabold text-foreground">
                    {t('community.profile.resonanceStats')}
                  </Heading>
                  <HStack className="flex-wrap gap-3">
                    <StatCard
                      label={t('community.profile.posts') || 'Posts'}
                      value={stats.posts.toString()}
                      icon={<MessageSquare size={16} />}
                    />
                    <StatCard
                      label={t('community.profile.endorsements') || 'Endorsements'}
                      value={stats.endorsements.toString()}
                      icon={<Heart size={16} />}
                    />
                    <StatCard
                      label={t('community.profile.pulse') || 'Pulse'}
                      value={t('community.profile.pulseActive') || 'Active'}
                      icon={<Activity size={16} />}
                    />
                  </HStack>
                </VStack>

                <VStack className="gap-4">
                  <Heading className="text-[18px] font-extrabold text-foreground">
                    {t('community.profile.sanctuaryHonors')}
                  </Heading>
                  <VStack className="gap-3">
                    <BadgeItem
                      icon={<Medal size={18} color="#E67E22" />}
                      title={t('community.profile.explorer') || 'Explorer'}
                    />
                    <BadgeItem
                      icon={<BadgeCheck size={18} color="#10b981" />}
                      title={t('community.profile.verified') || 'Verified'}
                    />
                  </VStack>
                </VStack>
              </>
            )}
            {isPrivate && (
              <VStack className="gap-3 items-center p-5 rounded-[20px] border border-dashed border-outline-variant">
                <Shield size={24} color="rgba(255,255,255,0.4)" />
                <Text className="text-[12px] text-muted-foreground text-center">
                  {t('community.profile.privacyProtected') || 'Privacy Protected'}
                </Text>
              </VStack>
            )}
          </VStack>
        </Box>
      </HStack>

      <LoadingOverlay visible={loading} />
    </Box>
  );
}

function InfoRow({ icon, text }: { icon: any; text: string }) {
  return (
    <HStack className="gap-3 items-center">
      {React.cloneElement(icon, { size: 16, color: 'rgba(255,255,255,0.6)' })}
      <Text className="text-sm text-muted-foreground">{text}</Text>
    </HStack>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: any }) {
  return (
    <VStack className="flex-1 min-w-[100px] p-4 rounded-[20px] bg-surface-lowest border border-outline-variant gap-1">
      <HStack className="justify-between items-center">
        {React.cloneElement(icon as React.ReactElement<any>, {
          color: '#E67E22',
          size: 14,
        })}
        <Text className="text-[18px] font-black text-foreground">{value}</Text>
      </HStack>
      <Text className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
        {label}
      </Text>
    </VStack>
  );
}

function BadgeItem({ icon, title }: { icon: any; title: string }) {
  return (
    <HStack className="p-3.5 rounded-2xl bg-surface-lowest border border-outline-variant items-center gap-3">
      {icon}
      <Text className="text-sm font-bold text-foreground">{title}</Text>
    </HStack>
  );
}
