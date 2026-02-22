import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Alert } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Center,
    Button,
    ButtonText,
    Text
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { Theme, useThemedColors, useBottomTabPadding, DeleteAccountModal } from '@repo/ui';
import { useAccountDeletion, useRewards, useTracking } from '@repo/core';
import { supabase } from '@repo/core';
import { hapticSuccess, hapticLight, hapticError } from '@repo/ui';
import AchievementGallery from '../components/profile/AchievementGallery';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';
import { LogOut, Settings, ChevronRight, HelpCircle, MessageSquare, Trash2, Info, Heart } from 'lucide-react-native';
// New Components
import IdentityCard from '../components/profile/IdentityCard';
import UserStatsCard from '../components/profile/UserStatsCard';
import ThuthimalBadge from '../components/profile/ThuthimalBadge';
import { GlobalHeader } from '@repo/ui';
import AppSettingsScreen from './AppSettingsScreen';
import { Modal, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { ScreenWrapper } from '@repo/ui';

import { useEnvironment } from '@repo/ui';

import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<any>();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { isDark } = useEnvironment();
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isSettingsVisible, setSettingsVisible] = useState(false);
    const { deleteAccount, isDeleting } = useAccountDeletion();
    const { rewards, isLoading: isRewardsLoading } = useRewards();
    const { discoverFeature } = useTracking();

    useEffect(() => {
        // Track that the user discovered the Profile section
        discoverFeature('section_profile');
    }, []);

    const currentLanguage = i18n.language;

    useEffect(() => {
        fetchProfile();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchProfile();
        setRefreshing(false);
    }, []);

    async function fetchProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select(`
                        *,
                        schools (
                            id,
                            name,
                            type,
                            district
                        )
                    `)
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile({
                        ...data,
                        school_name: data.schools?.name || null
                    });
                } else {
                    setProfile({
                        id: user.id,
                        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                        email: user.email,
                        role: user.user_metadata?.role || 'teacher',
                        school_name: null
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        hapticLight();
        Alert.alert(
            t('profile.logoutConfirmTitle') || 'Log Out',
            t('profile.logoutConfirmMessage') || 'Are you sure you want to sign out?',
            [
                {
                    text: t('common.cancel') || 'Cancel',
                    style: 'cancel',
                },
                {
                    text: t('profile.logout') || 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const { error } = await supabase.auth.signOut();
                            if (error) throw error;
                            // State will be cleared by Auth listener in App.tsx or similar
                        } catch (error) {
                            console.error('Error signing out:', error);
                            hapticError();
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    }

    async function handleDeleteAccount() {
        hapticLight();
        setDeleteModalVisible(true);
    }

    async function confirmDeleteAccount() {
        try {
            await deleteAccount();
            hapticSuccess();
            setDeleteModalVisible(false);
            // Sign out is handled by deleteAccount
        } catch (error) {
            console.error('Error deleting account:', error);
            hapticError();
            Alert.alert(
                'Deletion Failed',
                'We could not delete your account at this time. Please try again later or contact support.',
                [{ text: 'OK' }]
            );
        }
    }

    if (loading) {
        return (
            <ScreenWrapper>
                <ProfileSkeleton />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={t('profile.title') || 'Identity'}
                subtitle={t('profile.subtitle') || "Sanctuary Profile"}
                rightAction={
                    <TouchableOpacity
                        onPress={() => {
                            hapticLight();
                            setSettingsVisible(true);
                        }}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={t('settings.title', 'App Settings')}
                        accessibilityHint={t('settings.hint', 'Open app settings')}
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
                            onRefresh={onRefresh}
                            tintColor={Theme.colors.sanctuarySaffron}
                        />
                    }
                >
                    <VStack space="2xl">
                        {/* Guest Promotion Banner */}
                        {profile?.is_anonymous && (
                            <Box sx={{
                                mx: '$4',
                                p: '$4',
                                bg: colors.action,
                                borderRadius: Theme.corners.comfortable,
                                shadowColor: colors.action,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 4
                            }}>
                                <VStack space="sm">
                                    <Heading size="md" color="white">{t('profile.guestTitle') || 'Guest Explorer'}</Heading>
                                    <Text color="white" size="sm">
                                        {t('profile.guestDesc') || 'You are exploring as a guest. Create an account to save your sanctuary permanently.'}
                                    </Text>
                                    <Button
                                        size="sm"
                                        onPress={() => {
                                            hapticSuccess();
                                            // Logic to trigger AuthScreen for promotion
                                            // We can use navigation to Auth or similar
                                            console.log('Promotion triggered from Profile');
                                        }}
                                        sx={{ bg: 'white', alignSelf: 'flex-start', mt: '$2' }}
                                    >
                                        <ButtonText color={colors.action}>{t('auth.createAccount')}</ButtonText>
                                    </Button>
                                </VStack>
                            </Box>
                        )}

                        {/* Identity Card (Front/Back) */}
                        <Center>
                            <IdentityCard
                                profile={profile}
                                onEdit={() => {
                                    hapticLight();
                                    // @ts-ignore - Navigation typing
                                    navigation.navigate('FullProfile', { profile });
                                }}
                            />
                        </Center>

                        {/* Thuthimal Badge (if gifted Pro subscription) */}
                        {profile?.is_thuthimal && (
                            <Box>
                                <ThuthimalBadge
                                    gifterName={profile.thuthimal_gifter}
                                    giftedAt={profile.thuthimal_gifted_at}
                                    compact={false}
                                />
                            </Box>
                        )}

                        {/* Stats & Gamification */}
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

                        {/* Achievements Gallery */}
                        <AchievementGallery unlockedBadges={rewards?.badges || []} />

                        {/* App Settings Card (New Entry Point) */}
                        <TouchableOpacity
                            onPress={() => {
                                hapticLight();
                                setSettingsVisible(true);
                            }}
                            style={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.generous,
                                padding: Theme.spacing.lg,
                                borderWidth: 1,
                                borderColor: colors.border,
                                marginHorizontal: Theme.spacing.md,
                                shadowColor: colors.shadow,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <HStack justifyContent="space-between" alignItems="center">
                                <HStack space="md" alignItems="center">
                                    <Box
                                        style={{
                                            width: 46,
                                            height: 46,
                                            borderRadius: 14,
                                            backgroundColor: `${colors.action}18`,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Settings size={22} color={colors.action} />
                                    </Box>
                                    <VStack>
                                        <Text color={colors.text} bold>
                                            {t('settings.title', 'App Settings')}
                                        </Text>
                                        <Text color={colors.textSecondary} size="xs">
                                            {t('settings.hint', 'Theme, Language & Quality')}
                                        </Text>
                                    </VStack>
                                </HStack>
                                <Box
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 10,
                                        backgroundColor: colors.tertiary,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                    }}
                                >
                                    <ChevronRight size={18} color={colors.textSecondary} />
                                </Box>
                            </HStack>
                        </TouchableOpacity>

                        {/* Support & FAQ Section */}
                        <VStack px={Theme.spacing.md} space="sm">
                            <Heading size="sm" color={colors.text} mb="$1">
                                {t('profile.supportTitle', 'Assistance & Knowledge')}
                            </Heading>

                            <TouchableOpacity
                                onPress={() => hapticLight()}
                                style={{
                                    backgroundColor: colors.secondary,
                                    borderRadius: Theme.corners.comfortable,
                                    padding: Theme.spacing.md,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    shadowColor: colors.shadow,
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 4,
                                    elevation: 1,
                                }}
                            >
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack space="md" alignItems="center">
                                        <Box
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 10,
                                                backgroundColor: `${colors.action}15`,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <HelpCircle size={18} color={colors.action} />
                                        </Box>
                                        <Text color={colors.text}>FAQ & Help Center</Text>
                                    </HStack>
                                    <ChevronRight size={18} color={colors.textTertiary} />
                                </HStack>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => hapticLight()}
                                style={{
                                    backgroundColor: colors.secondary,
                                    borderRadius: Theme.corners.comfortable,
                                    padding: Theme.spacing.md,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    shadowColor: colors.shadow,
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 4,
                                    elevation: 1,
                                }}
                            >
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack space="md" alignItems="center">
                                        <Box
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 10,
                                                backgroundColor: `${colors.action}15`,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <MessageSquare size={18} color={colors.action} />
                                        </Box>
                                        <Text color={colors.text}>Contact Support</Text>
                                    </HStack>
                                    <ChevronRight size={18} color={colors.textTertiary} />
                                </HStack>
                            </TouchableOpacity>
                        </VStack>

                        {/* About & Feedback Section */}
                        <VStack px={Theme.spacing.md} space="sm">
                            <Heading size="sm" color={colors.text} mb="$1">
                                {t('profile.appInfoTitle', 'App Experience')}
                            </Heading>

                            <TouchableOpacity
                                onPress={() => hapticLight()}
                                style={{
                                    backgroundColor: colors.secondary,
                                    borderRadius: Theme.corners.comfortable,
                                    padding: Theme.spacing.md,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    shadowColor: colors.shadow,
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 4,
                                    elevation: 1,
                                }}
                            >
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack space="md" alignItems="center">
                                        <Box
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 10,
                                                backgroundColor: `${Theme.colors.sanctuarySaffron}18`,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Heart size={18} color={Theme.colors.sanctuarySaffron} />
                                        </Box>
                                        <Text color={colors.text}>I love this app</Text>
                                    </HStack>
                                    <ChevronRight size={18} color={colors.textTertiary} />
                                </HStack>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => hapticLight()}
                                style={{
                                    backgroundColor: colors.secondary,
                                    borderRadius: Theme.corners.comfortable,
                                    padding: Theme.spacing.md,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    shadowColor: colors.shadow,
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 4,
                                    elevation: 1,
                                }}
                            >
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack space="md" alignItems="center">
                                        <Box
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 10,
                                                backgroundColor: `${colors.textSecondary}15`,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Info size={18} color={colors.textSecondary} />
                                        </Box>
                                        <VStack>
                                            <Text color={colors.text}>About this app</Text>
                                            <Text color={colors.textTertiary} size="xs">Version 1.2.0 (Stable)</Text>
                                        </VStack>
                                    </HStack>
                                    <ChevronRight size={18} color={colors.textTertiary} />
                                </HStack>
                            </TouchableOpacity>
                        </VStack>

                        {/* Account Actions Box */}
                        <Box px={Theme.spacing.md} mt="$4">
                            <VStack space="md" sx={{
                                p: '$4',
                                bg: colors.tertiary,
                                borderRadius: Theme.corners.generous,
                                borderWidth: 1,
                                borderColor: colors.border
                            }}>
                                <TouchableOpacity
                                    onPress={handleLogout}
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
                                    <LogOut size={20} color={colors.error || '#EF4444'} style={{ marginRight: 8 }} />
                                    <Text color={colors.error || '#EF4444'} bold>
                                        {t('profile.logout', 'Log Out')}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleDeleteAccount}
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


                    </VStack>
                </ScrollView>

                {/* App Settings Modal */}
                <Modal
                    visible={isSettingsVisible}
                    animationType="slide"
                    presentationStyle="pageSheet"
                    onRequestClose={() => setSettingsVisible(false)}
                >
                    <Box flex={1}>
                        {/* Header with Close Button */}
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
                                        setSettingsVisible(false);
                                    }}
                                    accessible={true}
                                    accessibilityRole="button"
                                    accessibilityLabel="Close settings"
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
                        <AppSettingsScreen navigation={undefined} />
                    </Box>
                </Modal>

                {/* Account Deletion Confirmation Modal */}
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
