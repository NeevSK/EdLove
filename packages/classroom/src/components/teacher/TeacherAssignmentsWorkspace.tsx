import { assignmentsAPI } from '@repo/core/api';

import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { CalendarDays, ClipboardList, Clock3, Plus, Sparkles } from '@repo/ui/icons';
import { Box, Input } from '@repo/ui/primitives';
import { HStack, Heading, Icon, InputField, Spinner, Text, VStack } from '@repo/ui/primitives';
import { Pressable } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

interface TeacherAssignmentsWorkspaceProps {
  classroomId: string;
  canManage: boolean;
}

export default function TeacherAssignmentsWorkspace({
  classroomId,
  canManage,
}: TeacherAssignmentsWorkspaceProps) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await assignmentsAPI.getAll(classroomId);
      setAssignments(data || []);
    } catch (error) {
      console.error('Failed to load assignments', error);
    } finally {
      setIsLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await assignmentsAPI.create({
        classroom_id: classroomId,
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        max_points: 100,
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setShowCreateModal(false);
      await loadAssignments();
    } catch (error) {
      console.error('Failed to create assignment', error);
    } finally {
      setIsSaving(false);
    }
  };

  const upcomingCount = assignments.filter((assignment) => {
    if (!assignment.due_date) return false;
    return new Date(assignment.due_date).getTime() >= Date.now();
  }).length;

  return (
    <Box className="flex-1">
      <VStack className="gap-8 p-6">
        <Box className="bg-phase-surface-secondary rounded-[32px] border border-phase-border/40 p-8 shadow-sm">
          <VStack className="gap-8">
            <HStack className="items-start justify-between gap-6 flex-wrap">
              <VStack className="flex-1 min-w-[240px] gap-3">
                <Text className="text-phase-text-tertiary text-[10px] font-black uppercase tracking-[0.3em]">
                  Assignment Workspace
                </Text>
                <Heading className="text-4xl text-phase-text-primary font-black tracking-tight leading-tight">
                  Keep assignment momentum visible
                </Heading>
                <Text className="text-phase-text-secondary text-base leading-relaxed font-medium mt-2">
                  See what is active, what is upcoming, and add top-level classroom work without
                  disappearing into lesson structure.
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
                      Create
                    </Text>
                  </HStack>
                </Pressable>
              )}
            </HStack>
            <HStack className="gap-4 flex-wrap">
              <SummaryPill
                icon={<Icon as={ClipboardList} size="sm" className="text-sanctuarySaffron" />}
                label="Total"
                value={String(assignments.length)}
              />
              <SummaryPill
                icon={<Icon as={Clock3} size="sm" className="text-gurudeviBlue" />}
                label="Upcoming"
                value={String(upcomingCount)}
              />
              <SummaryPill
                icon={<Icon as={Sparkles} size="sm" className="text-sageGreen" />}
                label="State"
                value={assignments.length > 0 ? 'Live' : 'Quiet'}
              />
            </HStack>
          </VStack>
        </Box>

        {isLoading ? (
          <Box className="py-20 items-center">
            <Spinner className="text-sanctuarySaffron" />
          </Box>
        ) : assignments.length === 0 ? (
          <Box className="bg-phase-surface-secondary/40 rounded-[32px] border border-phase-border/40 p-12 items-center gap-6">
            <Box className="w-20 h-20 bg-phase-surface rounded-full items-center justify-center border border-phase-border shadow-sm">
              <Icon as={ClipboardList} size="md" className="text-phase-text-tertiary" />
            </Box>
            <VStack className="items-center gap-2">
              <Heading className="text-xl text-phase-text-primary font-black tracking-tight uppercase">
                No assignments yet
              </Heading>
              <Text className="text-phase-text-secondary text-center text-sm leading-relaxed max-w-xs font-medium">
                Create a classroom assignment here, or add one from a monthly lesson lane.
              </Text>
            </VStack>
          </Box>
        ) : (
          assignments.map((assignment) => (
            <Box
              key={assignment.id}
              className="bg-phase-surface-secondary rounded-[32px] border border-phase-border/40 p-8 border-l-[8px] border-l-sanctuarySaffron shadow-sm"
            >
              <VStack className="gap-4">
                <HStack className="items-start justify-between gap-6 flex-wrap">
                  <Heading className="text-2xl text-phase-text-primary font-black tracking-tight flex-1">
                    {assignment.title}
                  </Heading>
                  <Box className="bg-phase-surface border border-phase-border/40 px-4 py-2 rounded-full shadow-sm">
                    <HStack className="items-center gap-2">
                      <Icon as={CalendarDays} size="xs" className="text-gurudeviBlue" />
                      <Text className="text-phase-text-primary text-[10px] tracking-widest uppercase font-black">
                        {assignment.due_date
                          ? new Date(assignment.due_date).toLocaleDateString()
                          : 'No due date'}
                      </Text>
                    </HStack>
                  </Box>
                </HStack>
                {!!assignment.description && (
                  <Text className="text-phase-text-secondary text-base font-medium leading-relaxed mt-1">
                    {assignment.description}
                  </Text>
                )}
                <HStack className="items-center justify-between mt-4 pt-5 border-t border-phase-border/20">
                  <Text className="text-phase-text-tertiary text-[10px] font-black uppercase tracking-widest">
                    Max points: {assignment.max_points ?? 100}
                  </Text>
                  <Box className="bg-sanctuarySaffron/10 px-3 py-1 rounded-full border border-sanctuarySaffron/20">
                    <Text className="text-sanctuarySaffron font-black text-[9px] uppercase tracking-widest italic">
                      Classroom Level
                    </Text>
                  </Box>
                </HStack>
              </VStack>
            </Box>
          ))
        )}
      </VStack>

      <SanctuaryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create assignment"
      >
        <VStack className="gap-6 mt-4">
          <VStack className="gap-2">
            <Text className="text-[10px] font-black uppercase text-phase-text-tertiary ml-1 tracking-widest">
              Title
            </Text>
            <Box className="bg-phase-surface-secondary rounded-[16px] p-1 border border-phase-border/40">
              <Input className="border-0">
                <InputField
                  placeholder="Assignment title"
                  value={title}
                  onChangeText={setTitle}
                  className="text-phase-text-primary h-12 font-bold"
                />
              </Input>
            </Box>
          </VStack>

          <VStack className="gap-2">
            <Text className="text-[10px] font-black uppercase text-phase-text-tertiary ml-1 tracking-widest">
              Description
            </Text>
            <Box className="bg-phase-surface-secondary rounded-[16px] p-1 border border-phase-border/40">
              <Input className="border-0 min-h-[120px]">
                <InputField
                  placeholder="What should students complete?"
                  value={description}
                  onChangeText={setDescription}
                  className="text-phase-text-primary p-3 font-medium"
                  multiline
                />
              </Input>
            </Box>
          </VStack>

          <VStack className="gap-2">
            <Text className="text-[10px] font-black uppercase text-phase-text-tertiary ml-1 tracking-widest">
              Due Date
            </Text>
            <Box className="bg-phase-surface-secondary rounded-[16px] p-1 border border-phase-border/40">
              <Input className="border-0">
                <InputField
                  placeholder="YYYY-MM-DD"
                  value={dueDate}
                  onChangeText={setDueDate}
                  className="text-phase-text-primary h-12 font-bold"
                />
              </Input>
            </Box>
          </VStack>

          <HStack className="gap-4 justify-end mt-4">
            <Pressable
              onPress={() => setShowCreateModal(false)}
              className="px-6 py-3 rounded-full border border-phase-border/40 active:bg-phase-surface transition-all"
            >
              <Text className="text-xs font-black text-phase-text-tertiary uppercase tracking-wider">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                hapticLight();
                handleCreate();
              }}
              disabled={!title.trim() || isSaving}
              className={`px-8 py-3 rounded-full shadow-lg transition-all ${
                !title.trim() || isSaving
                  ? 'bg-phase-border/40'
                  : 'bg-sanctuarySaffron shadow-sanctuarySaffron/20'
              }`}
            >
              {isSaving ? (
                <Spinner color="#111827" />
              ) : (
                <Text className="text-xs font-black text-sanctuary-ink uppercase tracking-wider">
                  Create
                </Text>
              )}
            </Pressable>
          </HStack>
        </VStack>
      </SanctuaryModal>
    </Box>
  );
}

function SummaryPill({
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
