import { api } from '@repo/core/api/client';
import { usePermissions } from '@repo/core/logic';
import ClassroomLegacyTimeline from '@repo/self/components/ClassroomLegacyTimeline';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { useThemedColors } from '@repo/ui/hooks';
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  Layers,
  LayoutGrid,
  MessageSquare,
  NotebookPen,
  Sparkles,
  TrendingUp,
  Users,
} from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { safeBack } from '@repo/ui/utils/navigation';
import { openExternalURL } from '@repo/ui/utils/linking';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useReducer } from 'react';
import {
  AttendanceView,
  ClassroomEchoSection,
  ClassroomHolisticInsights,
  InventoryView,
  ResourcesView,
  StudentList,
} from '@repo/classroom/components';
import ClassroomNotes from '@repo/classroom/components/ClassroomNotes';
import TeacherAnalysisWorkspace from '@repo/classroom/components/teacher/TeacherAnalysisWorkspace';
import TeacherAssignmentsWorkspace from '@repo/classroom/components/teacher/TeacherAssignmentsWorkspace';
import TeacherGroupsModal from '@repo/classroom/components/teacher/TeacherGroupsModal';
import TeacherObservationsWorkspace from '@repo/classroom/components/teacher/TeacherObservationsWorkspace';
import { useTeacherClassroomWorkspaceData } from '@repo/classroom/workspace/useTeacherClassroomWorkspaceData';
import LessonFeed from '@repo/classroom/screens/LessonFeed';

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
  | 'analysis'
  | 'legacy';

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
  { id: 'legacy', label: 'Legacy', icon: Layers },
];

const FEATURE_TONES: Record<FeatureId, { label: string; color: string; tint: string }> = {
  insights: {
    label: 'Class pulse',
    color: Theme.colors.gurudeviBlue,
    tint: 'rgba(125,212,192,0.14)',
  },
  students: {
    label: 'Roster lane',
    color: Theme.colors.sanctuarySaffron,
    tint: 'rgba(246,191,140,0.14)',
  },
  assignments: {
    label: 'Work queue',
    color: Theme.colors.sanctuarySaffron,
    tint: 'rgba(246,191,140,0.14)',
  },
  lessons: {
    label: 'Learning arc',
    color: Theme.colors.gurudeviViolet,
    tint: 'rgba(184,169,224,0.14)',
  },
  resources: {
    label: 'Library lane',
    color: Theme.colors.gurudeviBlue,
    tint: 'rgba(125,212,192,0.14)',
  },
  notes: {
    label: 'Teacher notes',
    color: Theme.colors.gurudeviViolet,
    tint: 'rgba(184,169,224,0.14)',
  },
  attendance: {
    label: 'Daily rhythm',
    color: Theme.colors.gurudeviBlue,
    tint: 'rgba(125,212,192,0.14)',
  },
  inventory: {
    label: 'Support needs',
    color: Theme.colors.sageGreen,
    tint: 'rgba(139,191,122,0.14)',
  },
  echo: {
    label: 'Student voice',
    color: Theme.colors.gurudeviViolet,
    tint: 'rgba(184,169,224,0.14)',
  },
  observations: {
    label: 'Growth signals',
    color: Theme.colors.sageGreen,
    tint: 'rgba(139,191,122,0.14)',
  },
  analysis: {
    label: 'Deep read',
    color: Theme.colors.amberGlow,
    tint: 'rgba(255,184,77,0.16)',
  },
  legacy: {
    label: 'Cohort lineage',
    color: Theme.colors.sageGreen,
    tint: 'rgba(139,191,122,0.14)',
  },
};

const initialState = {
  activeFeature: 'insights' as FeatureId,
  showGroupsModal: false,
  refreshTrigger: 0,
  showAddMonthModal: false,
  newMonthTitle: '',
  showAddContentModal: false,
  contentType: 'material' as 'material' | 'assignment',
  activeLessonId: null as string | null,
  form: {
    title: '',
    description: '',
    type: 'note' as 'pdf' | 'link' | 'note',
    url: '',
    dueDate: '',
  },
  isSubmitting: false,
};

export default function TeacherClassroomDashboardWeb() {
  const router = useRouter();
  const { classroomId = '', classroomName = 'Classroom' } = useLocalSearchParams<{
    classroomId?: string;
    classroomName?: string;
  }>();
  const colors = useThemedColors();
  const { can, context } = usePermissions();
  const { showToast } = useSanctuaryToast();

  const openMaterial = async (material: import('@repo/core/types').LessonMaterial) => {
    try {
      if (material.url) {
        await openExternalURL(material.url, {
          sourceLabel: material.title,
          trustLevel: 'external',
        });
        return;
      }
      showToast({
        message: material.content || 'This material does not have a readable preview yet.',
        type: 'info',
      });
    } catch (error) {
      console.error('Failed to open learning material:', error);
      showToast({ message: 'This material could not be opened. Please try again.', type: 'error' });
    }
  };

  const workspace = useTeacherClassroomWorkspaceData(classroomId);
  const classroom = workspace.classroom;
  const students = workspace.students;

  const [state, dispatch] = useReducer(
    (
      prev: typeof initialState,
      action:
        | { type: 'SET_ACTIVE_FEATURE'; payload: FeatureId }
        | { type: 'SET_SHOW_GROUPS_MODAL'; payload: boolean }
        | { type: 'INCREMENT_REFRESH_TRIGGER' }
        | { type: 'SET_SHOW_ADD_MONTH_MODAL'; payload: boolean }
        | { type: 'SET_NEW_MONTH_TITLE'; payload: string }
        | { type: 'SET_SHOW_ADD_CONTENT_MODAL'; payload: boolean }
        | { type: 'SET_CONTENT_TYPE'; payload: 'material' | 'assignment' }
        | { type: 'SET_ACTIVE_LESSON_ID'; payload: string | null }
        | { type: 'UPDATE_FORM'; payload: Partial<typeof initialState.form> }
        | { type: 'RESET_FORM' }
        | { type: 'SET_IS_SUBMITTING'; payload: boolean },
    ) => {
      switch (action.type) {
        case 'SET_ACTIVE_FEATURE':
          return { ...prev, activeFeature: action.payload };
        case 'SET_SHOW_GROUPS_MODAL':
          return { ...prev, showGroupsModal: action.payload };
        case 'INCREMENT_REFRESH_TRIGGER':
          return { ...prev, refreshTrigger: prev.refreshTrigger + 1 };
        case 'SET_SHOW_ADD_MONTH_MODAL':
          return { ...prev, showAddMonthModal: action.payload };
        case 'SET_NEW_MONTH_TITLE':
          return { ...prev, newMonthTitle: action.payload };
        case 'SET_SHOW_ADD_CONTENT_MODAL':
          return { ...prev, showAddContentModal: action.payload };
        case 'SET_CONTENT_TYPE':
          return { ...prev, contentType: action.payload };
        case 'SET_ACTIVE_LESSON_ID':
          return { ...prev, activeLessonId: action.payload };
        case 'UPDATE_FORM':
          return { ...prev, form: { ...prev.form, ...action.payload } };
        case 'RESET_FORM':
          return { ...prev, form: initialState.form, activeLessonId: null };
        case 'SET_IS_SUBMITTING':
          return { ...prev, isSubmitting: action.payload };
        default:
          return prev;
      }
    },
    initialState,
  );

  const activeTone = FEATURE_TONES[state.activeFeature];
  const contentType = state.contentType;

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  const handleAddMonth = async () => {
    if (!state.newMonthTitle.trim()) return;
    dispatch({ type: 'SET_IS_SUBMITTING', payload: true });
    try {
      const lessons = await api.lessons.getAll(classroomId);
      const maxOrder = lessons.reduce(
        (max: number, lesson: any) => Math.max(max, lesson.order_index),
        0,
      );
      await api.lessons.create({
        classroom_id: classroomId,
        title: state.newMonthTitle.trim(),
        order_index: maxOrder + 1,
      });
      dispatch({ type: 'SET_NEW_MONTH_TITLE', payload: '' });
      dispatch({ type: 'SET_SHOW_ADD_MONTH_MODAL', payload: false });
      dispatch({ type: 'INCREMENT_REFRESH_TRIGGER' });
      await workspace.refreshWorkspace();
    } catch (error) {
      console.error('Failed to add month', error);
    } finally {
      dispatch({ type: 'SET_IS_SUBMITTING', payload: false });
    }
  };

  const handleAddContent = async () => {
    if (!state.form.title.trim() || !state.activeLessonId) return;
    dispatch({ type: 'SET_IS_SUBMITTING', payload: true });
    try {
      let targetLessonId = state.activeLessonId;
      if (
        !targetLessonId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ) {
        const lesson = await api.lessons.create({
          classroom_id: classroomId,
          title: targetLessonId,
          content: `Materials for ${targetLessonId}`,
          order_index: 0,
        });
        targetLessonId = lesson.id;
      }

      if (state.contentType === 'material') {
        await api.lessonMaterials.create({
          classroom_id: classroomId,
          lesson_id: targetLessonId,
          title: state.form.title,
          type: state.form.type,
          url: state.form.type === 'pdf' || state.form.type === 'link' ? state.form.url : undefined,
          content: state.form.type === 'note' ? state.form.description : undefined,
          is_pinned: false,
        });
      } else {
        await api.assignments.create({
          classroom_id: classroomId,
          lesson_id: targetLessonId,
          title: state.form.title,
          description: state.form.description,
          due_date: state.form.dueDate ? new Date(state.form.dueDate) : undefined,
        });
      }

      dispatch({ type: 'SET_SHOW_ADD_CONTENT_MODAL', payload: false });
      resetForm();
      dispatch({ type: 'INCREMENT_REFRESH_TRIGGER' });
      await workspace.refreshWorkspace();
    } catch (error) {
      console.error('Failed to add lesson content', error);
    } finally {
      dispatch({ type: 'SET_IS_SUBMITTING', payload: false });
    }
  };

  const renderFeatureContent = () => {
    switch (state.activeFeature) {
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
                      The registry stays central, while group management now lives beside direct
                      student actions.
                    </Text>
                  </VStack>
                  <Button
                    size="sm"
                    variant="outline"
                    action="secondary"
                    onPress={() => dispatch({ type: 'SET_SHOW_GROUPS_MODAL', payload: true })}
                    className="rounded-full"
                    style={{ borderColor: colors.border }}
                  >
                    <HStack className="items-center gap-1.5">
                      <Icon as={Layers} size={16} color={colors.text} />
                      <ButtonText style={{ color: colors.text }}>Groups</ButtonText>
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
        return (
          <TeacherAssignmentsWorkspace
            classroomId={classroomId}
            canManage={can('create', 'Assignment')}
          />
        );
      case 'lessons':
        return (
          <LessonFeed
            classroomId={classroomId}
            isTeacher={can('update', 'Lesson') || can('manage', 'Classroom')}
            refreshTrigger={state.refreshTrigger}
            onOpenMaterial={(material) => {
              void openMaterial(material);
            }}
            onAddMaterial={(lessonId) => {
              dispatch({ type: 'SET_ACTIVE_LESSON_ID', payload: lessonId });
              dispatch({ type: 'SET_CONTENT_TYPE', payload: 'material' });
              dispatch({ type: 'SET_SHOW_ADD_CONTENT_MODAL', payload: true });
            }}
            onAddAssignment={(lessonId) => {
              dispatch({ type: 'SET_ACTIVE_LESSON_ID', payload: lessonId });
              dispatch({ type: 'SET_CONTENT_TYPE', payload: 'assignment' });
              dispatch({ type: 'SET_SHOW_ADD_CONTENT_MODAL', payload: true });
            }}
          />
        );
      case 'resources':
        return (
          <ResourcesView
            classroomId={classroomId}
            isTeacher={can('update', 'ClassroomResource') || can('manage', 'Classroom')}
          />
        );
      case 'notes':
        return <ClassroomNotes classroomId={classroomId} isTeacher={can('manage', 'Classroom')} />;
      case 'attendance':
        return <AttendanceView classroomId={classroomId} />;
      case 'inventory':
        return <InventoryView classroomId={classroomId} />;
      case 'echo':
        return (
          <ClassroomEchoSection classroomId={classroomId} isTeacher={can('read', 'TeacherPulse')} />
        );
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
      case 'legacy':
        return <ClassroomLegacyTimeline classroomId={classroomId} />;
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
              boxShadow: `0 10px 20px ${Theme.colors.shadowAmbient}`,
            }}
          >
            <VStack className="gap-lg">
              <HStack className="items-center justify-between gap-md">
                <Pressable onPress={() => safeBack('/workspace')}>
                  <HStack
                    className="items-center gap-xs px-md py-sm rounded-full border"
                    style={{
                      backgroundColor: colors.primary,
                      borderColor: colors.border,
                    }}
                  >
                    <Icon as={ArrowLeft} size={16} color={colors.text} />
                    <Text className="font-semibold" style={{ color: colors.text }}>
                      Back
                    </Text>
                  </HStack>
                </Pressable>
                <HStack className="gap-sm items-center">
                  {state.activeFeature === 'lessons' && (
                    <Button
                      size="sm"
                      action="primary"
                      onPress={() => dispatch({ type: 'SET_SHOW_ADD_MONTH_MODAL', payload: true })}
                      className="rounded-full"
                      style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                    >
                      <ButtonText style={{ color: Theme.colors.sacredWhite }}>
                        New Module
                      </ButtonText>
                    </Button>
                  )}
                  <StatPill label="Students" value={String(students.length)} colors={colors} />
                  <StatPill
                    label="Subject"
                    value={classroom?.subject || 'Classroom'}
                    colors={colors}
                  />
                  <StatPill
                    label="Current lane"
                    value={activeTone.label}
                    colors={colors}
                    highlightColor={activeTone.color}
                    highlightTint={activeTone.tint}
                  />
                  <StatPill
                    label="Signals"
                    value={`${workspace.summary.assignmentCount}/${workspace.summary.observationCount}`}
                    colors={colors}
                  />
                </HStack>
              </HStack>
              <VStack className="gap-sm">
                <Text
                  className="text-[11px] font-bold uppercase tracking-[1px]"
                  style={{ color: colors.textTertiary }}
                >
                  Teacher Classroom
                </Text>
                <Heading className="text-2xl" style={{ color: colors.text }}>
                  {classroomName || classroom?.name || 'Classroom'}
                </Heading>
                <Text className="text-sm max-w-[760px]" style={{ color: colors.textSecondary }}>
                  The web surface now follows the same canonical teacher classroom inventory as
                  native, while keeping a wider command-lane rhythm.
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
                boxShadow: `0 8px 18px ${Theme.colors.shadowAmbient}`,
              }}
            >
              <Box className="p-md border-b" style={{ borderBottomColor: colors.border }}>
                <HStack className="items-center justify-between gap-md">
                  <VStack className="flex-1">
                    <Text
                      className="text-xs uppercase font-bold"
                      style={{ color: colors.textTertiary }}
                    >
                      Student Pulse
                    </Text>
                    <Text style={{ color: colors.textSecondary }}>
                      Keep the roster, attendance, and deeper analysis in one teacher command lane.
                    </Text>
                  </VStack>
                  <HStack className="gap-sm">
                    <Button
                      size="sm"
                      variant="outline"
                      action="secondary"
                      onPress={() => dispatch({ type: 'SET_ACTIVE_FEATURE', payload: 'students' })}
                    >
                      <ButtonText style={{ color: colors.text }}>Roster</ButtonText>
                    </Button>
                    <Button
                      size="sm"
                      action="primary"
                      onPress={() =>
                        dispatch({ type: 'SET_ACTIVE_FEATURE', payload: 'attendance' })
                      }
                      style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                    >
                      <ButtonText style={{ color: Theme.colors.sacredWhite }}>
                        Attendance
                      </ButtonText>
                    </Button>
                  </HStack>
                </HStack>
              </Box>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack className="gap-sm px-md py-md">
                  {FEATURES.map((feature) => {
                    const isActive = state.activeFeature === feature.id;
                    const tone = FEATURE_TONES[feature.id];
                    return (
                      <Pressable
                        key={feature.id}
                        accessibilityRole="tab"
                        accessibilityLabel={feature.label}
                        accessibilityState={{ selected: isActive }}
                        onPress={() =>
                          dispatch({ type: 'SET_ACTIVE_FEATURE', payload: feature.id })
                        }
                      >
                        <Box
                          className="px-md py-sm rounded-full border"
                          style={{
                            borderColor: isActive ? tone.color : Theme.colors.linen,
                            backgroundColor: isActive ? tone.color : Theme.colors.silk,
                          }}
                        >
                          <HStack className="items-center gap-xs">
                            <Icon
                              as={feature.icon}
                              size={16}
                              color={isActive ? Theme.colors.sacredWhite : tone.color}
                            />
                            <Text
                              className="font-medium"
                              style={{
                                color: isActive ? Theme.colors.sacredWhite : colors.text,
                                fontWeight: isActive ? '700' : '500',
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
                    <Text
                      className="text-xs uppercase font-bold"
                      style={{ color: colors.textTertiary }}
                    >
                      Classroom Compass
                    </Text>
                    <Heading className="text-md" style={{ color: colors.text }}>
                      {activeTone.label}
                    </Heading>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                      One dominant workspace lane, with quicker jumps kept nearby instead of
                      competing inside it.
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
                      Active: {state.activeFeature}
                    </Text>
                  </Box>
                  <VStack className="gap-sm">
                    {(['students', 'attendance', 'analysis'] as FeatureId[]).map((id) => {
                      const tone = FEATURE_TONES[id];
                      const isCurrent = state.activeFeature === id;
                      return (
                        <Pressable
                          key={id}
                          onPress={() => dispatch({ type: 'SET_ACTIVE_FEATURE', payload: id })}
                        >
                          <Box
                            className="rounded-comfortable border p-sm"
                            style={{
                              backgroundColor: isCurrent ? tone.tint : colors.primary,
                              borderColor: colors.border,
                            }}
                          >
                            <Text
                              className="font-bold"
                              style={{
                                color: isCurrent ? tone.color : colors.text,
                              }}
                            >
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
                  <Text
                    className="text-xs uppercase font-bold"
                    style={{ color: colors.textTertiary }}
                  >
                    Classroom Details
                  </Text>
                  <RailStat
                    label="Class"
                    value={classroomName || classroom?.name || 'Classroom'}
                    colors={colors}
                  />
                  <RailStat
                    label="Subject"
                    value={classroom?.subject || 'General'}
                    colors={colors}
                  />
                  <RailStat label="Students" value={String(students.length)} colors={colors} />
                </VStack>
              </Box>
            </VStack>
          </HStack>
        </VStack>
      </ScrollView>

      <TeacherGroupsModal
        classroomId={classroomId}
        isOpen={state.showGroupsModal}
        onClose={() => dispatch({ type: 'SET_SHOW_GROUPS_MODAL', payload: false })}
        students={students}
      />

      <Modal
        isOpen={state.showAddMonthModal}
        onClose={() => dispatch({ type: 'SET_SHOW_ADD_MONTH_MODAL', payload: false })}
      >
        <ModalBackdrop />
        <ModalContent
          className="border"
          style={{
            backgroundColor: colors.primary,
            borderColor: colors.border,
          }}
        >
          <ModalHeader>
            <Heading className="text-lg" style={{ color: colors.text }}>
              Add monthly module
            </Heading>
          </ModalHeader>
          <ModalBody>
            <Input
              style={{
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              }}
            >
              <InputField
                placeholder="September 2026"
                value={state.newMonthTitle}
                onChangeText={(val) => dispatch({ type: 'SET_NEW_MONTH_TITLE', payload: val })}
                style={{ color: colors.text }}
              />
            </Input>
          </ModalBody>
          <ModalFooter>
            <HStack className="gap-sm">
              <Button
                variant="outline"
                action="secondary"
                onPress={() => dispatch({ type: 'SET_SHOW_ADD_MONTH_MODAL', payload: false })}
              >
                <ButtonText style={{ color: colors.textSecondary }}>Cancel</ButtonText>
              </Button>
              <Button
                action="primary"
                onPress={handleAddMonth}
                isDisabled={!state.newMonthTitle.trim() || state.isSubmitting}
                style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
              >
                <ButtonText style={{ color: Theme.colors.sacredWhite }}>Save</ButtonText>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={state.showAddContentModal}
        onClose={() => {
          dispatch({ type: 'SET_SHOW_ADD_CONTENT_MODAL', payload: false });
          resetForm();
        }}
      >
        <ModalBackdrop />
        <ModalContent
          className="border"
          style={{
            backgroundColor: colors.primary,
            borderColor: colors.border,
          }}
        >
          <ModalHeader>
            <Heading className="text-lg" style={{ color: colors.text }}>
              {contentType === 'material' ? 'Add lesson material' : 'Create assignment'}
            </Heading>
          </ModalHeader>
          <ModalBody>
            <VStack className="gap-md">
              {state.contentType === 'material' && (
                <HStack className="gap-sm">
                  {(['note', 'link', 'pdf'] as const).map((type) => {
                    const isActive = state.form.type === type;
                    return (
                      <Pressable
                        key={type}
                        onPress={() => dispatch({ type: 'UPDATE_FORM', payload: { type } })}
                      >
                        <Box
                          className="px-md py-sm rounded-full border"
                          style={{
                            borderColor: isActive ? Theme.colors.sanctuarySaffron : colors.border,
                            backgroundColor: isActive
                              ? Theme.colors.sanctuarySaffron
                              : colors.secondary,
                          }}
                        >
                          <Text
                            className="uppercase"
                            style={{
                              color: isActive ? Theme.colors.sacredWhite : colors.text,
                            }}
                          >
                            {type}
                          </Text>
                        </Box>
                      </Pressable>
                    );
                  })}
                </HStack>
              )}
              <Input
                style={{
                  backgroundColor: colors.secondary,
                  borderColor: colors.border,
                }}
              >
                <InputField
                  placeholder="Title"
                  value={state.form.title}
                  onChangeText={(title) => dispatch({ type: 'UPDATE_FORM', payload: { title } })}
                  style={{ color: colors.text }}
                />
              </Input>
              {(state.contentType === 'assignment' || state.form.type === 'note') && (
                <Input
                  className="min-h-[100px]"
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  <InputField
                    placeholder="Description"
                    value={state.form.description}
                    onChangeText={(description) =>
                      dispatch({ type: 'UPDATE_FORM', payload: { description } })
                    }
                    style={{ color: colors.text }}
                    multiline
                  />
                </Input>
              )}
              {state.contentType === 'material' &&
                (state.form.type === 'pdf' || state.form.type === 'link') && (
                  <Input
                    style={{
                      backgroundColor: colors.secondary,
                      borderColor: colors.border,
                    }}
                  >
                    <InputField
                      placeholder="URL"
                      value={state.form.url}
                      onChangeText={(url) => dispatch({ type: 'UPDATE_FORM', payload: { url } })}
                      style={{ color: colors.text }}
                    />
                  </Input>
                )}
              {state.contentType === 'assignment' && (
                <Input
                  style={{
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  }}
                >
                  <InputField
                    placeholder="Due date (YYYY-MM-DD)"
                    value={state.form.dueDate}
                    onChangeText={(dueDate) =>
                      dispatch({ type: 'UPDATE_FORM', payload: { dueDate } })
                    }
                    style={{ color: colors.text }}
                  />
                </Input>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack className="gap-sm">
              <Button
                variant="outline"
                action="secondary"
                onPress={() => {
                  dispatch({ type: 'SET_SHOW_ADD_CONTENT_MODAL', payload: false });
                  resetForm();
                }}
              >
                <ButtonText style={{ color: colors.textSecondary }}>Cancel</ButtonText>
              </Button>
              <Button
                action="primary"
                onPress={handleAddContent}
                isDisabled={!state.form.title.trim() || state.isSubmitting}
                style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
              >
                <ButtonText style={{ color: Theme.colors.sacredWhite }}>Save</ButtonText>
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
      <Text className="font-bold" style={{ color: highlightColor || colors.text }}>
        {value}
      </Text>
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
      <Text className="font-bold" style={{ color: colors.text }}>
        {value}
      </Text>
    </Box>
  );
}
