import { useNavigation } from '@react-navigation/native';
import { useAccountDeletion, useTracking } from '@repo/core/hooks';
import { useStore } from '@repo/core/logic';

import {
  LivingJourneyPanel,
  ProfileListItem,
  ProfileSkeleton,
  ThuthimalBadge,
  useProfile,
  useProfileCompletion,
} from '@repo/profile';
import {
  Box,
  Button,
  ButtonText,
  Center,
  DeleteAccountModal,
  GlobalHeader,
  Heading,
  HStack,
  IdentityCard,
  LogoutModal,
  ScreenWrapper,
  Text,
  useThemedColors,
  VStack,
} from '@repo/ui';
import { SanctuaryProgressBar, useBottomTabPadding } from '@repo/ui/components';
import { Theme } from '@repo/ui/theme';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import {
  Edit3,
  Heart,
  HelpCircle,
  Info,
  LogOut,
  MessageSquare,
  Settings,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import AppSettingsScreen from './AppSettingsScreen';

// --- Constants ---
// SCREEN_WIDTH is kept for native (doesn't change); on web, cardWidth is computed
// reactively inside ProfileScreen via useWindowDimensions.
const SCREEN_WIDTH = Dimensions.get('window').width;
// CARD_WIDTH is a fallback used by sub-components before the parent can inject cardWidth.
// Sub-components that receive cardWidth as a prop override this value.
const CARD_WIDTH = Math.min(SCREEN_WIDTH, 600) - Theme.spacing.xl;

// --- Internal Sub-Components ---

const IdentitySection = ({
  profile,
  navigation,
  colors,
  t,
  onGuestAction,
  completionResult,
  cardWidth = CARD_WIDTH,
}: any) => {
  const isGuest = !profile || profile?.is_anonymous === true;

  return (
    <Center>
      <IdentityCard
        data={profile}
        onViewFullProfile={() => {
          hapticLight();
          navigation.navigate(isGuest ? 'Auth' : 'FullProfile', { profile });
        }}
      />

      {/* Progress bar — registered users only, between card and button */}
      {!isGuest && (
        <SanctuaryProgressBar
          percentage={completionResult.percentage}
          isComplete={completionResult.isComplete}
          nextHint={completionResult.nextHint}
          style={{ width: cardWidth, marginTop: Theme.spacing.md }}
        />
      )}

      <TouchableOpacity
        onPress={() => {
          hapticLight();
          if (isGuest) {
            // Intentional "Create Account" click - do NOT shake, just navigate
            navigation.navigate('Auth');
          } else {
            navigation.navigate('FullProfile', { profile });
          }
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isGuest ? t('auth.createAccount') : t('profile.viewEditProfile')}
        accessibilityHint={
          isGuest ? 'Navigates to authentication screen' : 'Navigates to full profile screen'
        }
        style={{
          marginTop: Theme.spacing.lg,
          width: cardWidth,
          height: 52,
          backgroundColor: colors.secondary,
          borderRadius: Theme.corners.comfortable,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: Theme.colors.shadowViolet,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        <HStack space="sm" alignItems="center">
          {isGuest ? (
            <UserPlus size={18} color={colors.action} />
          ) : (
            <Edit3 size={18} color={colors.action} />
          )}
          <Text color={colors.text} bold>
            {isGuest ? t('auth.createAccount') : t('profile.viewEditProfile')}
          </Text>
        </HStack>
      </TouchableOpacity>
    </Center>
  );
};

const StatsSection = ({ profile, role }: any) => {
  if (!profile?.id) {
    return null;
  }

  return <LivingJourneyPanel userId={profile.id} role={role ?? 'student'} />;
};

const SupportSection = ({ t, colors, navigation, cardWidth = CARD_WIDTH }: any) => (
  <Center>
    <VStack
      sx={{
        width: cardWidth,
        p: Theme.spacing.md,
        backgroundColor: `${colors.secondary}${Math.round(Theme.opacity.strong * 255)
          .toString(16)
          .padStart(2, '0')}`,
        borderRadius: Theme.corners.generous,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.glow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 5,
      }}
      space="sm"
    >
      <Heading
        size="sm"
        color={colors.textSecondary as any}
        mt={Theme.spacing.sm}
        mb={Theme.spacing.md}
      >
        {t('profile.account.support')}
      </Heading>
      <ProfileListItem
        icon={HelpCircle}
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

const AppExperienceSection = ({ t, colors, cardWidth = CARD_WIDTH }: any) => {
  const showToast = useStore((state) => state.showToast);
  return (
    <Center>
      <VStack
        sx={{
          width: cardWidth,
          p: Theme.spacing.md,
          backgroundColor: colors.secondary,
          borderRadius: Theme.corners.generous,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.glow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 20,
          elevation: 5,
        }}
        space="sm"
      >
        <Heading
          size="sm"
          color={colors.textSecondary as any}
          mt={Theme.spacing.sm}
          mb={Theme.spacing.md}
        >
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

const AccountActions = ({ t, colors, isGuest, navigation, cardWidth = CARD_WIDTH }: any) => {
  if (isGuest) return null;

  return (
    <VStack space="md" sx={{ width: cardWidth }}>
      <Heading size="sm" color={colors.textSecondary as any} mb={Theme.spacing.xs}>
        {t('profile.account.actions')}
      </Heading>
      <Button
        variant="outline"
        size="lg"
        onPress={() => {
          hapticLight();
          navigation.navigate('Auth');
        }}
        sx={{
          borderColor: colors.action,
          borderRadius: Theme.corners.comfortable,
          opacity: 0.7,
        }}
      >
        <ButtonText color={colors.action}>{t('profile.account.switch')}</ButtonText>
      </Button>
    </VStack>
  );
};

const SettingsModal = ({ isVisible, onClose, colors, t, navigation }: any) => (
  <Modal
    visible={isVisible}
    animationType="slide"
    presentationStyle="pageSheet"
    onRequestClose={onClose}
  >
    <Box flex={1} bg={colors.primary}>
      <Box
        style={{
          backgroundColor: colors.primary,
          paddingTop: 50,
          paddingBottom: Theme.spacing.md,
          paddingHorizontal: Theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg" color={colors.text}>
            {t('settings.title')}
          </Heading>
          <TouchableOpacity
            onPress={() => {
              hapticLight();
              onClose();
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            accessibilityHint="Closes the settings modal"
            style={{
              padding: 8,
              borderRadius: Theme.corners.full,
              backgroundColor: colors.tertiary,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </HStack>
      </Box>
      <AppSettingsScreen navigation={navigation} />
    </Box>
  </Modal>
);

// --- Main Screen ---

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { profile, loading, refreshing, refresh, logout, updateField, rewards } = useProfile();

  const userRole = useStore((state) => state.userRole);
  const completionResult = useProfileCompletion(profile, userRole ?? null);
  const colors = useThemedColors();
  const bottomPadding = useBottomTabPadding();
  // Reactive width — responds to browser resize on web, device rotation on native
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth, 600) - Theme.spacing.xl;
  const { deleteAccount, isDeleting } = useAccountDeletion();
  const { discoverFeature } = useTracking();
  const showToast = useStore((state) => state.showToast);

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setLoggingOut] = useState(false);
  const [isSettingsVisible, setSettingsVisible] = useState(false);

  // --- Shake Animation Logic ---
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
    discoverFeature('section_profile');
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
          <TouchableOpacity
            onPress={() => {
              hapticLight();
              setSettingsVisible(true);
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={t('settings.title')}
            accessibilityHint="Opens app settings"
            style={{
              padding: 8,
              borderRadius: Theme.corners.comfortable,
              backgroundColor: colors.tertiary,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            <Settings size={24} color={colors.action} />
          </TouchableOpacity>
        }
      />

      <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: Theme.spacing.md,
            paddingBottom: bottomPadding,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={Theme.colors.sanctuarySaffron}
            />
          }
        >
          <VStack space="2xl">
            {/* Animated Modular Profile Sections */}
            {profile?.is_anonymous && (
              <Center>
                <Animated.View style={[{ width: cardWidth }, animatedBannerStyle]}>
                  <Box
                    sx={{
                      p: Theme.spacing.md,
                      bg: colors.action,
                      borderRadius: Theme.corners.comfortable,
                      shadowColor: Theme.colors.shadowViolet, // Shadow Law
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.24,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <VStack space="sm">
                      <Heading size="md" color={Theme.colors.sacredWhite}>
                        {t('profile.guestTitle')}
                      </Heading>
                      <Text color={Theme.colors.sacredWhite} sx={{ fontSize: '$sm' }}>
                        {t('profile.guestDesc')}
                      </Text>
                      <Button
                        size="sm"
                        onPress={() => {
                          hapticSuccess();
                          navigation.navigate('Auth');
                        }}
                        sx={{ bg: Theme.colors.sacredWhite, alignSelf: 'flex-start', mt: '$2' }}
                      >
                        <ButtonText color={colors.action}>{t('auth.createAccount')}</ButtonText>
                      </Button>
                    </VStack>
                  </Box>
                </Animated.View>
              </Center>
            )}

            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <IdentitySection
                profile={profile}
                navigation={navigation}
                colors={colors}
                t={t}
                onGuestAction={triggerBannerShake}
                completionResult={completionResult}
                cardWidth={cardWidth}
              />
            </Animated.View>

            {profile?.is_thuthimal && (
              <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                <Center>
                  <Box sx={{ width: cardWidth }}>
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
              <StatsSection profile={profile} rewards={rewards} role={profile?.role} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <Center>
                <Box sx={{ width: cardWidth }}>
                  <ProfileListItem
                    icon={Settings}
                    label={t('settings.title')}
                    onPress={() => setSettingsVisible(true)}
                  />
                </Box>
              </Center>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(550).duration(500)}>
              <SupportSection t={t} colors={colors} navigation={navigation} cardWidth={cardWidth} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(500)}>
              <AppExperienceSection t={t} colors={colors} cardWidth={cardWidth} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(700).duration(500)}>
              <Center>
                <Box sx={{ width: cardWidth, mt: Theme.spacing.md }}>
                  <AccountActions
                    t={t}
                    colors={colors}
                    navigation={navigation}
                    isGuest={profile?.is_anonymous}
                    cardWidth={cardWidth}
                  />
                </Box>
              </Center>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(750).duration(500)}>
              {/* Account Actions Box */}
              <Center>
                <Box sx={{ width: cardWidth, mb: Theme.spacing.xl, mt: Theme.spacing.md }}>
                  <VStack
                    space="md"
                    sx={{
                      p: Theme.spacing.md,
                      bg: colors.tertiary,
                      borderRadius: Theme.corners.generous,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <TouchableOpacity
                      onPress={handleLogout}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={t('profile.logout')}
                      accessibilityHint="Logs out of the application"
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: Theme.spacing.md,
                        backgroundColor: colors.secondary,
                        borderRadius: Theme.corners.comfortable,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <LogOut size={20} color={colors.error} style={{ marginRight: 8 }} />
                      <Text color={colors.error} bold>
                        {t('profile.logout')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleDeleteAccount}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={t('profile.deleteAccount')}
                      accessibilityHint="Deletes your account forever"
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: Theme.spacing.xs,
                      }}
                    >
                      <Trash2 size={16} color={colors.textTertiary} style={{ marginRight: 6 }} />
                      <Text color={colors.textTertiary} size="xs">
                        {t('profile.deleteAccount')}
                      </Text>
                    </TouchableOpacity>
                  </VStack>
                </Box>
              </Center>
            </Animated.View>
          </VStack>
        </ScrollView>

        <SettingsModal
          isVisible={isSettingsVisible}
          onClose={() => setSettingsVisible(false)}
          colors={colors}
          t={t}
          navigation={navigation}
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
          isLoading={isLoggingOut}
        />
      </Box>
    </ScreenWrapper>
  );
}
