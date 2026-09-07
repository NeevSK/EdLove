/**
 * GroupManager Component
 *
 * Create and manage temporary student groups
 * - Select Multiple checklist for assigning students
 * - Group creation and management
 * - JSON blob stored in local state (or groups table if available)
 */

import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { api, classroomGroupsAPI } from '@repo/core/api/client';
import { Check as CheckIcon, Pen, Plus, Trash2, Users } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
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
import { confirmAction } from '@repo/ui/utils/dialogs';
import { useLotusToast } from '@repo/ui/hooks';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Types
export interface Student {
  id: string;
  full_name: string;
  roll_number?: number;
}

export interface StudentGroup {
  id: string;
  name: string;
  description?: string;
  studentIds: string[];
  createdAt: string;
  color: string;
}

interface GroupManagerProps {
  classroomId: string;
}

// Predefined colors for groups
const GROUP_COLORS = [
  '#F6BF8C', // sanctuarySaffron
  '#8BBF7A', // sageGreen
  '#6A5ACD', // twilightBlue
  '#FFB84D', // amberGlow
  '#DA70D6', // lotusDeepPink
];

export default function GroupManager({ classroomId }: GroupManagerProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { t } = useTranslation();
  const { showToast } = useLotusToast();

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const roster = await api.classroomStudents.getAll(classroomId);
      setStudents(
        roster.map((student: { id: string; full_name?: string | null; roll_number?: string | number | null }) => ({
          id: student.id,
          full_name: student.full_name || 'Unknown Student',
          roll_number: student.roll_number ? Number(student.roll_number) : undefined,
        })),
      );
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [classroomId]);

  const loadGroups = useCallback(async () => {
    try {
      const records = await classroomGroupsAPI.getAll(classroomId);
      setGroups(
        records.map((group) => ({
          id: group.id,
          name: group.name,
          description: group.description ?? undefined,
          studentIds: group.student_ids ?? [],
          createdAt: group.created_at ?? new Date().toISOString(),
          color: group.color ?? GROUP_COLORS[0] ?? '#CCCCCC',
        })),
      );
    } catch (error) {
      console.error('Failed to load classroom groups:', error);
      showToast({ message: 'Groups could not be loaded. Please try again.', type: 'error' });
    }
  }, [classroomId, showToast]);

  useEffect(() => {
    void fetchStudents();
    void loadGroups();
  }, [loadGroups, fetchStudents]);

  const toggleStudentSelection = (studentId: string) => {
    hapticLight();
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const openCreateModal = () => {
    hapticLight();
    setEditingGroup(null);
    setGroupName('');
    setGroupDescription('');
    setSelectedStudentIds([]);
    setShowCreateModal(true);
  };

  const openEditModal = (group: StudentGroup) => {
    hapticLight();
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setSelectedStudentIds(group.studentIds);
    setShowCreateModal(true);
  };

  const saveGroup = async () => {
    hapticLight();

    if (!groupName.trim() || selectedStudentIds.length === 0) {
      return;
    }

    try {
      if (editingGroup) {
        await classroomGroupsAPI.update(editingGroup.id, {
          name: groupName.trim(),
          description: groupDescription.trim() || null,
          student_ids: selectedStudentIds,
        });
      } else {
        await classroomGroupsAPI.create(classroomId, {
          name: groupName.trim(),
          description: groupDescription.trim() || null,
          student_ids: selectedStudentIds,
          color: GROUP_COLORS[groups.length % GROUP_COLORS.length] ?? '#CCCCCC',
        });
      }
      await loadGroups();
      setShowCreateModal(false);
      setEditingGroup(null);
      setGroupName('');
      setGroupDescription('');
      setSelectedStudentIds([]);
      showToast({ message: 'Classroom group saved.', type: 'success' });
    } catch (error) {
      console.error('Failed to save classroom group:', error);
      showToast({ message: 'Group could not be saved. Please try again.', type: 'error' });
    }
  };

  const deleteGroup = async (group: StudentGroup) => {
    const confirmed = await confirmAction(
      'Delete group?',
      `${group.name} will be removed from this device.`,
    );
    if (!confirmed) return;

    hapticLight();
    try {
      await classroomGroupsAPI.delete(group.id);
      await loadGroups();
      showToast({ message: 'Group deleted.', type: 'info' });
    } catch (error) {
      console.error('Failed to delete classroom group:', error);
      showToast({ message: 'Group could not be deleted. Please try again.', type: 'error' });
    }
  };

  const getStudentsByIds = (studentIds: string[]): Student[] => {
    return students.filter((s) => studentIds.includes(s.id));
  };

  const renderGroupCard = (group: StudentGroup) => {
    const groupStudents = getStudentsByIds(group.studentIds);

    return (
      <Box
        key={group.id}
        className="bg-phase-surface-secondary rounded-[24px] p-4 mb-4 border border-phase-border"
        style={{
          borderLeftWidth: 4,
          borderLeftColor: group.color,
        }}
      >
        <VStack className="gap-2">
          <HStack className="items-start justify-between gap-4">
            <HStack className="flex-1 items-center gap-2">
              <Box
                className="w-10 h-10 rounded-full justify-center items-center opacity-90"
                style={{
                  backgroundColor: group.color,
                }}
              >
                <Icon as={Users} color="white" size="sm" />
              </Box>
              <VStack className="flex-1">
                <Text className="text-phase-text-primary text-base font-bold">{group.name}</Text>
                <Text className="text-phase-text-tertiary text-xs">
                  {t('groups.selectedCount', { count: groupStudents.length }) ||
                    `${groupStudents.length} students`}
                </Text>
              </VStack>
            </HStack>

            <HStack className="gap-2">
              <Pressable
                onPress={() => openEditModal(group)}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${group.name}`}
              >
                <Box className="p-2 rounded-xl bg-phase-surface border border-phase-border">
                  <Icon as={Pen} className="text-phase-text-tertiary" size="xs" />
                </Box>
              </Pressable>
              <Pressable
                onPress={() => void deleteGroup(group)}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${group.name}`}
                accessibilityHint="Permanently removes this group after confirmation"
              >
                <Box className="p-2 rounded-xl bg-phase-surface border border-phase-border">
                  <Icon as={Trash2} className="text-sanctuary-error" size="xs" />
                </Box>
              </Pressable>
            </HStack>
          </HStack>

          {group.description && (
            <Text className="text-phase-text-tertiary text-sm">{group.description}</Text>
          )}

          <Box className="bg-phase-surface rounded-xl p-2 border border-phase-border">
            <VStack className="gap-1">
              {groupStudents.map((student, index) => (
                <HStack key={student.id} className="items-center gap-1">
                  <Text className="text-phase-text-tertiary text-xs text-right w-4">
                    {index + 1}.
                  </Text>
                  <Text className="text-phase-text-primary text-xs">{student.full_name}</Text>
                  {student.roll_number && (
                    <Text className="text-phase-text-tertiary text-xs">
                      (#{student.roll_number})
                    </Text>
                  )}
                </HStack>
              ))}
            </VStack>
          </Box>
        </VStack>
      </Box>
    );
  };

  return (
    <Box className="flex-1 bg-phase-surface">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        <VStack className="mb-8 gap-1">
          <Heading className="text-phase-text-primary text-3xl font-black tracking-tighter">
            {t('groups.title') || 'Group Manager'}
          </Heading>
          <Text className="text-phase-text-tertiary text-sm font-medium">
            {t('groups.subtitle') || 'Create temporary student groups for activities'}
          </Text>
        </VStack>

        {isLoading ? (
          <Box className="p-8 items-center">
            <Text className="text-phase-text-tertiary">Loading groups...</Text>
          </Box>
        ) : loadError ? (
          <Box className="p-12 items-center gap-4 bg-phase-surface-secondary rounded-[32px] border border-phase-border">
            <Text className="text-sanctuary-error text-center">
              Students could not be loaded. Please try again.
            </Text>
            <Button variant="outline" onPress={() => void fetchStudents()}>
              <ButtonText>Try again</ButtonText>
            </Button>
          </Box>
        ) : groups.length === 0 ? (
          <Box className="p-12 items-center bg-phase-surface-secondary rounded-[32px] border border-phase-border">
            <Icon as={Users} className="text-phase-text-tertiary" size="xl" />
            <Text className="text-phase-text-tertiary mt-4 text-center font-medium">
              {t('groups.emptyState') ||
                'No groups yet. Tap the + button to create your first group.'}
            </Text>
          </Box>
        ) : (
          <VStack className="gap-4">{groups.map(renderGroupCard)}</VStack>
        )}
      </ScrollView>

      <Pressable
        onPress={openCreateModal}
        className="absolute bottom-10 right-8 w-16 h-16 rounded-full bg-sanctuarySaffron justify-center items-center shadow-lg shadow-sanctuarySaffron/40 active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel="Create student group"
        accessibilityHint="Opens the group creation form"
      >
        <Icon as={Plus} color="white" size="md" />
      </Pressable>

      <SanctuaryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={
          editingGroup
            ? t('groups.editGroup') || 'Edit Group'
            : t('groups.createGroup') || 'Create Group'
        }
        footer={
          <HStack className="gap-3 w-full">
            <Button
              variant="outline"
              onPress={() => setShowCreateModal(false)}
              className="flex-1 h-14 rounded-[24px] border-phase-border bg-phase-surface-secondary active:opacity-70"
            >
              <ButtonText className="text-phase-text-secondary font-bold">Cancel</ButtonText>
            </Button>
            <Button
              onPress={() => void saveGroup()}
              className={`flex-1 h-14 rounded-[24px] shadow-lg active:opacity-90 ${!groupName.trim() || selectedStudentIds.length === 0 ? 'bg-phase-surface-tertiary opacity-50' : 'bg-sanctuarySaffron shadow-sanctuarySaffron/20'}`}
              isDisabled={!groupName.trim() || selectedStudentIds.length === 0}
            >
              <ButtonText className="text-sanctuary-ink font-bold">
                {editingGroup ? 'Update' : 'Initialize'}
              </ButtonText>
            </Button>
          </HStack>
        }
      >
        <VStack className="gap-6">
          <VStack className="gap-2">
            <Text className="text-phase-text-secondary font-bold ml-1">
              {t('groups.nameLabel') || 'Group Name'}
            </Text>
            <Input className="h-16 rounded-[24px] border-phase-border bg-phase-surface shadow-sm">
              <InputField
                placeholder={t('groups.namePlaceholder') || 'e.g., Lab Group A'}
                value={groupName}
                onChangeText={setGroupName}
                className="text-phase-text-primary font-bold"
              />
            </Input>
          </VStack>

          <VStack className="gap-2">
            <Text className="text-phase-text-secondary font-bold ml-1">
              {t('groups.descriptionLabel') || 'Description (Optional)'}
            </Text>
            <Input className="h-16 rounded-[24px] border-phase-border bg-phase-surface shadow-sm">
              <InputField
                placeholder={t('groups.descriptionPlaceholder') || 'e.g., First lab rotation'}
                value={groupDescription}
                onChangeText={setGroupDescription}
                className="text-phase-text-primary font-bold"
              />
            </Input>
          </VStack>

          <VStack className="gap-2">
            <Text className="text-phase-text-secondary font-bold ml-1">
              {t('groups.selectStudentsLabel', {
                count: selectedStudentIds.length,
              }) || `Select Students (${selectedStudentIds.length} selected)`}
            </Text>
            <Box className="bg-phase-surface-secondary rounded-[24px] p-2 max-h-[300px] border border-phase-border overflow-hidden">
              <ScrollView showsVerticalScrollIndicator={true}>
                <VStack className="gap-1 p-2">
                  {students.map((student) => {
                    const isChecked = selectedStudentIds.includes(student.id);
                    return (
                      <Pressable
                        key={student.id}
                        onPress={() => toggleStudentSelection(student.id)}
                        className={`flex-row items-center gap-3 p-3 rounded-[16px] ${isChecked ? 'bg-sanctuarySaffron/10' : 'bg-transparent active:bg-phase-border/10'}`}
                        accessibilityRole="checkbox"
                        accessibilityLabel={`Select ${student.full_name}`}
                        accessibilityState={{ checked: isChecked }}
                      >
                          <Checkbox
                            value={student.id}
                            isChecked={isChecked}
                            aria-label={`Select ${student.full_name}`}
                          >
                          <CheckboxIndicator
                            className={
                              isChecked
                                ? 'border-sanctuarySaffron bg-sanctuarySaffron'
                                : 'border-phase-border bg-phase-surface'
                            }
                          >
                            <CheckboxIcon as={CheckIcon} className="text-sanctuary-ink" />
                          </CheckboxIndicator>
                        </Checkbox>
                        <VStack className="flex-1">
                          <Text className="text-phase-text-primary text-sm font-bold">
                            {student.full_name}
                          </Text>
                          {student.roll_number && (
                            <Text className="text-phase-text-tertiary text-xs">
                              Roll #{student.roll_number}
                            </Text>
                          )}
                        </VStack>
                      </Pressable>
                    );
                  })}
                </VStack>
              </ScrollView>
            </Box>
          </VStack>
        </VStack>
      </SanctuaryModal>
    </Box>
  );
}
