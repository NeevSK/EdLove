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
        <Box className="flex-1" style={{ backgroundColor: colors.primary }}>
            {/* Header */}
            <HStack className="justify-between items-center px-6 pt-12 pb-4 border-b" style={{ borderBottomColor: colors.border }}>
                <Heading className="text-xl text-[--templeGold]">
                    {t('bulk_creation.title') || 'Bulk Add Students'}
                </Heading>
                <Pressable onPress={() => { hapticLight(); onCancel(); }}>
                    <X size={24} color={colors.textSecondary} />
                </Pressable>
            </HStack>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
                {/* Step 1: Enter total count */}
                {step === 'count' && (
                    <VStack className="gap-4">
                        <Text className="text-base text-center" style={{ color: colors.text }}>
                            {t('bulk_creation.howMany') || 'How many students do you want to add?'}
                        </Text>

                        <Input className="rounded-xl border h-14 bg-[--silk]" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
                            <InputField
                                placeholder={t('bulk_creation.countPlaceholder') || "Enter number (e.g., 35)"}
                                value={totalCount}
                                onChangeText={setTotalCount}
                                keyboardType="number-pad"
                                className="text-2xl text-center"
                                style={{ color: colors.text }}
                            />
                        </Input>

                        <Button
                            size="lg"
                            onPress={handleSetCount}
                            className="rounded-xl bg-[--templeGold]"
                        >
                            <ButtonText className="text-[--ink]">
                                {t('bulk_creation.startEntry') || 'Start Entry'}
                            </ButtonText>
                        </Button>

                        <Text className="text-xs text-center" style={{ color: colors.textSecondary }}>
                            {t('bulk_creation.maxLimit') || 'Maximum 100 students at once'}
                        </Text>
                    </VStack>
                )}

                {/* Step 2: Enter student details */}
                {step === 'entry' && currentStudent && (
                    <VStack className="gap-4">
                        {/* Progress */}
                        <HStack className="justify-between items-center">
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                {t('bulk_creation.progress', { current: currentIndex + 1, total: students.length }) || `Student ${currentIndex + 1} of ${students.length}`}
                            </Text>
                            <Text className="text-xs font-semibold text-[--templeGold]">
                                {t('bulk_creation.completedCount', { count: validStudentsCount }) || `${validStudentsCount} completed`}
                            </Text>
                        </HStack>

                        {/* Progress Bar */}
                        <Box className="h-1 rounded-sm overflow-hidden" style={{ backgroundColor: colors.surface }}>
                            <Box 
                                className="h-full bg-[--templeGold]" 
                                style={{ width: `${((currentIndex + 1) / students.length) * 100}%` }} 
                            />
                        </Box>

                        {/* Name Input */}
                        <VStack className="gap-1">
                            <Text className="text-base font-semibold" style={{ color: colors.text }}>
                                {t('bulk_creation.studentName') || 'Student Name *'}
                            </Text>
                            <Input className="rounded-xl border bg-[--silk]" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
                                <InputField
                                    placeholder={t('bulk_creation.namePlaceholder') || "Enter full name"}
                                    value={currentStudent.name}
                                    onChangeText={(value: string) => updateStudent('name', value)}
                                    style={{ color: colors.text }}
                                />
                            </Input>
                        </VStack>

                        {/* Index Number Input */}
                        <VStack className="gap-1">
                            <Text className="text-base font-semibold" style={{ color: colors.text }}>
                                {t('bulk_creation.indexNumber') || 'Index Number *'}
                            </Text>
                            <Input className="rounded-xl border bg-[--silk]" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
                                <InputField
                                    placeholder={t('bulk_creation.indexPlaceholder') || "Enter index number"}
                                    value={currentStudent.index_number}
                                    onChangeText={(value: string) => updateStudent('index_number', value)}
                                    style={{ color: colors.text }}
                                />
                            </Input>
                        </VStack>

                        {/* Notes Input (Optional) */}
                        <VStack className="gap-1">
                            <Text className="text-base" style={{ color: colors.text }}>
                                {t('bulk_creation.optionalNotes') || 'Notes (Optional)'}
                            </Text>
                            <Textarea className="rounded-xl border bg-[--silk] min-h-[80px]" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
                                <TextareaInput
                                    placeholder={t('bulk_creation.notesPlaceholder') || "Add any notes about this student..."}
                                    value={currentStudent.notes}
                                    onChangeText={(value: string) => updateStudent('notes', value)}
                                    className="text-top"
                                    style={{ color: colors.text }}
                                />
                            </Textarea>
                        </VStack>

                        {/* Navigation Buttons */}
                        <HStack className="gap-4">
                            <Button
                                size="md"
                                variant="outline"
                                onPress={handlePrevious}
                                isDisabled={currentIndex === 0}
                                className="flex-1 rounded-xl"
                                style={{ borderColor: colors.border }}
                            >
                                <ButtonText style={{ color: colors.textSecondary }}>
                                    {t('bulk_creation.previous') || '← Previous'}
                                </ButtonText>
                            </Button>

                            <Button
                                size="md"
                                variant="outline"
                                onPress={handleSkip}
                                className="flex-1 rounded-xl"
                                style={{ borderColor: colors.border }}
                            >
                                <ButtonText style={{ color: colors.textSecondary }}>
                                    {t('bulk_creation.skip') || 'Skip →'}
                                </ButtonText>
                            </Button>
                        </HStack>

                        {/* Save and Continue / Finish */}
                        <Button
                            size="lg"
                            onPress={handleQuickAdd}
                            className="rounded-xl bg-[--templeGold]"
                        >
                            <ButtonText className="text-[--ink]">
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
                            <ButtonText style={{ color: colors.textSecondary }}>
                                {t('bulk_creation.reviewAll', { count: validStudentsCount }) || `Review All (${validStudentsCount})`}
                            </ButtonText>
                        </Button>
                    </VStack>
                )}

                {/* Step 3: Review all students */}
                {step === 'review' && (
                    <VStack className="gap-6">
                        <Text className="text-base text-center" style={{ color: colors.text }}>
                            {t('bulk_creation.reviewDesc') || 'Review all students before adding to classroom'}
                        </Text>

                        <Text className="text-lg font-semibold text-center text-[--templeGold]">
                            {t('bulk_creation.validCount', { count: validStudentsCount }) || `${validStudentsCount} valid student(s)`}
                        </Text>

                        {/* Student List */}
                        <VStack className="gap-2">
                            {students.map((student, index) => {
                                const isValid = student.name.trim() && student.index_number.trim();

                                return (
                                    <Box
                                        key={index}
                                        className="p-4 rounded-xl border-l-4 border"
                                        style={{
                                            backgroundColor: colors.surface,
                                            borderLeftColor: isValid ? Theme.colors.sageGreen : Theme.colors.emberRed,
                                            opacity: isValid ? 1 : 0.6,
                                            borderColor: colors.border,
                                        }}
                                    >
                                        <HStack className="justify-between items-start">
                                            <VStack className="gap-1 flex-1">
                                                <HStack className="gap-1 items-center">
                                                    <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                                        #{index + 1}
                                                    </Text>
                                                    <Text className="text-base font-bold" style={{ color: colors.text }}>
                                                        {student.name || <Text className="text-[--emberRed]">{t('bulk_creation.noName') || 'No name'}</Text>}
                                                    </Text>
                                                </HStack>
                                                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                                    {t('students.rollNumber') || 'Index'}: {student.index_number || <Text className="text-[--emberRed]">{t('bulk_creation.noIndex') || 'No index'}</Text>}
                                                </Text>
                                                {student.notes && (
                                                    <Text className="text-xs italic" style={{ color: colors.textSecondary }}>
                                                        {student.notes}
                                                    </Text>
                                                )}
                                            </VStack>

                                            <HStack className="gap-4">
                                                <Pressable
                                                    onPress={() => {
                                                        hapticLight();
                                                        setCurrentIndex(index);
                                                        setStep('entry');
                                                    }}
                                                >
                                                    <Text className="text-sm font-semibold text-[--templeGold]">
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
                        <VStack className="gap-4">
                            <Button
                                size="lg"
                                onPress={handleAddOne}
                                variant="outline"
                                className="rounded-xl border"
                                style={{ borderColor: Theme.colors.templeGold }}
                            >
                                <HStack className="gap-2 items-center">
                                    <Plus size={20} color={Theme.colors.templeGold} />
                                    <ButtonText className="text-[--templeGold]">
                                        {t('bulk_creation.addOneMore') || 'Add One More'}
                                    </ButtonText>
                                </HStack>
                            </Button>

                            <Button
                                size="lg"
                                onPress={handleConfirm}
                                isDisabled={validStudentsCount === 0}
                                className={`rounded-xl ${validStudentsCount > 0 ? 'bg-[--templeGold]' : ''}`}
                                style={{
                                    backgroundColor: validStudentsCount > 0
                                        ? Theme.colors.templeGold
                                        : colors.border
                                }}
                            >
                                <HStack className="gap-2 items-center">
                                    <Save size={20} color={Theme.colors.ink} />
                                    <ButtonText className="text-[--ink]">
                                        {t('bulk_creation.addStudentsAction', { count: validStudentsCount }) || `Add ${validStudentsCount} Student(s)`}
                                    </ButtonText>
                                </HStack>
                            </Button>

                            <Button
                                size="md"
                                variant="link"
                                onPress={() => { hapticLight(); setStep('entry'); }}
                            >
                                <ButtonText style={{ color: colors.textSecondary }}>
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
