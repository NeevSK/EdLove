import React, { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity } from "react-native";
import {
  VStack,
  HStack,
  Box,
  Text,
  Heading,
  Button,
  ScreenWrapper,
  LoadingOverlay,
  useThemedColors,
  Theme,
  useTheme,
  SanctuaryBackground,
  GlobalHeader,
  UserAvatar
} from '@repo/ui';
import {
  Send,
  UserCircle,
  MapPin,
  Calendar,
  Shield,
  Medal,
  Activity,
  MessageSquare,
  Heart,
  BadgeCheck,
  Info,
  Gift
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CommunityStackParamList } from "@repo/core";
import { usePermissions, supabase, useStore } from "@repo/core";
import { GiveThuthimalModal } from "@repo/profile";
import { communityAPI } from "../api/community";

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
  const navigation =
    useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
  const params = (route as any)?.params ?? {};
  const { userId: userIdParam, id, userName } = params as {
    userId?: string;
    id?: string;
    userName?: string;
  };
  const userId = userIdParam || id || "";
  const { context, can } = usePermissions();
  const currentUserId = context.userId;
  const currentUser = useStore(state => state.user);
  const { glass, text, accent } = useTheme();
  const colors = useThemedColors();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [initiatingDM, setInitiatingDM] = useState(false);
  const [showThuthimal, setShowThuthimal] = useState(false);
  const [stats, setStats] = useState({ posts: 0, endorsements: 0 });

  useEffect(() => {
    if (userId) {
      loadProfile();
    } else {
      // No user identifier provided; ensure we are not stuck in a loading state
      setUser(null);
      setStats({ posts: 0, endorsements: 0 });
      setLoading(false);
    }
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) {
      // Guard against calling Supabase with an empty or missing userId
      return;
    }
    setLoading(true);
    try {
      // Fetch profile data directly using supabase
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, authority:role, avatar_url, public_profile, username, bio, school:schools(name)')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser({
        ...data,
        school_name: (data.school as any)?.name ?? null
      });

      // Parallel stats fetching for parity with mobile
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
          .eq('engagement_type', 'endorse')
      ]);

      setStats({
        posts: postsRes.count ?? 0,
        endorsements: endorsementsRes.count ?? 0
      });
    } catch (error) {
      console.error('[UserProfile.web] Load Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessagePress = async () => {
    if (!currentUserId || !userId) return;
    setInitiatingDM(true);
    try {
      const conversationId =
        await communityAPI.getOrCreateDirectConversation(userId);
      navigation.navigate("DirectMessage", {
        conversationId: conversationId,
        userName: user?.full_name || userName || "User",
      });
    } catch (error) {
      console.error("[UserProfile.web] DM Error:", error);
    } finally {
      setInitiatingDM(false);
    }
  };

  const isPrivate = user && user.public_profile === false && currentUserId !== userId;

  return (
    <View style={webStyles.container}
      <SanctuaryBackground /

      <View style={webStyles.layout}
        {/* 1. Left Column: Profile Card */}
        <View style={[webStyles.sidebar, {
          backgroundColor: glass.surface.bg,
          borderRightColor: glass.surface.border,
          // @ts-ignore
          backdropFilter: `blur(${glass.surface.blur}px)`
        }]}
          <VStack sx={{ gap: 24, padding: 32 }}
            <VStack sx={{ alignItems: 'center', gap: 16 }}
              <HStack sx={{ justifyContent: 'center', marginBottom: 16 }}
                <UserAvatar
                  avatarUrl={user?.avatar_url}
                  fullName={user?.full_name || userName}
                  size={120}
                /
              </HStack

              <VStack sx={{ alignItems: "center", gap: 4 }}
                <HStack sx={{ gap: 6, alignItems: "center" }}
                  <Heading
                    sx={{
                      fontSize: 24,
                      fontWeight: "900",
                      color: text.primary,
                    }}
                  
                    {user?.full_name || userName}
                  </Heading
                  <BadgeCheck size={20} color={Theme.colors.sanctuarySaffron} /
                </HStack
                <Text sx={{ fontSize: 14, color: text.secondary }}
                  @{user?.username || "member"}
                </Text
              </VStack
            </VStack

            <VStack sx={{ gap: 12 }}
              {user?.school_name && <InfoRow icon={<MapPin size={16} />} text={user.school_name} />}
              <InfoRow icon={<Calendar size={16} />} text={t("community.profile.memberOfGurudevi") || "Member of Gurudevi"} /
              <InfoRow icon={<Shield size={16} />} text={user?.authority?.toUpperCase() || 'MEMBER'} /
            </VStack

            {isPrivate && (
              <HStack sx={{ gap: 8, alignItems: 'center', opacity: 0.7, padding: 12, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)' }}
                <Shield size={14} color={text.secondary} /
                <Text sx={{ fontSize: 12, color: text.secondary, fontStyle: 'italic' }}
                  {t("community.profile.privateSanctuary") || "Private Sanctuary"}
                </Text
              </HStack
            )}

            {currentUserId !== userId && (
              <VStack sx={{ gap: 10, marginTop: 12 }}
                <Button
                  action="primary"
                  onPress={handleMessagePress}
                  isDisabled={initiatingDM}
                  sx={{
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: Theme.colors.sanctuarySaffron,
                  }}
                
                  <HStack sx={{ gap: 8, alignItems: 'center' }}
                    <Send size={18} color="white" /
                    <Text sx={{ color: 'white', fontWeight: '800' }}
                      {t("community.profile.sendMessage")}
                    </Text
                  </HStack
                </Button
                {can('create', { __typename: 'Thuthimal', recipientId: userId } as any) && currentUser && (
                  <Button
                    action="secondary"
                    onPress={() => setShowThuthimal(true)}
                    sx={{ height: 52, borderRadius: 26 }}
                  
                    <HStack sx={{ gap: 8, alignItems: 'center' }}
                      <Gift size={18} /
                      <Text sx={{ fontWeight: '800' }}>Send Thuthimal {'=O'}</Text
                    </HStack
                  </Button
                )}
              </VStack
            )}

            {/* Thuthimal gift modal */}
            {currentUser && (
              <GiveThuthimalModal
                isOpen={showThuthimal}
                onClose={() => setShowThuthimal(false)}
                recipientId={userId}
                recipientName={user?.full_name ?? userName}
                recipientTier={user?.authority ?? 'teacher'}
                giverId={currentUser.id}
                giverName={currentUser.full_name ?? 'A Colleague'}
              /
            )}
          </VStack
        </View

        {/* 2. Center Column: Contributions Feed */}
        <View style={webStyles.content}
          <GlobalHeader
            title={t("community.profile.resonanceSphere") || "Resonance Sphere"}
            subtitle={`${t("community.profile.publicPresenceOf") || "Public presence of"} ${user?.full_name || userName}`}
          /

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={webStyles.feedScroll}
          
            <VStack sx={{ gap: 24, maxWidth: 700, width: '100%', alignSelf: 'center' }}
              {isPrivate ? (
                <Box sx={{
                  padding: 40,
                  borderRadius: 24,
                  backgroundColor: glass.surface.bg,
                  borderWidth: 1,
                  borderColor: glass.surface.border,
                  alignItems: 'center',
                  gap: 16
                }}
                  <Shield size={48} color={text.secondary} /
                  <Text sx={{ fontSize: 16, color: text.secondary, textAlign: 'center' }}
                    {t("community.profile.privateNote") || "This explorer has chosen to keep their detailed presence private."}
                  </Text
                </Box
              ) : (
                <
                  <Box sx={{
                    padding: 24,
                    borderRadius: 24,
                    backgroundColor: glass.surface.bg,
                    borderWidth: 1,
                    borderColor: glass.surface.border
                  }}
                    <VStack sx={{ gap: 12 }}
                      <Heading sx={{ fontSize: 18, fontWeight: '800', color: text.primary }}
                        {t("community.profile.aspiration")}
                      </Heading
                      <Text sx={{ fontSize: 16, lineHeight: 26, color: text.secondary }}
                        {user?.bio || t("community.profile.defaultBio") || "This user is on a journey of growth and resonance within the Gurudevi ecosystem."}
                      </Text
                    </VStack
                  </Box

                  <Heading sx={{ fontSize: 20, fontWeight: '900', color: text.primary, marginTop: 12 }}
                    {t("community.profile.publicResonance") || "Public Resonance"}
                  </Heading

                  {/* Mock Contributions */}
                  {[1, 2, 3].map(i => (
                    <Box key={i} sx={{
                      padding: 24,
                      borderRadius: 24,
                      backgroundColor: glass.surface.bg,
                      borderWidth: 1,
                      borderColor: glass.surface.border,
                      '&:hover': { transform: 'translateY(-2px)', borderColor: Theme.colors.sanctuarySaffron + '40' }
                    }}
                      <VStack sx={{ gap: 12 }}
                        <HStack sx={{ justifyContent: 'space-between' }}
                          <Text sx={{ fontSize: 12, fontWeight: '700', color: Theme.colors.sanctuarySaffron }}
                            {t("community.profile.reflection").toUpperCase() || "REFLECTION"}
                          </Text
                          <Text sx={{ fontSize: 12, color: text.secondary }}
                            {t("community.profile.recent") || "Recent"}
                          </Text
                        </HStack
                        <Text sx={{ fontSize: 15, lineHeight: 24, color: text.primary }}
                          The intersection of ancient mindfulness and modern algorithmic efficiency is where true wisdom resides.
                        </Text
                        <HStack sx={{ gap: 16 }}
                          <HStack sx={{ gap: 4, alignItems: 'center' }}
                            <Heart size={14} color={text.secondary} /
                            <Text sx={{ fontSize: 13, color: text.secondary }}>--</Text
                          </HStack
                          <HStack sx={{ gap: 4, alignItems: 'center' }}
                            <MessageSquare size={14} color={text.secondary} /
                            <Text sx={{ fontSize: 13, color: text.secondary }}>--</Text
                          </HStack
                        </HStack
                      </VStack
                    </Box
                  ))}
                </
              )}
            </VStack
          </ScrollView
        </View

        {/* 3. Right Column: Stats & Badges */}
        <View style={[webStyles.presenceSidebar, {
          borderLeftColor: glass.surface.border,
          backgroundColor: 'rgba(255,255,255,0.01)'
        }]}
          <VStack sx={{ gap: 32, padding: 32 }}
            {!isPrivate && (
              <
                <VStack sx={{ gap: 16 }}
                  <Heading sx={{ fontSize: 18, fontWeight: '800', color: text.primary }}
                    {t("community.profile.resonanceStats")}
                  </Heading
                  <HStack sx={{ flexWrap: 'wrap', gap: 12 }}
                    <StatCard label={t("community.profile.posts") || "Posts"} value={stats.posts.toString()} icon={<MessageSquare size={16} />} /
                    <StatCard label={t("community.profile.endorsements") || "Endorsements"} value={stats.endorsements.toString()} icon={<Heart size={16} />} /
                    <StatCard label={t("community.profile.pulse") || "Pulse"} value={t("community.profile.pulseActive") || "Active"} icon={<Activity size={16} />} /
                  </HStack
                </VStack

                <VStack sx={{ gap: 16 }}
                  <Heading sx={{ fontSize: 18, fontWeight: '800', color: text.primary }}
                    {t("community.profile.sanctuaryHonors")}
                  </Heading
                  <VStack sx={{ gap: 12 }}
                    <BadgeItem icon={<Medal size={18} color={Theme.colors.sanctuarySaffron} />} title={t("community.profile.explorer") || "Explorer"} /
                    <BadgeItem icon={<BadgeCheck size={18} color="#10b981" />} title={t("community.profile.verified") || "Verified"} /
                  </VStack
                </VStack
              </
            )}
            {isPrivate && (
              <VStack sx={{ gap: 12, alignItems: 'center', p: 20, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: glass.surface.border }}
                <Shield size={24} color={text.secondary} /
                <Text sx={{ fontSize: 12, color: text.secondary, textAlign: 'center' }}
                  {t("community.profile.privacyProtected") || "Privacy Protected"}
                </Text
              </VStack
            )}
          </VStack
        </View
      </View

      <LoadingOverlay visible={loading} /
    </View
  );
}

function InfoRow({ icon, text }: { icon: any; text: string }) {
  const { text: textColors } = useTheme();
  return (
    <HStack sx={{ gap: 12, alignItems: "center" }}
      {React.cloneElement(icon, { color: textColors.secondary })}
      <Text sx={{ fontSize: 14, color: textColors.secondary }}>{text}</Text
    </HStack
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: any;
}) {
  const { glass, text } = useTheme();
  return (
    <VStack
      sx={{
        flex: 1,
        minWidth: 100,
        padding: 16,
        borderRadius: 20,
        backgroundColor: glass.surface.bg,
        borderWidth: 1,
        borderColor: glass.surface.border,
        gap: 4,
      }}
    
      <HStack sx={{ justifyContent: "space-between", alignItems: "center" }}
        {React.cloneElement(icon, {
          color: Theme.colors.sanctuarySaffron,
          size: 14,
        })}
        <Text sx={{ fontSize: 18, fontWeight: "900", color: text.primary }}
          {value}
        </Text
      </HStack
      <Text
        sx={{
          fontSize: 11,
          fontWeight: "700",
          color: text.secondary,
          letterSpacing: 0.5,
        }}
      
        {label.toUpperCase()}
      </Text
    </VStack
  );
}

function BadgeItem({ icon, title }: { icon: any; title: string }) {
  const { glass, text } = useTheme();
  return (
    <HStack
      sx={{
        padding: 14,
        borderRadius: 16,
        backgroundColor: glass.surface.bg,
        borderWidth: 1,
        borderColor: glass.surface.border,
        alignItems: "center",
        gap: 12,
      }}
    
      {icon}
      <Text sx={{ fontSize: 14, fontWeight: "700", color: text.primary }}
        {title}
      </Text
    </HStack
  );
}

const webStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  layout: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 340,
    height: "100%",
    borderRightWidth: 1,
  },
  content: {
    flex: 1,
    height: "100%",
  },
  feedScroll: {
    padding: 40,
  },
  presenceSidebar: {
    width: 320,
    height: "100%",
    borderLeftWidth: 1,
  },
});
