import { api } from '@repo/core/api';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { usePermissions, useStore } from '@repo/core/logic';
import { useConflictStore } from '@repo/core/store/useConflictStore';
import type {
  Classroom,
  ClassroomStackParamList,
  WorkspaceLayout,
  WorkspaceSurfaceDefinition,
  WorkspaceZoneId,
} from '@repo/core/types';
import { StudentAnalysisModal } from '@repo/library';
import ClassroomLegacyTimeline from '@repo/self/components/ClassroomLegacyTimeline';
import { ConflictResolver } from '@repo/ui/components/ConflictResolver';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { PredictiveButton } from '@repo/ui/components/PredictiveButton';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import ScreenWrapper, { useBottomTabPadding } from '@repo/ui/components/ScreenWrapper';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { ResponsiveWorkspaceCanvas } from '@repo/ui/components/workspace/ResponsiveWorkspaceCanvas';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { useThemedColors } from '@repo/ui/hooks';
import {
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  Layers,
  LayoutGrid,
  MessageSquare,
  NotebookPen,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from '@repo/ui/icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { safeBack } from '@repo/ui/utils/navigation';
import { useMemo, useState } from 'react';
import {
  AttendanceView,
  ClassroomEchoSection,
  ClassroomHolisticInsights,
  InventoryView,
  ResourcesView,
  StudentList,
} from '../components';
import ClassroomNotes from '../components/ClassroomNotes';
import TeacherAnalysisWorkspace from '../components/teacher/TeacherAnalysisWorkspace';
import TeacherAssignmentsWorkspace from '../components/teacher/TeacherAssignmentsWorkspace';
import TeacherGroupsModal from '../components/teacher/TeacherGroupsModal';
import TeacherObservationsWorkspace from '../components/teacher/TeacherObservationsWorkspace';
import { useTeacherClassroomWorkspaceData } from '../workspace/useTeacherClassroomWorkspaceData';
import AttendanceReportScreen from './AttendanceReportScreen';
import LessonFeed from './LessonFeed';

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
  { id: 'legacy', label: 'Legacy', icon: Layers },
];

const FEATURE_TONES: Record<FeatureId, { label: string; color: string; tint: string }> = {
  insights: {
    label: 'Class pulse',
    color: Theme.colors.gurudeviBlue,
    tint: 'bg-gurudeviBlue/10',
  },
  students: {
    label: 'Roster lane',
    color: Theme.colors.sanctuarySaffron,
    tint: 'bg-sanctuarySaffron/10',
  },
  assignments: {
    label: 'Work queue',
    color: Theme.colors.sanctuarySaffron,
    tint: 'bg-sanctuarySaffron/10',
  },
  lessons: {
    label: 'Learning arc',
    color: Theme.colors.gurudeviViolet,
    tint: 'bg-gurudeviViolet/10',
  },
  resources: {
    label: 'Library lane',
    color: Theme.colors.gurudeviBlue,
    tint: 'bg-gurudeviBlue/10',
  },
  notes: {
    label: 'Teacher notes',
    color: Theme.colors.gurudeviViolet,
    tint: 'bg-gurudeviViolet/10',
  },
  attendance: {
    label: 'Daily rhythm',
    color: Theme.colors.gurudeviBlue,
    tint: 'bg-gurudeviBlue/10',
  },
  inventory: {
    label: 'Support needs',
    color: Theme.colors.sageGreen,
    tint: 'bg-sageGreen/10',
  },
  echo: {
    label: 'Student voice',
    color: Theme.colors.gurudeviViolet,
    tint: 'bg-gurudeviViolet/10',
  },
  observations: {
    label: 'Growth signals',
    color: Theme.colors.sageGreen,
    tint: 'bg-sageGreen/10',
  },
  analysis: {
    label: 'Deep read',
    color: Theme.colors.amberGlow,
    tint: 'bg-amberGlow/10',
  },
  legacy: {
    label: 'Cohort lineage',
    color: Theme.colors.sageGreen,
    tint: 'bg-sageGreen/10',
  },
};

export default function TeacherClassroomDashboard() {
  const router = useRouter();
  const { classroomId = '', classroomName = 'Classroom' } = useLocalSearchParams<{
    classroomId?: string;
    classroomName?: string;
  }>();
  const { can, context } = usePermissions();
  const [activeFeature, setActiveFeature] = useState<FeatureId>('insights');
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const _colors = useThemedColors();
  const _bottomPadding = useBottomTabPadding();
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
  const currentUserId = useStore((state) => state.user?.id ?? '');
  const classroom = workspace.classroom as Classroom | null;
  const students = workspace.students as any[];

  const dashboardSurfaces = useMemo<WorkspaceSurfaceDefinition[]>(
    () => [
      {
        surfaceId: 'subject',
        workspaceId: classroomId,
        capabilityKey: 'core.identity',
        ownerPackage: 'classroom',
        defaultZone: 'work',
        defaultOrder: 0,
        title: 'Class Subject',
      },
      {
        surfaceId: 'lane',
        workspaceId: classroomId,
        capabilityKey: 'core.navigation',
        ownerPackage: 'classroom',
        defaultZone: 'today',
        defaultOrder: 1,
        title: 'Active Lane',
      },
      {
        surfaceId: 'signals',
        workspaceId: classroomId,
        capabilityKey: 'core.insights',
        ownerPackage: 'classroom',
        defaultZone: 'today',
        defaultOrder: 2,
        title: 'Growth Signals',
      },
    ],
    [classroomId],
  );

  const renderSurfaceContent = (surface: any) => {
    switch (surface.surfaceId) {
      case 'subject':
        return (
          <VStack className="gap-1">
            <Text
              className="text-lg font-black text-phase-text-primary capitalize"
              numberOfLines={1}
            >
              {classroom?.subject || 'Classroom'}
            </Text>
            <Text className="text-xs text-phase-text-tertiary">Primary Domain</Text>
          </VStack>
        );
      case 'lane':
        return (
          <VStack className="gap-1">
            <Text
              className="text-lg font-black"
              style={{ color: activeTone.color }}
              numberOfLines={1}
            >
              {activeTone.label}
            </Text>
            <Text className="text-xs text-phase-text-tertiary">Current Focus</Text>
          </VStack>
        );
      case 'signals':
        return (
          <VStack className="gap-1">
            <Text className="text-lg font-black text-phase-text-primary" numberOfLines={1}>
              {workspace.summary.assignmentCount} tasks · {workspace.summary.observationCount} notes
            </Text>
            <Text className="text-xs text-phase-text-tertiary">Class Pulse</Text>
          </VStack>
        );
      default:
        return null;
    }
  };

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
      const maxOrder = lessons.reduce(
        (max: number, l: { order_index?: number | null }) => Math.max(max, l.order_index ?? 0),
        0,
      );

      await api.lessons.create({
        classroom_id: classroomId,
        title: newMonthTitle,
        order_index: maxOrder + 1,
      });
      setShowAddMonthModal(false);
      setNewMonthTitle('');
      setRefreshTrigger((prev) => prev + 1);
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

      if (
        !targetLessonId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ) {
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
          due_date: formDueDate ? new Date(formDueDate) : undefined,
        });
      }
      setShowAddContentModal(false);
      resetForm();
      setRefreshTrigger((prev) => prev + 1);
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
    icon: <Icon as={Plus} size={24} color="#FFF" />,
    visible: activeFeature === 'lessons',
  });

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'insights':
        return <ClassroomHolisticInsights classroomId={classroomId} />;
      case 'notes':
        return <ClassroomNotes classroomId={classroomId} isTeacher={can('manage', 'Classroom')} />;
      case 'students':
        return (
          <VStack className="flex-1 mt-4">
            <Box className="px-4">
              <Box className="p-6 bg-phase-surface-secondary rounded-[24px] border border-phase-border/40 shadow-sm">
                <HStack className="items-center justify-between gap-4">
                  <VStack className="flex-1">
                    <Heading className="text-xl font-black text-phase-text-primary">
                      Classroom Roster
                    </Heading>
                    <Text className="text-sm text-phase-text-secondary mt-1 font-medium italic">
                      Student management, direct edits, and group composition sitting together.
                    </Text>
                  </VStack>
                  <Pressable
                    onPress={() => {
                      hapticLight();
                      setShowGroupsModal(true);
                    }}
                    className="bg-phase-surface px-5 py-2.5 rounded-full border border-phase-border/40 shadow-sm active:scale-95 transition-all"
                  >
                    <HStack className="items-center gap-2">
                      <Icon as={Layers} size="xs" className="text-phase-text-primary" />
                      <Text className="text-xs font-black text-phase-text-primary uppercase tracking-wider">
                        Groups
                      </Text>
                    </HStack>
                  </Pressable>
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
        return (
          <TeacherAssignmentsWorkspace
            classroomId={classroomId}
            canManage={can('create', 'Assignment')}
          />
        );
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
        return (
          <ResourcesView
            classroomId={classroomId}
            isTeacher={can('update', 'ClassroomResource') || can('manage', 'Classroom')}
          />
        );
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
        return (
          <Box className="mt-4">
            <ClassroomLegacyTimeline classroomId={classroomId} />
          </Box>
        );
      default:
        return null;
    }
  };

  if (workspace.isLoading) {
    return (
      <ScreenWrapper>
        <GlobalHeader title={classroomName} showBack onBack={() => safeBack('/workspace')} />
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

  const { activeConflicts, resolveConflict } = useConflictStore();
  const { removeFromQueue } = useMutationQueue();

  const handleConflictResolution = (conflictId: string, decision: 'local' | 'remote') => {
    if (decision === 'remote') {
      // Accept server state: Just remove from local queue
      removeFromQueue(conflictId);
    } else {
      // Keep mine: Re-queue with forced override (or updated timestamp)
      // For now, we'll just remove and let the user re-trigger or wait
      removeFromQueue(conflictId);
    }
    resolveConflict(conflictId, decision === 'remote' ? 'remote_wins' : 'local_wins');
  };

  const canvasLayout: WorkspaceLayout<string> = workspace.layout
    ? {
        workspaceId: workspace.layout.workspace_id,
        userId: workspace.layout.user_id,
        order: workspace.layout.order,
        hidden: workspace.layout.hidden,
        pinned: workspace.layout.pinned,
        zoneBySurface: workspace.layout.zone_by_surface as Partial<Record<string, WorkspaceZoneId>>,
        updatedAt: workspace.layout.updated_at,
      }
    : {
        workspaceId: classroomId,
        userId: currentUserId,
        order: dashboardSurfaces.map((s) => s.surfaceId),
        hidden: [],
        pinned: [],
        zoneBySurface: dashboardSurfaces.reduce<Partial<Record<string, WorkspaceZoneId>>>(
          (acc, s) => ({ ...acc, [s.surfaceId]: s.defaultZone }),
          {},
        ),
        updatedAt: new Date().toISOString(),
      };

  return (
    <ScreenWrapper scroll={false}>
      <GlobalHeader
        title={classroomName}
        subtitle={classroom?.subject || 'Classroom'}
        showBack
        onBack={() => safeBack('/workspace')}
      />
      <ScrollView
        stickyHeaderIndices={[2]}
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
        className="bg-phase-surface"
      >
        {activeConflicts.length > 0 && (
          <Box className="px-2 pt-4">
            {activeConflicts.map((conflict) => (
              <ConflictResolver
                key={conflict.id}
                conflict={conflict}
                onResolve={(decision) => handleConflictResolution(conflict.id, decision)}
              />
            ))}
          </Box>
        )}
        <Box className="p-6 bg-phase-surface">
          <VStack className="gap-2">
            <Text className="text-[12px] text-phase-text-tertiary font-black uppercase tracking-[0.2em] mb-1">
              Teacher Sanctuary
            </Text>
            <HStack className="justify-between items-start gap-4">
              <Heading className="text-4xl font-black text-templeGold leading-tight flex-1">
                {classroomName}
              </Heading>
              {activeFeature === 'lessons' && (
                <Pressable
                  onPress={() => {
                    hapticLight();
                    setShowAddMonthModal(true);
                  }}
                  className="bg-sanctuarySaffron px-5 py-2.5 rounded-full shadow-lg shadow-sanctuarySaffron/20 active:scale-95 transition-all"
                >
                  <HStack className="items-center gap-2">
                    <Icon as={Plus} size="sm" className="text-sanctuary-ink" />
                    <Text className="text-xs font-black text-sanctuary-ink uppercase tracking-wider">
                      New Module
                    </Text>
                  </HStack>
                </Pressable>
              )}
            </HStack>
            <Text className="text-base text-phase-text-secondary mt-2 font-medium">
              Hold the classroom as one living workspace: roster, rhythm, assignments, and deep
              insight.
            </Text>
          </VStack>
        </Box>

        <Box className="bg-phase-surface px-6 pb-2 shadow-sm z-10" style={{ minHeight: 180 }}>
          <ResponsiveWorkspaceCanvas
            surfaces={dashboardSurfaces}
            layout={canvasLayout}
            renderSurfaceContent={renderSurfaceContent}
            getSurfaceTitle={(s) => s.title || ''}
            getSurfaceSubtitle={(_s) => FEATURE_TONES[activeFeature].label}
            onReorder={(id, newIndex) => {
              // Calculate new order and save to Sovereign state
              const currentOrder =
                workspace.layout?.order || dashboardSurfaces.map((s) => s.surfaceId);
              const oldIndex = currentOrder.indexOf(id);
              if (oldIndex !== -1) {
                const newOrder = [...currentOrder];
                newOrder.splice(oldIndex, 1);
                newOrder.splice(newIndex, 0, id);
                workspace.updateLayout(newOrder);
              }
            }}
          />
        </Box>

        <Box className="bg-phase-surface-secondary/50 border-y border-phase-border/40 px-6 py-6 sticky z-10">
          <HStack className="items-center justify-between gap-6">
            <VStack className="flex-1">
              <Text className="text-[10px] text-phase-text-tertiary uppercase font-black tracking-widest mb-1">
                Student Pulse
              </Text>
              <Text className="text-xs text-phase-text-secondary font-medium leading-relaxed">
                Move between roster and attendance report to follow classroom rhythm.
              </Text>
              {!!workspace.workspaceError && (
                <Text className="text-[10px] text-emberRed font-bold mt-2">
                  {workspace.workspaceError.message}
                </Text>
              )}
            </VStack>
            <HStack className="gap-3">
              <PredictiveButton
                label="Roster"
                onPress={() => {
                  setActiveFeature('students');
                }}
                onHoverStart={() => {
                  console.log('[Predictive] Pre-fetching student roster...');
                  workspace.refreshStudents();
                }}
                className="border border-phase-text-primary bg-transparent"
              />
              <PredictiveButton
                label="Report"
                onPress={() => {
                  setActiveView('attendance_report');
                }}
                onHoverStart={() => {
                  console.log('[Predictive] Pre-fetching attendance report...');
                  // Trigger report data pre-fetch here
                }}
                className="bg-sanctuarySaffron"
              />
            </HStack>
          </HStack>
        </Box>

        <Box
          className="bg-phase-surface py-5 border-b border-phase-border/40"
          style={{ height: 110 }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-6"
          >
            <HStack className="gap-3">
              {TEACHER_FEATURES.map((f) => {
                const isActive = activeFeature === f.id;
                const tone = FEATURE_TONES[f.id];
                return (
                  <Pressable
                    key={f.id}
                    onPress={() => {
                      hapticLight();
                      setActiveFeature(f.id);
                    }}
                    className={`items-center justify-center px-6 py-4 rounded-[24px] min-w-[110px] gap-2 border shadow-sm transition-all duration-300 ${
                      isActive ? '' : 'bg-phase-surface-secondary border-phase-border/40'
                    }`}
                    style={[
                      { height: 75 },
                      isActive
                        ? {
                            backgroundColor: tone.color,
                            borderColor: tone.color,
                            shadowColor: tone.color,
                            shadowOpacity: 0.2,
                            shadowRadius: 10,
                            elevation: 4,
                            transform: [{ scale: 1.05 }],
                          }
                        : {},
                    ]}
                  >
                    <Icon
                      as={f.icon}
                      size="sm"
                      className={isActive ? 'text-sanctuary-ink' : 'text-phase-text-secondary'}
                      style={isActive ? { color: Theme.colors.sanctuaryInk } : {}}
                    />
                    <Text
                      className={`text-[11px] uppercase tracking-widest font-black ${
                        isActive ? 'text-sanctuary-ink' : 'text-phase-text-secondary'
                      }`}
                      style={isActive ? { color: Theme.colors.sanctuaryInk } : {}}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </HStack>
          </ScrollView>
        </Box>

        <Box className="flex-1 px-2">{renderFeatureContent()}</Box>
      </ScrollView>
      {/* Modals */}
      <SanctuaryModal
        isOpen={showAddMonthModal}
        onClose={() => setShowAddMonthModal(false)}
        title="Add Monthly Module"
      >
        <VStack className="gap-6 mt-4">
          <Text className="text-sm text-phase-text-secondary font-medium">
            Give this month a title (e.g., "September 2026")
          </Text>
          <Box className="bg-phase-surface-secondary rounded-[16px] p-1 border border-phase-border/40">
            <Input className="border-0">
              <InputField
                placeholder="Enter title..."
                value={newMonthTitle}
                onChangeText={setNewMonthTitle}
                className="text-phase-text-primary h-12"
              />
            </Input>
          </Box>
          <HStack className="gap-4 justify-end mt-4">
            <Pressable
              onPress={() => setShowAddMonthModal(false)}
              className="px-6 py-3 rounded-full border border-phase-border/40 active:bg-phase-surface transition-all"
            >
              <Text className="text-xs font-black text-phase-text-tertiary uppercase tracking-wider">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleAddMonth}
              disabled={!newMonthTitle.trim() || isSubmitting}
              className={`px-8 py-3 rounded-full shadow-lg transition-all ${
                !newMonthTitle.trim() || isSubmitting
                  ? 'bg-phase-border/40'
                  : 'bg-sanctuarySaffron shadow-sanctuarySaffron/20'
              }`}
            >
              {isSubmitting ? (
                <Spinner color={Theme.colors.sanctuaryInk} />
              ) : (
                <Text className="text-xs font-black text-sanctuary-ink uppercase tracking-wider">
                  Create
                </Text>
              )}
            </Pressable>
          </HStack>
        </VStack>
      </SanctuaryModal>

      <SanctuaryModal
        isOpen={showAddContentModal}
        onClose={() => {
          setShowAddContentModal(false);
          resetForm();
        }}
        title={contentType === 'material' ? 'Add Academic Material' : 'Create Assignment'}
      >
        <VStack className="gap-6 mt-4">
          {contentType === 'material' && (
            <HStack className="gap-3">
              {(['note', 'link', 'pdf'] as const).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => {
                    hapticLight();
                    setFormType(type);
                  }}
                  className={`flex-1 py-3 rounded-[12px] items-center border transition-all ${
                    formType === type
                      ? 'bg-templeGold border-templeGold'
                      : 'bg-phase-surface-secondary border-phase-border/40'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      formType === type ? 'text-sanctuary-ink' : 'text-phase-text-secondary'
                    }`}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          )}

          <VStack className="gap-4">
            <Box className="bg-phase-surface-secondary rounded-[16px] p-1 border border-phase-border/40">
              <Input className="border-0">
                <InputField
                  placeholder="Title"
                  value={formTitle}
                  onChangeText={setFormTitle}
                  className="text-phase-text-primary h-12"
                />
              </Input>
            </Box>

            {(contentType === 'assignment' || formType === 'note') && (
              <Box className="bg-phase-surface-secondary rounded-[16px] p-1 border border-phase-border/40">
                <Input className="border-0 min-h-[100px]">
                  <InputField
                    placeholder="Description"
                    value={formDescription}
                    onChangeText={setFormDescription}
                    className="text-phase-text-primary p-3"
                    multiline
                  />
                </Input>
              </Box>
            )}

            {contentType === 'material' && (formType === 'pdf' || formType === 'link') && (
              <Box className="bg-phase-surface-secondary rounded-[16px] p-1 border border-phase-border/40">
                <Input className="border-0">
                  <InputField
                    placeholder="URL"
                    value={formUrl}
                    onChangeText={setFormUrl}
                    className="text-phase-text-primary h-12"
                    autoCapitalize="none"
                  />
                </Input>
              </Box>
            )}

            {contentType === 'assignment' && (
              <Box className="bg-phase-surface-secondary rounded-[16px] p-1 border border-phase-border/40">
                <Input className="border-0">
                  <InputField
                    placeholder="Due Date (YYYY-MM-DD)"
                    value={formDueDate}
                    onChangeText={setFormDueDate}
                    className="text-phase-text-primary h-12"
                  />
                </Input>
              </Box>
            )}
          </VStack>

          <HStack className="gap-4 justify-end mt-4">
            <Pressable
              onPress={() => {
                setShowAddContentModal(false);
                resetForm();
              }}
              className="px-6 py-3 rounded-full border border-phase-border/40 active:bg-phase-surface transition-all"
            >
              <Text className="text-xs font-black text-phase-text-tertiary uppercase tracking-wider">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleAddContent}
              disabled={!formTitle.trim() || isSubmitting}
              className={`px-8 py-3 rounded-full shadow-lg transition-all ${
                !formTitle.trim() || isSubmitting
                  ? 'bg-phase-border/40'
                  : 'bg-sanctuarySaffron shadow-sanctuarySaffron/20'
              }`}
            >
              {isSubmitting ? (
                <Spinner color={Theme.colors.sanctuaryInk} />
              ) : (
                <Text className="text-xs font-black text-sanctuary-ink uppercase tracking-wider">
                  Add
                </Text>
              )}
            </Pressable>
          </HStack>
        </VStack>
      </SanctuaryModal>
      {showAnalysisModal && analysisStudent && (
        <StudentAnalysisModal
          visible={showAnalysisModal}
          onClose={() => {
            setShowAnalysisModal(false);
            setAnalysisStudent(null);
          }}
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
