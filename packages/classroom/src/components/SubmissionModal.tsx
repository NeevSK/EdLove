/**
 * SUBMISSION MODAL COMPONENT
 * 
 * Full screen modal for students to submit assignment work.
 * Features:
 * - Text input for typed answers
 * - Photo attachment (camera/gallery)
 * - Turn In button with success animation
 */

import React, { useState } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    Button,
    ButtonText,
    Textarea,
    TextareaInput,
    Modal,
    ModalBackdrop,
    ModalContent,
    Spinner,
} from '@repo/ui';
import { Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme, useThemedColors } from '@repo/ui';
import { handleAPIError } from '@repo/core';

interface SubmissionModalProps {
    isOpen: boolean;
    assignmentTitle: string;
    onClose: () => void;
    onSubmit: (content: string, photoUri?: string) => Promise<void>;
}

export default function SubmissionModal({
    isOpen,
    assignmentTitle,
    onClose,
    onSubmit,
}: SubmissionModalProps) {
    const { t } = useTranslation();
    const [content, setContent] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const colors = useThemedColors();

    const handlePickImage = async (useCamera: boolean = false) => {
        try {
            Alert.alert(
                t('submission.photoPlaceholder') || 'Photo Feature',
                t('submission.photoPlaceholderDesc') ||
                'Image picker would be implemented here using expo-image-picker'
            );
        } catch (error) {
            handleAPIError(error);
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() && !photoUri) {
            Alert.alert(
                t('submission.emptyWarning') || 'Empty Submission',
                t('submission.emptyWarningDesc') ||
                'Please add some content or attach a photo before submitting.'
            );
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(content, photoUri || undefined);
            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                setContent('');
                setPhotoUri(null);
                onClose();
            }, 2000);
        } catch (error: any) {
            handleAPIError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (content.trim() || photoUri) {
            Alert.alert(
                t('submission.cancelWarning') || 'Discard Changes?',
                t('submission.cancelWarningDesc') ||
                'Your work will be lost. Are you sure?',
                [
                    {
                        text: t('common.cancel') || 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: t('common.discard') || 'Discard',
                        onPress: () => {
                            setContent('');
                            setPhotoUri(null);
                            onClose();
                        },
                        style: 'destructive',
                    },
                ]
            );
        } else {
            onClose();
        }
    };

    if (showSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={() => { }}>
                <ModalBackdrop />
                <ModalContent
                    sx={{
                        backgroundColor: colors.tertiary,
                        padding: Theme.spacing.xl,
                        alignItems: 'center',
                    }}
                >
                    <VStack sx={{ gap: Theme.spacing.lg, alignItems: 'center' }}>
                        <Text sx={{ fontSize: 64 }}>✅</Text>
                        <Heading sx={{ color: Theme.colors.sageGreen, fontSize: 32 }}>
                            {t('submission.success') || 'Success!'}
                        </Heading>
                        <Text
                            color={colors.textSecondary}
                            sx={{ textAlign: 'center' }}
                        >
                            {t('submission.successMessage') ||
                                'Your work has been sent to the teacher.'}
                        </Text>
                    </VStack>
                </ModalContent>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleCancel}>
            <ModalBackdrop />
            <ModalContent
                sx={{
                    backgroundColor: colors.primary,
                    height: '100%',
                    width: '100%',
                }}
            >
                <VStack
                    sx={{
                        flex: 1,
                        padding: Theme.spacing.lg,
                        gap: Theme.spacing.lg,
                    }}
                >
                    {/* Header */}
                    <HStack
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Heading sx={{ fontSize: 24, color: Theme.colors.sanctuarySaffron }}>
                            {t('submission.title') || 'Submit Work'}
                        </Heading>

                        <Button
                            variant="outline"
                            size="sm"
                            sx={{
                                borderColor: colors.border,
                            }}
                            onPress={handleCancel}
                            disabled={isSubmitting}
                        >
                            <ButtonText sx={{ color: colors.text }}>
                                {t('common.cancel') || 'Cancel'}
                            </ButtonText>
                        </Button>
                    </HStack>

                    {/* Assignment Title */}
                    <Box
                        sx={{
                            padding: Theme.spacing.md,
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.comfortable,
                        }}
                    >
                        <Text sx={{ color: colors.textSecondary, fontSize: 14 }}>
                            {t('submission.assignmentLabel') || 'Assignment'}
                        </Text>
                        <Text
                            sx={{ color: colors.text, fontSize: 18, fontWeight: '600' }}
                        >
                            {assignmentTitle}
                        </Text>
                    </Box>

                    {/* Text Input */}
                    <VStack sx={{ gap: Theme.spacing.sm, flex: 1 }}>
                        <Text sx={{ color: colors.textSecondary, fontWeight: '600' }}>
                            {t('submission.answerLabel') || 'Your Answer'}
                        </Text>
                        <Textarea
                            sx={{
                                flex: 1,
                                backgroundColor: colors.secondary,
                                borderColor: colors.border,
                                borderRadius: Theme.corners.comfortable,
                                minHeight: 200,
                            }}
                        >
                            <TextareaInput
                                placeholder={
                                    t('submission.answerPlaceholder') ||
                                    'Type your answer here...'
                                }
                                value={content}
                                onChangeText={setContent}
                                sx={{
                                    color: colors.text,
                                }}
                                multiline
                            />
                        </Textarea>
                    </VStack>

                    {/* Photo Attachment */}
                    <VStack sx={{ gap: Theme.spacing.sm }}>
                        <Text sx={{ color: colors.textSecondary, fontWeight: '600' }}>
                            {t('submission.photoLabel') || 'Attach Photo (Optional)'}
                        </Text>

                        {photoUri ? (
                            <Box>
                                <Image
                                    source={{ uri: photoUri }}
                                    style={{
                                        width: '100%',
                                        height: 200,
                                        borderRadius: 12,
                                    }}
                                    resizeMode="cover"
                                />
                                <Button
                                    variant="link"
                                    size="sm"
                                    sx={{ marginTop: Theme.spacing.sm }}
                                    onPress={() => setPhotoUri(null)}
                                >
                                    <ButtonText sx={{ color: Theme.colors.emberRed }}>
                                        {t('submission.removePhoto') || 'Remove Photo'}
                                    </ButtonText>
                                </Button>
                            </Box>
                        ) : (
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <Button
                                    variant="outline"
                                    sx={{
                                        flex: 1,
                                        borderColor: Theme.colors.sanctuarySaffron,
                                        borderRadius: Theme.corners.comfortable,
                                    }}
                                    onPress={() => handlePickImage(true)}
                                    disabled={isSubmitting}
                                >
                                    <ButtonText sx={{ color: Theme.colors.sanctuarySaffron }}>
                                        📷 {t('submission.takePhoto') || 'Take Photo'}
                                    </ButtonText>
                                </Button>

                                <Button
                                    variant="outline"
                                    sx={{
                                        flex: 1,
                                        borderColor: Theme.colors.sanctuarySaffron,
                                        borderRadius: Theme.corners.comfortable,
                                    }}
                                    onPress={() => handlePickImage(false)}
                                    disabled={isSubmitting}
                                >
                                    <ButtonText sx={{ color: Theme.colors.sanctuarySaffron }}>
                                        🖼️ {t('submission.choosePhoto') || 'Choose Photo'}
                                    </ButtonText>
                                </Button>
                            </HStack>
                        )}
                    </VStack>

                    {/* Submit Button */}
                    <Button
                        sx={{
                            backgroundColor: Theme.colors.sageGreen,
                            padding: Theme.spacing.lg,
                            borderRadius: Theme.corners.comfortable,
                        }}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                                <Spinner color={Theme.colors.sacredWhite} size="small" />
                                <ButtonText sx={{ color: Theme.colors.sacredWhite }}>
                                    {t('submission.submitting') || 'Turning in...'}
                                </ButtonText>
                            </HStack>
                        ) : (
                            <ButtonText
                                sx={{ color: Theme.colors.sacredWhite, fontWeight: '700', fontSize: 18 }}
                            >
                                ✍️ {t('submission.turnIn') || 'Turn In'}
                            </ButtonText>
                        )}
                    </Button>
                </VStack>
            </ModalContent>
        </Modal>
    );
}
