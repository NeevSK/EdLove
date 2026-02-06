import React, { useState } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Pressable,
    ScrollView,
    Center,
} from '@gluestack-ui/themed';
import { ActivityIndicator } from 'react-native';
import {
    User,
    MoreVertical,
    Edit2,
    Trash2,
    Plus,
} from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { ClassroomStudent, api } from '../../lib/api';
import { hapticLight, hapticMedium } from '../../utils/haptics';
import AddStudentModal from './AddStudentModal';

interface StudentListProps {
    classroomId: string;
    students: ClassroomStudent[];
    onRefresh: () => void;
}

export default function StudentList({ classroomId, students, onRefresh }: StudentListProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<ClassroomStudent | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleRemoveStudent = async (studentId: string) => {
        try {
            hapticMedium();
            setIsDeleting(studentId);
            await api.classroomStudents.remove(classroomId, studentId);
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
                                key={student.student_id}
                                sx={{
                                    backgroundColor: Theme.colors.midnightBlue,
                                    borderRadius: Theme.corners.comfortable,
                                    padding: Theme.spacing.md,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.deepIndigo,
                                }}
                            >
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
                                        <Pressable onPress={() => handleEditStudent(student)}>
                                            <Box sx={{ padding: Theme.spacing.xs }}>
                                                <Edit2 size={18} color={Theme.colors.mistGray} />
                                            </Box>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleRemoveStudent(student.student_id)}
                                            disabled={isDeleting === student.student_id}
                                        >
                                            <Box sx={{ padding: Theme.spacing.xs }}>
                                                {isDeleting === student.student_id ? (
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
        </VStack>
    );
}
