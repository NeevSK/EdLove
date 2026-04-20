import React, { useState } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    ScrollView,
    Pressable,
    Heading,
    hapticLight,
    GlobalHeader,
    ScreenWrapper,
    SkeletonCard,
    useBottomTabPadding,
    Icon
} from '@repo/ui';
import { api, Assignment } from '@repo/core';
import { AttendanceView, ResourcesView, ClassroomHolisticInsights, ClassroomEchoSection, SubmissionModal } from '../components';
import ClassroomNotes from '../components/ClassroomNotes';
import LessonFeed from './LessonFeed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClassroomStackParamList } from '@repo/core';
import { useStudentClassroomWorkspaceData } from '../workspace/useStudentClassroomWorkspaceData';
import { 
    TrendingUp as TrendingUpIcon, 
    NotebookPen as NotebookPenIcon, 
    BookOpen as BookOpenIcon, 
    ClipboardCheck as ClipboardCheckIcon, 
    GraduationCap as GraduationCapIcon, 
    FileText as FileTextIcon, 
    MessageSquare as MessageSquareIcon 
} from 'lucide-react-native';

type Props = NativeStackScreenProps<ClassroomStackParamList, 'StudentClassroomDashboard'>;

type FeatureId = 'insights' | 'notes' | 'attendance' | 'gradebook' | 'lessons' | 'resources' | 'echo';

const STUDENT_FEATURES: { id: FeatureId; label: string; icon: any }[] = [
    { id: 'insights', label: 'My Journey', icon: TrendingUpIcon },
    { id: 'notes', label: 'My Notes', icon: NotebookPenIcon },
    { id: 'lessons', label: 'Study Center', icon: BookOpenIcon },
    { id: 'attendance', label: 'My Attendance', icon: ClipboardCheckIcon },
    { id: 'gradebook', label: 'My Grades', icon: GraduationCapIcon },
    { id: 'resources', label: 'Library', icon: FileTextIcon },
    { id: 'echo', label: 'Ask Echo', icon: MessageSquareIcon },
];

export default function StudentClassroomDashboard({ route, navigation }: Props) {
    const { classroomId, classroomName } = route.params;
    const [activeFeature, setActiveFeature] = useState<FeatureId>('insights');
    const [submissionModal, setSubmissionModal] = useState<Assignment | null>(null);
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
                return <AttendanceView classroomId={classroomId} />;
            case 'gradebook':
                return (
                    <Box className="p-4">
                        <Text className="text-phaseText-tertiary">My Grade Performance</Text>
                    </Box>
                );
            case 'lessons':
                return (
                    <LessonFeed
                        classroomId={classroomId}
                        isTeacher={false}
                        onOpenLesson={(id: string) => console.log('Open Lesson', id)}
                        onOpenAssignment={(id: string) => console.log('Open Assignment', id)}
                        onOpenAssignmentRecord={(assignment: Assignment) => setSubmissionModal(assignment)}
                        submittedAssignmentIds={workspace.submittedAssignmentIds}
                    />
                );
            case 'resources':
                return <ResourcesView classroomId={classroomId} isTeacher={false} />;
            case 'echo':
                return <ClassroomEchoSection classroomId={classroomId} isTeacher={false} />;
            default:
                return null;
        }
    };

    if (workspace.isLoading) {
        return (
            <ScreenWrapper>
                <GlobalHeader title={classroomName} showBack onBack={() => navigation.goBack()} />
                <VStack className="gap-4 p-6">
                    <SkeletonCard height={100} />
                    <HStack className="gap-4 mt-4">
                        <SkeletonCard width={90} height={70} />
                        <SkeletonCard width={90} height={70} />
                        <SkeletonCard width={90} height={70} />
                    </HStack>
                </VStack>
            </ScreenWrapper>
        );
    }

    const summaryCards = [
        { label: 'Lessons', value: workspace.lessons.length },
        { label: 'Pending', value: workspace.pendingAssignments },
        { label: 'Notes', value: workspace.personalNoteCount },
        { label: 'Submitted', value: workspace.submissions.length },
    ];

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={classroomName}
                subtitle={classroom?.subject || 'Subject'}
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView stickyHeaderIndices={[1]} contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
                <Box className="p-4 bg-phase-surface">
                    <VStack className="gap-1">
                        <Text className="text-[10px] text-phaseText-tertiary font-black uppercase tracking-widest">
                            Subject Sanctuary
                        </Text>
                        <Heading className="text-2xl font-black text-templeGold">
                            {classroomName}
                        </Heading>
                        <Text className="text-sm text-phaseText-secondary mt-1 font-medium italic">
                            {workspace.pendingAssignments > 0
                                ? `${workspace.pendingAssignments} assignment${workspace.pendingAssignments === 1 ? '' : 's'} waiting for your response`
                                : 'Your submissions and study notes are in rhythm here'}
                        </Text>
                    </VStack>
                </Box>
                
                <Box className="bg-phase-surface px-4 pb-4">
                    <HStack className="gap-2.5 flex-wrap">
                        {summaryCards.map((card) => (
                            <Box
                                key={card.label}
                                className="bg-phase-canvas rounded-comfortable px-4 py-3 min-w-[82px] border border-phase-canvas shadow-sm"
                            >
                                <Text className="text-[10px] text-phaseText-tertiary uppercase font-black tracking-tighter">
                                    {card.label}
                                </Text>
                                <Text className="text-xl text-phaseText-primary font-black">
                                    {card.value}
                                </Text>
                            </Box>
                        ))}
                    </HStack>
                    
                    {workspace.recentSubmissions.length > 0 && (
                        <VStack className="mt-4 gap-1">
                            <Text className="text-[10px] text-phaseText-tertiary uppercase font-black tracking-widest">
                                Recent Submissions
                            </Text>
                            {workspace.recentSubmissions.map((submission: any) => (
                                <Text key={submission.id} className="text-xs text-phaseText-secondary font-bold">
                                    {submission.assignment_title} &bull; {new Date(submission.submitted_at).toLocaleDateString()}
                                </Text>
                            ))}
                        </VStack>
                    )}
                    
                    {workspace.error && (
                        <Text className="mt-2 text-xs text-emberRed font-black">
                            {workspace.error}
                        </Text>
                    )}
                </Box>

                <Box className="bg-phase-surface pb-4 pt-2 border-b border-phase-canvas">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4">
                        <HStack className="gap-3">
                            {STUDENT_FEATURES.map((f) => {
                                const isActive = activeFeature === f.id;
                                return (
                                    <Pressable 
                                        key={f.id} 
                                        onPress={() => { hapticLight(); setActiveFeature(f.id); }}
                                        className={`items-center justify-center px-4 py-3 rounded-comfortable min-w-[90px] gap-1.5 border ${
                                            isActive ? "bg-templeGold border-templeGold" : "bg-phase-canvas border-phase-canvas shadow-sm"
                                        }`}
                                    >
                                        <Icon as={f.icon} size="sm" className={isActive ? "text-phase-surface" : "text-phaseText-secondary"} />
                                        <Text className={`text-[10px] uppercase tracking-widest font-black ${
                                            isActive ? "text-phase-surface" : "text-phaseText-secondary"
                                        }`}>
                                            {f.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </ScrollView>
                </Box>
                
                <Box className="flex-1" style={{ paddingBottom: bottomPadding }}>
                    {renderFeatureContent()}
                </Box>
            </ScrollView>

            {submissionModal && (
                <SubmissionModal
                    isOpen={true}
                    assignmentTitle={submissionModal.title}
                    onClose={() => setSubmissionModal(null)}
                    onSubmit={async (content: string, photoUri?: string) => {
                        await api.assignments.submitSubmission(submissionModal.id, content, photoUri);
                        setSubmissionModal(null);
                        await workspace.refresh();
                    }}
                />
            )}
        </ScreenWrapper>
    );
}
