import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
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
    ScreenWrapper,
    ScrollView,
    SkeletonCard,
    Text,
    Theme,
    VStack,
    useThemedColors,
} from '@repo/ui';
import { api, usePermissions } from '@repo/core';
import {
    ArrowLeft,
    BookOpen,
    ClipboardCheck,
    ClipboardList,
    FileText,
    GraduationCap,
    LayoutGrid,
    Layers3,
    MessageSquare,
    NotebookPen,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react-native';
import { StudentList, AttendanceView, InventoryView, ResourcesView, ClassroomHolisticInsights, ClassroomEchoSection } from '../components';
import ClassroomNotes from '../components/ClassroomNotes';
import LessonFeed from './LessonFeed';
import TeacherAssignmentsWorkspace from '../components/teacher/TeacherAssignmentsWorkspace';
import TeacherObservationsWorkspace from '../components/teacher/TeacherObservationsWorkspace';
import TeacherAnalysisWorkspace from '../components/teacher/TeacherAnalysisWorkspace';
import TeacherGroupsModal from '../components/teacher/TeacherGroupsModal';
import { useTeacherClassroomWorkspaceData } from '../workspace/useTeacherClassroomWorkspaceData';

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

const FEATURES: { id: FeatureId; label: string; icon: any }[] = [
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

export default function TeacherClassroomDashboardWeb() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { classroomId, classroomName } = route.params ?? {};
    const colors = useThemedColors();
    const { can, context } = usePermissions();

    const workspace = useTeacherClassroomWorkspaceData(classroomId);
    const classroom = workspace.classroom;
    const students = workspace.students;

    const [activeFeature, setActiveFeature] = useState<FeatureId>('insights');
    const activeTone = FEATURE_TONES[activeFeature];
    const [showGroupsModal, setShowGroupsModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showAddMonthModal, setShowAddMonthModal] = useState(false);
    const [newMonthTitle, setNewMonthTitle] = useState('');
    const [showAddContentModal, setShowAddContentModal] = useState(false);
    const [contentType, setContentType] = useState<'material' | 'assignment'>('material');
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formType, setFormType] = useState<'pdf' | 'link' | 'note'>('note');
    const [formUrl, setFormUrl] = useState('');
    const [formDueDate, setFormDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setFormTitle('');
        setFormDescription('');
        setFormType('note');
        setFormUrl('');
        setFormDueDate('');
        setActiveLessonId(null);
    };

    const handleAddMonth = async () => {
        if (!newMonthTitle.trim()) return;
        setIsSubmitting(true);
        try {
            const lessons = await api.lessons.getAll(classroomId);
            const maxOrder = lessons.reduce((max: number, lesson: any) => Math.max(max, lesson.order_index), 0);
            await api.lessons.create({
                classroom_id: classroomId,
                title: newMonthTitle.trim(),
                order_index: maxOrder + 1,
            });
            setNewMonthTitle('');
            setShowAddMonthModal(false);
            setRefreshTrigger((prev) => prev + 1);
            await workspace.refreshWorkspace();
        } catch (error) {
            console.error('Failed to add month', error);
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
                const lesson = await api.lessons.create({
                    classroom_id: classroomId,
                    title: targetLessonId,
                    content: `Materials for ${targetLessonId}`,
                    order_index: 0,
                });
                targetLessonId = lesson.id;
            }

            if (contentType === 'material') {
                await api.lessonMaterials.create({
                    classroom_id: classroomId,
                    lesson_id: targetLessonId,
                    title: formTitle,
                    type: formType,
                    url: formType === 'pdf' || formType === 'link' ? formUrl : undefined,
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
            setRefreshTrigger((prev) => prev + 1);
            await workspace.refreshWorkspace();
        } catch (error) {
            console.error('Failed to add lesson content', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFeatureContent = () => {
        switch (activeFeature) {
            case 'insights':
                return <ClassroomHolisticInsights classroomId={classroomId} />;
            case 'students':
                return (
                    <VStack className="flex-1">
                        <Box className="px-md pt-md">
                            <Box
                                className="rounded-comfortable border p-md"
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
                                            The registry stays central, while group management now lives beside direct student actions.
                                        </Text>
                                    </VStack>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        action="secondary"
                                        onPress={() => setShowGroupsModal(true)}
                                        className="rounded-full"
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
                        />
                    </VStack>
                );
            case 'assignments':
                return <TeacherAssignmentsWorkspace classroomId={classroomId} canManage={can('create', 'Assignment')} />;
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
            case 'resources':
                return <ResourcesView classroomId={classroomId} isTeacher={can('update', 'ClassroomResource') || can('manage', 'Classroom')} />;
            case 'notes':
                return <ClassroomNotes classroomId={classroomId} isTeacher={can('manage', 'Classroom')} />;
            case 'attendance':
                return <AttendanceView classroomId={classroomId} />;
            case 'inventory':
                return <InventoryView classroomId={classroomId} />;
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
                <VStack className="gap-md p-lg">
                    <SkeletonCard height={140} />
                    <HStack className="gap-md">
                        <SkeletonCard height={96} />
                        <SkeletonCard height={96} />
                    </HStack>
                    <SkeletonCard height={320} />
                </VStack>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scroll={false}>
            <ScrollView>
                <VStack className="gap-md p-lg pb-xl" style={{ backgroundColor: Theme.colors.vellum }}>
                    <Box
                        className="rounded-generous border p-xl"
                        style={{
                            backgroundColor: Theme.colors.silk,
                            borderColor: Theme.colors.linen,
                            shadowColor: Theme.colors.shadowAmbient,
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 1,
                            shadowRadius: 20,
                        }}
                    >
                        <VStack className="gap-lg">
                            <HStack className="items-center justify-between gap-md">
                                <Pressable onPress={() => navigation.goBack()}>
                                    <HStack
                                        className="items-center gap-xs px-md py-sm rounded-full border"
                                        style={{
                                            backgroundColor: colors.primary,
                                            borderColor: colors.border,
                                        }}
                                    >
                                        <ArrowLeft size={16} color={colors.text} />
                                        <Text className="font-semibold" style={{ color: colors.text }}>Back</Text>
                                    </HStack>
                                </Pressable>
                                <HStack className="gap-sm items-center">
                                    {activeFeature === 'lessons' && (
                                        <Button
                                            size="sm"
                                            action="primary"
                                            onPress={() => setShowAddMonthModal(true)}
                                            className="rounded-full"
                                            style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                                        >
                                            <ButtonText color={Theme.colors.sacredWhite}>New Module</ButtonText>
                                        </Button>
                                    )}
                                    <StatPill label="Students" value={String(students.length)} colors={colors} />
                                    <StatPill label="Subject" value={classroom?.subject || 'Classroom'} colors={colors} />
                                    <StatPill label="Current lane" value={activeTone.label} colors={colors} highlightColor={activeTone.color} highlightTint={activeTone.tint} />
                                    <StatPill label="Signals" value={`${workspace.summary.assignmentCount}/${workspace.summary.observationCount}`} colors={colors} />
                                </HStack>
                            </HStack>
                            <VStack className="gap-sm">
                                <Text className="text-[11px] font-bold uppercase tracking-[1px]" style={{ color: colors.textTertiary }}>
                                    Teacher Classroom
                                </Text>
                                <Heading className="text-2xl" style={{ color: colors.text }}>
                                    {classroomName || classroom?.name || 'Classroom'}
                                </Heading>
                                <Text className="text-sm max-w-[760px]" style={{ color: colors.textSecondary }}>
                                    The web surface now follows the same canonical teacher classroom inventory as native, while keeping a wider command-lane rhythm.
                                </Text>
                                {!!workspace.workspaceError && (
                                    <Text className="text-xs" style={{ color: colors.error }}>
                                        {workspace.workspaceError.message}
                                    </Text>
                                )}
                            </VStack>
                        </VStack>
                    </Box>
                    <HStack className="items-start gap-md">
                        <Box
                            className="flex-1 rounded-generous border overflow-hidden"
                            style={{
                                backgroundColor: Theme.colors.silk,
                                borderColor: Theme.colors.linen,
                                shadowColor: Theme.colors.shadowAmbient,
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 1,
                                shadowRadius: 18,
                            }}
                        >
                            <Box className="p-md border-b" style={{ borderBottomColor: colors.border }}>
                                <HStack className="items-center justify-between gap-md">
                                    <VStack className="flex-1">
                                        <Text className="text-xs uppercase font-bold" style={{ color: colors.textTertiary }}>
                                            Student Pulse
                                        </Text>
                                        <Text style={{ color: colors.textSecondary }}>
                                            Keep the roster, attendance, and deeper analysis in one teacher command lane.
                                        </Text>
                                    </VStack>
                                    <HStack className="gap-sm">
                                        <Button size="sm" variant="outline" action="secondary" onPress={() => setActiveFeature('students')}>
                                            <ButtonText color={colors.text}>Roster</ButtonText>
                                        </Button>
                                        <Button size="sm" action="primary" onPress={() => setActiveFeature('attendance')} style={{ backgroundColor: Theme.colors.sanctuarySaffron }}>
                                            <ButtonText color={Theme.colors.sacredWhite}>Attendance</ButtonText>
                                        </Button>
                                    </HStack>
                                </HStack>
                            </Box>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <HStack className="gap-sm px-md py-md">
                                    {FEATURES.map((feature) => {
                                        const Icon = feature.icon;
                                        const isActive = activeFeature === feature.id;
                                        const tone = FEATURE_TONES[feature.id];
                                        return (
                                            <Pressable key={feature.id} onPress={() => setActiveFeature(feature.id)}>
                                                <Box
                                                    className="px-md py-sm rounded-full border"
                                                    style={{
                                                        borderColor: isActive ? tone.color : Theme.colors.linen,
                                                        backgroundColor: isActive ? tone.color : Theme.colors.silk,
                                                    }}
                                                >
                                                    <HStack className="items-center gap-xs">
                                                        <Icon size={16} color={isActive ? Theme.colors.sacredWhite : tone.color} />
                                                        <Text 
                                                            className="font-medium"
                                                            style={{ 
                                                                color: isActive ? Theme.colors.sacredWhite : colors.text, 
                                                                fontWeight: isActive ? '700' : '500' 
                                                            }}
                                                        >
                                                            {feature.label}
                                                        </Text>
                                                    </HStack>
                                                </Box>
                                            </Pressable>
                                        );
                                    })}
                                </HStack>
                            </ScrollView>
                            <Box className="min-h-[500px]">{renderFeatureContent()}</Box>
                        </Box>
                        <VStack className="w-[280px] gap-md">
                            <Box
                                className="rounded-generous border p-lg"
                                style={{
                                    backgroundColor: Theme.colors.silk,
                                    borderColor: Theme.colors.linen,
                                }}
                            >
                                <VStack className="gap-md">
                                    <VStack className="gap-1">
                                        <Text className="text-xs uppercase font-bold" style={{ color: colors.textTertiary }}>
                                            Classroom Compass
                                        </Text>
                                        <Heading className="text-md" style={{ color: colors.text }}>
                                            {activeTone.label}
                                        </Heading>
                                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                            One dominant workspace lane, with quicker jumps kept nearby instead of competing inside it.
                                        </Text>
                                    </VStack>
                                    <Box
                                        className="rounded-comfortable border p-sm"
                                        style={{
                                            backgroundColor: activeTone.tint,
                                            borderColor: colors.border,
                                        }}
                                    >
                                        <Text className="font-bold" style={{ color: activeTone.color }}>
                                            Active: {activeFeature}
                                        </Text>
                                    </Box>
                                    <VStack className="gap-sm">
                                        {(['students', 'attendance', 'analysis'] as FeatureId[]).map((id) => {
                                            const tone = FEATURE_TONES[id];
                                            const isCurrent = activeFeature === id;
                                            return (
                                                <Pressable key={id} onPress={() => setActiveFeature(id)}>
                                                    <Box
                                                        className="rounded-comfortable border p-sm"
                                                        style={{
                                                            backgroundColor: isCurrent ? tone.tint : colors.primary,
                                                            borderColor: colors.border,
                                                        }}
                                                    >
                                                        <Text className="font-bold" style={{ color: isCurrent ? tone.color : colors.text }}>
                                                            {tone.label}
                                                        </Text>
                                                    </Box>
                                                </Pressable>
                                            );
                                        })}
                                    </VStack>
                                </VStack>
                            </Box>
                            <Box
                                className="rounded-generous border p-lg"
                                style={{
                                    backgroundColor: Theme.colors.silk,
                                    borderColor: Theme.colors.linen,
                                }}
                            >
                                <VStack className="gap-sm">
                                    <Text className="text-xs uppercase font-bold" style={{ color: colors.textTertiary }}>
                                        Classroom Details
                                    </Text>
                                    <RailStat label="Class" value={classroomName || classroom?.name || 'Classroom'} colors={colors} />
                                    <RailStat label="Subject" value={classroom?.subject || 'General'} colors={colors} />
                                    <RailStat label="Students" value={String(students.length)} colors={colors} />
                                </VStack>
                            </Box>
                        </VStack>
                    </HStack>
                </VStack>
            </ScrollView>

            <TeacherGroupsModal
                classroomId={classroomId}
                isOpen={showGroupsModal}
                onClose={() => setShowGroupsModal(false)}
                students={students}
            />

            <Modal isOpen={showAddMonthModal} onClose={() => setShowAddMonthModal(false)}>
                <ModalBackdrop />
                <ModalContent className="border" style={{ backgroundColor: colors.primary, borderColor: colors.border }}>
                    <ModalHeader>
                        <Heading className="text-lg" style={{ color: colors.text }}>
                            Add monthly module
                        </Heading>
                    </ModalHeader>
                    <ModalBody>
                        <Input style={{ backgroundColor: colors.secondary, borderColor: colors.border }}>
                            <InputField placeholder="September 2026" value={newMonthTitle} onChangeText={setNewMonthTitle} style={{ color: colors.text }} />
                        </Input>
                    </ModalBody>
                    <ModalFooter>
                        <HStack className="gap-sm">
                            <Button variant="outline" action="secondary" onPress={() => setShowAddMonthModal(false)}>
                                <ButtonText color={colors.textSecondary}>Cancel</ButtonText>
                            </Button>
                            <Button
                                action="primary"
                                onPress={handleAddMonth}
                                isDisabled={!newMonthTitle.trim() || isSubmitting}
                                style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>Save</ButtonText>
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={showAddContentModal} onClose={() => { setShowAddContentModal(false); resetForm(); }}>
                <ModalBackdrop />
                <ModalContent className="border" style={{ backgroundColor: colors.primary, borderColor: colors.border }}>
                    <ModalHeader>
                        <Heading className="text-lg" style={{ color: colors.text }}>
                            {contentType === 'material' ? 'Add lesson material' : 'Create assignment'}
                        </Heading>
                    </ModalHeader>
                    <ModalBody>
                        <VStack className="gap-md">
                            {contentType === 'material' && (
                                <HStack className="gap-sm">
                                    {(['note', 'link', 'pdf'] as const).map((type) => {
                                        const isActive = formType === type;
                                        return (
                                            <Pressable key={type} onPress={() => setFormType(type)}>
                                                <Box
                                                    className="px-md py-sm rounded-full border"
                                                    style={{
                                                        borderColor: isActive ? Theme.colors.sanctuarySaffron : colors.border,
                                                        backgroundColor: isActive ? Theme.colors.sanctuarySaffron : colors.secondary,
                                                    }}
                                                >
                                                    <Text className="uppercase" style={{ color: isActive ? Theme.colors.sacredWhite : colors.text }}>
                                                        {type}
                                                    </Text>
                                                </Box>
                                            </Pressable>
                                        );
                                    })}
                                </HStack>
                            )}
                            <Input style={{ backgroundColor: colors.secondary, borderColor: colors.border }}>
                                <InputField placeholder="Title" value={formTitle} onChangeText={setFormTitle} style={{ color: colors.text }} />
                            </Input>
                            {(contentType === 'assignment' || formType === 'note') && (
                                <Input className="min-h-[100px]" style={{ backgroundColor: colors.secondary, borderColor: colors.border }}>
                                    <InputField
                                        placeholder="Description"
                                        value={formDescription}
                                        onChangeText={setFormDescription}
                                        style={{ color: colors.text }}
                                        multiline
                                    />
                                </Input>
                            )}
                            {contentType === 'material' && (formType === 'pdf' || formType === 'link') && (
                                <Input style={{ backgroundColor: colors.secondary, borderColor: colors.border }}>
                                    <InputField placeholder="URL" value={formUrl} onChangeText={setFormUrl} style={{ color: colors.text }} />
                                </Input>
                            )}
                            {contentType === 'assignment' && (
                                <Input style={{ backgroundColor: colors.secondary, borderColor: colors.border }}>
                                    <InputField placeholder="Due date (YYYY-MM-DD)" value={formDueDate} onChangeText={setFormDueDate} style={{ color: colors.text }} />
                                </Input>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack className="gap-sm">
                            <Button variant="outline" action="secondary" onPress={() => { setShowAddContentModal(false); resetForm(); }}>
                                <ButtonText color={colors.textSecondary}>Cancel</ButtonText>
                            </Button>
                            <Button
                                action="primary"
                                onPress={handleAddContent}
                                isDisabled={!formTitle.trim() || isSubmitting}
                                style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>Save</ButtonText>
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </ScreenWrapper>
    );
}

function StatPill({
    label,
    value,
    colors,
    highlightColor,
    highlightTint,
}: {
    label: string;
    value: string;
    colors: ReturnType<typeof useThemedColors>;
    highlightColor?: string;
    highlightTint?: string;
}) {
    return (
        <Box
            className="px-md py-sm rounded-full border"
            style={{
                borderColor: colors.border,
                backgroundColor: highlightTint || colors.primary,
            }}
        >
            <Text className="text-[10px] uppercase font-bold" style={{ color: colors.textTertiary }}>
                {label}
            </Text>
            <Text className="font-bold" style={{ color: highlightColor || colors.text }}>{value}</Text>
        </Box>
    );
}

function RailStat({
    label,
    value,
    colors,
}: {
    label: string;
    value: string;
    colors: ReturnType<typeof useThemedColors>;
}) {
    return (
        <Box
            className="rounded-comfortable border p-sm"
            style={{
                backgroundColor: colors.primary,
                borderColor: colors.border,
            }}
        >
            <Text className="text-xs uppercase font-bold" style={{ color: colors.textTertiary }}>
                {label}
            </Text>
            <Text className="font-bold" style={{ color: colors.text }}>{value}</Text>
        </Box>
    );
}
