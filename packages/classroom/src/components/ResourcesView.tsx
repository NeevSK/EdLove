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
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Input,
    InputField,
    Textarea,
    TextareaInput,
    Icon,
    CloseIcon
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
import { Theme } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { hapticLight, hapticSuccess, openExternalURL, showExternalLinkOptions } from '@repo/ui';
import { useResources } from '../hooks/useResources';
import { api, CLASSROOM_RESOURCE_SCOPE, ClassroomResource, useStore, useSafeMutation } from '@repo/core';

interface ResourcesViewProps {
    classroomId: string;
    isTeacher: boolean;
}

export default function ResourcesView({ classroomId, isTeacher }: ResourcesViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
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
            onError: (error, variables, context) => {
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
            }).catch(err => {
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
        }).catch((err) => {
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
        <VStack sx={{ flex: 1 }}
            {/* Filters */}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                sx={{ maxHeight: 60 }}
                contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, gap: 8, paddingBottom: Theme.spacing.md }}>
            
                {(['all', 'link', 'pdf', 'note'] as const).map(ft => (
                    <Pressable
                        key={ft}
                        onPress={() => setFilterType(ft)}
                        sx={{
                            paddingHorizontal: Theme.spacing.md,
                            paddingVertical: Theme.spacing.xs,
                            borderRadius: Theme.corners.full,
                            backgroundColor: filterType === ft ? Theme.colors.sanctuarySaffron : 'transparent',
                            borderWidth: 1,
                            borderColor: filterType === ft ? Theme.colors.sanctuarySaffron : colors.border,
                            height: 32,
                            justifyContent: 'center'
                        }}
                    
                        <Text color={filterType === ft ? Theme.colors.sacredWhite : colors.textSecondary} sx={{ fontSize: 13, textTransform: 'capitalize' }}
                            {ft}>
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Content List */}
            <ScrollView
                <VStack >sx={{ paddingHorizontal: Theme.spacing.md, paddingBottom: 100, gap: Theme.spacing.md }}
                    {filteredResources.length === 0 && !isLoading && (
                        <Box sx={{ alignItems: 'center', paddingVertical: 32 }}
                            <Text color={colors.textTertiary}>No resources found.</Text
                        ></Box
                    )}

                    {filteredResources.map(resource => (
                        <Pressable
                            key={resource.id}
                            onPress={() => handleOpenResource(resource)}
                            onLongPress={() => resource.url && handleOpenResourceOptions(resource)}
                            sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.comfortable,
                                padding: Theme.spacing.md,
                                borderLeftWidth: resource.is_pinned ? 3 : 0,
                                borderLeftColor: Theme.colors.sanctuarySaffron
                            }}
                        
                            <HStack justifyContent="space-between" alignItems="flex-start"
                                <HStack sx={{ alignItems: 'flex-start', flex: 1, gap: Theme.spacing.md }}>
                                    <Box
                                        sx={{
                                            padding: 8,
                                            borderRadius: Theme.corners.comfortable,
                                            backgroundColor: colors.tertiary>
                                        }}
                                    
                                        <Icon as={getIcon(resource.type)} sx={{ color: colors.text, width: 20, height: 20 }} /
                                    ></Box
                                    ><VStack sx={{ flex: 1 }}
                                        <HStack sx={{ alignItems: 'center', gap: 4 }}>
                                            <Text color={colors.text} sx={{ fontWeight: 'bold' }} numberOfLines={1}
                                                {resource.title}>
                                            </Text>
                                            {resource.is_pinned && <Icon as={Pin} sx={{ width: 12, height: 12, color: Theme.colors.sanctuarySaffron }} />}
                                        </HStack>

                                        {resource.type === 'note' && resource.content ? (
                                            <Text color={colors.textSecondary} sx={{ fontSize: 13 }} numberOfLines={2}
                                                {resource.content}>
                                            </Text>
                                        ) : (
                                            <Text color={colors.textTertiary} sx={{ fontSize: 12 }} numberOfLines={1}
                                                {resource.url || 'No content'}>
                                            </Text>
                                        )}
                                    </VStack>
                                </HStack>

                                {isTeacher && (
                                    <HStack sx={{ gap: Theme.spacing.sm }}
                                        <Pressable
                                            sx={{ padding: 8 }}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                togglePinMutation.mutate({ id: resource.id, isPinned: !resource.is_pinned });
                                            }}
                                        
                                            <Icon
                                                as={Pin}
                                                fill={resource.is_pinned ? Theme.colors.sanctuarySaffron : 'none'}
                                                sx={{ width: 16, height: 16, color: resource.is_pinned ? Theme.colors.sanctuarySaffron : colors.textTertiary }}
                                            /
                                        ></Pressable
                                        <Pressable
                                            sx={{ padding: 8 }}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                deleteMutation.mutate(resource.id);
                                            }}
                                        
                                            <Icon as={Trash2} sx={{ width: 16, height: 16, color: Theme.colors.emberRed }} /
                                        ></Pressable
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
                    size="lg"
                    variant="solid"
                    onPress={() => setShowAddModal(true)}
                    sx={{
                        position: 'absolute',
                        bottom: 20,
                        right: 20,
                        borderRadius: Theme.corners.full,
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4.65,
                        elevation: 8,
                        flexDirection: 'row',
                        paddingHorizontal: 16,
                    }}
                
                    <ButtonText sx={{ color: Theme.colors.sacredWhite, marginRight: Theme.spacing.sm }}
                        {t('classroom.resources.addResource') || 'Add Resource'}>
                    </ButtonText>
                    <Plus color={Theme.colors.sacredWhite} size={20} /
                ></Button
            )}

            {/* Add Resource Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
            
                <ModalBackdrop /
                ><ModalContent sx={{ backgroundColor: colors.primary }}
                    <ModalHeader
                        <Heading >sx={{ fontSize: 18, color: colors.text }}>{t('classroom.resources.addModalTitle') || 'Add Classroom Resource'}</Heading
                        ><ModalCloseButton
                            <Icon >as={CloseIcon} sx={{ color: colors.textTertiary }} /
                        ></ModalCloseButton
                    </ModalHeader>
                    <ModalBody
                        <VStack >sx={{ gap: Theme.spacing.md }}>
                            <VStack sx={{ gap: 4 }}
                                <Text sx={{ color: colors.text, fontSize: 13 }}>{t('classroom.resources.titleLabel') || 'Title'}</Text
                                ><Input sx={{ borderRadius: Theme.corners.comfortable, borderColor: colors.border }}
                                    <InputField
                                        placeholder={t('classroom.resources.titlePlaceholder') || "e.g. Science Syllabus, Lab Safety Video"}
                                        sx={{ color: colors.text }}
                                        value={title}
                                        onChangeText={setTitle}
                                    /
                                ></Input
                            ></VStack>

                            <VStack sx={{ gap: 4 }}
                                <Text sx={{ color: colors.text, fontSize: 13 }}>{t('classroom.resources.typeLabel') || 'Type'}</Text
                                ><HStack sx={{ gap: Theme.spacing.sm }}
                                    {(['link', 'pdf', 'note'] as const).map(t => (
                                        <Pressable
                                            key={t}
                                            onPress={() => setType(t)}
                                            sx={{
                                                flex: 1,
                                                paddingVertical: 8,
                                                alignItems: 'center',
                                                borderRadius: Theme.corners.comfortable,
                                                backgroundColor: type === t ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                            }}
                                        
                                            <Text sx={{ color: type === t ? 'white' : colors.text, textTransform: 'capitalize', fontWeight: type === t ? 'bold' : 'normal' }}
                                                {t}>
                                            </Text>
                                        </Pressable>
                                    ))}
                                </HStack>
                            </VStack>

                            <VStack sx={{ gap: 4 }}
                                <Text sx={{ color: colors.text, fontSize: 13 }}>
                                    {type === 'note' ? (t('classroom.resources.contentLabel') || 'Content') : (t('classroom.resources.urlLabel') || 'URL')}
                                </Text>
                                {type === 'note' ? (
                                    <Textarea sx={{ borderRadius: Theme.corners.comfortable, borderColor: colors.border }}
                                        <TextareaInput
                                            placeholder={t('classroom.resources.contentPlaceholder') || "Enter note content..."}
                                            sx={{ color: colors.text }}
                                            value={content}
                                            onChangeText={setContent}
                                        /
                                    ></Textarea
                                ) : (
                                    <Input sx={{ borderRadius: Theme.corners.comfortable, borderColor: colors.border }}
                                        <InputField
                                            placeholder="https://..."
                                            keyboardType="url"
                                            autoCapitalize="none"
                                            sx={{ color: colors.text }}
                                            value={content}
                                            onChangeText={setContent}
                                        /
                                    ></Input
                                )}
                            </VStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter sx={{ gap: Theme.spacing.sm }}
                        <Button
                            variant="outline"
                            onPress={() => setShowAddModal(false)}
                            sx={{
                                flex: 1,
                                borderColor: colors.border
                            }}
                        
                            <ButtonText sx={{ color: colors.textSecondary }}>{t('common.cancel') || 'Cancel'}</ButtonText
                        ></Button
                        <Button
                            onPress={() => {
                                addResourceMutation.mutate({ title, type, content });
                            }}
                            sx={{
                                flex: 2,
                                backgroundColor: Theme.colors.sanctuarySaffron,
                                borderRadius: Theme.corners.comfortable
                            }}
                            disabled={!title || !content || addResourceMutation.isLoading}
                        
                            <ButtonText sx={{ color: Theme.colors.sacredWhite }}
                                {addResourceMutation.isLoading ? (t('common.adding') || 'Adding...') : (t('classroom.resources.addResource') || 'Add Resource')}>
                            </ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    );
}
