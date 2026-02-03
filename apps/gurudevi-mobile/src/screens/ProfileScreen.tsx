import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    Text,
    Heading,
    HStack,
    Button,
    ButtonIcon,
    ButtonText,
    Spinner,
    Center,
    Pressable,
} from "@gluestack-ui/themed";
import { LogOut, Globe } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Theme } from '../constants/Theme';
import { hapticLight, hapticSuccess } from '../utils/haptics';

export default function ProfileScreen() {
    const { t, i18n } = useTranslation();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const currentLanguage = i18n.language;

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) setProfile(data);
                else setProfile({
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    role: user.user_metadata?.role || 'teacher'
                }); // Fallback
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        hapticLight();
        await supabase.auth.signOut();
    }

    async function changeLanguage(lang: 'si' | 'ta' | 'en') {
        hapticSuccess();
        await i18n.changeLanguage(lang);
        // TODO: Persist language preference to AsyncStorage
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
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo, padding: Theme.spacing.lg }}>
            <VStack space="xl" sx={{ marginTop: Theme.spacing['3xl'] }}>
                {/* Header */}
                <HStack justifyContent="space-between" alignItems="center">
                    <Heading size="2xl" color={Theme.colors.sanctuarySaffron}>
                        {t('profile.title')}
                    </Heading>
                    <Button
                        size="sm"
                        action="negative"
                        variant="outline"
                        onPress={handleLogout}
                        sx={{
                            borderColor: Theme.colors.mistGray,
                            borderRadius: Theme.corners.comfortable,
                        }}
                    >
                        <ButtonIcon as={LogOut} color={Theme.colors.mistGray} />
                    </Button>
                </HStack>

                {/* Profile Info Card */}
                <Box
                    p={Theme.spacing.xl}
                    sx={{
                        backgroundColor: Theme.colors.midnightBlue,
                        borderRadius: Theme.corners.generous
                    }}
                >
                    <VStack space="md">
                        <VStack space="xs">
                            <Text color={Theme.colors.dimGray} size="sm">
                                {t('profile.fullName')}
                            </Text>
                            <Text color={Theme.colors.sacredWhite} size="lg" bold>
                                {profile?.full_name || t('profile.guestUser')}
                            </Text>
                        </VStack>

                        <VStack space="xs">
                            <Text color={Theme.colors.dimGray} size="sm">
                                {t('profile.role')}
                            </Text>
                            <Text color={Theme.colors.sacredWhite} size="md">
                                {t(`auth.${profile?.role || 'teacher'}`)}
                            </Text>
                        </VStack>

                        <VStack space="xs">
                            <Text color={Theme.colors.dimGray} size="sm">
                                {t('profile.school')}
                            </Text>
                            <Text color={Theme.colors.sacredWhite} size="md">
                                {profile?.school_name || t('profile.notSetYet')}
                            </Text>
                        </VStack>
                    </VStack>
                </Box>

                {/* Language Selector */}
                <Box
                    p={Theme.spacing.xl}
                    sx={{
                        backgroundColor: Theme.colors.midnightBlue,
                        borderRadius: Theme.corners.generous
                    }}
                >
                    <VStack space="md">
                        <HStack space="sm" alignItems="center">
                            <Globe color={Theme.colors.sanctuarySaffron} size={20} />
                            <Text color={Theme.colors.sacredWhite} size="md" bold>
                                {t('profile.language')}
                            </Text>
                        </HStack>

                        <HStack space="md">
                            {/* Sinhala */}
                            <Pressable
                                onPress={() => changeLanguage('si')}
                                sx={{ flex: 1 }}
                            >
                                <Box
                                    p={Theme.spacing.md}
                                    sx={{
                                        backgroundColor: currentLanguage === 'si'
                                            ? Theme.colors.sanctuarySaffron
                                            : Theme.colors.deepIndigo,
                                        borderRadius: Theme.corners.comfortable,
                                        borderWidth: 2,
                                        borderColor: currentLanguage === 'si'
                                            ? Theme.colors.sanctuarySaffron
                                            : Theme.colors.transparent,
                                    }}
                                >
                                    <Text
                                        textAlign="center"
                                        color={currentLanguage === 'si' ? Theme.colors.white : Theme.colors.mistGray}
                                        bold={currentLanguage === 'si'}
                                    >
                                        සිංහල
                                    </Text>
                                </Box>
                            </Pressable>

                            {/* Tamil */}
                            <Pressable
                                onPress={() => changeLanguage('ta')}
                                sx={{ flex: 1 }}
                            >
                                <Box
                                    p={Theme.spacing.md}
                                    sx={{
                                        backgroundColor: currentLanguage === 'ta'
                                            ? Theme.colors.sanctuarySaffron
                                            : Theme.colors.deepIndigo,
                                        borderRadius: Theme.corners.comfortable,
                                        borderWidth: 2,
                                        borderColor: currentLanguage === 'ta'
                                            ? Theme.colors.sanctuarySaffron
                                            : Theme.colors.transparent,
                                    }}
                                >
                                    <Text
                                        textAlign="center"
                                        color={currentLanguage === 'ta' ? Theme.colors.white : Theme.colors.mistGray}
                                        bold={currentLanguage === 'ta'}
                                    >
                                        தமிழ்
                                    </Text>
                                </Box>
                            </Pressable>

                            {/* English */}
                            <Pressable
                                onPress={() => changeLanguage('en')}
                                sx={{ flex: 1 }}
                            >
                                <Box
                                    p={Theme.spacing.md}
                                    sx={{
                                        backgroundColor: currentLanguage === 'en'
                                            ? Theme.colors.sanctuarySaffron
                                            : Theme.colors.deepIndigo,
                                        borderRadius: Theme.corners.comfortable,
                                        borderWidth: 2,
                                        borderColor: currentLanguage === 'en'
                                            ? Theme.colors.sanctuarySaffron
                                            : Theme.colors.transparent,
                                    }}
                                >
                                    <Text
                                        textAlign="center"
                                        color={currentLanguage === 'en' ? Theme.colors.white : Theme.colors.mistGray}
                                        bold={currentLanguage === 'en'}
                                    >
                                        English
                                    </Text>
                                </Box>
                            </Pressable>
                        </HStack>

                        <Text color={Theme.colors.dimGray} size="xs" textAlign="center">
                            {t('profile.languageDesc')}
                        </Text>
                    </VStack>
                </Box>

                {/* Quote */}
                <Box
                    p={Theme.spacing.lg}
                    sx={{
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        borderRadius: Theme.corners.generous,
                        opacity: Theme.opacity.medium
                    }}
                >
                    <Text color={Theme.colors.white} italic textAlign="center">
                        {t('profile.quote')}
                    </Text>
                </Box>
            </VStack>
        </Box>
    );
}
