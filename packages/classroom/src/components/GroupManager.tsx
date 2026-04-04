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
    Theme,
    hapticLight,
    useThemedColors,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Trash2, Edit2, Check as CheckIcon } from 'lucide-react-native';

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
    Theme.colors.twilightBlue,
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
    const colors = useThemedColors();
    const { t } = useTranslation();

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
                color: GROUP_COLORS[0] ?? '#CCCCCC',
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

        const generateId = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        };

        if (editingGroup) {
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
            const newGroup: StudentGroup = {
                id: generateId(),
                name: groupName,
                description: groupDescription || undefined,
                studentIds: selectedStudentIds,
                createdAt: new Date().toISOString(),
                color: GROUP_COLORS[groups.length % GROUP_COLORS.length] ?? '#CCCCCC',
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
                    backgroundColor: colors.secondary,
                    borderRadius: Theme.corners.generous,
                    padding: Theme.spacing.md,
                    marginBottom: Theme.spacing.md,
                    borderLeftWidth: 4,
                    borderLeftColor: group.color,
                    borderColor: colors.border,
                    borderWidth: 1,
                }}
            >
                <VStack sx={{ gap: Theme.spacing.sm }}>
                    <HStack sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: Theme.spacing.md }}>
                        <HStack sx={{ flex: 1, alignItems: 'center', gap: Theme.spacing.sm }}>
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
                                <Users color={Theme.colors.sacredWhite} size={20} />
                            </Box>
                            <VStack sx={{ flex: 1 }}>
                                <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md, fontWeight: '700' as const }}>
                                    {group.name}
                                </Text>
                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>
                                    {t('groups.selectedCount', { count: groupStudents.length }) || `${groupStudents.length} students`}
                                </Text>
                            </VStack>
                        </HStack>

                        <HStack sx={{ gap: Theme.spacing.xs }}>
                            <Pressable onPress={() => openEditModal(group)}>
                                <Box
                                    sx={{
                                        padding: Theme.spacing.sm,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: colors.tertiary,
                                        borderColor: colors.border,
                                        borderWidth: 1,
                                    }}
                                >
                                    <Edit2 color={colors.textSecondary} size={16} />
                                </Box>
                            </Pressable>
                            <Pressable onPress={() => deleteGroup(group.id)}>
                                <Box
                                    sx={{
                                        padding: Theme.spacing.sm,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: colors.tertiary,
                                        borderColor: colors.border,
                                        borderWidth: 1,
                                    }}
                                >
                                    <Trash2 color={Theme.colors.emberRed} size={16} />
                                </Box>
                            </Pressable>
                        </HStack>
                    </HStack>

                    {group.description && (
                        <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                            {group.description}
                        </Text>
                    )}

                    <Box
                        sx={{
                            backgroundColor: colors.tertiary,
                            borderRadius: Theme.corners.comfortable,
                            padding: Theme.spacing.sm,
                            borderColor: colors.border,
                            borderWidth: 1,
                        }}
                    >
                        <VStack sx={{ gap: Theme.spacing.xs }}>
                            {groupStudents.map((student, index) => (
                                <HStack key={student.id} sx={{ alignItems: 'center', gap: Theme.spacing.xs }}>
                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>
                                        {index + 1}.
                                    </Text>
                                    <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.xs }}>
                                        {student.full_name}
                                    </Text>
                                    {student.roll_number && (
                                        <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs }}>
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
        <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ padding: Theme.spacing.lg }}>
                <VStack sx={{ marginBottom: Theme.spacing.xl, gap: Theme.spacing.xs }}>
                    <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize['2xl'] }}>
                        {t('groups.title') || 'Group Manager'}
                    </Heading>
                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                        {t('groups.subtitle') || 'Create temporary student groups for activities'}
                    </Text>
                </VStack>

                {isLoading ? (
                    <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}>
                        <Text sx={{ color: Theme.colors.mistGray }}>Loading groups...</Text>
                    </Box>
                ) : groups.length === 0 ? (
                    <Box
                        sx={{
                            padding: Theme.spacing.xl,
                            alignItems: 'center',
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.generous,
                            borderColor: colors.border,
                            borderWidth: 1,
                        }}
                    >
                        <Users color={colors.textSecondary} size={48} />
                        <Text sx={{ color: colors.textSecondary, marginTop: Theme.spacing.md, textAlign: 'center' }}>
                            {t('groups.emptyState') || 'No groups yet. Tap the + button to create your first group.'}
                        </Text>
                    </Box>
                ) : (
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        {groups.map(renderGroupCard)}
                    </VStack>
                )}
            </ScrollView>

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

            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <ModalBackdrop />
                <ModalContent
                    sx={{
                        backgroundColor: colors.primary,
                        maxWidth: 500,
                        maxHeight: '80%',
                        borderColor: colors.border,
                        borderWidth: 1,
                    }}
                >
                    <ModalHeader>
                        <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}>
                            {editingGroup ? (t('groups.editGroup') || 'Edit Group') : (t('groups.createGroup') || 'Create Group')}
                        </Heading>
                    </ModalHeader>

                    <ModalBody>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <VStack sx={{ gap: Theme.spacing.md }}>
                                <VStack sx={{ gap: Theme.spacing.xs }}>
                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                        {t('groups.nameLabel') || 'Group Name *'}
                                    </Text>
                                    <Input
                                        sx={{
                                            backgroundColor: colors.tertiary,
                                            borderColor: colors.border,
                                            borderRadius: Theme.corners.comfortable,
                                        }}
                                    >
                                        <InputField
                                            placeholder={t('groups.namePlaceholder') || "e.g., Lab Group A"}
                                            value={groupName}
                                            onChangeText={setGroupName}
                                            sx={{ color: colors.text }}
                                        />
                                    </Input>
                                </VStack>

                                <VStack sx={{ gap: Theme.spacing.xs }}>
                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                        {t('groups.descriptionLabel') || 'Description (Optional)'}
                                    </Text>
                                    <Input
                                        sx={{
                                            backgroundColor: colors.tertiary,
                                            borderColor: colors.border,
                                            borderRadius: Theme.corners.comfortable,
                                        }}
                                    >
                                        <InputField
                                            placeholder={t('groups.descriptionPlaceholder') || "e.g., First lab rotation"}
                                            value={groupDescription}
                                            onChangeText={setGroupDescription}
                                            sx={{ color: colors.text }}
                                        />
                                    </Input>
                                </VStack>

                                <VStack sx={{ gap: Theme.spacing.xs }}>
                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                        {t('groups.selectStudentsLabel', { count: selectedStudentIds.length }) || `Select Students * (${selectedStudentIds.length} selected)`}
                                    </Text>
                                    <Box
                                        sx={{
                                            backgroundColor: colors.secondary,
                                            borderRadius: Theme.corners.comfortable,
                                            padding: Theme.spacing.sm,
                                            maxHeight: 300,
                                            borderColor: colors.border,
                                            borderWidth: 1,
                                        }}
                                    >
                                        <ScrollView showsVerticalScrollIndicator={true}>
                                            <VStack sx={{ gap: Theme.spacing.xs }}>
                                                {students.map((student) => (
                                                    <Pressable
                                                        key={student.id}
                                                        onPress={() => toggleStudentSelection(student.id)}
                                                    >
                                                        <HStack
                                                            sx={{
                                                                alignItems: 'center',
                                                                gap: Theme.spacing.sm,
                                                                padding: Theme.spacing.sm,
                                                                borderRadius: Theme.corners.comfortable,
                                                                backgroundColor: selectedStudentIds.includes(
                                                                    student.id
                                                                )
                                                                    ? 'rgba(235,166,90,0.1)'
                                                                    : Theme.colors.transparent,
                                                            }}
                                                        >
                                                            <Checkbox
                                                                value={student.id}
                                                                isChecked={selectedStudentIds.includes(student.id)}
                                                                onChange={() => toggleStudentSelection(student.id)}
                                                                aria-label="Select student"
                                                            >
                                                                <CheckboxIndicator
                                                                    sx={{
                                                                        borderColor: selectedStudentIds.includes(
                                                                            student.id
                                                                        )
                                                                            ? Theme.colors.sanctuarySaffron
                                                                            : colors.textSecondary,
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
                                                                <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.sm }}>
                                                                    {student.full_name}
                                                                </Text>
                                                                {student.roll_number && (
                                                                    <Text
                                                                        sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs }}
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
                        <HStack sx={{ gap: Theme.spacing.sm }}>
                            <Button
                                variant="outline"
                                action="secondary"
                                onPress={() => setShowCreateModal(false)}
                                sx={{
                                    flex: 1,
                                    borderColor: colors.border,
                                }}
                            >
                                <ButtonText sx={{ color: colors.textSecondary }}>Cancel</ButtonText>
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
                                <ButtonText sx={{ color: Theme.colors.sacredWhite }}>
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
