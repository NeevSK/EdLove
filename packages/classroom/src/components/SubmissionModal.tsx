/**
 * SUBMISSION MODAL COMPONENT
 *
 * Full screen modal for students to submit assignment work.
 * Features:
 * - Text input for typed answers
 * - Photo attachment (camera/gallery)
 * - Turn In button with success animation
 */

import { handleAPIError } from '@repo/core/logic';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { Camera, CheckCircle2, Send, Trash2, X } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Icon,
  Image,
  Image as ImageIcon,
  Pressable,
  Spinner,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from '@repo/ui/primitives';

import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

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

  const isWeb = Platform.OS === 'web';

  const requestPermission = async (useCamera: boolean): Promise<boolean> => {
    const { status } = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted' && !isWeb) {
      // Fallback for native without Alert - ideally use a Toast or custom Modal
      console.warn('Permission not granted');
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
      if (isWeb) {
        window.alert(
          (t('submission.emptyWarning') || 'Empty Submission') +
            '\n\n' +
            (t('submission.emptyWarningDesc') ||
              'Please add some content or attach a photo before submitting.'),
        );
      } else {
        // Ideally replace with a Toast component
        console.warn('Empty submission');
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
    } catch (error: unknown) {
      handleAPIError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() || photoUri) {
      if (isWeb) {
        if (
          window.confirm(
            t('submission.cancelWarningDesc') || 'Your work will be lost. Are you sure?',
          )
        ) {
          setContent('');
          setPhotoUri(null);
          onClose();
        }
        return;
      }
      // For native, we could show another modal, but for now we'll just close or assume user knows
      // To be safe, we'll just close or use a simple confirm if available via coreRuntime
      setContent('');
      setPhotoUri(null);
      onClose();
    } else {
      onClose();
    }
  };

  if (showSuccess) {
    return (
      <SanctuaryModal isOpen={isOpen} onClose={() => {}} title="">
        <VStack className="items-center justify-center p-8 gap-6">
          <Box className="w-24 h-24 bg-phase-reward/10 rounded-full items-center justify-center border border-phase-reward/20">
            <Icon as={CheckCircle2} size="xl" className="text-phase-reward" />
          </Box>
          <VStack className="items-center gap-2">
            <Text className="text-3xl font-black text-phaseText-primary tracking-tighter">
              {t('submission.success') || 'Success!'}
            </Text>
            <Text className="text-lg font-medium text-phaseText-secondary text-center leading-relaxed">
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
          className="w-full h-16 bg-templeGold rounded-[24px] shadow-lg shadow-templeGold/20 flex-row items-center justify-center gap-3"
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <HStack className="items-center gap-2">
              <Spinner className="text-phaseText-inverse" size="small" />
              <ButtonText className="text-phaseText-inverse font-bold text-lg">
                {t('submission.submitting') || 'Turning in...'}
              </ButtonText>
            </HStack>
          ) : (
            <HStack className="items-center gap-2">
              <Icon as={Send} size="sm" className="text-phaseText-inverse" />
              <ButtonText className="text-phaseText-inverse font-bold text-lg">
                {t('submission.turnIn') || 'Turn In'}
              </ButtonText>
            </HStack>
          )}
        </Button>
      }
    >
      <VStack className="gap-8 p-1">
        {/* Assignment Title */}
        <Box className="p-5 bg-phase-surface rounded-[24px] border border-phase-border">
          <Text className="text-xs font-bold text-phaseText-ghost uppercase tracking-wider mb-1">
            {t('submission.assignmentLabel') || 'Assignment'}
          </Text>
          <Text className="text-xl font-black text-phaseText-primary tracking-tight">
            {assignmentTitle}
          </Text>
        </Box>
        {/* Text Input */}
        <VStack className="gap-2 flex-1 min-h-[250px]">
          <Text className="text-sm font-bold text-phaseText-secondary ml-1">
            {t('submission.answerLabel') || 'Your Answer'}
          </Text>
          <Textarea className="flex-1 p-5 bg-phase-surface rounded-[32px] border border-phase-border">
            <TextareaInput
              placeholder={t('submission.answerPlaceholder') || 'Type your answer here...'}
              className="text-phaseText-primary text-lg leading-relaxed"
              value={content}
              onChangeText={setContent}
              multiline
            />
          </Textarea>
        </VStack>
        {/* Photo Attachment */}
        <VStack className="gap-3">
          <Text className="text-sm font-bold text-phaseText-secondary ml-1">
            {t('submission.photoLabel') || 'Visual Evidence (Optional)'}
          </Text>
          {photoUri ? (
            <VStack className="gap-2">
              <Box className="relative rounded-[24px] overflow-hidden border border-phase-border">
                <Image source={{ uri: photoUri }} className="w-full h-48" resizeMode="cover" />
                <Pressable
                  onPress={() => setPhotoUri(null)}
                  className="absolute top-3 right-3 p-2 bg-black/60 rounded-full border border-white/20"
                >
                  <Icon as={X} size="xs" className="text-white" />
                </Pressable>
              </Box>
              <Button
                variant="ghost"
                action="negative"
                className="self-center"
                onPress={() => setPhotoUri(null)}
              >
                <Icon as={Trash2} size="xs" className="text-phase-danger mr-2" />
                <ButtonText className="text-phase-danger font-bold">
                  {t('submission.removePhoto') || 'Remove Photo'}
                </ButtonText>
              </Button>
            </VStack>
          ) : (
            <HStack className="gap-4">
              <Button
                variant="outline"
                action="primary"
                className="flex-1 h-14 rounded-[20px] flex-row items-center justify-center gap-2"
                onPress={() => handlePickImage(true)}
                disabled={isSubmitting}
              >
                <Icon as={Camera} size="sm" className="text-phase-accent" />
                <ButtonText className="text-phase-accent font-bold">
                  {t('submission.takePhoto') || 'Camera'}
                </ButtonText>
              </Button>
              <Button
                variant="outline"
                action="primary"
                className="flex-1 h-14 rounded-[20px] flex-row items-center justify-center gap-2"
                onPress={() => handlePickImage(false)}
                disabled={isSubmitting}
              >
                <Icon as={ImageIcon} size="sm" className="text-phase-accent" />
                <ButtonText className="text-phase-accent font-bold">
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
