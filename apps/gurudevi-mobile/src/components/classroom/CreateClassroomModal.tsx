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
} from '@/ui';
import { Theme } from '../../constants/Theme';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { useThemedColors } from '../../hooks/useThemedColors';

interface CreateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newClass: any) => void;
}

export default function CreateClassroomModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateClassroomModalProps) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const colors = useThemedColors();

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError(t('classroom.errorNameRequired') || 'Class name is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        hapticLight();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Fetch user's school_id
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('school_id')
                .eq('id', user.id)
                .single();

            if (userError || !userData?.school_id) {
                throw new Error('Failed to fetch school information');
            }

            const newClass = await api.classrooms.create({
                name: name.trim(),
                subject: subject.trim() || undefined,
                school_id: userData.school_id as string,
                teacher_id: user.id,
                color_theme: 'blue', // Default theme
            });

            hapticSuccess();
            onSuccess(newClass);
            handleClose();
        } catch (err: any) {
            console.error('Failed to create classroom:', err);
            const detailMsg = err.details?.message || err.details?.details || JSON.stringify(err.details);
            setError(`${err.message}${err.code ? ` (${err.code})` : ''}${detailMsg ? `: ${detailMsg}` : ''}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setName('');
        setSubject('');
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
                        {t('classroom.createTitle') || 'Create New Class'}
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
                                    {t('classroom.labelName') || 'Class Name'}
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
                                    placeholder={t('classroom.placeholderName') || "e.g., Grade 10 Mathematics"}
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
                                    {t('classroom.labelSubject') || 'Subject (Optional)'}
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
                                    placeholder={t('classroom.placeholderSubject') || "e.g., Mathematics"}
                                    value={subject}
                                    onChangeText={setSubject}
                                    color={colors.text}
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </Input>
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
                                    {t('common.create') || 'Create'}
                                </ButtonText>
                            )}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

