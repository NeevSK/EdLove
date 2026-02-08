// Bulk Student Creation Component (Manual Entry)
// Fallback option when OCR doesn't work or user prefers manual entry

import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    InputField,
    Button,
    ButtonText,
    Text,
    Heading,
    ScrollView,
    Pressable,
    Textarea,
    TextareaInput,
    useToast,
    Toast,
    ToastTitle,
} from '@gluestack-ui/themed';
import { X, Plus, Trash2, Save } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { hapticLight, hapticSuccess } from '../../utils/haptics';

export interface BulkStudent {
    name: string;
    index_number: string;
    notes?: string;
}

interface BulkStudentCreationProps {
    onStudentsCreated: (students: BulkStudent[]) => void;
    onCancel: () => void;
}

export default function BulkStudentCreation({ onStudentsCreated, onCancel }: BulkStudentCreationProps) {
    const [totalCount, setTotalCount] = useState<string>('');
    const [students, setStudents] = useState<BulkStudent[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [step, setStep] = useState<'count' | 'entry' | 'review'>('count');
    const toast = useToast();

    // Initialize student entries
    const handleSetCount = () => {
        const count = parseInt(totalCount);
        
        if (isNaN(count) || count < 1 || count > 100) {
            toast.show({
                placement: 'bottom',
                render: ({ id }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>Please enter a number between 1 and 100</ToastTitle>
                    </Toast>
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
        
        if (!current.name.trim() || !current.index_number.trim()) {
            toast.show({
                placement: 'bottom',
                render: ({ id }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>Name and Index are required</ToastTitle>
                    </Toast>
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
        updated[currentIndex] = {
            ...updated[currentIndex],
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
                placement: 'bottom',
                render: ({ id }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>No valid students to add</ToastTitle>
                    </Toast>
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
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            {/* Header */}
            <HStack 
                px="$6" 
                pt="$12" 
                pb="$4" 
                justifyContent="space-between" 
                alignItems="center"
                borderBottomWidth={1}
                borderBottomColor={Theme.colors.mistGray}
            >
                <Heading color={Theme.colors.sanctuarySaffron} size="xl">
                    Bulk Add Students
                </Heading>
                <Pressable onPress={onCancel}>
                    <X size={24} color={Theme.colors.mistGray} />
                </Pressable>
            </HStack>

            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
                {/* Step 1: Enter total count */}
                {step === 'count' && (
                    <VStack space="lg">
                        <Text color={Theme.colors.pearlGray} size="md" textAlign="center">
                            How many students do you want to add?
                        </Text>

                        <Input
                            variant="outline"
                            size="xl"
                            sx={{
                                borderColor: Theme.colors.mistGray,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: Theme.colors.deepIndigo,
                            }}
                        >
                            <InputField
                                placeholder="Enter number (e.g., 35)"
                                value={totalCount}
                                onChangeText={setTotalCount}
                                keyboardType="number-pad"
                                color={Theme.colors.sacredWhite}
                                placeholderTextColor={Theme.colors.dimGray}
                                fontSize={24}
                                textAlign="center"
                            />
                        </Input>

                        <Button
                            size="lg"
                            onPress={handleSetCount}
                            sx={{
                                backgroundColor: Theme.colors.sanctuarySaffron,
                                borderRadius: Theme.corners.comfortable,
                            }}
                        >
                            <ButtonText>Start Entry</ButtonText>
                        </Button>

                        <Text color={Theme.colors.mistGray} size="sm" textAlign="center">
                            Maximum 100 students at once
                        </Text>
                    </VStack>
                )}

                {/* Step 2: Enter student details */}
                {step === 'entry' && currentStudent && (
                    <VStack space="lg">
                        {/* Progress */}
                        <HStack justifyContent="space-between" alignItems="center">
                            <Text color={Theme.colors.mistGray} size="sm">
                                Student {currentIndex + 1} of {students.length}
                            </Text>
                            <Text color={Theme.colors.sanctuarySaffron} size="sm" fontWeight="$semibold">
                                {validStudentsCount} completed
                            </Text>
                        </HStack>

                        {/* Progress Bar */}
                        <Box
                            sx={{
                                height: 4,
                                backgroundColor: Theme.colors.deepIndigo,
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                sx={{
                                    height: '100%',
                                    width: `${((currentIndex + 1) / students.length) * 100}%`,
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                }}
                            />
                        </Box>

                        {/* Name Input */}
                        <VStack space="xs">
                            <Text color={Theme.colors.sacredWhite} size="md" fontWeight="$semibold">
                                Student Name *
                            </Text>
                            <Input
                                variant="outline"
                                size="lg"
                                sx={{
                                    borderColor: Theme.colors.mistGray,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: Theme.colors.deepIndigo,
                                }}
                            >
                                <InputField
                                    placeholder="Enter full name"
                                    value={currentStudent.name}
                                    onChangeText={(value) => updateStudent('name', value)}
                                    color={Theme.colors.sacredWhite}
                                    placeholderTextColor={Theme.colors.dimGray}
                                />
                            </Input>
                        </VStack>

                        {/* Index Number Input */}
                        <VStack space="xs">
                            <Text color={Theme.colors.sacredWhite} size="md" fontWeight="$semibold">
                                Index Number *
                            </Text>
                            <Input
                                variant="outline"
                                size="lg"
                                sx={{
                                    borderColor: Theme.colors.mistGray,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: Theme.colors.deepIndigo,
                                }}
                            >
                                <InputField
                                    placeholder="Enter index number"
                                    value={currentStudent.index_number}
                                    onChangeText={(value) => updateStudent('index_number', value)}
                                    color={Theme.colors.sacredWhite}
                                    placeholderTextColor={Theme.colors.dimGray}
                                />
                            </Input>
                        </VStack>

                        {/* Notes Input (Optional) */}
                        <VStack space="xs">
                            <Text color={Theme.colors.sacredWhite} size="md">
                                Notes (Optional)
                            </Text>
                            <Textarea
                                size="md"
                                sx={{
                                    borderColor: Theme.colors.mistGray,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: Theme.colors.deepIndigo,
                                    minHeight: 80,
                                }}
                            >
                                <TextareaInput
                                    placeholder="Add any notes about this student..."
                                    value={currentStudent.notes}
                                    onChangeText={(value) => updateStudent('notes', value)}
                                    color={Theme.colors.sacredWhite}
                                    placeholderTextColor={Theme.colors.dimGray}
                                />
                            </Textarea>
                        </VStack>

                        {/* Navigation Buttons */}
                        <HStack space="md">
                            <Button
                                size="md"
                                variant="outline"
                                onPress={handlePrevious}
                                isDisabled={currentIndex === 0}
                                flex={1}
                                sx={{
                                    borderColor: Theme.colors.mistGray,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>← Previous</ButtonText>
                            </Button>

                            <Button
                                size="md"
                                variant="outline"
                                onPress={handleSkip}
                                flex={1}
                                sx={{
                                    borderColor: Theme.colors.mistGray,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>Skip →</ButtonText>
                            </Button>
                        </HStack>

                        {/* Save and Continue / Finish */}
                        <Button
                            size="lg"
                            onPress={handleQuickAdd}
                            sx={{
                                backgroundColor: Theme.colors.sanctuarySaffron,
                                borderRadius: Theme.corners.comfortable,
                            }}
                        >
                            <ButtonText>
                                {currentIndex === students.length - 1 ? 'Finish & Review' : 'Save & Next →'}
                            </ButtonText>
                        </Button>

                        {/* Review Button (anytime) */}
                        <Button
                            size="md"
                            variant="link"
                            onPress={() => setStep('review')}
                        >
                            <ButtonText color={Theme.colors.mistGray}>Review All ({validStudentsCount})</ButtonText>
                        </Button>
                    </VStack>
                )}

                {/* Step 3: Review all students */}
                {step === 'review' && (
                    <VStack space="lg">
                        <Text color={Theme.colors.pearlGray} size="md" textAlign="center">
                            Review all students before adding to classroom
                        </Text>

                        <Text color={Theme.colors.sanctuarySaffron} size="lg" fontWeight="$semibold" textAlign="center">
                            {validStudentsCount} valid student(s)
                        </Text>

                        {/* Student List */}
                        <VStack space="sm">
                            {students.map((student, index) => {
                                const isValid = student.name.trim() && student.index_number.trim();
                                
                                return (
                                    <Box
                                        key={index}
                                        p="$4"
                                        sx={{
                                            backgroundColor: Theme.colors.deepIndigo,
                                            borderRadius: Theme.corners.comfortable,
                                            borderLeftWidth: 4,
                                            borderLeftColor: isValid ? Theme.colors.sageGreen : Theme.colors.emberRed,
                                            opacity: isValid ? 1 : 0.6,
                                        }}
                                    >
                                        <HStack justifyContent="space-between" alignItems="flex-start">
                                            <VStack space="xs" flex={1}>
                                                <HStack space="xs" alignItems="center">
                                                    <Text color={Theme.colors.mistGray} size="xs">
                                                        #{index + 1}
                                                    </Text>
                                                    <Text color={Theme.colors.sacredWhite} size="md" fontWeight="$semibold">
                                                        {student.name || <Text color={Theme.colors.emberRed}>No name</Text>}
                                                    </Text>
                                                </HStack>
                                                <Text color={Theme.colors.mistGray} size="sm">
                                                    Index: {student.index_number || <Text color={Theme.colors.emberRed}>No index</Text>}
                                                </Text>
                                                {student.notes && (
                                                    <Text color={Theme.colors.mistGray} size="sm">
                                                        {student.notes}
                                                    </Text>
                                                )}
                                            </VStack>
                                            
                                            <HStack space="sm">
                                                <Pressable 
                                                    onPress={() => {
                                                        setCurrentIndex(index);
                                                        setStep('entry');
                                                    }}
                                                >
                                                    <Text color={Theme.colors.sanctuarySaffron} size="sm">Edit</Text>
                                                </Pressable>
                                                <Pressable onPress={() => handleRemoveStudent(index)}>
                                                    <Trash2 size={16} color={Theme.colors.emberRed} />
                                                </Pressable>
                                            </HStack>
                                        </HStack>
                                    </Box>
                                );
                            })}
                        </VStack>

                        {/* Action Buttons */}
                        <VStack space="md">
                            <Button
                                size="lg"
                                onPress={handleAddOne}
                                variant="outline"
                                sx={{
                                    borderColor: Theme.colors.sanctuarySaffron,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <Plus size={20} color={Theme.colors.sanctuarySaffron} style={{ marginRight: 8 }} />
                                <ButtonText color={Theme.colors.sanctuarySaffron}>Add One More</ButtonText>
                            </Button>

                            <Button
                                size="lg"
                                onPress={handleConfirm}
                                isDisabled={validStudentsCount === 0}
                                sx={{
                                    backgroundColor: validStudentsCount > 0 
                                        ? Theme.colors.sanctuarySaffron 
                                        : Theme.colors.mistGray,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <Save size={20} color={Theme.colors.white} style={{ marginRight: 8 }} />
                                <ButtonText>Add {validStudentsCount} Student(s)</ButtonText>
                            </Button>

                            <Button
                                size="md"
                                variant="link"
                                onPress={() => setStep('entry')}
                            >
                                <ButtonText color={Theme.colors.mistGray}>← Back to Entry</ButtonText>
                            </Button>
                        </VStack>
                    </VStack>
                )}
            </ScrollView>
        </Box>
    );
}
