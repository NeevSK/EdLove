/**
 * LESSON FEED COMPONENT
 * 
 * Timeline view for students to see lessons and assignments.
 * Features:
 * - Chronological list of lessons and assignments
 * - "Read" button for lessons
 * - "Submit" button for assignments (changes color if late)
 * - Sort by created_at DESC
 * 
 * Mission 05: Student Path
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
    Spinner,
} from '@gluestack-ui/themed';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { Lesson } from '../../lib/api/types';
import Theme from '../../constants/Theme';

interface Assignment {
    id: string;
    title: string;
    description?: string;
    due_date: string;
    classroom_id: string;
    created_at: string;
}

interface LessonFeedProps {
    classroomId: string;
    onOpenLesson?: (lessonId: string) => void;
    onOpenAssignment?: (assignmentId: string) => void;
}

type FeedItem = (Lesson | Assignment) & { type: 'lesson' | 'assignment' };

export default function LessonFeed({
    classroomId,
    onOpenLesson,
    onOpenAssignment,
}: LessonFeedProps) {
    const { t } = useTranslation();
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadFeed();
    }, [classroomId]);

    const loadFeed = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Load lessons
            const lessons = await api.lessons.getAll(classroomId);
            const lessonItems: FeedItem[] = lessons.map((lesson) => ({
                ...lesson,
                type: 'lesson' as const,
            }));

            // In a real app, would also load assignments from assignments API
            // For now, using lessons only
            const allItems = [...lessonItems];

            // Sort by created_at DESC (newest first)
            allItems.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setFeedItems(allItems);
        } catch (err: any) {
            console.error('Failed to load feed:', err);
            setError(err.message || 'Failed to load feed');
        } finally {
            setIsLoading(false);
        }
    };

    const isAssignmentLate = (item: FeedItem): boolean => {
        if (item.type === 'assignment' && 'due_date' in item) {
            return new Date(item.due_date) < new Date();
        }
        return false;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return t('lessonFeed.today') || 'Today';
        } else if (diffDays === 1) {
            return t('lessonFeed.yesterday') || 'Yesterday';
        } else if (diffDays < 7) {
            return t('lessonFeed.daysAgo', { count: diffDays }) || `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <Box
            sx={{
                flex: 1,
                backgroundColor: Theme.colors.voidIndigo,
            }}
        >
            <ScrollView>
                <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
                    {/* Header */}
                    <Heading size="2xl" color={Theme.colors.sanctuarySaffron}>
                        {t('lessonFeed.title') || 'My Learning Path'}
                    </Heading>

                    {/* Loading State */}
                    {isLoading && (
                        <Box
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                            }}
                        >
                            <Spinner color={Theme.colors.sanctuarySaffron} />
                            <Text
                                color={Theme.colors.pearlGray}
                                sx={{ marginTop: Theme.spacing.md }}
                            >
                                {t('common.loading') || 'Loading...'}
                            </Text>
                        </Box>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <Box
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: Theme.colors.emberRed,
                                borderRadius: Theme.corners.comfortable,
                            }}
                        >
                            <Text color={Theme.colors.sacredWhite}>{error}</Text>
                        </Box>
                    )}

                    {/* Feed Items */}
                    {!isLoading && !error && feedItems.length > 0 && (
                        <VStack space="md">
                            {feedItems.map((item) => (
                                <Box
                                    key={item.id}
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: Theme.colors.deepIndigo,
                                        borderRadius: Theme.corners.comfortable,
                                        borderLeftWidth: 4,
                                        borderLeftColor:
                                            item.type === 'lesson'
                                                ? Theme.colors.sanctuarySaffron
                                                : isAssignmentLate(item)
                                                    ? Theme.colors.emberRed
                                                    : Theme.colors.sageGreen,
                                    }}
                                >
                                    <VStack space="sm">
                                        {/* Type Badge & Date */}
                                        <HStack
                                            sx={{
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    paddingHorizontal: Theme.spacing.sm,
                                                    paddingVertical: Theme.spacing.xs,
                                                    backgroundColor:
                                                        item.type === 'lesson'
                                                            ? Theme.colors.sanctuarySaffron
                                                            : Theme.colors.sageGreen,
                                                    borderRadius: Theme.corners.tight,
                                                }}
                                            >
                                                <Text
                                                    color={Theme.colors.sacredWhite}
                                                    size="xs"
                                                    sx={{ fontWeight: '600' }}
                                                >
                                                    {item.type === 'lesson'
                                                        ? '📚 ' +
                                                        (t('lessonFeed.lesson') || 'LESSON')
                                                        : '📝 ' +
                                                        (t('lessonFeed.assignment') ||
                                                            'ASSIGNMENT')}
                                                </Text>
                                            </Box>

                                            <Text color={Theme.colors.mistGray} size="xs">
                                                {formatDate(item.created_at)}
                                            </Text>
                                        </HStack>

                                        {/* Title */}
                                        <Text
                                            color={Theme.colors.sacredWhite}
                                            size="lg"
                                            sx={{ fontWeight: '700' }}
                                        >
                                            {item.title}
                                        </Text>

                                        {/* Description */}
                                        {item.description && (
                                            <Text color={Theme.colors.pearlGray} size="sm">
                                                {item.description.length > 100
                                                    ? item.description.substring(0, 100) + '...'
                                                    : item.description}
                                            </Text>
                                        )}

                                        {/* Due Date (for assignments) */}
                                        {item.type === 'assignment' && 'due_date' in item && (
                                            <HStack space="xs" sx={{ alignItems: 'center' }}>
                                                <Text
                                                    color={
                                                        isAssignmentLate(item)
                                                            ? Theme.colors.emberRed
                                                            : Theme.colors.amberGlow
                                                    }
                                                    size="sm"
                                                    sx={{ fontWeight: '600' }}
                                                >
                                                    {t('lessonFeed.dueDate') || 'Due:'}
                                                </Text>
                                                <Text
                                                    color={
                                                        isAssignmentLate(item)
                                                            ? Theme.colors.emberRed
                                                            : Theme.colors.pearlGray
                                                    }
                                                    size="sm"
                                                >
                                                    {new Date(item.due_date).toLocaleDateString()}
                                                </Text>
                                                {isAssignmentLate(item) && (
                                                    <Text color={Theme.colors.emberRed} size="sm">
                                                        ({t('lessonFeed.late') || 'LATE'})
                                                    </Text>
                                                )}
                                            </HStack>
                                        )}

                                        {/* Action Button */}
                                        <Button
                                            sx={{
                                                backgroundColor:
                                                    item.type === 'lesson'
                                                        ? Theme.colors.sanctuarySaffron
                                                        : isAssignmentLate(item)
                                                            ? Theme.colors.emberRed
                                                            : Theme.colors.sageGreen,
                                                marginTop: Theme.spacing.sm,
                                            }}
                                            onPress={() => {
                                                if (item.type === 'lesson') {
                                                    onOpenLesson?.(item.id);
                                                } else {
                                                    onOpenAssignment?.(item.id);
                                                }
                                            }}
                                        >
                                            <ButtonText color={Theme.colors.sacredWhite}>
                                                {item.type === 'lesson'
                                                    ? t('lessonFeed.read') || '📖 Read Lesson'
                                                    : t('lessonFeed.submit') || '✍️ Submit Work'}
                                            </ButtonText>
                                        </Button>
                                    </VStack>
                                </Box>
                            ))}
                        </VStack>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && feedItems.length === 0 && (
                        <Box
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                size="lg"
                                color={Theme.colors.pearlGray}
                                textAlign="center"
                            >
                                {t('lessonFeed.noContent') ||
                                    'No lessons or assignments yet. Check back soon!'}
                            </Text>
                        </Box>
                    )}
                </VStack>
            </ScrollView>
        </Box>
    );
}
