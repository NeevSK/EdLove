import { CLASSROOM_RESOURCE_SCOPE, type ClassroomResource } from '@repo/core';
import { api } from '@repo/core/api';
import { useSafeMutation } from '@repo/core/hooks';
import { useStore } from '@repo/core/logic';

import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { File, FileText, Pin, Plus, Trash2 } from '@repo/ui/icons';
import { Box, Button, Input, Textarea } from '@repo/ui/primitives';
import { ButtonText, HStack, Icon, InputField, Link as LinkIcon, Text, TextareaInput, VStack } from '@repo/ui/primitives';
import { openExternalURL, showExternalLinkOptions } from '@repo/ui/utils';
import { Pressable, ScrollView } from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResources } from '../hooks/useResources';

interface ResourcesViewProps {
  classroomId: string;
  isTeacher: boolean;
}

export default function ResourcesView({ classroomId, isTeacher }: ResourcesViewProps) {
  const { t } = useTranslation();
  const showToast = useStore((state) => state.showToast);
  const user = useStore((state) => state.user);

  // Resilient Data Hook
  const { resources, isLoading, setResources } = useResources(classroomId);

  const [filterType, setFilterType] = useState<'all' | 'link' | 'pdf' | 'note'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'link' | 'pdf' | 'note'>('link');
  const [content, setContent] = useState(''); // URL or Note content

  // Mutations
  const addResourceMutation = useSafeMutation(
    async (variables: { title: string; type: 'link' | 'pdf' | 'note'; content: string }) => {
      return api.resources.create({
        classroom_id: classroomId,
        teacher_id: user?.id || '',
        ...CLASSROOM_RESOURCE_SCOPE,
        title: variables.title,
        type: variables.type,
        url: variables.type === 'link' || variables.type === 'pdf' ? variables.content : undefined,
        content: variables.type === 'note' ? variables.content : undefined,
        is_pinned: false,
      });
    },
    {
      onSuccess: () => {
        hapticSuccess();
        showToast('Resource added successfully', 'success');
        setShowAddModal(false);
        setTitle('');
        setContent('');
        setType('link');
      },
    },
  );

  const togglePinMutation = useSafeMutation(
    async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      return api.resources.togglePin(id, isPinned);
    },
    {
      onMutate: ({ id, isPinned }) => {
        // Optimistic update
        setResources((prev) => prev.map((r) => (r.id === id ? { ...r, is_pinned: isPinned } : r)));
        hapticLight();
      },
      onError: (_error: unknown) => {
        showToast('Failed to update pin', 'error');
      },
    },
  );

  const deleteMutation = useSafeMutation(
    async (id: string) => {
      return api.resources.delete(id);
    },
    {
      onMutate: (id) => {
        setResources((prev) => prev.filter((r) => r.id !== id));
        hapticLight();
      },
      onSuccess: () => {
        showToast('Resource removed', 'success');
      },
    },
  );

  const handleOpenResource = (resource: ClassroomResource) => {
    if (resource.url) {
      openExternalURL(resource.url, {
        title: resource.title,
        sourceLabel: 'Classroom',
        sourceBadge: resource.type === 'pdf' ? 'Shared document' : 'Shared resource',
        trustLevel: 'external',
      }).catch((err: Error) => {
        showToast('Could not open link', 'error');
        console.error("Couldn't open page", err);
      });
    }
  };

  const handleOpenResourceOptions = (resource: ClassroomResource) => {
    if (!resource.url) return;

    showExternalLinkOptions(resource.url, {
      title: resource.title,
      sourceLabel: 'Classroom',
      sourceBadge: resource.type === 'pdf' ? 'Shared document' : 'Shared resource',
      trustLevel: 'external',
    }).catch((err: Error) => {
      showToast('Could not open link options', 'error');
      console.error("Couldn't show link options", err);
    });
  };

  const filteredResources = resources.filter((r: ClassroomResource) => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'link':
        return LinkIcon;
      case 'pdf':
        return FileText;
      case 'note':
        return File;
      default:
        return File;
    }
  };

  return (
    <VStack className="flex-1 bg-phase-world">
      {/* Filters */}
      <Box className="h-16">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-2 items-center"
        >
          {(['all', 'link', 'pdf', 'note'] as const).map((ft) => (
            <Pressable
              key={ft}
              onPress={() => setFilterType(ft)}
              className={`px-6 py-2 rounded-full border items-center justify-center h-10 ${filterType === ft ? 'bg-templeGold border-templeGold' : 'border-phase-canvas bg-phase-surface'}`}
            >
              <Text
                className={`text-xs font-black uppercase tracking-wider ${filterType === ft ? 'text-black' : 'text-phaseText-secondary'}`}
              >
                {ft}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Box>

      {/* Content List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack className="px-4 pb-24 gap-4 pt-2">
          {filteredResources.length === 0 && !isLoading && (
            <Box className="items-center py-20 bg-phase-surface/30 rounded-generous border border-dashed border-phase-canvas/50 mx-2">
              <Text className="text-phaseText-secondary font-medium">No resources found.</Text>
            </Box>
          )}

          {filteredResources.map((resource) => (
            <Pressable
              key={resource.id}
              onPress={() => handleOpenResource(resource)}
              onLongPress={() => resource.url && handleOpenResourceOptions(resource)}
              className={`p-4 bg-phase-surface rounded-generous border border-phase-canvas shadow-sm overflow-hidden ${resource.is_pinned ? 'border-l-4 border-l-templeGold' : ''}`}
            >
              <HStack className="justify-between items-center">
                <HStack className="items-center flex-1 gap-4">
                  <Box className="p-3 bg-templeGold/10 rounded-2xl items-center justify-center">
                    <Icon as={getIcon(resource.type)} size="sm" className="text-templeGold" />
                  </Box>
                  <VStack className="flex-1 gap-0.5">
                    <HStack className="items-center gap-1.5">
                      <Text
                        className="text-base font-black text-phaseText-primary"
                        numberOfLines={1}
                      >
                        {resource.title}
                      </Text>
                      {resource.is_pinned && (
                        <Icon as={Pin} size="xs" className="text-templeGold" />
                      )}
                    </HStack>

                    {resource.type === 'note' && resource.content ? (
                      <Text
                        className="text-sm font-medium text-phaseText-secondary leading-snug"
                        numberOfLines={2}
                      >
                        {resource.content}
                      </Text>
                    ) : (
                      <Text
                        className="text-xs font-medium text-phaseText-secondary"
                        numberOfLines={1}
                      >
                        {resource.url || 'No content'}
                      </Text>
                    )}
                  </VStack>
                </HStack>

                {isTeacher && (
                  <HStack className="gap-1 items-center">
                    <Pressable
                      className="p-3"
                      onPress={(e: any) => {
                        e.stopPropagation();
                        togglePinMutation.mutate({
                          id: resource.id,
                          isPinned: !resource.is_pinned,
                        });
                      }}
                    >
                      <Icon
                        as={Pin}
                        size="sm"
                        className={
                          resource.is_pinned ? 'text-templeGold' : 'text-phaseText-secondary'
                        }
                      />
                    </Pressable>
                    <Pressable
                      className="p-3"
                      onPress={(e: any) => {
                        e.stopPropagation();
                        deleteMutation.mutate(resource.id);
                      }}
                    >
                      <Icon as={Trash2} size="sm" className="text-emberRed" />
                    </Pressable>
                  </HStack>
                )}
              </HStack>
            </Pressable>
          ))}
        </VStack>
      </ScrollView>

      {/* Add Resource FAB */}
      {isTeacher && (
        <Button
          onPress={() => setShowAddModal(true)}
          className="absolute bottom-10 right-6 bg-templeGold rounded-full px-6 py-4 flex-row items-center gap-3 shadow-xl shadow-templeGold/40"
        >
          <ButtonText className="text-black font-black text-base">
            {t('classroom.resources.addResource') || 'Add Resource'}
          </ButtonText>
          <Icon as={Plus} size="sm" className="text-black" />
        </Button>
      )}

      {/* Add Resource Modal */}
      <SanctuaryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('classroom.resources.addModalTitle') || 'Add Resource'}
        footer={
          <HStack className="gap-4">
            <Button
              variant="outline"
              onPress={() => setShowAddModal(false)}
              className="flex-1 h-14 rounded-full border-phase-canvas"
            >
              <ButtonText className="text-phaseText-secondary font-black">
                {t('common.cancel') || 'Cancel'}
              </ButtonText>
            </Button>
            <Button
              onPress={() => {
                addResourceMutation.mutate({ title, type, content });
              }}
              className="flex-[2] h-14 bg-templeGold rounded-full shadow-md shadow-templeGold/20"
              disabled={!title || !content || addResourceMutation.isLoading}
            >
              <ButtonText className="text-black font-black">
                {addResourceMutation.isLoading
                  ? t('common.adding') || 'Adding...'
                  : t('classroom.resources.addResource') || 'Add Resource'}
              </ButtonText>
            </Button>
          </HStack>
        }
      >
        <VStack className="gap-8 p-1">
          <VStack className="gap-2">
            <Text className="text-[10px] font-black uppercase tracking-widest text-phaseText-secondary ml-1">
              {t('classroom.resources.titleLabel') || 'Title'}
            </Text>
            <Input className="h-16 px-4 bg-phase-canvas/50 rounded-generous border border-phase-canvas">
              <InputField
                placeholder={t('classroom.resources.titlePlaceholder') || 'e.g. Science Syllabus'}
                className="text-phaseText-primary font-black text-lg"
                value={title}
                onChangeText={setTitle}
              />
            </Input>
          </VStack>

          <VStack className="gap-2">
            <Text className="text-[10px] font-black uppercase tracking-widest text-phaseText-secondary ml-1">
              {t('classroom.resources.typeLabel') || 'Type'}
            </Text>
            <HStack className="gap-3">
              {(['link', 'pdf', 'note'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  className={`flex-1 h-14 items-center justify-center rounded-2xl border ${type === t ? 'bg-templeGold border-templeGold' : 'bg-phase-canvas/50 border-phase-canvas'}`}
                >
                  <Text
                    className={`text-xs font-black uppercase tracking-wider ${type === t ? 'text-black' : 'text-phaseText-secondary'}`}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          </VStack>

          <VStack className="gap-2">
            <Text className="text-[10px] font-black uppercase tracking-widest text-phaseText-secondary ml-1">
              {type === 'note'
                ? t('classroom.resources.contentLabel') || 'Content'
                : t('classroom.resources.urlLabel') || 'URL'}
            </Text>
            {type === 'note' ? (
              <Textarea className="min-h-[140px] p-4 bg-phase-canvas/50 rounded-generous border border-phase-canvas">
                <TextareaInput
                  placeholder={
                    t('classroom.resources.contentPlaceholder') || 'Enter note content...'
                  }
                  className="text-phaseText-primary font-medium"
                  value={content}
                  onChangeText={setContent}
                />
              </Textarea>
            ) : (
              <Input className="h-14 px-4 bg-phase-canvas/50 rounded-generous border border-phase-canvas">
                <InputField
                  placeholder="https://..."
                  keyboardType="url"
                  autoCapitalize="none"
                  className="text-phaseText-primary font-medium"
                  value={content}
                  onChangeText={setContent}
                />
              </Input>
            )}
          </VStack>
        </VStack>
      </SanctuaryModal>
    </VStack>
  );
}
