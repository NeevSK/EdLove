import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, RefreshControl, Alert, Dimensions, Modal, TouchableOpacity } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Spinner,
    Center,
    Button,
    ButtonText,
    Text,
    Theme,
    useThemedColors,
    useBottomTabPadding,
    DeleteAccountModal,
    GlobalHeader,
    ScreenWrapper,
    useEnvironment
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { useAccountDeletion, useTracking } from '@repo/core';
import { hapticSuccess, hapticLight, hapticError } from '@repo/ui';
import AchievementGallery from '../components/profile/AchievementGallery';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';

import IdentityCard from '../components/profile/IdentityCard';
import UserStatsCard from '../components/profile/UserStatsCard';
import { Edit3, UserPlus, ChevronRight, Settings, LogOut, Trash2, HelpCircle, MessageSquare, Info, Heart, X } from 'lucide-react-native';
import ThuthimalBadge from '../components/profile/ThuthimalBadge';
import AppSettingsScreen from './AppSettingsScreen';
import ProfileListItem from '../components/profile/ProfileListItem';

import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSequence, withTiming, withRepeat } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '@repo/profile';

// --- Constants ---
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - Theme.spacing.xl;

// --- Internal Sub-Components ---

const IdentitySection = ({ profile, navigation, colors, t, onGuestAction }: any) => {
    const isGuest = !profile?.email || profile?.email?.includes('anonymous');

    return (
        <Center>
            <IdentityCard
                profile={profile}
                onViewFullProfile={() => {
                    if (isGuest) {
                        // For guests, viewing profile is a 'blocked' action that triggers shake
                        onGuestAction?.();
                    }
                    hapticLight();
                    navigation.navigate(isGuest ? 'Auth' : 'FullProfile', { profile });
                }}
            />
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
                accessibilityLabel={isGuest ? t('auth.createAccount', 'Create Account') : t('profile.viewEditProfile', 'View or Edit Profile')}
                style={{
                    marginTop: Theme.spacing.lg,
                    width: CARD_WIDTH,
                    height: 52,
                    backgroundColor: colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                    shadowColor: colors.glow,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 15,
                    elevation: 5,
                }}
            >
                <HStack space="sm" alignItems="center">
                    {isGuest ? (
                        <UserPlus size={18} color={colors.action} />
                    ) : (
                        <Edit3 size={18} color={colors.action} />
                    )}
                    <Text color={colors.text} bold>
                        {isGuest
                            ? t('auth.createAccount', 'Create Account')
                            : t('profile.viewEditProfile', 'View / Edit Profile')}
                    </Text>
                </HStack>
            </TouchableOpacity>
        </Center>
    );
};

const StatsSection = ({ profile, rewards }: any) => (
    <VStack space="2xl">
        <Center>
            <Box sx={{ width: CARD_WIDTH }}>
                <UserStatsCard
                    role={profile?.role || 'student'}
                    stats={{
                        classesTaught: profile?.classes_taught || 0,
                        studentsCount: profile?.students_count || 0,
                        guruPoints: rewards?.points || 0,
                        attendanceStreak: profile?.attendance_streak || 0,
                        assignmentsCompleted: profile?.assignments_count || 0
                    }}
                />
            </Box>
        </Center>
        <Center>
            <Box sx={{ width: CARD_WIDTH, mb: '$8' }}>
                <AchievementGallery unlockedBadges={rewards?.badges || []} />
            </Box>
        </Center>
    </VStack>
);

const SupportSection = ({ t, colors }: any) => (
    <Center>
        <VStack
            sx={{
                width: CARD_WIDTH,
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
                {t('profile.account.support')}
            </Heading>
            <ProfileListItem
                icon={HelpCircle}
                label={t('profile.faqTitle', 'FAQ & Help Center')}
                onPress={() => hapticLight()}
            />
            <ProfileListItem
                icon={MessageSquare}
                label={t('profile.feedbackTitle', 'Send Feedback')}
                onPress={() => hapticLight()}
            />
            <ProfileListItem
                icon={Info}
                label={t('profile.aboutTitle', 'About Sanctuary')}
                onPress={() => hapticLight()}
            />
        </VStack>
    </Center>
);

const AppExperienceSection = ({ t, colors }: any) => (
    <Center>
        <VStack
            sx={{
                width: CARD_WIDTH,
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
                {t('profile.account.support_app', 'Support this app')}
            </Heading>
            <ProfileListItem
                icon={Heart}
                label={t('profile.loveApp', 'I love this app')}
                onPress={() => {
                    hapticSuccess();
                    Alert.alert(
                        t('profile.loveTitle', 'Radiant Energy'),
                        t('profile.loveMessage', 'Your love for the Sanctuary fuels our mission. We are grateful for your presence in our community!'),
                        [{ text: t('common.ok', 'OK'), style: 'default' }]
                    );
                }}
            />
            <ProfileListItem
                icon={Heart}
                label={t('profile.helpSupportApp', 'I want to support this app')}
                onPress={() => {
                    hapticSuccess();
                    Alert.alert(
                        t('profile.thankYouTitle', 'Radiant Gratitude'),
                        t('profile.thankYouMessage', 'Your desire to support the Sanctuary is deeply appreciated. We are currently preparing premium patronage options for our most dedicated explorers.'),
                        [{ text: t('common.ok', 'OK'), style: 'default' }]
                    );
                }}
            />
        </VStack>
    </Center>
);

const AccountActions = ({ t, colors, isGuest, navigation }: any) => {
    if (isGuest) return null;

    return (
        <VStack space="md" sx={{ width: CARD_WIDTH }}>
            <Heading
                size="sm"
                color={colors.textSecondary as any}
                mb={Theme.spacing.xs}
            >
                {t('profile.account.actions', 'Account Management')}
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
                    opacity: 0.7
                }}
            >
                <ButtonText color={colors.action}>
                    {t('profile.account.switch', 'Switch Identity')}
                </ButtonText>
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
                        {t('settings.title', 'App Settings')}
                    </Heading>
                    <TouchableOpacity
                        onPress={() => {
                            hapticLight();
                            onClose();
                        }}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={t('common.close', 'Close')}
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
    const {
        profile,
        loading,
        refreshing,
        refresh,
        logout,
        rewards
    } = useProfile();

    const { isDark } = useEnvironment();
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isSettingsVisible, setSettingsVisible] = useState(false);
    const { deleteAccount, isDeleting } = useAccountDeletion();
    const { discoverFeature } = useTracking();

    // --- Shake Animation Logic ---
    const bannerShake = useSharedValue(0);
    const animatedBannerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: bannerShake.value }]
    }));

    const triggerBannerShake = () => {
        hapticError();
        bannerShake.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withRepeat(withTiming(10, { duration: 100 }), 3, true),
            withTiming(0, { duration: 50 })
        );
    };

    useEffect(() => {
        discoverFeature('section_profile');
    }, []);

    const handleLogout = async () => {
        hapticLight();
        Alert.alert(
            t('profile.logoutConfirmTitle', 'Log Out'),
            t('profile.logoutConfirmMessage', 'Are you sure you want to sign out?'),
            [
                { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                {
                    text: t('profile.logout', 'Log Out'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            hapticError();
                        }
                    },
                },
            ]
        );
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
        } catch (error) {
            hapticError();
            Alert.alert(
                t('profile.deleteFailedTitle', 'Deletion Failed'),
                t('profile.deleteFailedMessage', 'We could not delete your account. Please try again later.'),
                [{ text: 'OK' }]
            );
        }
    };

    if (loading && !refreshing) {
        return (
            <ScreenWrapper>
                <ProfileSkeleton />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={t('profile.title', 'Identity')}
                subtitle={t('profile.subtitle', "Sanctuary Profile")}
                rightAction={
                    <TouchableOpacity
                        onPress={() => {
                            hapticLight();
                            setSettingsVisible(true);
                        }}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={t('settings.title', 'App Settings')}
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
                        {/* Guest Promotion Banner */}
                        {profile?.is_anonymous && (
                            <Center>
                                <Animated.View style={[{ width: CARD_WIDTH }, animatedBannerStyle]}>
                                    <Box sx={{
                                        p: Theme.spacing.md,
                                        bg: colors.action,
                                        borderRadius: Theme.corners.comfortable,
                                        shadowColor: colors.action,
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 4
                                    }}>
                                        <VStack space="sm">
                                            <Heading size="md" color="white">{t('profile.guestTitle', 'Guest Explorer')}</Heading>
                                            <Text color="white" size="sm">
                                                {t('profile.guestDesc', 'You are exploring as a guest. Create an account to save your sanctuary permanently.')}
                                            </Text>
                                            <Button
                                                size="sm"
                                                onPress={() => {
                                                    hapticSuccess();
                                                    navigation.navigate('Auth');
                                                }}
                                                sx={{ bg: 'white', alignSelf: 'flex-start', mt: '$2' }}
                                            >
                                                <ButtonText color={colors.action}>{t('auth.createAccount', 'Create Account')}</ButtonText>
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
                            />
                        </Animated.View>

                        {profile?.is_thuthimal && (
                            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                                <Center>
                                    <Box sx={{ width: CARD_WIDTH }}>
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
                            <StatsSection profile={profile} rewards={rewards} />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                            <Center>
                                <Box sx={{ width: CARD_WIDTH }}>
                                    <ProfileListItem
                                        icon={Settings}
                                        label={t('settings.title', 'App Settings')}
                                        onPress={() => setSettingsVisible(true)}
                                    />
                                </Box>
                            </Center>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
                            <SupportSection t={t} colors={colors} />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
                            <AppExperienceSection t={t} colors={colors} />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(700).duration(500)}>
                            <Center>
                                <Box sx={{ width: CARD_WIDTH, mt: Theme.spacing.md }}>
                                    <AccountActions
                                        t={t}
                                        colors={colors}
                                        navigation={navigation}
                                        isGuest={profile?.is_anonymous}
                                    />
                                </Box>
                            </Center>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(750).duration(500)}>
                            {/* Account Actions Box */}
                            <Center>
                                <Box sx={{ width: CARD_WIDTH, mb: Theme.spacing.xl, mt: Theme.spacing.md }}>
                                    <VStack space="md" sx={{
                                        p: Theme.spacing.md,
                                        bg: colors.tertiary,
                                        borderRadius: Theme.corners.generous,
                                        borderWidth: 1,
                                        borderColor: colors.border
                                    }}>
                                        <TouchableOpacity
                                            onPress={handleLogout}
                                            accessible={true}
                                            accessibilityRole="button"
                                            accessibilityLabel={t('profile.logout', 'Log Out')}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: Theme.spacing.md,
                                                backgroundColor: colors.secondary,
                                                borderRadius: Theme.corners.comfortable,
                                                borderWidth: 1,
                                                borderColor: colors.border
                                            }}
                                        >
                                            <LogOut size={20} color={colors.error} style={{ marginRight: 8 }} />
                                            <Text color={colors.error} bold>
                                                {t('profile.logout', 'Log Out')}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={handleDeleteAccount}
                                            accessible={true}
                                            accessibilityRole="button"
                                            accessibilityLabel={t('profile.deleteAccount', 'Delete Account')}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: Theme.spacing.xs,
                                            }}
                                        >
                                            <Trash2 size={16} color={colors.textTertiary} style={{ marginRight: 6 }} />
                                            <Text color={colors.textTertiary} size="xs">
                                                {t('profile.deleteAccount', 'Delete Account')}
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
            </Box>
        </ScreenWrapper>
    );
}
