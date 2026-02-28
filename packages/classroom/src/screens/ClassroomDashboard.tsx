import React, { useState, useEffect, useMemo } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    ScrollView,
    Pressable,
    Heading,
    Spinner,
    Button,
    ButtonText,
    Theme,
    useThemedColors,
    hapticLight,
    GlobalHeader,
    ScreenWrapper,
    SkeletonCard,
    PositiveInvitation,
    useBottomTabPadding,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    InputField,
} from '@repo/ui';
import {
    Users,
    BookOpen,
    FileText,
    ClipboardCheck,
    GraduationCap,
    LayoutGrid,
    NotebookPen,
    Plus
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { api, supabase } from '@repo/core';
import type { Classroom } from '@repo/core';
import { StudentList, GradebookTable, AttendanceView, InventoryView, ResourcesView } from '../components';
import ClassroomNotes from '../components/ClassroomNotes';
import LessonFeed from './LessonFeed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClassroomStackParamList } from '@repo/core';

type Props = NativeStackScreenProps<ClassroomStackParamList, 'ClassroomDetails'>;

type FeatureId = 'notes' | 'students' | 'attendance' | 'gradebook' | 'lessons' | 'resources' | 'inventory';

const ALL_FEATURES: { id: FeatureId; label: string; icon: any }[] = [
    { id: 'notes', label: 'Notes', icon: NotebookPen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'gradebook', label: 'Gradebook', icon: GraduationCap },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'resources', label: 'Library', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: LayoutGrid },
];

export default function ClassroomDashboard({ route, navigation }: Props) {
    const { classroomId, classroomName } = route.params;
    const { t } = useTranslation();
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [activeFeature, setActiveFeature] = useState<FeatureId>('notes');
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();

    // Lessons/Content Management State
    const [showAddMonthModal, setShowAddMonthModal] = useState(false);
    const [newMonthTitle, setNewMonthTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddContentModal, setShowAddContentModal] = useState(false);
    const [contentType, setContentType] = useState<'material' | 'assignment'>('material');
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formType, setFormType] = useState<'pdf' | 'link' | 'note'>('note');
    const [formUrl, setFormUrl] = useState('');
    const [formDueDate, setFormDueDate] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, [classroomId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [classData, { data: authData }] = await Promise.all([
                api.classrooms.getById(classroomId),
                supabase.auth.getUser()
            ]);
            setClassroom(classData);
            setCurrentUserId(authData?.user?.id || null);
        } catch (error) {
            console.error('Error fetching classroom details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMonth = async () => {
        if (!newMonthTitle.trim()) return;
        setIsSubmitting(true);
        try {
            const lessons = await api.lessons.getAll(classroomId);
            const maxOrder = lessons.reduce((max, l) => Math.max(max, l.order_index), 0);

            await api.lessons.create({
                classroom_id: classroomId,
                title: newMonthTitle,
                order_index: maxOrder + 1,
            });
            setShowAddMonthModal(false);
            setNewMonthTitle('');
            setRefreshTrigger(prev => prev + 1);
            await fetchInitialData();
        } catch (error) {
            console.error('Failed to add month:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddContent = async () => {
        if (!formTitle.trim() || !activeLessonId) return;
        setIsSubmitting(true);
        try {
            let targetLessonId = activeLessonId;

            // If activeLessonId is actually the month title (virtual lesson)
            // we need to create the lesson record first
            if (!targetLessonId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                const newLesson = await api.lessons.create({
                    classroom_id: classroomId,
                    title: targetLessonId,
                    content: `Materials for ${targetLessonId}`,
                    order_index: 0,
                });
                targetLessonId = newLesson.id;
            }

            if (contentType === 'material') {
                await api.lessonMaterials.create({
                    classroom_id: classroomId,
                    lesson_id: targetLessonId,
                    title: formTitle,
                    type: formType,
                    url: (formType === 'pdf' || formType === 'link') ? formUrl : undefined,
                    content: formType === 'note' ? formDescription : undefined,
                    is_pinned: false,
                });
            } else {
                await api.assignments.create({
                    classroom_id: classroomId,
                    lesson_id: targetLessonId,
                    title: formTitle,
                    description: formDescription,
                    due_date: formDueDate || undefined,
                });
            }
            setShowAddContentModal(false);
            resetForm();
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Failed to add content:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormTitle('');
        setFormDescription('');
        setFormType('note');
        setFormUrl('');
        setFormDueDate('');
        setActiveLessonId(null);
    };

    const isClassTeacher = useMemo(() => {
        if (!classroom || !currentUserId) return false;
        if (classroom.id.startsWith('sample-') || (classroom as any).is_sample) return true;
        return classroom.teacher_id === currentUserId;
    }, [classroom, currentUserId]);

    const filteredFeatures = useMemo(() => {
        return ALL_FEATURES.filter(f => {
            if (f.id === 'inventory') return isClassTeacher;
            return true;
        });
    }, [isClassTeacher]);
            api.classroomStudents.getAll(classroomId).then(setStudents).catch(console.error);
        }
    }, [activeFeature, classroomId]);

    const renderFeatureContent = () => {
        switch (activeFeature) {
            case 'notes':
                return (
                    <ClassroomNotes
                        classroomId={classroomId}
                        isTeacher={isClassTeacher}
                    />
                );
            case 'students':
                return (
                    <StudentList
                        classroomId={classroomId}
                        students={students}
                        onRefresh={() => api.classroomStudents.getAll(classroomId).then(setStudents)}
                    />
                );
            case 'attendance':
                return <AttendanceView classroomId={classroomId} />
            case 'gradebook':
                // Using GradebookTable directly or could navigate to GradebookScreen
                // For simple view in dashboard, we keep it as is or show a summary
                return <Box sx={{ padding: Theme.spacing.md }}><Text sx={{ color: colors.textTertiary }}>Gradebook Summary View</Text></Box>
            case 'lessons':
                return (
                    <LessonFeed
                        classroomId={classroomId}
                        isTeacher={isClassTeacher}
                        refreshTrigger={refreshTrigger}
                        onOpenLesson={(id: string) => console.log('Open Lesson', id)}
                        onOpenAssignment={(id: string) => console.log('Open Assignment', id)}
                        onAddMaterial={(lessonId) => {
                            setActiveLessonId(lessonId);
                            setContentType('material');
                            setShowAddContentModal(true);
                        }}
                        onAddAssignment={(lessonId) => {
                            setActiveLessonId(lessonId);
                            setContentType('assignment');
                            setShowAddContentModal(true);
                        }}
                    />
                );
            case 'inventory':
                return <InventoryView classroomId={classroomId} />
            case 'resources':
                return <ResourcesView classroomId={classroomId} isTeacher={isClassTeacher} />
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <GlobalHeader title={classroomName} showBack onBack={() => navigation.goBack()} />
                <VStack sx={{ gap: '$md' as any, padding: '$4' as any }}>
                    <SkeletonCard height={100} />
                    <HStack sx={{ gap: '$md' as any, marginTop: '$4' as any }}>
                        <SkeletonCard width={90} height={70} />
                        <SkeletonCard width={90} height={70} />
                        <SkeletonCard width={90} height={70} />
                    </HStack>
                    <VStack sx={{ gap: '$md' as any, marginTop: '$4' as any }}>
                        <SkeletonCard height={60} />
                        <SkeletonCard height={60} />
                        <SkeletonCard height={60} />
                        <SkeletonCard height={60} />
                    </VStack>
                </VStack>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={classroomName}
                subtitle={classroom?.subject || 'Classroom'}
                showBack
                onBack={() => navigation.goBack()}
            />

            <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={{ paddingBottom: bottomPadding }}>
                {/* 1. Header Area */}
                <Box sx={{ padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <VStack>
                            <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: colors.textTertiary, fontWeight: '700' as any, textTransform: 'uppercase' }}>
                                {isClassTeacher ? 'Class Sanctuary' : 'Subject Sanctuary'}
                            </Text>
                            <Heading sx={{ fontSize: Theme.typography.fontSize.xl, color: Theme.colors.sanctuarySaffron }}>
                                {classroomName}
                            </Heading>
                        </VStack>
                        <HStack sx={{ gap: 8, alignItems: 'center' }}>
                            {activeFeature === 'lessons' && isClassTeacher && (
                                <Button
                                    size="sm"
                                    action="primary"
                                    onPress={() => setShowAddMonthModal(true)}
                                    sx={{
                                        backgroundColor: Theme.colors.sanctuarySaffron,
                                        borderRadius: Theme.corners.comfortable,
                                        height: 36,
                                    }}
                                >
                                    <HStack alignItems="center" sx={{ gap: 4 }}>
                                        <Plus size={16} color={Theme.colors.sacredWhite} />
                                        <ButtonText color={Theme.colors.sacredWhite}>Module</ButtonText>
                                    </HStack>
                                </Button>
                            )}
                            {classroom?.subject && (
                                <Box sx={{ backgroundColor: colors.tertiary, paddingHorizontal: Theme.spacing.sm, paddingVertical: Theme.spacing.xs, borderRadius: Theme.corners.full }}>
                                    <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700' as any, color: Theme.colors.sanctuarySaffron }}>{classroom.subject}</Text>
                                </Box>
                            )}
                        </HStack>
                    </HStack>
                </Box>

                {/* 2. Horizontal Carousel (Sticky) */}
                <Box sx={{ backgroundColor: colors.secondary, paddingBottom: Theme.spacing.md, paddingTop: Theme.spacing.sm }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        <HStack sx={{ gap: 12 }}>
                            {filteredFeatures.map((f) => {
                                const Icon = f.icon;
                                const isActive = activeFeature === f.id;
                                return (
                                    <Pressable
                                        key={f.id}
                                        onPress={() => {
                                            hapticLight();
                                            setActiveFeature(f.id);
                                        }}
                                    >
                                        <VStack
                                            sx={{
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                paddingHorizontal: Theme.spacing.md,
                                                paddingVertical: Theme.spacing.sm,
                                                borderRadius: Theme.corners.comfortable,
                                                backgroundColor: isActive ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                                minWidth: 90,
                                                gap: Theme.spacing.xs
                                            }}
                                        >
                                            <Icon
                                                size={20}
                                                color={isActive ? Theme.colors.sacredWhite : colors.textSecondary}
                                            />
                                            <Text
                                                sx={{
                                                    fontSize: Theme.typography.fontSize.xs,
                                                    fontWeight: (isActive ? '700' : '400') as any,
                                                    color: isActive ? Theme.colors.sacredWhite : colors.textSecondary
                                                }}
                                            >
                                                {f.label}
                                            </Text>
                                        </VStack>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </ScrollView>
                </Box>

                {/* 3. Feature Content */}
                <Box flex={1}>
                    {renderFeatureContent()}
                </Box>
            </ScrollView>

            {/* Modals */}
            <Modal isOpen={showAddMonthModal} onClose={() => setShowAddMonthModal(false)}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.secondary }}>
                    <ModalHeader>
                        <Heading color={colors.text} sx={{ fontSize: 18 }}>Add Monthly Module</Heading>
                    </ModalHeader>
                    <ModalBody sx={{ paddingBottom: Theme.spacing.lg }}>
                        <VStack sx={{ gap: 16 }}>
                            <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>Give this month a title (e.g., "September 2026")</Text>
                            <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                <InputField
                                    placeholder="Enter title..."
                                    value={newMonthTitle}
                                    onChangeText={setNewMonthTitle}
                                    color={colors.text}
                                />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack sx={{ gap: 8 }}>
                            <Button variant="outline" action="secondary" onPress={() => setShowAddMonthModal(false)}>
                                <ButtonText color={colors.textTertiary}>Cancel</ButtonText>
                            </Button>
                            <Button action="primary" onPress={handleAddMonth} isDisabled={!newMonthTitle.trim() || isSubmitting}>
                                {isSubmitting ? <Spinner color={Theme.colors.sacredWhite} /> : <ButtonText color={Theme.colors.sacredWhite}>Create</ButtonText>}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Add Content Modal (Material or Assignment) */}
            <Modal isOpen={showAddContentModal} onClose={() => {
                setShowAddContentModal(false);
                resetForm();
            }}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.secondary, maxWidth: 500 }}>
                    <ModalHeader>
                        <Heading color={colors.text} sx={{ fontSize: 18 }}>
                            {contentType === 'material' ? 'Add Academic Material' : 'Create Assignment'}
                        </Heading>
                    </ModalHeader>
                    <ModalBody sx={{ paddingBottom: Theme.spacing.lg }}>
                        <VStack sx={{ gap: 16 }}>
                            {contentType === 'material' && (
                                <VStack sx={{ gap: 4 }}>
                                    <Text color={Theme.colors.mistGray} sx={{ fontSize: 14 }}>Type</Text>
                                    <HStack sx={{ gap: 8 }}>
                                        {(['note', 'link', 'pdf'] as const).map((type) => (
                                            <Pressable key={type} onPress={() => setFormType(type)} style={{ flex: 1 }}>
                                                <Box sx={{
                                                    padding: Theme.spacing.sm,
                                                    borderRadius: Theme.corners.tight,
                                                    backgroundColor: formType === type ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                                    alignItems: 'center'
                                                }}>
                                                    <Text color={formType === type ? Theme.colors.sacredWhite : colors.textSecondary} sx={{ fontSize: 12, fontWeight: 'bold' }}>{type.toUpperCase()}</Text>
                                                </Box>
                                            </Pressable>
                                        ))}
                                    </HStack>
                                </VStack>
                            )}

                            <VStack sx={{ gap: 4 }}>
                                <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>Title</Text>
                                <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                    <InputField
                                        placeholder="Enter title..."
                                        value={formTitle}
                                        onChangeText={setFormTitle}
                                        color={colors.text}
                                    />
                                </Input>
                            </VStack>

                            {(contentType === 'assignment' || formType === 'note') && (
                                <VStack sx={{ gap: 4 }}>
                                    <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>Description / Content</Text>
                                    <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent', minHeight: 80 }}>
                                        <InputField
                                            placeholder="Enter details..."
                                            value={formDescription}
                                            onChangeText={setFormDescription}
                                            color={colors.text}
                                            multiline
                                        />
                                    </Input>
                                </VStack>
                            )}

                            {contentType === 'material' && (formType === 'pdf' || formType === 'link') && (
                                <VStack sx={{ gap: 4 }}>
                                    <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>URL</Text>
                                    <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                        <InputField
                                            placeholder="https://..."
                                            value={formUrl}
                                            onChangeText={setFormUrl}
                                            color={colors.text}
                                            autoCapitalize="none"
                                        />
                                    </Input>
                                </VStack>
                            )}

                            {contentType === 'assignment' && (
                                <VStack sx={{ gap: 4 }}>
                                    <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>Due Date (Optional)</Text>
                                    <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                        <InputField
                                            placeholder="YYYY-MM-DD"
                                            value={formDueDate}
                                            onChangeText={setFormDueDate}
                                            color={colors.text}
                                        />
                                    </Input>
                                </VStack>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack sx={{ gap: 8 }}>
                            <Button variant="outline" action="secondary" onPress={() => {
                                setShowAddContentModal(false);
                                resetForm();
                            }}>
                                <ButtonText color={colors.textTertiary}>Cancel</ButtonText>
                            </Button>
                            <Button action="primary" onPress={handleAddContent} isDisabled={!formTitle.trim() || isSubmitting}>
                                {isSubmitting ? <Spinner color={Theme.colors.sacredWhite} /> : <ButtonText color={Theme.colors.sacredWhite}>Add</ButtonText>}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </ScreenWrapper>
    );
}
