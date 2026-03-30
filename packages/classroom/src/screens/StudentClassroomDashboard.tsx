import React, { useState } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    ScrollView,
    Pressable,
    Heading,
    Theme,
    useThemedColors,
    hapticLight,
    GlobalHeader,
    ScreenWrapper,
    SkeletonCard,
    useBottomTabPadding
} from '@repo/ui';
import {
    Users,
    BookOpen,
    FileText,
    ClipboardCheck,
    GraduationCap,
    TrendingUp,
    MessageSquare,
    NotebookPen
} from 'lucide-react-native';
import { api, Assignment } from '@repo/core';
import { AttendanceView, ResourcesView, ClassroomHolisticInsights, ClassroomEchoSection, SubmissionModal } from '../components';
import ClassroomNotes from '../components/ClassroomNotes';
import LessonFeed from './LessonFeed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClassroomStackParamList } from '@repo/core';
import { useStudentClassroomWorkspaceData } from '../workspace/useStudentClassroomWorkspaceData';

type Props = NativeStackScreenProps<ClassroomStackParamList, 'StudentClassroomDashboard'>;

type FeatureId = 'insights' | 'notes' | 'attendance' | 'gradebook' | 'lessons' | 'resources' | 'echo';

const STUDENT_FEATURES: { id: FeatureId; label: string; icon: any }[] = [
    { id: 'insights', label: 'My Journey', icon: TrendingUp },
    { id: 'notes', label: 'My Notes', icon: NotebookPen },
    { id: 'lessons', label: 'Study Center', icon: BookOpen },
    { id: 'attendance', label: 'My Attendance', icon: ClipboardCheck },
    { id: 'gradebook', label: 'My Grades', icon: GraduationCap },
    { id: 'resources', label: 'Library', icon: FileText },
    { id: 'echo', label: 'Ask Echo', icon: MessageSquare },
];

export default function StudentClassroomDashboard({ route, navigation }: Props) {
    const { classroomId, classroomName } = route.params;
    const [activeFeature, setActiveFeature] = useState<FeatureId>('insights');
    const [submissionModal, setSubmissionModal] = useState<Assignment | null>(null);
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();
    const workspace = useStudentClassroomWorkspaceData(classroomId);
    const classroom = workspace.classroom;

    const renderFeatureContent = () => {
        switch (activeFeature) {
            case 'insights':
                return <ClassroomHolisticInsights classroomId={classroomId} />;
            case 'notes':
                return <ClassroomNotes classroomId={classroomId} isTeacher={false} />;
            case 'attendance':
                return <AttendanceView classroomId={classroomId} /            >case 'gradebook':
                return <Box sx={{ padding: Theme.spacing.md }}><Text sx={{ color: colors.textTertiary }}>My Grade Performance</Text></Box            >case 'lessons':
                return (
                    <LessonFeed>
                        classroomId={classroomId}
                        isTeacher={false}
                        onOpenLesson={(id: string) => console.log('Open Lesson', id)}
                        onOpenAssignment={(id: string) => console.log('Open Assignment', id)}
                        onOpenAssignmentRecord={(assignment) => setSubmissionModal(assignment)}
                        submittedAssignmentIds={workspace.submittedAssignmentIds}
                    /                >);
            case 'resources':
                return <ResourcesView classroomId={classroomId} isTeacher={false} /            >case 'echo':
                return <ClassroomEchoSection classroomId={classroomId} isTeacher={false} /            >default:
                return null;
        }
    };

    if (workspace.isLoading) {
        return (
            <ScreenWrapper                <GlobalHeader >title={classroomName} showBack onBack={() => navigation.goBack()} /                ><VStack sx={{ gap: '$md' as any, padding: '$4' as any }}                    <SkeletonCard height={100} /                    ><HStack sx={{ gap: '$md' as any, marginTop: '$4' as any }}                        <SkeletonCard width={90} height={70} /                        ><SkeletonCard width={90} height={70} /                        ><SkeletonCard width={90} height={70} /                    ></HStack                </VStack            </ScreenWrapper        );
    }

    const summaryCards = [
        { label: 'Lessons', value: workspace.lessons.length },
        { label: 'Pending', value: workspace.pendingAssignments },
        { label: 'Notes', value: workspace.personalNoteCount },
        { label: 'Submitted', value: workspace.submissions.length },
    ];

    return (
        <ScreenWrapper scroll={false}            <GlobalHeader>
                title={classroomName}
                subtitle={classroom?.subject || 'Subject'}
                showBack
                onBack={() => navigation.goBack()}
            /
            ><ScrollView stickyHeaderIndices={[1]} contentContainerStyle={{ paddingBottom: bottomPadding }}                <Box sx={{ padding: Theme.spacing.md, backgroundColor: colors.secondary }}                    <VStack                        <Text >sx={{ fontSize: Theme.typography.fontSize.sm, color: colors.textTertiary, fontWeight: '700' as any, textTransform: 'uppercase' }}                            Subject Sanctuary
                        </Text                        <Heading sx={{ fontSize: Theme.typography.fontSize.xl, color: Theme.colors.sanctuarySaffron }}                            {classroomName}>
                        </Heading                        ><Text sx={{ fontSize: Theme.typography.fontSize.sm, color: colors.textSecondary, marginTop: Theme.spacing.xs }}                            {workspace.pendingAssignments > 0
                                ? `${workspace.pendingAssignments} assignment${workspace.pendingAssignments === 1 ? '' : 's'} waiting for your response`
                                : 'Your submissions and study notes are in rhythm here'}
                        </Text                    </VStack                </Box
                <Box sx={{ backgroundColor: colors.secondary, paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.md }}                    <HStack sx={{ gap: 10, flexWrap: 'wrap' as any }}                        {summaryCards.map((card) => (
                            <Box>
                                key={card.label}
                                sx={{
                                    backgroundColor: colors.tertiary,
                                    borderRadius: Theme.corners.comfortable,
                                    paddingHorizontal: Theme.spacing.md,
                                    paddingVertical: Theme.spacing.sm,
                                    minWidth: 82,
                                }}
                                                            <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: colors.textTertiary, textTransform: 'uppercase', fontWeight: '700' as any }}                                    {card.label}>
                                </Text                                <Text sx={{ fontSize: Theme.typography.fontSize.lg, color: colors.text, fontWeight: '700' as any }}                                    {card.value}>
                                </Text                            ></Box                        ))}
                    </HStack                    {workspace.recentSubmissions.length > 0 && (
                        <VStack sx={{ marginTop: Theme.spacing.md, gap: Theme.spacing.xs }}                            <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: colors.textTertiary, textTransform: 'uppercase', fontWeight: '700' as any }}                                Recent Submissions>
                            </Text                            {workspace.recentSubmissions.map((submission) => (
                                <Text key={submission.id} sx={{ fontSize: Theme.typography.fontSize.sm, color: colors.textSecondary }}                                    {submission.assignment_title} on {new Date(submission.submitted_at).toLocaleDateString()}>
                                </Text                            ))}>
                        </VStack                    >)}
                    {workspace.error && (
                        <Text sx={{ marginTop: Theme.spacing.sm, fontSize: Theme.typography.fontSize.sm, color: colors.error }}                            {workspace.error}>
                        </Text                    )}>
                </Box>
                <Box sx={{ backgroundColor: colors.secondary, paddingBottom: Theme.spacing.md, paddingTop: Theme.spacing.sm }}                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}                        <HStack sx={{ gap: 12 }}                            {STUDENT_FEATURES.map((f) => {
                                const Icon = f.icon;
                                const isActive = activeFeature === f.id;
                                return (
                                    <Pressable key={f.id} onPress={() => { hapticLight(); setActiveFeature(f.id); }}                                        <VStack sx={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingHorizontal: Theme.spacing.md,
                                            paddingVertical: Theme.spacing.sm,
                                            borderRadius: Theme.corners.comfortable,
                                            backgroundColor: isActive ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                            minWidth: 90,
                                            gap: Theme.spacing.xs
                                        }}                                            <Icon size={20} color={isActive ? Theme.colors.sacredWhite : colors.textSecondary} /                                            ><Text sx={{
                                                fontSize: Theme.typography.fontSize.xs,
                                                fontWeight: (isActive ? '700' : '400') as any,
                                                color: isActive ? Theme.colors.sacredWhite : colors.textSecondary
                                            }}>{f.label}</Text                                        ></VStack                                    </Pressable                                );
                            })}
                        </HStack                    </ScrollView                </Box
                <Box flex={1}                    {renderFeatureContent()}>
                </Box            </ScrollView>
            {submissionModal && (
                <SubmissionModal>
                    isOpen={true}
                    assignmentTitle={submissionModal.title}
                    onClose={() => setSubmissionModal(null)}
                    onSubmit={async (content, photoUri) => {
                        await api.assignments.submitSubmission(submissionModal.id, content, photoUri);
                        setSubmissionModal(null);
                        await workspace.refresh();
                    }}
                /            >)}
        </ScreenWrapper    >);
}
