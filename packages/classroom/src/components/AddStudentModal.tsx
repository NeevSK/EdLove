/**
 * ADD STUDENT MODAL
 * 
 * Modal for adding or editing a student in a classroom.
 */

import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import {
    VStack,
    HStack,
    Text,
    Button,
    ButtonText,
    Input,
    InputField,
    SanctuaryModal,
    Theme,
    useToast,
    SanctuaryToast,
    useThemedColors,
    ScrollView
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { studentsAPI } from '@repo/core';
import type { Student } from '@repo/core';
import OCRStudentImport from './OCRStudentImport';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    classroomId: string;
    studentToEdit: Student | null;
}

type AddStudentTab = 'manual' | 'scan';

export const AddStudentModal = ({
    isOpen,
    onClose,
    onSuccess,
    classroomId,
    studentToEdit,
}: AddStudentModalProps) => {
    const { t } = useTranslation();
    const toast = useToast();
    
    const [activeTab, setActiveTab] = useState<AddStudentTab>('manual');
    const [fullName, setFullName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (studentToEdit) {
            setFullName(studentToEdit.full_name);
            setRollNumber(studentToEdit.roll_number || '');
            setNotes(studentToEdit.notes || '');
        } else {
            setFullName('');
            setRollNumber('');
            setNotes('');
        }
    }, [studentToEdit, isOpen]);

    const handleSave = async () => {
        if (!fullName.trim()) {
            toast.show({
                placement: 'top',
                render: ({ id }: { id: string }) => (
                    <SanctuaryToast
                        message={t('students.error.nameRequired') || 'Name is required'}
                        type="error"
                        visible={true}
                        onHide={() => toast.close(id)}
                    />
                ),
            });
            return;
        }

        setIsLoading(true);
        try {
            if (studentToEdit) {
                await (studentsAPI.update as any)(studentToEdit.id, {
                    roll_number: rollNumber.trim(),
                    notes: notes.trim(),
                });
                toast.show({
                    placement: 'top',
                    render: ({ id }: { id: string }) => (
                        <SanctuaryToast
                            message={t('students.success.updated') || 'Student updated successfully'}
                            type="success"
                            visible={true}
                            onHide={() => toast.close(id)}
                        />
                    ),
                });
            } else {
                await (studentsAPI.create as any)({
                    full_name: fullName.trim(),
                    roll_number: rollNumber.trim(),
                    notes: notes.trim(),
                    classroom_id: classroomId,
                });
                toast.show({
                    placement: 'top',
                    render: ({ id }: { id: string }) => (
                        <SanctuaryToast
                            message={t('students.success.created') || 'Student added successfully'}
                            type="success"
                            visible={true}
                            onHide={() => toast.close(id)}
                        />
                    ),
                });
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving student:', error);
            toast.show({
                placement: 'top',
                render: ({ id }: { id: string }) => (
                    <SanctuaryToast
                        message={t('students.error.saveFailed') || 'Failed to save student'}
                        type="error"
                        visible={true}
                        onHide={() => toast.close(id)}
                    />
                ),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const footer = (
        <HStack className="gap-4 w-full">
            <Button
                variant="outline"
                onPress={onClose}
                className="flex-1 bg-transparent border-sanctuary-border rounded-full"
            >
                <ButtonText className="text-sanctuary-text-tertiary">
                    {t('common.cancel') || 'Cancel'}
                </ButtonText>
            </Button>
            <Button
                onPress={handleSave}
                isDisabled={isLoading}
                className="flex-[1.5] bg-sanctuarySaffron rounded-full"
            >
                <ButtonText className="text-white font-bold">
                    {isLoading ? (t('common.saving') || 'Saving...') : (t('common.save') || 'Save Member')}
                </ButtonText>
            </Button>
        </HStack>
    );

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={onClose}
            title={studentToEdit ? (t('students.editStudent') || 'Update Member') : (t('students.addStudent') || 'Admit Member')}
            footer={footer}
        >
            <VStack className="gap-6">
                {/* Tab switcher */}
                {!studentToEdit && (
                    <Box className="bg-sanctuary-surface-secondary p-1 rounded-full flex-row border border-sanctuary-border">
                        {(['manual', 'scan'] as AddStudentTab[]).map(tab => (
                            <TouchableOpacity
                                key={tab}
                                activeOpacity={0.7}
                                onPress={() => setActiveTab(tab)}
                                className={`flex-1 py-3 rounded-full items-center ${activeTab === tab ? 'bg-white shadow-sm' : 'bg-transparent'}`}
                            >
                                <Text className={`text-xs font-bold uppercase tracking-widest ${activeTab === tab ? 'text-sanctuarySaffron' : 'text-sanctuary-text-tertiary'}`}>
                                    {tab === 'manual' ? 'Manual entry' : 'Scan register'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </Box>
                )}

                {activeTab === 'scan' && !studentToEdit ? (
                    <OCRStudentImport
                        classroomId={classroomId}
                        onImported={(count) => {
                            toast.show({
                                placement: 'top',
                                render: ({ id }: { id: string }) => (
                                    <SanctuaryToast
                                        message={`${count} student${count !== 1 ? 's' : ''} imported successfully`}
                                        type="success"
                                        visible={true}
                                        onHide={() => toast.close(id)}
                                    />
                                ),
                            });
                            onSuccess();
                        }}
                        onCancel={onClose}
                    />
                ) : (
                    <VStack className="gap-6 py-2">
                        <VStack className="gap-2">
                            <Text className="text-[10px] font-black uppercase tracking-widest text-sanctuary-text-tertiary ml-1">
                                {t('students.fullName') || 'Identity'} *
                            </Text>
                            <Input className="bg-sanctuary-surface-secondary border-sanctuary-border h-16 rounded-[24px]">
                                <InputField
                                    placeholder={t('students.fullNamePlaceholder') || "Full Student Name"}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    className="text-sanctuary-text font-bold"
                                    placeholderTextColor="rgba(0,0,0,0.3)"
                                />
                            </Input>
                        </VStack>

                        <VStack className="gap-2">
                            <Text className="text-[10px] font-black uppercase tracking-widest text-sanctuary-text-tertiary ml-1">
                                {t('students.rollNumber') || 'Institutional ID'}
                            </Text>
                            <Input className="bg-sanctuary-surface-secondary border-sanctuary-border h-14 rounded-2xl">
                                <InputField
                                    placeholder={t('students.rollNumberPlaceholder') || "Roll Number"}
                                    value={rollNumber}
                                    onChangeText={setRollNumber}
                                    className="text-sanctuary-text font-medium"
                                    placeholderTextColor="rgba(0,0,0,0.3)"
                                />
                            </Input>
                        </VStack>

                        <VStack className="gap-2">
                            <Text className="text-[10px] font-black uppercase tracking-widest text-sanctuary-text-tertiary ml-1">
                                {t('students.notes') || 'Member Insights'}
                            </Text>
                            <Input className="bg-sanctuary-surface-secondary border-sanctuary-border rounded-[24px] min-h-[100px] p-2">
                                <InputField
                                    placeholder={t('students.notesPlaceholder') || "Add notes about potential, behavioral traits, or special needs..."}
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline={true}
                                    className="text-sanctuary-text text-sm"
                                    textAlignVertical="top"
                                    placeholderTextColor="rgba(0,0,0,0.3)"
                                />
                            </Input>
                        </VStack>
                    </VStack>
                )}
            </VStack>
        </SanctuaryModal>
    );
};
    );
};
