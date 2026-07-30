import { useAccountDeletion, useTracking } from '@repo/core/hooks';
import { usePermissions, useStore } from '@repo/core/logic';

import DeleteAccountModal from '@repo/ui/components/DeleteAccountModal';
import DeviceSecurityCenter from '@repo/ui/components/DeviceSecurityCenter';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import IdentityCard from '@repo/ui/components/IdentityCard';
import LogoutModal from '@repo/ui/components/LogoutModal';
import { NotificationSettingsPanel } from '@repo/ui/components/NotificationSettingsPanel';
import { SanctuaryProgressBar } from '@repo/ui/components/SanctuaryProgressBar';
import ScreenWrapper, { useBottomTabPadding } from '@repo/ui/components/ScreenWrapper';
import {
  CircleQuestionMark,
  Eye,
  Heart,
  Info,
  LogOut,
  MessageSquare,
  Settings,
  SquarePen,
  Trash2,
  UserPlus,
} from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import type { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, RefreshControl, ScrollView, useWindowDimensions } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LivingJourneyPanel from '@repo/profile/components/LivingJourneyPanel';
import ProfileListItem from '@repo/profile/components/ProfileListItem';
// Local Package Imports
import ProfileSkeleton from '@repo/profile/components/ProfileSkeleton';
import ThuthimalBadge from '@repo/profile/components/ThuthimalBadge';
import { useProfile } from '@repo/profile/hooks/useProfile';
import { useProfileCompletion } from '@repo/profile/hooks/useProfileCompletion';
import {
  type ProfileNavigationCapabilities,
  toFullProfileParams,
  useProfileNavigation,
} from '@repo/profile/navigation';
import type { UserProfile } from '@repo/profile/types';

// --- Internal Sub-Components ---

interface IdentitySectionProps {
  profile: UserProfile | null;
  navigation: ProfileNavigationCapabilities;
  t: TFunction;
  onGuestAction?: () => void;
  completionResult: any; // We'll refine this if we can, but it's better than unknown
  cardWidth: number;
}

const IdentitySection = ({
  profile,
  navigation,
  t,
  onGuestAction,
  completionResult,
  cardWidth,
}: IdentitySectionProps) => {
  const { context } = usePermissions();
  const isWanderer = context.isAnonymous;
  const capacity = context.activeBond?.capacity || context.primaryCapacity || 'member';

  return (
    <Center>
      <Box style={{ width: cardWidth }}>
        {profile?.id && (
          <IdentityCard
            data={{ ...(profile as any), id: profile.id, capacity }}
            onViewFullProfile={() => {
              if (isWanderer) {
                onGuestAction?.();
              }
              hapticLight();
              if (isWanderer) {
                navigation.openAuth?.();
              } else {
                navigation.openFullProfile(toFullProfileParams(profile as any));
              }
            }}
          />
        )}
      </Box>
      {!context.isAnonymous && completionResult && (
        <Box style={{ width: cardWidth }} className="mt-4">
          <SanctuaryProgressBar
            percentage={completionResult.percentage}
            isComplete={completionResult.isComplete}
            nextHint={completionResult.nextHint}
          />
        </Box>
      )}

      <Pressable
        onPress={() => {
          hapticLight();
          if (isWanderer) {
            navigation.openAuth?.();
          } else {
            if (profile) navigation.openFullProfile(toFullProfileParams(profile));
          }
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isWanderer ? t('auth.createAccount') : t('profile.viewEditProfile')}
        accessibilityHint={
          isWanderer
            ? 'Navigates to the account creation screen'
            : 'Opens your full profile for viewing and editing'
        }
        className="mt-6 h-[52px] bg-phase-canvas rounded-2xl flex-row items-center justify-center border border-phase-surface shadow-sm"
        style={{ width: cardWidth }}
      >
        <HStack space="sm" className="items-center">
          {isWanderer ? (
            <UserPlus size={18} color="#4A90E2" />
          ) : (
            <SquarePen size={18} color="#4A90E2" />
          )}
          <Text className="text-phase-text-primary font-bold">
            {isWanderer ? t('auth.createAccount') : t('profile.viewEditProfile')}
          </Text>
        </HStack>
      </Pressable>
    </Center>
  );
};

interface StatsSectionProps {
  profile: UserProfile | null;
  role?: string;
}

const StatsSection = ({ profile, role }: StatsSectionProps) => {
  if (!profile?.id) {
    return null;
  }

  return <LivingJourneyPanel userId={profile.id} role={role ?? 'student'} />;
};

interface SupportSectionProps {
  t: TFunction;
  cardWidth: number;
}

const SupportSection = ({ t, cardWidth }: SupportSectionProps) => (
  <Center>
    <VStack
      className="bg-phase-canvas rounded-3xl p-4 border border-phase-surface shadow-md"
      style={{
        width: cardWidth,
        shadowColor: '#9DA1A3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      }}
      space="sm"
    >
      <Heading className="text-phase-text-secondary text-sm mt-1 mb-3 px-1">
        {t('profile.account.support')}
      </Heading>
      <ProfileListItem
        icon={CircleQuestionMark}
        label={t('profile.faqTitle')}
        onPress={() => hapticLight()}
      />
      <ProfileListItem
        icon={MessageSquare}
        label={t('profile.feedbackTitle')}
        onPress={() => hapticLight()}
      />
      <ProfileListItem icon={Info} label={t('profile.aboutTitle')} onPress={() => hapticLight()} />
    </VStack>
  </Center>
);

interface AppExperienceSectionProps {
  t: TFunction;
  cardWidth: number;
}

const AppExperienceSection = ({ t, cardWidth }: AppExperienceSectionProps) => {
  const showToast = useStore((state) => state.showToast);
  return (
    <Center>
      <VStack
        className="bg-phase-canvas rounded-3xl p-4 border border-phase-surface shadow-md"
        style={{
          width: cardWidth,
          shadowColor: '#9DA1A3',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }}
        space="sm"
      >
        <Heading className="text-phase-text-secondary text-sm mt-1 mb-3 px-1">
          {t('profile.account.support_app')}
        </Heading>
        <ProfileListItem
          icon={Heart}
          label={t('profile.loveApp')}
          onPress={() => {
            hapticSuccess();
            if (Platform.OS === 'web') {
              showToast(t('profile.loveTitle'), 'success');
            } else {
              Alert.alert(t('profile.loveTitle'), t('profile.loveMessage'), [
                { text: t('common.ok'), style: 'default' },
              ]);
            }
          }}
        />
        <ProfileListItem
          icon={Heart}
          label={t('profile.helpSupportApp')}
          onPress={() => {
            hapticSuccess();
            if (Platform.OS === 'web') {
              showToast(t('profile.thankYouTitle'), 'success');
            } else {
              Alert.alert(t('profile.thankYouTitle'), t('profile.thankYouMessage'), [
                { text: t('common.ok'), style: 'default' },
              ]);
            }
          }}
        />
      </VStack>
    </Center>
  );
};

// --- Main Screen ---

export const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useProfileNavigation();
  const { profile, loading, refreshing, refresh, logout } = useProfile();

  const { context } = usePermissions();
  const capacity = context.activeBond?.capacity || context.primaryCapacity || 'member';
  const completionCapacity = (context.activeBond?.capacity || context.primaryCapacity) ?? null;
  const completionResult = useProfileCompletion(profile, completionCapacity as any);
  const bottomPadding = useBottomTabPadding();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth, 600) - 32;

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setLoggingOut] = useState(false);

  const { deleteAccount, isDeleting } = useAccountDeletion();
  const { discoverFeature } = useTracking();
  const showToast = useStore((state) => state.showToast);

  const bannerShake = useSharedValue(0);
  const animatedBannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bannerShake.value }],
  }));

  const triggerBannerShake = () => {
    hapticError();
    // eslint-disable-next-line react-compiler/react-compiler
    bannerShake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 100 }), 3, true),
      withTiming(0, { duration: 50 }),
    );
  };

  useEffect(() => {
    void discoverFeature('section_profile');
  }, [discoverFeature]);

  const handleLogout = () => {
    hapticLight();
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setLogoutModalVisible(false);
    } catch {
      hapticError();
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = () => {
    hapticLight();
    setDeleteModalVisible(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      await deleteAccount();
      hapticSuccess();
      setDeleteModalVisible(false);
    } catch {
      hapticError();
      if (Platform.OS === 'web') {
        showToast(t('profile.deleteFailedTitle'), 'error');
      } else {
        Alert.alert(t('profile.deleteFailedTitle'), t('profile.deleteFailedMessage'), [
          { text: t('common.ok') },
        ]);
      }
    }
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper noTopInset={true}>
        <ProfileSkeleton />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll={false} noTopInset={true}>
      <GlobalHeader
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
        rightAction={
          <Pressable
            onPress={() => {
              hapticLight();
              navigation.openSettings?.();
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={t('settings.title')}
            accessibilityHint="Opens the settings screen"
            className="p-2 rounded-xl bg-phase-canvas border border-phase-surface"
          >
            <Settings size={24} color="#4A90E2" />
          </Pressable>
        }
      />
      <Box className="flex-1 bg-phase-canvas">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 16,
            paddingBottom: bottomPadding + 32,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#E67E22" />
          }
        >
          <VStack space="2xl">
            {profile?.is_anonymous && (
              <Center>
                <Animated.View style={[{ width: cardWidth }, animatedBannerStyle]}>
                  <Box className="p-4 bg-phase-interactive rounded-2xl shadow-lg shadow-purple-900/40">
                    <VStack space="sm">
                      <Heading className="text-white text-lg">{t('profile.guestTitle')}</Heading>
                      <Text className="text-white text-sm">{t('profile.guestDesc')}</Text>
                      <Button
                        action="secondary"
                        size="sm"
                        onPress={() => {
                          hapticSuccess();
                          navigation.openAuth?.();
                        }}
                        className="bg-white self-start mt-2"
                      >
                        <ButtonText className="text-phase-interactive">
                          {t('auth.createAccount')}
                        </ButtonText>
                      </Button>
                    </VStack>
                  </Box>
                </Animated.View>
              </Center>
            )}

            <Animated.View entering={FadeInDown.delay(80).duration(500)}>
              <Center>
                <Box
                  className="bg-phase-canvas rounded-3xl p-6 border border-phase-surface shadow-md"
                  style={{
                    width: cardWidth,
                    shadowColor: '#9DA1A3',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                  }}
                >
                  <VStack space="sm">
                    <HStack space="sm" className="flex-wrap">
                      {['Identity', 'Journey', 'Support'].map((pillar) => (
                        <Box
                          key={pillar}
                          className="px-3 py-1 rounded-full bg-phase-surface border border-phase-surface"
                        >
                          <Text className="text-[10px] text-phase-text-secondary font-bold uppercase">
                            {pillar}
                          </Text>
                        </Box>
                      ))}
                    </HStack>
                    <Text className="text-[10px] text-phase-interactive font-bold tracking-widest">
                      PERSONAL SANCTUARY
                    </Text>
                    <Heading className="text-base text-phase-text-primary">
                      Your profile is the living record of how you move through Gurudevi.
                    </Heading>
                    <Text className="text-phase-text-secondary text-sm">
                      Everything below stays the same functionally, but this space helps hold
                      identity, progress, and support in one calmer rhythm.
                    </Text>
                  </VStack>
                </Box>
              </Center>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <IdentitySection
                profile={profile}
                navigation={navigation}
                t={t}
                onGuestAction={triggerBannerShake}
                completionResult={completionResult}
                cardWidth={cardWidth}
              />
            </Animated.View>

            {profile?.is_thuthimal && (
              <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                <Center>
                  <Box style={{ width: cardWidth }}>
                    <ThuthimalBadge
                      gifterName={profile.thuthimal_gifter}
                      giftedAt={profile.thuthimal_gifted_at}
                      compact={false}
                    />
                  </Box>
                </Center>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <StatsSection profile={profile} role={capacity} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <Center>
                <Box style={{ width: cardWidth }}>
                  <ProfileListItem
                    icon={Settings}
                    label={t('settings.title')}
                    onPress={() => navigation.openSettings?.()}
                  />
                </Box>
              </Center>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(475).duration(500)}>
              <Center>
                <Box style={{ width: cardWidth }}>
                  <ProfileListItem
                    icon={Info}
                    label={t('profile.privacyLedgerTitle')}
                    onPress={() => navigation.openPrivacyLedger?.()}
                  />
                </Box>
              </Center>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(500)}>
              <Center>
                <Box style={{ width: cardWidth }}>
                  <ProfileListItem
                    icon={Eye}
                    label={t('profile.publicPreviewTitle')}
                    onPress={() =>
                      profile?.id
                        ? navigation.openPublicProfile?.({
                            id: profile.id,
                            type: 'user',
                          })
                        : undefined
                    }
                  />
                </Box>
              </Center>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(550).duration(500)}>
              <SupportSection t={t} cardWidth={cardWidth} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(500)}>
              <AppExperienceSection t={t} cardWidth={cardWidth} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(650).duration(500)}>
              <Center>
                <Box style={{ width: cardWidth }}>
                  <NotificationSettingsPanel />
                </Box>
              </Center>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(700).duration(500)}>
              <Center>
                <Box style={{ width: cardWidth }} className="mt-4">
                  <DeviceSecurityCenter />
                </Box>
              </Center>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(750).duration(500)}>
              <Center>
                <Box className="mt-4 mb-20" style={{ width: cardWidth }}>
                  <VStack
                    space="md"
                    className="p-4 bg-phase-surface rounded-3xl border border-phase-surface"
                  >
                    <Pressable
                      onPress={handleLogout}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={t('profile.logout')}
                      accessibilityHint="Logs you out of your account"
                      className="flex-row items-center justify-center p-4 bg-phase-canvas rounded-2xl border border-phase-surface"
                    >
                      <Icon as={LogOut} size={20} color="#FF6B6B" className="mr-2" />
                      <Text className="text-phase-error font-bold">{t('profile.logout')}</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleDeleteAccount}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={t('profile.deleteAccount')}
                      accessibilityHint="Opens the account deletion modal"
                      className="flex-row items-center justify-center p-1"
                    >
                      <Icon as={Trash2} size={16} color="#9DA1A3" className="mr-1.5" />
                      <Text className="text-phase-text-tertiary text-xs">
                        {t('profile.deleteAccount')}
                      </Text>
                    </Pressable>
                  </VStack>
                </Box>
              </Center>
            </Animated.View>
          </VStack>
        </ScrollView>
      </Box>

      <DeleteAccountModal
        isOpen={isDeleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onDelete={confirmDeleteAccount}
        isLoading={isDeleting}
      />
      <LogoutModal
        isOpen={isLogoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onLogout={confirmLogout}
        isLoading={isLoggingOut}
      />
    </ScreenWrapper>
  );
};
