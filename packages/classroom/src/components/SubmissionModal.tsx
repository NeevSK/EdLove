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
    Spinner,
    Icon,
    SanctuaryModal,
} from '@repo/ui';
import { Alert, Image, Platform, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import {
    Camera,
    Image as ImageIcon,
    Trash2,
    CheckCircle2,
    Send,
    X
} from 'lucide-react-native';
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
            <SanctuaryModal
                isOpen={isOpen}
                onClose={() => { }}
                title=""
            >
                <VStack className="items-center justify-center p-8 gap-6">
                    <Box className="w-24 h-24 bg-sanctuary-success/10 rounded-full items-center justify-center border border-sanctuary-success/20">
                        <Icon as={CheckCircle2} size="xl" className="text-sanctuary-success" />
                    </Box>
                    <VStack className="items-center gap-2">
                        <Text className="text-3xl font-black text-sanctuary-text tracking-tighter">
                            {t('submission.success') || 'Success!'}
                        </Text>
                        <Text className="text-lg font-medium text-sanctuary-text-secondary text-center leading-relaxed">
                            {t('submission.successMessage') || 'Your work has been sent to the teacher.'}
                        </Text>
                    </VStack>
                </VStack>
            </SanctuaryModal>
        );
    }
    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={handleCancel}
            title={t('submission.title') || 'Submit Work'}
            footer={
                <Button
                    className="w-full h-16 bg-sanctuarySaffron rounded-[24px] shadow-lg shadow-sanctuarySaffron/20 flex-row items-center justify-center gap-3"
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <HStack className="items-center gap-2">
                            <Spinner className="text-sanctuary-ink" size="small" />
                            <ButtonText className="text-sanctuary-ink font-bold text-lg">
                                {t('submission.submitting') || 'Turning in...'}
                            </ButtonText>
                        </HStack>
                    ) : (
                        <HStack className="items-center gap-2">
                            <Icon as={Send} size="sm" className="text-sanctuary-ink" />
                            <ButtonText className="text-sanctuary-ink font-bold text-lg">
                                {t('submission.turnIn') || 'Turn In'}
                            </ButtonText>
                        </HStack>
                    )}
                </Button>
            }
        >
            <VStack className="gap-8 p-1">
                {/* Assignment Title */}
                <Box className="p-5 bg-sanctuary-surface-secondary rounded-[24px] border border-sanctuary-border">
                    <Text className="text-xs font-bold text-sanctuary-text-tertiary uppercase tracking-wider mb-1">
                        {t('submission.assignmentLabel') || 'Assignment'}
                    </Text>
                    <Text className="text-xl font-black text-sanctuary-text tracking-tight">
                        {assignmentTitle}
                    </Text>
                </Box>

                {/* Text Input */}
                <VStack className="gap-2 flex-1 min-h-[250px]">
                    <Text className="text-sm font-bold text-sanctuary-text-secondary ml-1">
                        {t('submission.answerLabel') || 'Your Answer'}
                    </Text>
                    <Textarea className="flex-1 p-5 bg-sanctuary-surface-secondary rounded-[32px] border border-sanctuary-border">
                        <TextareaInput
                            placeholder={t('submission.answerPlaceholder') || 'Type your answer here...'}
                            className="text-sanctuary-text text-lg leading-relaxed"
                            value={content}
                            onChangeText={setContent}
                            multiline
                        />
                    </Textarea>
                </VStack>

                {/* Photo Attachment */}
                <VStack className="gap-3">
                    <Text className="text-sm font-bold text-sanctuary-text-secondary ml-1">
                        {t('submission.photoLabel') || 'Visual Evidence (Optional)'}
                    </Text>

                    {photoUri ? (
                        <VStack className="gap-2">
                            <Box className="relative rounded-[24px] overflow-hidden border border-sanctuary-border">
                                <Image
                                    source={{ uri: photoUri }}
                                    className="w-full h-48"
                                    resizeMode="cover"
                                />
                                <Pressable
                                    onPress={() => setPhotoUri(null)}
                                    className="absolute top-3 right-3 p-2 bg-black/60 rounded-full border border-white/20"
                                >
                                    <Icon as={X} size="xs" className="text-white" />
                                </Pressable>
                            </Box>
                            <Button
                                variant="link"
                                className="self-center"
                                onPress={() => setPhotoUri(null)}
                            >
                                <Icon as={Trash2} size="xs" className="text-sanctuary-error mr-2" />
                                <ButtonText className="text-sanctuary-error font-bold">
                                    {t('submission.removePhoto') || 'Remove Photo'}
                                </ButtonText>
                            </Button>
                        </VStack>
                    ) : (
                        <HStack className="gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 h-14 rounded-[20px] border-sanctuarySaffron/30 bg-sanctuarySaffron/5 flex-row items-center justify-center gap-2"
                                onPress={() => handlePickImage(true)}
                                disabled={isSubmitting}
                            >
                                <Icon as={Camera} size="sm" className="text-sanctuarySaffron" />
                                <ButtonText className="text-sanctuarySaffron font-bold">
                                    {t('submission.takePhoto') || 'Camera'}
                                </ButtonText>
                            </Button>

                            <Button
                                variant="outline"
                                className="flex-1 h-14 rounded-[20px] border-sanctuarySaffron/30 bg-sanctuarySaffron/5 flex-row items-center justify-center gap-2"
                                onPress={() => handlePickImage(false)}
                                disabled={isSubmitting}
                            >
                                <Icon as={ImageIcon} size="sm" className="text-sanctuarySaffron" />
                                <ButtonText className="text-sanctuarySaffron font-bold">
                                    {t('submission.choosePhoto') || 'Gallery'}
                                </ButtonText>
                            </Button>
                        </HStack>
                    )}
                </VStack>
            </VStack>
        </SanctuaryModal>
    );
}
