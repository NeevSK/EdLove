import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Heading,
    VStack,
    HStack,
    Box,
    Text,
    Input,
    InputField,
    Button,
    ButtonText,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Spinner,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem,
    Icon,
} from '@repo/ui';
import { ChevronDown, CheckCircle, School, MessageSquare } from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { api, supabase, identityAPI, communityAPI } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { hapticLight, hapticSuccess } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { useNavigation } from '@react-navigation/native';

interface CreateSchoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (school: any) => void;
    initialData?: {
        id: string;
        name: string;
        handle?: string;
        type: 'primary' | 'secondary' | 'mixed';
    };
}

export default function CreateSchoolModal({
    isOpen,
    onClose,
    onSuccess,
    initialData,
}: CreateSchoolModalProps) {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [step, setStep] = useState<'details' | 'type' | 'success'>('details');
    const [name, setName] = useState(initialData?.name ?? '');
    const [handle, setHandle] = useState(initialData?.handle ?? '');
    const [type, setType] = useState<'primary' | 'secondary' | 'mixed'>(initialData?.type ?? 'mixed');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdIds, setCreatedIds] = useState<{ schoolId: string; groupId?: string } | null>(null);

    const isEdit = !!initialData;

    React.useEffect(() => {
        if (isOpen) {
            setName(initialData?.name ?? '');
            setHandle(initialData?.handle ?? '');
            setType(initialData?.type ?? 'mixed');
            setStep('details');
        }
    }, [isOpen, initialData]);
    const colors = useThemedColors();

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError(t('school.errorNameRequired') || 'School name is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        hapticLight();

        try {
            const userId = await identityAPI.getMyInternalId();
            if (!userId) throw new Error('Not authenticated');

            let updatedSchool;
            if (isEdit && initialData) {
                updatedSchool = await api.school.update(initialData.id, {
                    name: name.trim(),
                    handle: handle.trim(),
                    type,
                });
                hapticSuccess();
                onSuccess(updatedSchool);
                handleClose();
                return;
            } else {
                // 1. Create real School
                updatedSchool = await api.school.create({
                    name: name.trim(),
                    handle: handle.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
                    type,
                    created_by: userId
                });

                let communityGroupId: string | undefined;

                // 2. Create default Community Group
                try {
                    const group = await communityAPI.createGroupWithOwner({
                        name: `${name.trim()} HQ`,
                        description: `Official community portal for ${name.trim()}`,
                        group_type: 'general',
                        join_policy: 'open',
                        school_id: updatedSchool.id,
                    }, userId);
                    communityGroupId = group.id;
                } catch (groupErr) {
                    console.warn('Failed to create default group:', groupErr);
                }

                hapticSuccess();
                setCreatedIds({ schoolId: updatedSchool.id, groupId: communityGroupId });
                setStep('success');
                onSuccess(updatedSchool);
            }
        } catch (err: any) {
            console.error('Failed to save school:', err);
            setError(err.message || 'Failed to save school');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setName('');
        setHandle('');
        setType('mixed');
        setError(null);
        setStep('details');
        onClose();
    };

    const navigateToCommunity = () => {
        if (createdIds?.groupId) {
            // @ts-ignore - CommunityStack exists
            navigation.navigate('CommunityStack', {
                screen: 'GroupDetails',
                params: { groupId: createdIds.groupId }
            });
            handleClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalBackdrop />
            <ModalContent
                sx={{
                    backgroundColor: colors.secondary,
                    maxWidth: 400,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: Theme.corners.generous,
                }}
            >
                {step === 'details' && (
                    <>
                        <ModalHeader>
                            <VStack sx={{ gap: 4 }}>
                                <Heading color={colors.text} size="lg">
                                    {isEdit ? 'Refine Sanctuary Identity' : (t('school.createTitle') || 'Sanctuary Identity')}
                                </Heading>
                                <Text size="xs" color={colors.textSecondary}>
                                    {isEdit ? 'Update the details of your institution' : 'Step 1 of 2: Name your institution'}
                                </Text>
                            </VStack>
                        </ModalHeader>

                        <ModalBody>
                            <VStack sx={{ gap: Theme.spacing.xl, paddingVertical: Theme.spacing.md }}>
                                {error && (
                                    <Box
                                        sx={{
                                            padding: Theme.spacing.md,
                                            backgroundColor: Theme.colors.emberRed + '30',
                                            borderRadius: Theme.corners.comfortable,
                                            borderWidth: 1,
                                            borderColor: Theme.colors.emberRed,
                                        }}
                                    >
                                        <Text color={Theme.colors.emberRed} sx={{ fontSize: 14 }}>
                                            {error}
                                        </Text>
                                    </Box>
                                )}

                                <FormControl isRequired isInvalid={!!error}>
                                    <FormControlLabel>
                                        <FormControlLabelText color={colors.textSecondary}>
                                            {t('school.labelName') || 'What shall we call your Sanctuary?'}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        sx={{
                                            height: 56,
                                            backgroundColor: colors.tertiary,
                                            borderColor: colors.border,
                                            borderWidth: 1,
                                            borderRadius: Theme.corners.generous
                                        }}
                                    >
                                        <InputField
                                            placeholder={t('school.placeholderName') || "e.g., Green Valley Sanctuary"}
                                            value={name}
                                            onChangeText={(text: string) => {
                                                setName(text);
                                                if (!isEdit) {
                                                    setHandle(text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, ''));
                                                }
                                                if (error) setError(null);
                                            }}
                                            color={colors.text}
                                            placeholderTextColor={colors.textTertiary}
                                            sx={{ fontSize: 18, fontWeight: '600' }}
                                        />
                                    </Input>
                                </FormControl>

                                <FormControl isRequired isInvalid={!!error}>
                                    <FormControlLabel>
                                        <FormControlLabelText color={colors.textSecondary}>
                                            URL Handle (unique ID)
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        sx={{
                                            height: 56,
                                            backgroundColor: colors.tertiary,
                                            borderColor: colors.border,
                                            borderWidth: 1,
                                            borderRadius: Theme.corners.generous
                                        }}
                                    >
                                        <InputField
                                            placeholder="e.g., green-valley"
                                            value={handle}
                                            onChangeText={(text: string) => {
                                                setHandle(text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, ''));
                                                if (error) setError(null);
                                            }}
                                            color={colors.text}
                                            placeholderTextColor={colors.textTertiary}
                                            sx={{ fontSize: 16, fontWeight: '500' }}
                                        />
                                    </Input>
                                    <Text size="xs" color={colors.textTertiary} sx={{ marginTop: 4 }}>
                                        Used in your Sanctuary's QR codes and links.
                                    </Text>
                                </FormControl>
                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <HStack sx={{ width: '100%', gap: Theme.spacing.md }}>
                                <Button
                                    variant="outline"
                                    action="secondary"
                                    onPress={handleClose}
                                    sx={{ flex: 1, borderColor: colors.border }}
                                    isDisabled={isSubmitting}
                                >
                                    <ButtonText color={colors.textSecondary}>
                                        {t('common.cancel') || 'Cancel'}
                                    </ButtonText>
                                </Button>
                                <Button
                                    action="primary"
                                    onPress={() => setStep('type')}
                                    sx={{
                                        flex: 2,
                                        backgroundColor: Theme.colors.sanctuarySaffron,
                                    }}
                                    isDisabled={!name.trim() || !handle.trim()}
                                >
                                    <ButtonText color={Theme.colors.sacredWhite}>
                                        {isEdit ? 'Continue to Focus' : 'Next — Academic Focus'}
                                    </ButtonText>
                                </Button>
                            </HStack>
                        </ModalFooter>
                    </>
                )}

                {step === 'type' && (
                    <>
                        <ModalHeader>
                            <VStack sx={{ gap: 4 }}>
                                <Heading color={colors.text} size="lg">
                                    Academic Focus
                                </Heading>
                                <Text size="xs" color={colors.textSecondary}>
                                    {isEdit ? 'Update your scope' : 'Step 2 of 2: Define your scope'}
                                </Text>
                            </VStack>
                        </ModalHeader>

                        <ModalBody>
                            <VStack sx={{ gap: Theme.spacing.lg, paddingVertical: Theme.spacing.md }}>
                                <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>
                                    What is the core mission of <Text sx={{ fontWeight: 'bold', color: colors.text }}>{name}</Text>?
                                </Text>

                                {([
                                    { id: 'primary', label: 'Primary Excellence', emoji: '🏫', desc: 'Foundational years (Grades 1-5). Focus on literacy and logic.' },
                                    { id: 'secondary', label: 'Higher Foundations', emoji: '🎓', desc: 'Advanced development (Grades 6-13). Specialized disciplines.' },
                                    { id: 'mixed', label: 'All-Grade Sanctuary', emoji: '🌿', desc: 'Holistic journey across all levels. Complete integration.' },
                                ] as const).map((tType) => (
                                    <TouchableOpacity
                                        key={tType.id}
                                        onPress={() => {
                                            hapticLight();
                                            setType(tType.id);
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                padding: Theme.spacing.md,
                                                borderRadius: Theme.corners.generous,
                                                borderWidth: 2,
                                                borderColor: type === tType.id ? Theme.colors.sanctuarySaffron : colors.border,
                                                backgroundColor: type === tType.id ? 'rgba(212,132,58,0.05)' : colors.tertiary,
                                            }}
                                        >
                                            <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center' }}>
                                                <Text sx={{ fontSize: 32 }}>{tType.emoji}</Text>
                                                <VStack sx={{ flex: 1 }}>
                                                    <Text sx={{ fontWeight: '800', color: colors.text }}>{tType.label}</Text>
                                                    <Text size="xs" color={colors.textSecondary}>{tType.desc}</Text>
                                                </VStack>
                                                {type === tType.id && <Icon as={CheckCircle} color={Theme.colors.sanctuarySaffron} size={18} />}
                                            </HStack>
                                        </Box>
                                    </TouchableOpacity>
                                ))}
                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <HStack sx={{ width: '100%', gap: Theme.spacing.md }}>
                                <Button
                                    variant="outline"
                                    action="secondary"
                                    onPress={() => setStep('details')}
                                    sx={{ flex: 1, borderColor: colors.border }}
                                    isDisabled={isSubmitting}
                                >
                                    <ButtonText color={colors.textSecondary}>Back</ButtonText>
                                </Button>
                                <Button
                                    action="primary"
                                    onPress={handleSubmit}
                                    sx={{
                                        flex: 2,
                                        backgroundColor: Theme.colors.sanctuarySaffron,
                                    }}
                                    isDisabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Spinner color={Theme.colors.sacredWhite} size="small" />
                                    ) : (
                                        <ButtonText color={Theme.colors.sacredWhite}>
                                            {isEdit ? 'Save Changes' : 'Establish Sanctuary'}
                                        </ButtonText>
                                    )}
                                </Button>
                            </HStack>
                        </ModalFooter>
                    </>
                )}

                {step === 'success' && (
                    <>
                        <ModalHeader>
                            <VStack sx={{ alignItems: 'center', width: '100%', gap: Theme.spacing.sm }}>
                                <Icon as={CheckCircle} color={Theme.colors.sanctuarySaffron} size={48} />
                                <Heading color={colors.text} size="lg" sx={{ textAlign: 'center' }}>
                                    Sanctuary Established!
                                </Heading>
                            </VStack>
                        </ModalHeader>

                        <ModalBody>
                            <VStack sx={{ gap: Theme.spacing.lg, alignItems: 'center' }}>
                                <Text sx={{ textAlign: 'center', color: colors.textSecondary }}>
                                    Congratulations! <Text sx={{ fontWeight: 'bold', color: colors.text }}>{name}</Text> is now live.
                                </Text>
                                
                                <Box sx={{ backgroundColor: colors.tertiary, padding: Theme.spacing.md, borderRadius: Theme.corners.comfortable, width: '100%' }}>
                                    <VStack sx={{ gap: Theme.spacing.sm }}>
                                        <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                                            <Icon as={School} color={Theme.colors.sanctuarySaffron} size={16} />
                                            <Text sx={{ fontSize: 14, color: colors.text }}>School Dashboard Ready</Text>
                                        </HStack>
                                        <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                                            <Icon as={MessageSquare} color={Theme.colors.sanctuarySaffron} size={16} />
                                            <Text sx={{ fontSize: 14, color: colors.text }}>Community HQ Created</Text>
                                        </HStack>
                                    </VStack>
                                </Box>

                                <Text sx={{ fontSize: 13, color: colors.textTertiary, textAlign: 'center' }}>
                                    You've been assigned as the Principal. You can now invite staff and start building your curriculum.
                                </Text>
                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <VStack sx={{ width: '100%', gap: Theme.spacing.md }}>
                                <Button
                                    action="primary"
                                    onPress={handleClose}
                                    sx={{
                                        width: '100%',
                                        backgroundColor: Theme.colors.sanctuarySaffron,
                                    }}
                                >
                                    <ButtonText color={Theme.colors.sacredWhite}>Enter School Dashboard</ButtonText>
                                </Button>
                                {createdIds?.groupId && (
                                    <Button
                                        variant="outline"
                                        onPress={navigateToCommunity}
                                        sx={{ width: '100%', borderColor: colors.border }}
                                    >
                                        <ButtonText color={colors.textSecondary}>Visit Community HQ</ButtonText>
                                    </Button>
                                )}
                            </VStack>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
