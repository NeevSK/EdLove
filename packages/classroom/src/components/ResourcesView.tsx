import React, { useState } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Heading,
    ScrollView,
    Button,
    ButtonText,
    Pressable,
    Input,
    InputField,
    Textarea,
    TextareaInput,
    Icon,
    SanctuaryModal,
} from '@repo/ui';
import {
    FileText,
    Link as LinkIcon,
    File,
    Plus,
    MoreVertical,
    Pin,
    Trash2,
    ExternalLink
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { hapticLight, hapticSuccess, openExternalURL, showExternalLinkOptions, theme } from '@repo/ui';
import { useResources } from '../hooks/useResources';
import { api, CLASSROOM_RESOURCE_SCOPE, ClassroomResource, useStore, useSafeMutation } from '@repo/core';

interface ResourcesViewProps {
    classroomId: string;
    isTeacher: boolean;
}

export default function ResourcesView({ classroomId, isTeacher }: ResourcesViewProps) {
    const { t } = useTranslation();
    const showToast = useStore(state => state.showToast);
    const user = useStore(state => state.user);

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
                is_pinned: false
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
            }
        }
    );

    const togglePinMutation = useSafeMutation(
        async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
            return api.resources.togglePin(id, isPinned);
        },
        {
            onMutate: ({ id, isPinned }) => {
                // Optimistic update
                setResources(prev => prev.map(r => r.id === id ? { ...r, is_pinned: isPinned } : r));
                hapticLight();
            },
            onError: (error: Error, variables, context) => {
                showToast('Failed to update pin', 'error');
            }
        }
    );

    const deleteMutation = useSafeMutation(
        async (id: string) => {
            return api.resources.delete(id);
        },
        {
            onMutate: (id) => {
                setResources(prev => prev.filter(r => r.id !== id));
                hapticLight();
            },
            onSuccess: () => {
                showToast('Resource removed', 'success');
            }
        }
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
            case 'link': return LinkIcon;
            case 'pdf': return FileText;
            case 'note': return File;
            default: return File;
        }
    };

    return (
    return (
        <VStack className="flex-1 bg-sanctuary-surface">
            {/* Filters */}
            <Box className="h-16">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="px-4 gap-2 items-center"
                >
                    {(['all', 'link', 'pdf', 'note'] as const).map(ft => (
                        <Pressable
                            key={ft}
                            onPress={() => setFilterType(ft)}
                            className={`px-6 py-2 rounded-full border items-center justify-center h-10 ${filterType === ft ? 'bg-sanctuarySaffron border-sanctuarySaffron' : 'border-sanctuary-border bg-sanctuary-surface-secondary/50'}`}
                        >
                            <Text className={`text-xs font-bold uppercase tracking-wider ${filterType === ft ? 'text-sanctuary-ink' : 'text-sanctuary-text-secondary'}`}>
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
                        <Box className="items-center py-20 bg-sanctuary-surface-secondary/30 rounded-[32px] border border-dashed border-sanctuary-border/50 mx-2">
                            <Text className="text-sanctuary-text-tertiary font-medium">No resources found.</Text>
                        </Box>
                    )}

                    {filteredResources.map(resource => (
                        <Pressable
                            key={resource.id}
                            onPress={() => handleOpenResource(resource)}
                            onLongPress={() => resource.url && handleOpenResourceOptions(resource)}
                            className={`p-4 bg-sanctuary-surface-secondary rounded-[24px] border border-sanctuary-border shadow-sm overflow-hidden ${resource.is_pinned ? 'border-l-4 border-l-sanctuarySaffron' : ''}`}
                        >
                            <HStack className="justify-between items-center">
                                <HStack className="items-center flex-1 gap-4">
                                    <Box className="p-3 bg-sanctuarySaffron/10 rounded-2xl items-center justify-center">
                                        <Icon as={getIcon(resource.type)} size="sm" className="text-sanctuarySaffron" />
                                    </Box>
                                    <VStack className="flex-1 gap-0.5">
                                        <HStack className="items-center gap-1.5">
                                            <Text className="text-base font-bold text-sanctuary-text" numberOfLines={1}>
                                                {resource.title}
                                            </Text>
                                            {resource.is_pinned && (
                                                <Icon as={Pin} size="xs" className="text-sanctuarySaffron" />
                                            )}
                                        </HStack>

                                        {resource.type === 'note' && resource.content ? (
                                            <Text className="text-sm font-medium text-sanctuary-text-secondary leading-snug" numberOfLines={2}>
                                                {resource.content}
                                            </Text>
                                        ) : (
                                            <Text className="text-xs font-medium text-sanctuary-text-tertiary" numberOfLines={1}>
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
                                                togglePinMutation.mutate({ id: resource.id, isPinned: !resource.is_pinned });
                                            }}
                                        >
                                            <Icon
                                                as={Pin}
                                                size="sm"
                                                className={resource.is_pinned ? 'text-sanctuarySaffron' : 'text-sanctuary-text-tertiary'}
                                                style={{ fill: resource.is_pinned ? theme.colors.sanctuarySaffron : 'none' }}
                                            />
                                        </Pressable>
                                        <Pressable
                                            className="p-3"
                                            onPress={(e: any) => {
                                                e.stopPropagation();
                                                deleteMutation.mutate(resource.id);
                                            }}
                                        >
                                            <Icon as={Trash2} size="sm" className="text-sanctuary-error" />
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
                    className="absolute bottom-10 right-6 bg-sanctuarySaffron rounded-full px-6 py-4 flex-row items-center gap-3 shadow-xl shadow-sanctuarySaffron/40"
                >
                    <ButtonText className="text-sanctuary-ink font-bold text-base">
                        {t('classroom.resources.addResource') || 'Add Resource'}
                    </ButtonText>
                    <Icon as={Plus} size="sm" className="text-sanctuary-ink" />
                </Button>
            )}

            {/* Add Resource Modal */}
            <SanctuaryModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={t('classroom.resources.addModalTitle') || 'Add Classroom Resource'}
                footer={
                    <HStack className="gap-4">
                        <Button
                            variant="outline"
                            onPress={() => setShowAddModal(false)}
                            className="flex-1 h-14 rounded-[24px] border-sanctuary-border"
                        >
                            <ButtonText className="text-sanctuary-text-secondary font-bold">{t('common.cancel') || 'Cancel'}</ButtonText>
                        </Button>
                        <Button
                            onPress={() => {
                                addResourceMutation.mutate({ title, type, content });
                            }}
                            className="flex-[2] h-14 bg-sanctuarySaffron rounded-[24px] shadow-md shadow-sanctuarySaffron/20"
                            disabled={!title || !content || addResourceMutation.isLoading}
                        >
                            <ButtonText className="text-sanctuary-ink font-bold">
                                {addResourceMutation.isLoading ? (t('common.adding') || 'Adding...') : (t('classroom.resources.addResource') || 'Add Resource')}
                            </ButtonText>
                        </Button>
                    </HStack>
                }
            >
                <VStack className="gap-8 p-1">
                    <VStack className="gap-2">
                        <Text className="text-sm font-bold text-sanctuary-text-secondary ml-1">{t('classroom.resources.titleLabel') || 'Title'}</Text>
                        <Input className="h-14 px-4 bg-sanctuary-surface-secondary rounded-[24px] border border-sanctuary-border">
                            <InputField
                                placeholder={t('classroom.resources.titlePlaceholder') || "e.g. Science Syllabus"}
                                className="text-sanctuary-text font-bold text-lg"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </Input>
                    </VStack>

                    <VStack className="gap-2">
                        <Text className="text-sm font-bold text-sanctuary-text-secondary ml-1">{t('classroom.resources.typeLabel') || 'Type'}</Text>
                        <HStack className="gap-3">
                            {(['link', 'pdf', 'note'] as const).map(t => (
                                <Pressable
                                    key={t}
                                    onPress={() => setType(t)}
                                    className={`flex-1 py-3 items-center justify-center rounded-2xl border ${type === t ? 'bg-sanctuarySaffron border-sanctuarySaffron' : 'bg-sanctuary-surface-secondary border-sanctuary-border'}`}
                                >
                                    <Text className={`text-sm font-bold uppercase tracking-wider ${type === t ? 'text-sanctuary-ink' : 'text-sanctuary-text-secondary'}`}>
                                        {t}
                                    </Text>
                                </Pressable>
                            ))}
                        </HStack>
                    </VStack>

                    <VStack className="gap-2">
                        <Text className="text-sm font-bold text-sanctuary-text-secondary ml-1">
                            {type === 'note' ? (t('classroom.resources.contentLabel') || 'Content') : (t('classroom.resources.urlLabel') || 'URL')}
                        </Text>
                        {type === 'note' ? (
                            <Textarea className="min-h-[120px] p-4 bg-sanctuary-surface-secondary rounded-[24px] border border-sanctuary-border">
                                <TextareaInput
                                    placeholder={t('classroom.resources.contentPlaceholder') || "Enter note content..."}
                                    className="text-sanctuary-text"
                                    value={content}
                                    onChangeText={setContent}
                                />
                            </Textarea>
                        ) : (
                            <Input className="h-14 px-4 bg-sanctuary-surface-secondary rounded-[24px] border border-sanctuary-border">
                                <InputField
                                    placeholder="https://..."
                                    keyboardType="url"
                                    autoCapitalize="none"
                                    className="text-sanctuary-text"
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
