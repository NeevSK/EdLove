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
} from "@/ui";
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Theme } from '../constants/Theme';
import { hapticSuccess, hapticLight, hapticError } from '../utils/haptics';

import { LogOut, Settings } from 'lucide-react-native';
// New Components
import IdentityCard from '../components/profile/IdentityCard';
import QRCodeGenerator from '../components/shared/QRCodeGenerator';
import ControlScroll from '../components/profile/ControlScroll';
import EditProfileModal from '../components/profile/EditProfileModal';
import GlobalHeader from '../components/shared/GlobalHeader';
import UserStatsCard from '../components/profile/UserStatsCard';
import SupportSection from '../components/profile/SupportSection';
import ThuthimalBadge from '../components/profile/ThuthimalBadge';
import AppSettingsScreen from './AppSettingsScreen';
import { Modal, TouchableOpacity } from 'react-native';
import { X, Phone, Globe, MapPin, QrCode } from 'lucide-react-native';

export default function ProfileScreen() {
    const { t, i18n } = useTranslation();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isSettingsVisible, setSettingsVisible] = useState(false);

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

    async function changeLanguage(lang: 'si' | 'ta' | 'en') {
        hapticSuccess();
        await i18n.changeLanguage(lang);
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
            <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
                <Center sx={{ flex: 1 }}>
                    <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
                </Center>
            </Box>
        );
    }

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <GlobalHeader
                title={t('profile.title') || 'Identity'}
                subtitle="Sanctuary Profile"
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
                            backgroundColor: 'rgba(230, 126, 34, 0.1)',
                        }}
                    >
                        <Settings size={24} color={Theme.colors.sanctuarySaffron} />
                    </TouchableOpacity>
                }
            />
            <ScrollView
                contentContainerStyle={{
                    padding: Theme.spacing.lg,
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
                    {/* Identity Card (Front/Back) */}
                    <Center>
                        <IdentityCard
                            profile={profile}
                            onEdit={() => setEditModalVisible(true)}
                            onExpand={() => setIsFullScreen(true)}
                        />
                    </Center>

                    {/* Thuthimal Badge (if gifted Pro subscription) */}
                    {profile?.is_thuthimal && (
                        <Box px={Theme.spacing.md}>
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
                            guruPoints: 850
                        }}
                    />

                    {/* App Controls (Language, Settings) */}
                    <ControlScroll
                        currentLanguage={currentLanguage}
                        onLanguageChange={changeLanguage}
                    />

                    <SupportSection />

                    {/* Account Actions - Moved to end */}
                    <VStack space="md" mt={Theme.spacing.xl}>
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
                        <Button
                            size="lg"
                            variant="link"
                            onPress={handleDeleteAccount}
                        >
                            <ButtonText color={Theme.colors.dimGray} size="sm">
                                Delete Account
                            </ButtonText>
                        </Button>
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

            {/* Full Screen Profile Modal */}
            <Modal
                animationType="slide"
                visible={isFullScreen}
                onRequestClose={() => setIsFullScreen(false)}
                presentationStyle="pageSheet"
            >
                <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
                    {/* Header */}
                    <VStack p={Theme.spacing.lg} pt={Theme.spacing.xl} space="md">
                        <HStack justifyContent="space-between" alignItems="center">
                            <Heading color={Theme.colors.sanctuarySaffron} size="xl">
                                Detailed Profile
                            </Heading>
                            <TouchableOpacity onPress={() => setIsFullScreen(false)} style={{ padding: 8 }}>
                                <X size={24} color={Theme.colors.mistGray} />
                            </TouchableOpacity>
                        </HStack>
                    </VStack>

                    <ScrollView contentContainerStyle={{ padding: Theme.spacing.lg, paddingBottom: 50 }}>
                        <VStack space="2xl">
                            {/* Large Identity Card Repetition or Just Info */}
                            <Center>
                                <IdentityCard
                                    profile={profile}
                                    onEdit={() => setEditModalVisible(true)}
                                // No expand button here
                                />
                            </Center>

                            {/* Detailed Info Section */}
                            <Box sx={{ backgroundColor: Theme.colors.deepIndigo, padding: Theme.spacing.lg, borderRadius: Theme.corners.comfortable }}>
                                <Heading color={Theme.colors.sacredWhite} size="sm" mb="$4">
                                    Contact & School Info
                                </Heading>
                                <VStack space="md">
                                    <HStack space="md" alignItems="center">
                                        <MapPin size={18} color={Theme.colors.mistGray} />
                                        <VStack>
                                            <Text color={Theme.colors.dimGray} size="xs">School</Text>
                                            <Text color={Theme.colors.sacredWhite}>{profile?.school_name || 'Not assigned'}</Text>
                                        </VStack>
                                    </HStack>
                                    <HStack space="md" alignItems="center">
                                        <Globe size={18} color={Theme.colors.mistGray} />
                                        <VStack>
                                            <Text color={Theme.colors.dimGray} size="xs">Email</Text>
                                            <Text color={Theme.colors.sacredWhite}>{profile?.email}</Text>
                                        </VStack>
                                    </HStack>
                                    <HStack space="md" alignItems="center">
                                        <Phone size={18} color={Theme.colors.mistGray} />
                                        <VStack>
                                            <Text color={Theme.colors.dimGray} size="xs">Phone</Text>
                                            <Text color={Theme.colors.sacredWhite}>{profile?.phone || '+94 7X XXX XXXX'}</Text>
                                        </VStack>
                                    </HStack>
                                </VStack>
                            </Box>

                            {/* Stats Again (Optional) */}
                            <UserStatsCard role={profile?.role || 'student'} />

                            {/* QR Code Large View */}
                            <Box sx={{ backgroundColor: 'white', padding: Theme.spacing.xl, borderRadius: Theme.corners.comfortable, alignItems: 'center' }}>
                                <Heading color="black" size="md" mb="$4">My Identity QR</Heading>
                                <QRCodeGenerator
                                    value={profile?.id || 'gurudevi-guest'}
                                    size={200}
                                    color="black"
                                    backgroundColor="white"
                                />
                                <Text color="gray" size="sm" mt="$2" textAlign="center">
                                    Scan to share contact info
                                </Text>
                            </Box>
                        </VStack>
                    </ScrollView>
                </Box>
            </Modal>

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
                            backgroundColor: Theme.colors.creamSilence,
                            paddingTop: 50,
                            paddingBottom: Theme.spacing.md,
                            paddingHorizontal: Theme.spacing.md,
                            borderBottomWidth: 1,
                            borderBottomColor: Theme.colors.sandStone,
                        }}
                    >
                        <HStack justifyContent="space-between" alignItems="center">
                            <Heading size="lg" color={Theme.colors.charcoalTruth}>
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
                                    backgroundColor: Theme.colors.sandStone,
                                }}
                            >
                                <X size={24} color={Theme.colors.charcoalTruth} />
                            </TouchableOpacity>
                        </HStack>
                    </Box>
                    <AppSettingsScreen navigation={undefined} />
                </Box>
            </Modal>
        </Box>
    );
}
