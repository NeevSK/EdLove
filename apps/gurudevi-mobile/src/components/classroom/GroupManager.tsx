/**
 * GroupManager Component
 * 
 * Create and manage temporary student groups
 * - Select Multiple checklist for assigning students
 * - Group creation and management
 * - JSON blob stored in local state (or groups table if available)
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    ScrollView,
    Pressable,
    Button,
    ButtonText,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    InputField,
    Checkbox,
    CheckboxIndicator,
    CheckboxIcon,
    CheckboxLabel,
} from "@gluestack-ui/themed";
import { Users, Plus, Trash2, Edit2, CheckIcon } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { hapticLight } from '../../utils/haptics';

// Types
export interface Student {
    id: string;
    full_name: string;
    roll_number?: number;
}

export interface StudentGroup {
    id: string;
    name: string;
    description?: string;
    studentIds: string[];
    createdAt: string;
    color: string;
}

interface GroupManagerProps {
    classroomId: string;
}

// Predefined colors for groups
const GROUP_COLORS = [
    Theme.colors.sanctuarySaffron,
    Theme.colors.sageGreen,
    Theme.colors.twilightPurple,
    Theme.colors.amberGlow,
    Theme.colors.lotusDeepPink,
];

export default function GroupManager({ classroomId }: GroupManagerProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [groups, setGroups] = useState<StudentGroup[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
        loadGroups();
    }, [classroomId]);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            // Mock data for now
            const mockStudents: Student[] = [
                { id: 's1', full_name: 'Anura Kumara', roll_number: 1 },
                { id: 's2', full_name: 'Sithum Silva', roll_number: 2 },
                { id: 's3', full_name: 'Nimal Perera', roll_number: 3 },
                { id: 's4', full_name: 'Kasun Fernando', roll_number: 4 },
                { id: 's5', full_name: 'Dilani Jayasinghe', roll_number: 5 },
                { id: 's6', full_name: 'Sanduni Wijeratne', roll_number: 6 },
            ];

            setStudents(mockStudents);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadGroups = () => {
        // TODO: Load from API or AsyncStorage
        // For now, using local state
        const mockGroups: StudentGroup[] = [
            {
                id: 'g1',
                name: 'Lab Group A',
                description: 'First lab rotation',
                studentIds: ['s1', 's2', 's3'],
                createdAt: new Date().toISOString(),
                color: GROUP_COLORS[0],
            },
        ];
        setGroups(mockGroups);
    };

    const toggleStudentSelection = (studentId: string) => {
        hapticLight();
        setSelectedStudentIds((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    const openCreateModal = () => {
        hapticLight();
        setEditingGroup(null);
        setGroupName('');
        setGroupDescription('');
        setSelectedStudentIds([]);
        setShowCreateModal(true);
    };

    const openEditModal = (group: StudentGroup) => {
        hapticLight();
        setEditingGroup(group);
        setGroupName(group.name);
        setGroupDescription(group.description || '');
        setSelectedStudentIds(group.studentIds);
        setShowCreateModal(true);
    };

    const saveGroup = () => {
        hapticLight();

        if (!groupName.trim() || selectedStudentIds.length === 0) {
            return;
        }

        if (editingGroup) {
            // Update existing group
            setGroups((prev) =>
                prev.map((g) =>
                    g.id === editingGroup.id
                        ? {
                              ...g,
                              name: groupName,
                              description: groupDescription || undefined,
                              studentIds: selectedStudentIds,
                          }
                        : g
                )
            );
        } else {
            // Create new group
            const newGroup: StudentGroup = {
                id: Date.now().toString(),
                name: groupName,
                description: groupDescription || undefined,
                studentIds: selectedStudentIds,
                createdAt: new Date().toISOString(),
                color: GROUP_COLORS[groups.length % GROUP_COLORS.length],
            };
            setGroups((prev) => [...prev, newGroup]);
        }

        setShowCreateModal(false);
        setEditingGroup(null);
        setGroupName('');
        setGroupDescription('');
        setSelectedStudentIds([]);
    };

    const deleteGroup = (groupId: string) => {
        hapticLight();
        setGroups((prev) => prev.filter((g) => g.id !== groupId));
    };

    const getStudentsByIds = (studentIds: string[]): Student[] => {
        return students.filter((s) => studentIds.includes(s.id));
    };

    const renderGroupCard = (group: StudentGroup) => {
        const groupStudents = getStudentsByIds(group.studentIds);

        return (
            <Box
                key={group.id}
                sx={{
                    backgroundColor: Theme.colors.midnightBlue,
                    borderRadius: Theme.corners.generous,
                    padding: Theme.spacing.md,
                    marginBottom: Theme.spacing.md,
                    borderLeftWidth: 4,
                    borderLeftColor: group.color,
                }}
            >
                <VStack space="sm">
                    {/* Header */}
                    <HStack space="md" alignItems="flex-start" justifyContent="space-between">
                        <HStack space="sm" alignItems="center" sx={{ flex: 1 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: Theme.corners.full,
                                    backgroundColor: group.color,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    opacity: Theme.opacity.heavy,
                                }}
                            >
                                <Users color={Theme.colors.white} size={20} />
                            </Box>
                            <VStack sx={{ flex: 1 }}>
                                <Text color={Theme.colors.sacredWhite} size="md" bold>
                                    {group.name}
                                </Text>
                                <Text color={Theme.colors.mistGray} size="xs">
                                    {groupStudents.length} {groupStudents.length === 1 ? 'student' : 'students'}
                                </Text>
                            </VStack>
                        </HStack>

                        {/* Actions */}
                        <HStack space="xs">
                            <Pressable onPress={() => openEditModal(group)}>
                                <Box
                                    sx={{
                                        padding: Theme.spacing.sm,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: Theme.colors.deepIndigo,
                                    }}
                                >
                                    <Edit2 color={Theme.colors.mistGray} size={16} />
                                </Box>
                            </Pressable>
                            <Pressable onPress={() => deleteGroup(group.id)}>
                                <Box
                                    sx={{
                                        padding: Theme.spacing.sm,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: Theme.colors.deepIndigo,
                                    }}
                                >
                                    <Trash2 color={Theme.colors.emberRed} size={16} />
                                </Box>
                            </Pressable>
                        </HStack>
                    </HStack>

                    {/* Description */}
                    {group.description && (
                        <Text color={Theme.colors.mistGray} size="sm">
                            {group.description}
                        </Text>
                    )}

                    {/* Student List */}
                    <Box
                        sx={{
                            backgroundColor: Theme.colors.deepIndigo,
                            borderRadius: Theme.corners.comfortable,
                            padding: Theme.spacing.sm,
                        }}
                    >
                        <VStack space="xs">
                            {groupStudents.map((student, index) => (
                                <HStack key={student.id} space="xs" alignItems="center">
                                    <Text color={Theme.colors.mistGray} size="xs">
                                        {index + 1}.
                                    </Text>
                                    <Text color={Theme.colors.pearlGray} size="xs">
                                        {student.full_name}
                                    </Text>
                                    {student.roll_number && (
                                        <Text color={Theme.colors.dimGray} size="xs">
                                            (#{student.roll_number})
                                        </Text>
                                    )}
                                </HStack>
                            ))}
                        </VStack>
                    </Box>
                </VStack>
            </Box>
        );
    };

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ padding: Theme.spacing.lg }}>
                {/* Header */}
                <VStack space="xs" mb="$6">
                    <Heading color={Theme.colors.sacredWhite} size="2xl">
                        Group Manager
                    </Heading>
                    <Text color={Theme.colors.mistGray} size="sm">
                        Create temporary student groups for activities
                    </Text>
                </VStack>

                {/* Groups List */}
                {isLoading ? (
                    <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}>
                        <Text color={Theme.colors.mistGray}>Loading groups...</Text>
                    </Box>
                ) : groups.length === 0 ? (
                    <Box
                        sx={{
                            padding: Theme.spacing.xl,
                            alignItems: 'center',
                            backgroundColor: Theme.colors.midnightBlue,
                            borderRadius: Theme.corners.generous,
                        }}
                    >
                        <Users color={Theme.colors.mistGray} size={48} />
                        <Text color={Theme.colors.mistGray} mt="$4" textAlign="center">
                            No groups yet. Tap the + button to create your first group.
                        </Text>
                    </Box>
                ) : (
                    <VStack space="md">{groups.map(renderGroupCard)}</VStack>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <Pressable
                onPress={openCreateModal}
                style={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                }}
            >
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: Theme.corners.full,
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        justifyContent: 'center',
                        alignItems: 'center',
                        ...Theme.shadows.lg,
                    }}
                >
                    <Plus color={Theme.colors.white} size={24} />
                </Box>
            </Pressable>

            {/* Create/Edit Group Modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
                <ModalBackdrop />
                <ModalContent
                    sx={{
                        backgroundColor: Theme.colors.midnightBlue,
                        maxWidth: 500,
                        maxHeight: '80%',
                    }}
                >
                    <ModalHeader>
                        <Heading color={Theme.colors.sacredWhite} size="lg">
                            {editingGroup ? 'Edit Group' : 'Create Group'}
                        </Heading>
                    </ModalHeader>

                    <ModalBody>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <VStack space="md">
                                {/* Group Name */}
                                <VStack space="xs">
                                    <Text color={Theme.colors.mistGray} size="sm">
                                        Group Name *
                                    </Text>
                                    <Input
                                        variant="outline"
                                        size="md"
                                        sx={{
                                            backgroundColor: Theme.colors.deepIndigo,
                                            borderColor: Theme.colors.transparent,
                                        }}
                                    >
                                        <InputField
                                            placeholder="e.g., Lab Group A"
                                            value={groupName}
                                            onChangeText={setGroupName}
                                            color={Theme.colors.sacredWhite}
                                            placeholderTextColor={Theme.colors.dimGray}
                                        />
                                    </Input>
                                </VStack>

                                {/* Group Description */}
                                <VStack space="xs">
                                    <Text color={Theme.colors.mistGray} size="sm">
                                        Description (Optional)
                                    </Text>
                                    <Input
                                        variant="outline"
                                        size="md"
                                        sx={{
                                            backgroundColor: Theme.colors.deepIndigo,
                                            borderColor: Theme.colors.transparent,
                                        }}
                                    >
                                        <InputField
                                            placeholder="e.g., First lab rotation"
                                            value={groupDescription}
                                            onChangeText={setGroupDescription}
                                            color={Theme.colors.sacredWhite}
                                            placeholderTextColor={Theme.colors.dimGray}
                                        />
                                    </Input>
                                </VStack>

                                {/* Student Selection */}
                                <VStack space="xs">
                                    <Text color={Theme.colors.mistGray} size="sm">
                                        Select Students * ({selectedStudentIds.length} selected)
                                    </Text>
                                    <Box
                                        sx={{
                                            backgroundColor: Theme.colors.deepIndigo,
                                            borderRadius: Theme.corners.comfortable,
                                            padding: Theme.spacing.sm,
                                            maxHeight: 300,
                                        }}
                                    >
                                        <ScrollView showsVerticalScrollIndicator={true}>
                                            <VStack space="xs">
                                                {students.map((student) => (
                                                    <Pressable
                                                        key={student.id}
                                                        onPress={() => toggleStudentSelection(student.id)}
                                                    >
                                                        <HStack
                                                            space="sm"
                                                            alignItems="center"
                                                            sx={{
                                                                padding: Theme.spacing.sm,
                                                                borderRadius: Theme.corners.comfortable,
                                                                backgroundColor: selectedStudentIds.includes(
                                                                    student.id
                                                                )
                                                                    ? Theme.colors.sanctuarySaffron + '20'
                                                                    : Theme.colors.transparent,
                                                            }}
                                                        >
                                                            <Checkbox
                                                                value={student.id}
                                                                isChecked={selectedStudentIds.includes(student.id)}
                                                                onChange={() => toggleStudentSelection(student.id)}
                                                                size="sm"
                                                            >
                                                                <CheckboxIndicator
                                                                    sx={{
                                                                        borderColor: selectedStudentIds.includes(
                                                                            student.id
                                                                        )
                                                                            ? Theme.colors.sanctuarySaffron
                                                                            : Theme.colors.mistGray,
                                                                        backgroundColor: selectedStudentIds.includes(
                                                                            student.id
                                                                        )
                                                                            ? Theme.colors.sanctuarySaffron
                                                                            : Theme.colors.transparent,
                                                                    }}
                                                                >
                                                                    <CheckboxIcon as={CheckIcon} />
                                                                </CheckboxIndicator>
                                                            </Checkbox>
                                                            <VStack sx={{ flex: 1 }}>
                                                                <Text color={Theme.colors.sacredWhite} size="sm">
                                                                    {student.full_name}
                                                                </Text>
                                                                {student.roll_number && (
                                                                    <Text
                                                                        color={Theme.colors.dimGray}
                                                                        size="xs"
                                                                    >
                                                                        Roll #{student.roll_number}
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                        </HStack>
                                                    </Pressable>
                                                ))}
                                            </VStack>
                                        </ScrollView>
                                    </Box>
                                </VStack>
                            </VStack>
                        </ScrollView>
                    </ModalBody>

                    <ModalFooter>
                        <HStack space="sm">
                            <Button
                                variant="outline"
                                action="secondary"
                                onPress={() => setShowCreateModal(false)}
                                sx={{
                                    flex: 1,
                                    borderColor: Theme.colors.mistGray,
                                }}
                            >
                                <ButtonText color={Theme.colors.mistGray}>Cancel</ButtonText>
                            </Button>
                            <Button
                                action="primary"
                                onPress={saveGroup}
                                sx={{
                                    flex: 1,
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                }}
                                isDisabled={!groupName.trim() || selectedStudentIds.length === 0}
                            >
                                <ButtonText color={Theme.colors.white}>
                                    {editingGroup ? 'Update' : 'Create'}
                                </ButtonText>
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
