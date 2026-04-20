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
    'bg-sanctuary-success',
    'bg-sanctuary-info',
    'bg-sanctuary-error',
    'bg-sanctuary-warning',
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
        <HStack className="w-full gap-4">
            <Button 
                variant="outline" 
                action="secondary" 
                onPress={onClose} 
                className="flex-1 rounded-full border-sanctuary-border h-14 active:bg-sanctuary-surface-secondary"
            >
                <ButtonText className="text-sanctuary-text font-black uppercase text-xs tracking-widest">Close</ButtonText>
            </Button>
            <Button
                action="primary"
                onPress={() => { hapticLight(); handleSave(); }}
                isDisabled={!name.trim() || isSaving}
                className="flex-1 rounded-full bg-sanctuarySaffron h-14 shadow-md"
            >
                <ButtonText className="text-sacredWhite font-black uppercase text-xs tracking-widest">
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
        <VStack className="gap-8 p-1">
                <Text className="text-sm leading-relaxed text-sanctuary-text font-medium opacity-70 max-w-2xl">
                    Build real student groupings without leaving the classroom surface. These groups stay synchronized across all teaching tools.
                </Text>

                <HStack className="items-start gap-12">
                    {/* Left Column: Existing Groups */}
                    <VStack className="flex-1 gap-6">
                        <HStack className="items-center justify-between">
                            <Heading className="text-xs text-sanctuary-text-tertiary font-black uppercase tracking-[0.2em]">
                                Existing Groups
                            </Heading>
                            <Pressable onPress={() => { hapticLight(); resetEditor(); }} className="active:opacity-60 py-1 px-3 bg-sanctuarySaffron/10 rounded-full border border-sanctuarySaffron/20">
                                <HStack className="items-center gap-1.5">
                                    <Icon as={Plus} size="xs" className="text-sanctuarySaffron" />
                                    <Text className="text-[10px] font-black text-sanctuarySaffron uppercase tracking-widest">
                                        New
                                    </Text>
                                </HStack>
                            </Pressable>
                        </HStack>

                        <ScrollView className="max-h-[440px]" showsVerticalScrollIndicator={false}>
                            <VStack className="gap-3 pr-2">
                                {isLoading ? (
                                    <VStack className="gap-4">
                                        {[1, 2].map((i) => (
                                            <Box key={i} className="h-28 bg-sanctuary-surface-secondary/40 rounded-[28px] border border-sanctuary-border/60 animate-pulse" />
                                        ))}
                                    </VStack>
                                ) : groups.length === 0 ? (
                                    <Box className="items-center justify-center rounded-[32px] border border-dashed border-sanctuary-border bg-sanctuary-surface-secondary/20 p-12 gap-4">
                                        <Icon as={Layers} size="lg" className="text-sanctuary-text-tertiary opacity-30" />
                                        <Text className="text-sm text-sanctuary-text-tertiary text-center font-medium leading-relaxed max-w-[200px]">
                                            No classroom groups yet. Create one to organize your teaching.
                                        </Text>
                                    </Box>
                                ) : (
                                    groups.map((group, idx) => (
                                        <Box
                                            key={group.id}
                                            className={`rounded-[28px] border border-sanctuary-border bg-sanctuary-surface-secondary/40 p-6 relative overflow-hidden shadow-sm`}
                                        >
                                            <Box className={`absolute left-0 top-0 bottom-0 w-2 ${GROUP_ACCENTS[idx % GROUP_ACCENTS.length]}`} />
                                            <VStack className="gap-4">
                                                <HStack className="items-start justify-between">
                                                    <VStack className="flex-1 gap-1">
                                                        <Text className="text-lg font-black text-sanctuary-text tracking-tight">
                                                            {group.name}
                                                        </Text>
                                                        <Text className="text-[10px] font-black text-sanctuary-text-tertiary uppercase tracking-[0.2em]">
                                                            {(group.student_ids || []).length} members
                                                        </Text>
                                                    </VStack>
                                                    <HStack className="gap-3">
                                                        <Pressable onPress={() => startEditing(group)} className="w-9 h-9 items-center justify-center rounded-full bg-sanctuary-surface-secondary border border-sanctuary-border active:opacity-50">
                                                            <Icon as={Edit3} size="xs" className="text-sanctuary-text-tertiary" />
                                                        </Pressable>
                                                        <Pressable onPress={() => handleDelete(group.id)} className="w-9 h-9 items-center justify-center rounded-full bg-sanctuary-surface-secondary border border-sanctuary-border active:opacity-50">
                                                            <Icon as={Trash2} size="xs" className="text-sanctuary-error" />
                                                        </Pressable>
                                                    </HStack>
                                                </HStack>
                                                {!!group.description && (
                                                    <Text className="text-[13px] text-sanctuary-text-tertiary leading-relaxed font-medium italic">
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
                    <VStack className="flex-1 gap-8">
                        <Heading className="text-xs text-sanctuary-text-tertiary font-black uppercase tracking-[0.2em]">
                            {editingGroupId ? 'Edit Group' : 'Create Group'}
                        </Heading>
                        
                        <VStack className="gap-6">
                            <VStack className="gap-2.5">
                                <Text className="text-[10px] font-black uppercase text-sanctuary-text-tertiary ml-1 tracking-widest">Name</Text>
                                <Input className="h-14 rounded-[20px] bg-sanctuary-surface-secondary/40 border-sanctuary-border px-4">
                                    <InputField 
                                        placeholder="Enter group name" 
                                        value={name} 
                                        onChangeText={setName} 
                                        className="text-sm text-sanctuary-text font-black" 
                                    />
                                </Input>
                            </VStack>
 
                            <VStack className="gap-2.5">
                                <Text className="text-[10px] font-black uppercase text-sanctuary-text-tertiary ml-1 tracking-widest">Description</Text>
                                <Input className="rounded-[20px] bg-sanctuary-surface-secondary/40 border-sanctuary-border p-4 min-h-[110px]">
                                    <InputField 
                                        placeholder="What is this group for?" 
                                        value={description} 
                                        onChangeText={setDescription} 
                                        className="text-sm text-sanctuary-text leading-relaxed font-medium"
                                        multiline
                                        placeholderTextColor="#94a3b8"
                                    />
                                </Input>
                            </VStack>
                        </VStack>

                        <VStack className="gap-4">
                            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-sanctuary-text-tertiary ml-1">
                                Members ({(selectedStudentIds || []).length})
                            </Text>
                            <ScrollView className="max-h-[320px]" showsVerticalScrollIndicator={false}>
                                <VStack className="gap-2.5 pr-1">
                                    {students.map((student) => {
                                        const isActive = selectedStudentIds.includes(student.id);
                                        return (
                                            <Pressable 
                                                key={student.id} 
                                                onPress={() => toggleStudent(student.id)}
                                                className={`rounded-[20px] border px-5 py-4 shadow-sm ${
                                                    isActive 
                                                        ? 'bg-sanctuarySaffron border-sanctuarySaffron' 
                                                        : 'bg-sanctuary-surface-secondary/40 border-sanctuary-border'
                                                }`}
                                            >
                                                <HStack className="items-center justify-between">
                                                    <HStack className="items-center gap-4">
                                                        <Icon 
                                                            as={User} 
                                                            size="xs" 
                                                            className={isActive ? 'text-sacredWhite' : 'text-sanctuary-text-tertiary'} 
                                                        />
                                                        <Text className={`text-sm font-black tracking-tight ${isActive ? 'text-sacredWhite' : 'text-sanctuary-text'}`}>
                                                            {student.full_name}
                                                        </Text>
                                                    </HStack>
                                                    {isActive && <Icon as={Check} size="xs" className="text-sacredWhite" />}
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

