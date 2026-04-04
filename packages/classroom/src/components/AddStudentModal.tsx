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
    const colors = useThemedColors();
    
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
        <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}>
            <Button
                variant="outline"
                onPress={onClose}
                sx={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    borderColor: colors.border,
                    borderRadius: Theme.corners.comfortable
                }}
            >
                <ButtonText sx={{ color: colors.textSecondary }}>
                    {t('common.cancel') || 'Cancel'}
                </ButtonText>
            </Button>
            <Button
                onPress={handleSave}
                disabled={isLoading}
                sx={{
                    flex: 1,
                    backgroundColor: Theme.colors.gurudeviBlue,
                    borderRadius: Theme.corners.comfortable,
                    opacity: isLoading ? 0.6 : 1
                }}
            >
                <ButtonText sx={{ color: Theme.colors.sacredWhite }}>
                    {isLoading ? (t('common.saving') || 'Saving...') : (t('common.save') || 'Save')}
                </ButtonText>
            </Button>
        </HStack>
    );

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={onClose}
            title={studentToEdit ? (t('students.editStudent') || 'Edit Student') : (t('students.addStudent') || 'Add Student')}
            footer={footer}
        >
            <VStack sx={{ gap: Theme.spacing.md }}>
                {/* Tab switcher — only shown when adding (not editing) */}
                {!studentToEdit && (
                    <HStack sx={{ 
                        marginBottom: Theme.spacing.md, 
                        borderRadius: Theme.corners.comfortable, 
                        overflow: 'hidden', 
                        borderWidth: 1, 
                        borderColor: colors.border 
                    }}>
                        {(['manual', 'scan'] as AddStudentTab[]).map(tab => (
                            <TouchableOpacity
                                key={tab}
                                accessibilityRole="button"
                                accessibilityLabel={tab === 'manual' ? 'Manual entry' : 'Scan register'}
                                accessibilityHint={`Switches to ${tab === 'manual' ? 'manual' : 'scan'} entry tab`}
                                onPress={() => setActiveTab(tab)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    alignItems: 'center',
                                    backgroundColor: activeTab === tab ? Theme.colors.gurudeviBlue : 'transparent',
                                }}
                            >
                                <Text sx={{
                                    color: activeTab === tab ? Theme.colors.sacredWhite : colors.textSecondary,
                                    fontWeight: activeTab === tab ? '700' : '400',
                                    fontSize: 14,
                                }}>
                                    {tab === 'manual' ? '✎ Manual' : '📷 Scan Register'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </HStack>
                )}

                {/* Scan Register tab */}
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
                    /* Manual entry tab (also shown when editing) */
                    <VStack sx={{ gap: Theme.spacing.md, paddingVertical: Theme.spacing.md }}>
                        <VStack sx={{ gap: Theme.spacing.xs }}>
                            <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '600' as any, color: colors.text }}>
                                {t('students.fullName') || 'Full Name'} *
                            </Text>
                            <Input sx={{
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                borderRadius: Theme.corners.comfortable
                            }}>
                                <InputField
                                    placeholder={t('students.fullNamePlaceholder') || "E.g. John Doe"}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    sx={{ color: colors.text }}
                                />
                            </Input>
                        </VStack>

                        <VStack sx={{ gap: Theme.spacing.xs }}>
                            <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '600' as any, color: colors.text }}>
                                {t('students.rollNumber') || 'Roll Number / ID'}
                            </Text>
                            <Input sx={{
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                borderRadius: Theme.corners.comfortable
                            }}>
                                <InputField
                                    placeholder={t('students.rollNumberPlaceholder') || "E.g. 01"}
                                    value={rollNumber}
                                    onChangeText={setRollNumber}
                                    sx={{ color: colors.text }}
                                />
                            </Input>
                        </VStack>

                        <VStack sx={{ gap: Theme.spacing.xs }}>
                            <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '600' as any, color: colors.text }}>
                                {t('students.notes') || 'Notes'}
                            </Text>
                            <Input sx={{
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                borderRadius: Theme.corners.comfortable,
                                minHeight: 80
                            }}>
                                <InputField
                                    placeholder={t('students.notesPlaceholder') || "Add any relevant notes..."}
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline={true}
                                    sx={{ color: colors.text, textAlignVertical: 'top' }}
                                />
                            </Input>
                        </VStack>
                    </VStack>
                )}
            </VStack>
        </SanctuaryModal>
    );
};
