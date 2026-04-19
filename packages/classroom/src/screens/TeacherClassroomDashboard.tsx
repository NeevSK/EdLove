import React, { useState } from 'react';
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
    useRegisterFAB,
} from '@repo/ui';
import { type ClassroomStackParamList, usePermissions, api, type Classroom } from '@repo/core';
import { StudentList, AttendanceView, InventoryView, ResourcesView, ClassroomHolisticInsights, ClassroomEchoSection } from '../components';
import { StudentAnalysisModal } from '@repo/library';
import ClassroomNotes from '../components/ClassroomNotes';
import LessonFeed from './LessonFeed';
import AttendanceReportScreen from './AttendanceReportScreen';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    BookOpen,
    ClipboardCheck,
    ClipboardList,
    FileText,
    GraduationCap,
    LayoutGrid,
    Layers3,
    MessageSquare,
    NotebookPen,
    Plus,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react-native';
import TeacherAssignmentsWorkspace from '../components/teacher/TeacherAssignmentsWorkspace';
import TeacherObservationsWorkspace from '../components/teacher/TeacherObservationsWorkspace';
import TeacherAnalysisWorkspace from '../components/teacher/TeacherAnalysisWorkspace';
import TeacherGroupsModal from '../components/teacher/TeacherGroupsModal';
import { useTeacherClassroomWorkspaceData } from '../workspace/useTeacherClassroomWorkspaceData';

type Props = NativeStackScreenProps<ClassroomStackParamList, 'TeacherClassroomDashboard'>;

type FeatureId =
    | 'insights'
    | 'students'
    | 'assignments'
    | 'lessons'
    | 'resources'
    | 'notes'
    | 'attendance'
    | 'inventory'
    | 'echo'
    | 'observations'
    | 'analysis';

const TEACHER_FEATURES: { id: FeatureId; label: string; icon: any }[] = [
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'resources', label: 'Library', icon: FileText },
    { id: 'notes', label: 'Notes', icon: NotebookPen },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'inventory', label: 'Inventory', icon: LayoutGrid },
    { id: 'echo', label: 'Echo', icon: MessageSquare },
    { id: 'observations', label: 'Observations', icon: Sparkles },
    { id: 'analysis', label: 'Analysis', icon: GraduationCap },
];

const FEATURE_TONES: Record<FeatureId, { label: string; color: string; tint: string }> = {
    insights: { label: 'Class pulse', color: Theme.colors.gurudeviBlue, tint: 'rgba(125,212,192,0.14)' },
    students: { label: 'Roster lane', color: Theme.colors.sanctuarySaffron, tint: 'rgba(246,191,140,0.14)' },
    assignments: { label: 'Work queue', color: Theme.colors.sanctuarySaffron, tint: 'rgba(246,191,140,0.14)' },
    lessons: { label: 'Learning arc', color: Theme.colors.gurudeviViolet, tint: 'rgba(184,169,224,0.14)' },
    resources: { label: 'Library lane', color: Theme.colors.gurudeviBlue, tint: 'rgba(125,212,192,0.14)' },
    notes: { label: 'Teacher notes', color: Theme.colors.gurudeviViolet, tint: 'rgba(184,169,224,0.14)' },
    attendance: { label: 'Daily rhythm', color: Theme.colors.gurudeviBlue, tint: 'rgba(125,212,192,0.14)' },
    inventory: { label: 'Support needs', color: Theme.colors.sageGreen, tint: 'rgba(139,191,122,0.14)' },
    echo: { label: 'Student voice', color: Theme.colors.gurudeviViolet, tint: 'rgba(184,169,224,0.14)' },
    observations: { label: 'Growth signals', color: Theme.colors.sageGreen, tint: 'rgba(139,191,122,0.14)' },
    analysis: { label: 'Deep read', color: Theme.colors.amberGlow, tint: 'rgba(255,184,77,0.16)' },
};

export default function TeacherClassroomDashboard({ route, navigation }: Props) {
    const { classroomId, classroomName } = route.params;
    const { can, context } = usePermissions();
    const [activeFeature, setActiveFeature] = useState<FeatureId>('insights');
    const [showGroupsModal, setShowGroupsModal] = useState(false);
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();
    const activeTone = FEATURE_TONES[activeFeature];

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
    const workspace = useTeacherClassroomWorkspaceData(classroomId);
    const classroom = workspace.classroom as Classroom | null;
    const students = workspace.students as any[];

    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formType, setFormType] = useState<'pdf' | 'link' | 'note'>('note');
    const [formUrl, setFormUrl] = useState('');
    const [formDueDate, setFormDueDate] = useState('');

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
            await workspace.refreshWorkspace();
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
            await workspace.refreshWorkspace();
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
                return <ClassroomNotes classroomId={classroomId} isTeacher={can('manage', 'Classroom')} />;
            case 'students':
                return (
                    <VStack className="flex-1">
                        <Box className="px-md pt-md">
                            <Box
                                className="p-md border rounded-comfortable"
                                style={{
                                    backgroundColor: colors.secondary,
                                    borderColor: colors.border,
                                }}
                            >
                                <HStack className="items-center justify-between gap-md">
                                    <VStack className="flex-1">
                                        <Heading className="text-md" style={{ color: colors.text }}>
                                            Classroom roster
                                        </Heading>
                                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                            Student management, direct edits, removals, and group composition now sit together.
                                        </Text>
                                    </VStack>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        action="secondary"
                                        onPress={() => setShowGroupsModal(true)}
                                        className="border rounded-full"
                                        style={{ borderColor: colors.border }}
                                    >
                                        <HStack className="items-center gap-1.5">
                                            <Layers3 size={16} color={colors.text} />
                                            <ButtonText color={colors.text}>Groups</ButtonText>
                                        </HStack>
                                    </Button>
                                </HStack>
                            </Box>
                        </Box>
                        <StudentList
                            classroomId={classroomId}
                            students={students}
                            onRefresh={workspace.refreshStudents}
                            onAnalyzePotential={(student) => {
                                setAnalysisStudent(student);
                                setShowAnalysisModal(true);
                            }}
                        />
                    </VStack>
                );
            case 'assignments':
                return <TeacherAssignmentsWorkspace classroomId={classroomId} canManage={can('create', 'Assignment')} />;
            case 'attendance':
                return <AttendanceView classroomId={classroomId} />;
            case 'lessons':
                return (
                    <LessonFeed
                        classroomId={classroomId}
                        isTeacher={can('update', 'Lesson') || can('manage', 'Classroom')}
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
                return <InventoryView classroomId={classroomId} />;
            case 'resources':
                return <ResourcesView classroomId={classroomId} isTeacher={can('update', 'ClassroomResource') || can('manage', 'Classroom')} />;
            case 'echo':
                return <ClassroomEchoSection classroomId={classroomId} isTeacher={can('read', 'TeacherPulse')} />;
            case 'observations':
                return (
                    <TeacherObservationsWorkspace
                        classroomId={classroomId}
                        userId={context.userId || undefined}
                        students={students}
                        canManage={can('manage', 'Classroom') || can('create', 'Assignment')}
                    />
                );
            case 'analysis':
                return <TeacherAnalysisWorkspace classroomId={classroomId} students={students} />;
            default:
                return null;
        }
    };

    if (workspace.isLoading) {
        return (
            <ScreenWrapper>
                <GlobalHeader title={classroomName} showBack onBack={() => navigation.goBack()} />
                <VStack className="gap-md p-4">
                    <SkeletonCard height={100} />
                    <HStack className="gap-md mt-4">
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
            <ScrollView stickyHeaderIndices={[2]} contentContainerStyle={{ paddingBottom: bottomPadding }} className="bg-vellum">
                <Box className="p-md bg-vellum">
                    <Box
                        className="bg-silk rounded-generous border p-lg shadow-md"
                        style={{
                            borderColor: Theme.colors.linen,
                            // Use native shadow for depth since tailwind shadow might be subtle
                            shadowColor: Theme.colors.shadowAmbient,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 1,
                            shadowRadius: 18,
                            elevation: 4,
                        }}
                    >
                        <VStack className="gap-md">
                            <HStack className="justify-between items-start gap-md">
                                <VStack className="flex-1 gap-1">
                                    <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
                                        Teacher Classroom
                                    </Text>
                                    <Heading className="text-2xl text-inkTruth">
                                        {classroomName}
                                    </Heading>
                                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                        Hold the classroom as one living workspace: roster, rhythm, assignments, notes, and insight in one sanctuary.
                                    </Text>
                                </VStack>
                                {activeFeature === 'lessons' && (
                                    <Button
                                        size="sm"
                                        action="primary"
                                        onPress={() => setShowAddMonthModal(true)}
                                        className="bg-sanctuarySaffron rounded-full px-md"
                                    >
                                        <HStack alignItems="center" className="gap-1">
                                            <Plus size={16} color={Theme.colors.sacredWhite} />
                                            <ButtonText color={Theme.colors.sacredWhite}>New Module</ButtonText>
                                        </HStack>
                                    </Button>
                                )}
                            </HStack>
                            <HStack className="gap-sm">
                                <Box className="flex-1 rounded-comfortable border p-sm" style={{ backgroundColor: colors.primary, borderColor: colors.border }}>
                                    <Text className="text-xs uppercase font-bold" style={{ color: colors.textTertiary }}>Subject</Text>
                                    <Text className="font-bold" style={{ color: colors.text }}>{classroom?.subject || 'Classroom'}</Text>
                                </Box>
                                <Box className="flex-1 rounded-comfortable border p-sm" style={{ backgroundColor: activeTone.tint, borderColor: colors.border }}>
                                    <Text className="text-xs uppercase font-bold" style={{ color: colors.textTertiary }}>Current Lane</Text>
                                    <Text className="font-bold" style={{ color: activeTone.color }}>{activeTone.label}</Text>
                                </Box>
                                <Box className="flex-1 rounded-comfortable border p-sm" style={{ backgroundColor: colors.primary, borderColor: colors.border }}>
                                    <Text className="text-xs uppercase font-bold" style={{ color: colors.textTertiary }}>Signals</Text>
                                    <Text className="font-bold" style={{ color: colors.text }}>
                                        {workspace.summary.assignmentCount} tasks · {workspace.summary.observationCount} notes
                                    </Text>
                                </Box>
                            </HStack>
                        </VStack>
                    </Box>
                </Box>
                <Box className="px-md pb-md bg-vellum">
                    <Box
                        className="rounded-generous border p-md"
                        style={{
                            backgroundColor: 'rgba(250,247,237,0.94)',
                            borderColor: Theme.colors.linen,
                        }}
                    >
                        <HStack className="items-center justify-between gap-md">
                            <VStack className="flex-1">
                                <Text className="text-xs uppercase font-bold" style={{ color: colors.textTertiary }}>
                                    Student Pulse
                                </Text>
                                <Text style={{ color: colors.textSecondary }}>
                                    Move between roster and attendance report to follow classroom rhythm without leaving this workspace.
                                </Text>
                                {!!workspace.workspaceError && (
                                    <Text className="text-xs mt-xs" style={{ color: colors.error }}>
                                        {workspace.workspaceError.message}
                                    </Text>
                                )}
                            </VStack>
                            <HStack className="gap-sm">
                                <Button size="sm" variant="outline" action="secondary" onPress={() => setActiveFeature('students')}>
                                    <ButtonText color={colors.text}>Roster</ButtonText>
                                </Button>
                                <Button size="sm" action="primary" onPress={() => setActiveView('attendance_report')} className="bg-sanctuarySaffron">
                                    <ButtonText color={Theme.colors.sacredWhite}>Report</ButtonText>
                                </Button>
                            </HStack>
                        </HStack>
                    </Box>
                </Box>
                <Box 
                    className="pb-md pt-sm border-t border-b"
                    style={{ 
                        backgroundColor: 'rgba(245,237,214,0.96)',
                        borderTopColor: Theme.colors.linen, 
                        borderBottomColor: Theme.colors.linen 
                    }}
                >
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                        <HStack className="gap-3">
                            {TEACHER_FEATURES.map((f) => {
                                const Icon = f.icon;
                                const isActive = activeFeature === f.id;
                                const tone = FEATURE_TONES[f.id];
                                return (
                                    <Pressable key={f.id} onPress={() => { hapticLight(); setActiveFeature(f.id); }}>
                                        <VStack 
                                            className="items-center justify-center px-md py-sm rounded-full border min-w-[90px] gap-xs"
                                            style={{
                                                borderColor: isActive ? tone.color : Theme.colors.linen,
                                                backgroundColor: isActive ? tone.color : Theme.colors.silk,
                                                shadowColor: isActive ? Theme.colors.shadowAmbient : 'transparent',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: isActive ? 1 : 0,
                                                shadowRadius: 10,
                                            }}
                                        >
                                            <Icon size={18} color={isActive ? Theme.colors.sacredWhite : tone.color} />
                                            <Text 
                                                className="text-xs"
                                                style={{
                                                    fontWeight: isActive ? '700' : '400',
                                                    color: isActive ? Theme.colors.sacredWhite : colors.text
                                                }}
                                            >{f.label}</Text>
                                        </VStack>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </ScrollView>
                </Box>
                <Box className="flex-1 bg-vellum">
                    {renderFeatureContent()}
                </Box>
            </ScrollView>
            {/* Modals */}
            <Modal isOpen={showAddMonthModal} onClose={() => setShowAddMonthModal(false)}>
                <ModalBackdrop />
                <ModalContent style={{ backgroundColor: colors.secondary }}>
                    <ModalHeader><Heading style={{ color: colors.text }} className="text-lg">Add Monthly Module</Heading></ModalHeader>
                    <ModalBody className="pb-lg">
                        <VStack className="gap-4">
                            <Text style={{ color: colors.textSecondary }} className="text-sm">Give this month a title (e.g., "September 2026")</Text>
                            <Input className="bg-transparent" style={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                <InputField placeholder="Enter title..." value={newMonthTitle} onChangeText={setNewMonthTitle} style={{ color: colors.text }} />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack className="gap-2">
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
                <ModalContent className="max-w-[500px]" style={{ backgroundColor: colors.secondary }}>
                    <ModalHeader>
                        <Heading style={{ color: colors.text }} className="text-lg">
                            {contentType === 'material' ? 'Add Academic Material' : 'Create Assignment'}
                        </Heading>
                    </ModalHeader>
                    <ModalBody className="pb-lg">
                        <VStack className="gap-4">
                            {contentType === 'material' && (
                                <HStack className="gap-2">
                                    {(['note', 'link', 'pdf'] as const).map((type) => (
                                        <Pressable key={type} onPress={() => setFormType(type)} className="flex-1">
                                            <Box 
                                                className="p-sm rounded-tight items-center"
                                                style={{
                                                    backgroundColor: formType === type ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                                }}
                                            >
                                                <Text style={{ color: formType === type ? Theme.colors.sacredWhite : colors.textSecondary }} className="text-xs font-bold">{type.toUpperCase()}</Text>
                                            </Box>
                                        </Pressable>
                                    ))}
                                </HStack>
                            )}
                            <Input className="bg-transparent" style={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                <InputField placeholder="Title" value={formTitle} onChangeText={setFormTitle} style={{ color: colors.text }} />
                            </Input>
                            {(contentType === 'assignment' || formType === 'note') && (
                                <Input className="bg-transparent min-h-[80px]" style={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                    <InputField placeholder="Description" value={formDescription} onChangeText={setFormDescription} style={{ color: colors.text }} multiline />
                                </Input>
                            )}
                            {contentType === 'material' && (formType === 'pdf' || formType === 'link') && (
                                <Input className="bg-transparent" style={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                    <InputField placeholder="URL" value={formUrl} onChangeText={setFormUrl} style={{ color: colors.text }} autoCapitalize="none" />
                                </Input>
                            )}
                            {contentType === 'assignment' && (
                                <Input className="bg-transparent" style={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                    <InputField placeholder="Due Date (YYYY-MM-DD)" value={formDueDate} onChangeText={setFormDueDate} style={{ color: colors.text }} />
                                </Input>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack className="gap-2">
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

            <TeacherGroupsModal
                classroomId={classroomId}
                isOpen={showGroupsModal}
                onClose={() => setShowGroupsModal(false)}
                students={students}
            />
        </ScreenWrapper>
    );
}
