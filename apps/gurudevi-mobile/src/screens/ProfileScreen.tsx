import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import {
    Box,
    VStack,
    Heading,
    Spinner,
    Center,
} from "@gluestack-ui/themed";
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Theme } from '../constants/Theme';
import { hapticSuccess } from '../utils/haptics';

// New Components
import IdentityCard from '../components/profile/IdentityCard';
import ControlScroll from '../components/profile/ControlScroll';
import EditProfileModal from '../components/profile/EditProfileModal';
import GlobalHeader from '../components/shared/GlobalHeader';

export default function ProfileScreen() {
    const { t, i18n } = useTranslation();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);

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
            />
            <ScrollView
                contentContainerStyle={{
                    padding: Theme.spacing.lg,
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
                        />
                    </Center>

                    {/* App Controls (Language, Settings) */}
                    <ControlScroll
                        currentLanguage={currentLanguage}
                        onLanguageChange={changeLanguage}
                    />
                </VStack>
            </ScrollView>

            {/* Edit Profile Modal */}
            <EditProfileModal
                visible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={fetchProfile}
                currentProfile={profile}
            />
        </Box>
    );
}
