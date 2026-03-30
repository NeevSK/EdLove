/**
 * SubmissionModal.web.tsx \u2014 Web platform override for SubmissionModal
 *
 * Replaces:
 *  - expo-image-picker  \u2192 <input type="file" accept="image/*"
 *  - Alert.alert        \u2192 window.confirm / window.alert (already handled in .tsx)
 *  - Native Modal       \u2192 same Modal primitive from @repo/ui (works on web)
 *
 * Metro resolves this file for web builds automatically.
 */
import React, { useState, useRef } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    Button,
    ButtonText,
    Modal,
    ModalBackdrop,
    ModalContent,
    Spinner,
    useTheme,
} from '@repo/ui';
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
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const [photoFileName, setPhotoFileName] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { text, accent, glass, isDark } = useTheme();
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
                `${t('submission.emptyWarning') || 'Empty Submission'}\n\n${t('submission.emptyWarningDesc') || 'Please add some content or attach a photo before submitting.'}`
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
            if (!window.confirm(t('submission.cancelWarningDesc') || 'Your work will be lost. Are you sure?')) return;
        }
        setContent('');
        setPhotoDataUrl(null);
        setPhotoFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    if (showSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={() => {}}
                <ModalBackdrop sx={{ backgroundColor: isDark ? 'rgba(107,100,128,0.65)' : 'rgba(107,100,128,0.45)' }} /
                <ModalContent sx={{ backgroundColor: glass.modal.bg, borderColor: glass.modal.border, borderWidth: 1, padding: Theme.spacing.xl, alignItems: 'center', borderRadius: Theme.corners.generous }}
                    <VStack sx={{ gap: Theme.spacing.lg, alignItems: 'center' }}
                        <Text sx={{ fontSize: 64 }}>\u2705</Text
                        <Heading sx={{ color: accent.reward, fontSize: 32 }}
                            {t('submission.success') || 'Success!'}
                        </Heading
                        <Text {...({ color: text.secondary } as any)} sx={{ textAlign: 'center' }}
                            {t('submission.successMessage') || 'Your work has been sent to the teacher.'}
                        </Text
                    </VStack
                </ModalContent
            </Modal
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleCancel}
            <ModalBackdrop sx={{ backgroundColor: isDark ? 'rgba(107,100,128,0.65)' : 'rgba(107,100,128,0.45)' }} /
            <ModalContent
                sx={{
                    backgroundColor: glass.modal.bg,
                    borderColor: glass.modal.border,
                    borderWidth: 1,
                    borderRadius: Theme.corners.generous,
                    maxWidth: 600,
                    width: '100%',
                    maxHeight: '90vh',
                }}
            
                <VStack sx={{ flex: 1, padding: Theme.spacing.lg, gap: Theme.spacing.lg }}
                    {/* Header */}
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                        <Heading sx={{ fontSize: 24, color: accent.action }}
                            {t('submission.title') || 'Submit Work'}
                        </Heading
                        <Button variant="outline" size="sm" sx={{ borderColor: glass.interact.border, borderRadius: Theme.corners.comfortable }} onPress={handleCancel} disabled={isSubmitting}
                            <ButtonText {...({ color: text.secondary } as any)}>{t('common.cancel') || 'Cancel'}</ButtonText
                        </Button
                    </HStack

                    {/* Assignment name */}
                    <Box sx={{ padding: Theme.spacing.md, backgroundColor: glass.interact.bg, borderRadius: Theme.corners.comfortable, borderWidth: 1, borderColor: glass.interact.border }}
                        <Text {...({ color: text.secondary } as any)} sx={{ fontSize: 14 }}
                            {t('submission.assignmentLabel') || 'Assignment'}
                        </Text
                        <Text {...({ color: text.primary } as any)} sx={{ fontSize: 18, fontWeight: '600' }}
                            {assignmentTitle}
                        </Text
                    </Box

                    {/* Text answer */}
                    <VStack sx={{ gap: Theme.spacing.sm }}
                        <Text {...({ color: text.secondary } as any)} sx={{ fontWeight: '600' }}
                            {t('submission.answerLabel') || 'Your Answer'}
                        </Text
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder={t('submission.answerPlaceholder') || 'Type your answer here\u2026'}
                            style={{
                                width: '100%', minHeight: '160px', borderRadius: '12px',
                                border: `1px solid ${glass.interact.border}`,
                                background: glass.interact.bg,
                                color: text.primary, fontSize: '14px',
                                fontFamily: 'var(--font-body)', padding: '12px 16px',
                                resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                                lineHeight: '1.6',
                            }}
                        /
                    </VStack

                    {/* Photo attachment \u2014 web file picker */}
                    <VStack sx={{ gap: Theme.spacing.sm }}
                        <Text {...({ color: text.secondary } as any)} sx={{ fontWeight: '600' }}
                            {t('submission.photoLabel') || 'Attach Photo (Optional)'}
                        </Text

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        /

                        {photoDataUrl ? (
                            <VStack sx={{ gap: 8 }}
                                <img
                                    src={photoDataUrl}
                                    alt="Attachment preview"
                                    style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '10px' }}
                                /
                                <Text {...({ color: text.secondary } as any)} sx={{ fontSize: 12 }}
                                    \uD83D\uDCCE {photoFileName}
                                </Text
                                <Button variant="link" size="sm" onPress={() => { setPhotoDataUrl(null); setPhotoFileName(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                    <ButtonText {...({ color: accent.danger } as any)}
                                        {t('submission.removePhoto') || 'Remove Photo'}
                                    </ButtonText
                                </Button
                            </VStack
                        ) : (
                            <Button
                                variant="outline"
                                sx={{ borderColor: accent.action, borderRadius: Theme.corners.comfortable }}
                                onPress={() => fileInputRef.current?.click()}
                            
                                <ButtonText {...({ color: accent.action } as any)}
                                    \uD83D\uDDBC\uFE0F {t('submission.choosePhoto') || 'Choose Photo'}
                                </ButtonText
                            </Button
                        )}
                    </VStack

                    {/* Submit */}
                    <Button
                        sx={{ backgroundColor: accent.reward, padding: Theme.spacing.lg, borderRadius: Theme.corners.comfortable }}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    
                        {isSubmitting ? (
                            <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}
                                <Spinner {...({ color: text.inverse, size: 'small' } as any)} /
                                <ButtonText {...({ color: text.inverse } as any)}
                                    {t('submission.submitting') || 'Turning in\u2026'}
                                </ButtonText
                            </HStack
                        ) : (
                            <ButtonText {...({ color: text.inverse, fontWeight: '700', fontSize: 18 } as any)}
                                \u270D\uFE0F {t('submission.turnIn') || 'Turn In'}
                            </ButtonText
                        )}
                    </Button
                </VStack
            </ModalContent
        </Modal
    );
}
