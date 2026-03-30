import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    ButtonText,
    HStack,
    Heading,
    Input,
    InputField,
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Pressable,
    ScrollView,
    Text,
    Theme,
    VStack,
    useLotusToast,
    useThemedColors,
} from '@repo/ui';
import { classroomGroupsAPI } from '@repo/core';
import { Edit2, Layers3, Plus, Trash2, Users } from 'lucide-react-native';

interface TeacherGroupsModalProps {
    classroomId: string;
    isOpen: boolean;
    onClose: () => void;
    students: Array<{ id: string; full_name: string }>;
}

type ClassroomGroup = Awaited<ReturnType<typeof classroomGroupsAPI.getAll>>[number];

const GROUP_COLORS = [
    Theme.colors.sanctuarySaffron,
    Theme.colors.sageGreen,
    Theme.colors.gurudeviBlue,
    Theme.colors.gurudeviViolet,
    Theme.colors.amberGlow,
];

export default function TeacherGroupsModal({
    classroomId,
    isOpen,
    onClose,
    students,
}: TeacherGroupsModalProps) {
    const colors = useThemedColors();
    const { showToast } = useLotusToast();
    const [groups, setGroups] = useState<ClassroomGroup[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const loadGroups = async () => {
        setIsLoading(true);
        try {
            const data = await classroomGroupsAPI.getAll(classroomId);
            setGroups(data || []);
        } catch (error) {
            console.error('Failed to load classroom groups', error);
            showToast({ message: 'Could not load classroom groups.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadGroups();
        }
    }, [classroomId, isOpen]);

    const resetEditor = () => {
        setEditingGroupId(null);
        setName('');
        setDescription('');
        setSelectedStudentIds([]);
    };

    const toggleStudent = (studentId: string) => {
        setSelectedStudentIds((prev) =            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    const startEditing = (group: ClassroomGroup) => {
        setEditingGroupId(group.id);
        setName(group.name);
        setDescription(group.description || '');
        setSelectedStudentIds(group.student_ids || []);
    };

    const handleSave = async () => {
        if (!name.trim()) return;
        setIsSaving(true);
        try {
            if (editingGroupId) {
                await classroomGroupsAPI.update(editingGroupId, {
                        name: name.trim(),
                        description: description.trim() || null,
                        student_ids: selectedStudentIds,
                });
            } else {
                await classroomGroupsAPI.create(classroomId, {
                    name: name.trim(),
                    description: description.trim() || null,
                    student_ids: selectedStudentIds,
                    color: GROUP_COLORS[groups.length % GROUP_COLORS.length],
                });
            }
            resetEditor();
            await loadGroups();
        } catch (error) {
            console.error('Failed to save classroom group', error);
            showToast({ message: 'Could not save classroom group.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (groupId: string) => {
        try {
            await classroomGroupsAPI.delete(groupId);
            if (editingGroupId === groupId) {
                resetEditor();
            }
            await loadGroups();
        } catch (error) {
            console.error('Failed to delete classroom group', error);
            showToast({ message: 'Could not delete classroom group.', type: 'error' });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}            <ModalBackdrop /            ><ModalContent
                sx={{
                    backgroundColor: colors.primary,
                    borderWidth: 1,
                    borderColor: colors.border,
                    maxWidth: 720,
                    width: '92%',
                    maxHeight: '88%',
                }}
                            <ModalHeader                    <VStack >sx={{ gap: 4 }}                        <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}                            Classroom groups
                        </Heading                        <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}                            Build real student groupings without leaving the classroom surface.
                        </Text                    </VStack                </ModalHeader                <ModalBody                    <HStack >sx={{ gap: Theme.spacing.lg, alignItems: 'flex-start' }}                        <VStack sx={{ flex: 1, gap: Theme.spacing.md }}                            <HStack sx={{ alignItems: 'center', justifyContent: 'space-between' }}                                <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md }}                                    Existing groups
                                </Heading                                <Pressable onPress={resetEditor}                                    <HStack sx={{ alignItems: 'center', gap: 4 }}                                        <Plus size={16} color={Theme.colors.sanctuarySaffron} /                                        ><Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '700' as const }}                                            New group
                                        </Text                                    </HStack                                </Pressable                            </HStack                            <ScrollView style={{ maxHeight: 340 }}                                <VStack sx={{ gap: Theme.spacing.sm }}                                    {isLoading ? (
                                        <Text sx={{ color: colors.textSecondary }}>Loading groups...</Text                                    >) : groups.length === 0 ? (
                                        <Box>
                                            sx={{
                                                backgroundColor: colors.secondary,
                                                borderRadius: Theme.corners.comfortable,
                                                borderWidth: 1,
                                                borderColor: colors.border,
                                                padding: Theme.spacing.lg,
                                                alignItems: 'center',
                                                gap: Theme.spacing.sm,
                                            }}
                                                                                    <Layers3 size={28} color={colors.textTertiary} /                                            ><Text sx={{ color: colors.textSecondary, textAlign: 'center' }}                                                No classroom groups yet.
                                            </Text                                        ></Box                                    ) : (
                                        groups.map((group) => (
                                            <Box>
                                                key={group.id}
                                                sx={{
                                                    backgroundColor: colors.secondary,
                                                    borderRadius: Theme.corners.comfortable,
                                                    borderWidth: 1,
                                                    borderColor: colors.border,
                                                    borderLeftWidth: 4,
                                                    borderLeftColor: group.color || Theme.colors.sanctuarySaffron,
                                                    padding: Theme.spacing.md,
                                                }}
                                                                                            <VStack sx={{ gap: Theme.spacing.xs }}                                                    <HStack sx={{ alignItems: 'center', justifyContent: 'space-between', gap: Theme.spacing.md }}                                                        <VStack sx={{ flex: 1 }}                                                            <Text sx={{ color: colors.text, fontWeight: '700' as const }}                                                                {group.name}>
                                                            </Text                                                            ><Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}                                                                {(group.student_ids || []).length} students>
                                                            </Text                                                        ></VStack                                                        ><HStack sx={{ gap: Theme.spacing.sm }}                                                            <Pressable onPress={() => startEditing(group)}                                                                <Edit2 size={16} color={colors.textSecondary} /                                                            ></Pressable                                                            <Pressable onPress={() => handleDelete(group.id)}                                                                <Trash2 size={16} color={Theme.colors.emberRed} /                                                            ></Pressable                                                        </HStack                                                    </HStack                                                    {!!group.description && (
                                                        <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}                                                            {group.description}>
                                                        </Text                                                    >)}>
                                                </VStack                                            </Box                                        ))
                                    )}
                                </VStack                            </ScrollView                        </VStack
                        <VStack sx={{ flex: 1, gap: Theme.spacing.md }}                            <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md }}                                {editingGroupId ? 'Edit group' : 'Create group'}>
                            </Heading                            ><Input sx={{ backgroundColor: colors.secondary, borderColor: colors.border }}                                <InputField placeholder="Group name" value={name} onChangeText={setName} color={colors.text} /                            ></Input                            <Input sx={{ backgroundColor: colors.secondary, borderColor: colors.border }}                                <InputField placeholder="Description" value={description} onChangeText={setDescription} color={colors.text} /                            ></Input                            <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}                                Select students
                            </Text                            <ScrollView style={{ maxHeight: 250 }}                                <VStack sx={{ gap: Theme.spacing.xs }}                                    {students.map((student) => {
                                        const isActive = selectedStudentIds.includes(student.id);
                                        return (
                                            <Pressable key={student.id} onPress={() => toggleStudent(student.id)}                                                <Box
                                                    sx={{
                                                        backgroundColor: isActive ? Theme.colors.sanctuarySaffron : colors.secondary,
                                                        borderRadius: Theme.corners.comfortable,
                                                        borderWidth: 1,
                                                        borderColor: isActive ? Theme.colors.sanctuarySaffron : colors.border,
                                                        padding: Theme.spacing.sm,
                                                    }}
                                                                                                    <HStack sx={{ alignItems: 'center', justifyContent: 'space-between' }}                                                        <HStack sx={{ alignItems: 'center', gap: Theme.spacing.sm }}                                                            <Users size={14} color={isActive ? Theme.colors.sacredWhite : colors.textSecondary} /                                                            ><Text sx={{ color: isActive ? Theme.colors.sacredWhite : colors.text }}                                                                {student.full_name}
                                                            </Text                                                        </HStack                                                        <Text sx={{ color: isActive ? Theme.colors.sacredWhite : colors.textTertiary, fontSize: Theme.typography.fontSize.xs }}                                                            {isActive ? 'Selected' : 'Tap to add'}
                                                        </Text                                                    </HStack                                                </Box                                            </Pressable                                        );
                                    })}
                                </VStack                            </ScrollView                        </VStack                    </HStack                </ModalBody                <ModalFooter                    <HStack >sx={{ gap: Theme.spacing.sm }}                        <Button variant="outline" action="secondary" onPress={onClose}                            <ButtonText color={colors.textSecondary}>Close</ButtonText                        ></Button                        <Button
                            action="primary"
                            onPress={handleSave}
                            isDisabled={!name.trim() || isSaving}
                            sx={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                                                    <ButtonText color={Theme.colors.sacredWhite}                                {editingGroupId ? 'Update Group' : 'Save Group'}>
                            </ButtonText                        ></Button                    </HStack                </ModalFooter            </ModalContent        </Modal    );>
}
