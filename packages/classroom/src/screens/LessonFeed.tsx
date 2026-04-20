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
    SkeletonCard,
} from '@repo/ui';
import {
    ChevronDown,
    ChevronUp,
    FileText,
    Link as LinkIcon,
    Edit2,
    Trash2,
    Plus,
    CheckCircle2,
} from 'lucide-react-native';
import { TouchableOpacity, LayoutAnimation } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api, Assignment, LessonMaterial, Lesson } from '@repo/core';

interface LessonFeedProps {
    classroomId: string;
    isTeacher?: boolean;
    onOpenLesson?: (lessonId: string) => void;
    onOpenAssignment?: (assignmentId: string) => void;
    onOpenAssignmentRecord?: (assignment: Assignment) => void;
    onOpenMaterial?: (material: LessonMaterial) => void;
    onAddMaterial?: (lessonId: string) => void;
    onAddAssignment?: (lessonId: string) => void;
    onEditItem?: (item: any, type: 'material' | 'assignment') => void;
    onDeleteItem?: (id: string, type: 'material' | 'assignment') => void;
    refreshTrigger?: number;
    submittedAssignmentIds?: Set<string>;
}

interface MonthlyGroup {
    monthTitle: string;
    lessonId?: string;
    materials: LessonMaterial[];
    assignments: Assignment[];
    lessons: Lesson[];
}

export default function LessonFeed({
    classroomId,
    isTeacher = false,
    onOpenAssignment,
    onOpenAssignmentRecord,
    onOpenMaterial,
    onAddMaterial,
    onAddAssignment,
    onEditItem,
    onDeleteItem,
    refreshTrigger,
    submittedAssignmentIds,
}: LessonFeedProps) {
    const { t } = useTranslation();

    const getCalendarScaffold = (): MonthlyGroup[] => {
        const now = new Date();
        const year = now.getFullYear();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return monthNames.map(name => ({
            monthTitle: `${name} ${year}`,
            materials: [],
            assignments: [],
            lessons: [],
        }));
    };

    const [monthlyGroups, setMonthlyGroups] = useState<MonthlyGroup[]>(getCalendarScaffold());
    const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isCurrentMonth = (title: string) => {
        const now = new Date();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
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
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            const calendarGroups: MonthlyGroup[] = monthNames.map((name) => {
                const monthTitle = `${name} ${year}`;
                const existingLesson = lessons.find(l => l.title === monthTitle);

                return {
                    monthTitle,
                    lessonId: existingLesson?.id,
                    materials: materials.filter(m => m.lesson_id === existingLesson?.id),
                    assignments: assignments.filter(a => a.lesson_id === existingLesson?.id),
                    lessons: lessons.filter(l => l.title === monthTitle),
                };
            }) as MonthlyGroup[];

            setMonthlyGroups(calendarGroups);

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

    useEffect(() => {
        loadFeed();
    }, [classroomId, refreshTrigger]);

    const toggleLesson = (monthTitle: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedLessons(prev => ({
            ...prev,
            [monthTitle]: !prev[monthTitle],
        }));
    };

    const renderMaterialCard = (material: LessonMaterial) => (
        <Box
            key={material.id}
            className="p-md bg-phase-surface rounded-comfortable mb-sm border-l-4 border-l-phase-accent"
        >
            <HStack className="items-center justify-between gap-4">
                <TouchableOpacity onPress={() => onOpenMaterial?.(material)} style={{ flex: 1 }}>
                    <HStack className="items-center gap-2">
                        {material.type === 'pdf' ? (
                            <Icon as={FileText} size="md" className="text-phase-accent" />
                        ) : (
                            <Icon as={LinkIcon} size="md" className="text-amberGlow" />
                        )}
                        <VStack>
                            <Text className="font-semibold text-base text-phaseText-primary">
                                {material.title}
                            </Text>
                            <Text className="text-xs text-phaseText-secondary">
                                {material.type.toUpperCase()}
                            </Text>
                        </VStack>
                    </HStack>
                </TouchableOpacity>

                {isTeacher && (
                    <HStack className="gap-4">
                        <TouchableOpacity onPress={() => onEditItem?.(material, 'material')}>
                            <Icon as={Edit2} size="sm" className="text-phaseText-secondary" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDeleteItem?.(material.id, 'material')}>
                            <Icon as={Trash2} size="sm" className="text-phase-danger" />
                        </TouchableOpacity>
                    </HStack>
                )}
            </HStack>
        </Box>
    );

    const renderAssignmentCard = (assignment: Assignment) => {
        const isSubmitted = submittedAssignmentIds?.has(assignment.id) ?? false;

        return (
            <Box
                key={assignment.id}
                className="p-md bg-phase-canvas rounded-comfortable mb-sm border-l-4 border-l-phase-reward"
            >
                <HStack className="items-center justify-between gap-4">
                    <TouchableOpacity
                        onPress={() => {
                            onOpenAssignmentRecord?.(assignment);
                            onOpenAssignment?.(assignment.id);
                        }}
                        style={{ flex: 1 }}
                    >
                        <VStack className="gap-1">
                            <HStack className="items-center gap-2">
                                <Box className="px-1.5 py-0.5 bg-phase-reward rounded-sm">
                                    <Text className="font-bold text-[10px] text-sacredWhite leading-tight">
                                        ASSIGNMENT
                                    </Text>
                                </Box>
                                {!isTeacher && isSubmitted && (
                                    <HStack className="items-center gap-1">
                                        <Icon as={CheckCircle2} size="xs" className="text-phase-reward" />
                                        <Text className="text-xs font-bold text-phase-reward">
                                            Submitted
                                        </Text>
                                    </HStack>
                                )}
                                {assignment.due_date && (
                                    <Text className="text-xs text-amberGlow">
                                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                                    </Text>
                                )}
                            </HStack>
                            <Text className="font-semibold text-base text-phaseText-primary">
                                {assignment.title}
                            </Text>
                        </VStack>
                    </TouchableOpacity>

                    {isTeacher && (
                        <HStack className="gap-4">
                            <TouchableOpacity onPress={() => onEditItem?.(assignment, 'assignment')}>
                                <Icon as={Edit2} size="sm" className="text-phaseText-secondary" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onDeleteItem?.(assignment.id, 'assignment')}>
                                <Icon as={Trash2} size="sm" className="text-phase-danger" />
                            </TouchableOpacity>
                        </HStack>
                    )}

                    {!isTeacher && !isSubmitted && onOpenAssignmentRecord && (
                        <Button
                            size="sm"
                            className="bg-phase-reward rounded-comfortable px-4"
                            onPress={() => onOpenAssignmentRecord(assignment)}
                        >
                            <ButtonText className="text-sacredWhite font-bold">Turn In</ButtonText>
                        </Button>
                    )}
                </HStack>
            </Box>
        );
    };

    return (
        <Box className="flex-1 bg-phase-world">
            <ScrollView showsVerticalScrollIndicator={false}>
                <VStack className="p-lg gap-4">
                    <Heading className="text-2xl text-phase-accent font-black">
                        {t('classroom.learningPath') || 'Learning Path'}
                    </Heading>

                    {error && (
                        <Box className="p-md bg-phase-danger/10 rounded-comfortable mb-md border border-phase-danger">
                            <Text className="text-sm text-center text-phase-danger font-medium">
                                {error}
                            </Text>
                        </Box>
                    )}

                    {isLoading && (
                        <VStack className="gap-4">
                            <SkeletonCard height={80} />
                            <SkeletonCard height={80} />
                            <SkeletonCard height={80} />
                        </VStack>
                    )}

                    {monthlyGroups.map(({ monthTitle, lessonId, materials, assignments }) => (
                        <Box key={monthTitle} className="mb-sm">
                            <TouchableOpacity onPress={() => toggleLesson(monthTitle)} activeOpacity={0.7}>
                                <Box
                                    className={`p-md bg-phase-surface rounded-comfortable ${expandedLessons[monthTitle] ? 'rounded-b-none' : ''} ${isCurrentMonth(monthTitle) ? 'border border-phase-accent' : ''}`}
                                >
                                    <HStack className="justify-between items-center">
                                        <VStack>
                                            <HStack className="items-center gap-1">
                                                <Heading className={`text-base ${isCurrentMonth(monthTitle) ? 'text-phase-accent' : 'text-phaseText-primary'}`}>
                                                    {monthTitle}
                                                </Heading>
                                                {isCurrentMonth(monthTitle) && (
                                                    <Box className="bg-phase-accent px-1.5 py-0.5 rounded-sm ml-2">
                                                        <Text className="font-bold text-[10px] text-sacredWhite leading-tight">
                                                            CURRENT
                                                        </Text>
                                                    </Box>
                                                )}
                                            </HStack>
                                            <Text className="text-xs text-phaseText-secondary">
                                                {materials.length} Materials • {assignments.length} Assignments
                                            </Text>
                                        </VStack>
                                        {expandedLessons[monthTitle] ? (
                                            <Icon as={ChevronUp} size="md" className="text-phase-accent" />
                                        ) : (
                                            <Icon as={ChevronDown} size="md" className="text-mistGray" />
                                        )}
                                    </HStack>
                                </Box>
                            </TouchableOpacity>

                            {expandedLessons[monthTitle] && (
                                <Box
                                    className="p-md bg-phase-canvas rounded-b-comfortable border-t border-t-phase-world/5"
                                >
                                    <VStack className="gap-4">
                                        {/* Material Section */}
                                        <HStack className="justify-between items-center">
                                            <Text className="font-black text-sm text-phaseText-secondary tracking-widest uppercase">
                                                Academic Materials
                                            </Text>
                                            {isTeacher && (
                                                <TouchableOpacity onPress={() => onAddMaterial?.(lessonId || monthTitle)}>
                                                    <HStack className="items-center gap-1">
                                                        <Icon as={Plus} size="sm" className="text-phase-accent" />
                                                        <Text className="font-bold text-xs text-phase-accent">
                                                            ADD
                                                        </Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            )}
                                        </HStack>

                                        {materials.length === 0 ? (
                                            <Text className="text-center py-2 text-sm italic text-mistGray">
                                                No materials added yet
                                            </Text>
                                        ) : (
                                            materials.map(renderMaterialCard)
                                        )}

                                        {/* Assignment Section */}
                                        <HStack className="justify-between items-center mt-4">
                                            <Text className="font-black text-sm text-phaseText-secondary tracking-widest uppercase">
                                                Assignments
                                            </Text>
                                            {isTeacher && (
                                                <TouchableOpacity onPress={() => onAddAssignment?.(lessonId || monthTitle)}>
                                                    <HStack className="items-center gap-1">
                                                        <Icon as={Plus} size="sm" className="text-phase-reward" />
                                                        <Text className="font-bold text-xs text-phase-reward">
                                                            ADD
                                                        </Text>
                                                    </HStack>
                                                </TouchableOpacity>
                                            )}
                                        </HStack>

                                        {assignments.length === 0 ? (
                                            <Text className="text-center py-2 text-sm italic text-mistGray">
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
