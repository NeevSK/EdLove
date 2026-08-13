import { api } from '@repo/core/api/client';
import type { Student } from '@repo/core/types';

import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { MessageCircle, Plus, Sparkles, Trash2, TriangleAlert } from '@repo/ui/icons';
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

import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface TeacherObservationsWorkspaceProps {
  classroomId: string;
  userId?: string;
  students: Student[];
  canManage: boolean;
}

const OBSERVATION_TYPES = ['positive', 'growth', 'neutral', 'concern'] as const;

export default function TeacherObservationsWorkspace({
  classroomId,
  userId,
  students,
  canManage,
}: TeacherObservationsWorkspaceProps) {
  const [observations, setObservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [content, setContent] = useState('');
  const [observationType, setObservationType] =
    useState<(typeof OBSERVATION_TYPES)[number]>('neutral');
  const [visibility, setVisibility] = useState<'private' | 'student_visible'>('private');
  const [isSaving, setIsSaving] = useState(false);

  const loadObservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.teacherInsights.listStudentObservations(classroomId);
      setObservations(data || []);
    } catch (error) {
      console.error('Failed to load observations', error);
    } finally {
      setIsLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    loadObservations();
  }, [loadObservations]);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [selectedStudentId, students],
  );

  const positiveCount = observations.filter((item) => item.observation_type === 'positive').length;
  const concernCount = observations.filter((item) => item.observation_type === 'concern').length;

  const handleCreate = async () => {
    if (!content.trim() || !selectedStudent || !userId) return;
    setIsSaving(true);
    try {
      await api.teacherInsights.createStudentObservation({
        classroom_id: classroomId,
        student_id: (selectedStudent as Student).id,
        classroom_student_id: (selectedStudent as any).classroom_student_id || '',
        content: content.trim(),
        observation_type: observationType,
        visibility,
      });
      setContent('');
      setSelectedStudentId('');
      setObservationType('neutral');
      setVisibility('private');
      setShowCreateModal(false);
      await loadObservations();
    } catch (error) {
      console.error('Failed to create observation', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.studentObservations.delete(id);
      setObservations((prev) => prev.filter((observation) => observation.id !== id));
    } catch (error) {
      console.error('Failed to delete observation', error);
    }
  };

  return (
    <Box className="flex-1">
      <VStack className="gap-8 p-6">
        <Box className="bg-phase-surface-secondary rounded-[32px] border border-phase-border/40 p-8 shadow-sm">
          <VStack className="gap-8">
            <HStack className="items-start justify-between gap-6 flex-wrap">
              <VStack className="flex-1 min-w-[240px] gap-3">
                <Text className="text-phase-text-tertiary text-[10px] font-black uppercase tracking-[0.3em]">
                  Observations
                </Text>
                <Heading className="text-4xl text-phase-text-primary font-black tracking-tight leading-tight">
                  Track classroom noticing, not just incidents
                </Heading>
                <Text className="text-phase-text-secondary text-base leading-relaxed font-medium mt-2 max-w-xl">
                  Keep small signals close to the classroom rhythm, so growth and concern stay
                  visible before they become reports.
                </Text>
              </VStack>
              {canManage && (
                <Pressable
                  onPress={() => {
                    hapticLight();
                    setShowCreateModal(true);
                  }}
                  className="bg-sanctuarySaffron px-8 py-3.5 rounded-full shadow-lg shadow-sanctuarySaffron/20 active:scale-95 transition-all"
                >
                  <HStack className="items-center gap-2.5">
                    <Icon as={Plus} size="sm" className="text-sanctuary-ink" />
                    <Text className="text-xs font-black text-sanctuary-ink uppercase tracking-widest">
                      New
                    </Text>
                  </HStack>
                </Pressable>
              )}
            </HStack>
            <HStack className="gap-4 flex-wrap">
              <SignalPill
                icon={<Icon as={MessageCircle} size="sm" className="text-gurudeviBlue" />}
                label="Total"
                value={String(observations.length)}
              />
              <SignalPill
                icon={<Icon as={Sparkles} size="sm" className="text-sageGreen" />}
                label="Positive"
                value={String(positiveCount)}
              />
              <SignalPill
                icon={<Icon as={TriangleAlert} size="sm" className="text-chestnutRed" />}
                label="Concerns"
                value={String(concernCount)}
              />
            </HStack>
          </VStack>
        </Box>

        {isLoading ? (
          <Box className="py-20 items-center">
            <Spinner className="text-sanctuarySaffron" />
          </Box>
        ) : observations.length === 0 ? (
          <Box className="bg-phase-surface-secondary/40 rounded-[32px] border border-phase-border/40 p-12 items-center gap-6">
            <Box className="w-20 h-20 bg-phase-surface rounded-full items-center justify-center border border-phase-border shadow-sm">
              <Icon as={MessageCircle} size="md" className="text-phase-text-tertiary" />
            </Box>
            <VStack className="items-center gap-2">
              <Heading className="text-xl text-phase-text-primary font-black tracking-tight uppercase">
                No observations yet
              </Heading>
              <Text className="text-phase-text-secondary text-center text-sm leading-relaxed max-w-xs font-medium">
                Start with one true observation from today. The goal is signal, not volume.
              </Text>
            </VStack>
          </Box>
        ) : (
          observations.map((observation) => (
            <Box
              key={observation.id}
              className={`bg-phase-surface-secondary rounded-[32px] border border-phase-border/40 p-8 border-l-[8px] shadow-sm ${
                observation.observation_type === 'concern'
                  ? 'border-l-chestnutRed'
                  : observation.observation_type === 'positive'
                    ? 'border-l-sageGreen'
                    : 'border-l-gurudeviBlue'
              }`}
            >
              <VStack className="gap-4">
                <HStack className="items-center justify-between gap-6">
                  <VStack className="flex-1 gap-1">
                    <Text className="text-2xl text-phase-text-primary font-black tracking-tight">
                      {(students as any[]).find((student) => student.id === observation.student_id)
                        ?.full_name || 'Student observation'}
                    </Text>
                    <Text className="text-phase-text-tertiary text-[10px] font-black uppercase tracking-widest mt-1">
                      {observation.observation_type} •{' '}
                      {observation.visibility === 'student_visible'
                        ? 'Visible to student'
                        : 'Private'}
                    </Text>
                  </VStack>
                  {canManage && (
                    <Pressable
                      onPress={() => handleDelete(observation.id)}
                      className="w-10 h-10 items-center justify-center bg-phase-surface rounded-full border border-phase-border/40 active:bg-phase-surface-secondary shadow-sm transition-all"
                    >
                      <Icon as={Trash2} size="xs" className="text-chestnutRed" />
                    </Pressable>
                  )}
                </HStack>
                <Text className="text-phase-text-secondary text-base font-medium leading-relaxed mt-1">
                  {observation.content}
                </Text>
                <Box className="mt-4 pt-4 border-t border-phase-border/10">
                  <Text className="text-phase-text-tertiary text-[10px] font-black uppercase tracking-widest">
                    {observation.created_at
                      ? new Date(observation.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Just now'}
                  </Text>
                </Box>
              </VStack>
            </Box>
          ))
        )}
      </VStack>

      <SanctuaryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create observation"
      >
        <VStack className="gap-7 mt-4">
          <VStack className="gap-3">
            <Text className="text-[10px] font-black uppercase text-phase-text-tertiary ml-1 tracking-widest">
              Student
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack className="gap-2.5 p-0.5">
                {students.map((student: any) => {
                  const isActive = selectedStudentId === student.id;
                  return (
                    <Pressable key={student.id} onPress={() => setSelectedStudentId(student.id)}>
                      <Box
                        className={`px-6 py-3 rounded-full border transition-all ${
                          isActive
                            ? 'border-sanctuarySaffron bg-sanctuarySaffron'
                            : 'border-phase-border/40 bg-phase-surface-secondary'
                        }`}
                      >
                        <Text
                          className={`text-xs font-black uppercase tracking-tight ${isActive ? 'text-sanctuary-ink' : 'text-phase-text-primary'}`}
                        >
                          {student.full_name}
                        </Text>
                      </Box>
                    </Pressable>
                  );
                })}
              </HStack>
            </ScrollView>
          </VStack>

          <VStack className="gap-3">
            <Text className="text-[10px] font-black uppercase text-phase-text-tertiary ml-1 tracking-widest">
              Observation type
            </Text>
            <HStack className="gap-2.5 flex-wrap">
              {OBSERVATION_TYPES.map((type) => {
                const isActive = observationType === type;
                const activeColor =
                  type === 'positive'
                    ? 'bg-sageGreen'
                    : type === 'concern'
                      ? 'bg-chestnutRed'
                      : 'bg-gurudeviBlue';
                const activeBorder =
                  type === 'positive'
                    ? 'border-sageGreen'
                    : type === 'concern'
                      ? 'border-chestnutRed'
                      : 'border-gurudeviBlue';

                return (
                  <Pressable key={type} onPress={() => setObservationType(type)}>
                    <Box
                      className={`px-6 py-3 rounded-full border transition-all ${
                        isActive
                          ? `${activeBorder} ${activeColor}`
                          : 'border-phase-border/40 bg-phase-surface-secondary'
                      }`}
                    >
                      <Text
                        className={`capitalize text-xs font-black tracking-tight ${isActive ? 'text-sacredWhite' : 'text-phase-text-primary'}`}
                      >
                        {type}
                      </Text>
                    </Box>
                  </Pressable>
                );
              })}
            </HStack>
          </VStack>

          <VStack className="gap-3">
            <Text className="text-[10px] font-black uppercase text-phase-text-tertiary ml-1 tracking-widest">
              Visibility
            </Text>
            <HStack className="gap-3">
              {(['private', 'student_visible'] as const).map((option) => {
                const isActive = visibility === option;
                return (
                  <Pressable key={option} onPress={() => setVisibility(option)} className="flex-1">
                    <Box
                      className={`px-6 py-3 rounded-full border items-center transition-all ${
                        isActive
                          ? 'border-sageGreen bg-sageGreen'
                          : 'border-phase-border/40 bg-phase-surface-secondary'
                      }`}
                    >
                      <Text
                        className={`text-xs font-black tracking-tight ${isActive ? 'text-sacredWhite' : 'text-phase-text-primary'}`}
                      >
                        {option === 'student_visible' ? 'Visible to student' : 'Private'}
                      </Text>
                    </Box>
                  </Pressable>
                );
              })}
            </HStack>
          </VStack>

          <VStack className="gap-3">
            <Text className="text-[10px] font-black uppercase text-phase-text-tertiary ml-1 tracking-widest">
              Observation
            </Text>
            <Box className="bg-phase-surface-secondary rounded-[24px] p-1 border border-phase-border/40">
              <Input className="border-0 min-h-[140px]">
                <InputField
                  placeholder="What did you notice?"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  className="text-phase-text-primary p-4 font-medium"
                />
              </Input>
            </Box>
          </VStack>

          <HStack className="gap-4 justify-end mt-4">
            <Pressable
              onPress={() => setShowCreateModal(false)}
              className="px-8 py-3.5 rounded-full border border-phase-border active:bg-phase-surface transition-all"
            >
              <Text className="text-xs font-black text-phase-text-tertiary uppercase tracking-widest">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCreate}
              disabled={!content.trim() || !selectedStudent || !userId || isSaving}
              className={`px-10 py-3.5 rounded-full shadow-lg transition-all ${
                !content.trim() || !selectedStudent || !userId || isSaving
                  ? 'bg-phase-border/40'
                  : 'bg-sanctuarySaffron shadow-sanctuarySaffron/20'
              }`}
            >
              {isSaving ? (
                <Spinner color={Theme.colors.sanctuaryInk} />
              ) : (
                <Text className="text-xs font-black text-sanctuary-ink uppercase tracking-widest">
                  Save
                </Text>
              )}
            </Pressable>
          </HStack>
        </VStack>
      </SanctuaryModal>
    </Box>
  );
}

function SignalPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box className="flex-1 min-w-[100px] bg-phase-surface border border-phase-border/40 rounded-[24px] p-6 shadow-sm">
      <VStack className="gap-3">
        <HStack className="items-center gap-2">
          <Box className="w-10 h-10 rounded-xl bg-phase-surface-secondary items-center justify-center border border-phase-border/20">
            {icon}
          </Box>
          <Text className="text-phase-text-tertiary text-[10px] font-black uppercase tracking-[0.25em]">
            {label}
          </Text>
        </HStack>
        <Text className="text-phase-text-primary font-black text-3xl tracking-tighter">
          {value}
        </Text>
      </VStack>
    </Box>
  );
}
