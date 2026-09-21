import { useAccountDeletion, useAccountLifecycle, useTracking } from '@repo/core/hooks';
import { type AccountLifecycleCommand, usePermissions, useStore } from '@repo/core/logic';
import LivingJourneyPanel from '@repo/profile/components/LivingJourneyPanel';
import ProfileListItem from '@repo/profile/components/ProfileListItem';
// Local Package Imports
import ProfileSkeleton from '@repo/profile/components/ProfileSkeleton';
import ThuthimalBadge from '@repo/profile/components/ThuthimalBadge';
import { useProfile } from '@repo/profile/hooks/useProfile';
import {
  type ProfileCompletionResult,
  useProfileCompletion,
} from '@repo/profile/hooks/useProfileCompletion';
import {
  type ProfileNavigationCapabilities,
  toFullProfileParams,
  useProfileNavigation,
} from '@repo/profile/navigation';
import type { UserProfile } from '@repo/profile/types';
import { toProfileCapacity } from '@repo/profile/screens/profileCapacity';
import NegentropyHubModal from '@repo/profile/components/NegentropyHubModal';
import DeleteAccountModal from '@repo/ui/components/DeleteAccountModal';
import DeviceSecurityCenter from '@repo/ui/components/DeviceSecurityCenter';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import IdentityCard from '@repo/ui/components/IdentityCard';
import LogoutModal from '@repo/ui/components/LogoutModal';
import { NotificationSettingsPanel } from '@repo/ui/components/NotificationSettingsPanel';
import { SanctuaryProgressBar } from '@repo/ui/components/SanctuaryProgressBar';
import { useProfileWorkspaceSurfaces } from '@repo/profile/workspace/useProfileWorkspaceSurfaces';
import { useWorkspaceLayoutSync } from '@repo/core/native';
import ScreenWrapper, { useBottomTabPadding } from '@repo/ui/components/ScreenWrapper';
import { useTheme } from '@repo/ui/hooks/useTheme';
import {
  ChevronDown,
  CircleQuestionMark,
  Eye,
  Heart,
  Info,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
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
import { EXTERNAL_URLS, GURUDEVI_SUPPORT_EMAIL, GURUDEVI_WEB } from '@repo/ui/utils/urls';
import type { TFunction } from 'i18next';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, RefreshControl, ScrollView, useWindowDimensions } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface IdentitySectionProps {
  profile: UserProfile | null;
  navigation: ProfileNavigationCapabilities;
  t: TFunction;
  onGuestAction?: () => void;
  completionResult: ProfileCompletionResult;
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
  const { accent } = useTheme();
  const isWanderer = context.isAnonymous;
  const capacity = context.activeBond?.capacity || context.primaryCapacity || 'member';

  return (
    <Center>
      <Box style={{ width: cardWidth }}>
        {profile?.id && (
          <IdentityCard
            data={{
              id: profile.id,
              display_name: profile.display_name,
              username: profile.username ?? undefined,
              capacity,
              avatar_url: profile.avatar_url ?? undefined,
              school_name: profile.school_name ?? undefined,
              nic_number: profile.nic_number ?? undefined,
              index_number: profile.index_number ?? undefined,
            }}
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
            <UserPlus size={18} color={accent.action} />
          ) : (
            <SquarePen size={18} color={accent.action} />
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

const SupportSection = ({ t, cardWidth }: SupportSectionProps) => {
  const { scene } = useTheme();
  const showToast = useStore((state) => state.showToast);

  const openSupportDestination = async (url: string) => {
    hapticLight();
    try {
      await Linking.openURL(url);
    } catch {
      showToast(t('profile.supportOpenFailed', 'Could not open that support destination.'), 'error');
    }
  };

  return (
    <Center>
      <VStack
        className="bg-phase-canvas rounded-3xl p-4 border border-phase-surface shadow-md"
        style={{
          width: cardWidth,
          shadowColor: scene.text.muted,
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
          onPress={() => void openSupportDestination(EXTERNAL_URLS.guidelines)}
        />
        <ProfileListItem
          icon={MessageSquare}
          label={t('profile.feedbackTitle')}
          onPress={() => void openSupportDestination(`mailto:${GURUDEVI_SUPPORT_EMAIL}`)}
        />
        <ProfileListItem
          icon={Info}
          label={t('profile.aboutTitle')}
          onPress={() => void openSupportDestination(GURUDEVI_WEB)}
        />
      </VStack>
    </Center>
  );
};

interface AppExperienceSectionProps {
  t: TFunction;
  cardWidth: number;
  onOpenNegentropyHub?: () => void;
}

const AppExperienceSection = ({ t, cardWidth, onOpenNegentropyHub }: AppExperienceSectionProps) => {
  const showToast = useStore((state) => state.showToast);
  const { scene, accent } = useTheme();
  return (
    <Center>
      <VStack
        className="bg-phase-canvas rounded-3xl p-4 border border-phase-surface shadow-md"
        style={{
          width: cardWidth,
          shadowColor: scene.text.muted,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }}
        space="sm"
      >
        <Heading className="text-phase-text-secondary text-sm mt-1 mb-3 px-1">
          {t('profile.account.support_app', 'Sponsorship & Support')}
        </Heading>
        <ProfileListItem
          icon={Sparkles}
          label="Energy Reservoir (Sponsors & Negentropy)"
          onPress={() => {
            hapticLight();
            onOpenNegentropyHub?.();
          }}
        />
        <ProfileListItem
          icon={Heart}
          label={t('profile.loveApp')}
          onPress={() => {
            hapticSuccess();
            showToast(t('profile.loveMessage'), 'success');
          }}
        />
        <ProfileListItem
          icon={Heart}
          label={t('profile.helpSupportApp')}
          onPress={() => {
            hapticSuccess();
            showToast(t('profile.thankYouMessage'), 'success');
          }}
        />
      </VStack>
    </Center>
  );
};

interface DisclosureSectionProps {
  title: string;
  description: string;
  cardWidth: number;
  defaultExpanded?: boolean;
  children: ReactNode;
}

const DisclosureSection = ({
  title,
  description,
  cardWidth,
  defaultExpanded = false,
  children,
}: DisclosureSectionProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Center>
      <Box
        style={{ width: cardWidth }}
        className="rounded-3xl border border-phase-surface bg-phase-canvas overflow-hidden"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityHint={description}
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((value) => !value)}
          className="p-4"
        >
          <HStack className="items-center justify-between gap-4">
            <VStack className="flex-1 gap-1">
              <Heading className="text-phase-text-primary text-base font-bold">{title}</Heading>
              <Text className="text-phase-text-secondary text-xs">{description}</Text>
            </VStack>
            <ChevronDown
              size={20}
              color="var(--phase-interactive)"
              style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
            />
          </HStack>
        </Pressable>
        {expanded && <VStack className="gap-4 px-4 pb-4">{children}</VStack>}
      </Box>
    </Center>
  );
};

export const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useProfileNavigation();
  const { profile, error, loading, refreshing, refresh, logout } = useProfile();
  const user = useStore((state) => state.user);
  const profileSurfaces = useProfileWorkspaceSurfaces();
  const { surfaces: resolvedSurfaces } = useWorkspaceLayoutSync({
    workspaceId: 'profile',
    userId: user?.id ?? null,
    surfaces: profileSurfaces,
    enableRemoteSync: true,
  });
  const resolvedProfileSurfaces = resolvedSurfaces;

  const { context } = usePermissions();
  const capacity = context.activeBond?.capacity || context.primaryCapacity || 'member';
  const completionCapacity = toProfileCapacity(
    context.activeBond?.capacity || context.primaryCapacity,
  );
  const completionResult = useProfileCompletion(profile, completionCapacity);
  const bottomPadding = useBottomTabPadding();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { accent, scene } = useTheme();
  const isCompactLandscape = windowWidth > windowHeight && windowHeight < 500;
  const cardWidth = Math.min(windowWidth, 600) - (isCompactLandscape ? 24 : 32);

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isNegentropyModalVisible, setNegentropyModalVisible] = useState(false);
  const executeLogout = useCallback(
    async (command: AccountLifecycleCommand) => {
      if (command.kind !== 'sign-out-current-device') {
        throw new Error(`Profile cannot execute lifecycle command "${command.kind}".`);
      }
      return logout();
    },
    [logout],
  );
  const logoutLifecycle = useAccountLifecycle(executeLogout);

  const {
    deleteAccount,
    cancelDeletion,
    isDeleting,
    request: deletionRequest,
    unavailableReason: deletionUnavailableReason,
  } = useAccountDeletion();
  const { discoverFeature } = useTracking();
  const showToast = useStore((state) => state.showToast);

  const bannerShake = useSharedValue(0);
  const animatedBannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bannerShake.value }],
  }));

  const triggerBannerShake = () => {
    hapticError();
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
    const result = await logoutLifecycle.run({ kind: 'sign-out-current-device' });
    if (result?.phase === 'completed') {
      setLogoutModalVisible(false);
      return;
    }

    hapticError();
    showToast(t('profile.logoutFailed', 'Could not log out. Please try again.'), 'error');
  };

  const handleDeleteAccount = () => {
    if (deletionUnavailableReason) {
      showToast(deletionUnavailableReason, 'info');
      return;
    }
    if (deletionRequest?.status === 'pending_verification' || deletionRequest?.status === 'scheduled') {
      showToast(
        deletionRequest.status === 'scheduled'
          ? 'Your deletion request is already scheduled.'
          : 'Your deletion request is already pending verification.',
        'info',
      );
      return;
    }
    hapticLight();
    setDeleteModalVisible(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const request = await deleteAccount();
      hapticSuccess();
      setDeleteModalVisible(false);
      showToast(
        request.status === 'pending_verification'
          ? 'Deletion request submitted. It is pending verification.'
          : `Deletion request status: ${request.status}.`,
        'success',
      );
    } catch (error) {
      console.error('[ProfileScreen] account deletion failed', error);
      hapticError();
      showToast(t('profile.deleteFailedMessage'), 'error');
    }
  };

  const cancelDeletionRequest = async () => {
    try {
      const request = await cancelDeletion();
      hapticSuccess();
      showToast(
        request.status === 'cancelled'
          ? 'Your account deletion request was cancelled.'
          : `Deletion request status: ${request.status}.`,
        'success',
      );
    } catch (error) {
      console.error('[ProfileScreen] account deletion cancellation failed', error);
      hapticError();
      showToast('Could not cancel your deletion request. Please try again.', 'error');
    }
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper noTopInset={true}>
        <Center
          accessible={true}
          accessibilityRole="progressbar"
          accessibilityLabel={t('profile.loading', 'Loading your profile')}
          accessibilityHint={t('profile.loadingHint', 'Please wait while your profile is loaded')}
          className="flex-1"
        >
          <ProfileSkeleton />
        </Center>
      </ScreenWrapper>
    );
  }

  if (!profile && error) {
    return (
      <ScreenWrapper noTopInset={true}>
        <Center className="flex-1 p-6" accessibilityRole="alert">
          <VStack className="items-center gap-3">
            <Heading className="text-phase-text-primary text-lg">
              {t('profile.loadFailed', 'Your profile could not be opened')}
            </Heading>
            <Text className="text-phase-text-secondary text-center text-sm">
              {t(
                'profile.loadFailedDescription',
                'Your saved details are safe. Check your connection and try opening your profile again.',
              )}
            </Text>
            <Button
              size="sm"
              onPress={() => void refresh()}
              accessibilityLabel={t('common.retry', 'Try again')}
              accessibilityHint={t('profile.retryHint', 'Attempts to load your profile again')}
            >
              <ButtonText>{t('common.retry', 'Try again')}</ButtonText>
            </Button>
          </VStack>
        </Center>
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
            <Settings size={24} color={accent.action} />
          </Pressable>
        }
      />
      <Box className="flex-1 bg-phase-canvas">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: isCompactLandscape ? 8 : 16,
            paddingBottom: bottomPadding + (isCompactLandscape ? 16 : 32),
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={accent.action} />
          }
        >
          <VStack space={isCompactLandscape ? 'lg' : '2xl'}>
            {error && (
              <Center>
                <Box style={{ width: cardWidth }} className="rounded-2xl bg-phase-surface p-4">
                  <VStack className="gap-2">
                    <Text
                      className="text-phase-text-primary text-sm font-bold"
                      accessibilityRole="alert"
                    >
                      {t('profile.refreshFailed', 'Your profile could not be refreshed.')}
                    </Text>
                    <Text className="text-phase-text-secondary text-xs">
                      {t(
                        'profile.refreshFailedDescription',
                        'Your last available details are still shown.',
                      )}
                    </Text>
                    <Button size="sm" onPress={() => void refresh()}>
                      <ButtonText>{t('common.retry', 'Try again')}</ButtonText>
                    </Button>
                  </VStack>
                </Box>
              </Center>
            )}
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
                  className="bg-phase-canvas rounded-3xl border border-phase-surface shadow-md"
                  style={{
                    width: cardWidth,
                    padding: isCompactLandscape ? 16 : 24,
                    shadowColor: scene.text.muted,
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
                      {t('profile.landingEyebrow', 'YOUR SANCTUARY')}
                    </Text>
                    <Heading className="text-base text-phase-text-primary">
                      {t('profile.landingTitle', 'Your identity and journey, in one place.')}
                    </Heading>
                    {!isCompactLandscape && (
                      <Text className="text-phase-text-secondary text-sm">
                        {t(
                          'profile.landingDescription',
                          'See who you are becoming, then open the quieter tools when you need them.',
                        )}
                      </Text>
                    )}
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

            {/* Profile canvas — boundary groups (SettingsGroup pattern) with isDefault + cross-device sync */}
            {resolvedProfileSurfaces
              .filter((s) => ['tools', 'care', 'account'].includes(s.surfaceId))
              .filter((s) => !s.hidden)
              .map((surface) => {
                if (surface.surfaceId === 'tools') {
                  return (
                    <DisclosureSection
                      key={surface.surfaceId}
                      title={t('profile.toolsTitle', 'Profile tools')}
                      description={t(
                        'profile.toolsDescription',
                        'Manage your settings, privacy record, and public view.',
                      )}
                      cardWidth={cardWidth}
                    >
                      <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                        <ProfileListItem
                          icon={Settings}
                          label={t('settings.title')}
                          onPress={() => navigation.openSettings?.()}
                        />
                      </Animated.View>
                      <Animated.View entering={FadeInDown.delay(475).duration(500)}>
                        <ProfileListItem
                          icon={Info}
                          label={t('profile.privacyLedgerTitle')}
                          onPress={() => navigation.openPrivacyLedger?.()}
                        />
                      </Animated.View>
                      <Animated.View entering={FadeInDown.delay(500).duration(500)}>
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
                      </Animated.View>
                    </DisclosureSection>
                  );
                }
                if (surface.surfaceId === 'care') {
                  return (
                    <DisclosureSection
                      key={surface.surfaceId}
                      title={t('profile.careTitle', 'Care & preferences')}
                      description={t(
                        'profile.careDescription',
                        'Support, notifications, and device security stay close at hand.',
                      )}
                      cardWidth={cardWidth}
                    >
                      <Animated.View entering={FadeInDown.delay(550).duration(500)}>
                        <SupportSection t={t} cardWidth={cardWidth} />
                      </Animated.View>
                      <Animated.View entering={FadeInDown.delay(600).duration(500)}>
                        <AppExperienceSection
                          t={t}
                          cardWidth={cardWidth}
                          onOpenNegentropyHub={() => setNegentropyModalVisible(true)}
                        />
                      </Animated.View>
                      <Animated.View entering={FadeInDown.delay(650).duration(500)}>
                        <NotificationSettingsPanel />
                      </Animated.View>
                      <Animated.View entering={FadeInDown.delay(700).duration(500)}>
                        <DeviceSecurityCenter />
                      </Animated.View>
                    </DisclosureSection>
                  );
                }
                return (
                  <DisclosureSection
                    key={surface.surfaceId}
                    title={t('profile.account.actions', 'Account actions')}
                    description={t(
                      'profile.account.actionsDescription',
                      'Sign out or begin the protected account deletion flow.',
                    )}
                    cardWidth={cardWidth}
                  >
                    <Animated.View entering={FadeInDown.delay(750).duration(500)}>
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
                          <Icon as={LogOut} size={20} className="mr-2 text-phase-error" />
                          <Text className="text-phase-error font-bold">{t('profile.logout')}</Text>
                        </Pressable>
                        <Pressable
                          onPress={
                            deletionRequest?.status === 'pending_verification' ||
                            deletionRequest?.status === 'scheduled'
                              ? () => void cancelDeletionRequest()
                              : handleDeleteAccount
                          }
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={
                            deletionRequest?.status === 'pending_verification' ||
                            deletionRequest?.status === 'scheduled'
                              ? 'Cancel account deletion request'
                              : t('profile.deleteAccount')
                          }
                          accessibilityHint={
                            deletionRequest?.status === 'pending_verification' ||
                            deletionRequest?.status === 'scheduled'
                              ? 'Cancels your pending account deletion request'
                              : 'Opens the account deletion modal'
                          }
                          disabled={isDeleting}
                          className="flex-row items-center justify-center p-1"
                        >
                          <Icon as={Trash2} size={16} className="mr-1.5 text-phase-text-tertiary" />
                          <Text className="text-phase-text-tertiary text-xs">
                            {deletionRequest?.status === 'pending_verification' ||
                            deletionRequest?.status === 'scheduled'
                              ? 'Cancel deletion request'
                              : t('profile.deleteAccount')}
                          </Text>
                        </Pressable>
                      </VStack>
                    </Animated.View>
                  </DisclosureSection>
                );
              })}
          </VStack>
        </ScrollView>
      </Box>

      <NegentropyHubModal
        isOpen={isNegentropyModalVisible}
        onClose={() => setNegentropyModalVisible(false)}
      />
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
        isLoading={logoutLifecycle.isPending}
      />
    </ScreenWrapper>
  );
};
