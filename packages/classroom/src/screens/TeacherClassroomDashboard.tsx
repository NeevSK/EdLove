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
    useBottomTabPadding,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    InputField,
    useRegisterFAB
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { useStore, type ClassroomStackParamList, Intent, usePermissions, api, type Classroom } from '@repo/core';
import { StudentList, AttendanceView, InventoryView, ResourcesView, ClassroomHolisticInsights, ClassroomEchoSection } from '../components';
import { StudentAnalysisModal } from '@repo/library';
import ClassroomNotes from '../components/ClassroomNotes';
import LessonFeed from './LessonFeed';
import AttendanceReportScreen from './AttendanceReportScreen';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<ClassroomStackParamList, 'TeacherClassroomDashboard'>;

type FeatureId = 'insights' | 'notes' | 'students' | 'attendance' | 'gradebook' | 'lessons' | 'resources' | 'inventory' | 'echo';

const TEACHER_FEATURES: { id: FeatureId; label: string; icon: any }[] = [
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'notes', label: 'Notes', icon: NotebookPen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'gradebook', label: 'Gradebook', icon: GraduationCap },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'resources', label: 'Library', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: LayoutGrid },
    { id: 'echo', label: 'Echo', icon: MessageSquare },
];

export default function TeacherClassroomDashboard({ route, navigation }: Props) {
    const { classroomId, classroomName } = route.params;
    const { t } = useTranslation();
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const { can, context } = usePermissions();
    const [activeFeature, setActiveFeature] = useState<FeatureId>('insights');
    const [loading, setLoading] = useState(true);
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
    const [activeView, setActiveView] = useState<'main' | 'attendance_report'>('main');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [analysisStudent, setAnalysisStudent] = useState<any | null>(null);

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
            const classData = await (api as any).classrooms.getById(classroomId);
            setClassroom(classData);
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

    useEffect(() => {
        if (activeFeature === 'students' && students.length === 0 && classroomId) {
            api.classroomStudents.getAll(classroomId).then(setStudents).catch(console.error);
        }
    }, [activeFeature, classroomId]);

    // Register FAB for Teachers
    useRegisterFAB({
        tabType: 'classroom',
        onPress: () => {
             if (activeFeature === 'lessons') {
                 setShowAddMonthModal(true);
             }
        },
        icon: <Plus size={24} color="#FFF" />,
        visible: activeFeature === 'lessons'
    });

    const renderFeatureContent = () => {
        switch (activeFeature) {
            case 'insights':
                return <ClassroomHolisticInsights classroomId={classroomId} />;
            case 'notes':
                return <ClassroomNotes classroomId={classroomId} isTeacher={can('update', 'ClassroomNotes')} />;
            case 'students':
                return (
                    <StudentList
                        classroomId={classroomId}
                        students={students}
                        onRefresh={() => api.classroomStudents.getAll(classroomId).then(setStudents)}
                        onAnalyzePotential={(student) => {
                            setAnalysisStudent(student);
                            setShowAnalysisModal(true);
                        }}
                    />
                );
            case 'attendance':
                return <AttendanceView classroomId={classroomId} />
            case 'gradebook':
                return <Box sx={{ padding: Theme.spacing.md }}><Text sx={{ color: colors.textTertiary }}>Gradebook Summary View</Text></Box>
            case 'lessons':
                return (
                    <LessonFeed
                        classroomId={classroomId}
                        isTeacher={can('update', 'LessonManagement')}
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
                return <ResourcesView classroomId={classroomId} isTeacher={can('update', 'LessonManagement')} />
            case 'echo':
                return <ClassroomEchoSection classroomId={classroomId} isTeacher={can('read', 'TeacherPulse')} />
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
                </VStack>
            </ScreenWrapper>
        );
    }

    const schoolId = classroom?.school_id || '';

    if (activeView === 'attendance_report') {
        return (
            <AttendanceReportScreen
                schoolId={schoolId}
                classroomId={classroomId}
                onBack={() => setActiveView('main')}
            />
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
                <Box sx={{ padding: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <VStack>
                            <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: colors.textTertiary, fontWeight: '700' as any, textTransform: 'uppercase' }}>
                                Class Sanctuary
                            </Text>
                            <Heading sx={{ fontSize: Theme.typography.fontSize.xl, color: Theme.colors.sanctuarySaffron }}>
                                {classroomName}
                            </Heading>
                        </VStack>
                        <HStack sx={{ gap: 8, alignItems: 'center' }}>
                            {activeFeature === 'lessons' && (
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
                        </HStack>
                    </HStack>
                </Box>

                <Box sx={{ paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.md, backgroundColor: colors.secondary }}>
                    <Intent 
                        name="institutional.student_pulse"
                        props={{
                            schoolId,
                            classroomId,
                            onViewAtRisk: () => setActiveFeature('students'),
                            onViewFullReport: () => setActiveView('attendance_report')
                        }}
                    />
                </Box>

                <Box sx={{ backgroundColor: colors.secondary, paddingBottom: Theme.spacing.md, paddingTop: Theme.spacing.sm }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                        <HStack sx={{ gap: 12 }}>
                            {TEACHER_FEATURES.map((f) => {
                                const Icon = f.icon;
                                const isActive = activeFeature === f.id;
                                return (
                                    <Pressable key={f.id} onPress={() => { hapticLight(); setActiveFeature(f.id); }}>
                                        <VStack sx={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingHorizontal: Theme.spacing.md,
                                            paddingVertical: Theme.spacing.sm,
                                            borderRadius: Theme.corners.comfortable,
                                            backgroundColor: isActive ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                            minWidth: 90,
                                            gap: Theme.spacing.xs
                                        }}>
                                            <Icon size={20} color={isActive ? Theme.colors.sacredWhite : colors.textSecondary} />
                                            <Text sx={{
                                                fontSize: Theme.typography.fontSize.xs,
                                                fontWeight: (isActive ? '700' : '400') as any,
                                                color: isActive ? Theme.colors.sacredWhite : colors.textSecondary
                                            }}>{f.label}</Text>
                                        </VStack>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </ScrollView>
                </Box>

                <Box flex={1}>
                    {renderFeatureContent()}
                </Box>
            </ScrollView>

            {/* Modals */}
            <Modal isOpen={showAddMonthModal} onClose={() => setShowAddMonthModal(false)}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.secondary }}>
                    <ModalHeader><Heading color={colors.text} sx={{ fontSize: 18 }}>Add Monthly Module</Heading></ModalHeader>
                    <ModalBody sx={{ paddingBottom: Theme.spacing.lg }}>
                        <VStack sx={{ gap: 16 }}>
                            <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>Give this month a title (e.g., "September 2026")</Text>
                            <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                <InputField placeholder="Enter title..." value={newMonthTitle} onChangeText={setNewMonthTitle} color={colors.text} />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack sx={{ gap: 8 }}>
                            <Button variant="outline" action="secondary" onPress={() => setShowAddMonthModal(false)}><ButtonText color={colors.textTertiary}>Cancel</ButtonText></Button>
                            <Button action="primary" onPress={handleAddMonth} isDisabled={!newMonthTitle.trim() || isSubmitting}>
                                {isSubmitting ? <Spinner color={Theme.colors.sacredWhite} /> : <ButtonText color={Theme.colors.sacredWhite}>Create</ButtonText>}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={showAddContentModal} onClose={() => { setShowAddContentModal(false); resetForm(); }}>
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
                            )}
                            <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                <InputField placeholder="Title" value={formTitle} onChangeText={setFormTitle} color={colors.text} />
                            </Input>
                            {(contentType === 'assignment' || formType === 'note') && (
                                <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent', minHeight: 80 }}>
                                    <InputField placeholder="Description" value={formDescription} onChangeText={setFormDescription} color={colors.text} multiline />
                                </Input>
                            )}
                            {contentType === 'material' && (formType === 'pdf' || formType === 'link') && (
                                <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                    <InputField placeholder="URL" value={formUrl} onChangeText={setFormUrl} color={colors.text} autoCapitalize="none" />
                                </Input>
                            )}
                            {contentType === 'assignment' && (
                                <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                    <InputField placeholder="Due Date (YYYY-MM-DD)" value={formDueDate} onChangeText={setFormDueDate} color={colors.text} />
                                </Input>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack sx={{ gap: 8 }}>
                            <Button variant="outline" action="secondary" onPress={() => { setShowAddContentModal(false); resetForm(); }}><ButtonText color={colors.textTertiary}>Cancel</ButtonText></Button>
                            <Button action="primary" onPress={handleAddContent} isDisabled={!formTitle.trim() || isSubmitting}>
                                {isSubmitting ? <Spinner color={Theme.colors.sacredWhite} /> : <ButtonText color={Theme.colors.sacredWhite}>Add</ButtonText>}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {showAnalysisModal && analysisStudent && (
                <StudentAnalysisModal
                    visible={showAnalysisModal}
                    onClose={() => { setShowAnalysisModal(false); setAnalysisStudent(null); }}
                    studentId={analysisStudent.id}
                    studentName={analysisStudent.full_name}
                    classroomId={classroomId}
                />
            )}
        </ScreenWrapper>
    );
}
