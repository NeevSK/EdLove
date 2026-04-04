import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    Spinner,
    Text,
    Theme,
    VStack,
    useThemedColors,
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
    const colors = useThemedColors();
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
        <Box sx={{ flex: 1 }}>
            <VStack sx={{ gap: Theme.spacing.md, padding: Theme.spacing.md }}>
                <Box
                    sx={{
                        backgroundColor: Theme.colors.silk,
                        borderRadius: Theme.corners.generous,
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: Theme.spacing.lg,
                        shadowColor: Theme.colors.shadowAmbient,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 1,
                        shadowRadius: 18,
                        elevation: 4,
                    }}
                >
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        <HStack sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: Theme.spacing.md }}>
                            <VStack sx={{ flex: 1, gap: 4 }}>
                                <Text sx={{ color: colors.textTertiary, fontSize: 11, fontWeight: '700' as const, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Observations
                                </Text>
                                <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.xl }}>
                                    Track classroom noticing, not just incidents
                                </Heading>
                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
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
                                    sx={{ backgroundColor: Theme.colors.sanctuarySaffron, borderRadius: Theme.corners.full }}
                                >
                                    <HStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}>
                                        <Plus size={16} color={Theme.colors.sacredWhite} />
                                        <ButtonText sx={{ color: Theme.colors.sacredWhite }}>New</ButtonText>
                                    </HStack>
                                </Button>
                            )}
                        </HStack>
                        <HStack sx={{ gap: Theme.spacing.sm }}>
                            <SignalPill
                                icon={<MessageCircle size={14} color={Theme.colors.gurudeviBlue} />}
                                label="Total"
                                value={String(observations.length)}
                                colors={colors}
                            />
                            <SignalPill
                                icon={<Sparkles size={14} color={Theme.colors.sageGreen} />}
                                label="Positive"
                                value={String(positiveCount)}
                                colors={colors}
                            />
                            <SignalPill
                                icon={<TriangleAlert size={14} color={Theme.colors.emberRed} />}
                                label="Concerns"
                                value={String(concernCount)}
                                colors={colors}
                            />
                        </HStack>
                    </VStack>
                </Box>

                {isLoading ? (
                    <Box sx={{ paddingVertical: Theme.spacing.xl, alignItems: 'center' }}>
                        <Spinner color={Theme.colors.sanctuarySaffron} />
                    </Box>
                ) : observations.length === 0 ? (
                    <Box
                        sx={{
                            backgroundColor: Theme.colors.silk,
                            borderRadius: Theme.corners.generous,
                            borderWidth: 1,
                            borderColor: colors.border,
                            padding: Theme.spacing.xl,
                            alignItems: 'center',
                            gap: Theme.spacing.sm,
                        }}
                    >
                        <MessageCircle size={36} color={colors.textTertiary} />
                        <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}>
                            No observations yet
                        </Heading>
                        <Text sx={{ color: colors.textSecondary, textAlign: 'center' }}>
                            Start with one true observation from today. The goal is signal, not volume.
                        </Text>
                    </Box>
                ) : (
                    observations.map((observation) => (
                        <Box
                            key={observation.id}
                            sx={{
                                backgroundColor: Theme.colors.silk,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderLeftWidth: 4,
                                borderLeftColor: observation.observation_type === 'concern'
                                    ? Theme.colors.emberRed
                                    : observation.observation_type === 'positive'
                                        ? Theme.colors.sageGreen
                                        : Theme.colors.gurudeviBlue,
                                padding: Theme.spacing.md,
                            }}
                        >
                            <VStack sx={{ gap: Theme.spacing.xs }}>
                                <HStack sx={{ alignItems: 'center', justifyContent: 'space-between', gap: Theme.spacing.md }}>
                                    <VStack sx={{ flex: 1 }}>
                                        <Text sx={{ color: colors.text, fontWeight: '700' as const }}>
                                            {students.find((student) => student.id === observation.student_id)?.full_name || 'Student observation'}
                                        </Text>
                                        <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs, textTransform: 'uppercase' }}>
                                            {observation.observation_type} • {observation.visibility === 'student_visible' ? 'Visible to student' : 'Private'}
                                        </Text>
                                    </VStack>
                                    {canManage && (
                                        <Pressable onPress={() => handleDelete(observation.id)}>
                                            <Trash2 size={16} color={Theme.colors.emberRed} />
                                        </Pressable>
                                    )}
                                </HStack>
                                <Text sx={{ color: colors.textSecondary }}>{observation.content}</Text>
                                <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs }}>
                                    {observation.created_at ? new Date(observation.created_at).toLocaleDateString() : 'Just now'}
                                </Text>
                            </VStack>
                        </Box>
                    ))
                )}
            </VStack>

            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.primary, borderWidth: 1, borderColor: colors.border }}>
                    <ModalHeader>
                        <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}>
                            Create observation
                        </Heading>
                    </ModalHeader>
                    <ModalBody>
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <VStack sx={{ gap: Theme.spacing.xs }}>
                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                    Student
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <HStack sx={{ gap: Theme.spacing.sm }}>
                                        {students.map((student) => {
                                            const isActive = selectedStudentId === student.id;
                                            return (
                                                <Pressable key={student.id} onPress={() => setSelectedStudentId(student.id)}>
                                                    <Box
                                                        sx={{
                                                            paddingHorizontal: Theme.spacing.md,
                                                            paddingVertical: Theme.spacing.sm,
                                                            borderRadius: Theme.corners.full,
                                                            borderWidth: 1,
                                                            borderColor: isActive ? Theme.colors.sanctuarySaffron : colors.border,
                                                            backgroundColor: isActive ? Theme.colors.sanctuarySaffron : colors.secondary,
                                                        }}
                                                    >
                                                        <Text sx={{ color: isActive ? Theme.colors.sacredWhite : colors.text }}>
                                                            {student.full_name}
                                                        </Text>
                                                    </Box>
                                                </Pressable>
                                            );
                                        })}
                                    </HStack>
                                </ScrollView>
                            </VStack>

                            <VStack sx={{ gap: Theme.spacing.xs }}>
                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                    Observation type
                                </Text>
                                <HStack sx={{ gap: Theme.spacing.sm, flexWrap: 'wrap' }}>
                                    {OBSERVATION_TYPES.map((type) => {
                                        const isActive = observationType === type;
                                        return (
                                            <Pressable key={type} onPress={() => setObservationType(type)}>
                                                <Box
                                                    sx={{
                                                        paddingHorizontal: Theme.spacing.md,
                                                        paddingVertical: Theme.spacing.xs,
                                                        borderRadius: Theme.corners.full,
                                                        borderWidth: 1,
                                                        borderColor: isActive ? Theme.colors.gurudeviBlue : colors.border,
                                                        backgroundColor: isActive ? Theme.colors.gurudeviBlue : colors.secondary,
                                                    }}
                                                >
                                                    <Text sx={{ color: isActive ? Theme.colors.sacredWhite : colors.text, textTransform: 'capitalize' }}>
                                                        {type}
                                                    </Text>
                                                </Box>
                                            </Pressable>
                                        );
                                    })}
                                </HStack>
                            </VStack>

                            <VStack sx={{ gap: Theme.spacing.xs }}>
                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                    Visibility
                                </Text>
                                <HStack sx={{ gap: Theme.spacing.sm }}>
                                    {(['private', 'student_visible'] as const).map((option) => {
                                        const isActive = visibility === option;
                                        return (
                                            <Pressable key={option} onPress={() => setVisibility(option)}>
                                                <Box
                                                    sx={{
                                                        paddingHorizontal: Theme.spacing.md,
                                                        paddingVertical: Theme.spacing.xs,
                                                        borderRadius: Theme.corners.full,
                                                        borderWidth: 1,
                                                        borderColor: isActive ? Theme.colors.sageGreen : colors.border,
                                                        backgroundColor: isActive ? Theme.colors.sageGreen : colors.secondary,
                                                    }}
                                                >
                                                    <Text sx={{ color: isActive ? Theme.colors.sacredWhite : colors.text }}>
                                                        {option === 'student_visible' ? 'Visible to student' : 'Private'}
                                                    </Text>
                                                </Box>
                                            </Pressable>
                                        );
                                    })}
                                </HStack>
                            </VStack>

                            <Input sx={{ backgroundColor: colors.secondary, borderColor: colors.border, minHeight: 100 }}>
                                <InputField
                                    placeholder="What did you notice?"
                                    value={content}
                                    onChangeText={setContent}
                                    multiline
                                    sx={{ color: colors.text }}
                                />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack sx={{ gap: Theme.spacing.sm }}>
                            <Button variant="outline" action="secondary" onPress={() => setShowCreateModal(false)} sx={{ flex: 1 }}>
                                <ButtonText sx={{ color: colors.textSecondary }}>Cancel</ButtonText>
                            </Button>
                            <Button
                                action="primary"
                                onPress={handleCreate}
                                isDisabled={!content.trim() || !selectedStudent || !userId || isSaving}
                                sx={{ flex: 1, backgroundColor: Theme.colors.sanctuarySaffron }}
                            >
                                {isSaving ? <Spinner color={Theme.colors.sacredWhite} /> : <ButtonText sx={{ color: Theme.colors.sacredWhite }}>Save</ButtonText>}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

function SignalPill({
    icon,
    label,
    value,
    colors,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    colors: ReturnType<typeof useThemedColors>;
}) {
    return (
        <Box
            sx={{
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: colors.border,
                padding: Theme.spacing.sm,
            }}
        >
            <VStack sx={{ gap: 4 }}>
                <HStack sx={{ alignItems: 'center', gap: 6 }}>
                    {icon}
                    <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs, fontWeight: '700' as const, textTransform: 'uppercase' }}>
                        {label}
                    </Text>
                </HStack>
                <Text sx={{ color: colors.text, fontWeight: '700' as const, fontSize: Theme.typography.fontSize.md }}>
                    {value}
                </Text>
            </VStack>
        </Box>
    );
}
