import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Button,
    ButtonText,
    HStack,
    Heading,
    Input,
    InputField,
    Spinner,
    Text,
    VStack,
    Icon,
    hapticLight,
    SanctuaryModal,
} from '@repo/ui';
import { assignmentsAPI } from '@repo/core';
import { CalendarDays, ClipboardList, Clock3, Plus, Sparkles } from 'lucide-react-native';

interface TeacherAssignmentsWorkspaceProps {
    classroomId: string;
    canManage: boolean;
}

export default function TeacherAssignmentsWorkspace({
    classroomId,
    canManage,
}: TeacherAssignmentsWorkspaceProps) {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const loadAssignments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await assignmentsAPI.getAll(classroomId);
            setAssignments(data || []);
        } catch (error) {
            console.error('Failed to load assignments', error);
        } finally {
            setIsLoading(false);
        }
    }, [classroomId]);

    useEffect(() => {
        loadAssignments();
    }, [loadAssignments]);

    const handleCreate = async () => {
        if (!title.trim()) return;
        setIsSaving(true);
        try {
            await assignmentsAPI.create({
                classroom_id: classroomId,
                title: title.trim(),
                description: description.trim(),
                due_date: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                max_points: 100,
            });
            setTitle('');
            setDescription('');
            setDueDate('');
            setShowCreateModal(false);
            await loadAssignments();
        } catch (error) {
            console.error('Failed to create assignment', error);
        } finally {
            setIsSaving(false);
        }
    };

    const upcomingCount = assignments.filter((assignment) => {
        if (!assignment.due_date) return false;
        return new Date(assignment.due_date).getTime() >= Date.now();
    }).length;

    return (
        <Box className="flex-1">
            <VStack className="gap-8 p-6">
                <Box
                    className="bg-sanctuary-surface-secondary/40 rounded-[32px] border border-sanctuary-border p-8"
                >
                    <VStack className="gap-8">
                        <HStack className="items-start justify-between gap-6 flex-wrap">
                            <VStack className="flex-1 min-w-[240px] gap-3">
                                <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-[0.3em]">
                                    Assignment Workspace
                                </Text>
                                <Heading className="text-3xl text-sanctuary-text font-black tracking-[1.1] leading-tight">
                                    Keep assignment momentum visible
                                </Heading>
                                <Text className="text-sanctuary-text text-sm leading-relaxed font-medium opacity-70 max-w-xl">
                                    See what is active, what is upcoming, and add top-level classroom work without disappearing into lesson structure.
                                </Text>
                            </VStack>
                            {canManage && (
                                <Button
                                    action="primary"
                                    onPress={() => { hapticLight(); setShowCreateModal(true); }}
                                    className="bg-sanctuarySaffron rounded-full px-7 h-12 shadow-sm active:opacity-85"
                                >
                                    <HStack className="items-center gap-2.5">
                                        <Icon as={Plus} size="sm" className="text-sacredWhite" />
                                        <ButtonText className="text-sacredWhite font-black uppercase text-xs tracking-[0.1em]">Create</ButtonText>
                                    </HStack>
                                </Button>
                            )}
                        </HStack>
                        <HStack className="gap-4 flex-wrap">
                            <SummaryPill
                                icon={<Icon as={ClipboardList} size="sm" className="text-sanctuarySaffron" />}
                                label="Total"
                                value={String(assignments.length)}
                            />
                            <SummaryPill
                                icon={<Icon as={Clock3} size="sm" className="text-sanctuary-info" />}
                                label="Upcoming"
                                value={String(upcomingCount)}
                            />
                            <SummaryPill
                                icon={<Icon as={Sparkles} size="sm" className="text-sanctuary-success" />}
                                label="State"
                                value={assignments.length > 0 ? 'Live' : 'Quiet'}
                            />
                        </HStack>
                    </VStack>
                </Box>
 
                {isLoading ? (
                    <Box className="py-20 items-center">
                        <Spinner className="text-sanctuarySaffron" />
                    </Box>
                ) : assignments.length === 0 ? (
                    <Box
                        className="bg-sanctuary-surface-secondary/20 rounded-[32px] border border-sanctuary-border p-12 items-center gap-4"
                    >
                        <Box className="w-16 h-16 bg-sanctuary-surface rounded-[24px] items-center justify-center border border-sanctuary-border">
                            <Icon as={ClipboardList} size="md" className="text-sanctuary-text-tertiary" />
                        </Box>
                        <Heading className="text-lg text-sanctuary-text font-black tracking-tight uppercase">
                            No assignments yet
                        </Heading>
                        <Text className="text-sanctuary-text-tertiary text-center text-sm leading-relaxed max-w-xs">
                            Create a classroom assignment here, or add one from a monthly lesson lane when the work belongs to a specific module.
                        </Text>
                    </Box>
                ) : (
                    assignments.map((assignment) => (
                        <Box
                            key={assignment.id}
                            className="bg-sanctuary-surface rounded-[32px] border border-sanctuary-border p-7 border-l-[6px] border-l-sanctuarySaffron shadow-sm"
                        >
                            <VStack className="gap-4">
                                <HStack className="items-center justify-between gap-6 flex-wrap">
                                    <Heading className="text-lg text-sanctuary-text font-black tracking-tight flex-1 uppercase">
                                        {assignment.title}
                                    </Heading>
                                    <HStack className="items-center gap-2 bg-sanctuary-surface-secondary border border-sanctuary-border px-3.5 py-1.5 rounded-full">
                                        <Icon as={CalendarDays} size="xs" className="text-sanctuary-info" />
                                        <Text className="text-sanctuary-text-tertiary text-[10px] tracking-[0.1em] uppercase font-black">
                                            {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                                        </Text>
                                    </HStack>
                                </HStack>
                                {!!assignment.description && (
                                    <Text className="text-sanctuary-text text-sm font-medium leading-relaxed opacity-70">
                                        {assignment.description}
                                    </Text>
                                )}
                                <HStack className="items-center justify-between mt-2 pt-4 border-t border-sanctuary-border">
                                    <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-[0.2em]">
                                        Max points: {assignment.max_points ?? 100}
                                    </Text>
                                    <Box className="bg-sanctuarySaffron/10 px-2 py-0.5 rounded-md">
                                        <Text className="text-sanctuarySaffron font-black text-[9px] uppercase tracking-widest italic">
                                            Classroom Level
                                        </Text>
                                    </Box>
                                </HStack>
                            </VStack>
                        </Box>
                    ))
                )}
            </VStack>

            <SanctuaryModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create assignment"
            >
                <VStack className="gap-6 p-1">
                    <VStack className="gap-2">
                        <Text className="text-[10px] font-black uppercase text-sanctuary-text-tertiary ml-1 tracking-[0.2em]">Title</Text>
                        <Input className="bg-sanctuary-surface-secondary border-sanctuary-border rounded-2xl h-14">
                            <InputField 
                                placeholder="Assignment title" 
                                value={title} 
                                onChangeText={setTitle} 
                                className="text-sanctuary-text text-sm font-bold" 
                                placeholderTextColor="#94a3b8"
                            />
                        </Input>
                    </VStack>
                    
                    <VStack className="gap-2">
                        <Text className="text-[10px] font-black uppercase text-sanctuary-text-tertiary ml-1 tracking-[0.2em]">Description</Text>
                        <Input className="bg-sanctuary-surface-secondary border-sanctuary-border rounded-2xl min-h-[120px] p-4">
                            <InputField
                                placeholder="What should students complete?"
                                value={description}
                                onChangeText={setDescription}
                                className="text-sanctuary-text text-sm font-medium"
                                multiline
                                placeholderTextColor="#94a3b8"
                            />
                        </Input>
                    </VStack>
 
                    <VStack className="gap-2">
                        <Text className="text-[10px] font-black uppercase text-sanctuary-text-tertiary ml-1 tracking-[0.2em]">Due Date</Text>
                        <Input className="bg-sanctuary-surface-secondary border-sanctuary-border rounded-2xl h-14">
                            <InputField
                                placeholder="YYYY-MM-DD"
                                value={dueDate}
                                onChangeText={setDueDate}
                                className="text-sanctuary-text text-sm font-bold"
                                placeholderTextColor="#94a3b8"
                            />
                        </Input>
                    </VStack>
 
                    <HStack className="gap-4 mt-6">
                        <Button 
                            variant="outline" 
                            action="secondary" 
                            onPress={() => setShowCreateModal(false)} 
                            className="flex-1 rounded-full h-14 border-sanctuary-border active:bg-sanctuary-surface-secondary"
                        >
                            <ButtonText className="text-sanctuary-text font-black uppercase text-xs tracking-widest">Cancel</ButtonText>
                        </Button>
                        <Button
                            action="primary"
                            onPress={() => { hapticLight(); handleCreate(); }}
                            isDisabled={!title.trim() || isSaving}
                            className="flex-1 bg-sanctuarySaffron rounded-full h-14 shadow-md"
                        >
                            {isSaving ? <Spinner className="text-sacredWhite" /> : <ButtonText className="text-sacredWhite font-black uppercase text-xs tracking-widest">Create</ButtonText>}
                        </Button>
                    </HStack>
                </VStack>
            </SanctuaryModal>
        </Box>
    );
}

function SummaryPill({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <Box
            className="flex-1 bg-sanctuary-surface border border-sanctuary-border rounded-[24px] p-6"
        >
            <VStack className="gap-3">
                <HStack className="items-center gap-2">
                    <Box className="w-8 h-8 rounded-lg bg-sanctuary-surface-secondary items-center justify-center border border-sanctuary-border/50">
                        {icon}
                    </Box>
                    <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-[0.25em]">
                        {label}
                    </Text>
                </HStack>
                <Text className="text-sanctuary-text font-black text-2xl tracking-tighter">
                    {value}
                </Text>
            </VStack>
        </Box>
    );
}
