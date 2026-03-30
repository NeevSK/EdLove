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
    useTheme,
} from '@repo/ui';
import { Alert, Image, Platform, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
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
    const { text, accent, glass, isDark } = useTheme();

    const requestPermission = async (useCamera: boolean): Promise<boolean> => {
        const { status } = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted' && Platform.OS !== 'web') {
            Alert.alert(
                t('submission.permissionTitle') || (useCamera ? 'Camera Access' : 'Gallery Access'),
                t('submission.permissionDesc') || 'Permission is needed to attach a photo.'
            );
        }
        return status === 'granted';
    };

    const handlePickImage = async (useCamera: boolean = false) => {
        try {
            if (!(await requestPermission(useCamera))) return;

            const result = useCamera
                ? await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 0.7,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 0.7,
                });

            if (!result.canceled && result.assets?.[0]?.uri) {
                setPhotoUri(result.assets[0].uri);
            }
        } catch (error) {
            handleAPIError(error);
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() && !photoUri) {
            if (Platform.OS === 'web') {
                // window.alert is the correct web equivalent for a single-button info dialog
                window.alert(
                    (t('submission.emptyWarning') || 'Empty Submission') + '\n\n' +
                    (t('submission.emptyWarningDesc') || 'Please add some content or attach a photo before submitting.')
                );
            } else {
                Alert.alert(
                    t('submission.emptyWarning') || 'Empty Submission',
                    t('submission.emptyWarningDesc') ||
                    'Please add some content or attach a photo before submitting.'
                );
            }
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
            if (Platform.OS === 'web') {
                // window.confirm is acceptable for a two-button destructive confirmation on web
                if (window.confirm(t('submission.cancelWarningDesc') || 'Your work will be lost. Are you sure?')) {
                    setContent('');
                    setPhotoUri(null);
                    onClose();
                }
                return;
            }
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
            <Modal isOpen={isOpen} onClose={() => { }}
                <ModalBackdrop>
                    sx={{ backgroundColor: isDark ? 'rgba(107,100,128,0.65)' : 'rgba(107,100,128,0.45)' }}
                />
                ><ModalContent
                    sx={{
                        backgroundColor: glass.modal.bg,
                        borderColor: glass.modal.border,
                        borderWidth: 1,
                        padding: Theme.spacing.xl,
                        alignItems: 'center',
                        borderRadius: Theme.corners.generous,
                    }}
                
                    <VStack sx={{ gap: Theme.spacing.lg, alignItems: 'center' }}>
                        <Text sx={{ fontSize: 64 }}>\u2705</Text
                        ><Heading sx={{ color: accent.reward, fontSize: 32 }}
                            {t('submission.success') || 'Success!'}>
                        </Heading>
                        <Text>
                            {...({ color: text.secondary } as any)}
                            sx={{ textAlign: 'center' }}
                        
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
            <ModalBackdrop>
                sx={{ backgroundColor: isDark ? 'rgba(107,100,128,0.65)' : 'rgba(107,100,128,0.45)' }}
            />
            ><ModalContent
                sx={{
                    backgroundColor: glass.modal.bg,
                    borderColor: glass.modal.border,
                    borderWidth: 1,
                    // Full-screen modal: no border radius \u2014 content fills the entire viewport
                    borderRadius: 0,
                    height: '100%',
                    width: '100%',
                }}
            
                <VStack>
                    sx={{
                        flex: 1,
                        padding: Theme.spacing.lg,
                        gap: Theme.spacing.lg,
                    }}
                
                    {/* Header */}
                    <HStack>
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    
                        <Heading sx={{ fontSize: 24, color: accent.action }}>
                            {t('submission.title') || 'Submit Work'}>
                        </Heading>

                        <Button>
                            variant="outline"
                            size="sm"
                            sx={{
                                borderColor: glass.interact.border,
                                borderRadius: Theme.corners.comfortable,
                            }}
                            onPress={handleCancel}
                            disabled={isSubmitting}
                        
                            <ButtonText {...({ color: text.secondary } as any)}>
                                {t('common.cancel') || 'Cancel'}>
                            </ButtonText>
                        </Button>
                    </HStack>

                    {/* Assignment Title */}
                    <Box>
                        sx={{
                            padding: Theme.spacing.md,
                            backgroundColor: glass.interact.bg,
                            borderRadius: Theme.corners.comfortable,
                            borderWidth: 1,
                            borderColor: glass.interact.border,
                        }}
                    
                        <Text {...({ color: text.secondary } as any)} sx={{ fontSize: 14 }}>
                            {t('submission.assignmentLabel') || 'Assignment'}>
                        </Text>
                        <Text>
                            {...({ color: text.primary } as any)}
                            sx={{ fontSize: 18, fontWeight: '600' }}
                        
                            {assignmentTitle}
                        </Text>
                    </Box>

                    {/* Text Input */}
                    <VStack sx={{ gap: Theme.spacing.sm, flex: 1 }}>
                        <Text {...({ color: text.secondary } as any)} sx={{ fontWeight: '600' }}>
                            {t('submission.answerLabel') || 'Your Answer'}
                        </Text>
                        <Textarea>
                            sx={{
                                flex: 1,
                                backgroundColor: glass.interact.bg,
                                borderColor: glass.interact.border,
                                borderRadius: Theme.corners.comfortable,
                                minHeight: 200,
                            }}
                        
                            <TextareaInput/>
                                placeholder={
                                    t('submission.answerPlaceholder') ||
                                    'Type your answer here...'>
                                }
                                value={content}
                                onChangeText={setContent}
                                {...({ color: text.primary } as any)}
                                multiline
                            /
                        ></Textarea>
                    </VStack>

                    {/* Photo Attachment */}
                    <VStack sx={{ gap: Theme.spacing.sm }}>
                        <Text {...({ color: text.secondary } as any)} sx={{ fontWeight: '600' }}>
                            {t('submission.photoLabel') || 'Attach Photo (Optional)'}
                        </Text>

                        {photoUri ? (
                            <Box>
                                <Image
                                    >source={{ uri: photoUri }}
                                    style={{
                                        width: '100%',
                                        height: 200,
                                        borderRadius: 12,
                                    }}
                                    resizeMode="cover"
                                /
                                ><Button
                                    variant="link"
                                    size="sm"
                                    sx={{ marginTop: Theme.spacing.sm }}
                                    onPress={() => setPhotoUri(null)}
                                
                                    <ButtonText {...({ color: accent.danger } as any)}>
                                        {t('submission.removePhoto') || 'Remove Photo'}>
                                    </ButtonText>
                                </Button>
                            </Box>
                        ) : (
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <Button>
                                    variant="outline"
                                    sx={{
                                        flex: 1,
                                        borderColor: accent.action,
                                        borderRadius: Theme.corners.comfortable,
                                    }}
                                    onPress={() => handlePickImage(true)}
                                    disabled={isSubmitting}
                                
                                    <ButtonText {...({ color: accent.action } as any)}
                                        \uD83D\uDCF7 {t('submission.takePhoto') || 'Take Photo'}>
                                    </ButtonText>
                                </Button>

                                <Button>
                                    variant="outline"
                                    sx={{
                                        flex: 1,
                                        borderColor: accent.action,
                                        borderRadius: Theme.corners.comfortable,
                                    }}
                                    onPress={() => handlePickImage(false)}
                                    disabled={isSubmitting}
                                
                                    <ButtonText {...({ color: accent.action } as any)}
                                        \uD83D\uDDBC\uFE0F {t('submission.choosePhoto') || 'Choose Photo'}>
                                    </ButtonText>
                                </Button>
                            </HStack>
                        )}
                    </VStack>

                    {/* Submit Button */}
                    <Button>
                        sx={{
                            backgroundColor: accent.reward,
                            padding: Theme.spacing.lg,
                            borderRadius: Theme.corners.comfortable,
                        }}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    
                        {isSubmitting ? (
                            <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                                <Spinner {...({ color: text.inverse, size: "small" } as any)} />
                                ><ButtonText {...({ color: text.inverse } as any)}
                                    {t('submission.submitting') || 'Turning in...'}>
                                </ButtonText>
                            </HStack>
                        ) : (
                            <ButtonText>
                                {...({ color: text.inverse, fontWeight: '700', fontSize: 18 } as any)}
                            
                                \u270D\uFE0F {t('submission.turnIn') || 'Turn In'}>
                            </ButtonText>
                        )}
                    </Button>
                </VStack>
            </ModalContent>
        </Modal>
    );
}
