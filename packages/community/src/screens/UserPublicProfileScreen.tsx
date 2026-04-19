import React, { useEffect, useState, useCallback } from "react";
import { ScrollView } from "react-native";
import {
  Box,
  VStack,
  HStack,
  Text,
  UserAvatar,
  ScreenWrapper,
  GlobalHeader,
  SanctuaryCard,
  SanctuaryButton,
  Spinner,
  useRegisterFAB,
  Icon
} from '@repo/ui';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from "react-i18next";
import { supabase, usePermissions } from '@repo/core';
import { BadgeCheck, BookOpen, MessageSquare, ThumbsUp, School, Send, Info, ShieldAlert, Shield } from 'lucide-react-native';
import { communityAPI } from '../api/community';
import { useStore } from '@repo/core';
import type { CommunityStackParamList } from '@repo/core';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SocialShieldModal from '../components/SocialShieldModal';

type Nav = NativeStackNavigationProp<CommunityStackParamList, "UserProfile">;

interface PublicUser {
  id: string;
  full_name: string;
  authority: string;
  avatar_url?: string | null;
  bio?: string | null;
  school_name?: string | null;
  public_profile?: boolean;
}

const AUTHORITY_LABELS: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  grade_head: "Grade Head",
  section_head: "Section Head",
  principal: "Principal",
  founder: "Founder",
  admin: "Admin",
};

export default function UserPublicProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { userId: userIdParam, id, userName } =
    ((route as { params?: { userId?: string; id?: string; userName?: string } }).params ?? {});
  const userId = userIdParam || id || '';
  const { can, flags } = usePermissions();
  const currentUserId = useStore((state) => state.user?.id);

  const [user, setUser] = useState<PublicUser | null>(null);
  const [stats, setStats] = useState({ posts: 0, endorsements: 0 });
  const [loading, setLoading] = useState(true);
  const [initiatingDM, setInitiatingDM] = useState(false);
  const [showShieldModal, setShowShieldModal] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      if (!userId) {
        console.error("UserPublicProfileScreen: missing user id in route params");
        setLoading(false);
        return;
      }
      
      const { data: userData } = await supabase
        .from('users')
        .select('id, full_name, authority, avatar_url, public_profile, bio, school:schools(name)')
        .eq('id', userId)
        .single();

      if (userData) {
        setUser({
          id: userData.id,
          full_name: userData.full_name,
          authority: userData.authority,
          avatar_url: userData.avatar_url,
          bio: userData.bio,
          public_profile: userData.public_profile ?? true,
          school_name: (userData.school as any)?.name ?? null,
        });
      }

      const { count: postCount } = await supabase
        .from("community_posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", userId)
        .eq("is_anonymous", false);

      const { count: endorseCount } = await supabase
        .from("resource_engagements")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("engagement_type", "endorse");

      setStats({
        posts: postCount ?? 0,
        endorsements: endorseCount ?? 0,
      });
    } catch (err) {
      console.error("UserPublicProfileScreen fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const authorityLabel = AUTHORITY_LABELS[user?.authority ?? ""] ?? user?.authority ?? "";
  const isPrivate = user && user.public_profile === false && currentUserId !== userId;

  const handleMessagePress = async () => {
    if (!userId || initiatingDM) return;
    setInitiatingDM(true);
    try {
      const conversationId = await communityAPI.getOrCreateDirectConversation(userId);
      navigation.navigate('DirectMessage', {
        conversationId,
        userName: user?.full_name || userName || 'Explorer'
      });
    } catch (err) {
      console.error("Failed to initiate DM", err);
    } finally {
      setInitiatingDM(false);
    }
  };

  useRegisterFAB({
    tabType: 'profile',
    visible: !loading && !!user && !!currentUserId && currentUserId !== userId && flags.isMessagingEnabled && can('create', 'DirectConversation'),
    onPress: handleMessagePress,
    icon: <Icon as={Send} size="md" className="text-white" />
  });

  return (
    <ScreenWrapper noTopInset scroll={false} className="bg-phase-canvas">
      <GlobalHeader
        title={user?.full_name ?? userName ?? "Profile"}
        subtitle={authorityLabel}
        showBack
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <Box className="flex-1 items-center justify-center">
          <Spinner />
          <Text className="text-ink/40 text-xs font-bold uppercase tracking-widest mt-4">Gathering Presence...</Text>
        </Box>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        >
          <VStack className="gap-5">
            {/* Basic Identity Card */}
            <SanctuaryCard className="bg-phase-surface border border-border rounded-[32px] overflow-hidden">
              <VStack className="items-center p-6 gap-5">
                <Box className="shadow-xl">
                  <UserAvatar
                    avatarUrl={user?.avatar_url}
                    fullName={user?.full_name ?? userName ?? "?"}
                    authority={user?.authority}
                    size={120}
                  />
                </Box>

                <VStack className="items-center gap-2">
                  <Text className="text-ink text-2xl font-black">
                    {user?.full_name ?? userName}
                  </Text>

                  <HStack className="items-center gap-2 bg-phase-interactive/10 px-3 py-1 rounded-full border border-phase-interactive/20">
                    <Icon as={BadgeCheck} size="xs" className="text-phase-interactive" />
                    <Text className="text-phase-interactive text-[12px] font-bold">
                      {authorityLabel}
                    </Text>
                  </HStack>

                  {user?.school_name && (
                    <HStack className="items-center gap-1.5 mt-1">
                      <Icon as={School} size="xs" className="text-ink/40" />
                      <Text className="text-ink/60 text-xs font-medium">{user.school_name}</Text>
                    </HStack>
                  )}
                </VStack>

                {isPrivate && (
                  <HStack className="mt-1 items-center gap-2 px-3 py-1.5 bg-ink/5 rounded-xl border border-border/50">
                    <Icon as={Shield} size="xs" className="text-ink/40" />
                    <Text className="text-[11px] text-ink/60 font-medium italic">
                      {t("community.profile.privateSanctuary") || "Private Sanctuary"}
                    </Text>
                  </HStack>
                )}

                {user && currentUserId && currentUserId !== userId && (
                  <VStack className="w-full mt-4 gap-3">
                    {flags.isMessagingEnabled && can('create', 'DirectConversation') && (
                        <SanctuaryButton
                            action="primary"
                            onPress={handleMessagePress}
                            isDisabled={initiatingDM}
                            className="h-12 rounded-xl"
                        >
                            <HStack className="items-center gap-2">
                                {initiatingDM ? <Spinner /> : <Icon as={Send} size="sm" className="text-white" />}
                                <Text className="text-white font-bold">
                                    {t("community.profile.sendMessage")}
                                </Text>
                            </HStack>
                        </SanctuaryButton>
                    )}

                    {flags.isSocialShieldEnabled && (
                        <SanctuaryButton
                            action="secondary"
                            onPress={() => setShowShieldModal(true)}
                            className="h-12 rounded-xl border-border bg-transparent"
                        >
                            <HStack className="items-center gap-2">
                                <Icon as={ShieldAlert} size="sm" className="text-ink/60" />
                                <Text className="text-ink/60 font-bold">
                                    {t("community.profile.reportAccount")}
                                </Text>
                            </HStack>
                        </SanctuaryButton>
                    )}
                  </VStack>
                )}
              </VStack>
            </SanctuaryCard>

            {isPrivate ? (
              <Box className="p-6 items-center bg-ink/5 rounded-2xl border border-dashed border-border/60">
                <Text className="text-center text-ink/40 text-xs font-medium leading-relaxed">
                  {t("community.profile.privateNote") || "This explorer has chosen to keep their detailed presence private within the sanctuary."}
                </Text>
              </Box>
            ) : (
              <>
                {user?.bio && (
                  <SanctuaryCard className="bg-phase-surface border border-border rounded-3xl">
                    <VStack className="p-5 gap-3">
                      <HStack className="items-center gap-2 opacity-60">
                        <Icon as={Info} size="xs" className="text-phase-interactive" />
                        <Text className="text-ink text-[10px] font-bold uppercase tracking-widest">
                          {t("community.profile.aspiration")}
                        </Text>
                      </HStack>
                      <Text className="text-ink/70 text-sm leading-relaxed px-1">
                        {user.bio}
                      </Text>
                    </VStack>
                  </SanctuaryCard>
                )}

                <SanctuaryCard className="bg-phase-surface border border-border rounded-3xl">
                  <VStack className="p-5 gap-6">
                    <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-[2px]">
                      {t("community.profile.contributions")}
                    </Text>
                    <HStack className="justify-between items-center px-4">
                      <VStack className="items-center flex-1 gap-2">
                        <Box className="w-10 h-10 rounded-xl bg-phase-interactive/10 items-center justify-center">
                            <Icon as={MessageSquare} size="sm" className="text-phase-interactive" />
                        </Box>
                        <VStack className="items-center gap-0.5">
                            <Text className="text-ink text-xl font-black">{stats.posts}</Text>
                            <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-tight">
                            {t("community.profile.posts")}
                            </Text>
                        </VStack>
                      </VStack>

                      <Box className="w-[1px] bg-border h-12 mx-2" />

                      <VStack className="items-center flex-1 gap-2">
                        <Box className="w-10 h-10 rounded-xl bg-green-500/10 items-center justify-center">
                            <Icon as={ThumbsUp} size="sm" className="text-green-600" />
                        </Box>
                        <VStack className="items-center gap-0.5">
                            <Text className="text-ink text-xl font-black">{stats.endorsements}</Text>
                            <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-tight">
                            {t("community.profile.endorsements")}
                            </Text>
                        </VStack>
                      </VStack>

                      <Box className="w-[1px] bg-border h-12 mx-2" />

                      <VStack className="items-center flex-1 gap-2">
                        <Box className="w-10 h-10 rounded-xl bg-ink/5 items-center justify-center">
                            <Icon as={BookOpen} size="sm" className="text-ink/40" />
                        </Box>
                        <VStack className="items-center gap-0.5">
                            <Text className="text-ink/20 text-md font-black">---</Text>
                            <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-tight text-center">
                            Badges
                            </Text>
                        </VStack>
                      </VStack>
                    </HStack>
                  </VStack>
                </SanctuaryCard>

                <Text className="text-ink/40 text-[10px] font-medium text-center px-10 leading-relaxed">
                  {t("community.profile.privacyNote") || "Profile data is maintained securely within the Sanctuary network."}
                </Text>
              </>
            )}
          </VStack>
        </ScrollView>
      )}

      {showShieldModal && (
        <SocialShieldModal
          isOpen={showShieldModal}
          onClose={() => setShowShieldModal(false)}
          targetUserId={userId}
          targetUserName={user?.full_name ?? userName ?? ""}
        />
      )}
    </ScreenWrapper>
  );
}
