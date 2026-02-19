/**
 * TEACHER FEEDBACK MODAL
 * A bridge component allowing teachers to send reflections, support requests,
 * or facility alerts directly to the Principal's Echo dashboard.
 */

import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Theme,
    useThemedColors,
    Button,
    ButtonText,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Textarea,
    TextareaInput,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectItem,
    Icon,
    Spinner,
} from '@repo/ui';
import { ChevronDown, MessageSquare, Heart, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { supabase, handleAPIError } from '@repo/core';
import { useTranslation } from 'react-i18next';

interface TeacherFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    schoolId: string;
    teacherId: string;
}

const CATEGORIES = [
    { label: 'Teaching Support', value: 'support', icon: MessageSquare },
    { label: 'Staff Morale', value: 'morale', icon: Heart },
    { label: 'Facility/Resource Alert', value: 'facility', icon: AlertTriangle },
    { label: 'Recognition/Positive Note', value: 'recognition', icon: CheckCircle2 },
];

export default function TeacherFeedbackModal({ isOpen, onClose, schoolId, teacherId }: TeacherFeedbackModalProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [category, setCategory] = useState<string>('support');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('school_echo_feedback')
                .insert({
                    school_id: schoolId,
                    teacher_id: teacherId,
                    source: 'teacher',
                    category,
                    content,
                    priority,
                    is_read: false,
                });

            if (error) throw error;

            onClose();
            setContent('');
        } catch (error) {
            handleAPIError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                    <VStack>
                        <Heading sx={{ fontSize: Theme.typography.fontSize.lg }} color={colors.text}>
                            {t('teacher.feedback.title', 'Principal Echo')}
                        </Heading>
                        <Text sx={{ fontSize: Theme.typography.fontSize.xs }} color={colors.textSecondary}>
                            {t('teacher.feedback.subtitle', 'Send a reflection or request to administration')}
                        </Text>
                    </VStack>
                </ModalHeader>
                <ModalBody>
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        <VStack sx={{ gap: Theme.spacing.xs }}>
                            <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '700' }} color={colors.text}>{t('teacher.feedback.category', 'Category')}</Text>
                            <Select onValueChange={setCategory} defaultValue={category}>
                                <SelectTrigger variant="outline">
                                    <SelectInput placeholder="Select category" />
                                    <SelectIcon sx={{ marginRight: Theme.spacing.md }} as={ChevronDown} />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} label={cat.label} value={cat.value} />
                                        ))}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        </VStack>

                        <VStack sx={{ gap: Theme.spacing.xs }}>
                            <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '700' }} color={colors.text}>{t('teacher.feedback.priority', 'Urgency')}</Text>
                            <HStack sx={{ gap: Theme.spacing.sm }}>
                                {(['low', 'medium', 'high'] as const).map((p) => (
                                    <Button
                                        key={p}
                                        size="xs"
                                        variant={priority === p ? 'solid' : 'outline'}
                                        sx={{
                                            flex: 1,
                                            backgroundColor: priority === p ? (p === 'high' ? Theme.colors.emberRed : colors.action) : 'transparent',
                                            borderColor: p === 'high' ? Theme.colors.emberRed : colors.action
                                        }}
                                        onPress={() => setPriority(p)}
                                    >
                                        <ButtonText color={priority === p ? 'white' : colors.text}>{p.toUpperCase()}</ButtonText>
                                    </Button>
                                ))}
                            </HStack>
                        </VStack>

                        <VStack sx={{ gap: Theme.spacing.xs }}>
                            <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '700' }} color={colors.text}>{t('teacher.feedback.content', 'Your Reflection')}</Text>
                            <Textarea
                                isReadOnly={false}
                                isInvalid={false}
                                isDisabled={false}
                                sx={{ backgroundColor: colors.secondary, minHeight: 100 }}
                            >
                                <TextareaInput
                                    placeholder={t('teacher.feedback.placeholder', 'Share your thoughts, resource needs, or concerns...')}
                                    value={content}
                                    onChangeText={setContent}
                                />
                            </Textarea>
                        </VStack>

                        <Box
                            sx={{
                                padding: Theme.spacing.sm,
                                backgroundColor: colors.tertiary,
                                borderRadius: Theme.corners.comfortable,
                                borderLeftWidth: 4,
                                borderLeftColor: Theme.colors.amberGlow
                            }}
                        >
                            <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: colors.textSecondary, fontStyle: 'italic' }}>
                                {t('teacher.feedback.note', 'This reflection will be surfaced on the Principal\'s Dashboard "Echo" vistas.')}
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}>
                        <Button
                            variant="outline"
                            onPress={onClose}
                            sx={{ flex: 1 }}
                        >
                            <ButtonText color={colors.text}>{t('common.cancel', 'Cancel')}</ButtonText>
                        </Button>
                        <Button
                            onPress={handleSubmit}
                            isDisabled={isSubmitting || !content.trim()}
                            sx={{ flex: 2, backgroundColor: colors.action }}
                        >
                            {isSubmitting ? <Spinner color="white" /> : <ButtonText color="white">{t('common.send', 'Send to Principal')}</ButtonText>}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
