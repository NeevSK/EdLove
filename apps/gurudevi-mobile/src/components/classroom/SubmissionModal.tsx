/**
 * SUBMISSION MODAL COMPONENT
 * 
 * Full screen modal for students to submit assignment work.
 * Features:
 * - Text input for typed answers
 * - Photo attachment (camera/gallery)
 * - Turn In button with success animation
 * 
 * Mission 05: Student Path
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
} from '@gluestack-ui/themed';
import { Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import Theme from '../../constants/Theme';
// import * as ImagePicker from 'expo-image-picker';

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

    const handlePickImage = async (useCamera: boolean = false) => {
        try {
            // Placeholder for image picker functionality
            // In a real implementation, would use expo-image-picker
            Alert.alert(
                t('submission.photoPlaceholder') || 'Photo Feature',
                t('submission.photoPlaceholderDesc') ||
                    'Image picker would be implemented here using expo-image-picker'
            );

            // Example implementation (commented out):
            /*
            const result = useCamera
                ? await ImagePicker.launchCameraAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      quality: 0.8,
                  })
                : await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      quality: 0.8,
                  });

            if (!result.canceled) {
                setPhotoUri(result.assets[0].uri);
            }
            */
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert(
                t('common.error') || 'Error',
                t('submission.photoError') || 'Failed to pick image'
            );
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

            // Show success for 2 seconds then close
            setTimeout(() => {
                setShowSuccess(false);
                setContent('');
                setPhotoUri(null);
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error('Submission error:', error);
            Alert.alert(
                t('common.error') || 'Error',
                error.message || t('submission.submitError') || 'Failed to submit work'
            );
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

    // Success animation view
    if (showSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={() => {}}>
                <ModalBackdrop />
                <ModalContent
                    sx={{
                        backgroundColor: Theme.colors.deepIndigo,
                        padding: Theme.spacing.xl,
                        alignItems: 'center',
                    }}
                >
                    <VStack space="lg" sx={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 64 }}>✅</Text>
                        <Heading size="xl" color={Theme.colors.sageGreen}>
                            {t('submission.success') || 'Success!'}
                        </Heading>
                        <Text
                            color={Theme.colors.pearlGray}
                            textAlign="center"
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
        <Modal isOpen={isOpen} onClose={handleCancel} size="full">
            <ModalBackdrop />
            <ModalContent
                sx={{
                    backgroundColor: Theme.colors.voidIndigo,
                    height: '100%',
                    width: '100%',
                }}
            >
                <VStack
                    space="lg"
                    sx={{
                        flex: 1,
                        padding: Theme.spacing.lg,
                    }}
                >
                    {/* Header */}
                    <HStack
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Heading size="xl" color={Theme.colors.sanctuarySaffron}>
                            {t('submission.title') || 'Submit Work'}
                        </Heading>

                        <Button
                            variant="outline"
                            size="sm"
                            sx={{
                                borderColor: Theme.colors.mistGray,
                            }}
                            onPress={handleCancel}
                            disabled={isSubmitting}
                        >
                            <ButtonText color={Theme.colors.sacredWhite}>
                                {t('common.cancel') || 'Cancel'}
                            </ButtonText>
                        </Button>
                    </HStack>

                    {/* Assignment Title */}
                    <Box
                        sx={{
                            padding: Theme.spacing.md,
                            backgroundColor: Theme.colors.deepIndigo,
                            borderRadius: Theme.corners.medium,
                        }}
                    >
                        <Text color={Theme.colors.mistGray} size="sm">
                            {t('submission.assignmentLabel') || 'Assignment'}
                        </Text>
                        <Text
                            color={Theme.colors.sacredWhite}
                            size="lg"
                            sx={{ fontWeight: '600' }}
                        >
                            {assignmentTitle}
                        </Text>
                    </Box>

                    {/* Text Input */}
                    <VStack space="sm" sx={{ flex: 1 }}>
                        <Text color={Theme.colors.pearlGray} sx={{ fontWeight: '600' }}>
                            {t('submission.answerLabel') || 'Your Answer'}
                        </Text>
                        <Textarea
                            sx={{
                                flex: 1,
                                backgroundColor: Theme.colors.deepIndigo,
                                borderColor: Theme.colors.mistGray,
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
                                    color: Theme.colors.sacredWhite,
                                }}
                                multiline
                            />
                        </Textarea>
                    </VStack>

                    {/* Photo Attachment */}
                    <VStack space="sm">
                        <Text color={Theme.colors.pearlGray} sx={{ fontWeight: '600' }}>
                            {t('submission.photoLabel') || 'Attach Photo (Optional)'}
                        </Text>

                        {photoUri ? (
                            <Box>
                                <Image
                                    source={{ uri: photoUri }}
                                    style={{
                                        width: '100%',
                                        height: 200,
                                        borderRadius: Theme.corners.medium,
                                    }}
                                    resizeMode="cover"
                                />
                                <Button
                                    variant="link"
                                    size="sm"
                                    sx={{ marginTop: Theme.spacing.sm }}
                                    onPress={() => setPhotoUri(null)}
                                >
                                    <ButtonText color={Theme.colors.emberRed}>
                                        {t('submission.removePhoto') || 'Remove Photo'}
                                    </ButtonText>
                                </Button>
                            </Box>
                        ) : (
                            <HStack space="md">
                                <Button
                                    variant="outline"
                                    sx={{
                                        flex: 1,
                                        borderColor: Theme.colors.sanctuarySaffron,
                                    }}
                                    onPress={() => handlePickImage(true)}
                                    disabled={isSubmitting}
                                >
                                    <ButtonText color={Theme.colors.sanctuarySaffron}>
                                        📷 {t('submission.takePhoto') || 'Take Photo'}
                                    </ButtonText>
                                </Button>

                                <Button
                                    variant="outline"
                                    sx={{
                                        flex: 1,
                                        borderColor: Theme.colors.sanctuarySaffron,
                                    }}
                                    onPress={() => handlePickImage(false)}
                                    disabled={isSubmitting}
                                >
                                    <ButtonText color={Theme.colors.sanctuarySaffron}>
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
                        }}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <HStack space="sm" sx={{ alignItems: 'center' }}>
                                <Spinner color={Theme.colors.sacredWhite} size="small" />
                                <ButtonText color={Theme.colors.sacredWhite}>
                                    {t('submission.submitting') || 'Turning in...'}
                                </ButtonText>
                            </HStack>
                        ) : (
                            <ButtonText
                                color={Theme.colors.sacredWhite}
                                sx={{ fontWeight: '700', fontSize: 18 }}
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
