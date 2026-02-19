import React, { useState } from 'react';
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
            alert('Failed to remove student');
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
        <VStack sx={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: Theme.spacing.md }}>
                <VStack sx={{ gap: Theme.spacing.md }}>
                    {students.length === 0 ? (
                        <Center sx={{ padding: Theme.spacing.xl }}>
                            <Text sx={{ color: colors.textSecondary }}>No students in this class yet.</Text>
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
                                    <Box sx={{ position: 'absolute', top: -8, right: 12, backgroundColor: Theme.colors.amberGlow, paddingHorizontal: 6, borderRadius: 4 }}>
                                        <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: 'black', fontWeight: '700' as any }}>UNCLAIMED</Text>
                                    </Box>
                                )}
                                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center' }}>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 18,
                                                backgroundColor: colors.tertiary,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '700' as any }}>
                                                {student.roll_number || '#'}
                                            </Text>
                                        </Box>
                                        <VStack>
                                            <Text sx={{ color: colors.text, fontWeight: '700' as any }}>
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
                                                    <QrCode size={18} color={Theme.colors.sanctuarySaffron} />
                                                </Box>
                                            </Pressable>
                                        )}
                                        <Pressable onPress={() => handleEditStudent(student)}>
                                            <Box sx={{ padding: Theme.spacing.xs }}>
                                                <Edit2 size={18} color={colors.textSecondary} />
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
                                                    <Trash2 size={18} color={Theme.colors.emberRed} />
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
                    right: 20,
                    bottom: 20,
                    backgroundColor: Theme.colors.sanctuarySaffron,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                }}
            >
                <Plus color={Theme.colors.white} size={28} />
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
                        <Heading sx={{ color: colors.text }}>Invite Student</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} sx={{ color: colors.textSecondary }} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack sx={{ gap: Theme.spacing.lg, alignItems: 'center', paddingBottom: 24 }}>
                            <Box sx={{ padding: Theme.spacing.lg, backgroundColor: 'white', borderRadius: Theme.corners.generous }}>
                                <QRCodeGenerator
                                    value={studentForQr?.invite_code || ''}
                                    size={180}
                                    color="black"
                                    backgroundColor="white"
                                />
                            </Box>
                            <VStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                                <Heading sx={{ fontSize: Theme.typography.fontSize.sm, color: colors.text }}>{studentForQr?.full_name}</Heading>
                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>Individual Invite Code</Text>
                                <Pressable onPress={() => copyToClipboard(studentForQr?.invite_code || '')}>
                                    <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '700' as any }}>{studentForQr?.invite_code}</Text>
                                </Pressable>
                            </VStack>
                            <Button
                                onPress={() => setStudentForQr(null)}
                                sx={{ backgroundColor: colors.tertiary, width: '100%' }}
                            >
                                <ButtonText sx={{ color: colors.text }}>Close</ButtonText>
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </VStack>
    );
}
