import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BulkStudent } from '@repo/core';
import {
    useThemedColors,
    hapticLight,
    hapticSuccess,
    Box,
    HStack,
    VStack,
    Text,
    Heading,
    Pressable,
    Input,
    InputField,
    Button,
    ButtonText,
    useToast,
    Toast,
    ToastTitle,
    ScrollView,
    Theme,
    Textarea,
    TextareaInput,
    SanctuaryToast
} from '@repo/ui';
import {
    X,
    Trash2,
    Save,
    Plus,
    ChevronLeft,
    ChevronRight
} from 'lucide-react-native';

interface BulkStudentCreationProps {
    onStudentsCreated: (students: BulkStudent[]) => void;
    onCancel: () => void;
}

export default function BulkStudentCreation({ onStudentsCreated, onCancel }: BulkStudentCreationProps) {
    const { t } = useTranslation();
    const [totalCount, setTotalCount] = useState<string>('');
    const [students, setStudents] = useState<BulkStudent[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [step, setStep] = useState<'count' | 'entry' | 'review'>('count');
    const toast = useToast();
    const colors = useThemedColors();

    // Initialize student entries
    const handleSetCount = () => {
        const count = parseInt(totalCount);

        if (isNaN(count) || count < 1 || count > 100) {
            toast.show({
                placement: 'top',
                render: ({ id }: { id: string }) => (
                    <SanctuaryToast
                        message={t('bulk_creation.errors.invalidNumber') || 'Please enter a number between 1 and 100'}
                        type="error"
                        visible
                        onHide={() => toast.close(id)}
                    />
                ),
            });
            return;
        }

        hapticLight();

        // Initialize array of empty students
        const initialStudents: BulkStudent[] = Array.from({ length: count }, (_, i) => ({
            name: '',
            index_number: '',
            notes: '',
        }));

        setStudents(initialStudents);
        setCurrentIndex(0);
        setStep('entry');
    };

    // Quick add: Save current and move to next
    const handleQuickAdd = () => {
        const current = students[currentIndex];

        if (!current || !current.name.trim() || !current.index_number.trim()) {
            toast.show({
                placement: 'top',
                render: ({ id }: { id: string }) => (
                    <SanctuaryToast
                        message={t('bulk_creation.errors.requiredFields') || 'Name and Index are required'}
                        type="error"
                        visible
                        onHide={() => toast.close(id)}
                    />
                ),
            });
            return;
        }

        hapticLight();

        if (currentIndex < students.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // All students entered, go to review
            setStep('review');
        }
    };

    // Skip to next student
    const handleSkip = () => {
        hapticLight();
        if (currentIndex < students.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    // Go to previous student
    const handlePrevious = () => {
        hapticLight();
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Update current student
    const updateStudent = (field: keyof BulkStudent, value: string) => {
        const updated = [...students];
        const student = updated[currentIndex];
        if (!student) return;

        updated[currentIndex] = {
            ...student,
            [field]: value,
        };
        setStudents(updated);
    };

    // Remove a student from the list
    const handleRemoveStudent = (index: number) => {
        hapticLight();
        const updated = students.filter((_, i) => i !== index);
        setStudents(updated);

        if (updated.length === 0) {
            setStep('count');
            setTotalCount('');
        } else if (currentIndex >= updated.length) {
            setCurrentIndex(updated.length - 1);
        }
    };

    // Add one more student
    const handleAddOne = () => {
        hapticLight();
        setStudents([...students, { name: '', index_number: '', notes: '' }]);
        setCurrentIndex(students.length); // Move to the new one
        setStep('entry');
    };

    // Confirm and submit
    const handleConfirm = () => {
        // Filter out empty entries
        const validStudents = students.filter(s => s.name.trim() && s.index_number.trim());

        if (validStudents.length === 0) {
            toast.show({
                placement: 'top',
                render: ({ id }: { id: string }) => (
                    <SanctuaryToast
                        message={t('bulk_creation.errors.noValidStudents') || 'No valid students to add'}
                        type="error"
                        visible
                        onHide={() => toast.close(id)}
                    />
                ),
            });
            return;
        }

        hapticSuccess();
        onStudentsCreated(validStudents);
    };

    const currentStudent = students[currentIndex];
    const validStudentsCount = students.filter(s => s.name.trim() && s.index_number.trim()).length;

    return (
        <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
            {/* Header */}
            <HStack sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: Theme.spacing.xl,
                paddingTop: 48,
                paddingBottom: Theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border
            }}>
                <Heading sx={{ color: Theme.colors.templeGold, fontSize: Theme.typography.fontSize.xl }}>
                    {t('bulk_creation.title') || 'Bulk Add Students'}
                </Heading>
                <Pressable onPress={() => { hapticLight(); onCancel(); }}>
                    <X size={24} color={colors.textSecondary} />
                </Pressable>
            </HStack>

            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ padding: Theme.spacing.xl, paddingBottom: 120 }}>
                {/* Step 1: Enter total count */}
                {step === 'count' && (
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md, textAlign: 'center' }}>
                            {t('bulk_creation.howMany') || 'How many students do you want to add?'}
                        </Text>

                        <Input sx={{
                            borderColor: colors.border,
                            borderRadius: Theme.corners.comfortable,
                            backgroundColor: colors.surface,
                        }}>
                            <InputField
                                placeholder={t('bulk_creation.countPlaceholder') || "Enter number (e.g., 35)"}
                                value={totalCount}
                                onChangeText={setTotalCount}
                                keyboardType="number-pad"
                                sx={{
                                    color: colors.text,
                                    fontSize: 24,
                                    textAlign: 'center'
                                }}
                            />
                        </Input>

                        <Button
                            size="lg"
                            onPress={handleSetCount}
                            sx={{
                                backgroundColor: Theme.colors.templeGold,
                                borderRadius: Theme.corners.comfortable,
                            }}
                        >
                            <ButtonText color={Theme.colors.ink}>
                                {t('bulk_creation.startEntry') || 'Start Entry'}
                            </ButtonText>
                        </Button>

                        <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs, textAlign: 'center' }}>
                            {t('bulk_creation.maxLimit') || 'Maximum 100 students at once'}
                        </Text>
                    </VStack>
                )}

                {/* Step 2: Enter student details */}
                {step === 'entry' && currentStudent && (
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        {/* Progress */}
                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>
                                {t('bulk_creation.progress', { current: currentIndex + 1, total: students.length }) || `Student ${currentIndex + 1} of ${students.length}`}
                            </Text>
                            <Text sx={{ color: Theme.colors.templeGold, fontSize: Theme.typography.fontSize.xs, fontWeight: '600' }}>
                                {t('bulk_creation.completedCount', { count: validStudentsCount }) || `${validStudentsCount} completed`}
                            </Text>
                        </HStack>

                        {/* Progress Bar */}
                        <Box sx={{
                            height: 4,
                            backgroundColor: colors.surface,
                            borderRadius: 2,
                            overflow: 'hidden',
                        }}>
                            <Box sx={{
                                height: '100%',
                                width: `${((currentIndex + 1) / students.length) * 100}%`,
                                backgroundColor: Theme.colors.templeGold,
                            }} />
                        </Box>

                        {/* Name Input */}
                        <VStack sx={{ gap: Theme.spacing.xs }}>
                            <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md, fontWeight: '600' }}>
                                {t('bulk_creation.studentName') || 'Student Name *'}
                            </Text>
                            <Input sx={{
                                borderColor: colors.border,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: colors.surface,
                            }}>
                                <InputField
                                    placeholder={t('bulk_creation.namePlaceholder') || "Enter full name"}
                                    value={currentStudent.name}
                                    onChangeText={(value: string) => updateStudent('name', value)}
                                    sx={{ color: colors.text }}
                                />
                            </Input>
                        </VStack>

                        {/* Index Number Input */}
                        <VStack sx={{ gap: Theme.spacing.xs }}>
                            <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md, fontWeight: '600' }}>
                                {t('bulk_creation.indexNumber') || 'Index Number *'}
                            </Text>
                            <Input sx={{
                                borderColor: colors.border,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: colors.surface,
                            }}>
                                <InputField
                                    placeholder={t('bulk_creation.indexPlaceholder') || "Enter index number"}
                                    value={currentStudent.index_number}
                                    onChangeText={(value: string) => updateStudent('index_number', value)}
                                    sx={{ color: colors.text }}
                                />
                            </Input>
                        </VStack>

                        {/* Notes Input (Optional) */}
                        <VStack sx={{ gap: Theme.spacing.xs }}>
                            <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md }}>
                                {t('bulk_creation.optionalNotes') || 'Notes (Optional)'}
                            </Text>
                            <Textarea sx={{
                                borderColor: colors.border,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: colors.surface,
                                minHeight: 80,
                            }}>
                                <TextareaInput
                                    placeholder={t('bulk_creation.notesPlaceholder') || "Add any notes about this student..."}
                                    value={currentStudent.notes}
                                    onChangeText={(value: string) => updateStudent('notes', value)}
                                    sx={{ color: colors.text, textAlignVertical: 'top' }}
                                />
                            </Textarea>
                        </VStack>

                        {/* Navigation Buttons */}
                        <HStack sx={{ gap: Theme.spacing.md }}>
                            <Button
                                size="md"
                                variant="outline"
                                onPress={handlePrevious}
                                isDisabled={currentIndex === 0}
                                sx={{
                                    flex: 1,
                                    borderColor: colors.border,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <ButtonText color={colors.textSecondary}>
                                    {t('bulk_creation.previous') || '← Previous'}
                                </ButtonText>
                            </Button>

                            <Button
                                size="md"
                                variant="outline"
                                onPress={handleSkip}
                                sx={{
                                    flex: 1,
                                    borderColor: colors.border,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <ButtonText color={colors.textSecondary}>
                                    {t('bulk_creation.skip') || 'Skip →'}
                                </ButtonText>
                            </Button>
                        </HStack>

                        {/* Save and Continue / Finish */}
                        <Button
                            size="lg"
                            onPress={handleQuickAdd}
                            sx={{
                                backgroundColor: Theme.colors.templeGold,
                                borderRadius: Theme.corners.comfortable,
                            }}
                        >
                            <ButtonText color={Theme.colors.ink}>
                                {currentIndex === students.length - 1
                                    ? (t('bulk_creation.finishReview') || 'Finish & Review')
                                    : (t('bulk_creation.saveNext') || 'Save & Next →')}
                            </ButtonText>
                        </Button>

                        {/* Review Button (anytime) */}
                        <Button
                            size="md"
                            variant="link"
                            onPress={() => { hapticLight(); setStep('review'); }}
                        >
                            <ButtonText color={colors.textSecondary}>
                                {t('bulk_creation.reviewAll', { count: validStudentsCount }) || `Review All (${validStudentsCount})`}
                            </ButtonText>
                        </Button>
                    </VStack>
                )}

                {/* Step 3: Review all students */}
                {step === 'review' && (
                    <VStack sx={{ gap: Theme.spacing.lg }}>
                        <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md, textAlign: 'center' }}>
                            {t('bulk_creation.reviewDesc') || 'Review all students before adding to classroom'}
                        </Text>

                        <Text sx={{ color: Theme.colors.templeGold, fontSize: Theme.typography.fontSize.lg, fontWeight: '600', textAlign: 'center' }}>
                            {t('bulk_creation.validCount', { count: validStudentsCount }) || `${validStudentsCount} valid student(s)`}
                        </Text>

                        {/* Student List */}
                        <VStack sx={{ gap: Theme.spacing.sm }}>
                            {students.map((student, index) => {
                                const isValid = student.name.trim() && student.index_number.trim();

                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            padding: Theme.spacing.md,
                                            backgroundColor: colors.surface,
                                            borderRadius: Theme.corners.comfortable,
                                            borderLeftWidth: 4,
                                            borderLeftColor: isValid ? Theme.colors.sageGreen : Theme.colors.emberRed,
                                            opacity: isValid ? 1 : 0.6,
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                        }}
                                    >
                                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <VStack sx={{ gap: Theme.spacing.xs, flex: 1 }}>
                                                <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>
                                                        #{index + 1}
                                                    </Text>
                                                    <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md, fontWeight: '700' }}>
                                                        {student.name || <Text sx={{ color: Theme.colors.emberRed }}>{t('bulk_creation.noName') || 'No name'}</Text>}
                                                    </Text>
                                                </HStack>
                                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>
                                                    {t('students.rollNumber') || 'Index'}: {student.index_number || <Text sx={{ color: Theme.colors.emberRed }}>{t('bulk_creation.noIndex') || 'No index'}</Text>}
                                                </Text>
                                                {student.notes && (
                                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs, fontStyle: 'italic' }}>
                                                        {student.notes}
                                                    </Text>
                                                )}
                                            </VStack>

                                            <HStack sx={{ gap: Theme.spacing.md }}>
                                                <Pressable
                                                    onPress={() => {
                                                        hapticLight();
                                                        setCurrentIndex(index);
                                                        setStep('entry');
                                                    }}
                                                >
                                                    <Text sx={{ color: Theme.colors.templeGold, fontSize: Theme.typography.fontSize.sm, fontWeight: '600' }}>
                                                        {t('common.edit') || 'Edit'}
                                                    </Text>
                                                </Pressable>
                                                <Pressable onPress={() => handleRemoveStudent(index)}>
                                                    <Trash2 size={18} color={Theme.colors.emberRed} />
                                                </Pressable>
                                            </HStack>
                                        </HStack>
                                    </Box>
                                );
                            })}
                        </VStack>

                        {/* Action Buttons */}
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <Button
                                size="lg"
                                onPress={handleAddOne}
                                variant="outline"
                                sx={{
                                    borderColor: Theme.colors.templeGold,
                                    borderRadius: Theme.corners.comfortable,
                                    borderWidth: 1,
                                }}
                            >
                                <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                    <Plus size={20} color={Theme.colors.templeGold} />
                                    <ButtonText color={Theme.colors.templeGold}>
                                        {t('bulk_creation.addOneMore') || 'Add One More'}
                                    </ButtonText>
                                </HStack>
                            </Button>

                            <Button
                                size="lg"
                                onPress={handleConfirm}
                                isDisabled={validStudentsCount === 0}
                                sx={{
                                    backgroundColor: validStudentsCount > 0
                                        ? Theme.colors.templeGold
                                        : colors.border,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                    <Save size={20} color={Theme.colors.ink} />
                                    <ButtonText color={Theme.colors.ink}>
                                        {t('bulk_creation.addStudentsAction', { count: validStudentsCount }) || `Add ${validStudentsCount} Student(s)`}
                                    </ButtonText>
                                </HStack>
                            </Button>

                            <Button
                                size="md"
                                variant="link"
                                onPress={() => { hapticLight(); setStep('entry'); }}
                            >
                                <ButtonText color={colors.textSecondary}>
                                    {t('bulk_creation.backToEntry') || '← Back to Entry'}
                                </ButtonText>
                            </Button>
                        </VStack>
                    </VStack>
                )}
            </ScrollView>
        </Box>
    );
}
