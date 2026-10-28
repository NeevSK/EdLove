import { AddStudentModal } from '@repo/classroom/components/AddStudentModal';
import { TactilePulseGesture } from '@repo/classroom/components/teacher/TactilePulseGesture';
import { studentsAPI } from '@repo/core/api/client';
import type { Student } from '@repo/core/types';
import { QRBuilder } from '@repo/core/logic/utils/QRBuilder';
import { SanctuaryQRCard } from '@repo/ui/qr';
import { BrandPulse } from '@repo/ui';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { SanctuaryFlashList } from '@repo/ui/components/SanctuaryFlashList';
import { Pen, Plus, QrCode, Sparkles, Trash2 } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight, hapticMedium } from '@repo/ui/utils/haptics';
import { confirmAction } from '@repo/ui/utils/dialogs';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { showToast } = useSanctuaryToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [studentForQr, setStudentForQr] = useState<Student | null>(null);
  const [studentForPulse, setStudentForPulse] = useState<Student | null>(null);

  const handleRemoveStudent = async (studentId: string) => {
    const student = students.find((candidate) => candidate.id === studentId);
    const confirmed = await confirmAction(
      'Remove student?',
      `${student?.full_name ?? 'This student'} will be removed from the classroom.`,
    );
    if (!confirmed) return;

    try {
      hapticMedium();
      setIsDeleting(studentId);
      await studentsAPI.remove(classroomId, studentId);
      onRefresh();
    } catch (error) {
      console.error('Failed to remove student:', error);
      showToast({ message: 'Student could not be removed. Please try again.', type: 'error' });
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
    try {
      await Clipboard.setStringAsync(text);
      hapticLight();
      showToast({ message: 'Invite code copied', type: 'success' });
    } catch (error) {
      console.error('Failed to copy invite code:', error);
      showToast({ message: 'Invite code could not be copied.', type: 'error' });
    }
  };

  return (
    <VStack className="flex-1 bg-sanctuary-surface">
      <SanctuaryFlashList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudentRow
            student={item}
            isDeleting={isDeleting === item.id}
            onRemove={handleRemoveStudent}
            onEdit={handleEditStudent}
            onShowQr={handleShowQr}
            onAnalyze={onAnalyzePotential}
            onPulse={(s) => setStudentForPulse(s)}
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
        accessibilityRole="button"
        accessibilityLabel="Add student"
        accessibilityHint="Opens the form to add a student to this classroom"
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
      {(() => {
        const q = studentForQr as any;
        return (
          <SanctuaryModal
            isOpen={!!studentForQr}
            onClose={() => setStudentForQr(null)}
            title={t('classroom.students.inviteTitle') || 'Invite Student'}
            footer={
              <Button
                onPress={() => setStudentForQr(null)}
                className="bg-sanctuary-surface-tertiary w-full rounded-full h-12"
              >
                <ButtonText className="text-sanctuary-text">
                  {t('common.close') || 'Close'}
                </ButtonText>
              </Button>
            }
          >
            <VStack className="items-center py-2">
              <SanctuaryQRCard
                value={QRBuilder.invite(q?.invite_code || '', classroomId, 'student')}
                title={q?.full_name || t('classroom.students.individualCode') || 'Student Pass'}
                subtitle={t('classroom.students.individualCode') || 'Individual Student Desk Pass'}
                code={q?.invite_code}
                size={180}
                label={`Student Desk Pass - ${q?.full_name}`}
              />
            </VStack>
          </SanctuaryModal>
        );
      })()}

      <TactilePulseGesture
        isOpen={!!studentForPulse}
        student={studentForPulse}
        classroomId={classroomId}
        onClose={() => setStudentForPulse(null)}
        onPulseRecorded={() => onRefresh()}
      />
    </VStack>
  );
}

const StudentRow = React.memo(
  ({
    student,
    isDeleting,
    onRemove,
    onEdit,
    onShowQr,
    onAnalyze,
    onPulse,
    t,
  }: {
    student: any;
    isDeleting: boolean;
    onRemove: (id: string) => void;
    onEdit: (student: any) => void;
    onShowQr: (student: any) => void;
    onAnalyze?: (student: any) => void;
    onPulse?: (student: any) => void;
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
                  if (onPulse) {
                    onPulse(student);
                  } else {
                    onAnalyze(student);
                  }
                }}
                onLongPress={() => {
                  hapticMedium();
                  onAnalyze(student);
                }}
                className="p-2.5 bg-sanctuarySaffron/10 rounded-full border border-sanctuarySaffron/30"
                accessibilityRole="button"
                accessibilityLabel={`Pulse attunement for ${student.full_name}`}
                accessibilityHint="Tap for quick 8-second pulse, long press for deep multidimensional analysis"
              >
                <Icon as={Sparkles} size={18} className="text-sanctuarySaffron" />
              </Pressable>
            )}
            {!student.student_id && student.invite_code && (
              <Pressable
                onPress={() => onShowQr(student)}
                className="p-2.5 bg-sanctuary-surface/50 rounded-full border border-sanctuary-border/20"
                accessibilityRole="button"
                accessibilityLabel={`Show invite QR code for ${student.full_name}`}
              >
                <Icon as={QrCode} size={18} className="text-sanctuarySaffron" />
              </Pressable>
            )}
            <Pressable
              onPress={() => onEdit(student)}
              className="p-2.5"
              accessibilityRole="button"
              accessibilityLabel={`Edit ${student.full_name}`}
            >
              <Icon as={Pen} size={18} className="text-sanctuary-text-tertiary" />
            </Pressable>
            <Pressable
              onPress={() => onRemove(student.id)}
              disabled={isDeleting}
              className="p-2.5"
              accessibilityRole="button"
              accessibilityLabel={`Remove ${student.full_name}`}
              accessibilityHint="Removes this student from the classroom after confirmation"
              accessibilityState={{ disabled: Boolean(isDeleting) }}
            >
              {isDeleting ? (
                <BrandPulse size={20} tintColor="#B42318" />
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
