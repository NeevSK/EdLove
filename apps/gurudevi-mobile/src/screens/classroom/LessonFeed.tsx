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
    Icon,
} from '@gluestack-ui/themed';
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
    lesson: Lesson;
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
    const [monthlyGroups, setMonthlyGroups] = useState<MonthlyGroup[]>([]);
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

            const groups: MonthlyGroup[] = lessons.map(lesson => ({
                lesson,
                materials: materials.filter(m => m.lesson_id === lesson.id),
                assignments: assignments.filter(a => a.lesson_id === lesson.id),
            }));

            // Sort by order_index
            groups.sort((a, b) => a.lesson.order_index - b.lesson.order_index);

            setMonthlyGroups(groups);

            // Expand current month by default
            const currentMonthId = groups.find(g => isCurrentMonth(g.lesson.title))?.lesson.id;
            const latestMonthId = groups.length > 0 ? groups[groups.length - 1].lesson.id : null;

            if (currentMonthId) {
                setExpandedLessons({ [currentMonthId]: true });
            } else if (latestMonthId) {
                setExpandedLessons({ [latestMonthId]: true });
            }
        } catch (err: any) {
            console.error('Failed to load feed:', err);
            setError(err.message || 'Failed to load feed');
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

                    {isLoading && (
                        <VStack space="md" sx={{ alignItems: 'center', padding: 40 }}>
                            <Spinner color={Theme.colors.sanctuarySaffron} />
                            <Text color={Theme.colors.mistGray}>Loading path...</Text>
                        </VStack>
                    )}

                    {!isLoading && monthlyGroups.length === 0 && (
                        <Box sx={{ padding: 40, alignItems: 'center' }}>
                            <Text color={Theme.colors.mistGray} textAlign="center">
                                No monthly modules created yet.
                            </Text>
                        </Box>
                    )}

                    {!isLoading && monthlyGroups.map(({ lesson, materials, assignments }) => (
                        <Box key={lesson.id} sx={{ marginBottom: Theme.spacing.md }}>
                            <TouchableOpacity onPress={() => toggleLesson(lesson.id)}>
                                <Box
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: Theme.colors.deepIndigo,
                                        borderRadius: Theme.corners.comfortable,
                                        borderBottomWidth: expandedLessons[lesson.id] ? 1 : 0,
                                        borderBottomColor: Theme.colors.voidIndigo,
                                        borderWidth: isCurrentMonth(lesson.title) ? 1 : 0,
                                        borderColor: isCurrentMonth(lesson.title) ? Theme.colors.sanctuarySaffron : 'transparent',
                                    }}
                                >
                                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <VStack>
                                            <HStack space="xs" sx={{ alignItems: 'center' }}>
                                                <Heading size="md" color={isCurrentMonth(lesson.title) ? Theme.colors.sanctuarySaffron : Theme.colors.pearlGray}>
                                                    {lesson.title}
                                                </Heading>
                                                {isCurrentMonth(lesson.title) && (
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
                                        {expandedLessons[lesson.id] ? (
                                            <ChevronUp color={Theme.colors.sanctuarySaffron} />
                                        ) : (
                                            <ChevronDown color={Theme.colors.mistGray} />
                                        )}
                                    </HStack>
                                </Box>
                            </TouchableOpacity>

                            {expandedLessons[lesson.id] && (
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
                                                <TouchableOpacity onPress={() => onAddMaterial?.(lesson.id)}>
                                                    <HStack space="xs" sx={{ alignItems: 'center' }}>
                                                        <Plus size={16} color={Theme.colors.sanctuarySaffron} />
                                                        <Text color={Theme.colors.sanctuarySaffron} size="xs">Add</Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            )}
                                        </HStack>
                                        {materials.length === 0 ? (
                                            <Text color={Theme.colors.pearlGray} size="xs" italic>No materials for this month.</Text>
                                        ) : (
                                            materials.map(renderMaterialCard)
                                        )}

                                        {/* Assignment Section */}
                                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginTop: Theme.spacing.sm }}>
                                            <Text color={Theme.colors.mistGray} size="sm" sx={{ fontWeight: '700' }}>
                                                ASSIGNMENTS
                                            </Text>
                                            {isTeacher && (
                                                <TouchableOpacity onPress={() => onAddAssignment?.(lesson.id)}>
                                                    <HStack space="xs" sx={{ alignItems: 'center' }}>
                                                        <Plus size={16} color={Theme.colors.sageGreen} />
                                                        <Text color={Theme.colors.sageGreen} size="xs">Add</Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            )}
                                        </HStack>
                                        {assignments.length === 0 ? (
                                            <Text color={Theme.colors.pearlGray} size="xs" italic>No assignments for this month.</Text>
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
