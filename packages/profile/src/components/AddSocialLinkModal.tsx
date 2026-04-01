import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Input,
    InputField,
    Button,
    ButtonText,
    Theme,
    useThemedColors,
    useTheme,
    SanctuaryCard,
} from '@repo/ui';
import {
    X,
    Plus,
    MessagesSquare,
    Linkedin,
    Instagram,
    Globe,
    Mail,
    ShieldCheck,
    Shield,
    ShieldAlert,
    Check
} from 'lucide-react-native';
import { useSocialLinks } from '../hooks/useSocialLinks';
import { SocialLink, SocialPlatform, PrivacyLevel } from '@repo/core';
import { useTranslation } from 'react-i18next';

interface AddSocialLinkModalProps {
    visible: boolean;
    onClose: () => void;
    userId: string;
    initialLink?: SocialLink;
}

const PLATFORMS: { labelKey: string; value: SocialPlatform; icon: any; color: string }[] = [
    { labelKey: 'addSocialLink.platforms.whatsapp', value: 'whatsapp', icon: MessagesSquare, color: Theme.colors.whatsapp },
    { labelKey: 'addSocialLink.platforms.linkedin', value: 'linkedin', icon: Linkedin, color: Theme.colors.linkedin },
    { labelKey: 'addSocialLink.platforms.instagram', value: 'instagram', icon: Instagram, color: Theme.colors.instagram },
    { labelKey: 'addSocialLink.platforms.portfolio', value: 'website', icon: Globe, color: Theme.colors.portfolio },
    { labelKey: 'addSocialLink.platforms.email', value: 'website', icon: Mail, color: Theme.colors.emberOrange },
];

const PRIVACY_LEVELS: { value: PrivacyLevel; icon: any; labelKey: string; descKey: string }[] = [
    { value: 'public', icon: ShieldCheck, labelKey: 'addSocialLink.publicLabel', descKey: 'addSocialLink.publicDesc' },
    { value: 'particulars', icon: Shield, labelKey: 'addSocialLink.particularsLabel', descKey: 'addSocialLink.particularsDesc' },
    { value: 'private', icon: ShieldAlert, labelKey: 'addSocialLink.privateLabel', descKey: 'addSocialLink.privateDesc' },
];

export const AddSocialLinkModal: React.FC<AddSocialLinkModalProps> = ({ visible, onClose, userId, initialLink }) => {
    const { links, addLink, updateLink } = useSocialLinks(userId);
    const colors = useThemedColors();
    const { text, isDark } = useTheme();
    const { t } = useTranslation();
    
    const [platform, setPlatform] = useState<SocialPlatform>(initialLink?.platform || 'whatsapp');
    const [url, setUrl] = useState(initialLink?.url || '');
    const [privacy, setPrivacy] = useState<PrivacyLevel>(initialLink?.privacy_level || 'public');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setPlatform(initialLink?.platform || 'whatsapp');
            setUrl(initialLink?.url || '');
            setPrivacy(initialLink?.privacy_level || 'public');
        }
    }, [visible, initialLink]);

    const handleSave = async () => {
        if (!url) return;
        setLoading(true);
        
        let result;
        if (initialLink) {
            result = await updateLink(initialLink.id, {
                platform,
                url,
                privacy_level: privacy,
                is_public: privacy !== 'private'
            });
        } else {
            result = await addLink({
                user_id: userId,
                platform,
                url,
                privacy_level: privacy,
                is_public: privacy !== 'private',
                order_index: links.length
            });
        }

        setLoading(false);
        if (result.success) {
            setUrl('');
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
            <Box style={styles.overlay}>
                <Box sx={{
                    flex: 1,
                    backgroundColor: isDark ? 'rgba(107,100,128,0.65)' : 'rgba(107,100,128,0.45)',
                    width: '100%',
                }}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
                    <Box sx={{
                        backgroundColor: colors.primary,
                        borderTopLeftRadius: Theme.corners.generous,
                        borderTopRightRadius: Theme.corners.generous,
                        padding: Theme.spacing.xl,
                        maxHeight: '85%',
                        borderWidth: 1,
                        borderColor: colors.border
                    }}>
                        <HStack justifyContent="space-between" alignItems="center" mb="$6">
                            <VStack>
                                <Heading color={colors.textPrimary}>
                                    {initialLink ? t('addSocialLink.editTitle') : t('addSocialLink.title')}
                                </Heading>
                                <Text size="xs" color={colors.textTertiary}>
                                    {initialLink ? t('addSocialLink.editSubtitle') : t('addSocialLink.subtitle')}
                                </Text>
                            </VStack>
                            <TouchableOpacity
                                onPress={onClose}
                                style={{
                                    padding: 8,
                                    borderRadius: Theme.corners.full,
                                    backgroundColor: colors.tertiary
                                }}
                            >
                                <X size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </HStack>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <VStack space="xl">
                                <VStack space="xs">
                                    <Text size="xs" bold color={colors.textSecondary}>{t('addSocialLink.selectPlatform')}</Text>
                                    <HStack space="sm" sx={{ flexWrap: 'wrap' }}>
                                        {PLATFORMS.map((p) => (
                                            <TouchableOpacity
                                                key={p.value}
                                                onPress={() => setPlatform(p.value)}
                                                style={[
                                                    styles.platformChip,
                                                    {
                                                        borderColor: platform === p.value ? p.color : colors.border,
                                                        backgroundColor: platform === p.value ? `${p.color}15` : colors.secondary
                                                    }
                                                ]}
                                            >
                                                <p.icon size={16} color={platform === p.value ? p.color : colors.textTertiary} />
                                                <Text
                                                    size="xs"
                                                    bold={platform === p.value}
                                                    sx={{
                                                        color: platform === p.value ? p.color : colors.textSecondary,
                                                        marginLeft: 6
                                                    }}
                                                >
                                                    {t(p.labelKey)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </HStack>
                                </VStack>

                                <VStack space="xs">
                                    <Text size="xs" bold color={colors.textSecondary}>{t('addSocialLink.handleOrLink')}</Text>
                                    <Input variant="outline" sx={{
                                        height: 54,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: colors.secondary,
                                        borderColor: colors.border
                                    }}>
                                        <InputField
                                            color={colors.textPrimary}
                                            value={url}
                                            onChangeText={setUrl}
                                            placeholder={platform === 'whatsapp' ? t('addSocialLink.phoneOrLink') : t('addSocialLink.usernameOrLink')}
                                            placeholderTextColor={colors.textTertiary}
                                        />
                                    </Input>
                                </VStack>

                                <VStack space="xs">
                                    <Text size="xs" bold color={colors.textSecondary}>{t('addSocialLink.privacyLevel')}</Text>
                                    <VStack space="sm">
                                        {PRIVACY_LEVELS.map((pl) => (
                                            <TouchableOpacity
                                                key={pl.value}
                                                onPress={() => setPrivacy(pl.value)}
                                            >
                                                <SanctuaryCard
                                                    variant={privacy === pl.value ? 'glass' : 'solid'}
                                                    style={{
                                                        padding: Theme.spacing.md,
                                                        borderColor: privacy === pl.value ? Theme.colors.sanctuarySaffron : colors.border
                                                    }}
                                                >
                                                    <HStack space="md" alignItems="center">
                                                        <pl.icon size={20} color={privacy === pl.value ? colors.action : colors.textTertiary} />
                                                        <VStack flex={1}>
                                                            <Text bold color={privacy === pl.value ? colors.textPrimary : colors.textSecondary}>
                                                                {t(pl.labelKey)}
                                                            </Text>
                                                            <Text size="xs" color={colors.textTertiary}>
                                                                {t(pl.descKey)}
                                                            </Text>
                                                        </VStack>
                                                        {privacy === pl.value && <ShieldCheck size={18} color={colors.action} />}
                                                    </HStack>
                                                </SanctuaryCard>
                                            </TouchableOpacity>
                                        ))}
                                    </VStack>
                                </VStack>

                                <Button
                                    size="lg"
                                    onPress={handleSave}
                                    isDisabled={loading || !url}
                                    sx={{
                                        marginTop: Theme.spacing.md,
                                        backgroundColor: colors.action,
                                        borderRadius: Theme.corners.comfortable,
                                        height: 56
                                    }}
                                >
                                    <HStack space="xs" alignItems="center">
                                        {initialLink ? <Check size={20} color={text.inverse} /> : <Plus size={20} color={text.inverse} />}
                                        <ButtonText {...({ color: text.inverse, bold: true } as any)}>
                                            {initialLink ? t('addSocialLink.saveButton') : t('addSocialLink.addButton')}
                                        </ButtonText>
                                    </HStack>
                                </Button>
                            </VStack>
                            <Box h={Theme.spacing.xl} />
                        </ScrollView>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    platformChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 8,
    }
});
