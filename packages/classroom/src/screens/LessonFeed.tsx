import React, { useState, useEffect } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    ScrollView,
    Button,
    ButtonText,
    Spinner,
} from '@repo/ui';
import { ChevronDown, ChevronUp, FileText, Link as LinkIcon, Edit2, Trash2, Plus } from 'lucide-react-native';
import { TouchableOpacity, LayoutAnimation, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, Lesson, Assignment, LessonMaterial } from '@repo/core';
import { Theme } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { SkeletonCard } from '@repo/ui';

interface LessonFeedProps {
    classroomId: string;
    isTeacher?: boolean;
    onOpenLesson?: (lessonId: string) => void;
    onOpenAssignment?: (assignmentId: string) => void;
    onOpenMaterial?: (material: LessonMaterial) => void;
    onAddMaterial?: (lessonId: string) => void;
    onAddAssignment?: (lessonId: string) => void;
    onEditItem?: (item: any, type: 'material' | 'assignment') => void;
    onDeleteItem?: (id: string, type: 'material' | 'assignment') => void;
    refreshTrigger?: number;
}

interface MonthlyGroup {
    monthTitle: string;
    lessonId?: string; // Present if already created in DB
    materials: LessonMaterial[];
    assignments: Assignment[];
}

export default function LessonFeed({
    classroomId,
    isTeacher = false,
    onOpenLesson,
    onOpenAssignment,
    onOpenMaterial,
    onAddMaterial,
    onAddAssignment,
    onEditItem,
    onDeleteItem,
    refreshTrigger,
}: LessonFeedProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();

    const getCalendarScaffold = () => {
        const now = new Date();
        const year = now.getFullYear();
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        return monthNames.map(name => ({
            monthTitle: `${name} ${year}`,
            materials: [],
            assignments: [],
        }));
    };

    const [monthlyGroups, setMonthlyGroups] = useState<MonthlyGroup[]>(getCalendarScaffold());
    const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadFeed();
    }, [classroomId, refreshTrigger]);

    const isCurrentMonth = (title: string) => {
        const now = new Date();
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        const currentMonthName = (monthNames[now.getMonth()] || '').toLowerCase();
        const currentYear = now.getFullYear().toString();

        const normalizedTitle = title.toLowerCase();
        return normalizedTitle.includes(currentMonthName) && normalizedTitle.includes(currentYear);
    };

    const loadFeed = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [lessons, materials, assignments] = await Promise.all([
                api.lessons.getAll(classroomId),
                api.lessonMaterials.getAll(classroomId),
                api.assignments.getAll(classroomId),
            ]);

            const now = new Date();
            const year = now.getFullYear();
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

            const calendarGroups: MonthlyGroup[] = monthNames.map((name) => {
                const monthTitle = `${name} ${year}`;
                const existingLesson = lessons.find(l => l.title === monthTitle);

                return {
                    monthTitle,
                    lessonId: existingLesson?.id,
                    materials: materials.filter(m => m.lesson_id === existingLesson?.id),
                    assignments: assignments.filter(a => a.lesson_id === existingLesson?.id),
                };
            });

            setMonthlyGroups(calendarGroups);

            // Expand current month by default
            const currentMonthTitle = `${monthNames[now.getMonth()]} ${year}`;
            if (Object.keys(expandedLessons).length === 0) {
                setExpandedLessons({ [currentMonthTitle]: true });
            }
        } catch (err: any) {
            console.error('Failed to load feed:', err);
            setError(err.message || 'Failed to load feed data');
        } finally {
            setIsLoading(false);
        }
    };


    const toggleLesson = (lessonId: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedLessons(prev => ({
            ...prev,
            [lessonId]: !prev[lessonId],
        }));
    };

    const renderMaterialCard = (material: LessonMaterial) => (
        <Box
            key={material.id}
            sx={{
                padding: Theme.spacing.md,
                backgroundColor: colors.secondary,
                borderRadius: Theme.corners.comfortable,
                marginBottom: Theme.spacing.sm,
                borderLeftWidth: 4,
                borderLeftColor: colors.action,
            }}
        >
            <HStack sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <TouchableOpacity onPress={() => onOpenMaterial?.(material)} style={{ flex: 1 }}>
                    <HStack sx={{ alignItems: 'center', gap: 8 }}>
                        {material.type === 'pdf' ? (
                            <FileText size={20} color={colors.action} />
                        ) : (
                            <LinkIcon size={20} color={colors.warning} />
                        )}
                        <VStack>
                            <Text color={colors.text} sx={{ fontWeight: '600', fontSize: 16 }}>
                                {material.title}
                            </Text>
                            <Text color={colors.textSecondary} sx={{ fontSize: 12 }}>
                                {material.type.toUpperCase()}
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>

                {isTeacher && (
                    <HStack sx={{ gap: 16 }}>
                        <TouchableOpacity onPress={() => onEditItem?.(material, 'material')}>
                            <Edit2 size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDeleteItem?.(material.id, 'material')}>
                            <Trash2 size={18} color={colors.error} />
                        </TouchableOpacity>
                    </HStack>
                )}
            </HStack>
        </Box>
    );

    const renderAssignmentCard = (assignment: Assignment) => (
        <Box
            key={assignment.id}
            sx={{
                padding: Theme.spacing.md,
                backgroundColor: colors.tertiary,
                borderRadius: Theme.corners.comfortable,
                marginBottom: Theme.spacing.sm,
                borderLeftWidth: 4,
                borderLeftColor: colors.success,
            }}
        >
            <HStack sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <TouchableOpacity onPress={() => onOpenAssignment?.(assignment.id)} style={{ flex: 1 }}>
                    <VStack sx={{ gap: 4 }}>
                        <HStack sx={{ alignItems: 'center', gap: 4 }}>
                            <Box sx={{ padding: 4, backgroundColor: colors.success, borderRadius: 4 }}>
                                <Text color={Theme.colors.white} sx={{ fontWeight: '700', fontSize: 12 }}>ASSIGNMENT</Text>
                            </Box>
                            {assignment.due_date && (
                                <Text color={colors.warning} sx={{ fontSize: 12 }}>
                                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                                </Text>
                            )}
                        </HStack>
                        <Text color={colors.text} sx={{ fontWeight: '600', fontSize: 16 }}>
                            {assignment.title}
                        </Text>
                    </VStack>
                </TouchableOpacity>

                {isTeacher && (
                    <HStack sx={{ gap: 16 }}>
                        <TouchableOpacity onPress={() => onEditItem?.(assignment, 'assignment')}>
                            <Edit2 size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDeleteItem?.(assignment.id, 'assignment')}>
                            <Trash2 size={18} color={colors.error} />
                        </TouchableOpacity>
                    </HStack>
                )}
            </HStack>
        </Box>
    );

    return (
        <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
            <ScrollView>
                <VStack sx={{ padding: Theme.spacing.lg, gap: 16 }}>
                    <Heading color={colors.action} sx={{ fontSize: 24 }}>
                        {t('classroom.learningPath') || 'Learning Path'}
                    </Heading>

                    {error && (
                        <Box sx={{
                            padding: Theme.spacing.md,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: Theme.corners.comfortable,
                            marginBottom: Theme.spacing.md,
                            borderWidth: 1,
                            borderColor: colors.error
                        }}>
                            <Text color={colors.error} sx={{ fontSize: 14, textAlign: "center" }}>
                                {error}
                            </Text>
                        </Box>
                    )}

                    {isLoading && (
                        <VStack sx={{ gap: 16 }}>
                            <SkeletonCard height={80} />
                            <SkeletonCard height={80} />
                            <SkeletonCard height={80} />
                        </VStack>
                    )}

                    {monthlyGroups.map(({ monthTitle, lessonId, materials, assignments }) => (
                        <Box key={monthTitle} sx={{ marginBottom: Theme.spacing.md }}>
                            <TouchableOpacity onPress={() => toggleLesson(monthTitle)}>
                                <Box
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: colors.secondary,
                                        borderRadius: Theme.corners.comfortable,
                                        borderBottomWidth: expandedLessons[monthTitle] ? 1 : 0,
                                        borderBottomColor: colors.primary,
                                        borderWidth: isCurrentMonth(monthTitle) ? 1 : 0,
                                        borderColor: isCurrentMonth(monthTitle) ? colors.action : 'transparent',
                                    }}
                                >
                                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <VStack>
                                            <HStack sx={{ alignItems: 'center', gap: 4 }}>
                                                <Heading color={isCurrentMonth(monthTitle) ? colors.action : colors.text} sx={{ fontSize: 16 }}>
                                                    {monthTitle}
                                                </Heading>
                                                {isCurrentMonth(monthTitle) && (
                                                    <Box sx={{
                                                        backgroundColor: colors.action,
                                                        paddingHorizontal: 6,
                                                        paddingVertical: 2,
                                                        borderRadius: 4,
                                                        marginLeft: 8
                                                    }}>
                                                        <Text color={Theme.colors.white} sx={{ fontWeight: 'bold', fontSize: 10 }}>CURRENT</Text>
                                                    </Box>
                                                )}
                                            </HStack>
                                            <Text color={colors.textSecondary} sx={{ fontSize: 12 }}>
                                                {materials.length} Materials • {assignments.length} Assignments
                                            </Text>
                                        </VStack>
                                        {expandedLessons[monthTitle] ? (
                                            <ChevronUp color={colors.action} />
                                        ) : (
                                            <ChevronDown color={colors.textTertiary} />
                                        )}
                                    </HStack>
                                </Box>
                            </TouchableOpacity>

                            {expandedLessons[monthTitle] && (
                                <Box
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: colors.tertiary,
                                        borderBottomLeftRadius: Theme.corners.comfortable,
                                        borderBottomRightRadius: Theme.corners.comfortable,
                                    }}
                                >
                                    <VStack sx={{ gap: 16 }}>
                                        {/* Material Section */}
                                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text color={colors.textSecondary} sx={{ fontWeight: '700', fontSize: 14 }}>
                                                ACADEMIC MATERIALS
                                            </Text>
                                            {isTeacher && (
                                                <TouchableOpacity onPress={() => onAddMaterial?.(lessonId || monthTitle)}>
                                                    <HStack sx={{ alignItems: "center", gap: 4 }}>
                                                        <Plus size={16} color={colors.action} />
                                                        <Text color={colors.action} sx={{ fontWeight: 'bold', fontSize: 12 }}>ADD</Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            )}
                                        </HStack>

                                        {materials.length === 0 ? (
                                            <Text color={colors.textTertiary} sx={{ textAlign: 'center', paddingVertical: 8, fontSize: 14, fontStyle: 'italic' }}>
                                                No materials added yet
                                            </Text>
                                        ) : (
                                            materials.map(renderMaterialCard)
                                        )}

                                        {/* Assignment Section */}
                                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginTop: Theme.spacing.md }}>
                                            <Text color={colors.textSecondary} sx={{ fontWeight: '700', fontSize: 14 }}>
                                                ASSIGNMENTS
                                            </Text>
                                            {isTeacher && (
                                                <TouchableOpacity onPress={() => onAddAssignment?.(lessonId || monthTitle)}>
                                                    <HStack sx={{ alignItems: "center", gap: 4 }}>
                                                        <Plus size={16} color={colors.success} />
                                                        <Text color={colors.success} sx={{ fontWeight: 'bold', fontSize: 12 }}>ADD</Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            )}
                                        </HStack>

                                        {assignments.length === 0 ? (
                                            <Text color={colors.textTertiary} sx={{ textAlign: 'center', paddingVertical: 8, fontSize: 14, fontStyle: 'italic' }}>
                                                No assignments linked yet
                                            </Text>
                                        ) : (
                                            assignments.map(renderAssignmentCard)
                                        )}

                                    </VStack>
                                </Box>
                            )}
                        </Box>
                    ))}
                </VStack>
            </ScrollView>
        </Box>
    );
}
