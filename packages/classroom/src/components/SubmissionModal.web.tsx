/**
 * SubmissionModal.web.tsx — Web platform override for SubmissionModal
 *
 * Replaces:
 *  - expo-image-picker  → <input type="file" accept="image/*"
 *  - Alert.alert        → window.confirm / window.alert (already handled in .tsx)
 *  - Native Modal       → same Modal primitive from @repo/ui (works on web)
 *
 * Metro resolves this file for web builds automatically.
 */

import { handleAPIError } from '@repo/core/logic';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { CheckCircle2, Send, X } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Icon,
  Image as ImageIcon,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import type React from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoDataUrl(ev.target?.result as string);
      setPhotoFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !photoDataUrl) {
      window.alert(
        `${t('submission.emptyWarning') || 'Empty Submission'}\n\n${t('submission.emptyWarningDesc') || 'Please add some content or attach a photo before submitting.'}`,
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(content, photoDataUrl || undefined);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setContent('');
        setPhotoDataUrl(null);
        setPhotoFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
      }, 2000);
    } catch (error: any) {
      handleAPIError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() || photoDataUrl) {
      if (
        !window.confirm(
          t('submission.cancelWarningDesc') || 'Your work will be lost. Are you sure?',
        )
      )
        return;
    }
    setContent('');
    setPhotoDataUrl(null);
    setPhotoFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
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
        {/* Assignment name */}
        <Box className="p-5 bg-phase-surface rounded-[24px] border border-phase-border">
          <Text className="text-xs font-bold text-phaseText-ghost uppercase tracking-wider mb-1">
            {t('submission.assignmentLabel') || 'Assignment'}
          </Text>
          <Text className="text-xl font-black text-phaseText-primary tracking-tight">
            {assignmentTitle}
          </Text>
        </Box>

        {/* Text answer */}
        <VStack className="gap-2 flex-1 min-h-[200px]">
          <Text className="text-sm font-bold text-phaseText-secondary ml-1">
            {t('submission.answerLabel') || 'Your Answer'}
          </Text>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('submission.answerPlaceholder') || 'Type your answer here...'}
            className="w-full min-h-[160px] rounded-[12px] border border-phase-border bg-phase-surface text-phaseText-primary text-[14px] p-[12px_16px] resize-y outline-none leading-[1.6]"
            style={{ fontFamily: 'var(--font-body)' }}
          />
        </VStack>

        {/* Photo attachment — web file picker */}
        <VStack className="gap-3">
          <Text className="text-sm font-bold text-phaseText-secondary ml-1">
            {t('submission.photoLabel') || 'Attach Photo (Optional)'}
          </Text>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {photoDataUrl ? (
            <VStack className="gap-2">
              <Box className="relative rounded-[24px] overflow-hidden border border-phase-border">
                <img
                  src={photoDataUrl}
                  alt="Attachment preview"
                  className="w-full max-h-[180px] object-cover rounded-[10px]"
                />
                <Button
                  variant="ghost"
                  action="negative"
                  className="absolute top-3 right-3 p-2 bg-black/60 rounded-full border border-white/20 h-auto"
                  onPress={() => {
                    setPhotoDataUrl(null);
                    setPhotoFileName(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <Icon as={X} size="xs" className="text-white" />
                </Button>
              </Box>
              <HStack className="items-center gap-2">
                <Text className="text-xs text-phaseText-secondary flex-1">📎 {photoFileName}</Text>
                <Button
                  variant="ghost"
                  action="negative"
                  size="sm"
                  onPress={() => {
                    setPhotoDataUrl(null);
                    setPhotoFileName(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <ButtonText className="text-phase-danger font-bold text-xs">
                    {t('submission.removePhoto') || 'Remove'}
                  </ButtonText>
                </Button>
              </HStack>
            </VStack>
          ) : (
            <Button
              variant="outline"
              action="primary"
              className="h-14 rounded-[20px] flex-row items-center justify-center gap-2"
              onPress={() => fileInputRef.current?.click()}
            >
              <Icon as={ImageIcon} size="sm" className="text-phase-accent" />
              <ButtonText className="text-phase-accent font-bold">
                {t('submission.choosePhoto') || 'Choose Photo'}
              </ButtonText>
            </Button>
          )}
        </VStack>
      </VStack>
    </SanctuaryModal>
  );
}
