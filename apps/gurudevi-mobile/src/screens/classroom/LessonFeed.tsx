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
} from '@/ui';
import { ChevronDown, ChevronUp, FileText, Link as LinkIcon, Edit2, Trash2, Plus } from 'lucide-react-native';
import { TouchableOpacity, LayoutAnimation } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { Lesson, Assignment, LessonMaterial } from '../../lib/api/types';
import Theme from '../../constants/Theme';

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
        const currentMonthName = monthNames[now.getMonth()].toLowerCase();
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
            // Keep the scaffolded groups so teacher can still see the months
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
                backgroundColor: Theme.colors.deepIndigo,
                borderRadius: Theme.corners.comfortable,
                marginBottom: Theme.spacing.sm,
                borderLeftWidth: 4,
                borderLeftColor: Theme.colors.sanctuarySaffron,
            }}
        >
            <HStack space="md" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => onOpenMaterial?.(material)} style={{ flex: 1 }}>
                    <HStack space="sm" sx={{ alignItems: 'center' }}>
                        {material.type === 'pdf' ? (
                            <FileText size={20} color={Theme.colors.sanctuarySaffron} />
                        ) : (
                            <LinkIcon size={20} color={Theme.colors.amberGlow} />
                        )}
                        <VStack>
                            <Text color={Theme.colors.sacredWhite} size="md" sx={{ fontWeight: '600' }}>
                                {material.title}
                            </Text>
                            <Text color={Theme.colors.mistGray} size="xs">
                                {material.type.toUpperCase()}
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>

                {isTeacher && (
                    <HStack space="md">
                        <TouchableOpacity onPress={() => onEditItem?.(material, 'material')}>
                            <Edit2 size={18} color={Theme.colors.mistGray} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDeleteItem?.(material.id, 'material')}>
                            <Trash2 size={18} color={Theme.colors.emberRed} />
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
                backgroundColor: Theme.colors.voidIndigo,
                borderRadius: Theme.corners.comfortable,
                marginBottom: Theme.spacing.sm,
                borderLeftWidth: 4,
                borderLeftColor: Theme.colors.sageGreen,
            }}
        >
            <HStack space="md" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => onOpenAssignment?.(assignment.id)} style={{ flex: 1 }}>
                    <VStack space="xs">
                        <HStack space="xs" sx={{ alignItems: 'center' }}>
                            <Box sx={{ padding: 4, backgroundColor: Theme.colors.sageGreen, borderRadius: 4 }}>
                                <Text color={Theme.colors.sacredWhite} size="xs" sx={{ fontWeight: '700' }}>ASSIGNMENT</Text>
                            </Box>
                            {assignment.due_date && (
                                <Text color={Theme.colors.amberGlow} size="xs">
                                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                                </Text>
                            )}
                        </HStack>
                        <Text color={Theme.colors.sacredWhite} size="md" sx={{ fontWeight: '600' }}>
                            {assignment.title}
                        </Text>
                    </VStack>
                </TouchableOpacity>

                {isTeacher && (
                    <HStack space="md">
                        <TouchableOpacity onPress={() => onEditItem?.(assignment, 'assignment')}>
                            <Edit2 size={18} color={Theme.colors.mistGray} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDeleteItem?.(assignment.id, 'assignment')}>
                            <Trash2 size={18} color={Theme.colors.emberRed} />
                        </TouchableOpacity>
                    </HStack>
                )}
            </HStack>
        </Box>
    );

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <ScrollView>
                <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
                    <Heading size="2xl" color={Theme.colors.sanctuarySaffron}>
                        {t('classroom.learningPath') || 'Learning Path'}
                    </Heading>

                    {error && (
                        <Box sx={{
                            padding: Theme.spacing.md,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: Theme.corners.comfortable,
                            marginBottom: Theme.spacing.md,
                            borderWidth: 1,
                            borderColor: Theme.colors.emberRed
                        }}>
                            <Text color={Theme.colors.emberRed} size="sm" textAlign="center">
                                {error}
                            </Text>
                        </Box>
                    )}

                    {isLoading && (
                        <HStack space="sm" sx={{ justifyContent: 'center', padding: 10 }}>
                            <Spinner size="small" color={Theme.colors.sanctuarySaffron} />
                            <Text color={Theme.colors.mistGray} size="xs">Checking for updates...</Text>
                        </HStack>
                    )}

                    {monthlyGroups.map(({ monthTitle, lessonId, materials, assignments }) => (
                        <Box key={monthTitle} sx={{ marginBottom: Theme.spacing.md }}>
                            <TouchableOpacity onPress={() => toggleLesson(monthTitle)}>
                                <Box
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: Theme.colors.deepIndigo,
                                        borderRadius: Theme.corners.comfortable,
                                        borderBottomWidth: expandedLessons[monthTitle] ? 1 : 0,
                                        borderBottomColor: Theme.colors.voidIndigo,
                                        borderWidth: isCurrentMonth(monthTitle) ? 1 : 0,
                                        borderColor: isCurrentMonth(monthTitle) ? Theme.colors.sanctuarySaffron : 'transparent',
                                    }}
                                >
                                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <VStack>
                                            <HStack space="xs" sx={{ alignItems: 'center' }}>
                                                <Heading size="md" color={isCurrentMonth(monthTitle) ? Theme.colors.sanctuarySaffron : Theme.colors.pearlGray}>
                                                    {monthTitle}
                                                </Heading>
                                                {isCurrentMonth(monthTitle) && (
                                                    <Box sx={{
                                                        backgroundColor: Theme.colors.sanctuarySaffron,
                                                        paddingHorizontal: 6,
                                                        paddingVertical: 2,
                                                        borderRadius: 4,
                                                        marginLeft: 8
                                                    }}>
                                                        <Text color={Theme.colors.white} size="2xs" bold>CURRENT</Text>
                                                    </Box>
                                                )}
                                            </HStack>
                                            <Text size="xs" color={Theme.colors.mistGray}>
                                                {materials.length} Materials • {assignments.length} Assignments
                                            </Text>
                                        </VStack>
                                        {expandedLessons[monthTitle] ? (
                                            <ChevronUp color={Theme.colors.sanctuarySaffron} />
                                        ) : (
                                            <ChevronDown color={Theme.colors.mistGray} />
                                        )}
                                    </HStack>
                                </Box>
                            </TouchableOpacity>

                            {expandedLessons[monthTitle] && (
                                <Box
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: Theme.colors.midnightBlue,
                                        borderBottomLeftRadius: Theme.corners.comfortable,
                                        borderBottomRightRadius: Theme.corners.comfortable,
                                    }}
                                >
                                    <VStack space="md">
                                        {/* Material Section */}
                                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text color={Theme.colors.mistGray} size="sm" sx={{ fontWeight: '700' }}>
                                                ACADEMIC MATERIALS
                                            </Text>
                                            {isTeacher && (
                                                <TouchableOpacity onPress={() => onAddMaterial?.(lessonId || monthTitle)}>
                                                    <HStack space="xs" alignItems="center">
                                                        <Plus size={16} color={Theme.colors.sanctuarySaffron} />
                                                        <Text color={Theme.colors.sanctuarySaffron} size="xs" bold>ADD</Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            )}
                                        </HStack>

                                        {materials.length === 0 ? (
                                            <Text color={Theme.colors.dimGray} size="sm" italic sx={{ textAlign: 'center', py: 10 }}>
                                                No materials added yet
                                            </Text>
                                        ) : (
                                            materials.map(renderMaterialCard)
                                        )}

                                        {/* Assignment Section */}
                                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginTop: Theme.spacing.md }}>
                                            <Text color={Theme.colors.mistGray} size="sm" sx={{ fontWeight: '700' }}>
                                                ASSIGNMENTS
                                            </Text>
                                            {isTeacher && (
                                                <TouchableOpacity onPress={() => onAddAssignment?.(lessonId || monthTitle)}>
                                                    <HStack space="xs" alignItems="center">
                                                        <Plus size={16} color={Theme.colors.sageGreen} />
                                                        <Text color={Theme.colors.sageGreen} size="xs" bold>ADD</Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            )}
                                        </HStack>

                                        {assignments.length === 0 ? (
                                            <Text color={Theme.colors.dimGray} size="sm" italic sx={{ textAlign: 'center', py: 10 }}>
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
