/**
 * GRADE ENTRY FORM COMPONENT
 * 
 * Form for teachers to enter student grades.
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
    Theme
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { marksToGPA } from '@repo/core';

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
        <VStack sx={{ gap: Theme.spacing.lg, padding: Theme.spacing.md }}>
            {/* Student Name Header */}
            <VStack sx={{ gap: Theme.spacing.xs }}>
                <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: Theme.colors.slateGray }}>
                    {t('grades.student')}
                </Text>
                <Heading sx={{ fontSize: Theme.typography.fontSize.lg, color: Theme.colors.charcoalTruth }}>
                    {studentName}
                </Heading>
            </VStack>

            {/* Marks Input */}
            <VStack sx={{ gap: Theme.spacing.xs }}>
                <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: Theme.colors.slateGray }}>
                    {t('grades.marks')} *
                </Text>
                <Input
                    sx={{
                        borderColor: error ? Theme.colors.emberRed : Theme.colors.sandStone,
                        borderWidth: 1,
                        borderRadius: Theme.corners.comfortable,
                        height: 45
                    }}
                >
                    <InputField
                        placeholder="0-100"
                        keyboardType="numeric"
                        value={marks}
                        onChangeText={(val: string) => {
                            setMarks(val);
                            setError('');
                        }}
                        sx={{ color: Theme.colors.charcoalTruth }}
                    />
                </Input>
                {error && (
                    <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: Theme.colors.emberRed }}>
                        {error}
                    </Text>
                )}
            </VStack>

            <Box
                sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: Theme.colors.creamSilence,
                    borderRadius: Theme.corners.comfortable,
                    borderWidth: 1,
                    borderColor: Theme.colors.sandStone,
                }}
            >
                <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center', justifyContent: 'space-between' }}>
                    <VStack>
                        <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: Theme.colors.slateGray }}>
                            {t('grades.grade')}
                        </Text>
                        <Text sx={{ fontSize: Theme.typography.fontSize['2xl'], fontWeight: '700' as any, color: Theme.colors.sanctuarySaffron }}>
                            {grade}
                        </Text>
                    </VStack>
                    <VStack sx={{ alignItems: 'flex-end' }}>
                        <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: Theme.colors.slateGray }}>
                            {t('grades.gpa')}
                        </Text>
                        <Text sx={{ fontSize: Theme.typography.fontSize['2xl'], fontWeight: '700' as any, color: Theme.colors.sanctuarySaffron }}>
                            {gpa.toFixed(1)}
                        </Text>
                    </VStack>
                </HStack>
            </Box>

            {/* Feedback Textarea */}
            <VStack sx={{ gap: Theme.spacing.xs }}>
                <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: Theme.colors.slateGray }}>
                    {t('grades.feedback')} ({t('grades.optional')})
                </Text>
                <Textarea
                    sx={{
                        borderColor: Theme.colors.sandStone,
                        borderWidth: 1,
                        borderRadius: Theme.corners.comfortable,
                        minHeight: 100,
                    }}
                >
                    <TextareaInput
                        placeholder={t('grades.feedbackPlaceholder')}
                        value={feedback}
                        onChangeText={setFeedback}
                        sx={{ color: Theme.colors.charcoalTruth }}
                    />
                </Textarea>
            </VStack>

            {/* Action Buttons */}
            <HStack sx={{ gap: Theme.spacing.md, marginTop: Theme.spacing.md }}>
                {onCancel && (
                    <Button
                        sx={{
                            flex: 1,
                            borderColor: Theme.colors.sandStone,
                            borderWidth: 1,
                            backgroundColor: 'transparent',
                            borderRadius: Theme.corners.comfortable,
                        }}
                        onPress={onCancel}
                    >
                        <ButtonText sx={{ color: Theme.colors.slateGray }}>
                            {t('common.cancel')}
                        </ButtonText>
                    </Button>
                )}
                <Button
                    sx={{
                        flex: 2,
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        borderRadius: Theme.corners.comfortable,
                    }}
                    onPress={handleSave}
                >
                    <ButtonText sx={{ color: Theme.colors.white }}>
                        {t('common.save')}
                    </ButtonText>
                </Button>
            </HStack>
        </VStack>
    );
}
