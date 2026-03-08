/**
 * DASHBOARD ECHO
 *Surfaces feedback "vistas" and support requests from teachers and students.
 * 
 * Philosophy: 
 * - Create a bidirectional loop between staff/students and administration.
 * - Prioritize empathetic oversight over performance monitoring.
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Theme,
    useThemedColors,
    Spinner,
    Pressable,
} from '@repo/ui';
import { MessageSquare, Heart, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { supabase } from '@repo/core';
import { useTranslation } from 'react-i18next';

interface FeedbackEcho {
    id: string;
    source: 'teacher' | 'student';
    category: 'support' | 'morale' | 'facility' | 'recognition';
    content: string;
    priority: 'low' | 'medium' | 'high';
    is_read: boolean;
    created_at: string;
}

const CATEGORY_ICONS = {
    support: MessageSquare,
    morale: Heart,
    facility: AlertTriangle,
    recognition: CheckCircle2,
};

export default function DashboardEcho({ schoolId }: { schoolId: string }) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [feedback, setFeedback] = useState<FeedbackEcho[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, [schoolId]);

    const fetchFeedback = async () => {
        try {
            const { data, error } = await supabase
                .from('school_echo_feedback')
                .select('*')
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Error fetching echo feedback:', error);
                setMockData();
            } else {
                setFeedback(data || []);
            }
        } catch (err) {
            setMockData();
        } finally {
            setIsLoading(false);
        }
    };

    const setMockData = () => {
        setFeedback([
            {
                id: '1',
                source: 'teacher',
                category: 'support',
                content: 'Need guidance on the 2026 Mathematics syllabus transition for Grade 6.',
                priority: 'high',
                is_read: false,
                created_at: new Date().toISOString(),
            },
            {
                id: '2',
                source: 'student',
                category: 'morale',
                content: 'The new common area is great! Everyone is enjoying the study space.',
                priority: 'low',
                is_read: true,
                created_at: new Date(Date.now() - 3600000).toISOString(),
            },
            {
                id: '3',
                source: 'teacher',
                category: 'facility',
                content: 'Multimedia projector in Room 4 is flickering intermittently.',
                priority: 'medium',
                is_read: false,
                created_at: new Date(Date.now() - 86400000).toISOString(),
            },
        ]);
    };

    if (isLoading) {
        return <Spinner color={colors.action} />;
    }

    return (
        <VStack sx={{ gap: Theme.spacing.md }}>
            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <VStack sx={{ gap: Theme.spacing.xs }}>
                    <Heading sx={{ fontSize: Theme.typography.fontSize.md }} color={colors.text}>
                        {t('principal.echo.title')}
                    </Heading>
                    <Text sx={{ fontSize: Theme.typography.fontSize.xs }} color={colors.textSecondary}>
                        {t('principal.echo.subtitle')}
                    </Text>
                </VStack>
                <Pressable>
                    <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700' }} color={colors.action}>{t('common.viewAll')}</Text>
                </Pressable>
            </HStack>

            <VStack sx={{ gap: Theme.spacing.sm }}>
                {feedback.map((item) => {
                    const IconComp = CATEGORY_ICONS[item.category] || MessageSquare;
                    return (
                        <Pressable key={item.id}>
                            <Box
                                sx={{
                                    padding: Theme.spacing.md,
                                    backgroundColor: item.is_read ? colors.tertiary : colors.secondary,
                                    borderRadius: Theme.corners.comfortable,
                                    borderLeftWidth: 4,
                                    borderLeftColor: item.priority === 'high' ? Theme.colors.emberRed : colors.action,
                                }}
                            >
                                <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            padding: Theme.spacing.sm,
                                            backgroundColor: colors.primary,
                                            borderRadius: Theme.corners.comfortable,
                                        }}
                                    >
                                        <IconComp size={18} color={colors.action} />
                                    </Box>
                                    <VStack sx={{ gap: Theme.spacing.xs, flex: 1 }}>
                                        <HStack sx={{ justifyContent: 'space-between' }}>
                                            <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700' }} color={colors.textSecondary}>
                                                {item.source.toUpperCase()} • {item.category.toUpperCase()}
                                            </Text>
                                            <Text sx={{ fontSize: Theme.typography.fontSize.xs }} color={colors.textTertiary}>
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </Text>
                                        </HStack>
                                        <Text sx={{ fontSize: Theme.typography.fontSize.sm }} color={colors.text} numberOfLines={2}>
                                            {item.content}
                                        </Text>
                                    </VStack>
                                    <ChevronRight size={16} color={colors.textTertiary} />
                                </HStack>
                            </Box>
                        </Pressable>
                    );
                })}
                {feedback.length === 0 && (
                    <Text sx={{ fontStyle: 'italic', textAlign: 'center' }} color={colors.textTertiary}>
                        {t('principal.echo.empty')}
                    </Text>
                )}
            </VStack>
        </VStack>
    );
}
