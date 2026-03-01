
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Share, Platform } from 'react-native';
import { Text, GlassCard, useThemedColors, Icon, SanctuaryCard, Theme } from '@repo/ui';
import { useSocialLinks } from '@repo/profile';
import { SocialLink, SocialPlatform } from '@repo/core';
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

export const SocialSanctuary: React.FC<SocialSanctuaryProps> = ({ userId, isOwnProfile }) => {
    const colors = useThemedColors();
    const { t } = useTranslation();
    const { links, loading, deleteLink, updateLink } = useSocialLinks(userId);

    const handlePress = async (link: SocialLink) => {
        let url = link.url;
        if (link.platform === 'whatsapp' && !url.startsWith('http')) {
            // Handle whatsapp numbers
            url = `https://wa.me/${url.replace(/[^0-9]/g, '')}`;
        } else if (!url.startsWith('http')) {
            url = `https://${url}`;
        }

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            }
        } catch (error) {
            console.error('Failed to open URL:', error);
        }
    };

    const shareProfile = async () => {
        const profileUrl = `https://app.gurudevi.edlove.org/app`; // Deep link placeholder
        if (Platform.OS === 'web') {
            // Web Share API (modern browsers) or clipboard fallback
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({ title: 'Gurudevi Profile', url: profileUrl });
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
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="h3" style={styles.title}>{t('socialSanctuary.title')}</Text>
                {isOwnProfile && (
                    <TouchableOpacity onPress={shareProfile} style={styles.shareBtn}>
                        <Share2 size={20} color={Theme.colors.ink} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.linksContainer}>
                {visibleLinks.map((link) => {
                    const PlatformIcon = PLATFORM_ICONS[link.platform] || ExternalLink;
                    const PrivacyIcon = PRIVACY_ICONS[link.privacy_level];

                    return (
                        <TouchableOpacity
                            key={link.id}
                            onPress={() => handlePress(link)}
                            activeOpacity={0.7}
                        >
                            <GlassCard style={styles.linkCard}>
                                <View style={styles.linkContent}>
                                    <View style={[styles.platformIcon, { backgroundColor: colors.primary + '20' }]}>
                                        <PlatformIcon size={24} color={colors.primary} />
                                    </View>
                                    <View style={styles.linkTextContainer}>
                                        <Text variant="p2" weight="bold" style={styles.platformName}>
                                            {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                                        </Text>
                                        <Text variant="p3" numberOfLines={1} style={styles.linkUrl}>
                                            {link.url}
                                        </Text>
                                    </View>
                                    {isOwnProfile && (
                                        <View style={styles.privacyIndicator}>
                                            <PrivacyIcon size={16} color={colors.textTertiary} />
                                        </View>
                                    )}
                                    <ExternalLink size={18} color={colors.textTertiary} style={styles.arrowIcon} />
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    );
                })}

                {isOwnProfile && visibleLinks.length === 0 && (
                    <SanctuaryCard variant="glass" style={{ padding: 20, alignItems: 'center' }}>
                        <Text variant="p3" style={styles.emptyText}>
                            {t('socialSanctuary.empty')}
                        </Text>
                    </SanctuaryCard>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
        paddingHorizontal: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        letterSpacing: 0.5,
    },
    shareBtn: {
        padding: 8,
    },
    linksContainer: {
        gap: 12,
    },
    linkCard: {
        padding: 12,
        borderRadius: 16,
    },
    linkContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    platformIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    linkTextContainer: {
        flex: 1,
    },
    platformName: {
        marginBottom: 2,
    },
    linkUrl: {
        opacity: 0.6,
    },
    privacyIndicator: {
        marginRight: 8,
    },
    arrowIcon: {
        opacity: 0.4,
    },
    emptyCard: {
        padding: 20,
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    emptyText: {
        textAlign: 'center',
        opacity: 0.6,
    }
});
