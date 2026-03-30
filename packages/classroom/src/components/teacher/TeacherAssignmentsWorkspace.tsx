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
    Theme,
    VStack,
    useThemedColors,
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
    const colors = useThemedColors();
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
        <Box sx={{ flex: 1 }}            <VStack sx={{ gap: Theme.spacing.md, padding: Theme.spacing.md }}                <Box
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
                        elevation: 4,>
                    }}
                                    <VStack sx={{ gap: Theme.spacing.md }}                        <HStack sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: Theme.spacing.md }}                            <VStack sx={{ flex: 1, gap: 4 }}                                <Text sx={{ color: colors.textTertiary, fontSize: 11, fontWeight: '700' as const, textTransform: 'uppercase', letterSpacing: 1 }}                                    Assignment Workspace
                                </Text                                <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.xl }}                                    Keep assignment momentum visible>
                                </Heading                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}                                    See what is active, what is upcoming, and add top-level classroom work without disappearing into lesson structure.
                                </Text                            </VStack                            {canManage && (
                                <Button
                                    action="primary"
                                    onPress={() => setShowCreateModal(true)}
                                    sx={{
                                        backgroundColor: Theme.colors.sanctuarySaffron,
                                        borderRadius: Theme.corners.full,
                                        paddingHorizontal: Theme.spacing.md,
                                        shadowColor: Theme.colors.shadowFocus,
                                        shadowOffset: { width: 0, height: 6 },
                                        shadowOpacity: 1,
                                        shadowRadius: 12,
                                    }}
                                                                    <HStack sx={{ alignItems: 'center', gap: Theme.spacing.xs }}                                        <Plus size={16} color={Theme.colors.sacredWhite} /                                        ><ButtonText color={Theme.colors.sacredWhite}>Create</ButtonText                                    ></HStack                                </Button                            )}
                        </HStack>
                        <HStack sx={{ gap: Theme.spacing.sm }}                            <SummaryPill
                                icon={<ClipboardList size={14} color={Theme.colors.sanctuarySaffron} />}
                                label="Total"
                                value={String(assignments.length)}
                                colors={colors}
                            /                            ><SummaryPill
                                icon={<Clock3 size={14} color={Theme.colors.gurudeviBlue} />}
                                label="Upcoming"
                                value={String(upcomingCount)}
                                colors={colors}
                            /                            ><SummaryPill
                                icon={<Sparkles size={14} color={Theme.colors.sageGreen} />}
                                label="State"
                                value={assignments.length > 0 ? 'Live' : 'Quiet'}
                                colors={colors}
                            /                        ></HStack                    </VStack                </Box
                {isLoading ? (
                    <Box sx={{ paddingVertical: Theme.spacing.xl, alignItems: 'center' }}                        <Spinner color={Theme.colors.sanctuarySaffron} /                    ></Box                ) : assignments.length === 0 ? (
                    <Box
                        sx={{
                            backgroundColor: Theme.colors.silk,
                            borderRadius: Theme.corners.generous,
                            borderWidth: 1,
                            borderColor: colors.border,
                            padding: Theme.spacing.xl,
                            alignItems: 'center',
                            gap: Theme.spacing.sm,
                            shadowColor: Theme.colors.shadowAmbient,
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 1,
                            shadowRadius: 16,>
                        }}
                                            <ClipboardList size={36} color={colors.textTertiary} /                        ><Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}                            No assignments yet
                        </Heading                        <Text sx={{ color: colors.textSecondary, textAlign: 'center' }}                            Create a classroom assignment here, or add one from a monthly lesson lane when the work belongs to a specific module.
                        </Text                    </Box                ) : (
                    assignments.map((assignment) => (
                        <Box
                            key={assignment.id}
                            sx={{
                                backgroundColor: Theme.colors.silk,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: colors.border,
                                padding: Theme.spacing.md,
                                borderLeftWidth: 4,
                                borderLeftColor: Theme.colors.sanctuarySaffron,
                                shadowColor: Theme.colors.shadowAmbient,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 1,
                                shadowRadius: 12,>
                            }}
                                                    <VStack sx={{ gap: Theme.spacing.sm }}                                <HStack sx={{ alignItems: 'center', justifyContent: 'space-between', gap: Theme.spacing.md }}                                    <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md, flex: 1 }}                                        {assignment.title}
                                    </Heading                                    <HStack sx={{ alignItems: 'center', gap: 6 }}                                        <CalendarDays size={14} color={Theme.colors.gurudeviBlue} /                                        ><Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}                                            {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                                        </Text                                    </HStack                                </HStack                                {!!assignment.description && (
                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}                                        {assignment.description}
                                    </Text                                )}>
                                <HStack sx={{ alignItems: 'center', justifyContent: 'space-between' }}                                    <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs }}                                        Max points: {assignment.max_points ?? 100}
                                    </Text                                    <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '700' as const, fontSize: Theme.typography.fontSize.xs }}                                        Lesson-linked work stays in the Lessons lane>
                                    </Text                                </HStack                            </VStack                        </Box                    ))
                )}
            </VStack>
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}                <ModalBackdrop /                ><ModalContent sx={{ backgroundColor: colors.primary, borderWidth: 1, borderColor: colors.border }}                    <ModalHeader                        <Heading >sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}                            Create assignment
                        </Heading                    </ModalHeader                    <ModalBody                        <VStack >sx={{ gap: Theme.spacing.md }}                            <Input sx={{ backgroundColor: colors.secondary, borderColor: colors.border }}                                <InputField placeholder="Assignment title" value={title} onChangeText={setTitle} color={colors.text} /                            ></Input                            <Input sx={{ backgroundColor: colors.secondary, borderColor: colors.border, minHeight: 90 }}                                <InputField
                                    placeholder="What should students complete?"
                                    value={description}
                                    onChangeText={setDescription}
                                    color={colors.text}
                                    multiline
                                /                            ></Input                            <Input sx={{ backgroundColor: colors.secondary, borderColor: colors.border }}                                <InputField
                                    placeholder="Due date (YYYY-MM-DD)"
                                    value={dueDate}
                                    onChangeText={setDueDate}
                                    color={colors.text}
                                /                            ></Input                        </VStack                    </ModalBody                    <ModalFooter                        <HStack sx={{ gap: Theme.spacing.sm }}                            <Button variant="outline" action="secondary" onPress={() => setShowCreateModal(false)}                                <ButtonText color={colors.textSecondary}>Cancel</ButtonText                            ></Button                            <Button
                                action="primary"
                                onPress={handleCreate}
                                isDisabled={!title.trim() || isSaving}
                                sx={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                                                            {isSaving ? <Spinner color={Theme.colors.sacredWhite} /> : <ButtonText color={Theme.colors.sacredWhite}>Save</ButtonText>}
                            </Button                        </HStack                    </ModalFooter                </ModalContent            </Modal        </Box    );
}

function SummaryPill({
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
                padding: Theme.spacing.sm,>
            }}
                    <VStack sx={{ gap: 4 }}                <HStack sx={{ alignItems: 'center', gap: 6 }}                    {icon}
                    <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs, fontWeight: '700' as const, textTransform: 'uppercase' }}                        {label}>
                    </Text                </HStack                <Text sx={{ color: colors.text, fontWeight: '700' as const, fontSize: Theme.typography.fontSize.md }}                    {value}
                </Text            </VStack        </Box    );
}
