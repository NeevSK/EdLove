import React, { useState } from 'react';
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
} from '@/ui';
import { ChevronDown } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { useThemedColors } from '../../hooks/useThemedColors';

interface CreateSchoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newSchool: any) => void;
}

export default function CreateSchoolModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateSchoolModalProps) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [type, setType] = useState<'primary' | 'secondary' | 'mixed'>('mixed');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Call real API
            const newSchool = await api.school.create({
                name: name.trim(),
                type,
                created_by: user.id
            });

            hapticSuccess();
            onSuccess(newSchool);
            handleClose();
        } catch (err: any) {
            console.error('Failed to create school:', err);
            setError(err.message || 'Failed to create school');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setName('');
        setType('mixed');
        setError(null);
        onClose();
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
                }}
            >
                <ModalHeader>
                    <Heading color={colors.text} size="lg">
                        {t('school.createTitle') || 'Initialize Sanctuary'}
                    </Heading>
                </ModalHeader>

                <ModalBody>
                    <VStack space="xl">
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
                                <Text color={Theme.colors.emberRed} size="sm">
                                    {error}
                                </Text>
                            </Box>
                        )}

                        <FormControl isRequired isInvalid={!!error}>
                            <FormControlLabel>
                                <FormControlLabelText color={colors.textSecondary}>
                                    {t('school.labelName') || 'Sanctuary Name'}
                                </FormControlLabelText>
                            </FormControlLabel>
                            <Input
                                variant="outline"
                                size="md"
                                sx={{
                                    backgroundColor: colors.tertiary,
                                    borderColor: colors.border,
                                }}
                            >
                                <InputField
                                    placeholder={t('school.placeholderName') || "e.g., Green Valley Sanctuary"}
                                    value={name}
                                    onChangeText={(text: string) => {
                                        setName(text);
                                        if (error) setError(null);
                                    }}
                                    color={colors.text}
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </Input>
                        </FormControl>

                        <FormControl>
                            <FormControlLabel>
                                <FormControlLabelText color={colors.textSecondary}>
                                    {t('school.labelType') || 'Sanctuary Type'}
                                </FormControlLabelText>
                            </FormControlLabel>
                            <HStack space="md">
                                {(['primary', 'secondary', 'mixed'] as const).map((tType) => (
                                    <Button
                                        key={tType}
                                        variant={type === tType ? 'solid' : 'outline'}
                                        onPress={() => setType(tType)}
                                        sx={{
                                            flex: 1,
                                            backgroundColor: type === tType ? Theme.colors.sanctuarySaffron : 'transparent',
                                            borderColor: type === tType ? Theme.colors.sanctuarySaffron : colors.border,
                                        }}
                                    >
                                        <ButtonText
                                            size="xs"
                                            color={type === tType ? Theme.colors.sacredWhite : colors.textSecondary}
                                        >
                                            {t(`school.type_${tType}`) || tType.charAt(0).toUpperCase() + tType.slice(1)}
                                        </ButtonText>
                                    </Button>
                                ))}
                            </HStack>
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack space="md" sx={{ width: '100%' }}>
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
                            onPress={handleSubmit}
                            sx={{
                                flex: 1,
                                backgroundColor: Theme.colors.sanctuarySaffron,
                            }}
                            isDisabled={isSubmitting || !name.trim()}
                        >
                            {isSubmitting ? (
                                <Spinner color={Theme.colors.sacredWhite} size="small" />
                            ) : (
                                <ButtonText color={Theme.colors.sacredWhite}>
                                    {t('common.initialize') || 'Initialize'}
                                </ButtonText>
                            )}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
