import React, { useCallback, useEffect, useState } from 'react';
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
    Spinner,
    Text,
    VStack,
    Icon,
    hapticLight,
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
                    className="bg-phase-surface rounded-generous border border-phase-border p-lg shadow-md"
                >
                    <VStack className="gap-md">
                        <HStack className="items-start justify-between gap-md">
                            <VStack className="flex-1 gap-1">
                                <Text className="text-phaseText-tertiary text-[11px] font-bold uppercase tracking-wider">
                                    Assignment Workspace
                                </Text>
                                <Heading className="text-phaseText-onSurface text-xl">
                                    Keep assignment momentum visible
                                </Heading>
                                <Text className="text-phaseText-secondary text-sm">
                                    See what is active, what is upcoming, and add top-level classroom work without disappearing into lesson structure.
                                </Text>
                            </VStack>
                            {canManage && (
                                <Button
                                    action="primary"
                                    onPress={() => { hapticLight(); setShowCreateModal(true); }}
                                    className="bg-sanctuarySaffron rounded-full px-md shadow-sm"
                                >
                                    <HStack className="items-center gap-xs">
                                        <Icon as={Plus} size="sm" className="text-sacredWhite" />
                                        <ButtonText className="text-sacredWhite font-English">Create</ButtonText>
                                    </HStack>
                                </Button>
                            )}
                        </HStack>
                        <HStack className="gap-sm">
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
                    <Box className="py-xl items-center">
                        <Spinner className="text-sanctuarySaffron" />
                    </Box>
                ) : assignments.length === 0 ? (
                    <Box
                        className="bg-phase-surface rounded-generous border border-phase-border p-xl items-center gap-sm shadow-sm"
                    >
                        <Icon as={ClipboardList} size="xl" className="text-phaseText-tertiary" />
                        <Heading className="text-phaseText-onSurface text-lg">
                            No assignments yet
                        </Heading>
                        <Text className="text-phaseText-secondary text-center">
                            Create a classroom assignment here, or add one from a monthly lesson lane when the work belongs to a specific module.
                        </Text>
                    </Box>
                ) : (
                    assignments.map((assignment) => (
                        <Box
                            key={assignment.id}
                            className="bg-phase-surface rounded-comfortable border border-phase-border p-md border-l-4 border-l-sanctuarySaffron shadow-sm"
                        >
                            <VStack className="gap-sm">
                                <HStack className="items-center justify-between gap-md">
                                    <Heading className="text-phaseText-onSurface text-md flex-1">
                                        {assignment.title}
                                    </Heading>
                                    <HStack className="items-center gap-1.5">
                                        <Icon as={CalendarDays} size="xs" className="text-gurudeviBlue" />
                                        <Text className="text-phaseText-secondary text-xs">
                                            {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                                        </Text>
                                    </HStack>
                                </HStack>
                                {!!assignment.description && (
                                    <Text className="text-phaseText-secondary text-sm">
                                        {assignment.description}
                                    </Text>
                                )}
                                <HStack className="items-center justify-between">
                                    <Text className="text-phaseText-tertiary text-xs">
                                        Max points: {assignment.max_points ?? 100}
                                    </Text>
                                    <Text className="text-sanctuarySaffron font-bold text-xs">
                                        Lesson-linked work stays in the Lessons lane
                                    </Text>
                                </HStack>
                            </VStack>
                        </Box>
                    ))
                )}
            </VStack>

            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <ModalBackdrop />
                <ModalContent className="bg-phase-surface border border-phase-border">
                    <ModalHeader>
                        <Heading className="text-phaseText-onSurface text-lg">
                            Create assignment
                        </Heading>
                    </ModalHeader>
                    <ModalBody>
                        <VStack className="gap-md">
                            <Input className="bg-phase-elevated border-phase-border">
                                <InputField 
                                    placeholder="Assignment title" 
                                    value={title} 
                                    onChangeText={setTitle} 
                                    className="text-phaseText-onSurface" 
                                    placeholderTextColor="PhaseTextTertiary"
                                />
                            </Input>
                            <Input className="bg-phase-elevated border-phase-border min-h-[90px]">
                                <InputField
                                    placeholder="What should students complete?"
                                    value={description}
                                    onChangeText={setDescription}
                                    className="text-phaseText-onSurface"
                                    multiline
                                    placeholderTextColor="PhaseTextTertiary"
                                />
                            </Input>
                            <Input className="bg-phase-elevated border-phase-border">
                                <InputField
                                    placeholder="Due date (YYYY-MM-DD)"
                                    value={dueDate}
                                    onChangeText={setDueDate}
                                    className="text-phaseText-onSurface"
                                    placeholderTextColor="PhaseTextTertiary"
                                />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack className="gap-sm">
                            <Button variant="outline" action="secondary" onPress={() => setShowCreateModal(false)} className="flex-1">
                                <ButtonText className="text-phaseText-secondary font-English">Cancel</ButtonText>
                            </Button>
                            <Button
                                action="primary"
                                onPress={() => { hapticLight(); handleCreate(); }}
                                isDisabled={!title.trim() || isSaving}
                                className="flex-1 bg-sanctuarySaffron"
                            >
                                {isSaving ? <Spinner className="text-sacredWhite" /> : <ButtonText className="text-sacredWhite font-English">Save</ButtonText>}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
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
            className="flex-1 bg-phase-surface rounded-comfortable border border-phase-border p-sm"
        >
            <VStack className="gap-1">
                <HStack className="items-center gap-1.5">
                    {icon}
                    <Text className="text-phaseText-tertiary text-xs font-bold uppercase">
                        {label}
                    </Text>
                </HStack>
                <Text className="text-phaseText-onSurface font-bold text-md">
                    {value}
                </Text>
            </VStack>
        </Box>
    );
}
