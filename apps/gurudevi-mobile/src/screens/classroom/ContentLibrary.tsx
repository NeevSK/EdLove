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
import { hapticLight } from '../../utils/haptics';
import { useThemedColors } from '../../hooks/useThemedColors';
import { useTranslation } from 'react-i18next';
import GlobalHeader from '../../components/shared/GlobalHeader';
import ScreenWrapper from '../../components/shared/ScreenWrapper';

// Types
export type ResourceType = 'pdf' | 'link' | 'note';

export interface Resource {
    id: string;
    title: string;
    description?: string;
    type: ResourceType;
    url?: string;
    content?: string;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function ContentLibrary() {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [resources, setResources] = useState<Resource[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newResourceType, setNewResourceType] = useState<ResourceType>('note');
    const [newResourceTitle, setNewResourceTitle] = useState('');
    const [newResourceDescription, setNewResourceDescription] = useState('');
    const [newResourceUrl, setNewResourceUrl] = useState('');
    const [newResourceContent, setNewResourceContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            // Mock data for now
            const mockResources: Resource[] = [
                {
                    id: '1',
                    title: 'Mathematics Chapter 5',
                    description: 'Algebra basics and equations',
                    type: 'pdf',
                    url: 'https://example.com/math-ch5.pdf',
                    isPinned: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    title: 'Khan Academy - Algebra',
                    description: 'Interactive algebra tutorials',
                    type: 'link',
                    url: 'https://www.khanacademy.org/math/algebra',
                    isPinned: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: '3',
                    title: 'Homework for Week 5',
                    description: 'Complete exercises 1-10 from textbook',
                    type: 'note',
                    content: 'Students should complete exercises 1-10 from the textbook by Friday.',
                    isPinned: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];

            setResources(mockResources);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePin = (resourceId: string) => {
        hapticLight();
        setResources((prev) =>
            prev.map((resource) =>
                resource.id === resourceId
                    ? { ...resource, isPinned: !resource.isPinned }
                    : resource
            )
        );
    };

    const deleteResource = (resourceId: string) => {
        hapticLight();
        setResources((prev) => prev.filter((resource) => resource.id !== resourceId));
    };

    const addResource = () => {
        hapticLight();

        if (!newResourceTitle.trim()) {
            return;
        }

        const generateId = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        };

        const newResource: Resource = {
            id: generateId(),
            title: newResourceTitle,
            description: newResourceDescription || undefined,
            type: newResourceType,
            url: newResourceUrl || undefined,
            content: newResourceContent || undefined,
            isPinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setResources((prev) => [newResource, ...prev]);

        // Reset form
        setNewResourceTitle('');
        setNewResourceDescription('');
        setNewResourceUrl('');
        setNewResourceContent('');
        setNewResourceType('note');
        setShowAddModal(false);
    };

    const sortedResources = [...resources].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const filteredResources = sortedResources.filter((r: Resource) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderResourceCard = (resource: Resource) => {
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
                    borderWidth: resource.isPinned ? 2 : 1,
                    borderColor: resource.isPinned ? colors.action : colors.border,
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
                        {resource.isPinned && (
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
                                        resource.isPinned
                                            ? colors.action
                                            : colors.textTertiary
                                    }
                                    size={18}
                                    fill={resource.isPinned ? colors.action : 'none'}
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
                    <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}>
                        <Text color={colors.textSecondary}>{t('common.loading')}</Text>
                    </Box>
                ) : filteredResources.length === 0 ? (
                    <Box
                        sx={{
                            padding: Theme.spacing.xl,
                            alignItems: 'center',
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.generous,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                    >
                        <FileText color={colors.textTertiary} size={48} />
                        <Text color={colors.textSecondary} mt="$4" textAlign="center">
                            {t('library.noResources')}
                        </Text>
                    </Box>
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
