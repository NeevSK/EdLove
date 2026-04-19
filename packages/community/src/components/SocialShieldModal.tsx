import React, { useState } from 'react';
import { Modal } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    SanctuaryButton,
    Icon,
    Pressable,
} from '@repo/ui';
import { X, AlertTriangle, ShieldOff, UserX, ShieldCheck, LifeBuoy } from 'lucide-react-native';
import { useSocialShield, type ReportTarget } from '../hooks/useSocialShield';

interface SocialShieldModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId?: string;
    groupId?: string;
    targetUserId?: string;
    targetUserName?: string;
}

const REPORT_REASONS = [
    { label: 'Harmful Content', value: 'harmful', icon: AlertTriangle },
    { label: 'Harassment', value: 'harassment', icon: UserX },
    { label: 'Inappropriate for School', value: 'inappropriate', icon: ShieldOff },
    { label: 'Other', value: 'other', icon: AlertTriangle },
];

const TARGET_OPTIONS: { label: string; value: ReportTarget; icon: any; description: string }[] = [
    { 
        label: 'Class Teacher', 
        value: 'teacher', 
        icon: ShieldCheck, 
        description: 'For classroom-related issues and minor conflicts.' 
    },
    { 
        label: 'School Principal', 
        value: 'principal', 
        icon: ShieldCheck, 
        description: 'For serious safety concerns or severe harassment.' 
    },
    { 
        label: 'Platform Guardians', 
        value: 'platform', 
        icon: LifeBuoy, 
        description: 'For technical abuse or violations of platform rules.' 
    },
];

export default function SocialShieldModal({
    isOpen,
    onClose,
    postId,
    groupId,
    targetUserId,
    targetUserName = 'this user'
}: SocialShieldModalProps) {
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
            <Box className="flex-1 justify-end bg-black/40">
                <Box
                    className="bg-phase-surface border-t border-border rounded-t-[40px] p-6 pb-12 shadow-2xl"
                >
                    <VStack className="gap-6">
                        <HStack className="justify-between items-center">
                            <VStack className="gap-1 flex-1">
                                <Heading className="text-ink text-2xl font-black">
                                    {step === 'reason' ? 'Shielding the Sanctuary' : 'Who should guide this?'}
                                </Heading>
                                <Text className="text-ink/60 text-sm">
                                    {step === 'reason' 
                                        ? `Help us understand the concern with ${targetUserName}.` 
                                        : 'Choose the appropriate guardian for this report.'}
                                </Text>
                            </VStack>
                            <Pressable 
                                onPress={onClose} 
                                className="w-10 h-10 items-center justify-center rounded-full bg-ink/5"
                                hitSlop={12}
                            >
                                <Icon as={X} size="md" className="text-ink/40" />
                            </Pressable>
                        </HStack>

                        {step === 'reason' ? (
                            <VStack className="gap-3">
                                {REPORT_REASONS.map((item) => {
                                    const isSelected = reason === item.value;
                                    return (
                                        <Pressable
                                            key={item.value}
                                            onPress={() => setReason(item.value)}
                                            className={`p-4 rounded-2xl border-2 flex-row items-center gap-4 transition-all ${isSelected ? 'border-phase-interactive bg-phase-interactive/5' : 'border-border bg-phase-surface'}`}
                                        >
                                            <Box className={`w-10 h-10 rounded-xl items-center justify-center border ${isSelected ? 'bg-phase-interactive/10 border-phase-interactive/20' : 'bg-ink/5 border-border'}`}>
                                                <Icon as={item.icon} size="sm" className={isSelected ? 'text-phase-interactive' : 'text-ink/40'} />
                                            </Box>
                                            <Text className={`text-base font-semibold ${isSelected ? 'text-ink' : 'text-ink/60'}`}>
                                                {item.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                                
                                <HStack className="items-center gap-3 mt-2 px-1">
                                    <Pressable
                                        onPress={() => setShouldBlock(!shouldBlock)}
                                        className={`w-6 h-6 rounded-lg border-2 items-center justify-center ${shouldBlock ? 'border-phase-interactive bg-phase-interactive' : 'border-border'}`}
                                    >
                                        {shouldBlock && <Box className="w-2.5 h-2.5 rounded-sm bg-white" />}
                                    </Pressable>
                                    <Text className="text-ink/60 text-sm leading-relaxed flex-1">Also block this user from interacting with me</Text>
                                </HStack>
 
                                <SanctuaryButton
                                    action="primary"
                                    onPress={handleNext}
                                    isDisabled={!reason}
                                    className="h-14 rounded-2xl mt-4"
                                >
                                    <Text className="text-white font-bold text-lg">Next: Choose Guardian</Text>
                                </SanctuaryButton>
                            </VStack>
                        ) : (
                            <VStack className="gap-3">
                                {TARGET_OPTIONS.map((item) => {
                                    const isSelected = target === item.value;
                                    return (
                                        <Pressable
                                            key={item.value}
                                            onPress={() => setTarget(item.value)}
                                            className={`p-4 rounded-2xl border-2 flex-row items-center gap-4 transition-all ${isSelected ? 'border-phase-interactive bg-phase-interactive/5' : 'border-border bg-phase-surface'}`}
                                        >
                                            <Box className={`w-10 h-10 rounded-xl items-center justify-center border ${isSelected ? 'bg-phase-interactive/10 border-phase-interactive/20' : 'bg-ink/5 border-border'}`}>
                                                <Icon as={item.icon} size="sm" className={isSelected ? 'text-phase-interactive' : 'text-ink/40'} />
                                            </Box>
                                            <VStack className="flex-1">
                                                <Text className={`text-base font-semibold ${isSelected ? 'text-ink' : 'text-ink/60'}`}>
                                                    {item.label}
                                                </Text>
                                                <Text className="text-xs text-ink/40 font-medium leading-relaxed">{item.description}</Text>
                                            </VStack>
                                        </Pressable>
                                    );
                                })}
 
                                <HStack className="gap-3 mt-4">
                                    <SanctuaryButton
                                        action="secondary"
                                        onPress={() => setStep('reason')}
                                        className="flex-1 h-14 rounded-2xl border border-border bg-transparent"
                                    >
                                        <Text className="text-ink font-bold">Back</Text>
                                    </SanctuaryButton>
                                    <SanctuaryButton
                                        action="primary"
                                        onPress={handleSubmit}
                                        className="flex-[1.5] h-14 rounded-2xl"
                                    >
                                        <Text className="text-white font-bold text-lg">Submit Report</Text>
                                    </SanctuaryButton>
                                </HStack>
                                
                                <Text className="text-[11px] text-ink/40 text-center mt-3 font-medium">
                                    Need to manage your blocks later? Visit <Text className="text-phase-interactive">Privacy Settings</Text>.
                                </Text>
                            </VStack>
                        )}
                    </VStack>
                </Box>
            </Box>
        </Modal>
    );
}
