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
            <VStack className="gap-md p-md">
                <Box
                    className="bg-sanctuary-surface rounded-3xl border border-sanctuary-border/10 p-6 shadow-sm"
                >
                    <VStack className="gap-6">
                        <HStack className="items-start justify-between gap-md">
                            <VStack className="flex-1 gap-1">
                                <Text className="text-sanctuary-text-muted text-[10px] font-bold uppercase tracking-[0.1em]">
                                    Assignment Workspace
                                </Text>
                                <Heading size="md" className="text-sanctuary-text">
                                    Keep assignment momentum visible
                                </Heading>
                                <Text className="text-sanctuary-text-muted text-sm leading-5">
                                    See what is active, what is upcoming, and add top-level classroom work without disappearing into lesson structure.
                                </Text>
                            </VStack>
                            {canManage && (
                                <Button
                                    action="primary"
                                    onPress={() => { hapticLight(); setShowCreateModal(true); }}
                                    className="bg-sanctuarySaffron rounded-full px-5 shadow-sm"
                                >
                                    <HStack className="items-center gap-2">
                                        <Icon as={Plus} size="sm" className="text-sacredWhite" />
                                        <ButtonText className="text-sacredWhite font-English">Create</ButtonText>
                                    </HStack>
                                </Button>
                            )}
                        </HStack>
                        <HStack className="gap-3">
                            <SummaryPill
                                icon={<Icon as={ClipboardList} size="sm" className="text-sanctuarySaffron" />}
                                label="Total"
                                value={String(assignments.length)}
                            />
                            <SummaryPill
                                icon={<Icon as={Clock3} size="sm" className="text-gurudeviBlue" />}
                                label="Upcoming"
                                value={String(upcomingCount)}
                            />
                            <SummaryPill
                                icon={<Icon as={Sparkles} size="sm" className="text-sageGreen" />}
                                label="State"
                                value={assignments.length > 0 ? 'Live' : 'Quiet'}
                            />
                        </HStack>
                    </VStack>
                </Box>

                {isLoading ? (
                    <Box className="py-10 items-center">
                        <Spinner className="text-sanctuarySaffron" />
                    </Box>
                ) : assignments.length === 0 ? (
                    <Box
                        className="bg-sanctuary-surface rounded-3xl border border-sanctuary-border/10 p-10 items-center gap-3 shadow-sm"
                    >
                        <Icon as={ClipboardList} size="xl" className="text-sanctuary-text-muted/30" />
                        <Heading size="sm" className="text-sanctuary-text text-center">
                            No assignments yet
                        </Heading>
                        <Text className="text-sanctuary-text-muted text-center text-sm leading-5">
                            Create a classroom assignment here, or add one from a monthly lesson lane when the work belongs to a specific module.
                        </Text>
                    </Box>
                ) : (
                    assignments.map((assignment) => (
                        <Box
                            key={assignment.id}
                            className="bg-sanctuary-surface rounded-2xl border border-sanctuary-border/10 p-5 border-l-4 border-l-sanctuarySaffron shadow-sm"
                        >
                            <VStack className="gap-3">
                                <HStack className="items-center justify-between gap-md">
                                    <Heading size="xs" className="text-sanctuary-text flex-1">
                                        {assignment.title}
                                    </Heading>
                                    <HStack className="items-center gap-1.5 bg-sanctuary-surface-secondary px-2 py-1 rounded-full">
                                        <Icon as={CalendarDays} size="xs" className="text-gurudeviBlue" />
                                        <Text className="text-sanctuary-text-muted text-[10px] uppercase font-bold">
                                            {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                                        </Text>
                                    </HStack>
                                </HStack>
                                {!!assignment.description && (
                                    <Text className="text-sanctuary-text-muted text-sm leading-5">
                                        {assignment.description}
                                    </Text>
                                )}
                                <HStack className="items-center justify-between mt-1">
                                    <Text className="text-sanctuary-text-muted text-[10px] font-bold uppercase tracking-wider">
                                        Max points: {assignment.max_points ?? 100}
                                    </Text>
                                    <Text className="text-sanctuarySaffron font-bold text-[10px] uppercase italic">
                                        Classroom Level
                                    </Text>
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
                        <Text className="text-[10px] font-bold uppercase text-sanctuary-text-muted ml-1">Title</Text>
                        <Input className="bg-sanctuary-surface-secondary border-sanctuary-border/10 rounded-xl h-12">
                            <InputField 
                                placeholder="Assignment title" 
                                value={title} 
                                onChangeText={setTitle} 
                                className="text-sanctuary-text text-sm" 
                                placeholderTextColor="#94a3b8"
                            />
                        </Input>
                    </VStack>
                    
                    <VStack className="gap-2">
                        <Text className="text-[10px] font-bold uppercase text-sanctuary-text-muted ml-1">Description</Text>
                        <Input className="bg-sanctuary-surface-secondary border-sanctuary-border/10 rounded-xl min-h-[100px] p-2">
                            <InputField
                                placeholder="What should students complete?"
                                value={description}
                                onChangeText={setDescription}
                                className="text-sanctuary-text text-sm"
                                multiline
                                placeholderTextColor="#94a3b8"
                            />
                        </Input>
                    </VStack>

                    <VStack className="gap-2">
                        <Text className="text-[10px] font-bold uppercase text-sanctuary-text-muted ml-1">Due Date</Text>
                        <Input className="bg-sanctuary-surface-secondary border-sanctuary-border/10 rounded-xl h-12">
                            <InputField
                                placeholder="YYYY-MM-DD"
                                value={dueDate}
                                onChangeText={setDueDate}
                                className="text-sanctuary-text text-sm"
                                placeholderTextColor="#94a3b8"
                            />
                        </Input>
                    </VStack>

                    <HStack className="gap-3 mt-4">
                        <Button variant="outline" action="secondary" onPress={() => setShowCreateModal(false)} className="flex-1 rounded-xl h-12 border-sanctuary-border/20">
                            <ButtonText className="text-sanctuary-text font-bold">Cancel</ButtonText>
                        </Button>
                        <Button
                            action="primary"
                            onPress={() => { hapticLight(); handleCreate(); }}
                            isDisabled={!title.trim() || isSaving}
                            className="flex-1 bg-sanctuarySaffron rounded-xl h-12"
                        >
                            {isSaving ? <Spinner className="text-sacredWhite" /> : <ButtonText className="text-sacredWhite font-bold">Create</ButtonText>}
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
            className="flex-1 bg-sanctuary-surface-secondary/50 rounded-2xl border border-sanctuary-border/10 p-4"
        >
            <VStack className="gap-1">
                <HStack className="items-center gap-1.5">
                    {icon}
                    <Text className="text-sanctuary-text-muted text-[10px] uppercase font-bold tracking-tight">
                        {label}
                    </Text>
                </HStack>
                <Text className="text-sanctuary-text font-bold text-lg">
                    {value}
                </Text>
            </VStack>
        </Box>
    );
}
