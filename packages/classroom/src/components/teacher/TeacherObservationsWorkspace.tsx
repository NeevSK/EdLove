import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    ButtonText,
    HStack,
    Heading,
    Icon,
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
    Spinner,
    Text,
    VStack,
    hapticLight,
} from '@repo/ui';
import { api, Student } from '@repo/core';
import { MessageCircle, Plus, Sparkles, Trash2, TriangleAlert } from 'lucide-react-native';

interface TeacherObservationsWorkspaceProps {
    classroomId: string;
    userId?: string;
    students: Student[];
    canManage: boolean;
}

const OBSERVATION_TYPES = ['positive', 'growth', 'neutral', 'concern'] as const;

export default function TeacherObservationsWorkspace({
    classroomId,
    userId,
    students,
    canManage,
}: TeacherObservationsWorkspaceProps) {
    const [observations, setObservations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [content, setContent] = useState('');
    const [observationType, setObservationType] = useState<(typeof OBSERVATION_TYPES)[number]>('neutral');
    const [visibility, setVisibility] = useState<'private' | 'student_visible'>('private');
    const [isSaving, setIsSaving] = useState(false);

    const loadObservations = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.teacherInsights.listStudentObservations(classroomId);
            setObservations(data || []);
        } catch (error) {
            console.error('Failed to load observations', error);
        } finally {
            setIsLoading(false);
        }
    }, [classroomId]);

    useEffect(() => {
        loadObservations();
    }, [loadObservations]);

    const selectedStudent = useMemo(
        () => students.find((student) => student.id === selectedStudentId) || null,
        [selectedStudentId, students]
    );

    const positiveCount = observations.filter((item) => item.observation_type === 'positive').length;
    const concernCount = observations.filter((item) => item.observation_type === 'concern').length;

    const handleCreate = async () => {
        if (!content.trim() || !selectedStudent || !userId) return;
        setIsSaving(true);
        try {
            await api.teacherInsights.createStudentObservation({
                classroom_id: classroomId,
                student_id: (selectedStudent as Student).id,
                classroom_student_id: (selectedStudent as any).classroom_student_id || '',
                content: content.trim(),
                observation_type: observationType,
                visibility,
            });
            setContent('');
            setSelectedStudentId('');
            setObservationType('neutral');
            setVisibility('private');
            setShowCreateModal(false);
            await loadObservations();
        } catch (error) {
            console.error('Failed to create observation', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.studentObservations.delete(id);
            setObservations((prev) => prev.filter((observation) => observation.id !== id));
        } catch (error) {
            console.error('Failed to delete observation', error);
        }
    };

    return (
        <Box className="flex-1">
            <VStack className="gap-md p-md">
                <Box
                    className="bg-silk rounded-generous border border-phase-border p-lg shadow-sm"
                >
                    <VStack className="gap-md">
                        <HStack className="items-start justify-between gap-md">
                            <VStack className="flex-1 gap-1">
                                <Text className="text-phaseText-onSurface text-[11px] font-bold uppercase tracking-[1px]">
                                    Observations
                                </Text>
                                <Heading className="text-phaseText-onSurface text-xl">
                                    Track classroom noticing, not just incidents
                                </Heading>
                                <Text className="text-phaseText-secondary text-sm">
                                    Keep small signals close to the classroom rhythm, so growth and concern stay visible before they become reports.
                                </Text>
                            </VStack>
                            {canManage && (
                                <Button
                                    action="primary"
                                    onPress={() => {
                                        hapticLight();
                                        setShowCreateModal(true);
                                    }}
                                    className="bg-sanctuarySaffron rounded-full"
                                >
                                    <HStack className="items-center gap-xs">
                                        <Icon as={Plus} size="sm" className="text-sacredWhite" />
                                        <ButtonText className="text-sacredWhite font-English">New</ButtonText>
                                    </HStack>
                                </Button>
                            )}
                        </HStack>
                        <HStack className="gap-sm">
                            <SignalPill
                                icon={<Icon as={MessageCircle} size="sm" className="text-gurudeviBlue" />}
                                label="Total"
                                value={String(observations.length)}
                            />
                            <SignalPill
                                icon={<Icon as={Sparkles} size="sm" className="text-sageGreen" />}
                                label="Positive"
                                value={String(positiveCount)}
                            />
                            <SignalPill
                                icon={<Icon as={TriangleAlert} size="sm" className="text-emberRed" />}
                                label="Concerns"
                                value={String(concernCount)}
                            />
                        </HStack>
                    </VStack>
                </Box>

                {isLoading ? (
                    <Box className="py-xl items-center">
                        <Spinner className="text-sanctuarySaffron" />
                    </Box>
                ) : observations.length === 0 ? (
                    <Box
                        className="bg-silk rounded-generous border border-phase-border p-xl items-center gap-sm"
                    >
                        <Icon as={MessageCircle} size="xl" className="text-phaseText-onSurface/40" />
                        <Heading className="text-phaseText-onSurface text-lg">
                            No observations yet
                        </Heading>
                        <Text className="text-phaseText-secondary text-center">
                            Start with one true observation from today. The goal is signal, not volume.
                        </Text>
                    </Box>
                ) : (
                    observations.map((observation) => (
                        <Box
                            key={observation.id}
                            className={`bg-silk rounded-comfortable border border-phase-border p-md border-l-4 ${
                                observation.observation_type === 'concern'
                                    ? 'border-l-emberRed'
                                    : observation.observation_type === 'positive'
                                        ? 'border-l-sageGreen'
                                        : 'border-l-gurudeviBlue'
                            }`}
                        >
                            <VStack className="gap-xs">
                                <HStack className="items-center justify-between gap-md">
                                    <VStack className="flex-1">
                                        <Text className="text-phaseText-onSurface font-bold">
                                            {students.find((student) => student.id === observation.student_id)?.full_name || 'Student observation'}
                                        </Text>
                                        <Text className="text-phaseText-tertiary text-xs uppercase">
                                            {observation.observation_type} • {observation.visibility === 'student_visible' ? 'Visible to student' : 'Private'}
                                        </Text>
                                    </VStack>
                                    {canManage && (
                                        <Pressable onPress={() => handleDelete(observation.id)}>
                                            <Icon as={Trash2} size="sm" className="text-emberRed" />
                                        </Pressable>
                                    )}
                                </HStack>
                                <Text className="text-phaseText-secondary">{observation.content}</Text>
                                <Text className="text-phaseText-tertiary text-xs">
                                    {observation.created_at ? new Date(observation.created_at).toLocaleDateString() : 'Just now'}
                                </Text>
                            </VStack>
                        </Box>
                    ))
                )}
            </VStack>

            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <ModalBackdrop />
                <ModalContent className="bg-phase-canvas border border-phase-border">
                    <ModalHeader>
                        <Heading className="text-phaseText-onCanvas text-lg">
                            Create observation
                        </Heading>
                    </ModalHeader>
                    <ModalBody>
                        <VStack className="gap-md">
                            <VStack className="gap-xs">
                                <Text className="text-phaseText-secondary text-sm">
                                    Student
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <HStack className="gap-sm">
                                        {students.map((student) => {
                                            const isActive = selectedStudentId === student.id;
                                            return (
                                                <Pressable key={student.id} onPress={() => setSelectedStudentId(student.id)}>
                                                    <Box
                                                        className={`px-md py-sm rounded-full border ${
                                                            isActive ? 'border-sanctuarySaffron bg-sanctuarySaffron' : 'border-phase-border bg-phase-surface'
                                                        }`}
                                                    >
                                                        <Text className={isActive ? 'text-sacredWhite' : 'text-phaseText-onSurface'}>
                                                            {student.full_name}
                                                        </Text>
                                                    </Box>
                                                </Pressable>
                                            );
                                        })}
                                    </HStack>
                                </ScrollView>
                            </VStack>

                            <VStack className="gap-xs">
                                <Text className="text-phaseText-secondary text-sm">
                                    Observation type
                                </Text>
                                <HStack className="gap-sm flex-wrap">
                                    {OBSERVATION_TYPES.map((type) => {
                                        const isActive = observationType === type;
                                        return (
                                            <Pressable key={type} onPress={() => setObservationType(type)}>
                                                <Box
                                                    className={`px-md py-xs rounded-full border ${
                                                        isActive ? 'border-gurudeviBlue bg-gurudeviBlue' : 'border-phase-border bg-phase-surface'
                                                    }`}
                                                >
                                                    <Text className={`capitalize ${isActive ? 'text-sacredWhite' : 'text-phaseText-onSurface'}`}>
                                                        {type}
                                                    </Text>
                                                </Box>
                                            </Pressable>
                                        );
                                    })}
                                </HStack>
                            </VStack>

                            <VStack className="gap-xs">
                                <Text className="text-phaseText-secondary text-sm">
                                    Visibility
                                </Text>
                                <HStack className="gap-sm">
                                    {(['private', 'student_visible'] as const).map((option) => {
                                        const isActive = visibility === option;
                                        return (
                                            <Pressable key={option} onPress={() => setVisibility(option)}>
                                                <Box
                                                    className={`px-md py-xs rounded-full border ${
                                                        isActive ? 'border-sageGreen bg-sageGreen' : 'border-phase-border bg-phase-surface'
                                                    }`}
                                                >
                                                    <Text className={isActive ? 'text-sacredWhite' : 'text-phaseText-onSurface'}>
                                                        {option === 'student_visible' ? 'Visible to student' : 'Private'}
                                                    </Text>
                                                </Box>
                                            </Pressable>
                                        );
                                    })}
                                </HStack>
                            </VStack>

                            <Input className="bg-phase-surface border-phase-border min-h-[100px]">
                                <InputField
                                    placeholder="What did you notice?"
                                    value={content}
                                    onChangeText={setContent}
                                    multiline
                                    className="text-phaseText-onSurface"
                                />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack className="gap-sm w-full">
                            <Button variant="outline" action="secondary" onPress={() => setShowCreateModal(false)} className="flex-1">
                                <ButtonText className="text-phaseText-secondary font-English">Cancel</ButtonText>
                            </Button>
                            <Button
                                action="primary"
                                onPress={handleCreate}
                                isDisabled={!content.trim() || !selectedStudent || !userId || isSaving}
                                className="flex-1 bg-sanctuarySaffron"
                            >
                                {isSaving ? <Spinner className="text-sacredWhite" /> : <ButtonText className="text-sacredWhite font-English">Save</ButtonText>}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );</Modal>
        </Box>
    );
}

function SignalPill({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <Box className="flex-1 bg-phase-canvas rounded-comfortable border border-phase-border p-sm">
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
