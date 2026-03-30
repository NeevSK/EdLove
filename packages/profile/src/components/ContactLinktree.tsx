/**
 * CONTACT LINKTREE
 * A premium Sanctuary social sharing interface.
 * 
 * Supports elective sharing of social links with glassmorphism aesthetics.
 */

import React, { useCallback, useState } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
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
    showExternalLinkOptions,
    hapticLight,
    hapticHeavy,
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
    Link,
    Edit2,
    Trash2,
    Plus,
} from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { SocialLink } from '@repo/core';
import * as Clipboard from 'expo-clipboard';
import { AddSocialLinkModal } from './AddSocialLinkModal';
import { useSocialLinks } from '../hooks/useSocialLinks';
import { InlineSocialLinkEditor } from './InlineSocialLinkEditor';

interface ContactLinktreeProps {
    links: SocialLink[];
    userName: string;
    userId?: string;
    bio?: string;
    isOwnProfile?: boolean;
    editable?: boolean;
    inline?: boolean;
}

const PRIVACY_ICONS: Record<string, string> = {
    public: '\uD83C\uDF10',      // 🌐
    particulars: '\uD83D\uDC65', // 👥
    private: '\uD83D\uDD12',     // 🔒
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

export function ContactLinktree({ links, userName, bio, isOwnProfile, userId, editable, inline }: ContactLinktreeProps) {
    const colors = useThemedColors();
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<SocialLink | undefined>();
    const { deleteLink, addLink, updateLink } = useSocialLinks(userId || '');
    const [inlineAdding, setInlineAdding] = useState(false);
    const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);

    const displayLinks = isOwnProfile 
        ? links 
        : links.filter(l => l.privacy_level === 'public' || (l.is_public && l.privacy_level !== 'private'));

    const handlePress = useCallback(async (provider: string, value: string) => {
        const config = PROVIDER_CONFIG[provider];
        if (!config) return;

        const uri = config.getUri(value);

        const webUrl = uri.startsWith('http') ? uri
            : uri.startsWith('whatsapp://') ? `https://wa.me/${value.replace(/\D/g, '')}`
            : null;

        if (Platform.OS === 'web') {
            if (webUrl) {
                openExternalURL(webUrl, {
                    title: config.label,
                    sourceLabel: 'Profile',
                    sourceBadge: 'Public contact link',
                    trustLevel: 'external',
                });
            } else {
                openExternalURL(uri);
            }
            return;
        }

        try {
            await openExternalURL(uri, {
                title: config.label,
                sourceLabel: 'Profile',
                sourceBadge: 'Public contact link',
                trustLevel: uri.startsWith('http') ? 'external' : undefined,
            });
        } catch {
            if (uri.startsWith('whatsapp://')) {
                await openExternalURL(`https://wa.me/${value.replace(/\D/g, '')}`, {
                    title: config.label,
                    sourceLabel: 'Profile',
                    sourceBadge: 'Public contact link',
                    trustLevel: 'external',
                });
            } else if (!uri.startsWith('http')) {
                console.warn('Unhandled URI scheme:', uri);
            }
        }
    }, []);

    const handleLinkOptions = useCallback(async (provider: string, value: string) => {
        const config = PROVIDER_CONFIG[provider];
        if (!config) return;

        const uri = config.getUri(value);
        const webUrl = uri.startsWith('http') ? uri
            : uri.startsWith('whatsapp://') ? `https://wa.me/${value.replace(/\D/g, '')}`
            : null;

        if (!webUrl) return;

        await showExternalLinkOptions(webUrl, {
            title: config.label,
            sourceLabel: 'Profile',
            sourceBadge: 'Public contact link',
            trustLevel: 'external',
        });
    }, []);

    const handleCopyProfileLink = useCallback(async () => {
        const url = typeof window !== 'undefined'
            ? window.location.href
            : `https://app.gurudevi.edlove.org`;
        if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title: `${userName} on Gurudevi`, url });
                return; // Share succeeded  no clipboard needed
            } catch {
                // User cancelled or Share unavailable  fall through to clipboard
            }
        }
        // Clipboard fallback (native path + web Share cancel/unavailable)
        await Clipboard.setStringAsync(url).catch(() => { /* non-fatal */ });
    }, [userName]);

    const handleEditLink = (link: SocialLink) => {
        hapticLight();
        if (inline) {
            setInlineEditingId(link.id);
        } else {
            setEditingLink(link);
            setIsAddModalOpen(true);
        }
    };

    const handleDeleteLink = (id: string) => {
        hapticHeavy();
        deleteLink(id);
    };

    const handleAddLink = () => {
        hapticLight();
        if (inline) {
            setInlineAdding(true);
        } else {
            setEditingLink(undefined);
            setIsAddModalOpen(true);
        }
    };

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
                {/* Copy/Share profile link  visible on web always, on native only for own profile */}
                <HStack space="sm">
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
                    
                    {isOwnProfile && editable && (
                        <SanctuaryButton
                            size="sm"
                            variant={isEditing ? "solid" : "outline"}
                            onPress={() => {
                                hapticLight();
                                setIsEditing(!isEditing);
                            }}
                            leftIcon={Edit2}
                        >
                            {isEditing ? 'Done' : 'Edit Contacts'}
                        </SanctuaryButton>
                    )}
                </HStack>
            </VStack>

            {/* Link List */}
            <VStack space="md">
                {displayLinks.map((link, index) => {
                    if (inline && inlineEditingId === link.id) {
                        return (
                            <InlineSocialLinkEditor
                                key={link.id}
                                link={link}
                                onSave={async (updates) => {
                                    await updateLink(link.id, updates);
                                    setInlineEditingId(null);
                                }}
                                onCancel={() => setInlineEditingId(null)}
                                onDelete={async (id) => {
                                    await deleteLink(id);
                                    setInlineEditingId(null);
                                }}
                            />
                        );
                    }

                    const config = PROVIDER_CONFIG[link.platform];
                    if (!config) return null;
                    const Icon = config.icon;
                    const PrivacyEmoji = PRIVACY_ICONS[link.privacy_level || 'public'];

                    return (
                        <Animated.View
                            key={`${link.platform}-${index}`}
                            entering={FadeInDown.delay(index * 100).springify()}
                        >
                            <SanctuaryCard
                                variant="glass"
                                onPress={() => isEditing ? handleEditLink(link) : handlePress(link.platform, link.url)}
                                onLongPress={() => !isEditing && handleLinkOptions(link.platform, link.url)}
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
                                            {isOwnProfile && PrivacyEmoji && (
                                                <Text style={{ fontSize: 13, marginLeft: 4 }}>{PrivacyEmoji}</Text>
                                            )}
                                        </HStack>
                                        <Text size="xs" color={colors.textTertiary} numberOfLines={1}>
                                            {link.url}
                                        </Text>
                                    </VStack>
                                    {isEditing ? (
                                        <HStack space="sm">
                                            <TouchableOpacity onPress={() => handleEditLink(link)} style={{ padding: 4 }}>
                                                <Edit2 size={18} color={colors.action} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteLink(link.id)} style={{ padding: 4 }}>
                                                <Trash2 size={18} color={colors.error} />
                                            </TouchableOpacity>
                                        </HStack>
                                    ) : (
                                        <ExternalLink size={18} color={colors.textTertiary} />
                                    )}
                                </HStack>
                            </SanctuaryCard>
                        </Animated.View>
                    );
                })}
                
                {isEditing && (
                    <>
                        {inline && inlineAdding && (
                            <InlineSocialLinkEditor
                                isNew
                                onSave={async (newLink) => {
                                    await addLink({
                                        ...newLink,
                                        user_id: userId!,
                                        order_index: links.length
                                    } as any);
                                    setInlineAdding(false);
                                }}
                                onCancel={() => setInlineAdding(false)}
                            />
                        )}
                        <Animated.View entering={FadeInDown.springify()}>
                            <SanctuaryCard
                                variant="glass"
                                onPress={handleAddLink}
                                style={{ borderStyle: 'dashed' }}
                            >
                                <HStack space="md" alignItems="center" sx={{ padding: Theme.spacing.md, justifyContent: 'center' }}>
                                    <Plus size={20} color={colors.action} />
                                    <Text bold color={colors.action}>Add Social Link</Text>
                                </HStack>
                            </SanctuaryCard>
                        </Animated.View>
                    </>
                )}
            </VStack>

            {userId && (
                <AddSocialLinkModal
                    visible={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    userId={userId}
                    initialLink={editingLink}
                />
            )}

            {displayLinks.length === 0 && (
                <Box sx={{ paddingVertical: Theme.spacing.xl, alignItems: 'center' }}>
                    <Text color={colors.textTertiary} italic>
                        {isOwnProfile ? t('community.profile.noContactsYet') || "No public contacts shared yet." : t('community.profile.noPublicContacts') || "No public contacts shared yet."}
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
