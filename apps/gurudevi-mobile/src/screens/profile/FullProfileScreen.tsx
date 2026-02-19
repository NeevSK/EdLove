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
    ScreenWrapper
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe, Phone, Mail, Award, Shield } from 'lucide-react-native';
import IdentityCard from '../../components/profile/IdentityCard';

interface FullProfileScreenProps {
    route: {
        params: {
            profile: any;
        }
    };
    navigation: any;
}

export default function FullProfileScreen({ route, navigation }: FullProfileScreenProps) {
    const { profile } = route.params;
    const { t } = useTranslation();
    const colors = useThemedColors();

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
        }
    ];

    return (
        <ScreenWrapper>
            <GlobalHeader
                title={t('profile.fullProfile', 'Full Profile')}
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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
        </ScreenWrapper>
    );
}
