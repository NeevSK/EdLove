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
    Pressable,
    ScrollView,
    Spinner,
    Text,
    VStack,
    hapticLight,
    SanctuaryModal,
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
                    className="bg-sanctuary-surface rounded-3xl border border-sanctuary-border/10 p-6 shadow-sm"
                >
                    <VStack className="gap-4">
                        <HStack className="items-start justify-between gap-md">
                            <VStack className="flex-1 gap-1">
                                <Text className="text-sanctuary-text-muted text-[10px] font-bold uppercase tracking-[0.1em]">
                                    Observations
                                </Text>
                                <Heading size="md" className="text-sanctuary-text">
                                    Track classroom noticing, not just incidents
                                </Heading>
                                <Text className="text-sanctuary-text-muted text-sm leading-5">
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
                                    className="bg-sanctuarySaffron rounded-full px-5"
                                >
                                    <HStack className="items-center gap-2">
                                        <Icon as={Plus} size="sm" className="text-sacredWhite" />
                                        <ButtonText className="text-sacredWhite font-English">New</ButtonText>
                                    </HStack>
                                </Button>
                            )}
                        </HStack>
                        <HStack className="gap-3">
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
                    <Box className="py-10 items-center">
                        <Spinner className="text-sanctuarySaffron" />
                    </Box>
                ) : observations.length === 0 ? (
                    <Box
                        className="bg-sanctuary-surface rounded-3xl border border-sanctuary-border/10 p-10 items-center gap-3 shadow-sm"
                    >
                        <Icon as={MessageCircle} size="xl" className="text-sanctuary-text-muted/30" />
                        <Heading size="sm" className="text-sanctuary-text text-center">
                            No observations yet
                        </Heading>
                        <Text className="text-sanctuary-text-muted text-center text-sm leading-5">
                            Start with one true observation from today. The goal is signal, not volume.
                        </Text>
                    </Box>
                ) : (
                    observations.map((observation) => (
                        <Box
                            key={observation.id}
                            className={`bg-sanctuary-surface rounded-2xl border border-sanctuary-border/10 p-5 border-l-4 shadow-sm ${
                                observation.observation_type === 'concern'
                                    ? 'border-l-emberRed'
                                    : observation.observation_type === 'positive'
                                        ? 'border-l-sageGreen'
                                        : 'border-l-gurudeviBlue'
                            }`}
                        >
                            <VStack className="gap-3">
                                <HStack className="items-center justify-between gap-md">
                                    <VStack className="flex-1">
                                        <Text className="text-sanctuary-text font-bold">
                                            {students.find((student) => student.id === observation.student_id)?.full_name || 'Student observation'}
                                        </Text>
                                        <Text className="text-sanctuary-text-muted text-[10px] font-bold uppercase mt-0.5">
                                            {observation.observation_type} • {observation.visibility === 'student_visible' ? 'Visible to student' : 'Private'}
                                        </Text>
                                    </VStack>
                                    {canManage && (
                                        <Pressable onPress={() => handleDelete(observation.id)} className="p-2 active:opacity-50">
                                            <Icon as={Trash2} size="sm" className="text-emberRed" />
                                        </Pressable>
                                    )}
                                </HStack>
                                <Text className="text-sanctuary-text-muted text-sm leading-5">{observation.content}</Text>
                                <Text className="text-sanctuary-text-muted text-[10px] font-bold uppercase mt-1">
                                    {observation.created_at ? new Date(observation.created_at).toLocaleDateString() : 'Just now'}
                                </Text>
                            </VStack>
                        </Box>
                    ))
                )}
            </VStack>

            <SanctuaryModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create observation"
            >
                <VStack className="gap-6 p-1">
                    <VStack className="gap-2">
                        <Text className="text-[10px] font-bold uppercase text-sanctuary-text-muted ml-1">
                            Student
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <HStack className="gap-2 p-0.5">
                                {students.map((student) => {
                                    const isActive = selectedStudentId === student.id;
                                    return (
                                        <Pressable key={student.id} onPress={() => setSelectedStudentId(student.id)}>
                                            <Box
                                                className={`px-4 py-2 rounded-xl border ${
                                                    isActive ? 'border-sanctuarySaffron bg-sanctuarySaffron' : 'border-sanctuary-border/10 bg-sanctuary-surface-secondary'
                                                }`}
                                            >
                                                <Text className={`text-xs font-bold ${isActive ? 'text-sacredWhite' : 'text-sanctuary-text'}`}>
                                                    {student.full_name}
                                                </Text>
                                            </Box>
                                        </Pressable>
                                    );
                                })}
                            </HStack>
                        </ScrollView>
                    </VStack>

                    <VStack className="gap-2">
                        <Text className="text-[10px] font-bold uppercase text-sanctuary-text-muted ml-1">
                            Observation type
                        </Text>
                        <HStack className="gap-2 flex-wrap">
                            {OBSERVATION_TYPES.map((type) => {
                                const isActive = observationType === type;
                                return (
                                    <Pressable key={type} onPress={() => setObservationType(type)}>
                                        <Box
                                            className={`px-4 py-2 rounded-xl border ${
                                                isActive ? 'border-gurudeviBlue bg-gurudeviBlue' : 'border-sanctuary-border/10 bg-sanctuary-surface-secondary'
                                            }`}
                                        >
                                            <Text className={`capitalize text-xs font-bold ${isActive ? 'text-sacredWhite' : 'text-sanctuary-text'}`}>
                                                {type}
                                            </Text>
                                        </Box>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </VStack>

                    <VStack className="gap-2">
                        <Text className="text-[10px] font-bold uppercase text-sanctuary-text-muted ml-1">
                            Visibility
                        </Text>
                        <HStack className="gap-2">
                            {(['private', 'student_visible'] as const).map((option) => {
                                const isActive = visibility === option;
                                return (
                                    <Pressable key={option} onPress={() => setVisibility(option)}>
                                        <Box
                                            className={`px-4 py-2 rounded-xl border ${
                                                isActive ? 'border-sageGreen bg-sageGreen' : 'border-sanctuary-border/10 bg-sanctuary-surface-secondary'
                                            }`}
                                        >
                                            <Text className={`text-xs font-bold ${isActive ? 'text-sacredWhite' : 'text-sanctuary-text'}`}>
                                                {option === 'student_visible' ? 'Visible to student' : 'Private'}
                                            </Text>
                                        </Box>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </VStack>

                    <VStack className="gap-2">
                        <Text className="text-[10px] font-bold uppercase text-sanctuary-text-muted ml-1">Observation</Text>
                        <Input className="bg-sanctuary-surface-secondary border-sanctuary-border/10 rounded-xl min-h-[120px] p-2">
                            <InputField
                                placeholder="What did you notice?"
                                value={content}
                                onChangeText={setContent}
                                multiline
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
                            onPress={handleCreate}
                            isDisabled={!content.trim() || !selectedStudent || !userId || isSaving}
                            className="flex-1 bg-sanctuarySaffron rounded-xl h-12"
                        >
                            {isSaving ? <Spinner className="text-sacredWhite" /> : <ButtonText className="text-sacredWhite font-bold">Save</ButtonText>}
                        </Button>
                    </HStack>
                </VStack>
            </SanctuaryModal>
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
        <Box className="flex-1 bg-sanctuary-surface-secondary/50 rounded-2xl border border-sanctuary-border/10 p-4">
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
