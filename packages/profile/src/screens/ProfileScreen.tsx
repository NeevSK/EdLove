import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Alert, Dimensions, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
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
    IdentityCard,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { useAccountDeletion, useTracking, useStore, usePermissions } from '@repo/core';
import { hapticSuccess, hapticLight, hapticError } from '@repo/ui';
import {
    Edit3,
    UserPlus,
    Eye,
    Settings,
    LogOut,
    Trash2,
    HelpCircle,
    MessageSquare,
    Info,
    Heart
} from 'lucide-react-native';

import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSequence, withTiming, withRepeat } from 'react-native-reanimated';
import { SanctuaryProgressBar } from '@repo/ui';

// Local Package Imports
import ProfileSkeleton from '../components/ProfileSkeleton';
import LivingJourneyPanel from '../components/LivingJourneyPanel';
import ThuthimalBadge from '../components/ThuthimalBadge';
import { default as ProfileListItem } from '../components/ProfileListItem';
import { useProfile } from '../hooks/useProfile';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import { toFullProfileParams, useProfileNavigation } from '../navigation';

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
                    if (isWanderer) {
                        navigation.openAuth?.();
                    } else {
                        navigation.openFullProfile(toFullProfileParams(profile));
                    }
                }}
            />
            {!context.isAnonymous && completionResult && (
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
                    if (isWanderer) {
                        navigation.openAuth?.();
                    } else {
                        navigation.openFullProfile(toFullProfileParams(profile));
                    }
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={isWanderer ? t('auth.createAccount') : t('profile.viewEditProfile')}
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
                    {isWanderer ? (
                        <UserPlus size={18} color={colors.action} />
                    ) : (
                        <Edit3 size={18} color={colors.action} />
                    )}
                    <Text color={colors.textPrimary} bold>
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
        />
    );
};

const SupportSection = ({ t, colors, navigation, cardWidth = CARD_WIDTH }: any) => (
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
                color={colors.textSecondary}
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
                    color={colors.textSecondary}
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
        <VStack space="md" sx={{ width: cardWidth }}>
            <Heading
                size="sm"
                color={colors.textSecondary}
                mb={Theme.spacing.xs}
            >
                {t('profile.account.actions')}
            </Heading>
            <Button
                variant="outline"
                size="lg"
                onPress={() => {
                    hapticLight();
                    navigation.openAuth?.();
                }}
                sx={{
                    borderColor: colors.action,
                    borderRadius: Theme.corners.comfortable,
                    opacity: 0.7
                }}
            >
                <ButtonText color={colors.action}>
                    {t('profile.account.switch')}
                </ButtonText>
            </Button>
        </VStack>
    );
};

// --- Main Screen ---

export const ProfileScreen = () => {
    const { t } = useTranslation();
    const navigation = useProfileNavigation();
    const {
        profile,
        loading,
        refreshing,
        refresh,
        logout,
        rewards
    } = useProfile();

    const { context } = usePermissions();
    const authority = context.roles?.[0];
    const completionResult = useProfileCompletion(profile, authority ?? null);
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();
    const { width: windowWidth } = useWindowDimensions();
    const cardWidth = Math.min(windowWidth, 600) - Theme.spacing.xl;
    
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
    const [isLoggingOut, setLoggingOut] = useState(false);
    
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
                            navigation.openSettings?.();
                        }}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={t('settings.title')}
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
                        {profile?.is_anonymous && (
                            <Center>
                                <Animated.View style={[{ width: cardWidth }, animatedBannerStyle]}>
                                    <Box sx={{
                                        p: Theme.spacing.md,
                                        bg: colors.action,
                                        borderRadius: Theme.corners.comfortable,
                                        shadowColor: Theme.colors.shadowViolet,
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.24,
                                        shadowRadius: 8,
                                        elevation: 4
                                    }}>
                                        <VStack space="sm">
                                            <Heading size="md" color={Theme.colors.sacredWhite}>{t('profile.guestTitle')}</Heading>
                                            <Text color={Theme.colors.sacredWhite} sx={{ fontSize: 'sm' }}>
                                                {t('profile.guestDesc')}
                                            </Text>
                                            <Button
                                                size="sm"
                                                onPress={() => {
                                                    hapticSuccess();
                                                    navigation.openAuth?.();
                                                }}
                                                sx={{ bg: Theme.colors.sacredWhite, alignSelf: 'flex-start', mt: 8 }}
                                            >
                                                <ButtonText color={colors.action}>{t('auth.createAccount')}</ButtonText>
                                            </Button>
                                        </VStack>
                                    </Box>
                                </Animated.View>
                            </Center>
                        )}

                        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
                            <Center>
                                <Box
                                    sx={{
                                        width: cardWidth,
                                        p: Theme.spacing.lg,
                                        bg: colors.secondary,
                                        borderRadius: Theme.corners.generous,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        shadowColor: colors.glow,
                                        shadowOffset: { width: 0, height: 10 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 20,
                                        elevation: 4,
                                    }}
                                >
                                    <VStack space="sm">
                                        <HStack space="sm" sx={{ flexWrap: 'wrap' }}>
                                            {['Identity', 'Journey', 'Support'].map((pillar) => (
                                                <Box
                                                    key={pillar}
                                                    sx={{
                                                        px: Theme.spacing.sm,
                                                        py: 4,
                                                        borderRadius: Theme.corners.full,
                                                        backgroundColor: colors.overlay,
                                                        borderWidth: 1,
                                                        borderColor: colors.border,
                                                    }}
                                                >
                                                    <Text size="xs" color={colors.textSecondary} bold>
                                                        {pillar}
                                                    </Text>
                                                </Box>
                                            ))}
                                        </HStack>
                                        <Text size="xs" color={colors.action} bold sx={{ letterSpacing: 0.8 }}>
                                            PERSONAL SANCTUARY
                                        </Text>
                                        <Heading size="sm" color={colors.textPrimary}>
                                            Your profile is the living record of how you move through Gurudevi.
                                        </Heading>
                                        <Text color={colors.textSecondary} size="sm">
                                            Everything below stays the same functionally, but this space helps hold identity, progress, and support in one calmer rhythm.
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
                            <StatsSection profile={profile} role={profile?.role as any} />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                            <Center>
                                <Box sx={{ width: cardWidth }}>
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
                                <Box sx={{ width: cardWidth }}>
                                    <ProfileListItem
                                        icon={Info}
                                        label={t('profile.privacyLedgerTitle', 'Privacy Ledger')}
                                        onPress={() => navigation.openPrivacyLedger?.()}
                                    />
                                </Box>
                            </Center>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
                            <Center>
                                <Box sx={{ width: cardWidth }}>
                                    <ProfileListItem
                                        icon={Eye}
                                        label={t('profile.publicPreviewTitle', 'Public Preview')}
                                        onPress={() => profile?.id ? navigation.openPublicProfile?.({ id: profile.id, type: 'user' }) : undefined}
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
                            <Center>
                                <Box sx={{ width: cardWidth, mb: Theme.spacing.xl, mt: Theme.spacing.md }}>
                                    <VStack 
                                        space="md" 
                                        sx={{
                                            p: Theme.spacing.md,
                                            bg: colors.tertiary,
                                            borderRadius: Theme.corners.generous,
                                            borderWidth: 1,
                                            borderColor: colors.border
                                        }}
                                    >
                                        <TouchableOpacity
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
