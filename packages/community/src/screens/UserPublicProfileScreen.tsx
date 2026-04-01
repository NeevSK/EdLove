import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, ActivityIndicator } from "react-native";
import {
  Box,
  VStack,
  HStack,
  Text,
  UserAvatar,
  useThemedColors,
  Theme,
  ScreenWrapper,
  GlobalHeader,
  SanctuaryCard,
  Button,
  useRegisterFAB,
} from '@repo/ui';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from "react-i18next";
import { supabase } from '@repo/core';
import { BadgeCheck, BookOpen, MessageSquare, ThumbsUp, School, Send, Shield, Info, ShieldAlert } from 'lucide-react-native';
import { communityAPI } from '../api/community';
import { useStore } from '@repo/core';
import type { CommunityStackParamList } from '@repo/core';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SocialShieldModal from '../components/SocialShieldModal';
import { useLotusToast } from '@repo/ui';

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
  const colors = useThemedColors();

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
        <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
        </Box>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Theme.spacing.lg }}
        >
          <VStack space="md">
            {/* Basic Identity Card */}
            <SanctuaryCard>
              <VStack space="md" sx={{ alignItems: 'center', padding: Theme.spacing.lg }}>
                <UserAvatar
                  avatarUrl={user?.avatar_url}
                  fullName={user?.full_name ?? userName ?? "?"}
                  authority={user?.authority}
                  size={120}
                />

                <VStack space="xs" sx={{ alignItems: "center" }}>
                  <Text sx={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                    {user?.full_name ?? userName}
                  </Text>

                  <HStack space="xs" sx={{ alignItems: "center" }}>
                    <BadgeCheck color={Theme.colors.sanctuarySaffron} size={14} />
                    <Text sx={{ color: colors.textSecondary, fontSize: 13 }}>
                      {authorityLabel}
                    </Text>
                  </HStack>

                  {user?.school_name && (
                    <HStack space="xs" sx={{ alignItems: "center" }}>
                      <School color={colors.textTertiary} size={12} />
                      <Text sx={{ color: colors.textTertiary, fontSize: 11 }}>{user.school_name}</Text>
                    </HStack>
                  )}
                </VStack>

                {isPrivate && (
                  <HStack space="xs" sx={{ marginTop: 4, alignItems: 'center', opacity: 0.6 }}>
                    <Shield size={14} color={colors.textTertiary} />
                    <Text sx={{ fontSize: 11, color: colors.textTertiary, fontStyle: 'italic' }}>
                      {t("community.profile.privateSanctuary") || "Private Sanctuary"}
                    </Text>
                  </HStack>
                )}

                {user && currentUserId && currentUserId !== userId && (
                  <VStack space="sm" sx={{ width: '100%', marginTop: Theme.spacing.md }}>
                    <Button
                      label={t("community.profile.sendMessage")}
                      onPress={handleMessagePress}
                      icon={<Send size={20} color="white" />}
                      variant="primary"
                      loading={initiatingDM}
                    />
                    <Button
                      label={t("community.profile.reportAccount")}
                      onPress={() => setShowShieldModal(true)}
                      icon={<ShieldAlert size={18} color={colors.textSecondary} />}
                      variant="outline"
                    />
                  </VStack>
                )}
              </VStack>
            </SanctuaryCard>

            {isPrivate ? (
              <Box sx={{ padding: Theme.spacing.md, alignItems: 'center' }}>
                <Text sx={{ textAlign: "center", color: colors.textTertiary, fontSize: 13 }}>
                  {t("community.profile.privateNote") || "This explorer has chosen to keep their detailed presence private."}
                </Text>
              </Box>
            ) : (
              <>
                {user?.bio && (
                  <SanctuaryCard>
                    <VStack space="xs" sx={{ padding: Theme.spacing.md }}>
                      <HStack space="xs" sx={{ alignItems: "center", marginBottom: 4 }}>
                        <Info size={14} color={colors.action} />
                        <Text sx={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                          {t("community.profile.aspiration")}
                        </Text>
                      </HStack>
                      <Text sx={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
                        {user.bio}
                      </Text>
                    </VStack>
                  </SanctuaryCard>
                )}

                <SanctuaryCard>
                  <VStack space="md" sx={{ padding: Theme.spacing.md }}>
                    <Text sx={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      {t("community.profile.contributions")}
                    </Text>
                    <HStack space="lg" sx={{ justifyContent: 'space-around' }}>
                      <VStack space="xs" sx={{ alignItems: 'center', flex: 1 }}>
                        <MessageSquare color={colors.action} size={20} />
                        <Text sx={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{stats.posts}</Text>
                        <Text sx={{ color: colors.textTertiary, fontSize: 11 }}>
                          {t("community.profile.posts")}
                        </Text>
                      </VStack>
                      <Box sx={{ width: 1, backgroundColor: colors.border, height: '80%' }} />
                      <VStack space="xs" sx={{ alignItems: 'center', flex: 1 }}>
                        <ThumbsUp color={Theme.colors.sageGreen} size={20} />
                        <Text sx={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{stats.endorsements}</Text>
                        <Text sx={{ color: colors.textTertiary, fontSize: 11 }}>
                          {t("community.profile.endorsements")}
                        </Text>
                      </VStack>
                      <Box sx={{ width: 1, backgroundColor: colors.border, height: '80%' }} />
                      <VStack space="xs" sx={{ alignItems: 'center', flex: 1 }}>
                        <BookOpen color={Theme.colors.gurudeviViolet} size={20} />
                        <Text sx={{ color: colors.textTertiary, fontSize: 11, textAlign: 'center' }}>
                          {t("community.profile.badgesComingSoon") || "Badges Soon"}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </SanctuaryCard>

                <Text sx={{
                  color: colors.textTertiary,
                  fontSize: 11,
                  textAlign: 'center',
                  paddingHorizontal: Theme.spacing.lg,
                  marginTop: Theme.spacing.sm,
                }}>
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
