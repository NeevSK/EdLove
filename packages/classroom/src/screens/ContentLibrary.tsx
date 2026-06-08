/**
 * ContentLibrary Screen
 *
 * Resource management interface for teachers
 * - Grid view of resource cards (PDFs, Links, Notes)
 * - Add Resource FAB
 * - Pin to Top functionality
 */

import { type RouteProp, useRoute } from '@react-navigation/native';
import { api } from '@repo/core/api';
import { useSafeMutation } from '@repo/core/hooks';
import { useStore } from '@repo/core/logic';
import type { ClassroomResource, ClassroomStackParamList, ResourceType } from '@repo/core/types';

import { libraryAPI } from '@repo/library';
import { CollectionCard } from '@repo/ui/components/CollectionCard';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { SmartShelf } from '@repo/ui/components/SmartShelf';
import {
  Download,
  ExternalLink,
  File,
  FileText,
  Pin,
  Plus,
  Share2,
  Trash2,
  Video,
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
  Link as LinkIcon,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pressable,
  ScrollView,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from '@repo/ui/primitives';
import { useToast } from '@repo/ui/providers';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResources } from '../hooks';

export default function ContentLibrary() {
  const route = useRoute<RouteProp<ClassroomStackParamList, 'ContentLibrary'>>();
  const classroomId = route.params?.classroomId || 'demo-class';

  const { t } = useTranslation();
  const user = useStore((state) => state.user);
  const addToDesk = useStore((state) => state.addToDesk);
  const deskItems = useStore((state) => state.deskItems || []);
  const { showToast } = useToast();

  // Resilient Data Hook
  const { resources, isLoading, setResources } = useResources(classroomId);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResourceType, setNewResourceType] = useState<ResourceType>('note');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceDescription, setNewResourceDescription] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceContent, setNewResourceContent] = useState('');

  // Resource type configuration
  const RESOURCE_TYPE_CONFIG: Record<string, { icon: any; iconClass: string; label: string }> = {
    pdf: {
      icon: File,
      iconClass: 'text-emberRed',
      label: 'PDF',
    },
    link: {
      icon: LinkIcon,
      iconClass: 'text-phase-accent',
      label: 'Link',
    },
    note: {
      icon: FileText,
      iconClass: 'text-sageGreen',
      label: 'Note',
    },
    video: {
      icon: Video,
      iconClass: 'text-skyBlue',
      label: 'Video',
    },
    text: {
      icon: FileText,
      iconClass: 'text-sageGreen',
      label: 'Article',
    },
    doc: {
      icon: FileText,
      iconClass: 'text-ink',
      label: 'Document',
    },
  };

  const getResourceConfig = (type: string) => {
    return (
      RESOURCE_TYPE_CONFIG[type] ||
      RESOURCE_TYPE_CONFIG.note || {
        icon: FileText,
        iconClass: 'text-ink',
        label: type,
      }
    );
  };

  // Mutations
  const togglePinMutation = useSafeMutation(
    (variables: { id: string; is_pinned: boolean }) =>
      api.resources.togglePin(variables.id, variables.is_pinned),
    {
      onMutate: ({ id, is_pinned }) => {
        setResources((prev) => prev.map((r) => (r.id === id ? { ...r, is_pinned } : r)));
      },
      onSuccess: () => hapticSuccess(),
    },
  );

  const deleteMutation = useSafeMutation((id: string) => api.resources.delete(id), {
    onMutate: (id) => {
      setResources((prev) => prev.filter((r) => r.id !== id));
    },
    onSuccess: () => {
      hapticSuccess();
      showToast({ message: 'Resource deleted', type: 'success' });
    },
  });

  const addMutation = useSafeMutation((variables: any) => api.resources.create(variables), {
    onSuccess: (newResource: any) => {
      hapticSuccess();
      if (newResource) {
        setResources((prev: ClassroomResource[]) => [newResource, ...prev]);
      }
      showToast({ message: 'Resource added', type: 'success' });
      setShowAddModal(false);
      // Reset form
      setNewResourceTitle('');
      setNewResourceDescription('');
      setNewResourceUrl('');
      setNewResourceContent('');
      setNewResourceType('note');
    },
  });

  const publishMutation = useSafeMutation(
    (resource: ClassroomResource) => {
      if (!user?.id) {
        showToast({
          message: 'Please sign in to publish resources',
          type: 'error',
        });
        return Promise.reject(new Error('Not authenticated'));
      }
      const typeMapping: Record<string, any> = {
        note: 'note',
        link: 'link',
        pdf: 'pdf',
        video: 'video',
        text: 'reading',
        doc: 'doc',
      };
      const mappedType = typeMapping[resource.type] || 'other';

      return libraryAPI.createResource(
        {
          title: resource.title,
          description: resource.description
            ? `${resource.description}\n\n${resource.content || ''}`
            : resource.content || '',
          type: mappedType,
          format: 'document',
          url: resource.url || '',
          difficulty: 'beginner',
          language: 'english',
          visibility: 'public',
          subject: 'General',
          tags: [],
          topics: [],
          grades: [],
        },
        user.id,
        'teacher',
      );
    },
    {
      onSuccess: () => {
        hapticSuccess();
        showToast({ message: 'Published to Global Library', type: 'success' });
      },
    },
  );

  const togglePin = (resourceId: string) => {
    const resource = resources.find((r) => r.id === resourceId);
    if (resource) {
      togglePinMutation.mutate({
        id: resourceId,
        is_pinned: !resource.is_pinned,
      });
    }
  };

  const deleteResource = (resourceId: string) => {
    deleteMutation.mutate(resourceId);
  };

  const addResource = () => {
    if (!newResourceTitle.trim()) return;
    if (!user?.id) {
      showToast({ message: 'Please sign in to add resources', type: 'error' });
      return;
    }

    addMutation.mutate({
      classroom_id: classroomId,
      teacher_id: user.id,
      title: newResourceTitle,
      description: newResourceDescription,
      type: newResourceType,
      url: newResourceUrl,
      content: newResourceContent,
      is_pinned: false,
    });
  };

  const sortedResources = [...resources].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const filteredResources = sortedResources.filter((r: ClassroomResource) => {
    const titleMatch = (r.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || descMatch;
  }) as ClassroomResource[];

  const renderResourceCard = (resource: ClassroomResource) => {
    const config = getResourceConfig(resource.type);
    const ResourceIcon = config.icon;

    return (
      <Box
        key={resource.id}
        className={`bg-phase-surface rounded-generous p-md mb-md border ${
          resource.is_pinned ? 'border-2 border-sanctuarySaffron' : 'border-phase-border'
        }`}
      >
        <VStack className="gap-sm">
          <HStack className="justify-between items-start gap-md">
            <HStack className="flex-1 items-center gap-sm">
              <Box className="w-10 h-10 rounded-comfortable bg-phase-elevated justify-center items-center">
                <Icon as={ResourceIcon} className={config.iconClass} size="md" />
              </Box>
              <VStack className="flex-1">
                <Text className="text-phaseText-onSurface text-md font-bold">{resource.title}</Text>
                <Text className="text-phaseText-tertiary text-xs">{config.label}</Text>
              </VStack>
            </HStack>

            {resource.is_pinned && (
              <Box className="bg-sanctuarySaffron rounded-tight p-1">
                <Icon as={Pin} className="text-sacredWhite" size={14} fill="currentColor" />
              </Box>
            )}
          </HStack>

          {resource.description && (
            <Text className="text-phaseText-secondary text-sm">{resource.description}</Text>
          )}

          <HStack className="gap-sm justify-end mt-sm">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('library.publishToGlobal') || 'Publish to Global Library'}
              accessibilityHint="Publishes this resource to the global library"
              onPress={() => publishMutation.mutate(resource)}
            >
              <Box className="p-sm rounded-comfortable bg-phase-elevated border border-phase-border">
                <Icon as={Share2} className="text-amberGlow" size={18} />
              </Box>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('library.saveToDesk') || 'Save to Personal Desk'}
              accessibilityHint="Saves this resource to your personal desk"
              onPress={() => {
                if (addToDesk) {
                  addToDesk({
                    id: resource.id,
                    title: resource.title,
                    type: resource.type as any,
                    url: resource.url || '',
                    thumbnailUrl: undefined,
                    addedAt: new Date().toISOString(),
                  });
                  showToast({
                    message: 'Saved to Personal Desk',
                    type: 'success',
                  });
                  hapticSuccess();
                }
              }}
            >
              <Box className="p-sm rounded-comfortable bg-phase-elevated border border-phase-border">
                <Icon as={Download} className="text-skyBlue" size={18} />
              </Box>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                resource.is_pinned ? t('library.unpin') || 'Unpin' : t('library.pin') || 'Pin'
              }
              accessibilityHint="Pins or unpins this resource to the top of the list"
              onPress={() => togglePin(resource.id)}
            >
              <Box className="p-sm rounded-comfortable bg-phase-elevated border border-phase-border">
                <Icon
                  as={Pin}
                  className={
                    resource.is_pinned ? 'text-sanctuarySaffron' : 'text-phaseText-tertiary'
                  }
                  size={18}
                  fill={resource.is_pinned ? 'currentColor' : 'none'}
                />
              </Box>
            </Pressable>

            {resource.type === 'link' && resource.url && (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={t('library.openLink') || 'Open Link'}
                accessibilityHint="Opens the resource link in a new window"
                onPress={() => hapticLight()}
              >
                <Box className="p-sm rounded-comfortable bg-phase-elevated border border-phase-border">
                  <Icon as={ExternalLink} className="text-phaseText-secondary" size={18} />
                </Box>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('library.deleteResource') || 'Delete Resource'}
              accessibilityHint="Permanently deletes this resource"
              onPress={() => deleteResource(resource.id)}
            >
              <Box className="p-sm rounded-comfortable bg-phase-elevated border border-phase-border">
                <Icon as={Trash2} className="text-emberRed" size={18} />
              </Box>
            </Pressable>
          </HStack>
        </VStack>
      </Box>
    );
  };

  return (
    <ScreenWrapper>
      <GlobalHeader
        title={t('library.contentLibrary')}
        subtitle={t('library.manageResources')}
        searchProps={{
          value: searchQuery,
          onChangeText: setSearchQuery,
          placeholder: t('library.searchPlaceholder'),
        }}
      />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {deskItems && deskItems.length > 0 && (
          <Box className="mb-lg">
            <SmartShelf
              title={t('library.personalDesk') || 'Your Personal Desk'}
              horizontalPadding={0}
            >
              {deskItems.map((item) => (
                <CollectionCard
                  key={item.id}
                  title={item.title}
                  creator="From Desk"
                  resourceCount={1}
                  subjectTag={item.type}
                  thumbnailUrl={item.thumbnailUrl}
                  verified={true}
                  onPress={() => {
                    const doImport = () => {
                      if (!user?.id) {
                        showToast({
                          message: 'Please sign in to import resources',
                          type: 'error',
                        });
                        return;
                      }
                      addMutation.mutate({
                        classroom_id: classroomId,
                        teacher_id: user.id,
                        title: item.title,
                        description: `Imported from Personal Desk`,
                        type: item.type,
                        url: item.url,
                        content: '',
                        is_pinned: false,
                      });
                    };
                    // Simplified for brevity
                    doImport();
                  }}
                />
              ))}
            </SmartShelf>
          </Box>
        )}

        {isLoading ? (
          <VStack className="gap-md">
            <SkeletonCard height={120} />
            <SkeletonCard height={120} />
            <SkeletonCard height={120} />
          </VStack>
        ) : filteredResources.length === 0 ? (
          <PositiveInvitation context="classroom" onAction={() => setShowAddModal(true)} />
        ) : (
          <VStack className="gap-md">{filteredResources.map(renderResourceCard)}</VStack>
        )}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('library.addResource') || 'Add Resource'}
        accessibilityHint="Opens a modal to add a new resource"
        onPress={() => {
          hapticLight();
          setShowAddModal(true);
        }}
        className="absolute bottom-6 right-6"
      >
        <Box className="w-14 h-14 rounded-full bg-sanctuarySaffron justify-center items-center shadow-lg">
          <Icon as={Plus} className="text-sacredWhite" size="xl" />
        </Box>
      </Pressable>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalBackdrop />
        <ModalContent className="bg-phase-surface max-w-[500px] border border-phase-border">
          <ModalHeader>
            <Heading className="text-phaseText-onSurface text-lg">
              {t('library.addResource')}
            </Heading>
          </ModalHeader>

          <ModalBody>
            <ScrollView showsVerticalScrollIndicator={false}>
              <VStack className="gap-md">
                <VStack className="gap-xs">
                  <Text className="text-phaseText-secondary text-sm">
                    {t('library.resourceType')}
                  </Text>
                  <HStack className="gap-sm flex-wrap">
                    {(['note', 'link', 'pdf', 'video', 'text', 'doc'] as ResourceType[]).map(
                      (type) => (
                        <Pressable
                          key={type}
                          onPress={() => {
                            hapticLight();
                            setNewResourceType(type);
                          }}
                          className="w-[31%]"
                          accessibilityRole="button"
                          accessibilityLabel={`Select ${getResourceConfig(type).label} type`}
                          accessibilityHint={`Sets the new resource type to ${getResourceConfig(type).label}`}
                        >
                          <Box
                            className={`p-sm rounded-comfortable items-center border ${
                              newResourceType === type
                                ? 'bg-sanctuarySaffron border-sanctuarySaffron'
                                : 'bg-phase-elevated border-phase-border'
                            }`}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                newResourceType === type
                                  ? 'text-sacredWhite'
                                  : 'text-phaseText-secondary'
                              }`}
                            >
                              {getResourceConfig(type).label}
                            </Text>
                          </Box>
                        </Pressable>
                      ),
                    )}
                  </HStack>
                </VStack>

                <VStack className="gap-xs">
                  <Text className="text-phaseText-secondary text-sm">
                    {t('library.titleLabel')}
                  </Text>
                  <Input className="bg-phase-elevated border-phase-border">
                    <InputField
                      placeholder={t('library.titlePlaceholder')}
                      value={newResourceTitle}
                      onChangeText={setNewResourceTitle}
                      className="text-phaseText-onSurface"
                    />
                  </Input>
                </VStack>

                <VStack className="gap-xs">
                  <Text className="text-phaseText-secondary text-sm">{t('library.descLabel')}</Text>
                  <Input className="bg-phase-elevated border-phase-border">
                    <InputField
                      placeholder={t('library.descPlaceholder')}
                      value={newResourceDescription}
                      onChangeText={setNewResourceDescription}
                      className="text-phaseText-onSurface"
                    />
                  </Input>
                </VStack>

                {(newResourceType === 'pdf' ||
                  newResourceType === 'link' ||
                  newResourceType === 'video') && (
                  <VStack className="gap-xs">
                    <Text className="text-phaseText-secondary text-sm">
                      {t('library.urlLabel')}
                    </Text>
                    <Input className="bg-phase-elevated border-phase-border">
                      <InputField
                        placeholder="https://..."
                        value={newResourceUrl}
                        onChangeText={setNewResourceUrl}
                        className="text-phaseText-onSurface"
                        autoCapitalize="none"
                      />
                    </Input>
                  </VStack>
                )}

                {newResourceType === 'note' && (
                  <VStack className="gap-xs">
                    <Text className="text-phaseText-secondary text-sm">
                      {t('library.contentLabel')}
                    </Text>
                    <Textarea className="bg-phase-elevated border-phase-border">
                      <TextareaInput
                        placeholder={t('library.contentPlaceholder')}
                        value={newResourceContent}
                        onChangeText={setNewResourceContent}
                        className="text-phaseText-onSurface"
                      />
                    </Textarea>
                  </VStack>
                )}
              </VStack>
            </ScrollView>
          </ModalBody>

          <ModalFooter>
            <HStack className="gap-sm w-full">
              <Button
                variant="outline"
                action="secondary"
                onPress={() => setShowAddModal(false)}
                className="flex-1 border-phase-border"
              >
                <ButtonText className="text-phaseText-secondary font-English">
                  {t('common.cancel')}
                </ButtonText>
              </Button>
              <Button
                action="primary"
                onPress={addResource}
                className="flex-1 bg-sanctuarySaffron"
                isDisabled={!newResourceTitle.trim()}
              >
                <ButtonText className="text-sacredWhite font-English">{t('common.add')}</ButtonText>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ScreenWrapper>
  );
}
