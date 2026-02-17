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
} from '@/ui';
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
import Theme from '../../constants/Theme';
import { useThemedColors } from '../../hooks/useThemedColors';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { useResources } from '../../hooks/classroom/useResources';
import { useSafeMutation } from '../../hooks/useSafeMutation';
import { api } from '../../lib/api';
import { ClassroomResource } from '../../lib/api/types';
import { useStore } from '../../store/useStore';
import * as Linking from 'expo-linking';

interface ResourcesViewProps {
    classroomId: string;
    isTeacher: boolean;
}

export default function ResourcesView({ classroomId, isTeacher }: ResourcesViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const showToast = useStore(state => state.showToast);

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
                teacher_id: 'current-teacher-id', // TODO: Get from auth context
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
                // Refresh is handled by useResources hook automatically via cache/subscription if we had it, 
                // but for now we might want to manually trigger refresh or optimistic update.
                // The hook exposes setResources which we can use for optimistic updates if needed,
                // but useSafeMutation doesn't return the new item in onSuccess unless we pass it.
                // For simplicity, we'll rely on the hook's refreshData if available or just wait for re-fetch.
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
                // Revert would happen here if we tracked previous state
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
            Linking.openURL(resource.url).catch(err => {
                showToast('Could not open link', 'error');
                console.error("Couldn't open page", err);
            });
        }
        // For notes, we might open a modal or navigate to detail view
        // For now, notes are displayed in the list or ignored if too long
    };

    const filteredResources = resources.filter(r => {
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
        <Box sx={{ flex: 1 }}>
            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, gap: 8, paddingBottom: Theme.spacing.md }}
            >
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
                        }}
                    >
                        <Text color={filterType === ft ? Theme.colors.white : colors.textSecondary} size="sm" textTransform="capitalize">
                            {ft}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Content List */}
            <VStack space="md" sx={{ paddingHorizontal: Theme.spacing.md, paddingBottom: 100 }}>
                {filteredResources.length === 0 && !isLoading && (
                    <Box alignItems="center" py="$8">
                        <Text color={colors.textTertiary}>No resources found.</Text>
                    </Box>
                )}

                {filteredResources.map(resource => (
                    <Pressable
                        key={resource.id}
                        onPress={() => handleOpenResource(resource)}
                        sx={{
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.comfortable,
                            padding: Theme.spacing.md,
                            borderLeftWidth: resource.is_pinned ? 3 : 0,
                            borderLeftColor: Theme.colors.sanctuarySaffron
                        }}
                    >
                        <HStack justifyContent="space-between" alignItems="flex-start">
                            <HStack space="md" alignItems="flex-start" flex={1}>
                                <Box
                                    p="$2"
                                    borderRadius="$md"
                                    bg={colors.tertiary}
                                >
                                    <Icon as={getIcon(resource.type)} color={colors.text} size="md" />
                                </Box>
                                <VStack flex={1}>
                                    <HStack alignItems="center" space="xs">
                                        <Text color={colors.text} bold numberOfLines={1}>
                                            {resource.title}
                                        </Text>
                                        {resource.is_pinned && <Icon as={Pin} size="xs" color={Theme.colors.sanctuarySaffron} />}
                                    </HStack>

                                    {resource.type === 'note' && resource.content ? (
                                        <Text color={colors.textSecondary} size="sm" numberOfLines={2}>
                                            {resource.content}
                                        </Text>
                                    ) : (
                                        <Text color={colors.textTertiary} size="xs" numberOfLines={1}>
                                            {resource.url || 'No content'}
                                        </Text>
                                    )}
                                </VStack>
                            </HStack>

                            {isTeacher && (
                                <HStack space="sm">
                                    <Pressable
                                        p="$2"
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            togglePinMutation.mutate({ id: resource.id, isPinned: !resource.is_pinned });
                                        }}
                                    >
                                        <Icon
                                            as={Pin}
                                            size="sm"
                                            color={resource.is_pinned ? Theme.colors.sanctuarySaffron : colors.textTertiary}
                                            fill={resource.is_pinned ? Theme.colors.sanctuarySaffron : 'none'}
                                        />
                                    </Pressable>
                                    <Pressable
                                        p="$2"
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            // Confirm delete logic could go here
                                            deleteMutation.mutate(resource.id);
                                        }}
                                    >
                                        <Icon as={Trash2} size="sm" color={Theme.colors.emberRed} />
                                    </Pressable>
                                </HStack>
                            )}
                        </HStack>
                    </Pressable>
                ))}
            </VStack>

            {/* Add Resource FAB */}
            {isTeacher && (
                <Button
                    size="lg"
                    variant="solid"
                    action="primary"
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
                    }}
                >
                    <ButtonText color={Theme.colors.white} mr="$2">Add Resource</ButtonText>
                    <Plus color={Theme.colors.white} size={20} />
                </Button>
            )}

            {/* Add Resource Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
            >
                <ModalBackdrop />
                <ModalContent bg={colors.primary}>
                    <ModalHeader>
                        <Heading size="lg" color={colors.text}>Add Classroom Resource</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack space="md">
                            <VStack space="xs">
                                <Text color={colors.text} size="sm">Title</Text>
                                <Input>
                                    <InputField
                                        placeholder="e.g. Science Syllabus, Lab Safety Video"
                                        color={colors.text}
                                        value={title}
                                        onChangeText={setTitle}
                                    />
                                </Input>
                            </VStack>

                            <VStack space="xs">
                                <Text color={colors.text} size="sm">Type</Text>
                                <HStack space="sm">
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
                                        >
                                            <Text color={type === t ? 'white' : colors.text} textTransform="capitalize" bold={type === t}>
                                                {t}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </HStack>
                            </VStack>

                            <VStack space="xs">
                                <Text color={colors.text} size="sm">
                                    {type === 'note' ? 'Content' : 'URL'}
                                </Text>
                                {type === 'note' ? (
                                    <Textarea>
                                        <TextareaInput
                                            placeholder="Enter note content..."
                                            color={colors.text}
                                            value={content}
                                            onChangeText={setContent}
                                        />
                                    </Textarea>
                                ) : (
                                    <Input>
                                        <InputField
                                            placeholder="https://..."
                                            keyboardType="url"
                                            autoCapitalize="none"
                                            color={colors.text}
                                            value={content}
                                            onChangeText={setContent}
                                        />
                                    </Input>
                                )}
                            </VStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outline"
                            action="secondary"
                            mr="$3"
                            onPress={() => setShowAddModal(false)}
                        >
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button
                            action="primary"
                            onPress={() => {
                                addResourceMutation.mutate({ title, type, content });
                            }}
                            sx={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                            disabled={!title || !content || addResourceMutation.isLoading}
                        >
                            <ButtonText>
                                {addResourceMutation.isLoading ? 'Adding...' : 'Add Resource'}
                            </ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
