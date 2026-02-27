import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    VStack,
    HStack,
    Box,
    Text,
    Pressable,
    ScrollView,
    Center,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Heading,
    Icon,
    CloseIcon,
    Button,
    ButtonText,
} from '@repo/ui';
import { ActivityIndicator } from 'react-native';
import {
    User,
    MoreVertical,
    Edit2,
    Trash2,
    Plus,
} from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { QRCodeGenerator } from '@repo/scanner-kit';
import { ClassroomStudent, api } from '@repo/core';
import { hapticLight, hapticMedium } from '@repo/ui';
import { AddStudentModal } from './AddStudentModal';
import { useThemedColors } from '@repo/ui';
import * as Clipboard from 'expo-clipboard';
import { QrCode } from 'lucide-react-native';

interface StudentListProps {
    classroomId: string;
    students: ClassroomStudent[];
    onRefresh: () => void;
}

export default function StudentList({ classroomId, students, onRefresh }: StudentListProps) {
    const { t } = useTranslation();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<ClassroomStudent | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [studentForQr, setStudentForQr] = useState<ClassroomStudent | null>(null);
    const colors = useThemedColors();

    const handleRemoveStudent = async (studentId: string) => {
        try {
            hapticMedium();
            setIsDeleting(studentId);
            await api.classroomStudents.remove(studentId);
            onRefresh();
        } catch (error) {
            console.error('Failed to remove student:', error);
            // Consider using a localized toast here in the future
        } finally {
            setIsDeleting(null);
        }
    };

    const handleEditStudent = (student: ClassroomStudent) => {
        hapticLight();
        setSelectedStudent(student);
        setIsAddModalOpen(true);
    };

    const handleShowQr = (student: ClassroomStudent) => {
        hapticLight();
        setStudentForQr(student);
    };

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        hapticLight();
    };

    return (
        <VStack sx={{ flex: 1, backgroundColor: colors.primary }}>
            <ScrollView contentContainerStyle={{ padding: Theme.spacing.md }}>
                <VStack sx={{ gap: Theme.spacing.md }}>
                    {students.length === 0 ? (
                        <Center sx={{ padding: Theme.spacing.xl, marginTop: 40 }}>
                            <Text sx={{ color: colors.textSecondary, textAlign: 'center' }}>
                                {t('classroom.students.emptyState') || 'No students in this class yet.'}
                            </Text>
                        </Center>
                    ) : (
                        students.map((student) => (
                            <Box
                                key={student.id}
                                sx={{
                                    backgroundColor: colors.secondary,
                                    borderRadius: Theme.corners.comfortable,
                                    padding: Theme.spacing.md,
                                    borderWidth: 1,
                                    borderColor: student.student_id ? colors.border : Theme.colors.amberGlow,
                                    opacity: student.student_id ? 1 : 0.9,
                                }}
                            >
                                {!student.student_id && (
                                    <Box sx={{ position: 'absolute', top: -Theme.spacing.xs, right: 12, backgroundColor: Theme.colors.amberGlow, paddingHorizontal: 6, borderRadius: Theme.corners.tight }}>
                                        <Text sx={{ fontSize: 10, color: Theme.colors.black, fontWeight: '700' }}>
                                            {t('classroom.students.unclaimed') || 'UNCLAIMED'}
                                        </Text>
                                    </Box>
                                )}
                                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center' }}>
                                        <Box
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: Theme.corners.full,
                                                backgroundColor: colors.tertiary,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '700', fontSize: Theme.typography.fontSize.md }}>
                                                {student.roll_number || '#'}
                                            </Text>
                                        </Box>
                                        <VStack sx={{ flex: 1 }}>
                                            <Text sx={{ color: colors.text, fontWeight: '700', fontSize: Theme.typography.fontSize.md }}>
                                                {student.full_name}
                                            </Text>
                                            {student.notes && (
                                                <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: colors.textSecondary }}>
                                                    {student.notes}
                                                </Text>
                                            )}
                                        </VStack>
                                    </HStack>

                                    <HStack sx={{ gap: Theme.spacing.sm }}>
                                        {!student.student_id && student.invite_code && (
                                            <Pressable onPress={() => handleShowQr(student)}>
                                                <Box sx={{ padding: Theme.spacing.xs }}>
                                                    <QrCode size={20} color={Theme.colors.sanctuarySaffron} />
                                                </Box>
                                            </Pressable>
                                        )}
                                        <Pressable onPress={() => handleEditStudent(student)}>
                                            <Box sx={{ padding: Theme.spacing.xs }}>
                                                <Edit2 size={20} color={colors.textSecondary} />
                                            </Box>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleRemoveStudent(student.id)}
                                            disabled={isDeleting === student.id}
                                        >
                                            <Box sx={{ padding: Theme.spacing.xs }}>
                                                {isDeleting === student.id ? (
                                                    <ActivityIndicator size="small" color={Theme.colors.emberRed} />
                                                ) : (
                                                    <Trash2 size={20} color={Theme.colors.emberRed} />
                                                )}
                                            </Box>
                                        </Pressable>
                                    </HStack>
                                </HStack>
                            </Box>
                        ))
                    )}
                </VStack>
            </ScrollView>

            {/* Floating Action Button for Adding Students */}
            <Pressable
                onPress={() => {
                    hapticLight();
                    setSelectedStudent(null);
                    setIsAddModalOpen(true);
                }}
                sx={{
                    position: 'absolute',
                    right: 24,
                    bottom: 24,
                    backgroundColor: Theme.colors.sanctuarySaffron,
                    width: 64,
                    height: 64,
                    borderRadius: Theme.corners.full,
                    justifyContent: 'center',
                    alignItems: 'center',
                    ...Theme.shadows.lg,
                }}
            >
                <Plus color={Theme.colors.sacredWhite} size={32} />
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

            {/* View QR Modal for Shadow Students */}
            <Modal isOpen={!!studentForQr} onClose={() => setStudentForQr(null)}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 }}>
                    <ModalHeader>
                        <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.xl }}>
                            {t('classroom.students.inviteTitle') || 'Invite Student'}
                        </Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} sx={{ color: colors.textSecondary }} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack sx={{ gap: Theme.spacing.lg, alignItems: 'center', paddingBottom: Theme.spacing.xl }}>
                            <Box sx={{ padding: Theme.spacing.lg, backgroundColor: 'white', borderRadius: Theme.corners.generous, ...Theme.shadows.md }}>
                                <QRCodeGenerator
                                    value={studentForQr?.invite_code || ''}
                                    size={200}
                                    color="black"
                                    backgroundColor="white"
                                />
                            </Box>
                            <VStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                                <Heading sx={{ fontSize: Theme.typography.fontSize.md, color: colors.text, textAlign: 'center' }}>
                                    {studentForQr?.full_name}
                                </Heading>
                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>
                                    {t('classroom.students.individualCode') || 'Individual Invite Code'}
                                </Text>
                                <Pressable onPress={() => copyToClipboard(studentForQr?.invite_code || '')}>
                                    <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '700', fontSize: Theme.typography.fontSize.lg }}>
                                        {studentForQr?.invite_code}
                                    </Text>
                                </Pressable>
                                <Text sx={{ fontSize: 10, color: colors.textTertiary, marginTop: Theme.spacing.xs }}>
                                    {t('common.tapToCopy') || 'Tap to copy'}
                                </Text>
                            </VStack>
                            <Button
                                onPress={() => setStudentForQr(null)}
                                sx={{ backgroundColor: colors.tertiary, width: '100%', borderRadius: Theme.corners.comfortable }}
                            >
                                <ButtonText sx={{ color: colors.text }}>
                                    {t('common.close') || 'Close'}
                                </ButtonText>
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </VStack>
    );
}

