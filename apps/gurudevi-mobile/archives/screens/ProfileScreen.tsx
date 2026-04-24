import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Alert, Dimensions, Modal, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Center,
    Button,
    ButtonText,
    Text,
    Theme,
    useThemedColors,
    useBottomTabPadding,
    DeleteAccountModal,
    LogoutModal,
    ScreenWrapper,
    GlobalHeader,
    useEnvironment,
    Switch,
} from '@repo/ui';
import { IdentityCard } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { useAccountDeletion, useTracking, useStore, usePermissions } from '@repo/core';
import { hapticSuccess, hapticLight, hapticError } from '@repo/ui';
import {
    Edit3,
    UserPlus,
    X,
    Settings,
    LogOut,
    Trash2,
    HelpCircle,
    MessageSquare,
    Info,
    Heart
} from 'lucide-react-native';

import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSequence, withTiming, withRepeat } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { SanctuaryProgressBar } from '@repo/ui';

// Local Package Imports
import ProfileSkeleton from '../components/ProfileSkeleton';
import LivingJourneyPanel from '../components/LivingJourneyPanel';
import ThuthimalBadge from '../components/ThuthimalBadge';
import { default as ProfileListItem } from '../components/ProfileListItem';
import { useProfile } from '../hooks/useProfile';
import { useProfileCompletion } from '../hooks/useProfileCompletion';

// --- Constants ---
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(SCREEN_WIDTH, 600) - Theme.spacing.xl;

// --- Internal Sub-Components ---

const IdentitySection = ({ profile, navigation, colors, t, onGuestAction, completionResult, cardWidth = CARD_WIDTH }: any) => {
    const { context } = usePermissions();
    const isWanderer = context.isAnonymous;

    return (
        <Center>
            <IdentityCard
                data={profile}
                onViewFullProfile={() => {
                    if (isWanderer) {
                        onGuestAction?.();
                    }
                    hapticLight();
                    navigation.navigate(isWanderer ? 'Auth' : 'FullProfile', { profile });
                }}
            />
            {!context.isAnonymous && (
                <SanctuaryProgressBar
                    percentage={completionResult.percentage}
                    isComplete={completionResult.isComplete}
                    nextHint={completionResult.nextHint}
                    style={{ width: cardWidth, marginTop: 16 }}
                />
            )}

            <TouchableOpacity
                onPress={() => {
                    hapticLight();
                    if (isWanderer) {
                        navigation.navigate('Auth');
                    } else {
                        navigation.navigate('FullProfile', { profile });
                    }
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={isWanderer ? t('auth.createAccount') : t('profile.viewEditProfile')}
                style={{
                    marginTop: 20,
                    width: cardWidth,
                    height: 52,
                    backgroundColor: colors.secondary,
                    borderRadius: 16,
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
                <HStack className="gap-2 items-center">
                    {isWanderer ? (
                        <UserPlus size={18} color={colors.action} />
                    ) : (
                        <Edit3 size={18} color={colors.action} />
                    )}
                    <Text className="font-bold" style={{ color: colors.text }}>
                        {isWanderer
                            ? t('auth.createAccount')
                            : t('profile.viewEditProfile')}
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

    return (
        <LivingJourneyPanel
            userId={profile.id}
            role={role ?? 'student'}
        /    );
};

const SupportSection = ({ t, colors, navigation, cardWidth = CARD_WIDTH }: any) => (
    <Center>
        <VStack
            className="rounded-[32px] border gap-2"
            style={{
                width: cardWidth,
                padding: 16,
                backgroundColor: `${colors.secondary}${Math.round(Theme.opacity.strong * 255).toString(16).padStart(2, '0')}`,
                borderColor: colors.border,
                shadowColor: colors.glow,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 20,
                elevation: 5,
            }}
        >
            <Heading
                size="sm"
                className="mt-2 mb-4"
                style={{ color: colors.textSecondary as any }}
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
            <ProfileListItem
                icon={Info}
                label={t('profile.aboutTitle')}
                onPress={() => hapticLight()}
            />
        </VStack>
    </Center>
);

const AppExperienceSection = ({ t, colors, cardWidth = CARD_WIDTH }: any) => {
    const showToast = useStore((state) => state.showToast);
    return (
        <Center>
            <VStack
                className="rounded-[32px] border gap-2"
                style={{
                    width: cardWidth,
                    padding: 16,
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                    shadowColor: colors.glow,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 20,
                    elevation: 5,
                }}
            >
                <Heading
                    size="sm"
                    className="mt-2 mb-4"
                    style={{ color: colors.textSecondary as any }}
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
                            Alert.alert(
                                t('profile.loveTitle'),
                                t('profile.loveMessage'),
                                [{ text: t('common.ok'), style: 'default' }]
                            );
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
                            Alert.alert(
                                t('profile.thankYouTitle'),
                                t('profile.thankYouMessage'),
                                [{ text: t('common.ok'), style: 'default' }]
                            );
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
        <VStack className="gap-4" style={{ width: cardWidth }}>
            <Heading
                size="sm"
                className="mb-1"
                style={{ color: colors.textSecondary as any }}
            >
                {t('profile.account.actions')}
            </Heading>
            <Button
                variant="outline"
                size="lg"
                onPress={() => {
                    hapticLight();
                    navigation.navigate('Auth');
                }}
                className="border rounded-2xl opacity-70"
                style={{ borderColor: colors.action }}
            >
                <ButtonText style={{ color: colors.action }}>
                    {t('profile.account.switch')}
                </ButtonText>
            </Button>
        </VStack>
    );
};

// --- Main Screen ---

export const ProfileScreen = () => {
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

    // Extract authority from access state
    const { context } = usePermissions();
    const authority = context.roles[0];
    const completionResult = useProfileCompletion(profile, authority ?? null);
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();
    const { width: windowWidth } = useWindowDimensions();
    const cardWidth = Math.min(windowWidth, 600) - Theme.spacing.xl;
    
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
    const [isLoggingOut, setLoggingOut] = useState(false);
    
    // Note: Settings are handled by the app-level navigator or a separate screen
    // We keep the logic for consistent UI but it may be wired to navigation.navigate('Settings')
    
    const { deleteAccount, isDeleting } = useAccountDeletion();
    const { discoverFeature } = useTracking();
    const showToast = useStore((state) => state.showToast);

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

    const handleLogout = () => {
        hapticLight();
        setLogoutModalVisible(true);
    };

    const confirmLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            setLogoutModalVisible(false);
        } catch (error) {
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
        } catch (error) {
            hapticError();
            if (Platform.OS === 'web') {
                showToast(t('profile.deleteFailedTitle'), 'error');
            } else {
                Alert.alert(
                    t('profile.deleteFailedTitle'),
                    t('profile.deleteFailedMessage'),
                    [{ text: t('common.ok') }]
                );
            }
        }
    };

    if (loading && !refreshing) {
        return (
            <ScreenWrapper noTopInset={true}                <ProfileSkeleton /            </ScreenWrapper        );
    }

    return (
            <GlobalHeader
                title={t('profile.title')}
                subtitle={t('profile.subtitle')}
                rightAction={
                    <TouchableOpacity
                        onPress={() => {
                            hapticLight();
                            navigation.navigate('AppSettings');
                        }}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={t('settings.title')}
                        className="p-2 border rounded-xl"
                        style={{
                            backgroundColor: colors.tertiary,
                            borderColor: colors.border,
                        }}
                    >
                        <Settings size={24} color={colors.action} />
                    </TouchableOpacity>
                }
            />
            <Box className="flex-1" style={{ backgroundColor: colors.primary }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingVertical: 16,
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
                    <VStack className="gap-8">
                        {profile?.is_anonymous && (
                            <Center>
                                <Animated.View style={[{ width: cardWidth }, animatedBannerStyle]}>
                                    <Box
                                        className="p-4 rounded-xl elevation-4"
                                        style={{
                                            backgroundColor: colors.action,
                                            shadowColor: Theme.colors.shadowViolet,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.24,
                                            shadowRadius: 8,
                                        }}
                                    >
                                        <VStack className="gap-2">
                                            <Heading size="md" className="text-white">
                                                {t('profile.guestTitle')}
                                            </Heading>
                                            <Text className="text-white text-sm">
                                                {t('profile.guestDesc')}
                                            </Text>
                                            <Button
                                                size="sm"
                                                onPress={() => {
                                                    hapticSuccess();
                                                    navigation.navigate('Auth');
                                                }}
                                                className="bg-white self-start mt-2"
                                            >
                                                <ButtonText style={{ color: colors.action }}>
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
                                    className="border rounded-[32px] elevation-4"
                                    style={{
                                        width: cardWidth,
                                        padding: 24,
                                        backgroundColor: colors.secondary,
                                        borderColor: colors.border,
                                        shadowColor: colors.glow,
                                        shadowOffset: { width: 0, height: 10 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 20,
                                    }}
                                >
                                    <VStack className="gap-2">
                                        <HStack className="gap-2 flex-wrap">
                                            {['Identity', 'Journey', 'Support'].map((pillar) => (
                                                <Box
                                                    key={pillar}
                                                    className="px-3 py-1 rounded-full border"
                                                    style={{
                                                        backgroundColor: colors.overlay,
                                                        borderColor: colors.border,
                                                    }}
                                                >
                                                    <Text className="text-xs font-bold" style={{ color: colors.textSecondary }}>
                                                        {pillar}
                                                    </Text>
                                                </Box>
                                            ))}
                                        </HStack>
                                        <Text className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: colors.action }}>
                                            PERSONAL SANCTUARY
                                        </Text>
                                        <Heading size="sm" style={{ color: colors.text }}>
                                            {t('profile.introductionTitle')}
                                        </Heading>
                                        <Text style={{ color: colors.textSecondary }} size="sm">
                                            {t('profile.introductionDesc')}
                                        </Text>
                                    </VStack>
                                </Box>
                            </Center>
                        </Animated.View>

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
                            <StatsSection profile={profile} rewards={rewards} role={profile?.role as any} />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                            <Center>
                                <Box style={{ width: cardWidth }}>
                                    <ProfileListItem
                                        icon={Settings}
                                        label={t('settings.title')}
                                        onPress={() => navigation.navigate('AppSettings')}
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
                                <Box className="mt-4" style={{ width: cardWidth }}>
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
                        <Animated.View entering={FadeInDown.delay(750).duration(500)}                            <Center                                <Box sx={{ width: cardWidth, mb: Theme.spacing.xl, mt: Theme.spacing.md }}                                    <VStack space="md" sx={{
                                        p: Theme.spacing.md,
                                        bg: colors.tertiary,
                                        borderRadius: Theme.corners.generous,
                                        borderWidth: 1,
                                        borderColor: colors.border
                                    }}                                        <TouchableOpacity
                                            onPress={handleLogout}
                                            accessible={true}
                                            accessibilityRole="button"
                                            accessibilityLabel={t('profile.logout')}
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
                                                                                    <LogOut size={20} color={colors.error} style={{ marginRight: 8 }} /                                            <Text color={colors.error} bold                                                {t('profile.logout')}
                                            </Text                                        </TouchableOpacity
                                        <TouchableOpacity
                                            onPress={handleDeleteAccount}
                                            accessible={true}
                                            accessibilityRole="button"
                                            accessibilityLabel={t('profile.deleteAccount')}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: Theme.spacing.xs,
                                            }}
                                                                                    <Trash2 size={16} color={colors.textTertiary} style={{ marginRight: 6 }} /                                            <Text color={colors.textTertiary} size="xs"                                                {t('profile.deleteAccount')}
                                            </Text                                        </TouchableOpacity                                    </VStack                                </Box                            </Center                        </Animated.View                    </VStack                </ScrollView
                <DeleteAccountModal
                    isOpen={isDeleteModalVisible}
                    onClose={() => setDeleteModalVisible(false)}
                    onDelete={confirmDeleteAccount}
                    isLoading={isDeleting}
                /
                <LogoutModal
                    isOpen={isLogoutModalVisible}
                    onClose={() => setLogoutModalVisible(false)}
                    onLogout={confirmLogout}
                    isLoading={isLoggingOut}
                /            </Box         </ScreenWrapper     );
};
