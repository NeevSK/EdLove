import React from 'react';
import { ScrollView, Linking } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    ButtonText,
    useThemedColors,
    Theme,
    GlobalHeader,
    ScreenWrapper,
    useBottomTabPadding
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe, Phone, Mail, Award, Shield, User as UserIcon, Fingerprint } from 'lucide-react-native';
import IdentityCard from '../../components/profile/IdentityCard';
import EditProfileModal from '../../components/profile/EditProfileModal';
import { supabase } from '@repo/core';

interface FullProfileScreenProps {
    route: {
        params: {
            profile: any;
        }
    };
    navigation: any;
}

export default function FullProfileScreen({ route, navigation }: FullProfileScreenProps) {
    const [profile, setProfile] = React.useState(route.params.profile);
    const [isEditModalVisible, setEditModalVisible] = React.useState(false);
    const { t } = useTranslation();
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();

    const fetchProfile = async () => {
        if (!profile?.id) return;
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                schools (
                    name
                )
            `)
            .eq('id', profile.id)
            .single();

        if (data) {
            setProfile({
                ...data,
                school_name: data.schools?.name || null
            });
        }
    };

    if (!profile) return null;

    const contactItems = [
        {
            icon: MapPin,
            label: t('profile.school', 'School'),
            value: profile.school_name || t('common.notAssigned', 'Not assigned')
        },
        {
            icon: Mail,
            label: t('profile.email', 'Email'),
            value: profile.email
        },
        {
            icon: Phone,
            label: t('profile.phone', 'Phone'),
            value: profile.phone || t('common.notProvided', 'Not provided')
        },
        {
            icon: Shield,
            label: t('profile.role', 'Role'),
            value: t(`role.${profile.role}`, profile.role)
        },
        ...(profile.role === 'student' ? [{
            icon: Fingerprint,
            label: t('profile.indexNumber', 'Index Number'),
            value: profile.index_number || t('common.notProvided', 'Not provided')
        }] : []),
        ...(profile.role === 'teacher' || profile.role === 'principal' ? [{
            icon: UserIcon,
            label: t('profile.nicNumber', 'NIC Number'),
            value: profile.nic_number || t('common.notProvided', 'Not provided')
        }] : [])
    ];

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={t('profile.fullProfile', 'Full Profile')}
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding }}>
                <VStack space="xl" sx={{ padding: Theme.spacing.md }}>

                    {/* Identity Card Reuse */}
                    <IdentityCard profile={profile} />

                    {/* Detailed Information */}
                    <Box
                        sx={{
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.comfortable,
                            padding: Theme.spacing.lg,
                            borderWidth: 1,
                            borderColor: colors.border
                        }}
                    >
                        <Heading size="md" color={colors.text} mb="$4">
                            {t('profile.personalDetails', 'Personal Details')}
                        </Heading>

                        <VStack space="lg">
                            {contactItems.map((item, index) => (
                                <HStack key={index} space="md" alignItems="center">
                                    <Box
                                        sx={{
                                            padding: 10,
                                            borderRadius: Theme.corners.full,
                                            backgroundColor: colors.tertiary
                                        }}
                                    >
                                        <item.icon size={20} color={colors.action} />
                                    </Box>
                                    <VStack>
                                        <Text size="xs" color={colors.textSecondary}>
                                            {item.label}
                                        </Text>
                                        <Text size="md" color={colors.text} bold>
                                            {item.value}
                                        </Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </VStack>
                    </Box>

                    {/* Bio Section */}
                    {profile.bio && (
                        <Box
                            sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.comfortable,
                                padding: Theme.spacing.lg,
                                borderWidth: 1,
                                borderColor: colors.border
                            }}
                        >
                            <Heading size="sm" color={colors.text} mb="$2">
                                {t('profile.bio', 'Bio')}
                            </Heading>
                            <Text size="md" color={colors.textSecondary}>
                                {profile.bio}
                            </Text>
                        </Box>
                    )}

                    {/* Unified Edit Button */}
                    <Box px={Theme.spacing.md} mb={Theme.spacing.xl}>
                        <Button
                            size="xl"
                            action="primary"
                            onPress={() => setEditModalVisible(true)}
                            sx={{
                                backgroundColor: Theme.colors.sanctuarySaffron,
                                borderRadius: Theme.corners.comfortable
                            }}
                        >
                            <ButtonText color={Theme.colors.white}>{t('profile.editProfile', 'Edit Profile')}</ButtonText>
                        </Button>
                    </Box>
                    {/* Additional Metadata if needed */}
                    {profile.created_at && (
                        <Box alignItems="center" mt="$4">
                            <Text size="xs" color={colors.textTertiary}>
                                {t('profile.memberSince', 'Member since')} {new Date(profile.created_at).toLocaleDateString()}
                            </Text>
                        </Box>
                    )}
                </VStack>
            </ScrollView>

            <EditProfileModal
                visible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={() => {
                    fetchProfile();
                }}
                currentProfile={profile}
            />
        </ScreenWrapper>
    );
}
