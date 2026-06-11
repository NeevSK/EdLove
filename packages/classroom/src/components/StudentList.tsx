import { studentsAPI } from '@repo/core/api';
import type { Student } from '@repo/core/types';

import { QRCodeGenerator } from '@repo/scanner-kit';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { Pen, Plus, QrCode, Sparkles, Trash2 } from '@repo/ui/icons';
import {
  Spinner as ActivityIndicator,
  Box,
  Button,
  ButtonText,
  Center,
  FlatList,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight, hapticMedium } from '@repo/ui/utils/haptics';

import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddStudentModal } from './AddStudentModal';

interface StudentListProps {
  classroomId: string;
  students: Student[];
  onRefresh: () => void;
  onAnalyzePotential?: (student: Student) => void;
}

export default function StudentList({
  classroomId,
  students,
  onRefresh,
  onAnalyzePotential,
}: StudentListProps) {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [studentForQr, setStudentForQr] = useState<Student | null>(null);

  const handleRemoveStudent = async (studentId: string) => {
    try {
      hapticMedium();
      setIsDeleting(studentId);
      await studentsAPI.remove(classroomId, studentId);
      onRefresh();
    } catch (error) {
      console.error('Failed to remove student:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditStudent = (student: Student) => {
    hapticLight();
    setSelectedStudent(student);
    setIsAddModalOpen(true);
  };

  const handleShowQr = (student: Student) => {
    hapticLight();
    setStudentForQr(student);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    hapticLight();
  };

  return (
    <VStack className="flex-1 bg-sanctuary-surface">
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudentListItem
            student={item}
            isDeleting={isDeleting === item.id}
            onRemove={handleRemoveStudent}
            onEdit={handleEditStudent}
            onShowQr={handleShowQr}
            onAnalyze={onAnalyzePotential}
            t={t}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <Box className="h-4" />}
        ListEmptyComponent={
          <Center className="py-20">
            <Text className="text-sanctuary-text-secondary text-center px-10 leading-relaxed">
              {t('classroom.students.emptyState') ||
                'No students in this class yet. Start building your academic community.'}
            </Text>
          </Center>
        }
        ListFooterComponent={<Box className="h-24" />}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={() => {
          hapticLight();
          setSelectedStudent(null);
          setIsAddModalOpen(true);
        }}
        className="absolute right-6 bottom-6 bg-sanctuarySaffron w-16 h-16 rounded-full justify-center items-center shadow-xl border-4 border-white/10"
      >
        <Icon as={Plus} className="text-white" size={32} />
      </Pressable>

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedStudent(null);
        }}
        onSuccess={() => {
          setIsAddModalOpen(false);
          setSelectedStudent(null);
          onRefresh();
        }}
        classroomId={classroomId}
        studentToEdit={selectedStudent}
      />

      {/* View QR Modal */}
      <SanctuaryModal
        isOpen={!!studentForQr}
        onClose={() => setStudentForQr(null)}
        title={t('classroom.students.inviteTitle') || 'Invite Student'}
        footer={
          <Button
            onPress={() => setStudentForQr(null)}
            className="bg-sanctuary-surface-tertiary w-full rounded-full h-12"
          >
            <ButtonText className="text-sanctuary-text">{t('common.close') || 'Close'}</ButtonText>
          </Button>
        }
      >
        <VStack className="gap-8 items-center py-4">
          <Box className="p-6 bg-white rounded-[32px] shadow-sm border border-sanctuary-border/10">
            <QRCodeGenerator
              value={studentForQr?.invite_code || ''}
              size={200}
              color="black"
              backgroundColor="white"
            />
          </Box>
          <VStack className="gap-2 items-center">
            <Heading className="text-lg text-sanctuary-text text-center font-bold">
              {studentForQr?.full_name}
            </Heading>
            <Text className="text-sanctuary-text-tertiary text-xs uppercase font-bold tracking-widest">
              {t('classroom.students.individualCode') || 'Individual Invite Code'}
            </Text>
            <Pressable
              onPress={() => copyToClipboard(studentForQr?.invite_code || '')}
              className="bg-sanctuary-surface-secondary px-6 py-3 rounded-2xl border border-sanctuary-border"
            >
              <Text className="text-sanctuarySaffron font-black text-2xl tracking-tighter">
                {studentForQr?.invite_code}
              </Text>
            </Pressable>
            <Text className="text-[10px] text-sanctuary-text-tertiary mt-2">
              {t('common.tapToCopy') || 'Tap code to copy to clipboard'}
            </Text>
          </VStack>
        </VStack>
      </SanctuaryModal>
    </VStack>
  );
}

const StudentListItem = React.memo(
  ({
    student,
    isDeleting,
    onRemove,
    onEdit,
    onShowQr,
    onAnalyze,
    t,
  }: {
    student: Student;
    isDeleting: boolean;
    onRemove: (id: string) => void;
    onEdit: (student: Student) => void;
    onShowQr: (student: Student) => void;
    onAnalyze?: (student: Student) => void;
    t: any;
  }) => {
    return (
      <Box
        className={`
                bg-sanctuary-surface-secondary rounded-[24px] p-5 border
                ${student.student_id ? 'border-sanctuary-border' : 'border-sanctuarySaffron/30 shadow-sm'}
            `}
      >
        {!student.student_id && (
          <Box className="absolute -top-2.5 right-4 bg-sanctuarySaffron px-2.5 py-0.5 rounded-full z-10 shadow-sm">
            <Text className="text-[9px] text-white font-black tracking-widest leading-tight">
              {t('classroom.students.unclaimed') || 'GUEST'}
            </Text>
          </Box>
        )}
        <HStack className="justify-between items-center">
          <HStack className="gap-4 items-center flex-1">
            <Box className="w-12 h-12 rounded-full bg-sanctuary-surface justify-center items-center border border-sanctuary-border/30">
              <Text className="text-sanctuarySaffron font-bold text-base">
                {student.roll_number || '#'}
              </Text>
            </Box>
            <VStack className="flex-1 gap-0.5">
              <Text className="text-sanctuary-text font-bold text-base leading-tight">
                {student.full_name}
              </Text>
              {student.notes && (
                <Text className="text-xs text-sanctuary-text-tertiary italic" numberOfLines={1}>
                  {student.notes}
                </Text>
              )}
            </VStack>
          </HStack>

          <HStack className="gap-1 items-center">
            {onAnalyze && (
              <Pressable
                onPress={() => {
                  hapticLight();
                  onAnalyze(student);
                }}
                className="p-2.5 bg-sanctuary-surface/50 rounded-full border border-sanctuary-border/20"
              >
                <Icon as={Sparkles} size={18} className="text-sanctuarySaffron" />
              </Pressable>
            )}
            {!student.student_id && student.invite_code && (
              <Pressable
                onPress={() => onShowQr(student)}
                className="p-2.5 bg-sanctuary-surface/50 rounded-full border border-sanctuary-border/20"
              >
                <Icon as={QrCode} size={18} className="text-sanctuarySaffron" />
              </Pressable>
            )}
            <Pressable onPress={() => onEdit(student)} className="p-2.5">
              <Icon as={Pen} size={18} className="text-sanctuary-text-tertiary" />
            </Pressable>
            <Pressable onPress={() => onRemove(student.id)} disabled={isDeleting} className="p-2.5">
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Icon as={Trash2} size={18} className="text-sanctuary-error" />
              )}
            </Pressable>
          </HStack>
        </HStack>
      </Box>
    );
  },
  (prev, next) => {
    return (
      prev.student.id === next.student.id &&
      prev.student.updated_at === next.student.updated_at &&
      prev.isDeleting === next.isDeleting
    );
  },
);
