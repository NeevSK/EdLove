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

import React, { useState, useEffect } from 'react';
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
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { marksToGPA } from '../utils/grading';
import Theme from '../constants/Theme';

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
        <VStack space="lg" p="$4">
            {/* Student Name Header */}
            <VStack space="xs">
                <Text size="sm" color={Theme.colors.slateGray}>
                    {t('grades.student')}
                </Text>
                <Heading size="lg" color={Theme.colors.charcoalTruth}>
                    {studentName}
                </Heading>
            </VStack>

            {/* Marks Input */}
            <VStack space="xs">
                <Text size="sm" color={Theme.colors.slateGray}>
                    {t('grades.marks')} *
                </Text>
                <Input
                    variant="outline"
                    size="md"
                    sx={{
                        borderColor: error ? Theme.colors.emberRed : Theme.colors.sandStone,
                        borderRadius: Theme.corners.comfortable,
                    }}
                >
                    <InputField
                        placeholder="0-100"
                        keyboardType="numeric"
                        value={marks}
                        onChangeText={(val) => {
                            setMarks(val);
                            setError('');
                        }}
                        color={Theme.colors.charcoalTruth}
                    />
                </Input>
                {error && (
                    <Text size="xs" color={Theme.colors.emberRed}>
                        {error}
                    </Text>
                )}
            </VStack>

            {/* Auto-computed GPA Preview */}
            {showGPA && marks !== '' && marksNumber > 0 && (
                <Box
                    p="$3"
                    sx={{
                        backgroundColor: Theme.colors.creamSilence,
                        borderRadius: Theme.corners.comfortable,
                        borderWidth: 1,
                        borderColor: Theme.colors.sandStone,
                    }}
                >
                    <HStack space="md" alignItems="center" justifyContent="space-between">
                        <VStack>
                            <Text size="xs" color={Theme.colors.slateGray}>
                                {t('grades.grade')}
                            </Text>
                            <Text size="2xl" bold color={Theme.colors.sanctuarySaffron}>
                                {grade}
                            </Text>
                        </VStack>
                        <VStack alignItems="flex-end">
                            <Text size="xs" color={Theme.colors.slateGray}>
                                {t('grades.gpa')}
                            </Text>
                            <Text size="2xl" bold color={Theme.colors.sanctuarySaffron}>
                                {gpa.toFixed(1)}
                            </Text>
                        </VStack>
                    </HStack>
                </Box>
            )}

            {/* Feedback Textarea */}
            <VStack space="xs">
                <Text size="sm" color={Theme.colors.slateGray}>
                    {t('grades.feedback')} ({t('grades.optional')})
                </Text>
                <Textarea
                    size="md"
                    sx={{
                        borderColor: Theme.colors.sandStone,
                        borderRadius: Theme.corners.comfortable,
                        minHeight: 100,
                    }}
                >
                    <TextareaInput
                        placeholder={t('grades.feedbackPlaceholder')}
                        value={feedback}
                        onChangeText={setFeedback}
                        color={Theme.colors.charcoalTruth}
                    />
                </Textarea>
            </VStack>

            {/* Action Buttons */}
            <HStack space="md" mt="$4">
                {onCancel && (
                    <Button
                        variant="outline"
                        sx={{
                            flex: 1,
                            borderColor: Theme.colors.sandStone,
                            borderRadius: Theme.corners.comfortable,
                        }}
                        onPress={onCancel}
                    >
                        <ButtonText color={Theme.colors.slateGray}>
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
                    <ButtonText color={Theme.colors.white}>
                        {t('common.save')}
                    </ButtonText>
                </Button>
            </HStack>
        </VStack>
    );
}
