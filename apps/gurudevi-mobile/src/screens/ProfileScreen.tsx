import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Alert } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Spinner,
    Center,
    Button,
    ButtonText,
    Text
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { supabase } from '@repo/core';
import { Theme, useThemedColors } from '@repo/ui';
import { hapticSuccess, hapticLight, hapticError } from '@repo/ui';

import { LogOut, Settings, Trophy, MapPin, Globe, Phone, ChevronRight } from 'lucide-react-native';
// New Components
import IdentityCard from '../components/profile/IdentityCard';
import UserStatsCard from '../components/profile/UserStatsCard';
import SupportSection from '../components/profile/SupportSection';
import ThuthimalBadge from '../components/profile/ThuthimalBadge';
import EditProfileModal from '../components/profile/EditProfileModal';
import { GlobalHeader } from '@repo/ui';
import AppSettingsScreen from './AppSettingsScreen';
import { Modal, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { ScreenWrapper } from '@repo/ui';

import { useEnvironment } from '@repo/ui';

export default function ProfileScreen() {
    const { t, i18n } = useTranslation();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isSettingsVisible, setSettingsVisible] = useState(false);
    const { isDark } = useEnvironment();
    const colors = useThemedColors();

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
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. All your data will be permanently deleted. Are you sure?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete Forever',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // Note: Account deletion should be handled server-side via API
                            // For now, inform user that feature is not yet available
                            Alert.alert(
                                'Feature Not Available',
                                'Account deletion will be available soon. Please contact support if you need immediate assistance.',
                                [{ text: 'OK' }]
                            );
                        } catch (error) {
                            console.error('Error deleting account:', error);
                            hapticError();
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    }

    if (loading) {
        return (
            <ScreenWrapper>
                <Center sx={{ flex: 1 }}>
                    <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
                </Center>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
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
                        paddingBottom: 100, // Extra padding for scrolling
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
                                onEdit={() => setEditModalVisible(true)}
                            // onExpand removed to hide redundant "Full View" button
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
                                classesTaught: 12, // Mock data for now
                                studentsCount: 145,
                                guruPoints: 850,
                                attendanceStreak: 5,
                                assignmentsCompleted: 24
                            }}
                        />

                        {/* Contact Info Section (Inlined) */}
                        <Box sx={{ backgroundColor: colors.secondary, padding: Theme.spacing.lg, borderRadius: Theme.corners.comfortable, borderColor: colors.border, borderWidth: 1, marginHorizontal: Theme.spacing.md }}>
                            <Heading color={colors.text} size="sm" mb="$4">
                                {t('profile.contactInfo')}
                            </Heading>
                            <VStack space="md">
                                <HStack space="md" alignItems="center">
                                    <MapPin size={18} color={colors.textSecondary} />
                                    <VStack>
                                        <Text color={colors.textTertiary} size="xs">School</Text>
                                        <Text color={colors.text}>{profile?.school_name || 'Not assigned'}</Text>
                                    </VStack>
                                </HStack>
                                <HStack space="md" alignItems="center">
                                    <Globe size={18} color={colors.textSecondary} />
                                    <VStack>
                                        <Text color={colors.textTertiary} size="xs">Email</Text>
                                        <Text color={colors.text}>{profile?.email}</Text>
                                    </VStack>
                                </HStack>
                                <HStack space="md" alignItems="center">
                                    <Phone size={18} color={colors.textSecondary} />
                                    <VStack>
                                        <Text color={colors.textTertiary} size="xs">Phone</Text>
                                        <Text color={colors.text}>{profile?.phone || '+94 7X XXX XXXX'}</Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </Box>


                        {/* Student-specific Growth & Insights */}
                        {profile?.role === 'student' && (
                            <Box sx={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: Theme.spacing.lg, borderRadius: Theme.corners.generous, borderWidth: 1, borderColor: Theme.colors.sanctuarySaffron, marginHorizontal: Theme.spacing.md }}>
                                <HStack space="sm" alignItems="center" mb="$2">
                                    <Trophy size={18} color={Theme.colors.sanctuarySaffron} />
                                    <Text color={colors.text} bold>Growth & Insights</Text>
                                </HStack>
                                <Text color={colors.textSecondary} size="sm">
                                    You've gained 3 new insights this week! Your learning ecology is thriving.
                                </Text>
                                <Button mt="$3" size="sm" variant="outline" sx={{ borderColor: Theme.colors.sanctuarySaffron }}>
                                    <ButtonText color={Theme.colors.sanctuarySaffron}>View Progress</ButtonText>
                                </Button>
                            </Box>
                        )}

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
                                marginHorizontal: Theme.spacing.md
                            }}
                        >
                            <HStack justifyContent="space-between" alignItems="center">
                                <HStack space="md" alignItems="center">
                                    <Box
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 14,
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                                <ChevronRight size={20} color={colors.textSecondary} />
                            </HStack>
                        </TouchableOpacity>

                        <SupportSection />

                        {/* Account Actions - Moved to end */}
                        <VStack space="md" mt={Theme.spacing.xl} mx={Theme.spacing.md}>
                            {/* Logout Button */}
                            <Button
                                size="xl"
                                variant="outline"
                                action="negative"
                                onPress={handleLogout}
                                sx={{
                                    borderColor: Theme.colors.emberRed,
                                    borderWidth: 1,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <ButtonText color={Theme.colors.emberRed}>
                                    {t('profile.logout') || 'Log Out'}
                                </ButtonText>
                                <LogOut size={20} color={Theme.colors.emberRed} style={{ marginLeft: 8 }} />
                            </Button>

                            {/* Delete Account Button */}
                            <Box sx={{
                                mt: Theme.spacing.md,
                                padding: Theme.spacing.md,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: isDark ? '#1A0505' : '#FFF5F5',
                                borderColor: isDark ? '#C0392B' : '#FEB2B2',
                                borderWidth: 1,
                                alignItems: 'center'
                            }}>
                                <Button
                                    size="sm"
                                    variant="link"
                                    onPress={handleDeleteAccount}
                                >
                                    <ButtonText color={Theme.colors.emberRed} size="sm" bold>
                                        {t('profile.deletePermanent') || "Delete Account Permanently"}
                                    </ButtonText>
                                </Button>
                                <Text color={colors.textTertiary} size="xs" textAlign="center" mt="$1">
                                    This action is permanent and cannot be undone.
                                </Text>
                            </Box>
                        </VStack>
                    </VStack>
                </ScrollView>

                {/* Edit Profile Modal */}
                <EditProfileModal
                    visible={isEditModalVisible}
                    onClose={() => setEditModalVisible(false)}
                    onSave={fetchProfile}
                    currentProfile={profile}
                />

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
            </Box>
        </ScreenWrapper>
    );
}
