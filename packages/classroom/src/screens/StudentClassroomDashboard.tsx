import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { type Assignment, api, type ClassroomStackParamList } from '@repo/core';
import {
  Box,
  GlobalHeader,
  Heading,
  HStack,
  hapticLight,
  Icon,
  Pressable,
  ScreenWrapper,
  ScrollView,
  SkeletonCard,
  Text,
  useBottomTabPadding,
  VStack,
} from '@repo/ui';
import {
  BookOpen as BookOpenIcon,
  ClipboardCheck as ClipboardCheckIcon,
  FileText as FileTextIcon,
  GraduationCap as GraduationCapIcon,
  MessageSquare as MessageSquareIcon,
  NotebookPen as NotebookPenIcon,
  TrendingUp as TrendingUpIcon,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  AttendanceView,
  ClassroomEchoSection,
  ClassroomHolisticInsights,
  ResourcesView,
  SubmissionModal,
} from '../components';
import ClassroomNotes from '../components/ClassroomNotes';
import { useStudentClassroomWorkspaceData } from '../workspace/useStudentClassroomWorkspaceData';
import LessonFeed from './LessonFeed';

type Props = NativeStackScreenProps<ClassroomStackParamList, 'StudentClassroomDashboard'>;

type FeatureId =
  | 'insights'
  | 'notes'
  | 'attendance'
  | 'gradebook'
  | 'lessons'
  | 'resources'
  | 'echo';

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
            <Text className="text-phase-text-tertiary">My Grade Performance</Text>
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
      <ScrollView
        stickyHeaderIndices={[1]}
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <Box className="p-6 bg-phase-surface">
          <VStack className="gap-2">
            <Text className="text-[12px] text-phase-text-tertiary font-black uppercase tracking-[0.2em] mb-1">
              Subject Sanctuary
            </Text>
            <Heading className="text-4xl font-black text-templeGold leading-tight">
              {classroomName}
            </Heading>
            <Text className="text-base text-phase-text-secondary mt-2 font-medium">
              {workspace.pendingAssignments > 0
                ? `${workspace.pendingAssignments} assignment${workspace.pendingAssignments === 1 ? '' : 's'} waiting for your response`
                : 'Your submissions and study notes are in rhythm here'}
            </Text>
          </VStack>
        </Box>

        <Box className="bg-phase-surface px-6 pb-6 shadow-sm z-10">
          <HStack className="gap-3 flex-wrap">
            {summaryCards.map((card) => (
              <Box
                key={card.label}
                className="bg-phase-surface-secondary rounded-[24px] px-5 py-4 flex-1 min-w-[100px] border border-phase-border/40 shadow-sm"
              >
                <Text className="text-[10px] text-phase-text-tertiary uppercase font-black tracking-widest mb-1">
                  {card.label}
                </Text>
                <Text className="text-2xl text-phase-text-primary font-black">{card.value}</Text>
              </Box>
            ))}
          </HStack>

          {workspace.recentSubmissions.length > 0 && (
            <VStack className="mt-6 gap-2">
              <Text className="text-[10px] text-phase-text-tertiary uppercase font-black tracking-widest">
                Recent Submissions
              </Text>
              <VStack className="gap-1.5">
                {workspace.recentSubmissions.slice(0, 2).map((submission: any) => (
                  <HStack key={submission.id} className="items-center gap-2">
                    <Box className="w-1 h-1 rounded-full bg-sanctuarySaffron" />
                    <Text className="text-xs text-phase-text-secondary font-bold">
                      {submission.assignment_title} &bull;{' '}
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          )}

          {workspace.error && (
            <Text className="mt-4 text-xs text-emberRed font-black px-2 py-1 bg-emberRed/5 rounded-lg">
              {workspace.error}
            </Text>
          )}
        </Box>

        <Box className="bg-phase-surface pb-6 pt-3 border-b border-phase-border sticky">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-6"
          >
            <HStack className="gap-3">
              {STUDENT_FEATURES.map((f) => {
                const isActive = activeFeature === f.id;
                return (
                  <Pressable
                    key={f.id}
                    onPress={() => {
                      hapticLight();
                      setActiveFeature(f.id);
                    }}
                    className={`items-center justify-center px-6 py-4 rounded-[24px] min-w-[110px] gap-2 border shadow-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-templeGold border-templeGold shadow-templeGold/20 scale-105'
                        : 'bg-phase-surface-secondary border-phase-border/40'
                    }`}
                  >
                    <Icon
                      as={f.icon}
                      size="sm"
                      className={isActive ? 'text-sanctuary-ink' : 'text-phase-text-secondary'}
                    />
                    <Text
                      className={`text-[11px] uppercase tracking-widest font-black ${
                        isActive ? 'text-sanctuary-ink' : 'text-phase-text-secondary'
                      }`}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </HStack>
          </ScrollView>
        </Box>

        <Box className="flex-1 px-2" style={{ paddingBottom: bottomPadding }}>
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
