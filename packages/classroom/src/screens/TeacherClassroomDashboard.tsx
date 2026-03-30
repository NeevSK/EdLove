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
    useRegisterFAB
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
                    <VStack sx={{ flex: 1 }}                        <Box sx={{ paddingHorizontal: Theme.spacing.md, paddingTop: Theme.spacing.md }}                            <Box
                                sx={{
                                    backgroundColor: colors.secondary,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderRadius: Theme.corners.comfortable,
                                    padding: Theme.spacing.md,>
                                }}
                                                            <HStack sx={{ alignItems: 'center', justifyContent: 'space-between', gap: Theme.spacing.md }}                                    <VStack sx={{ flex: 1 }}                                        <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md }}                                            Classroom roster
                                        </Heading                                        <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}                                            Student management, direct edits, removals, and group composition now sit together.>
                                        </Text                                    </VStack                                    <Button
                                        size="sm"
                                        variant="outline"
                                        action="secondary"
                                        onPress={() => setShowGroupsModal(true)}
                                        sx={{ borderColor: colors.border, borderRadius: Theme.corners.full }}
                                                                            <HStack sx={{ alignItems: 'center', gap: 6 }}                                            <Layers3 size={16} color={colors.text} /                                            ><ButtonText color={colors.text}>Groups</ButtonText                                        ></HStack                                    </Button                                </HStack                            </Box                        </Box                        <StudentList
                            classroomId={classroomId}
                            students={students}
                            onRefresh={workspace.refreshStudents}
                            onAnalyzePotential={(student) => {
                                setAnalysisStudent(student);
                                setShowAnalysisModal(true);
                            }}
                        /                    </VStack                );
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
                    /                >);
            case 'inventory':
                return <InventoryView classroomId={classroomId} /            >case 'resources':
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
                        /                >);
            case 'analysis':
                return <TeacherAnalysisWorkspace classroomId={classroomId} students={students} />;
            default:
                return null;
        }
    };

    if (workspace.isLoading) {
        return (
            <ScreenWrapper                <GlobalHeader >title={classroomName} showBack onBack={() => navigation.goBack()} /                ><VStack sx={{ gap: '$md' as any, padding: '$4' as any }}                    <SkeletonCard height={100} /                    ><HStack sx={{ gap: '$md' as any, marginTop: '$4' as any }}                        <SkeletonCard width={90} height={70} /                        ><SkeletonCard width={90} height={70} /                        ><SkeletonCard width={90} height={70} /                    ></HStack                </VStack            </ScreenWrapper        );
    }

    const schoolId = classroom?.school_id || '';

    if (activeView === 'attendance_report') {
        return (
            <AttendanceReportScreen
                schoolId={schoolId}
                classroomId={classroomId}
                onBack={() => setActiveView('main')}
            /        >);
    }

    return (
        <ScreenWrapper scroll={false}            <GlobalHeader
                title={classroomName}
                subtitle={classroom?.subject || 'Classroom'}
                showBack
                onBack={() => navigation.goBack()}
            /
            ><ScrollView stickyHeaderIndices={[2]} contentContainerStyle={{ paddingBottom: bottomPadding, backgroundColor: Theme.colors.vellum }}                <Box sx={{ padding: Theme.spacing.md, backgroundColor: Theme.colors.vellum }}                    <Box
                        sx={{
                            backgroundColor: Theme.colors.silk,
                            borderRadius: Theme.corners.generous,
                            borderWidth: 1,
                            borderColor: Theme.colors.linen,
                            padding: Theme.spacing.lg,
                            shadowColor: Theme.colors.shadowAmbient,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 1,
                            shadowRadius: 18,
                            elevation: 4,
                        }}
                                            <VStack sx={{ gap: Theme.spacing.md }}                            <HStack sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: Theme.spacing.md }}                                <VStack sx={{ flex: 1, gap: 4 }}                                    <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: colors.textTertiary, fontWeight: '700' as any, textTransform: 'uppercase', letterSpacing: 1 }}                                        Teacher Classroom
                                    </Text                                    <Heading sx={{ fontSize: Theme.typography.fontSize['2xl'], color: Theme.colors.inkTruth }}                                        {classroomName}>
                                    </Heading                                    ><Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}                                        Hold the classroom as one living workspace: roster, rhythm, assignments, notes, and insight in one sanctuary.
                                    </Text                                </VStack                                {activeFeature === 'lessons' && (
                                    <Button
                                        size="sm"
                                        action="primary"
                                        onPress={() => setShowAddMonthModal(true)}
                                        sx={{
                                            backgroundColor: Theme.colors.sanctuarySaffron,
                                            borderRadius: Theme.corners.full,
                                            paddingHorizontal: Theme.spacing.md,
                                        }}
                                                                            <HStack alignItems="center" sx={{ gap: 4 }}                                            <Plus size={16} color={Theme.colors.sacredWhite} /                                            ><ButtonText color={Theme.colors.sacredWhite}>New Module</ButtonText                                        ></HStack                                    </Button                                )}
                            </HStack>
                            <HStack sx={{ gap: Theme.spacing.sm }}                                <Box sx={{ flex: 1, backgroundColor: colors.primary, borderRadius: Theme.corners.comfortable, borderWidth: 1, borderColor: colors.border, padding: Theme.spacing.sm }}                                    <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs, textTransform: 'uppercase', fontWeight: '700' as const }}>Subject</Text                                    ><Text sx={{ color: colors.text, fontWeight: '700' as const }}>{classroom?.subject || 'Classroom'}</Text                                ></Box                                ><Box sx={{ flex: 1, backgroundColor: activeTone.tint, borderRadius: Theme.corners.comfortable, borderWidth: 1, borderColor: colors.border, padding: Theme.spacing.sm }}                                    <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs, textTransform: 'uppercase', fontWeight: '700' as const }}>Current Lane</Text                                    ><Text sx={{ color: activeTone.color, fontWeight: '700' as const }}>{activeTone.label}</Text                                ></Box                                <Box sx={{ flex: 1, backgroundColor: colors.primary, borderRadius: Theme.corners.comfortable, borderWidth: 1, borderColor: colors.border, padding: Theme.spacing.sm }}                                    <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs, textTransform: 'uppercase', fontWeight: '700' as const }}>Signals</Text                                    ><Text sx={{ color: colors.text, fontWeight: '700' as const }}                                        {workspace.summary.assignmentCount} tasks \u00B7 {workspace.summary.observationCount} notes
                                    </Text                                </Box                            </HStack                        </VStack                    </Box                </Box
                <Box sx={{ paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.md, backgroundColor: Theme.colors.vellum }}                    <Box
                        sx={{
                            backgroundColor: 'rgba(250,247,237,0.94)',
                            borderRadius: Theme.corners.generous,
                            borderWidth: 1,
                            borderColor: Theme.colors.linen,
                            padding: Theme.spacing.md,>
                        }}
                                            <HStack sx={{ alignItems: 'center', justifyContent: 'space-between', gap: Theme.spacing.md }}                            <VStack sx={{ flex: 1 }}                                <Text sx={{ color: colors.textTertiary, fontSize: Theme.typography.fontSize.xs, textTransform: 'uppercase', fontWeight: '700' as const }}                                    Student Pulse
                                </Text                                <Text sx={{ color: colors.textSecondary }}                                    Move between roster and attendance report to follow classroom rhythm without leaving this workspace.>
                                </Text                                >{!!workspace.workspaceError && (
                                    <Text sx={{ color: colors.error, fontSize: Theme.typography.fontSize.xs, marginTop: Theme.spacing.xs }}                                        {workspace.workspaceError.message}
                                    </Text                                )}>
                            </VStack                            <HStack sx={{ gap: Theme.spacing.sm }}                                <Button size="sm" variant="outline" action="secondary" onPress={() => setActiveFeature('students')}                                    <ButtonText color={colors.text}>Roster</ButtonText                                ></Button                                <Button size="sm" action="primary" onPress={() => setActiveView('attendance_report')} sx={{ backgroundColor: Theme.colors.sanctuarySaffron }}                                    <ButtonText color={Theme.colors.sacredWhite}>Report</ButtonText                                ></Button                            </HStack                        </HStack                    </Box                </Box
                <Box sx={{ backgroundColor: 'rgba(245,237,214,0.96)', paddingBottom: Theme.spacing.md, paddingTop: Theme.spacing.sm, borderTopWidth: 1, borderTopColor: Theme.colors.linen, borderBottomWidth: 1, borderBottomColor: Theme.colors.linen }}                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}                        <HStack sx={{ gap: 12 }}                            {TEACHER_FEATURES.map((f) => {
                                const Icon = f.icon;
                                const isActive = activeFeature === f.id;
                                const tone = FEATURE_TONES[f.id];
                                return (
                                    <Pressable key={f.id} onPress={() => { hapticLight(); setActiveFeature(f.id); }}                                        <VStack sx={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingHorizontal: Theme.spacing.md,
                                            paddingVertical: Theme.spacing.sm,
                                            borderRadius: Theme.corners.full,
                                            borderWidth: 1,
                                            borderColor: isActive ? tone.color : Theme.colors.linen,
                                            backgroundColor: isActive ? tone.color : Theme.colors.silk,
                                            minWidth: 90,
                                            gap: Theme.spacing.xs,
                                            shadowColor: isActive ? Theme.colors.shadowAmbient : 'transparent',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: isActive ? 1 : 0,
                                            shadowRadius: 10,
                                        }}                                            <Icon size={18} color={isActive ? Theme.colors.sacredWhite : tone.color} /                                            ><Text sx={{
                                                fontSize: Theme.typography.fontSize.xs,
                                                fontWeight: (isActive ? '700' : '400') as any,
                                                color: isActive ? Theme.colors.sacredWhite : colors.text
                                            }}>{f.label}</Text                                        ></VStack                                    </Pressable                                );
                            })}
                        </HStack                    </ScrollView                </Box
                <Box flex={1} sx={{ backgroundColor: Theme.colors.vellum }}                    {renderFeatureContent()}
                </Box            </ScrollView>
            {/* Modals */}
            <Modal isOpen={showAddMonthModal} onClose={() => setShowAddMonthModal(false)}                <ModalBackdrop /                ><ModalContent sx={{ backgroundColor: colors.secondary }}                    <ModalHeader><Heading color={colors.text} sx={{ fontSize: 18 }}>Add Monthly Module</Heading></ModalHeader                    ><ModalBody sx={{ paddingBottom: Theme.spacing.lg }}                        <VStack sx={{ gap: 16 }}                            <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>Give this month a title (e.g., "September 2026")</Text                            ><Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}                                <InputField placeholder="Enter title..." value={newMonthTitle} onChangeText={setNewMonthTitle} color={colors.text} /                            ></Input                        ></VStack                    </ModalBody                    <ModalFooter                        <HStack sx={{ gap: 8 }}                            <Button variant="outline" action="secondary" onPress={() => setShowAddMonthModal(false)}><ButtonText color={colors.textTertiary}>Cancel</ButtonText></Button                            ><Button action="primary" onPress={handleAddMonth} isDisabled={!newMonthTitle.trim() || isSubmitting}                                {isSubmitting ? <Spinner color={Theme.colors.sacredWhite} /> : <ButtonText color={Theme.colors.sacredWhite}>Create</ButtonText>}
                            </Button                        </HStack                    </ModalFooter                </ModalContent            </Modal
            <Modal isOpen={showAddContentModal} onClose={() => { setShowAddContentModal(false); resetForm(); }}                <ModalBackdrop /                ><ModalContent sx={{ backgroundColor: colors.secondary, maxWidth: 500 }}                    <ModalHeader                        <Heading >color={colors.text} sx={{ fontSize: 18 }}                            {contentType === 'material' ? 'Add Academic Material' : 'Create Assignment'}
                        </Heading                    </ModalHeader                    <ModalBody sx={{ paddingBottom: Theme.spacing.lg }}                        <VStack sx={{ gap: 16 }}                            {contentType === 'material' && (
                                <HStack sx={{ gap: 8 }}                                    {(['note', 'link', 'pdf'] as const).map((type) => (
                                        <Pressable key={type} onPress={() => setFormType(type)} style={{ flex: 1 }}                                            <Box sx={{
                                                padding: Theme.spacing.sm,
                                                borderRadius: Theme.corners.tight,
                                                backgroundColor: formType === type ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                                alignItems: 'center'
                                            }}                                                <Text color={formType === type ? Theme.colors.sacredWhite : colors.textSecondary} sx={{ fontSize: 12, fontWeight: 'bold' }}>{type.toUpperCase()}</Text                                            ></Box                                        </Pressable                                    ))}
                                </HStack                            )}
                            <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}                                <InputField placeholder="Title" value={formTitle} onChangeText={setFormTitle} color={colors.text} /                            ></Input                            {(contentType === 'assignment' || formType === 'note') && (
                                <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent', minHeight: 80 }}                                    <InputField placeholder="Description" value={formDescription} onChangeText={setFormDescription} color={colors.text} multiline /                                ></Input                            )}
                            {contentType === 'material' && (formType === 'pdf' || formType === 'link') && (
                                <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}                                    <InputField placeholder="URL" value={formUrl} onChangeText={setFormUrl} color={colors.text} autoCapitalize="none" /                                ></Input                            )}
                            {contentType === 'assignment' && (
                                <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}                                    <InputField placeholder="Due Date (YYYY-MM-DD)" value={formDueDate} onChangeText={setFormDueDate} color={colors.text} /                                ></Input                            )}
                        </VStack                    </ModalBody                    <ModalFooter                        <HStack >sx={{ gap: 8 }}                            <Button variant="outline" action="secondary" onPress={() => { setShowAddContentModal(false); resetForm(); }}><ButtonText color={colors.textTertiary}>Cancel</ButtonText></Button                            ><Button action="primary" onPress={handleAddContent} isDisabled={!formTitle.trim() || isSubmitting}                                {isSubmitting ? <Spinner color={Theme.colors.sacredWhite} /> : <ButtonText color={Theme.colors.sacredWhite}>Add</ButtonText>}
                            </Button                        </HStack                    </ModalFooter                </ModalContent            </Modal
            {showAnalysisModal && analysisStudent && (
                <StudentAnalysisModal
                    visible={showAnalysisModal}
                    onClose={() => { setShowAnalysisModal(false); setAnalysisStudent(null); }}
                    studentId={analysisStudent.id}
                    studentName={analysisStudent.full_name}
                    classroomId={classroomId}
                /            >)}

            <TeacherGroupsModal
                classroomId={classroomId}
                isOpen={showGroupsModal}
                onClose={() => setShowGroupsModal(false)}
                students={students}
            /        ></ScreenWrapper    );
}
