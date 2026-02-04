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
} from "@gluestack-ui/themed";
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

// Resource type configuration
const RESOURCE_TYPE_CONFIG = {
    pdf: {
        icon: File,
        color: Theme.colors.emberRed,
        label: 'PDF',
    },
    link: {
        icon: LinkIcon,
        color: Theme.colors.sanctuarySaffron,
        label: 'Link',
    },
    note: {
        icon: FileText,
        color: Theme.colors.sageGreen,
        label: 'Note',
    },
};

export default function ContentLibrary() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newResourceType, setNewResourceType] = useState<ResourceType>('note');
    const [newResourceTitle, setNewResourceTitle] = useState('');
    const [newResourceDescription, setNewResourceDescription] = useState('');
    const [newResourceUrl, setNewResourceUrl] = useState('');
    const [newResourceContent, setNewResourceContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
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

        // Generate a unique ID using crypto or fallback to timestamp
        const generateId = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

    // Sort resources: pinned first, then by date
    const sortedResources = [...resources].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const renderResourceCard = (resource: Resource) => {
        const ResourceIcon = RESOURCE_TYPE_CONFIG[resource.type].icon;
        const iconColor = RESOURCE_TYPE_CONFIG[resource.type].color;

        return (
            <Box
                key={resource.id}
                sx={{
                    backgroundColor: Theme.colors.midnightBlue,
                    borderRadius: Theme.corners.generous,
                    padding: Theme.spacing.md,
                    marginBottom: Theme.spacing.md,
                    borderWidth: resource.isPinned ? 2 : 0,
                    borderColor: resource.isPinned ? Theme.colors.sanctuarySaffron : 'transparent',
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
                                    backgroundColor: Theme.colors.deepIndigo,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <ResourceIcon color={iconColor} size={20} />
                            </Box>
                            <VStack sx={{ flex: 1 }}>
                                <Text color={Theme.colors.sacredWhite} size="md" bold>
                                    {resource.title}
                                </Text>
                                <Text color={Theme.colors.mistGray} size="xs">
                                    {RESOURCE_TYPE_CONFIG[resource.type].label}
                                </Text>
                            </VStack>
                        </HStack>
                        
                        {/* Pin indicator */}
                        {resource.isPinned && (
                            <Box
                                sx={{
                                    backgroundColor: Theme.colors.sanctuarySaffron,
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
                        <Text color={Theme.colors.mistGray} size="sm">
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
                                    backgroundColor: Theme.colors.deepIndigo,
                                }}
                            >
                                <Pin
                                    color={
                                        resource.isPinned
                                            ? Theme.colors.sanctuarySaffron
                                            : Theme.colors.mistGray
                                    }
                                    size={18}
                                    fill={resource.isPinned ? Theme.colors.sanctuarySaffron : 'none'}
                                />
                            </Box>
                        </Pressable>
                        
                        {resource.type === 'link' && resource.url && (
                            <Pressable onPress={() => hapticLight()}>
                                <Box
                                    sx={{
                                        padding: Theme.spacing.sm,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: Theme.colors.deepIndigo,
                                    }}
                                >
                                    <ExternalLink color={Theme.colors.mistGray} size={18} />
                                </Box>
                            </Pressable>
                        )}
                        
                        <Pressable onPress={() => deleteResource(resource.id)}>
                            <Box
                                sx={{
                                    padding: Theme.spacing.sm,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: Theme.colors.deepIndigo,
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
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ padding: Theme.spacing.lg }}>
                {/* Header */}
                <VStack space="xs" mb="$6">
                    <Heading color={Theme.colors.sacredWhite} size="2xl">
                        Content Library
                    </Heading>
                    <Text color={Theme.colors.mistGray} size="sm">
                        Manage your teaching resources
                    </Text>
                </VStack>

                {/* Resources Grid */}
                {isLoading ? (
                    <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}>
                        <Text color={Theme.colors.mistGray}>Loading resources...</Text>
                    </Box>
                ) : sortedResources.length === 0 ? (
                    <Box
                        sx={{
                            padding: Theme.spacing.xl,
                            alignItems: 'center',
                            backgroundColor: Theme.colors.midnightBlue,
                            borderRadius: Theme.corners.generous,
                        }}
                    >
                        <FileText color={Theme.colors.mistGray} size={48} />
                        <Text color={Theme.colors.mistGray} mt="$4" textAlign="center">
                            No resources yet. Tap the + button to add your first resource.
                        </Text>
                    </Box>
                ) : (
                    <VStack space="md">
                        {sortedResources.map(renderResourceCard)}
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
                        backgroundColor: Theme.colors.sanctuarySaffron,
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
                        backgroundColor: Theme.colors.midnightBlue,
                        maxWidth: 500,
                    }}
                >
                    <ModalHeader>
                        <Heading color={Theme.colors.sacredWhite} size="lg">
                            Add Resource
                        </Heading>
                    </ModalHeader>
                    
                    <ModalBody>
                        <VStack space="md">
                            {/* Resource Type Selection */}
                            <VStack space="xs">
                                <Text color={Theme.colors.mistGray} size="sm">
                                    Resource Type
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
                                                            ? Theme.colors.sanctuarySaffron
                                                            : Theme.colors.deepIndigo,
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Text
                                                    color={
                                                        newResourceType === type
                                                            ? Theme.colors.white
                                                            : Theme.colors.mistGray
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
                                <Text color={Theme.colors.mistGray} size="sm">
                                    Title *
                                </Text>
                                <Input
                                    variant="outline"
                                    size="md"
                                    sx={{
                                        backgroundColor: Theme.colors.deepIndigo,
                                        borderColor: Theme.colors.transparent,
                                    }}
                                >
                                    <InputField
                                        placeholder="Enter title..."
                                        value={newResourceTitle}
                                        onChangeText={setNewResourceTitle}
                                        color={Theme.colors.sacredWhite}
                                        placeholderTextColor={Theme.colors.dimGray}
                                    />
                                </Input>
                            </VStack>

                            {/* Description */}
                            <VStack space="xs">
                                <Text color={Theme.colors.mistGray} size="sm">
                                    Description
                                </Text>
                                <Input
                                    variant="outline"
                                    size="md"
                                    sx={{
                                        backgroundColor: Theme.colors.deepIndigo,
                                        borderColor: Theme.colors.transparent,
                                    }}
                                >
                                    <InputField
                                        placeholder="Enter description..."
                                        value={newResourceDescription}
                                        onChangeText={setNewResourceDescription}
                                        color={Theme.colors.sacredWhite}
                                        placeholderTextColor={Theme.colors.dimGray}
                                    />
                                </Input>
                            </VStack>

                            {/* URL (for PDF and Link) */}
                            {(newResourceType === 'pdf' || newResourceType === 'link') && (
                                <VStack space="xs">
                                    <Text color={Theme.colors.mistGray} size="sm">
                                        URL
                                    </Text>
                                    <Input
                                        variant="outline"
                                        size="md"
                                        sx={{
                                            backgroundColor: Theme.colors.deepIndigo,
                                            borderColor: Theme.colors.transparent,
                                        }}
                                    >
                                        <InputField
                                            placeholder="https://..."
                                            value={newResourceUrl}
                                            onChangeText={setNewResourceUrl}
                                            color={Theme.colors.sacredWhite}
                                            placeholderTextColor={Theme.colors.dimGray}
                                            autoCapitalize="none"
                                            keyboardType="url"
                                        />
                                    </Input>
                                </VStack>
                            )}

                            {/* Content (for Note) */}
                            {newResourceType === 'note' && (
                                <VStack space="xs">
                                    <Text color={Theme.colors.mistGray} size="sm">
                                        Content
                                    </Text>
                                    <Textarea
                                        size="md"
                                        sx={{
                                            backgroundColor: Theme.colors.deepIndigo,
                                            borderColor: Theme.colors.transparent,
                                            minHeight: 100,
                                        }}
                                    >
                                        <TextareaInput
                                            placeholder="Enter note content..."
                                            value={newResourceContent}
                                            onChangeText={setNewResourceContent}
                                            color={Theme.colors.sacredWhite}
                                            placeholderTextColor={Theme.colors.dimGray}
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
                                    borderColor: Theme.colors.mistGray,
                                }}
                            >
                                <ButtonText color={Theme.colors.mistGray}>Cancel</ButtonText>
                            </Button>
                            <Button
                                action="primary"
                                onPress={addResource}
                                sx={{
                                    flex: 1,
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                }}
                                isDisabled={!newResourceTitle.trim()}
                            >
                                <ButtonText color={Theme.colors.white}>Add</ButtonText>
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
