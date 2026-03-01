/**
 * CONTACT LINKTREE
 * A premium Sanctuary social sharing interface.
 * 
 * Supports elective sharing of social links with glassmorphism aesthetics.
 */

import React, { useCallback } from 'react';
import { Linking, Platform } from 'react-native';
import {
    VStack,
    HStack,
    Box,
    Text,
    Theme,
    SanctuaryCard,
    SanctuaryButton,
    useThemedColors,
    LivingGlow,
    FadeInDown,
    openExternalURL,
} from '@repo/ui';
import {
    Phone,
    Linkedin,
    Instagram,
    Globe,
    ExternalLink,
    Mail,
    MessagesSquare,
    ShieldCheck,
    Shield,
    ShieldAlert,
    Link
} from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { SocialLink } from '@repo/core';
import * as Clipboard from 'expo-clipboard';

interface ContactLinktreeProps {
    links: SocialLink[];
    userName: string;
    bio?: string;
    isOwnProfile?: boolean;
}

const PRIVACY_ICONS: Record<string, any> = {
    public: ShieldCheck,
    particulars: Shield,
    private: ShieldAlert,
};

const PROVIDER_CONFIG: Record<string, {
    icon: React.ComponentType<any>;
    color: string;
    label: string;
    getUri: (value: string) => string;
}> = {
    whatsapp: {
        icon: MessagesSquare,
        color: Theme.colors.whatsapp,
        label: 'WhatsApp',
        getUri: (value) => `whatsapp://send?phone=${value.replace(/\D/g, '')}`
    },
    linkedin: {
        icon: Linkedin,
        color: Theme.colors.linkedin,
        label: 'LinkedIn',
        getUri: (value) => value.startsWith('http') ? value : `https://www.linkedin.com/in/${value}`
    },
    instagram: {
        icon: Instagram,
        color: Theme.colors.instagram,
        label: 'Instagram',
        getUri: (value) => value.startsWith('http') ? value : `https://instagram.com/${value}`
    },
    portfolio: {
        icon: Globe,
        color: Theme.colors.portfolio,
        label: 'Portfolio',
        getUri: (value) => value.startsWith('http') ? value : `https://${value}`
    },
    email: {
        icon: Mail,
        color: Theme.colors.emberOrange,
        label: 'Email',
        getUri: (value) => `mailto:${value}`
    }
};

export function ContactLinktree({ links, userName, bio, isOwnProfile }: ContactLinktreeProps) {
    const colors = useThemedColors();

    const handlePress = useCallback(async (provider: string, value: string) => {
        const config = PROVIDER_CONFIG[provider];
        if (!config) return;

        const uri = config.getUri(value);

        if (Platform.OS === 'web') {
            // On web, always open in a new tab — never replace the running app
            const webUrl = uri.startsWith('http') ? uri
                : uri.startsWith('whatsapp://') ? `https://wa.me/${value.replace(/\D/g, '')}`
                : null;
            if (webUrl) { openExternalURL(webUrl); }
            return;
        }

        const supported = await Linking.canOpenURL(uri);
        if (supported) {
            await Linking.openURL(uri);
        } else {
            // Fallback if app not installed
            if (uri.startsWith('whatsapp://')) {
                await Linking.openURL(`https://wa.me/${value.replace(/\D/g, '')}`);
            } else if (!uri.startsWith('http')) {
                console.warn('Unhandled URI scheme:', uri);
            }
        }
    }, []);

    const handleCopyProfileLink = useCallback(async () => {
        const url = typeof window !== 'undefined'
            ? window.location.href
            : `https://app.gurudevi.edlove.org`;
        if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title: `${userName} on Gurudevi`, url });
            } catch {
                // Cancelled or unavailable — fall back to clipboard
                try { await Clipboard.setStringAsync(url); } catch { /* ignore */ }
            }
        } else {
            await Clipboard.setStringAsync(url);
        }
    }, [userName]);

    const visibleLinks = isOwnProfile
        ? links
        : links.filter(l => l.is_public && l.privacy_level !== 'private');

    return (
        <VStack space="lg" sx={{ width: '100%' }}>
            {/* Header / Intro */}
            <VStack space="xs" alignItems="center" sx={{ marginBottom: Theme.spacing.md }}>
                <LivingGlow size={64} glowColor={Theme.colors.sanctuarySaffron}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: Theme.corners.full,
                            backgroundColor: colors.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            borderColor: Theme.colors.sanctuarySaffron
                        }}
                    >
                        <Text size="xl" bold color={colors.textPrimary}>
                            {userName.charAt(0)}
                        </Text>
                    </Box>
                </LivingGlow>
                <Text size="xl" bold color={colors.textPrimary} sx={{ marginTop: Theme.spacing.sm }}>
                    {userName}
                </Text>
                {bio && (
                    <Text size="sm" color={colors.textSecondary} textAlign="center" sx={{ paddingHorizontal: Theme.spacing.xl }}>
                        {bio}
                    </Text>
                )}
                {/* Copy/Share profile link — visible on web always, on native only for own profile */}
                {(Platform.OS === 'web' || isOwnProfile) && (
                    <SanctuaryButton
                        size="sm"
                        variant="outline"
                        onPress={handleCopyProfileLink}
                        leftIcon={Link}
                    >
                        {Platform.OS === 'web' ? 'Share Profile Link' : 'Copy Profile Link'}
                    </SanctuaryButton>
                )}
            </VStack>

            {/* Link List */}
            <VStack space="md">
                {visibleLinks.map((link, index) => {
                    const config = PROVIDER_CONFIG[link.platform]; // Corrected from .provider
                    if (!config) return null;
                    const Icon = config.icon;
                    const PrivacyIcon = PRIVACY_ICONS[link.privacy_level || 'public'];

                    return (
                        <Animated.View
                            key={`${link.platform}-${index}`} // Corrected from .provider
                            entering={FadeInDown.delay(index * 100).springify()}
                        >
                            <SanctuaryCard
                                variant="glass"
                                onPress={() => handlePress(link.platform, link.url)} // Corrected from .provider
                            >
                                <HStack space="md" alignItems="center" sx={{ padding: Theme.spacing.md }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: Theme.corners.comfortable,
                                            backgroundColor: `${config.color}20`,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Icon color={config.color} size={20} />
                                    </Box>
                                    <VStack sx={{ flex: 1 }}>
                                        <HStack space="xs" alignItems="center">
                                            <Text size="md" bold color={colors.textPrimary}>
                                                {config.label}
                                            </Text>
                                            {isOwnProfile && PrivacyIcon && (
                                                <PrivacyIcon size={12} color={colors.textTertiary} />
                                            )}
                                        </HStack>
                                        <Text size="xs" color={colors.textTertiary} numberOfLines={1}>
                                            {link.url}
                                        </Text>
                                    </VStack>
                                    <ExternalLink size={18} color={colors.textTertiary} />
                                </HStack>
                            </SanctuaryCard>
                        </Animated.View>
                    );
                })}
            </VStack>

            {links.length === 0 && (
                <Box sx={{ paddingVertical: Theme.spacing.xl, alignItems: 'center' }}>
                    <Text color={colors.textTertiary} italic>
                        No public contacts shared yet.
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
