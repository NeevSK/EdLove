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
            <VStack className="gap-8 p-6">
                <Box
                    className="bg-sanctuary-surface-secondary/40 rounded-[32px] border border-sanctuary-border p-8"
                >
                    <VStack className="gap-8">
                        <HStack className="items-start justify-between gap-6 flex-wrap">
                            <VStack className="flex-1 min-w-[240px] gap-3">
                                <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-[0.3em]">
                                    Observations
                                </Text>
                                <Heading className="text-3xl text-sanctuary-text font-black tracking-tight leading-tight">
                                    Track classroom noticing, not just incidents
                                </Heading>
                                <Text className="text-sanctuary-text text-sm leading-relaxed font-medium opacity-70 max-w-xl">
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
                                    className="bg-sanctuarySaffron rounded-full px-7 h-12 shadow-sm active:opacity-85"
                                >
                                    <HStack className="items-center gap-2.5">
                                        <Icon as={Plus} size="sm" className="text-sacredWhite" />
                                        <ButtonText className="text-sacredWhite font-black uppercase text-xs tracking-[0.1em]">New</ButtonText>
                                    </HStack>
                                </Button>
                            )}
                        </HStack>
                        <HStack className="gap-4 flex-wrap">
                            <SignalPill
                                icon={<Icon as={MessageCircle} size="sm" className="text-sanctuary-info" />}
                                label="Total"
                                value={String(observations.length)}
                            />
                            <SignalPill
                                icon={<Icon as={Sparkles} size="sm" className="text-sanctuary-success" />}
                                label="Positive"
                                value={String(positiveCount)}
                            />
                            <SignalPill
                                icon={<Icon as={TriangleAlert} size="sm" className="text-sanctuary-error" />}
                                label="Concerns"
                                value={String(concernCount)}
                            />
                        </HStack>
                    </VStack>
                </Box>

                {isLoading ? (
                    <Box className="py-20 items-center">
                        <Spinner className="text-sanctuarySaffron" />
                    </Box>
                ) : observations.length === 0 ? (
                    <Box
                        className="bg-sanctuary-surface-secondary/20 rounded-[32px] border border-sanctuary-border p-12 items-center gap-4"
                    >
                        <Box className="w-16 h-16 bg-sanctuary-surface rounded-[24px] items-center justify-center border border-sanctuary-border">
                            <Icon as={MessageCircle} size="md" className="text-sanctuary-text-tertiary" />
                        </Box>
                        <Heading className="text-lg text-sanctuary-text font-black tracking-tight uppercase">
                            No observations yet
                        </Heading>
                        <Text className="text-sanctuary-text-tertiary text-center text-sm leading-relaxed max-w-xs">
                            Start with one true observation from today. The goal is signal, not volume.
                        </Text>
                    </Box>
                ) : (
                    observations.map((observation) => (
                        <Box
                            key={observation.id}
                            className={`bg-sanctuary-surface rounded-[32px] border border-sanctuary-border p-7 border-l-[6px] shadow-sm ${
                                observation.observation_type === 'concern'
                                    ? 'border-l-sanctuary-error'
                                    : observation.observation_type === 'positive'
                                        ? 'border-l-sanctuary-success'
                                        : 'border-l-sanctuary-info'
                            }`}
                        >
                            <VStack className="gap-4">
                                <HStack className="items-center justify-between gap-6">
                                    <VStack className="flex-1 gap-1">
                                        <Text className="text-lg text-sanctuary-text font-black tracking-tight">
                                            {students.find((student) => student.id === observation.student_id)?.full_name || 'Student observation'}
                                        </Text>
                                        <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">
                                            {observation.observation_type} • {observation.visibility === 'student_visible' ? 'Visible to student' : 'Private'}
                                        </Text>
                                    </VStack>
                                    {canManage && (
                                        <Pressable onPress={() => handleDelete(observation.id)} className="w-10 h-10 items-center justify-center bg-sanctuary-surface-secondary rounded-full border border-sanctuary-border active:opacity-50">
                                            <Icon as={Trash2} size="xs" className="text-sanctuary-error" />
                                        </Pressable>
                                    )}
                                </HStack>
                                <Text className="text-sanctuary-text text-sm font-medium leading-relaxed opacity-80">{observation.content}</Text>
                                <Box className="mt-2 pt-4 border-t border-sanctuary-border/60">
                                    <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-[0.15em]">
                                        {observation.created_at ? new Date(observation.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Just now'}
                                    </Text>
                                </Box>
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
                <VStack className="gap-7 p-1">
                    <VStack className="gap-3">
                        <Text className="text-[10px] font-black uppercase text-sanctuary-text-tertiary ml-1 tracking-[0.2em]">
                            Student
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <HStack className="gap-2.5 p-0.5">
                                {students.map((student) => {
                                    const isActive = selectedStudentId === student.id;
                                    return (
                                        <Pressable key={student.id} onPress={() => setSelectedStudentId(student.id)}>
                                            <Box
                                                className={`px-5 py-2.5 rounded-2xl border ${
                                                    isActive ? 'border-sanctuarySaffron bg-sanctuarySaffron' : 'border-sanctuary-border bg-sanctuary-surface-secondary/40'
                                                }`}
                                            >
                                                <Text className={`text-xs font-black uppercase tracking-tight ${isActive ? 'text-sacredWhite' : 'text-sanctuary-text'}`}>
                                                    {student.full_name}
                                                </Text>
                                            </Box>
                                        </Pressable>
                                    );
                                })}
                            </HStack>
                        </ScrollView>
                    </VStack>

                    <VStack className="gap-3">
                        <Text className="text-[10px] font-black uppercase text-sanctuary-text-tertiary ml-1 tracking-[0.2em]">
                            Observation type
                        </Text>
                        <HStack className="gap-2.5 flex-wrap">
                            {OBSERVATION_TYPES.map((type) => {
                                const isActive = observationType === type;
                                const activeColor = type === 'positive' ? 'bg-sanctuary-success' : type === 'concern' ? 'bg-sanctuary-error' : 'bg-sanctuary-info';
                                const activeBorder = type === 'positive' ? 'border-sanctuary-success' : type === 'concern' ? 'border-sanctuary-error' : 'border-sanctuary-info';
                                
                                return (
                                    <Pressable key={type} onPress={() => setObservationType(type)}>
                                        <Box
                                            className={`px-5 py-2.5 rounded-2xl border ${
                                                isActive ? `${activeBorder} ${activeColor}` : 'border-sanctuary-border bg-sanctuary-surface-secondary/40'
                                            }`}
                                        >
                                            <Text className={`capitalize text-xs font-black tracking-tight ${isActive ? 'text-sacredWhite' : 'text-sanctuary-text'}`}>
                                                {type}
                                            </Text>
                                        </Box>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </VStack>

                    <VStack className="gap-3">
                        <Text className="text-[10px] font-black uppercase text-sanctuary-text-tertiary ml-1 tracking-[0.2em]">
                            Visibility
                        </Text>
                        <HStack className="gap-3">
                            {(['private', 'student_visible'] as const).map((option) => {
                                const isActive = visibility === option;
                                return (
                                    <Pressable key={option} onPress={() => setVisibility(option)} className="flex-1">
                                        <Box
                                            className={`px-5 py-2.5 rounded-2xl border items-center ${
                                                isActive ? 'border-sanctuary-success bg-sanctuary-success' : 'border-sanctuary-border bg-sanctuary-surface-secondary/40'
                                            }`}
                                        >
                                            <Text className={`text-xs font-black tracking-tight ${isActive ? 'text-sacredWhite' : 'text-sanctuary-text'}`}>
                                                {option === 'student_visible' ? 'Visible to student' : 'Private'}
                                            </Text>
                                        </Box>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </VStack>

                    <VStack className="gap-3">
                        <Text className="text-[10px] font-black uppercase text-sanctuary-text-tertiary ml-1 tracking-[0.2em]">Observation</Text>
                        <Input className="bg-sanctuary-surface-secondary border-sanctuary-border rounded-[24px] min-h-[140px] p-4">
                            <InputField
                                placeholder="What did you notice?"
                                value={content}
                                onChangeText={setContent}
                                multiline
                                className="text-sanctuary-text text-sm font-medium"
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
                            onPress={handleCreate}
                            isDisabled={!content.trim() || !selectedStudent || !userId || isSaving}
                            className="flex-1 bg-sanctuarySaffron rounded-full h-14 shadow-md"
                        >
                            {isSaving ? <Spinner className="text-sacredWhite" /> : <ButtonText className="text-sacredWhite font-black uppercase text-xs tracking-widest">Save</ButtonText>}
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
        <Box className="flex-1 bg-sanctuary-surface border border-sanctuary-border rounded-[24px] p-6 shadow-sm">
            <VStack className="gap-3">
                <HStack className="items-center gap-2">
                    <Box className="w-8 h-8 rounded-lg bg-sanctuary-surface-secondary items-center justify-center border border-sanctuary-border/40">
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
