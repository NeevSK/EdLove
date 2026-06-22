import { classroomGroupsAPI } from '@repo/core/api';

import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { useLotusToast } from '@repo/ui/hooks';
import { Check, Layers, Plus, SquarePen, Trash2, User } from '@repo/ui/icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { useCallback, useEffect, useState } from 'react';

interface TeacherGroupsModalProps {
  classroomId: string;
  isOpen: boolean;
  onClose: () => void;
  students: Array<{ id: string; full_name: string }>;
}

type ClassroomGroup = Awaited<ReturnType<typeof classroomGroupsAPI.getAll>>[number];

const GROUP_ACCENTS = [
  'bg-sanctuarySaffron',
  'bg-gurudeviBlue',
  'bg-sageGreen',
  'bg-chestnutRed',
  'bg-amberGlow',
];

export default function TeacherGroupsModal({
  classroomId,
  isOpen,
  onClose,
  students,
}: TeacherGroupsModalProps) {
  const { showToast } = useLotusToast();
  const [groups, setGroups] = useState<ClassroomGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await classroomGroupsAPI.getAll(classroomId);
      setGroups(data || []);
    } catch (error) {
      console.error('Failed to load classroom groups', error);
      showToast({ message: 'Could not load classroom groups.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [classroomId, showToast]);

  useEffect(() => {
    if (isOpen) {
      loadGroups();
    }
  }, [isOpen, loadGroups]);

  const resetEditor = () => {
    setEditingGroupId(null);
    setName('');
    setDescription('');
    setSelectedStudentIds([]);
  };

  const toggleStudent = (studentId: string) => {
    hapticLight();
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const startEditing = (group: ClassroomGroup) => {
    hapticLight();
    setEditingGroupId(group.id);
    setName(group.name);
    setDescription(group.description || '');
    setSelectedStudentIds(group.student_ids || []);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      if (editingGroupId) {
        await classroomGroupsAPI.update(editingGroupId, {
          name: name.trim(),
          description: description.trim() || null,
          student_ids: selectedStudentIds,
        });
      } else {
        await classroomGroupsAPI.create(classroomId, {
          name: name.trim(),
          description: description.trim() || null,
          student_ids: selectedStudentIds,
          color: '#F6BF8C', // Default saffron accent
        });
      }
      resetEditor();
      await loadGroups();
      showToast({ message: 'Classroom group saved.', type: 'success' });
    } catch (error) {
      console.error('Failed to save classroom group', error);
      showToast({ message: 'Could not save classroom group.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    hapticLight();
    try {
      await classroomGroupsAPI.delete(groupId);
      if (editingGroupId === groupId) {
        resetEditor();
      }
      await loadGroups();
      showToast({ message: 'Group deleted.', type: 'info' });
    } catch (error) {
      console.error('Failed to delete classroom group', error);
      showToast({
        message: 'Could not delete classroom group.',
        type: 'error',
      });
    }
  };

  const footer = (
    <HStack className="w-full gap-4 px-2 pb-2">
      <Pressable
        onPress={onClose}
        className="flex-1 rounded-full border border-phase-border h-14 items-center justify-center active:bg-phase-surface-secondary transition-all"
      >
        <Text className="text-phase-text-tertiary font-black uppercase text-xs tracking-widest">
          Close
        </Text>
      </Pressable>
      <Pressable
        onPress={() => {
          hapticLight();
          handleSave();
        }}
        disabled={!name.trim() || isSaving}
        className={`flex-1 rounded-full h-14 items-center justify-center shadow-lg transition-all ${
          !name.trim() || isSaving
            ? 'bg-phase-border/40'
            : 'bg-sanctuarySaffron shadow-sanctuarySaffron/20'
        }`}
      >
        <Text className="text-sanctuary-ink font-black uppercase text-xs tracking-widest">
          {editingGroupId ? 'Update Group' : 'Save Group'}
        </Text>
      </Pressable>
    </HStack>
  );

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title="Classroom Groups"
      footer={footer}
      className="max-w-[840px]"
    >
      <VStack className="gap-8 p-1">
        <Text className="text-base leading-relaxed text-phase-text-secondary font-medium mt-2 max-w-2xl">
          Build real student groupings without leaving the classroom surface. These groups stay
          synchronized across all teaching tools.
        </Text>

        <HStack className="items-start gap-12">
          {/* Left Column: Existing Groups */}
          <VStack className="flex-1 gap-6">
            <HStack className="items-center justify-between">
              <Heading className="text-[10px] text-phase-text-tertiary font-black uppercase tracking-[0.25em]">
                Existing Groups
              </Heading>
              <Pressable
                onPress={() => {
                  hapticLight();
                  resetEditor();
                }}
                className="active:scale-95 transition-all py-2 px-5 bg-phase-surface border border-phase-border/40 rounded-full shadow-sm"
              >
                <HStack className="items-center gap-2">
                  <Icon as={Plus} size="xs" className="text-sanctuarySaffron" />
                  <Text className="text-[10px] font-black text-phase-text-primary uppercase tracking-widest">
                    New
                  </Text>
                </HStack>
              </Pressable>
            </HStack>

            <ScrollView className="max-h-[500px]" showsVerticalScrollIndicator={false}>
              <VStack className="gap-4 pr-2">
                {isLoading ? (
                  <VStack className="gap-4">
                    {[1, 2, 3].map((i) => (
                      <Box
                        key={i}
                        className="h-32 bg-phase-surface-secondary rounded-[32px] border border-phase-border/20 animate-pulse"
                      />
                    ))}
                  </VStack>
                ) : groups.length === 0 ? (
                  <Box className="items-center justify-center rounded-[40px] border border-dashed border-phase-border bg-phase-surface-secondary/20 p-16 gap-6">
                    <Icon as={Layers} size="lg" className="text-phase-text-tertiary opacity-30" />
                    <Text className="text-sm text-phase-text-tertiary text-center font-medium leading-relaxed max-w-[240px]">
                      No classroom groups yet. Create one to organize your teaching.
                    </Text>
                  </Box>
                ) : (
                  groups.map((group, idx) => (
                    <Box
                      key={group.id}
                      className={`rounded-[32px] border border-phase-border/40 bg-phase-surface-secondary p-7 relative overflow-hidden shadow-sm`}
                    >
                      <Box
                        className={`absolute left-0 top-0 bottom-0 w-2 ${GROUP_ACCENTS[idx % GROUP_ACCENTS.length]}`}
                      />
                      <VStack className="gap-5">
                        <HStack className="items-start justify-between">
                          <VStack className="flex-1 gap-1">
                            <Text className="text-xl font-black text-phase-text-primary tracking-tight">
                              {group.name}
                            </Text>
                            <Text className="text-[10px] font-black text-phase-text-tertiary uppercase tracking-widest mt-1">
                              {(group.student_ids || []).length} members
                            </Text>
                          </VStack>
                          <HStack className="gap-3">
                            <Pressable
                              onPress={() => startEditing(group)}
                              className="w-10 h-10 items-center justify-center rounded-full bg-phase-surface border border-phase-border/40 shadow-sm active:bg-phase-surface-secondary transition-all"
                            >
                              <Icon as={SquarePen} size="xs" className="text-phase-text-tertiary" />
                            </Pressable>
                            <Pressable
                              onPress={() => handleDelete(group.id)}
                              className="w-10 h-10 items-center justify-center rounded-full bg-phase-surface border border-phase-border/40 shadow-sm active:bg-phase-surface-secondary transition-all"
                            >
                              <Icon as={Trash2} size="xs" className="text-chestnutRed" />
                            </Pressable>
                          </HStack>
                        </HStack>
                        {!!group.description && (
                          <Text className="text-sm text-phase-text-secondary leading-relaxed font-medium italic opacity-80">
                            {group.description}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  ))
                )}
              </VStack>
            </ScrollView>
          </VStack>

          {/* Right Column: Editor */}
          <VStack className="flex-1 gap-8">
            <Heading className="text-[10px] text-phase-text-tertiary font-black uppercase tracking-[0.25em]">
              {editingGroupId ? 'Edit Group' : 'Create Group'}
            </Heading>

            <VStack className="gap-6">
              <VStack className="gap-3">
                <Text className="text-[10px] font-black uppercase text-phase-text-tertiary ml-1 tracking-widest">
                  Name
                </Text>
                <Box className="bg-phase-surface-secondary rounded-[20px] p-1 border border-phase-border/40">
                  <Input className="border-0 h-12">
                    <InputField
                      placeholder="Enter group name"
                      value={name}
                      onChangeText={setName}
                      className="text-sm text-phase-text-primary font-black px-4"
                    />
                  </Input>
                </Box>
              </VStack>

              <VStack className="gap-3">
                <Text className="text-[10px] font-black uppercase text-phase-text-tertiary ml-1 tracking-widest">
                  Description
                </Text>
                <Box className="bg-phase-surface-secondary rounded-[20px] p-1 border border-phase-border/40">
                  <Input className="border-0 min-h-[120px]">
                    <InputField
                      placeholder="What is this group for?"
                      value={description}
                      onChangeText={setDescription}
                      className="text-sm text-phase-text-primary leading-relaxed font-medium p-4"
                      multiline
                    />
                  </Input>
                </Box>
              </VStack>
            </VStack>

            <VStack className="gap-4">
              <Text className="text-[10px] font-black uppercase tracking-[0.25em] text-phase-text-tertiary ml-1">
                Members ({(selectedStudentIds || []).length})
              </Text>
              <ScrollView className="max-h-[350px]" showsVerticalScrollIndicator={false}>
                <VStack className="gap-3 pr-2">
                  {students.map((student) => {
                    const isActive = selectedStudentIds.includes(student.id);
                    return (
                      <Pressable
                        key={student.id}
                        onPress={() => toggleStudent(student.id)}
                        className={`rounded-[24px] border px-6 py-5 shadow-sm transition-all ${
                          isActive
                            ? 'bg-sanctuarySaffron border-sanctuarySaffron'
                            : 'bg-phase-surface-secondary border-phase-border/40'
                        }`}
                      >
                        <HStack className="items-center justify-between">
                          <HStack className="items-center gap-5">
                            <Icon
                              as={User}
                              size="xs"
                              className={
                                isActive ? 'text-sanctuary-ink' : 'text-phase-text-tertiary'
                              }
                            />
                            <Text
                              className={`text-base font-black tracking-tight ${isActive ? 'text-sanctuary-ink' : 'text-phase-text-primary'}`}
                            >
                              {student.full_name}
                            </Text>
                          </HStack>
                          {isActive && <Icon as={Check} size="sm" className="text-sanctuary-ink" />}
                        </HStack>
                      </Pressable>
                    );
                  })}
                </VStack>
              </ScrollView>
            </VStack>
          </VStack>
        </HStack>
      </VStack>
    </SanctuaryModal>
  );
}
