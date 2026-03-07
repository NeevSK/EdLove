import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    ButtonText,
    Theme,
    useTheme,
} from '@repo/ui';
import { X, AlertTriangle, ShieldOff, UserX, ShieldCheck, LifeBuoy } from 'lucide-react-native';
import { useSocialShield, type ReportTarget } from '../hooks/useSocialShield';
import { useTranslation } from 'react-i18next';

interface SocialShieldModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId?: string;
    groupId?: string;
    targetUserId?: string;
    targetUserName?: string;
}

const REPORT_REASONS = [
    { labelKey: 'community.socialShield.reasons.harmful', fallback: 'Harmful Content', value: 'harmful', icon: AlertTriangle },
    { labelKey: 'community.socialShield.reasons.harassment', fallback: 'Harassment', value: 'harassment', icon: UserX },
    { labelKey: 'community.socialShield.reasons.inappropriate', fallback: 'Inappropriate for School', value: 'inappropriate', icon: ShieldOff },
    { labelKey: 'community.socialShield.reasons.other', fallback: 'Other', value: 'other', icon: AlertTriangle },
];

const TARGET_OPTIONS: { labelKey: string; labelFallback: string; value: ReportTarget; icon: any; descriptionKey: string; descriptionFallback: string }[] = [
    {
        labelKey: 'community.socialShield.targets.teacher.label',
        labelFallback: 'Class Teacher',
        value: 'teacher',
        icon: ShieldCheck,
        descriptionKey: 'community.socialShield.targets.teacher.description',
        descriptionFallback: 'For classroom-related issues and minor conflicts.'
    },
    {
        labelKey: 'community.socialShield.targets.principal.label',
        labelFallback: 'School Principal',
        value: 'principal',
        icon: ShieldCheck,
        descriptionKey: 'community.socialShield.targets.principal.description',
        descriptionFallback: 'For serious safety concerns or severe harassment.'
    },
    {
        labelKey: 'community.socialShield.targets.platform.label',
        labelFallback: 'Platform Guardians',
        value: 'platform',
        icon: LifeBuoy,
        descriptionKey: 'community.socialShield.targets.platform.description',
        descriptionFallback: 'For technical abuse or violations of platform rules.'
    },
];

export default function SocialShieldModal({
    isOpen,
    onClose,
    postId,
    groupId,
    targetUserId,
    targetUserName
}: SocialShieldModalProps) {
    const { glass, text, accent, isDark } = useTheme();
    const { t } = useTranslation();
    const { submitReport, blockUser } = useSocialShield();
    const [reason, setReason] = useState<string>('');
    const [target, setTarget] = useState<ReportTarget>('platform');
    const [shouldBlock, setShouldBlock] = useState(false);
    const [step, setStep] = useState<'reason' | 'target'>('reason');

    const handleNext = () => setStep('target');

    const handleSubmit = async () => {
        if (!reason || !target) return;

        const success = await submitReport({
            postId,
            groupId,
            targetUserId,
            reason,
            target
        });

        if (success) {
            if (shouldBlock && targetUserId) {
                await blockUser(targetUserId);
            }
            onClose();
            // Reset for next time
            setStep('reason');
            setReason('');
            setTarget('platform');
            setShouldBlock(false);
        }
    };

    return (
        <Modal
            visible={isOpen}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Box sx={{
                flex: 1,
                justifyContent: 'flex-end',
                backgroundColor: isDark ? 'rgba(107,100,128,0.65)' : 'rgba(107,100,128,0.45)',
            }}>
                <Box
                    sx={{
                        backgroundColor: glass.modal.bg,
                        borderTopLeftRadius: Theme.corners.generous,
                        borderTopRightRadius: Theme.corners.generous,
                        borderTopWidth: 1,
                        borderColor: glass.modal.border,
                        padding: Theme.spacing.lg,
                        paddingBottom: 40,
                        shadowColor: Theme.colors.shadowViolet,
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.12,
                        shadowRadius: 16,
                        elevation: 8,
                    }}
                >
                    <VStack {...({ space: "xl" } as any)}>
                        <HStack justifyContent="space-between" alignItems="center">
                            <VStack {...({ space: "xs" } as any)}>
                                <Heading {...({ color: text.primary, size: "lg" } as any)}>
                                    {step === 'reason' ? t('community.socialShield.title.reason', 'Shielding the Sanctuary') : t('community.socialShield.title.target', 'Who should guide this?')}
                                </Heading>
                                <Text {...({ color: text.secondary, size: "sm" } as any)}>
                                    {step === 'reason' 
                                        ? t('community.socialShield.subtitle.reason', { targetUserName: targetUserName ?? t('community.socialShield.thisUser', 'this user'), defaultValue: `Help us understand the concern with ${targetUserName ?? t('community.socialShield.thisUser', 'this user')}.` })
                                        : t('community.socialShield.subtitle.target', 'Choose the appropriate guardian for this report.')}
                                </Text>
                            </VStack>
                            <TouchableOpacity onPress={onClose}>
                                <X color={text.muted} size={24} />
                            </TouchableOpacity>
                        </HStack>

                        {step === 'reason' ? (
                            <VStack {...({ space: "md" } as any)}>
                                {REPORT_REASONS.map((item) => {
                                    const ItemIcon = item.icon;
                                    const isSelected = reason === item.value;
                                    return (
                                        <TouchableOpacity
                                            key={item.value}
                                            onPress={() => setReason(item.value)}
                                            style={[
                                                styles.optionItem,
                                                {
                                                    borderColor: isSelected ? accent.action : glass.interact.border,
                                                    backgroundColor: isSelected ? `${accent.action}18` : glass.interact.bg,
                                                }
                                            ]}
                                        >
                                            <HStack {...({ space: "md", alignItems: "center" } as any)}>
                                                <Box sx={{ p: '$2', borderRadius: '$full', backgroundColor: glass.surface.bg }}>
                                                    <ItemIcon size={20} color={isSelected ? accent.action : text.muted} />
                                                </Box>
                                                <Text {...({ color: isSelected ? text.primary : text.secondary, bold: isSelected } as any)}>
                                                    {t(item.labelKey, item.fallback)}
                                                </Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    );
                                })}
                                
                                <HStack space="md" alignItems="center" mt="$2">
                                    <TouchableOpacity 
                                        onPress={() => setShouldBlock(!shouldBlock)}
                                        style={[styles.checkbox, { borderColor: shouldBlock ? accent.action : text.muted }]}
                                    >
                                        {shouldBlock && <Box sx={{ width: 12, height: 12, borderRadius: 2, backgroundColor: accent.action }} />}
                                    </TouchableOpacity>
                                    <Text size="sm" color={text.secondary}>{t('community.socialShield.blockAlso', 'Also block this user from interacting with me')}</Text>
                                </HStack>

                                <Button
                                    onPress={handleNext}
                                    isDisabled={!reason}
                                    sx={{ backgroundColor: accent.action, borderRadius: Theme.corners.comfortable, height: 50, mt: '$2' }}
                                >
                                    <ButtonText {...({ color: text.inverse, bold: true } as any)}>{t('community.socialShield.nextChooseGuardian', 'Next: Choose Guardian')}</ButtonText>
                                </Button>
                            </VStack>
                        ) : (
                            <VStack {...({ space: "md" } as any)}>
                                {TARGET_OPTIONS.map((item) => {
                                    const ItemIcon = item.icon;
                                    const isSelected = target === item.value;
                                    return (
                                        <TouchableOpacity
                                            key={item.value}
                                            onPress={() => setTarget(item.value)}
                                            style={[
                                                styles.optionItem,
                                                {
                                                    borderColor: isSelected ? accent.action : glass.interact.border,
                                                    backgroundColor: isSelected ? `${accent.action}18` : glass.interact.bg,
                                                }
                                            ]}
                                        >
                                            <HStack {...({ space: "md", alignItems: "center" } as any)}>
                                                <Box sx={{ p: '$2', borderRadius: '$full', backgroundColor: glass.surface.bg }}>
                                                    <ItemIcon size={20} color={isSelected ? accent.action : text.muted} />
                                                </Box>
                                                <VStack flex={1}>
                                                    <Text {...({ color: isSelected ? text.primary : text.secondary, bold: true } as any)}>
                                                        {t(item.labelKey, item.labelFallback)}
                                                    </Text>
                                                    <Text size="xs" color={text.muted}>{t(item.descriptionKey, item.descriptionFallback)}</Text>
                                                </VStack>
                                            </HStack>
                                        </TouchableOpacity>
                                    );
                                })}

                                <HStack space="md" mt="$4">
                                    <Button
                                        onPress={() => setStep('reason')}
                                        variant="outline"
                                        sx={{ flex: 1, borderRadius: Theme.corners.comfortable, height: 50 }}
                                    >
                                        <ButtonText {...({ color: text.primary } as any)}>{t('common.back', 'Back')}</ButtonText>
                                    </Button>
                                    <Button
                                        onPress={handleSubmit}
                                        sx={{ flex: 2, backgroundColor: accent.action, borderRadius: Theme.corners.comfortable, height: 50 }}
                                    >
                                        <ButtonText {...({ color: text.inverse, bold: true } as any)}>{t('community.socialShield.submitReport', 'Submit Report')}</ButtonText>
                                    </Button>
                                </HStack>
                                
                                <Text size="xs" color={text.muted} textAlign="center" sx={{ mt: '$2' }}>
                                    {t('community.socialShield.manageBlocks', 'Need to manage your blocks later? Visit Privacy Settings.')}
                                </Text>
                            </VStack>
                        )}
                    </VStack>
                </Box>
            </Box>
        </Modal>
    );
}

const styles = StyleSheet.create({
    optionItem: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
