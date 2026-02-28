import React, { useState } from 'react';
import { Modal, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectItem,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SanctuaryCard,
    LivingGlow
} from '@repo/ui';
import {
    X,
    ChevronDown,
    Plus,
    Trash2,
    MessagesSquare,
    Linkedin,
    Instagram,
    Globe,
    Mail,
    ShieldCheck,
    Shield,
    ShieldAlert
} from 'lucide-react-native';
import { useSocialLinks } from '@repo/profile';
import { SocialPlatform, PrivacyLevel } from '@repo/core';

interface AddSocialLinkModalProps {
    visible: boolean;
    onClose: () => void;
    userId: string;
}

const PLATFORMS: { label: string; value: SocialPlatform; icon: any; color: string }[] = [
    { label: 'WhatsApp', value: 'whatsapp', icon: MessagesSquare, color: Theme.colors.whatsapp },
    { label: 'LinkedIn', value: 'linkedin', icon: Linkedin, color: Theme.colors.linkedin },
    { label: 'Instagram', value: 'instagram', icon: Instagram, color: Theme.colors.instagram },
    { label: 'Portfolio', value: 'website', icon: Globe, color: Theme.colors.portfolio },
    { label: 'Email', value: 'website', icon: Mail, color: Theme.colors.emberOrange }, // Mapping to website type for now or core needs update
];

const PRIVACY_LEVELS: { label: string; value: PrivacyLevel; icon: any; desc: string }[] = [
    { label: 'Public', value: 'public', icon: ShieldCheck, desc: 'Everyone can see this' },
    { label: 'Particulars', value: 'particulars', icon: Shield, desc: 'Only your direct contacts' },
    { label: 'Private', value: 'private', icon: ShieldAlert, desc: 'Only visible to you' },
];

export const AddSocialLinkModal: React.FC<AddSocialLinkModalProps> = ({ visible, onClose, userId }) => {
    const { links, addLink, deleteLink } = useSocialLinks(userId);
    const colors = useThemedColors();
    const [platform, setPlatform] = useState<SocialPlatform>('whatsapp');
    const [url, setUrl] = useState('');
    const [privacy, setPrivacy] = useState<PrivacyLevel>('public');
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!url) return;
        setLoading(true);
        const result = await addLink({
            user_id: userId,
            platform,
            url,
            privacy_level: privacy,
            is_public: privacy !== 'private',
            order_index: links.length
        });
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
                    backgroundColor: 'rgba(0,0,0,0.4)',
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
                                <Heading color={colors.textPrimary}>Social Hub</Heading>
                                <Text size="xs" color={colors.textTertiary}>Manage your elective connections</Text>
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
                                {/* Platform Picker */}
                                <VStack space="xs">
                                    <Text size="xs" bold color={colors.textSecondary}>Select Platform</Text>
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
                                                    {p.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </HStack>
                                </VStack>

                                {/* URL Input */}
                                <VStack space="xs">
                                    <Text size="xs" bold color={colors.textSecondary}>Handle or Link</Text>
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
                                            placeholder={platform === 'whatsapp' ? '+94...' : 'Username or link'}
                                            placeholderTextColor={colors.textTertiary}
                                        />
                                    </Input>
                                </VStack>

                                {/* Privacy Picker */}
                                <VStack space="xs">
                                    <Text size="xs" bold color={colors.textSecondary}>Privacy Level</Text>
                                    <VStack space="sm">
                                        {PRIVACY_LEVELS.map((pl) => (
                                            <TouchableOpacity
                                                key={pl.value}
                                                onPress={() => setPrivacy(pl.value)}
                                            >
                                                <SanctuaryCard
                                                    variant={privacy === pl.value ? 'primary' : 'outline'}
                                                    sx={{
                                                        padding: Theme.spacing.md,
                                                        borderColor: privacy === pl.value ? colors.action : colors.border
                                                    }}
                                                >
                                                    <HStack space="md" alignItems="center">
                                                        <pl.icon size={20} color={privacy === pl.value ? colors.action : colors.textTertiary} />
                                                        <VStack flex={1}>
                                                            <Text bold color={privacy === pl.value ? colors.textPrimary : colors.textSecondary}>
                                                                {pl.label}
                                                            </Text>
                                                            <Text size="xs" color={colors.textTertiary}>
                                                                {pl.desc}
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
                                    onPress={handleAdd}
                                    isDisabled={loading || !url}
                                    sx={{
                                        marginTop: Theme.spacing.md,
                                        backgroundColor: colors.action,
                                        borderRadius: Theme.corners.comfortable,
                                        height: 56
                                    }}
                                >
                                    <HStack space="xs" alignItems="center">
                                        <Plus size={20} color="white" />
                                        <ButtonText color="white" bold>Add Social Presence</ButtonText>
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
