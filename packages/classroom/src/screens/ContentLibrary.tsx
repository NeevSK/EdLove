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
    SmartShelf,
    CollectionCard
} from '@repo/ui';
import { Alert } from 'react-native';
import {
    FileText,
    Link as LinkIcon,
    File,
    Plus,
    Pin,
    Trash2,
    ExternalLink,
    Video,
    Share2,
    Download
} from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { hapticLight, hapticSuccess } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { libraryAPI } from '@repo/library';
import { useRoute } from '@react-navigation/native';
import { GlobalHeader } from '@repo/ui';
import { ScreenWrapper } from '@repo/ui';
import { useResources } from '../hooks';
import { useStore, useSafeMutation, api, ClassroomResource } from '@repo/core';
import { SkeletonCard, PositiveInvitation, LibraryResourceCard, ResourceType } from '@repo/ui';

export default function ContentLibrary() {
    const route = useRoute<any>(); // Should be typed if possible
    const classroomId = route.params?.classroomId || 'demo-class';

    const { t } = useTranslation();
    const colors = useThemedColors();
    const showToast = useStore(state => state.showToast);
    const addToDeskLocal = useStore(state => state.addToDeskLocal);
    const deskItems = useStore(state => state.deskItems);
    const user = useStore(state => state.user);

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
    const RESOURCE_TYPE_CONFIG: Record<string, { icon: any, color: string, label: string }> = {
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
        video: {
            icon: Video,
            color: Theme.colors.skyBlue,
            label: 'Video',
        },
        text: {
            icon: FileText,
            color: Theme.colors.sageGreen,
            label: 'Article',
        },
        doc: {
            icon: FileText,
            color: Theme.colors.deepIndigo,
            label: 'Document',
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
                if (newResource) {
                    setResources(prev => [newResource, ...prev]);
                }
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

    const publishMutation = useSafeMutation(
        (resource: ClassroomResource) => {
            const typeMapping: Record<string, any> = {
                note: 'note',
                link: 'link',
                pdf: 'pdf',
                video: 'video',
                text: 'reading',
                doc: 'doc'
            };
            const mappedType = typeMapping[resource.type] || 'other';

            return libraryAPI.createResource(
                {
                    title: resource.title,
                    description: resource.description ? `${resource.description}\n\n${resource.content || ''}` : resource.content || '',
                    type: mappedType,
                    format: 'document',
                    url: resource.url || '',
                    difficulty: 'beginner',
                    language: 'english',
                    visibility: 'public',
                    subject: 'General',
                    tags: [],
                    topics: [],
                    grades: []
                },
                user?.id || '',
                'teacher'
            );
        },
        {
            onSuccess: () => {
                hapticSuccess();
                showToast('Published to Global Library', 'success');
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
            teacher_id: user?.id || '',
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

    const filteredResources = sortedResources.filter((r: ClassroomResource) => {
        const titleMatch = (r.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || descMatch;
    });

    const renderResourceCard = (resource: ClassroomResource) => {
        const config = RESOURCE_TYPE_CONFIG[resource.type] || RESOURCE_TYPE_CONFIG['note'] || {
            icon: FileText,
            color: Theme.colors.sageGreen,
            label: 'Note',
        };
        const ResourceIcon = config.icon;
        const iconColor = config.color;

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
                <VStack sx={{ gap: Theme.spacing.small }}>
                    {/* Header */}
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <HStack sx={{ gap: Theme.spacing.small, flex: 1 }} alignItems="center">
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
                                <Text sx={{ color: colors.text, fontSize: Theme.typography.fontSize.md, fontWeight: '700' }}>
                                    {resource.title}
                                </Text>
                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>
                                    {RESOURCE_TYPE_CONFIG[resource.type]?.label || resource.type}
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
                        <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                            {resource.description}
                        </Text>
                    )}

                    {/* Actions */}
                    <HStack sx={{ gap: Theme.spacing.small, justifyContent: 'flex-end', marginTop: Theme.spacing.small }}>
                        <Pressable onPress={() => publishMutation.mutate(resource)}>
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.tertiary,
                                }}
                            >
                                <Share2 color={Theme.colors.amberGlow} size={18} />
                            </Box>
                        </Pressable>

                        <Pressable onPress={() => {
                            addToDeskLocal({
                                id: resource.id,
                                title: resource.title,
                                type: resource.type,
                                url: resource.url,
                                thumbnailUrl: undefined,
                                addedAt: new Date().toISOString()
                            });
                            showToast('Saved to Personal Desk', 'success');
                            hapticSuccess();
                        }}>
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.tertiary,
                                }}
                            >
                                <Download color={Theme.colors.skyBlue} size={18} />
                            </Box>
                        </Pressable>

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
                {/* Personal Desk Shelf (Import to Classroom) */}
                {deskItems && deskItems.length > 0 && (
                    <Box sx={{ marginBottom: Theme.spacing.lg }}>
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
                                        Alert.alert(
                                            t('library.importToClassroom') || 'Import to Classroom',
                                            t('library.importConfirm') || `Would you like to import "${item.title}" from your desk into this classroom?`,
                                            [
                                                { text: t('common.cancel') || 'Cancel', style: 'cancel' },
                                                {
                                                    text: t('common.import') || 'Import',
                                                    onPress: () => {
                                                        addMutation.mutate({
                                                            classroom_id: classroomId,
                                                            teacher_id: user?.id || '',
                                                            title: item.title,
                                                            description: `Imported from Personal Desk`,
                                                            type: item.type,
                                                            url: item.url,
                                                            content: '',
                                                            is_pinned: false
                                                        });
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                />
                            ))}
                        </SmartShelf>
                    </Box>
                )}

                {/* Resources Grid */}
                {isLoading ? (
                    <VStack sx={{ gap: Theme.spacing.md }}>
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
                    <VStack sx={{ gap: Theme.spacing.md }}>
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
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            {/* Resource Type Selection */}
                            <VStack sx={{ gap: Theme.spacing.xs }}>
                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                    {t('library.resourceType')}
                                </Text>
                                <HStack sx={{ gap: Theme.spacing.small }}>
                                    {(['note', 'link', 'pdf', 'video', 'text', 'doc'] as ResourceType[]).map((type) => (
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
                                                    sx={{
                                                        color: newResourceType === type
                                                            ? Theme.colors.white
                                                            : colors.textSecondary,
                                                        fontSize: Theme.typography.fontSize.sm,
                                                        fontWeight: newResourceType === type ? '700' : '400'
                                                    }}
                                                >
                                                    {RESOURCE_TYPE_CONFIG[type]?.label || type}
                                                </Text>
                                            </Box>
                                        </Pressable>
                                    ))}
                                </HStack>
                            </VStack>

                            {/* Title */}
                            <VStack sx={{ gap: Theme.spacing.xs }}>
                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                    {t('library.titleLabel')}
                                </Text>
                                <Input
                                    sx={{
                                        backgroundColor: colors.tertiary,
                                        borderColor: colors.border,
                                        height: 40
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
                            <VStack sx={{ gap: Theme.spacing.xs }}>
                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                    {t('library.descLabel')}
                                </Text>
                                <Input
                                    sx={{
                                        backgroundColor: colors.tertiary,
                                        borderColor: colors.border,
                                        height: 40
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
                                <VStack sx={{ gap: Theme.spacing.xs }}>
                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                        {t('library.urlLabel')}
                                    </Text>
                                    <Input
                                        sx={{
                                            backgroundColor: colors.tertiary,
                                            borderColor: colors.border,
                                            height: 40
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
                                <VStack sx={{ gap: Theme.spacing.xs }}>
                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                        {t('library.contentLabel')}
                                    </Text>
                                    <Textarea
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
                        <HStack sx={{ gap: Theme.spacing.small }}>
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
        </ScreenWrapper >
    );
}
