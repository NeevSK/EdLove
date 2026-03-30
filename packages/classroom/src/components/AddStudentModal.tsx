/**
 * ADD STUDENT MODAL
 * 
 * Modal for adding or editing a student in a classroom.
 */

import React, { useState, useEffect, useCallback } from 'react';
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
    useTheme,
    Toast,
    ToastTitle,
    ToastDescription,
    useToast,
    SanctuaryToast
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { studentsAPI, Student } from '@repo/core';
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
    const { text, accent, glass } = useTheme();
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
                    /
                >),
            });
            return;
        }

        setIsLoading(true);
        try {
            if (studentToEdit) {
                await studentsAPI.update(studentToEdit.id, {
                    full_name: fullName.trim(),
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
                        /
                    >),
                });
            } else {
                await studentsAPI.create({
                    full_name: fullName.trim(),
                    roll_number: rollNumber.trim(),
                    notes: notes.trim(),
                    class_id: classroomId,
                } as any);
                toast.show({
                    placement: 'top',
                    render: ({ id }: { id: string }) => (
                        <SanctuaryToast
                            message={t('students.success.created') || 'Student added successfully'}
                            type="success"
                            visible={true}
                            onHide={() => toast.close(id)}
                        /
                    >),
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
                    /
                >),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const footer = (
        <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}
            <Button
                onPress={onClose}
                sx={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    borderColor: glass.interact.border,
                    borderWidth: 1,
                    borderRadius: Theme.corners.comfortable>
                }}
            
                <ButtonText {...({ color: text.secondary } as any)}
                    {t('common.cancel') || 'Cancel'}>
                </ButtonText>
            </Button>
            <Button
                onPress={handleSave}
                disabled={isLoading}
                sx={{
                    flex: 1,
                    backgroundColor: accent.action,
                    borderRadius: Theme.corners.comfortable,
                    opacity: isLoading ? 0.6 : 1>
                }}
            
                <ButtonText {...({ color: text.inverse } as any)}
                    {isLoading ? (t('common.saving') || 'Saving...') : (t('common.save') || 'Save')}>
                </ButtonText>
            </Button>
        </HStack>
    );

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={onClose}
            title={studentToEdit ? (t('students.editStudent') || 'Edit Student') : (t('students.addStudent') || 'Add Student')}
            footer={footer}>
        
            {/* Tab switcher \u2014 only shown when adding (not editing) */}
            {!studentToEdit && (
                <HStack sx={{ gap: 0, marginBottom: Theme.spacing.md, borderRadius: Theme.corners.comfortable, overflow: 'hidden', borderWidth: 1, borderColor: glass.interact.border }}
                    {(['manual', 'scan'] as AddStudentTab[]).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                alignItems: 'center',
                                backgroundColor: activeTab === tab ? accent.action : 'transparent',
                            }}
                        
                            <Text style={{
                                color: activeTab === tab ? text.inverse : text.secondary,
                                fontWeight: activeTab === tab ? '700' : '400',
                                fontSize: 14,>
                            }}
                                {tab === 'manual' ? '\u270F\uFE0F Manual' : '\uD83D\uDCF7 Scan Register'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </HStack>
            )}

            {/* Scan Register tab */}
            {activeTab === 'scan' && !studentToEdit && (
                <OCRStudentImport
                    classroomId={classroomId}
                    onImported={(count) => {
                        toast.show({
                            placement: 'top',
                            render: ({ id }: { id: string }) => (
                                <SanctuaryToast
                                    message={`${count} student${count !== 1 ? 's' : ''} imported successfully`}
                                    type="success"
                                    visible
                                    onHide={() => toast.close(id)}
                                /
                            >),
                        });
                        onSuccess();
                    }}
                    onCancel={onClose}
                /
            >)}

            {/* Manual entry tab */}
            {(activeTab === 'manual' || studentToEdit) && (
                <VStack sx={{ gap: Theme.spacing.md, paddingVertical: Theme.spacing.md }}
                    <VStack sx={{ gap: Theme.spacing.xs }}>
                        <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '600' as any }}
                            {...({ color: text.primary } as any)}>
                            {t('students.fullName') || 'Full Name'} *
                        </Text>
                        <Input
                            sx={{
                                backgroundColor: glass.interact.bg,
                                borderColor: glass.interact.border,
                                borderRadius: Theme.corners.comfortable>
                            }}
                        
                            <InputField
                                placeholder={t('students.fullNamePlaceholder') || "E.g. John Doe"}
                                value={fullName}
                                onChangeText={setFullName}>
                                {...({ color: text.primary } as any)}
                            /
                        ></Input>
                    </VStack>

                    <VStack sx={{ gap: Theme.spacing.xs }}
                        <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '600' as any }}>
                            {...({ color: text.primary } as any)}
                            {t('students.rollNumber') || 'Roll Number / ID'}
                        </Text>
                        <Input
                            sx={{
                                backgroundColor: glass.interact.bg,
                                borderColor: glass.interact.border,
                                borderRadius: Theme.corners.comfortable>
                            }}
                        
                            <InputField
                                placeholder={t('students.rollNumberPlaceholder') || "E.g. 01"}
                                value={rollNumber}
                                onChangeText={setRollNumber}>
                                {...({ color: text.primary } as any)}
                            /
                        ></Input>
                    </VStack>

                    <VStack sx={{ gap: Theme.spacing.xs }}
                        <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '600' as any }}>
                            {...({ color: text.primary } as any)}
                            {t('students.notes') || 'Notes'}
                        </Text>
                        <Input
                            sx={{
                                backgroundColor: glass.interact.bg,
                                borderColor: glass.interact.border,
                                borderRadius: Theme.corners.comfortable,
                                minHeight: 80>
                            }}
                        
                            <InputField
                                placeholder={t('students.notesPlaceholder') || "Add any relevant notes..."}
                                value={notes}
                                onChangeText={setNotes}
                                multiline>
                                {...({ color: text.primary, textAlignVertical: 'top' } as any)}
                            /
                        ></Input>
                    </VStack>
                </VStack>
            )}
        </SanctuaryModal>
    );
};
