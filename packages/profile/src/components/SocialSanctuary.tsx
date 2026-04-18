import React from 'react';
import { Share, Platform, ScrollView } from 'react-native';
import { 
    Text, 
    Box, 
    SanctuaryCard, 
    openExternalURL, 
    showExternalLinkOptions, 
    HStack, 
    VStack, 
    Pressable 
} from '@repo/ui';
import { useSocialLinks } from '../hooks/useSocialLinks';
import type { SocialLink, SocialPlatform } from '@repo/core';
import * as Clipboard from 'expo-clipboard';
import {
    Instagram,
    Linkedin,
    Facebook,
    Twitter,
    Github,
    Globe,
    Phone as WhatsApp,
    ExternalLink,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Share2
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface SocialSanctuaryProps {
    userId: string;
    isOwnProfile: boolean;
}

const PLATFORM_ICONS: Record<SocialPlatform, any> = {
    whatsapp: WhatsApp,
    instagram: Instagram,
    linkedin: Linkedin,
    facebook: Facebook,
    twitter: Twitter,
    github: Github,
    website: Globe,
};

const PRIVACY_ICONS = {
    public: ShieldCheck,
    particulars: Shield,
    private: ShieldAlert,
};

/**
 * SOCIAL SANCTUARY
 * Sanctuary V3 standard for displaying and sharing social connections.
 */
export const SocialSanctuary: React.FC<SocialSanctuaryProps> = ({ userId, isOwnProfile }) => {
    const { t } = useTranslation();
    const { links, loading } = useSocialLinks(userId);

    const handlePress = async (link: SocialLink) => {
        let url = link.url;
        if (link.platform === 'whatsapp' && !url.startsWith('http')) {
            url = `https://wa.me/${url.replace(/[^0-9]/g, '')}`;
        } else if (!url.startsWith('http')) {
            url = `https://${url}`;
        }

        try {
            await openExternalURL(url, {
                title: `${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)} link`,
                sourceLabel: 'Profile',
                sourceBadge: 'Public social link',
                trustLevel: 'external',
            });
        } catch (error) {
            console.error('Failed to open URL:', error);
        }
    };

    const handleOpenOptions = async (link: SocialLink) => {
        let url = link.url;
        if (link.platform === 'whatsapp' && !url.startsWith('http')) {
            url = `https://wa.me/${url.replace(/[^0-9]/g, '')}`;
        } else if (!url.startsWith('http')) {
            url = `https://${url}`;
        }

        await showExternalLinkOptions(url, {
            title: `${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)} link`,
            sourceLabel: 'Profile',
            sourceBadge: 'Public social link',
            trustLevel: 'external',
            copyLabel: 'Copy URL',
            openLabel: 'Open in Browser',
        });
    };

    const shareProfile = async () => {
        const profileUrl = `https://app.gurudevi.edlove.org/app`;
        if (Platform.OS === 'web') {
            if (typeof navigator !== 'undefined' && navigator.share) {
                try {
                    await navigator.share({ title: 'Gurudevi Profile', url: profileUrl });
                } catch {
                    try { await Clipboard.setStringAsync(profileUrl); } catch { /* ignore */ }
                }
            } else {
                await Clipboard.setStringAsync(profileUrl);
            }
        } else {
            Share.share({ message: `Connect with me on Gurudevi!`, url: profileUrl });
        }
    };

    if (loading) return null;

    const visibleLinks = isOwnProfile
        ? links
        : links.filter(l => l.is_public && l.privacy_level !== 'private');

    if (visibleLinks.length === 0 && !isOwnProfile) return null;

    return (
        <VStack className="my-4 px-1" space="md">
            <HStack className="justify-between items-center mb-1">
                <Text className="text-phase-text-primary text-xl font-bold tracking-tight">
                    {t('socialSanctuary.title', 'Social Connections')}
                </Text>
                {isOwnProfile && (
                    <Pressable onPress={shareProfile} className="p-2">
                        <Share2 size={20} color="#9DA1A3" />
                    </Pressable>
                )}
            </HStack>

            <VStack space="sm">
                {visibleLinks.map((link) => {
                    const PlatformIcon = PLATFORM_ICONS[link.platform] || ExternalLink;
                    const PrivacyIcon = PRIVACY_ICONS[link.privacy_level as keyof typeof PRIVACY_ICONS] || Shield;

                    return (
                        <Pressable
                            key={link.id}
                            onPress={() => handlePress(link)}
                            onLongPress={() => handleOpenOptions(link)}
                        >
                            <SanctuaryCard variant="glass" className="p-3.5 rounded-2xl">
                                <HStack className="items-center">
                                    <Box className="w-11 h-11 rounded-xl justify-center items-center mr-3 bg-phase-interactive/10">
                                        <PlatformIcon size={24} color="#4A90E2" />
                                    </Box>
                                    <VStack className="flex-1">
                                        <Text className="text-md font-bold text-phase-text-primary">
                                            {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                                        </Text>
                                        <Text className="text-xs text-phase-text-tertiary" numberOfLines={1}>
                                            {link.url}
                                        </Text>
                                    </VStack>
                                    {isOwnProfile && PrivacyIcon && (
                                        <Box className="mr-2">
                                            <PrivacyIcon size={16} color="#9DA1A3" />
                                        </Box>
                                    )}
                                    <ExternalLink size={18} color="#9DA1A3" className="opacity-40" />
                                </HStack>
                            </SanctuaryCard>
                        </Pressable>
                    );
                })}

                {isOwnProfile && visibleLinks.length === 0 && (
                    <SanctuaryCard variant="glass" className="p-5 items-center">
                        <Text className="text-sm text-phase-text-tertiary text-center italic">
                            {t('socialSanctuary.empty', 'No social links added yet.')}
                        </Text>
                    </SanctuaryCard>
                )}
            </VStack>
        </VStack>
    );
};
