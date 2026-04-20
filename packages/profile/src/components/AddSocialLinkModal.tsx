import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, Platform } from 'react-native';
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
    Pressable,
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
    { labelKey: 'addSocialLink.platforms.whatsapp', value: 'whatsapp', icon: MessagesSquare, color: '#25D366' },
    { labelKey: 'addSocialLink.platforms.linkedin', value: 'linkedin', icon: Linkedin, color: '#0077B5' },
    { labelKey: 'addSocialLink.platforms.instagram', value: 'instagram', icon: Instagram, color: '#E4405F' },
    { labelKey: 'addSocialLink.platforms.portfolio', value: 'website', icon: Globe, color: '#4A90E2' },
    { labelKey: 'addSocialLink.platforms.email', value: 'website', icon: Mail, color: '#F44336' },
];

const PRIVACY_LEVELS: { value: PrivacyLevel; icon: any; labelKey: string; descKey: string }[] = [
    { value: 'public', icon: ShieldCheck, labelKey: 'addSocialLink.publicLabel', descKey: 'addSocialLink.publicDesc' },
    { value: 'particulars', icon: Shield, labelKey: 'addSocialLink.particularsLabel', descKey: 'addSocialLink.particularsDesc' },
    { value: 'private', icon: ShieldAlert, labelKey: 'addSocialLink.privateLabel', descKey: 'addSocialLink.privateDesc' },
];

/**
 * ADD SOCIAL LINK MODAL
 * Sanctuary V3 standard for managing contact sharing.
 */
export const AddSocialLinkModal: React.FC<AddSocialLinkModalProps> = ({ visible, onClose, userId, initialLink }) => {
    const { links, addLink, updateLink } = useSocialLinks(userId);
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
            <Box className="flex-1 justify-end">
                <Box className="flex-1 w-full bg-black/40">
                    <Pressable className="flex-1" onPress={onClose} />
                    <Box className="bg-phase-canvas rounded-t-[40px] p-6 max-h-[85%] border-t border-phase-surface">
                        <HStack className="justify-between items-center mb-8">
                            <VStack>
                                <Heading className="text-phase-text-primary text-xl">
                                    {initialLink ? t('addSocialLink.editTitle') : t('addSocialLink.title')}
                                </Heading>
                                <Text className="text-xs text-phase-text-tertiary">
                                    {initialLink ? t('addSocialLink.editSubtitle') : t('addSocialLink.subtitle')}
                                </Text>
                            </VStack>
                            <Pressable
                                onPress={onClose}
                                className="p-2 rounded-full bg-phase-surface"
                            >
                                <X size={20} color="#9DA1A3" />
                            </Pressable>
                        </HStack>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <VStack space="xl">
                                <VStack space="sm">
                                    <Text className="text-xs font-bold text-phase-text-secondary uppercase tracking-wider">{t('addSocialLink.selectPlatform')}</Text>
                                    <HStack className="flex-wrap">
                                        {PLATFORMS.map((p) => (
                                            <Pressable
                                                key={p.value}
                                                onPress={() => setPlatform(p.value)}
                                                className={`flex-row items-center px-4 py-3 rounded-2xl mr-2 mb-2 border ${
                                                    platform === p.value 
                                                        ? 'border-phase-interactive bg-phase-interactive/5' 
                                                        : 'border-phase-surface bg-phase-canvas'
                                                }`}
                                            >
                                                <p.icon size={18} color={platform === p.value ? '#4A90E2' : '#9DA1A3'} />
                                                <Text
                                                    className={`text-[13px] ml-2 ${
                                                        platform === p.value ? 'font-bold text-phase-interactive' : 'text-phase-text-secondary'
                                                    }`}
                                                >
                                                    {t(p.labelKey)}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </HStack>
                                </VStack>

                                <VStack space="sm">
                                    <Text className="text-xs font-bold text-phase-text-secondary uppercase tracking-wider">{t('addSocialLink.handleOrLink')}</Text>
                                    <Input className="h-14 rounded-2xl bg-phase-canvas border-phase-surface px-4">
                                        <InputField
                                            className="text-phase-text-primary text-base"
                                            value={url}
                                            onChangeText={setUrl}
                                            placeholder={platform === 'whatsapp' ? t('addSocialLink.phoneOrLink') : t('addSocialLink.usernameOrLink')}
                                            placeholderTextColor="#9DA1A3"
                                        />
                                    </Input>
                                </VStack>

                                <VStack space="sm">
                                    <Text className="text-xs font-bold text-phase-text-secondary uppercase tracking-wider">{t('addSocialLink.privacyLevel')}</Text>
                                    <VStack space="sm">
                                        {PRIVACY_LEVELS.map((pl) => (
                                            <Pressable
                                                key={pl.value}
                                                onPress={() => setPrivacy(pl.value)}
                                                className={`p-4 rounded-[24px] border border-phase-surface bg-phase-canvas ${
                                                    privacy === pl.value ? 'border-phase-interactive bg-phase-interactive/5' : ''
                                                }`}
                                            >
                                                <HStack space="md" className="items-center">
                                                    <Box 
                                                        className={`p-3 rounded-full ${
                                                            privacy === pl.value ? 'bg-phase-interactive/10' : 'bg-phase-surface'
                                                        }`}
                                                    >
                                                        <pl.icon size={20} color={privacy === pl.value ? '#4A90E2' : '#9DA1A3'} />
                                                    </Box>
                                                    <VStack className="flex-1">
                                                        <Text className={`font-bold ${
                                                            privacy === pl.value ? 'text-phase-text-primary' : 'text-phase-text-secondary'
                                                        }`}>
                                                            {t(pl.labelKey)}
                                                        </Text>
                                                        <Text className="text-xs text-phase-text-tertiary">
                                                            {t(pl.descKey)}
                                                        </Text>
                                                    </VStack>
                                                    {privacy === pl.value && (
                                                        <Box className="w-6 h-6 rounded-full bg-phase-interactive items-center justify-center">
                                                            <Check size={14} color="white" strokeWidth={3} />
                                                        </Box>
                                                    )}
                                                </HStack>
                                            </Pressable>
                                        ))}
                                    </VStack>
                                </VStack>

                                <Button
                                    size="lg"
                                    onPress={handleSave}
                                    isDisabled={loading || !url}
                                    className="mt-6 bg-phase-interactive rounded-2xl h-16 shadow-lg shadow-blue-500/30"
                                >
                                    <HStack space="sm" className="items-center">
                                        {initialLink ? <Check size={20} color="white" /> : <Plus size={20} color="white" />}
                                        <ButtonText className="text-white font-bold text-lg">
                                            {initialLink ? t('addSocialLink.saveButton') : t('addSocialLink.addButton')}
                                        </ButtonText>
                                    </HStack>
                                </Button>
                            </VStack>
                            <Box className="h-12" />
                        </ScrollView>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};
