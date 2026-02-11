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
} from '@/ui';
import { ActivityIndicator } from 'react-native';
import {
    User,
    MoreVertical,
    Edit2,
    Trash2,
    Plus,
    QrCode,
} from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { ClassroomStudent, api } from '../../lib/api';
import { hapticLight, hapticMedium } from '../../utils/haptics';
import { AddStudentModal } from './AddStudentModal';
import QRCodeGenerator from '../shared/QRCodeGenerator';
import * as Clipboard from 'expo-clipboard';

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
                <VStack space="md">
                    {students.length === 0 ? (
                        <Center sx={{ padding: Theme.spacing.xl }}>
                            <Text color={Theme.colors.mistGray}>No students in this class yet.</Text>
                        </Center>
                    ) : (
                        students.map((student) => (
                            <Box
                                key={student.id}
                                sx={{
                                    backgroundColor: Theme.colors.midnightBlue,
                                    borderRadius: Theme.corners.comfortable,
                                    padding: Theme.spacing.md,
                                    borderWidth: 1,
                                    borderColor: student.student_id ? Theme.colors.deepIndigo : Theme.colors.amberGlow,
                                    opacity: student.student_id ? 1 : 0.9,
                                }}
                            >
                                {!student.student_id && (
                                    <Box sx={{ position: 'absolute', top: -8, right: 12, backgroundColor: Theme.colors.amberGlow, paddingHorizontal: 6, borderRadius: 4 }}>
                                        <Text size="xs" color="black" fontWeight="$bold">UNCLAIMED</Text>
                                    </Box>
                                )}
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack space="md" alignItems="center">
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 18,
                                                backgroundColor: Theme.colors.deepIndigo,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text color={Theme.colors.sanctuarySaffron} fontWeight="$bold">
                                                {student.roll_number || '#'}
                                            </Text>
                                        </Box>
                                        <VStack>
                                            <Text color={Theme.colors.sacredWhite} fontWeight="$bold">
                                                {student.full_name}
                                            </Text>
                                            {student.notes && (
                                                <Text size="xs" color={Theme.colors.mistGray}>
                                                    {student.notes}
                                                </Text>
                                            )}
                                        </VStack>
                                    </HStack>

                                    <HStack space="sm">
                                        {!student.student_id && student.invite_code && (
                                            <Pressable onPress={() => handleShowQr(student)}>
                                                <Box sx={{ padding: Theme.spacing.xs }}>
                                                    <QrCode size={18} color={Theme.colors.sanctuarySaffron} />
                                                </Box>
                                            </Pressable>
                                        )}
                                        <Pressable onPress={() => handleEditStudent(student)}>
                                            <Box sx={{ padding: Theme.spacing.xs }}>
                                                <Edit2 size={18} color={Theme.colors.mistGray} />
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
            <Modal isOpen={!!studentForQr} onClose={() => setStudentForQr(null)} size="md">
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: Theme.colors.midnightBlue, borderColor: Theme.colors.deepIndigo, borderWidth: 1 }}>
                    <ModalHeader>
                        <Heading color={Theme.colors.sacredWhite}>Invite Student</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} color={Theme.colors.mistGray} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack space="lg" alignItems="center" pb="$6">
                            <Box sx={{ padding: Theme.spacing.lg, backgroundColor: 'white', borderRadius: Theme.corners.generous }}>
                                <QRCodeGenerator
                                    value={studentForQr?.invite_code || ''}
                                    size={180}
                                    color="black"
                                    backgroundColor="white"
                                />
                            </Box>
                            <VStack space="xs" alignItems="center">
                                <Heading size="sm" color={Theme.colors.sacredWhite}>{studentForQr?.full_name}</Heading>
                                <Text color={Theme.colors.mistGray} size="xs">Individual Invite Code</Text>
                                <Pressable onPress={() => copyToClipboard(studentForQr?.invite_code || '')}>
                                    <Text color={Theme.colors.sanctuarySaffron} fontWeight="$bold">{studentForQr?.invite_code}</Text>
                                </Pressable>
                            </VStack>
                            <Button
                                onPress={() => setStudentForQr(null)}
                                sx={{ backgroundColor: Theme.colors.deepIndigo, width: '100%' }}
                            >
                                <ButtonText>Close</ButtonText>
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </VStack>
    );
}
