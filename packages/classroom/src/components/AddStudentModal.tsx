/**
 * ADD STUDENT MODAL
 *
 * Modal for adding or editing a student in a classroom.
 */

import type { Student } from '@repo/core';
import { studentsAPI } from '@repo/core/api';

import {
  Box,
  Button,
  ButtonText,
  HStack,
  Input,
  InputField,
  SanctuaryModal,
  Text,
  useToast,
  VStack,
} from '@repo/ui';
import { Pressable } from '@repo/ui/primitives';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
      toast.showToast({
        message: t('students.error.nameRequired') || 'Name is required',
        type: 'error',
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
        toast.showToast({
          message: t('students.success.updated') || 'Student updated successfully',
          type: 'success',
        });
      } else {
        await (studentsAPI.create as any)({
          full_name: fullName.trim(),
          roll_number: rollNumber.trim(),
          notes: notes.trim(),
          classroom_id: classroomId,
        });
        toast.showToast({
          message: t('students.success.created') || 'Student added successfully',
          type: 'success',
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.showToast({
        message: t('students.error.saveFailed') || 'Failed to save student',
        type: 'error',
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
        className="flex-1 bg-transparent border-phase-canvas rounded-full"
      >
        <ButtonText className="text-phaseText-secondary font-black">
          {t('common.cancel') || 'Cancel'}
        </ButtonText>
      </Button>
      <Button
        onPress={handleSave}
        isDisabled={isLoading}
        className="flex-[1.5] bg-templeGold rounded-full shadow-md shadow-templeGold/20"
      >
        <ButtonText className="text-black font-black">
          {isLoading ? t('common.saving') || 'Saving...' : t('common.save') || 'Save Member'}
        </ButtonText>
      </Button>
    </HStack>
  );

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        studentToEdit
          ? t('students.editStudent') || 'Update Member'
          : t('students.addStudent') || 'Admit Member'
      }
      footer={footer}
    >
      <VStack className="gap-6">
        {/* Tab switcher */}
        {!studentToEdit && (
          <Box className="bg-phase-canvas p-1 rounded-full flex-row border border-phase-canvas">
            {(['manual', 'scan'] as AddStudentTab[]).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-full items-center ${activeTab === tab ? 'bg-phase-surface shadow-sm' : 'bg-transparent'}`}
              >
                <Text
                  className={`text-[10px] font-black uppercase tracking-widest ${activeTab === tab ? 'text-templeGold' : 'text-phaseText-secondary'}`}
                >
                  {tab === 'manual' ? 'Manual entry' : 'Scan register'}
                </Text>
              </Pressable>
            ))}
          </Box>
        )}

        {activeTab === 'scan' && !studentToEdit ? (
          <OCRStudentImport
            classroomId={classroomId}
            onImported={(count) => {
              toast.showToast({
                message: `${count} student${count !== 1 ? 's' : ''} imported successfully`,
                type: 'success',
              });
              onSuccess();
            }}
            onCancel={onClose}
          />
        ) : (
          <VStack className="gap-6 py-2">
            <VStack className="gap-2">
              <Text className="text-[10px] font-black uppercase tracking-widest text-phaseText-secondary ml-1">
                {t('students.fullName') || 'Identity'} *
              </Text>
              <Input className="bg-phase-canvas/50 border-phase-canvas h-16 rounded-generous">
                <InputField
                  placeholder={t('students.fullNamePlaceholder') || 'Full Student Name'}
                  value={fullName}
                  onChangeText={setFullName}
                  className="text-phaseText-primary font-black"
                  placeholderTextColor="rgba(0,0,0,0.3)"
                />
              </Input>
            </VStack>

            <VStack className="gap-2">
              <Text className="text-[10px] font-black uppercase tracking-widest text-phaseText-secondary ml-1">
                {t('students.rollNumber') || 'Institutional ID'}
              </Text>
              <Input className="bg-phase-canvas/50 border-phase-canvas h-14 rounded-2xl">
                <InputField
                  placeholder={t('students.rollNumberPlaceholder') || 'Roll Number'}
                  value={rollNumber}
                  onChangeText={setRollNumber}
                  className="text-phaseText-primary font-bold"
                  placeholderTextColor="rgba(0,0,0,0.3)"
                />
              </Input>
            </VStack>

            <VStack className="gap-2">
              <Text className="text-[10px] font-black uppercase tracking-widest text-phaseText-secondary ml-1">
                {t('students.notes') || 'Member Insights'}
              </Text>
              <Input className="bg-phase-canvas/50 border-phase-canvas rounded-generous min-h-[120px] p-2">
                <InputField
                  placeholder={
                    t('students.notesPlaceholder') ||
                    'Add notes about potential, behavioral traits, or special needs...'
                  }
                  value={notes}
                  onChangeText={setNotes}
                  multiline={true}
                  className="text-phaseText-primary text-sm font-medium"
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
