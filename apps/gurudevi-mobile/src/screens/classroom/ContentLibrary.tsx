/**
 * ContentLibrary Screen
 * 
 * Resource management interface for teachers
 * - Grid view of resource cards (PDFs, Links, Notes)
 * - Add Resource FAB
 * - Pin to Top functionality
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    ScrollView,
    Pressable,
    Button,
    ButtonText,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    InputField,
    Textarea,
    TextareaInput,
} from "@/ui";
import {
    FileText,
    Link as LinkIcon,
    File,
    Plus,
    Pin,
    Trash2,
    ExternalLink,
} from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { useThemedColors } from '../../hooks/useThemedColors';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import GlobalHeader from '../../components/shared/GlobalHeader';
import ScreenWrapper from '../../components/shared/ScreenWrapper';
import { useResources } from '../../hooks/classroom/useResources';
import { useSafeMutation } from '../../hooks/useSafeMutation';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';
import { ClassroomResource } from '../../lib/api/types';
import { SkeletonCard } from '../../components/shared/SkeletonLoader';
import PositiveInvitation from '../../components/shared/PositiveInvitation';
import { ResourceType } from '../../components/library/LibraryResourceCard';

export default function ContentLibrary() {
    const route = useRoute<any>(); // Should be typed if possible
    const classroomId = route.params?.classroomId || 'demo-class';

    const { t } = useTranslation();
    const colors = useThemedColors();
    const showToast = useStore(state => state.showToast);

    // Resilient Data Hook
    const { resources, isLoading, setResources } = useResources(classroomId);

    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newResourceType, setNewResourceType] = useState<'pdf' | 'link' | 'note' | 'video' | 'text' | 'doc'>('note');
    const [newResourceTitle, setNewResourceTitle] = useState('');
    const [newResourceDescription, setNewResourceDescription] = useState('');
    const [newResourceUrl, setNewResourceUrl] = useState('');
    const [newResourceContent, setNewResourceContent] = useState('');

    // Resource type configuration
    const RESOURCE_TYPE_CONFIG = {
        pdf: {
            icon: File,
            color: Theme.colors.emberRed,
            label: 'PDF',
        },
        link: {
            icon: LinkIcon,
            color: colors.action,
            label: 'Link',
        },
        note: {
            icon: FileText,
            color: Theme.colors.sageGreen,
            label: 'Note',
        },
    };

    // Mutations
    const togglePinMutation = useSafeMutation(
        (variables: { id: string; is_pinned: boolean }) =>
            api.resources.togglePin(variables.id, variables.is_pinned),
        {
            onMutate: ({ id, is_pinned }) => {
                setResources(prev => prev.map(r =>
                    r.id === id ? { ...r, is_pinned } : r
                ));
            },
            onSuccess: () => hapticSuccess()
        }
    );

    const deleteMutation = useSafeMutation(
        (id: string) => api.resources.delete(id),
        {
            onMutate: (id) => {
                setResources(prev => prev.filter(r => r.id !== id));
            },
            onSuccess: () => {
                hapticSuccess();
                showToast('Resource deleted', 'success');
            }
        }
    );

    const addMutation = useSafeMutation(
        (variables: any) => api.resources.create(variables),
        {
            onSuccess: (newResource) => {
                hapticSuccess();
                setResources(prev => [newResource, ...prev]);
                showToast('Resource added', 'success');
                setShowAddModal(false);
                // Reset form
                setNewResourceTitle('');
                setNewResourceDescription('');
                setNewResourceUrl('');
                setNewResourceContent('');
                setNewResourceType('note');
            }
        }
    );

    const togglePin = (resourceId: string) => {
        const resource = resources.find(r => r.id === resourceId);
        if (resource) {
            togglePinMutation.mutate({ id: resourceId, is_pinned: !resource.is_pinned });
        }
    };

    const deleteResource = (resourceId: string) => {
        deleteMutation.mutate(resourceId);
    };

    const addResource = () => {
        if (!newResourceTitle.trim()) return;

        addMutation.mutate({
            classroom_id: classroomId,
            teacher_id: 'current-teacher-id', // TODO: Get from store
            title: newResourceTitle,
            description: newResourceDescription,
            type: newResourceType,
            url: newResourceUrl,
            content: newResourceContent,
            is_pinned: false
        });
    };

    const sortedResources = [...resources].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    const filteredResources = sortedResources.filter((r: ClassroomResource) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderResourceCard = (resource: ClassroomResource) => {
        const ResourceIcon = RESOURCE_TYPE_CONFIG[resource.type].icon;
        const iconColor = RESOURCE_TYPE_CONFIG[resource.type].color;

        return (
            <Box
                key={resource.id}
                sx={{
                    backgroundColor: colors.secondary,
                    borderRadius: Theme.corners.generous,
                    padding: Theme.spacing.md,
                    marginBottom: Theme.spacing.md,
                    borderWidth: resource.is_pinned ? 2 : 1,
                    borderColor: resource.is_pinned ? colors.action : colors.border,
                }}
            >
                <VStack space="sm">
                    {/* Header */}
                    <HStack space="md" alignItems="flex-start" justifyContent="space-between">
                        <HStack space="sm" alignItems="center" sx={{ flex: 1 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.tertiary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <ResourceIcon color={iconColor} size={20} />
                            </Box>
                            <VStack sx={{ flex: 1 }}>
                                <Text color={colors.text} size="md" bold>
                                    {resource.title}
                                </Text>
                                <Text color={colors.textSecondary} size="xs">
                                    {RESOURCE_TYPE_CONFIG[resource.type].label}
                                </Text>
                            </VStack>
                        </HStack>

                        {/* Pin indicator */}
                        {resource.is_pinned && (
                            <Box
                                sx={{
                                    backgroundColor: colors.action,
                                    borderRadius: Theme.corners.tight,
                                    padding: 4,
                                }}
                            >
                                <Pin color={Theme.colors.white} size={14} fill={Theme.colors.white} />
                            </Box>
                        )}
                    </HStack>

                    {/* Description */}
                    {resource.description && (
                        <Text color={colors.textSecondary} size="sm">
                            {resource.description}
                        </Text>
                    )}

                    {/* Actions */}
                    <HStack space="sm" justifyContent="flex-end" mt="$2">
                        <Pressable onPress={() => togglePin(resource.id)}>
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.tertiary,
                                }}
                            >
                                <Pin
                                    color={
                                        resource.is_pinned
                                            ? colors.action
                                            : colors.textTertiary
                                    }
                                    size={18}
                                    fill={resource.is_pinned ? colors.action : 'none'}
                                />
                            </Box>
                        </Pressable>

                        {resource.type === 'link' && resource.url && (
                            <Pressable onPress={() => hapticLight()}>
                                <Box
                                    sx={{
                                        padding: Theme.spacing.sm,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: colors.tertiary,
                                    }}
                                >
                                    <ExternalLink color={colors.textSecondary} size={18} />
                                </Box>
                            </Pressable>
                        )}

                        <Pressable onPress={() => deleteResource(resource.id)}>
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.tertiary,
                                }}
                            >
                                <Trash2 color={Theme.colors.emberRed} size={18} />
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
                    placeholder: t('library.searchPlaceholder')
                }}
            />
            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ padding: Theme.spacing.lg, paddingBottom: 100 }}>
                {/* Resources Grid */}
                {isLoading ? (
                    <VStack space="md">
                        <SkeletonCard height={100} />
                        <SkeletonCard height={100} />
                        <SkeletonCard height={100} />
                    </VStack>
                ) : filteredResources.length === 0 ? (
                    <PositiveInvitation
                        context="classroom"
                        onAction={() => setShowAddModal(true)}
                    />
                ) : (
                    <VStack space="md">
                        {filteredResources.map(renderResourceCard)}
                    </VStack>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <Pressable
                onPress={() => {
                    hapticLight();
                    setShowAddModal(true);
                }}
                style={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                }}
            >
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: Theme.corners.full,
                        backgroundColor: colors.action,
                        justifyContent: 'center',
                        alignItems: 'center',
                        ...Theme.shadows.lg,
                    }}
                >
                    <Plus color={Theme.colors.white} size={24} />
                </Box>
            </Pressable>

            {/* Add Resource Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
                <ModalBackdrop />
                <ModalContent
                    sx={{
                        backgroundColor: colors.secondary,
                        maxWidth: 500,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <ModalHeader>
                        <Heading color={colors.text} size="lg">
                            {t('library.addResource')}
                        </Heading>
                    </ModalHeader>

                    <ModalBody>
                        <VStack space="md">
                            {/* Resource Type Selection */}
                            <VStack space="xs">
                                <Text color={colors.textSecondary} size="sm">
                                    {t('library.resourceType')}
                                </Text>
                                <HStack space="sm">
                                    {(['note', 'link', 'pdf'] as ResourceType[]).map((type) => (
                                        <Pressable
                                            key={type}
                                            onPress={() => {
                                                hapticLight();
                                                setNewResourceType(type);
                                            }}
                                            style={{ flex: 1 }}
                                        >
                                            <Box
                                                sx={{
                                                    padding: Theme.spacing.sm,
                                                    borderRadius: Theme.corners.comfortable,
                                                    backgroundColor:
                                                        newResourceType === type
                                                            ? colors.action
                                                            : colors.tertiary,
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Text
                                                    color={
                                                        newResourceType === type
                                                            ? Theme.colors.white
                                                            : colors.textSecondary
                                                    }
                                                    size="sm"
                                                    bold={newResourceType === type}
                                                >
                                                    {RESOURCE_TYPE_CONFIG[type].label}
                                                </Text>
                                            </Box>
                                        </Pressable>
                                    ))}
                                </HStack>
                            </VStack>

                            {/* Title */}
                            <VStack space="xs">
                                <Text color={colors.textSecondary} size="sm">
                                    {t('library.titleLabel')}
                                </Text>
                                <Input
                                    variant="outline"
                                    size="md"
                                    sx={{
                                        backgroundColor: colors.tertiary,
                                        borderColor: colors.border,
                                    }}
                                >
                                    <InputField
                                        placeholder={t('library.titlePlaceholder')}
                                        value={newResourceTitle}
                                        onChangeText={setNewResourceTitle}
                                        color={colors.text}
                                        placeholderTextColor={colors.textTertiary}
                                    />
                                </Input>
                            </VStack>

                            {/* Description */}
                            <VStack space="xs">
                                <Text color={colors.textSecondary} size="sm">
                                    {t('library.descLabel')}
                                </Text>
                                <Input
                                    variant="outline"
                                    size="md"
                                    sx={{
                                        backgroundColor: colors.tertiary,
                                        borderColor: colors.border,
                                    }}
                                >
                                    <InputField
                                        placeholder={t('library.descPlaceholder')}
                                        value={newResourceDescription}
                                        onChangeText={setNewResourceDescription}
                                        color={colors.text}
                                        placeholderTextColor={colors.textTertiary}
                                    />
                                </Input>
                            </VStack>

                            {/* URL (for PDF and Link) */}
                            {(newResourceType === 'pdf' || newResourceType === 'link') && (
                                <VStack space="xs">
                                    <Text color={colors.textSecondary} size="sm">
                                        {t('library.urlLabel')}
                                    </Text>
                                    <Input
                                        variant="outline"
                                        size="md"
                                        sx={{
                                            backgroundColor: colors.tertiary,
                                            borderColor: colors.border,
                                        }}
                                    >
                                        <InputField
                                            placeholder="https://..."
                                            value={newResourceUrl}
                                            onChangeText={setNewResourceUrl}
                                            color={colors.text}
                                            placeholderTextColor={colors.textTertiary}
                                            autoCapitalize="none"
                                            keyboardType="url"
                                        />
                                    </Input>
                                </VStack>
                            )}

                            {/* Content (for Note) */}
                            {newResourceType === 'note' && (
                                <VStack space="xs">
                                    <Text color={colors.textSecondary} size="sm">
                                        {t('library.contentLabel')}
                                    </Text>
                                    <Textarea
                                        size="md"
                                        sx={{
                                            backgroundColor: colors.tertiary,
                                            borderColor: colors.border,
                                            minHeight: 100,
                                        }}
                                    >
                                        <TextareaInput
                                            placeholder={t('library.contentPlaceholder')}
                                            value={newResourceContent}
                                            onChangeText={setNewResourceContent}
                                            color={colors.text}
                                            placeholderTextColor={colors.textTertiary}
                                        />
                                    </Textarea>
                                </VStack>
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <HStack space="sm">
                            <Button
                                variant="outline"
                                action="secondary"
                                onPress={() => setShowAddModal(false)}
                                sx={{
                                    flex: 1,
                                    borderColor: colors.border,
                                }}
                            >
                                <ButtonText color={colors.textSecondary}>{t('common.cancel')}</ButtonText>
                            </Button>
                            <Button
                                action="primary"
                                onPress={addResource}
                                sx={{
                                    flex: 1,
                                    backgroundColor: colors.action,
                                }}
                                isDisabled={!newResourceTitle.trim()}
                            >
                                <ButtonText color={Theme.colors.white}>{t('common.add')}</ButtonText>
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </ScreenWrapper>
    );
}
