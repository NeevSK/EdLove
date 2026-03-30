/**
 * ANNOUNCEMENTS SCREEN
 * 
 * School-wide news feed for announcements.
 * Features:
 * - Pinned posts at the top (distinct background)
 * - Regular posts in chronological order
 * - "+ Create Announcement" FAB for principals
 * - Filter by school_id
 * 
 * Mission 06: Community & Onboarding
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
import { Theme } from '@repo/ui';
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
        <Box>
            sx={{
                flex: 1,
                backgroundColor: Theme.colors.obsidian,
            }}
                    <ScrollView                <VStack >space="lg" sx={{ padding: Theme.spacing.lg }}                    {/* Header */}
                    <HStack>
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                                            <Heading size="2xl" color={Theme.colors.sanctuarySaffron}                            {t('announcements.title') || '\uD83D\uDCE2 Announcements'}>
                        </Heading                    ></HStack>
                    {/* Create Button (Privileged Roles Only) */}
                    {can('create', 'Announcement') && (
                        <Button>
                            sx={{
                                backgroundColor: Theme.colors.sanctuarySaffron,
                                padding: Theme.spacing.lg,
                            }}
                            onPress={() => setShowCreateModal(true)}
                                                    <ButtonText color={Theme.colors.sacredWhite}                                {t('announcements.create') || '+ Create Announcement'}>
                            </ButtonText                        ></Button                    >)}>

                    {/* Loading State */}
                    {isLoading && (
                        <VStack space="md"                            <SkeletonCard height={120} /                            ><SkeletonCard height={120} /                            ><SkeletonCard height={120} /                        ></VStack                    >)}

                    {/* Error State */}
                    {error && !isLoading && (
                        <Box>
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: Theme.colors.emberRed,
                                borderRadius: Theme.corners.comfortable,
                            }}
                                                    <Text color={Theme.colors.sacredWhite}>{error}</Text                        ></Box                    >)}

                    {/* Pinned Announcements */}
                    {!isLoading && pinnedAnnouncements.length > 0 && (
                        <VStack space="md"                            <Text>
                                color={Theme.colors.starlightGray}
                                size="sm"
                                sx={{ fontWeight: '600' }}
                                                            {t('announcements.pinned') || '\uD83D\uDCCC PINNED'}
                            </Text>
                            {pinnedAnnouncements.map((announcement) => (
                                <Box>
                                    key={announcement.id}
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: Theme.colors.shadowViolet,
                                        borderRadius: Theme.corners.comfortable,
                                        borderLeftWidth: 4,
                                        borderLeftColor: Theme.colors.templeGold,
                                    }}
                                                                    <VStack space="sm"                                        {/* Header */}>
                                        <HStack>
                                            sx={{
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                                                                    <HStack space="sm" sx={{ alignItems: 'center' }}                                                <Text color={Theme.colors.sacredWhite}                                                    {announcement.author_name || 'Unknown'}>
                                                </Text                                            ></HStack>
                                            <Text color={Theme.colors.mistGray} size="xs"                                                {formatDate(announcement.created_at)}>
                                            </Text                                        ></HStack>
                                        {/* Content */}
                                        <Text color={Theme.colors.sacredWhite} size="md"                                            {announcement.content}>
                                        </Text                                    ></VStack                                ></Box                            ))}>
                        </VStack                    )}

                    {/* Regular Announcements */}
                    {!isLoading && regularAnnouncements.length > 0 && (
                        <VStack space="md"                            {pinnedAnnouncements.length > 0 && (
                                <Text>
                                    color={Theme.colors.starlightGray}
                                    size="sm"
                                    sx={{ fontWeight: '600', marginTop: Theme.spacing.md }}
                                                                    {t('announcements.recent') || 'RECENT'}
                                </Text                            >)}

                            {regularAnnouncements.map((announcement) => (
                                <Box>
                                    key={announcement.id}
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: Theme.colors.ink,
                                        borderRadius: Theme.corners.comfortable,
                                    }}
                                                                    <VStack space="sm"                                        {/* Header */}>
                                        <HStack>
                                            sx={{
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                                                                    <HStack space="sm" sx={{ alignItems: 'center' }}                                                <Text color={Theme.colors.sacredWhite}                                                    {announcement.author_name || 'Unknown'}>
                                                </Text                                            ></HStack>
                                            <Text color={Theme.colors.mistGray} size="xs"                                                {formatDate(announcement.created_at)}>
                                            </Text                                        ></HStack>
                                        {/* Content */}
                                        <Text color={Theme.colors.starlightGray} size="md"                                            {announcement.content}>
                                        </Text                                    ></VStack                                ></Box                            ))}>
                        </VStack                    )}

                    {/* Empty State */}
                    {!isLoading && announcements.length === 0 && (
                        <Box>
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                            }}
                                                    <Text>
                                size="lg"
                                color={Theme.colors.starlightGray}
                                textAlign="center">
                                                            {t('announcements.noAnnouncements') ||
                                    'No announcements yet. Check back soon!'}
                            </Text                        ></Box                    >)}
                </VStack            </ScrollView
            {/* Create Announcement Modal */}
            <Modal>
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setNewAnnouncementContent('');
                    setIsPinned(false);
                }}
                            <ModalBackdrop /                ><ModalContent
                    sx={{
                        backgroundColor: Theme.colors.ink,
                    }}
                                    <ModalHeader                        <Heading >size="lg" color={Theme.colors.sanctuarySaffron}                            {t('announcements.createTitle') || 'Create Announcement'}
                        </Heading                    ></ModalHeader                    <ModalBody                        <VStack >space="md"                            <Textarea
                                sx={{
                                    backgroundColor: Theme.colors.obsidian,
                                    minHeight: 150,
                                }}
                                                            <TextareaInput>
                                    placeholder={
                                        t('announcements.contentPlaceholder') ||
                                        'Type your announcement...'>
                                    }
                                    value={newAnnouncementContent}
                                    onChangeText={setNewAnnouncementContent}
                                    sx={{
                                        color: Theme.colors.sacredWhite,
                                    }}
                                /                            ></Textarea
                            >{/* Pin Toggle */}
                            <HStack>
                                sx={{
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                                                            <Text color={Theme.colors.starlightGray}                                    {t('announcements.pinAnnouncement') || 'Pin to top'}>
                                </Text                                ><Switch value={isPinned} onValueChange={setIsPinned} /                            ></HStack                        ></VStack                    </ModalBody                    <ModalFooter                        <HStack space="md" sx={{ width: '100%' }}                            <Button
                                variant="outline"
                                sx={{ flex: 1, borderColor: Theme.colors.mistGray }}
                                onPress={() => {
                                    setShowCreateModal(false);
                                    setNewAnnouncementContent('');
                                    setIsPinned(false);
                                }}
                                disabled={isCreating}
                                                            <ButtonText color={Theme.colors.sacredWhite}                                    {t('common.cancel') || 'Cancel'}>
                                </ButtonText                            ></Button                            <Button
                                sx={{
                                    flex: 1,
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                }}
                                onPress={handleCreateAnnouncement}
                                disabled={isCreating}
                                                            {isCreating ? (
                                    <Spinner color={Theme.colors.sacredWhite} size="small" /                                >) : (
                                    <ButtonText color={Theme.colors.sacredWhite}                                        {t('announcements.post') || 'Post'}>
                                    </ButtonText                                >)}>
                            </Button                        ></HStack                    </ModalFooter                </ModalContent            </Modal        </Box    );
}
