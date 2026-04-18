import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, ActivityIndicator } from "react-native";
import {
  Box,
  VStack,
  HStack,
  Text,
  UserAvatar,
  ScreenWrapper,
  GlobalHeader,
  SanctuaryCard,
  Button,
  ButtonText,
  ButtonIcon,
  ButtonSpinner,
  useRegisterFAB,
  Theme
} from '@repo/ui';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from "react-i18next";
import { supabase } from '@repo/core';
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
    visible: !loading && !!user && !!currentUserId && currentUserId !== userId,
    onPress: handleMessagePress,
    icon: <Send size={24} color="white" />
  });

  return (
    <ScreenWrapper scroll={false} noTopInset={true}>
      <GlobalHeader
        title={user?.full_name ?? userName ?? "Profile"}
        subtitle={authorityLabel}
        showBack
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E67E22" />
        </Box>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16 }}
        >
          <VStack className="gap-4">
            {/* Basic Identity Card */}
            <SanctuaryCard className="bg-surface-lowest">
              <VStack className="items-center p-4 gap-4">
                <UserAvatar
                  avatarUrl={user?.avatar_url}
                  fullName={user?.full_name ?? userName ?? "?"}
                  authority={user?.authority}
                  size={120}
                />

                <VStack className="items-center gap-1">
                  <Text className="text-foreground text-xl font-bold">
                    {user?.full_name ?? userName}
                  </Text>

                  <HStack className="items-center gap-1">
                    <BadgeCheck color="#E67E22" size={14} />
                    <Text className="text-muted-foreground text-[13px]">
                      {authorityLabel}
                    </Text>
                  </HStack>

                  {user?.school_name && (
                    <HStack className="items-center gap-1">
                      <School color="rgba(255,255,255,0.6)" size={12} />
                      <Text className="text-muted-foreground text-[11px]">{user.school_name}</Text>
                    </HStack>
                  )}
                </VStack>

                {isPrivate && (
                  <HStack className="mt-1 items-center opacity-60 gap-1">
                    <Shield size={14} color="rgba(255,255,255,0.6)" />
                    <Text className="text-[11px] text-muted-foreground italic">
                      {t("community.profile.privateSanctuary") || "Private Sanctuary"}
                    </Text>
                  </HStack>
                )}

                {user && currentUserId && currentUserId !== userId && (
                  <VStack className="w-full mt-4 gap-2">
                    <Button
                      onPress={handleMessagePress}
                      variant="solid"
                      isDisabled={initiatingDM}
                    >
                      {initiatingDM ? <ButtonSpinner color="white" /> : <ButtonIcon as={Send} size={20} color="white" />}
                      <ButtonText className="text-white ml-2">
                        {t("community.profile.sendMessage")}
                      </ButtonText>
                    </Button>
                    <Button
                      onPress={() => setShowShieldModal(true)}
                      variant="outline"
                    >
                      <ButtonIcon as={ShieldAlert} size={18} color="rgba(255,255,255,0.6)" />
                      <ButtonText className="text-muted-foreground ml-2">
                        {t("community.profile.reportAccount")}
                      </ButtonText>
                    </Button>
                  </VStack>
                )}
              </VStack>
            </SanctuaryCard>

            {isPrivate ? (
              <Box className="p-4 items-center">
                <Text className="text-center text-muted-foreground text-[13px]">
                  {t("community.profile.privateNote") || "This explorer has chosen to keep their detailed presence private."}
                </Text>
              </Box>
            ) : (
              <>
                {user?.bio && (
                  <SanctuaryCard className="bg-surface-lowest">
                    <VStack className="p-4 gap-1">
                      <HStack className="items-center mb-1 gap-1">
                        <Info size={14} color="#E67E22" />
                        <Text className="text-muted-foreground text-[10px] font-extrabold uppercase tracking-tight">
                          {t("community.profile.aspiration")}
                        </Text>
                      </HStack>
                      <Text className="text-foreground text-sm leading-relaxed">
                        {user.bio}
                      </Text>
                    </VStack>
                  </SanctuaryCard>
                )}

                <SanctuaryCard className="bg-surface-lowest">
                  <VStack className="p-4 gap-4">
                    <Text className="text-muted-foreground text-[10px] font-extrabold uppercase tracking-widest">
                      {t("community.profile.contributions")}
                    </Text>
                    <HStack className="justify-around items-center gap-4">
                      <VStack className="items-center flex-1 gap-1">
                        <MessageSquare color="#E67E22" size={20} />
                        <Text className="text-foreground text-lg font-bold">{stats.posts}</Text>
                        <Text className="text-muted-foreground text-[11px]">
                          {t("community.profile.posts")}
                        </Text>
                      </VStack>
                      <Box className="w-[1px] bg-outline-variant h-5/6" />
                      <VStack className="items-center flex-1 gap-1">
                        <ThumbsUp color="#2ECC71" size={20} />
                        <Text className="text-foreground text-lg font-bold">{stats.endorsements}</Text>
                        <Text className="text-muted-foreground text-[11px]">
                          {t("community.profile.endorsements")}
                        </Text>
                      </VStack>
                      <Box className="w-[1px] bg-outline-variant h-5/6" />
                      <VStack className="items-center flex-1 gap-1">
                        <BookOpen color="#3498DB" size={20} />
                        <Text className="text-muted-foreground text-[11px] text-center">
                          {t("community.profile.badgesComingSoon") || "Badges Soon"}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </SanctuaryCard>

                <Text className="text-muted-foreground text-[11px] text-center px-4 mt-2">
                  {t("community.profile.privacyNote")}
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
