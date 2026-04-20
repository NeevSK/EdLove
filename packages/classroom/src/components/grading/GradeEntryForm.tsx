/**
 * GRADE ENTRY FORM COMPONENT
 * 
 * Form for teachers to enter student grades.
 * Features:
 * - Student name display
 * - Marks input (0-100, numeric keyboard)
 * - Auto-computed GPA preview
 * - Feedback textarea (optional)
 * - Save button
 */

import React, { useState } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    Input,
    InputField,
    Textarea,
    TextareaInput,
    Button,
    ButtonText,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { marksToGPA } from '@repo/analytics';

interface GradeEntryFormProps {
    studentName: string;
    initialMarks?: number;
    initialFeedback?: string;
    showGPA?: boolean;
    onSave: (marks: number, feedback: string) => void;
    onCancel?: () => void;
}

export default function GradeEntryForm({
    studentName,
    initialMarks = 0,
    initialFeedback = '',
    showGPA = true,
    onSave,
    onCancel,
}: GradeEntryFormProps) {
    const { t } = useTranslation();
    const [marks, setMarks] = useState(initialMarks.toString());
    const [feedback, setFeedback] = useState(initialFeedback);
    const [error, setError] = useState('');

    const marksNumber = marks === '' ? 0 : (parseFloat(marks) || 0);
    const { grade, gpa } = marksToGPA(marksNumber);

    const handleSave = () => {
        const marksValue = parseFloat(marks);

        // Validation
        if (isNaN(marksValue) || marksValue < 0 || marksValue > 100) {
            setError(t('grades.invalidMarks'));
            return;
        }

        setError('');
        onSave(marksValue, feedback);
    };

    return (
        <VStack className="gap-8 p-6 bg-sanctuary-surface rounded-[32px] border border-sanctuary-border shadow-md">
            {/* Student Name Header */}
            <VStack className="gap-1.5">
                <Text className="text-[10px] font-black text-sanctuary-text-tertiary uppercase tracking-[0.2em]">
                    {t('grades.student')}
                </Text>
                <Heading className="text-3xl font-black text-sanctuary-text -ml-0.5">
                    {studentName}
                </Heading>
            </VStack>

            {/* Marks Input */}
            <VStack className="gap-3">
                <Text className="text-[11px] font-black text-sanctuary-text-secondary uppercase tracking-[0.15em] ml-1">
                    {t('grades.marks')} *
                </Text>
                <Input
                    className={`h-16 px-5 bg-sanctuary-surface-secondary/50 rounded-[24px] border ${error ? 'border-sanctuary-error' : 'border-sanctuary-border'}`}
                >
                    <InputField
                        placeholder="0-100"
                        keyboardType="numeric"
                        value={marks}
                        onChangeText={(val: string) => {
                            setMarks(val);
                            setError('');
                        }}
                        className="text-sanctuary-text font-black text-xl"
                    />
                </Input>
                {error && (
                    <Text className="text-[10px] font-black text-sanctuary-error uppercase tracking-wider ml-2">
                        {error}
                    </Text>
                )}
            </VStack>

            {/* Auto-computed GPA Preview */}
            {showGPA && marks !== '' && marksNumber > 0 && (
                <Box className="p-7 bg-sanctuarySaffron/5 rounded-[28px] border border-sanctuarySaffron/20 overflow-hidden relative">
                    <HStack className="justify-between items-center relative z-10">
                        <VStack className="gap-1.5">
                            <Text className="text-[10px] font-black text-sanctuarySaffron uppercase tracking-[0.2em]">
                                {t('grades.grade')}
                            </Text>
                            <Text className="text-4xl font-black text-sanctuarySaffron">
                                {grade}
                            </Text>
                        </VStack>
                        <VStack className="gap-1.5 items-end">
                            <Text className="text-[10px] font-black text-sanctuarySaffron uppercase tracking-[0.2em]">
                                {t('grades.gpa')}
                            </Text>
                            <Text className="text-4xl font-black text-sanctuarySaffron">
                                {gpa.toFixed(1)}
                            </Text>
                        </VStack>
                    </HStack>
                    <Box className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-sanctuarySaffron/10 opacity-20" />
                </Box>
            )}

            {/* Feedback Textarea */}
            <VStack className="gap-3">
                <Text className="text-[11px] font-black text-sanctuary-text-secondary uppercase tracking-[0.15em] ml-1">
                    {t('grades.feedback')} <Text className="lowercase opacity-40">({t('grades.optional')})</Text>
                </Text>
                <Textarea
                    className="min-h-[140px] px-5 py-4 bg-sanctuary-surface-secondary/50 rounded-[28px] border border-sanctuary-border"
                >
                    <TextareaInput
                        placeholder={t('grades.feedbackPlaceholder')}
                        value={feedback}
                        onChangeText={setFeedback}
                        className="text-sanctuary-text font-black text-base"
                    />
                </Textarea>
            </VStack>

            {/* Action Buttons */}
            <HStack className="gap-4 pt-2">
                {onCancel && (
                    <Button
                        variant="outline"
                        className="flex-1 h-14 rounded-full border-sanctuary-border bg-sanctuary-surface shadow-sm active:bg-sanctuary-surface-secondary"
                        onPress={onCancel}
                    >
                        <ButtonText className="text-sanctuary-text-secondary font-black uppercase text-[11px] tracking-[0.2em]">
                            {t('common.cancel')}
                        </ButtonText>
                    </Button>
                )}
                <Button
                    className="flex-[1.5] h-14 bg-sanctuarySaffron rounded-full shadow-lg shadow-sanctuarySaffron/20 active:opacity-85"
                    onPress={handleSave}
                >
                    <ButtonText className="text-sacredWhite font-black uppercase text-[11px] tracking-[0.2em]">
                        {t('common.save')}
                    </ButtonText>
                </Button>
            </HStack>
        </VStack>
    );
}
