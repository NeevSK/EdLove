/**
 * ANNOUNCEMENTS SCREEN
 * 
 * School-wide news feed for announcements.
 */

import React, { useState, useEffect } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    ScrollView,
    Button,
    ButtonText,
    Textarea,
    TextareaInput,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
    Switch,
    SkeletonCard,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { communityAPI as community } from '../api/community';
import { AnnouncementWithAuthor } from '../types/Community';
import { AuthorityTier, usePermissions } from '@repo/core';

interface AnnouncementsScreenProps {
    schoolId: string;
    userId: string;
    userAuthority: AuthorityTier;
}

export default function AnnouncementsScreen({
    schoolId,
    userId,
    userAuthority,
}: AnnouncementsScreenProps) {
    const { t } = useTranslation();
    const { can } = usePermissions();
    const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAnnouncements();
    }, [schoolId]);

    const loadAnnouncements = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await community.getAnnouncements(schoolId);
            setAnnouncements(data);
        } catch (err: any) {
            console.error('Failed to load announcements:', err);
            setError(err.message || 'Failed to load announcements');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAnnouncement = async () => {
        if (!newAnnouncementContent.trim()) {
            setError('Announcement content cannot be empty');
            return;
        }

        setIsCreating(true);
        setError(null);
        try {
            await community.createAnnouncement(
                schoolId,
                userId,
                newAnnouncementContent,
                isPinned
            );
            setNewAnnouncementContent('');
            setIsPinned(false);
            setShowCreateModal(false);
            await loadAnnouncements();
        } catch (err: any) {
            console.error('Failed to create announcement:', err);
            setError(err.message || 'Failed to create announcement');
        } finally {
            setIsCreating(false);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) {
            return t('announcements.justNow') || 'Just now';
        } else if (diffHours < 24) {
            return t('announcements.hoursAgo', { hours: diffHours }) || `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return t('announcements.daysAgo', { days: diffDays }) || `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    // Separate pinned and regular announcements
    const pinnedAnnouncements = announcements.filter((a) => a.is_pinned);
    const regularAnnouncements = announcements.filter((a) => !a.is_pinned);

    return (
        <Box className="flex-1 bg-background">
            <ScrollView>
                <VStack space="lg" className="p-4">
                    {/* Header */}
                    <HStack className="justify-between items-center">
                        <Heading size="2xl" className="text-primary-500">
                            {t('announcements.title') || '📢 Announcements'}
                        </Heading>
                    </HStack>

                    {/* Create Button (Privileged Roles Only) */}
                    {can('create', 'Announcement') && (
                        <Button
                            className="bg-primary-500 p-4"
                            onPress={() => setShowCreateModal(true)}
                        >
                            <ButtonText className="text-white">
                                {t('announcements.create') || '+ Create Announcement'}
                            </ButtonText>
                        </Button>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <VStack space="md">
                            <SkeletonCard height={120} />
                            <SkeletonCard height={120} />
                            <SkeletonCard height={120} />
                        </VStack>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <Box
                            className="p-4 bg-error-500 rounded-comfortable"
                        >
                            <Text className="text-white">{error}</Text>
                        </Box>
                    )}

                    {/* Pinned Announcements */}
                    {!isLoading && pinnedAnnouncements.length > 0 && (
                        <VStack space="md">
                            <Text
                                className="text-muted-foreground text-sm font-semibold"
                            >
                                {t('announcements.pinned') || '📌 PINNED'}
                            </Text>
                            {pinnedAnnouncements.map((announcement) => (
                                <Box
                                    key={announcement.id}
                                    className="p-4 bg-surface-low rounded-comfortable border-l-4 border-l-primary-500"
                                >
                                    <VStack space="sm">
                                        <HStack className="justify-between items-center">
                                            <HStack space="sm" className="items-center">
                                                <Text className="text-foreground font-bold">
                                                    {announcement.author_name || 'Unknown'}
                                                </Text>
                                            </HStack>
                                            <Text className="text-muted-foreground text-[10px]">
                                                {formatDate(announcement.created_at)}
                                            </Text>
                                        </HStack>
                                        <Text className="text-foreground text-base">
                                            {announcement.content}
                                        </Text>
                                    </VStack>
                                </Box>
                            ))}
                        </VStack>
                    )}

                    {/* Regular Announcements */}
                    {!isLoading && regularAnnouncements.length > 0 && (
                        <VStack space="md">
                            {pinnedAnnouncements.length > 0 && (
                                <Text
                                    className="text-muted-foreground text-sm font-semibold mt-4"
                                >
                                    {t('announcements.recent') || 'RECENT'}
                                </Text>
                            )}

                            {regularAnnouncements.map((announcement) => (
                                <Box
                                    key={announcement.id}
                                    className="p-4 bg-surface-lowest rounded-comfortable border border-outline-variant"
                                >
                                    <VStack space="sm">
                                        <HStack className="justify-between items-center">
                                            <HStack space="sm" className="items-center">
                                                <Text className="text-foreground font-bold">
                                                    {announcement.author_name || 'Unknown'}
                                                </Text>
                                            </HStack>
                                            <Text className="text-muted-foreground text-[10px]">
                                                {formatDate(announcement.created_at)}
                                            </Text>
                                        </HStack>
                                        <Text className="text-muted-foreground text-sm">
                                            {announcement.content}
                                        </Text>
                                    </VStack>
                                </Box>
                            ))}
                        </VStack>
                    )}

                    {/* Empty State */}
                    {!isLoading && announcements.length === 0 && (
                        <Box className="p-10 items-center">
                            <Text
                                className="text-lg text-muted-foreground text-center"
                            >
                                {t('announcements.noAnnouncements') ||
                                    'No announcements yet. Check back soon!'}
                            </Text>
                        </Box>
                    )}
                </VStack>
            </ScrollView>

            {/* Create Announcement Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setNewAnnouncementContent('');
                    setIsPinned(false);
                }}
            >
                <ModalBackdrop />
                <ModalContent className="bg-background">
                    <ModalHeader>
                        <Heading size="lg" className="text-primary-500">
                            {t('announcements.createTitle') || 'Create Announcement'}
                        </Heading>
                    </ModalHeader>
                    <ModalBody>
                        <VStack space="md">
                            <Textarea
                                className="bg-surface-lowest min-h-[150px] border border-outline-variant"
                            >
                                <TextareaInput
                                    placeholder={
                                        t('announcements.contentPlaceholder') ||
                                        'Type your announcement...'
                                    }
                                    value={newAnnouncementContent}
                                    onChangeText={setNewAnnouncementContent}
                                    className="text-foreground"
                                />
                            </Textarea>
                            {/* Pin Toggle */}
                            <HStack className="justify-between items-center">
                                <Text className="text-muted-foreground">
                                    {t('announcements.pinAnnouncement') || 'Pin to top'}
                                </Text>
                                <Switch value={isPinned} onValueChange={setIsPinned} />
                            </HStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack space="md" className="w-full">
                            <Button
                                variant="outline"
                                className="flex-1 border-outline-variant"
                                onPress={() => {
                                    setShowCreateModal(false);
                                    setNewAnnouncementContent('');
                                    setIsPinned(false);
                                }}
                                disabled={isCreating}
                            >
                                <ButtonText className="text-foreground">
                                    {t('common.cancel') || 'Cancel'}
                                </ButtonText>
                            </Button>
                            <Button
                                className="flex-1 bg-primary-500"
                                onPress={handleCreateAnnouncement}
                                disabled={isCreating}
                            >
                                {isCreating ? (
                                    <Spinner className="text-white" size="small" />
                                ) : (
                                    <ButtonText className="text-white">
                                        {t('announcements.post') || 'Post'}
                                    </ButtonText>
                                )}
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
