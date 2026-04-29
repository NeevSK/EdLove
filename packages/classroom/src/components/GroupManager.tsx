/**
 * GroupManager Component
 *
 * Create and manage temporary student groups
 * - Select Multiple checklist for assigning students
 * - Group creation and management
 * - JSON blob stored in local state (or groups table if available)
 */

import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { Check as CheckIcon, Edit2, Plus, Trash2, Users } from '@repo/ui/icons';
import { Box, Button, Input } from '@repo/ui/primitives';
import { ButtonText, Checkbox, CheckboxIcon, CheckboxIndicator, HStack, Heading, Icon, InputField, Text, VStack } from '@repo/ui/primitives';
import { Pressable, ScrollView } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { useEffect, useState } from 'react';
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
  const { t } = useTranslation();

  useEffect(() => {
    fetchStudents();
    loadGroups();
  }, [loadGroups, fetchStudents]);

  async function fetchStudents() {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data for now
      const mockStudents: Student[] = [
        { id: 's1', full_name: 'Anura Kumara', roll_number: 1 },
        { id: 's2', full_name: 'Sithum Silva', roll_number: 2 },
        { id: 's3', full_name: 'Nimal Perera', roll_number: 3 },
        { id: 's4', full_name: 'Kasun Fernando', roll_number: 4 },
        { id: 's5', full_name: 'Dilani Jayasinghe', roll_number: 5 },
        { id: 's6', full_name: 'Sanduni Wijeratne', roll_number: 6 },
      ];

      setStudents(mockStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function loadGroups() {
    // TODO: Load from API or AsyncStorage
    // For now, using local state
    const mockGroups: StudentGroup[] = [
      {
        id: 'g1',
        name: 'Lab Group A',
        description: 'First lab rotation',
        studentIds: ['s1', 's2', 's3'],
        createdAt: new Date().toISOString(),
        color: GROUP_COLORS[0] ?? '#CCCCCC',
      },
    ];
    setGroups(mockGroups);
  }

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

  const saveGroup = () => {
    hapticLight();

    if (!groupName.trim() || selectedStudentIds.length === 0) {
      return;
    }

    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    };

    if (editingGroup) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editingGroup.id
            ? {
                ...g,
                name: groupName,
                description: groupDescription || undefined,
                studentIds: selectedStudentIds,
              }
            : g,
        ),
      );
    } else {
      const newGroup: StudentGroup = {
        id: generateId(),
        name: groupName,
        description: groupDescription || undefined,
        studentIds: selectedStudentIds,
        createdAt: new Date().toISOString(),
        color: GROUP_COLORS[groups.length % GROUP_COLORS.length] ?? '#CCCCCC',
      };
      setGroups((prev) => [...prev, newGroup]);
    }

    setShowCreateModal(false);
    setEditingGroup(null);
    setGroupName('');
    setGroupDescription('');
    setSelectedStudentIds([]);
  };

  const deleteGroup = (groupId: string) => {
    hapticLight();
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
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
              <Pressable onPress={() => openEditModal(group)}>
                <Box className="p-2 rounded-xl bg-phase-surface border border-phase-border">
                  <Icon as={Edit2} className="text-phase-text-tertiary" size="xs" />
                </Box>
              </Pressable>
              <Pressable onPress={() => deleteGroup(group.id)}>
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
              onPress={saveGroup}
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
              {t('groups.selectStudentsLabel', { count: selectedStudentIds.length }) ||
                `Select Students (${selectedStudentIds.length} selected)`}
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
                      >
                        <Checkbox
                          value={student.id}
                          isChecked={isChecked}
                          onChange={() => toggleStudentSelection(student.id)}
                          aria-label="Select student"
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
