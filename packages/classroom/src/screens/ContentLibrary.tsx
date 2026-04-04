/**
 * ContentLibrary Screen
 * 
 * Resource management interface for teachers
 * - Grid view of resource cards (PDFs, Links, Notes)
 * - Add Resource FAB
 * - Pin to Top functionality
 */

import React, { useState } from 'react';
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
    Theme,
    hapticLight,
    hapticSuccess,
    useThemedColors,
    GlobalHeader,
    ScreenWrapper,
    SkeletonCard,
    PositiveInvitation,
    CollectionCard
} from '@repo/ui';
import { ResourceType, ClassroomResource, useStore, useSafeMutation, api, ClassroomStackParamList } from '@repo/core';
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
import { useTranslation } from 'react-i18next';
import { libraryAPI } from '@repo/library';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useResources } from '../hooks';
import { useToast, SanctuaryToast } from '@repo/ui';

export default function ContentLibrary() {
    const route = useRoute<RouteProp<ClassroomStackParamList, 'ContentLibrary'>>();
    const classroomId = route.params?.classroomId || 'demo-class';

    const { t } = useTranslation();
    const colors = useThemedColors();
    const user = useStore(state => state.user);
    const addToDesk = useStore(state => state.addToDesk); 
    const deskItems = useStore(state => state.deskItems || []);
    const toast = useToast();

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        toast.show({
            placement: 'top',
            render: ({ id }: { id: string }) => (
                <SanctuaryToast
                    message={message}
                    type={type}
                    visible={true}
                    onHide={() => toast.close(id)}
                />
            )
        });
    };

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
            color: Theme.colors?.emberRed || '#E53E3E',
            label: 'PDF',
        },
        link: {
            icon: LinkIcon,
            color: colors?.action || '#3182CE',
            label: 'Link',
        },
        note: {
            icon: FileText,
            color: Theme.colors?.sageGreen || '#48BB78',
            label: 'Note',
        },
        video: {
            icon: Video,
            color: Theme.colors?.skyBlue || '#63B3ED',
            label: 'Video',
        },
        text: {
            icon: FileText,
            color: Theme.colors?.sageGreen || '#48BB78',
            label: 'Article',
        },
        doc: {
            icon: FileText,
            color: Theme.colors?.ink || '#2D3748',
            label: 'Document',
        },
    };

    const getResourceConfig = (type: string) => {
        return RESOURCE_TYPE_CONFIG[type] || RESOURCE_TYPE_CONFIG['note'] || {
            icon: FileText,
            color: Theme.colors?.ink || '#2D3748',
            label: type,
        };
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
            onSuccess: (newResource: any) => {
                hapticSuccess();
                if (newResource) {
                    setResources((prev: ClassroomResource[]) => [newResource, ...prev]);
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
            if (!user?.id) {
                showToast('Please sign in to publish resources', 'error');
                return Promise.reject(new Error('Not authenticated'));
            }
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
                user.id,
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
        if (!user?.id) {
            showToast('Please sign in to add resources', 'error');
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
    }) as ClassroomResource[];

    const renderResourceCard = (resource: ClassroomResource) => {
        const config = getResourceConfig(resource.type);
        const ResourceIcon = config.icon;
        const iconColor = config.color;

        return (
            <Box
                key={resource.id}
                sx={{
                    backgroundColor: colors?.surface || '#FFFFFF',
                    borderRadius: Theme.corners?.generous || 16,
                    padding: Theme.spacing?.md || 16,
                    marginBottom: Theme.spacing?.md || 16,
                    borderWidth: resource.is_pinned ? 2 : 1,
                    borderColor: resource.is_pinned ? Theme.colors?.sanctuarySaffron || '#ECC94B' : colors?.border || '#E2E8F0',
                }}
            >
                <VStack sx={{ gap: Theme.spacing?.sm || 8 }}>
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: Theme.spacing?.md || 16 }}>
                        <HStack sx={{ flex: 1, alignItems: 'center', gap: Theme.spacing?.sm || 8 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: Theme.corners?.comfortable || 8,
                                    backgroundColor: colors?.tertiary || '#EDF2F7',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <ResourceIcon color={iconColor} size={20} />
                            </Box>
                            <VStack sx={{ flex: 1 }}>
                                <Text sx={{ color: colors?.surface || '#2D3748', fontSize: Theme.typography?.fontSize?.md || 16, fontWeight: '700' as const }}>
                                    {resource.title}
                                </Text>
                                <Text sx={{ color: colors?.surface || '#2D3748', opacity: 0.7, fontSize: Theme.typography?.fontSize?.xs || 12 }}>
                                    {config.label}
                                </Text>
                            </VStack>
                        </HStack>

                        {resource.is_pinned && (
                            <Box
                                sx={{
                                    backgroundColor: Theme.colors?.sanctuarySaffron || '#ECC94B',
                                    borderRadius: Theme.corners?.tight || 4,
                                    padding: 4,
                                }}
                            >
                                <Pin color={Theme.colors?.sacredWhite || '#FFFFFF'} size={14} fill={Theme.colors?.sacredWhite || '#FFFFFF'} />
                            </Box>
                        )}
                    </HStack>

                    {resource.description && (
                        <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                            {resource.description}
                        </Text>
                    )}

                    <HStack sx={{ gap: Theme.spacing.sm, justifyContent: 'flex-end', marginTop: Theme.spacing.sm }}>
                        <Pressable 
                            accessibilityRole="button"
                            accessibilityLabel={t('library.publishToGlobal') || 'Publish to Global Library'}
                            accessibilityHint="Publishes this resource to the global library"
                            onPress={() => publishMutation.mutate(resource)}
                        >
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.tertiary,
                                    borderColor: colors.border,
                                    borderWidth: 1,
                                }}
                            >
                                <Share2 color={Theme.colors.amberGlow} size={18} />
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
                                    addedAt: new Date().toISOString()
                                });
                                showToast('Saved to Personal Desk', 'success');
                                hapticSuccess();
                            }
                        }}>
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.tertiary,
                                    borderColor: colors.border,
                                    borderWidth: 1,
                                }}
                            >
                                <Download color={Theme.colors.skyBlue} size={18} />
                            </Box>
                        </Pressable>

                        <Pressable 
                            accessibilityRole="button"
                            accessibilityLabel={resource.is_pinned ? t('library.unpin') || 'Unpin' : t('library.pin') || 'Pin'}
                            accessibilityHint="Pins or unpins this resource to the top of the list"
                            onPress={() => togglePin(resource.id)}
                        >
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.tertiary,
                                    borderColor: colors.border,
                                    borderWidth: 1,
                                }}
                            >
                                <Pin
                                    color={resource.is_pinned ? Theme.colors.sanctuarySaffron : colors.textTertiary}
                                    size={18}
                                    fill={resource.is_pinned ? Theme.colors.sanctuarySaffron : 'none'}
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
                                <Box
                                    sx={{
                                        padding: Theme.spacing.sm,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: colors.tertiary,
                                        borderColor: colors.border,
                                        borderWidth: 1,
                                    }}
                                >
                                    <ExternalLink color={colors.textSecondary} size={18} />
                                </Box>
                            </Pressable>
                        )}

                        <Pressable 
                            accessibilityRole="button"
                            accessibilityLabel={t('library.deleteResource') || 'Delete Resource'}
                            accessibilityHint="Permanently deletes this resource"
                            onPress={() => deleteResource(resource.id)}
                        >
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.tertiary,
                                    borderColor: colors.border,
                                    borderWidth: 1,
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
                                        const doImport = () => {
                                            if (!user?.id) {
                                                showToast('Please sign in to import resources', 'error');
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
                                                is_pinned: false
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
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        <SkeletonCard height={120} />
                        <SkeletonCard height={120} />
                        <SkeletonCard height={120} />
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

            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('library.addResource') || 'Add Resource'}
                accessibilityHint="Opens a modal to add a new resource"
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
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        justifyContent: 'center',
                        alignItems: 'center',
                        ...Theme.shadows.lg,
                    }}
                >
                    <Plus color={Theme.colors.white} size={24} />
                </Box>
            </Pressable>

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
                        <Heading sx={{ color: colors.text, fontSize: Theme.typography.fontSize.lg }}>
                            {t('library.addResource')}
                        </Heading>
                    </ModalHeader>

                    <ModalBody>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <VStack sx={{ gap: Theme.spacing.md }}>
                                <VStack sx={{ gap: Theme.spacing.xs }}>
                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                        {t('library.resourceType')}
                                    </Text>
                                    <HStack sx={{ gap: Theme.spacing.sm, flexWrap: 'wrap' }}>
                                        {(['note', 'link', 'pdf', 'video', 'text', 'doc'] as ResourceType[]).map((type) => (
                                            <Pressable
                                                key={type}
                                                onPress={() => {
                                                    hapticLight();
                                                    setNewResourceType(type);
                                                }}
                                                style={{ width: '31%' }}
                                                accessibilityRole="button"
                                                accessibilityLabel={`Select ${getResourceConfig(type).label} type`}
                                                accessibilityHint={`Sets the new resource type to ${getResourceConfig(type).label}`}
                                            >
                                                <Box
                                                    sx={{
                                                        padding: Theme.spacing.sm,
                                                        borderRadius: Theme.corners.comfortable,
                                                        backgroundColor: newResourceType === type ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                                        alignItems: 'center',
                                                        borderWidth: 1,
                                                        borderColor: newResourceType === type ? Theme.colors.sanctuarySaffron : colors.border,
                                                    }}
                                                >
                                                    <Text
                                                        sx={{
                                                            color: newResourceType === type ? Theme.colors.sacredWhite : colors.textSecondary,
                                                            fontSize: Theme.typography.fontSize.xs,
                                                            fontWeight: '700' as const
                                                        }}
                                                    >
                                                        {getResourceConfig(type).label}
                                                    </Text>
                                                </Box>
                                            </Pressable>
                                        ))}
                                    </HStack>
                                </VStack>

                                <VStack sx={{ gap: Theme.spacing.xs }}>
                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                        {t('library.titleLabel')}
                                    </Text>
                                    <Input sx={{ backgroundColor: colors.tertiary, borderColor: colors.border }}>
                                        <InputField
                                            placeholder={t('library.titlePlaceholder')}
                                            value={newResourceTitle}
                                            onChangeText={setNewResourceTitle}
                                            sx={{ color: colors.text }}
                                        />
                                    </Input>
                                </VStack>

                                <VStack sx={{ gap: Theme.spacing.xs }}>
                                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                        {t('library.descLabel')}
                                    </Text>
                                    <Input sx={{ backgroundColor: colors.tertiary, borderColor: colors.border }}>
                                        <InputField
                                            placeholder={t('library.descPlaceholder')}
                                            value={newResourceDescription}
                                            onChangeText={setNewResourceDescription}
                                            sx={{ color: colors.text }}
                                        />
                                    </Input>
                                </VStack>

                                {(newResourceType === 'pdf' || newResourceType === 'link' || newResourceType === 'video') && (
                                    <VStack sx={{ gap: Theme.spacing.xs }}>
                                        <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                            {t('library.urlLabel')}
                                        </Text>
                                        <Input sx={{ backgroundColor: colors.tertiary, borderColor: colors.border }}>
                                            <InputField
                                                placeholder="https://..."
                                                value={newResourceUrl}
                                                onChangeText={setNewResourceUrl}
                                                sx={{ color: colors.text }}
                                                autoCapitalize="none"
                                            />
                                        </Input>
                                    </VStack>
                                )}

                                {newResourceType === 'note' && (
                                    <VStack sx={{ gap: Theme.spacing.xs }}>
                                        <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>
                                            {t('library.contentLabel')}
                                        </Text>
                                        <Textarea sx={{ backgroundColor: colors.tertiary, borderColor: colors.border }}>
                                            <TextareaInput
                                                placeholder={t('library.contentPlaceholder')}
                                                value={newResourceContent}
                                                onChangeText={setNewResourceContent}
                                                sx={{ color: colors.text }}
                                            />
                                        </Textarea>
                                    </VStack>
                                )}
                            </VStack>
                        </ScrollView>
                    </ModalBody>

                    <ModalFooter>
                        <HStack sx={{ gap: Theme.spacing.sm }}>
                            <Button
                                variant="outline"
                                action="secondary"
                                onPress={() => setShowAddModal(false)}
                                sx={{ flex: 1, borderColor: colors.border }}
                            >
                                <ButtonText sx={{ color: colors.textSecondary }}>{t('common.cancel')}</ButtonText>
                            </Button>
                            <Button
                                action="primary"
                                onPress={addResource}
                                sx={{ flex: 1, backgroundColor: Theme.colors.sanctuarySaffron }}
                                isDisabled={!newResourceTitle.trim()}
                            >
                                <ButtonText sx={{ color: Theme.colors.white }}>{t('common.add')}</ButtonText>
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </ScreenWrapper>
    );
}
