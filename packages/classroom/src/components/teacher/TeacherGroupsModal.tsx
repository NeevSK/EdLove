import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Button,
    ButtonText,
    HStack,
    Heading,
    Input,
    InputField,
    SanctuaryModal,
    Pressable,
    ScrollView,
    Text,
    VStack,
    useLotusToast,
    Icon,
    hapticLight,
} from '@repo/ui';
import { classroomGroupsAPI } from '@repo/core';
import { Check, Edit3, Layers, Plus, Trash2, User } from 'lucide-react-native';

interface TeacherGroupsModalProps {
    classroomId: string;
    isOpen: boolean;
    onClose: () => void;
    students: Array<{ id: string; full_name: string }>;
}

type ClassroomGroup = Awaited<ReturnType<typeof classroomGroupsAPI.getAll>>[number];

const GROUP_ACCENTS = [
    'bg-sanctuarySaffron',
    'bg-sageGreen',
    'bg-gurudeviBlue',
    'bg-emberRed',
    'bg-sanctuarySaffron/60',
];

export default function TeacherGroupsModal({
    classroomId,
    isOpen,
    onClose,
    students,
}: TeacherGroupsModalProps) {
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
        hapticLight();
        setSelectedStudentIds((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    const startEditing = (group: ClassroomGroup) => {
        hapticLight();
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
                    color: '#F6BF8C', // Default saffron accent
                });
            }
            resetEditor();
            await loadGroups();
            showToast({ message: 'Classroom group saved.', type: 'success' });
        } catch (error) {
            console.error('Failed to save classroom group', error);
            showToast({ message: 'Could not save classroom group.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (groupId: string) => {
        hapticLight();
        try {
            await classroomGroupsAPI.delete(groupId);
            if (editingGroupId === groupId) {
                resetEditor();
            }
            await loadGroups();
            showToast({ message: 'Group deleted.', type: 'info' });
        } catch (error) {
            console.error('Failed to delete classroom group', error);
            showToast({ message: 'Could not delete classroom group.', type: 'error' });
        }
    };

    const footer = (
        <HStack className="w-full gap-3">
            <Button variant="outline" action="secondary" onPress={onClose} className="flex-1 rounded-2xl border-sanctuary-border/10 h-14">
                <ButtonText className="text-sanctuary-text-muted font-bold">Close</ButtonText>
            </Button>
            <Button
                action="primary"
                onPress={() => { hapticLight(); handleSave(); }}
                isDisabled={!name.trim() || isSaving}
                className="flex-1 rounded-2xl bg-sanctuarySaffron h-14"
            >
                <ButtonText className="text-white font-bold">
                    {editingGroupId ? 'Update Group' : 'Save Group'}
                </ButtonText>
            </Button>
        </HStack>
    );

    return (
        <SanctuaryModal
            visible={isOpen}
            onClose={onClose}
            title="Classroom Groups"
            footer={footer}
            className="max-w-[840px]"
        >
            <VStack className="gap-6 p-1">
                <Text className="text-sm leading-6 text-sanctuary-text-muted">
                    Build real student groupings without leaving the classroom surface. These groups stay synchronized across all teaching tools.
                </Text>

                <HStack className="items-start gap-10">
                    {/* Left Column: Existing Groups */}
                    <VStack className="flex-1 gap-4">
                        <HStack className="items-center justify-between">
                            <Heading size="xs" className="text-sanctuary-text font-bold">
                                Existing Groups
                            </Heading>
                            <Pressable onPress={() => { hapticLight(); resetEditor(); }} className="active:opacity-60 py-1 px-2">
                                <HStack className="items-center gap-1.5">
                                    <Icon as={Plus} size="xs" className="text-sanctuarySaffron" />
                                    <Text className="text-[11px] font-bold text-sanctuarySaffron uppercase tracking-tight">
                                        New Group
                                    </Text>
                                </HStack>
                            </Pressable>
                        </HStack>

                        <ScrollView className="max-h-[440px]" showsVerticalScrollIndicator={false}>
                            <VStack className="gap-3 pr-2">
                                {isLoading ? (
                                    <VStack className="gap-3">
                                        {[1, 2].map((i) => (
                                            <Box key={i} className="h-24 bg-sanctuary-surface-secondary rounded-2xl animate-pulse" />
                                        ))}
                                    </VStack>
                                ) : groups.length === 0 ? (
                                    <Box className="items-center justify-center rounded-[32px] border border-dashed border-sanctuary-border/20 bg-sanctuary-surface-secondary/20 p-10 gap-3">
                                        <Icon as={Layers} size="xl" className="text-sanctuary-text-muted/20" />
                                        <Text className="text-xs text-sanctuary-text-muted text-center font-medium">
                                            No classroom groups yet. Create one to organize assignments and discussions.
                                        </Text>
                                    </Box>
                                ) : (
                                    groups.map((group, idx) => (
                                        <Box
                                            key={group.id}
                                            className={`rounded-2xl border border-sanctuary-border/10 bg-sanctuary-surface-secondary/40 p-5 relative overflow-hidden shadow-sm`}
                                        >
                                            <Box className={`absolute left-0 top-0 bottom-0 w-1.5 ${GROUP_ACCENTS[idx % GROUP_ACCENTS.length]}`} />
                                            <VStack className="gap-3">
                                                <HStack className="items-start justify-between">
                                                    <VStack className="flex-1 gap-0.5">
                                                        <Text className="text-sm font-bold text-sanctuary-text">
                                                            {group.name}
                                                        </Text>
                                                        <Text className="text-[10px] font-bold text-sanctuary-text-muted uppercase tracking-[0.1em]">
                                                            {(group.student_ids || []).length} students
                                                        </Text>
                                                    </VStack>
                                                    <HStack className="gap-4">
                                                        <Pressable onPress={() => startEditing(group)} className="active:opacity-50 p-1">
                                                            <Icon as={Edit3} size="xs" className="text-sanctuary-text-muted" />
                                                        </Pressable>
                                                        <Pressable onPress={() => handleDelete(group.id)} className="active:opacity-50 p-1">
                                                            <Icon as={Trash2} size="xs" className="text-emberRed" />
                                                        </Pressable>
                                                    </HStack>
                                                </HStack>
                                                {!!group.description && (
                                                    <Text className="text-xs text-sanctuary-text-muted leading-5 italic">
                                                        {group.description}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </Box>
                                    ))
                                )}
                            </VStack>
                        </ScrollView>
                    </VStack>

                    {/* Right Column: Editor */}
                    <VStack className="flex-1 gap-5">
                        <Heading size="xs" className="text-sanctuary-text font-bold">
                            {editingGroupId ? 'Edit Group' : 'Create Group'}
                        </Heading>
                        
                        <VStack className="gap-4">
                            <VStack className="gap-1.5">
                                <Text className="text-[10px] font-bold uppercase text-sanctuary-text-muted ml-1">Name</Text>
                                <Input className="h-12 rounded-xl bg-sanctuary-surface-secondary/80 border-sanctuary-border/10 px-1">
                                    <InputField 
                                        placeholder="Group name" 
                                        value={name} 
                                        onChangeText={setName} 
                                        className="text-sm text-sanctuary-text font-medium" 
                                    />
                                </Input>
                            </VStack>

                            <VStack className="gap-1.5">
                                <Text className="text-[10px] font-bold uppercase text-sanctuary-text-muted ml-1">Description</Text>
                                <Input className="rounded-xl bg-sanctuary-surface-secondary/80 border-sanctuary-border/10 p-2 min-h-[90px]">
                                    <InputField 
                                        placeholder="Add a brief description..." 
                                        value={description} 
                                        onChangeText={setDescription} 
                                        className="text-sm text-sanctuary-text leading-5"
                                        multiline
                                        placeholderTextColor="#94a3b8"
                                    />
                                </Input>
                            </VStack>
                        </VStack>

                        <VStack className="gap-3">
                            <Text className="text-[10px] font-bold uppercase tracking-[0.15em] text-sanctuary-text-muted ml-1">
                                Select Students ({(selectedStudentIds || []).length})
                            </Text>
                            <ScrollView className="max-h-[300px]" showsVerticalScrollIndicator={false}>
                                <VStack className="gap-2 pr-1">
                                    {students.map((student) => {
                                        const isActive = selectedStudentIds.includes(student.id);
                                        return (
                                            <Pressable 
                                                key={student.id} 
                                                onPress={() => toggleStudent(student.id)}
                                                className={`rounded-xl border p-4 shadow-sm ${
                                                    isActive 
                                                        ? 'bg-sanctuarySaffron border-sanctuarySaffron/20' 
                                                        : 'bg-sanctuary-surface-secondary/40 border-sanctuary-border/5'
                                                }`}
                                            >
                                                <HStack className="items-center justify-between">
                                                    <HStack className="items-center gap-3">
                                                        <Icon 
                                                            as={User} 
                                                            size="xs" 
                                                            className={isActive ? 'text-white' : 'text-sanctuary-text-muted'} 
                                                        />
                                                        <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-sanctuary-text'}`}>
                                                            {student.full_name}
                                                        </Text>
                                                    </HStack>
                                                    {isActive && <Icon as={Check} size="xs" className="text-white" />}
                                                </HStack>
                                            </Pressable>
                                        );
                                    })}
                                </VStack>
                            </ScrollView>
                        </VStack>
                    </VStack>
                </HStack>
            </VStack>
        </SanctuaryModal>
    );
}

