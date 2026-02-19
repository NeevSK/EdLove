/**
 * RESOURCE NEEDS DASHBOARD
 * Redefined Principal View - Focus on Resource Needs, NOT Performance
 * 
 * Philosophy:
 * - Show what teachers NEED, not how they're "performing"
 * - Example: "15 teachers need projectors" not "Teacher X missed deadline"
 * - Support and empower, don't monitor and pressure
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Spinner,
} from '@repo/ui';
import { Package, Lightbulb, Users, BookOpen, Wifi, AlertCircle } from 'lucide-react-native';
import { Theme, typography } from '@repo/ui';
import { supabase } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { useThemedColors } from '@repo/ui';

interface ResourceNeed {
    id: string;
    resource_type: string;
    description: string;
    requested_by_count: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    icon: string;
}

interface ResourceNeedsDashboardProps {
    schoolId: string;
}

// Icon mapping
const ICON_MAP: Record<string, any> = {
    'projector': Lightbulb,
    'books': BookOpen,
    'internet': Wifi,
    'supplies': Package,
    'support': Users,
    'other': AlertCircle,
};

export default function ResourceNeedsDashboard({ schoolId }: ResourceNeedsDashboardProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [needs, setNeeds] = useState<ResourceNeed[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Color mapping based on priority
    const PRIORITY_COLORS = {
        low: colors.textTertiary,
        medium: Theme.colors.amberGlow,
        high: Theme.colors.sanctuarySaffron,
        urgent: Theme.colors.emberRed,
    };

    useEffect(() => {
        fetchResourceNeeds();
    }, [schoolId]);

    const fetchResourceNeeds = async () => {
        try {
            const { data, error } = await supabase
                .from('resource_needs')
                .select('*')
                .eq('school_id', schoolId)
                .order('priority', { ascending: false })
                .order('requested_by_count', { ascending: false });

            if (error) {
                console.error('Error fetching resource needs:', error);
                setMockData();
            } else {
                setNeeds(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch resource needs:', error);
            setMockData();
        } finally {
            setIsLoading(false);
        }
    };

    const setMockData = () => {
        setNeeds([
            {
                id: '1',
                resource_type: 'projector',
                description: 'Projectors for visual learning',
                requested_by_count: 15,
                priority: 'high',
                icon: 'projector',
            },
            {
                id: '2',
                resource_type: 'internet',
                description: 'Better internet connectivity',
                requested_by_count: 12,
                priority: 'urgent',
                icon: 'internet',
            },
            {
                id: '3',
                resource_type: 'books',
                description: 'Updated textbooks and reference materials',
                requested_by_count: 8,
                priority: 'medium',
                icon: 'books',
            },
            {
                id: '4',
                resource_type: 'supplies',
                description: 'Basic classroom supplies',
                requested_by_count: 6,
                priority: 'medium',
                icon: 'supplies',
            },
            {
                id: '5',
                resource_type: 'support',
                description: 'Additional teaching assistants',
                requested_by_count: 4,
                priority: 'low',
                icon: 'support',
            },
        ]);
    };

    if (isLoading) {
        return (
            <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}>
                <Spinner color={colors.action} />
            </Box>
        );
    }

    if (needs.length === 0) {
        return (
            <Box
                sx={{
                    padding: Theme.spacing.xl,
                    backgroundColor: colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    alignItems: 'center',
                }}
            >
                <Text
                    color={colors.success}
                    sx={{ fontWeight: typography.fontWeight.medium, fontSize: 18 }}
                >
                    {t('principal.resources.emptyState')}
                </Text>
                <Text
                    color={colors.textSecondary}
                    sx={{ marginTop: Theme.spacing.sm, fontSize: 14 }}
                >
                    {t('principal.resources.emptyStateDesc')}
                </Text>
            </Box>
        );
    }

    return (
        <VStack sx={{ gap: Theme.spacing.lg }}>
            <VStack sx={{ gap: Theme.spacing.xs }}>
                <Heading color={colors.text} sx={{ fontSize: 24 }}>
                    {t('principal.resources.title')}
                </Heading>
                <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>
                    {t('principal.resources.subtitle')}
                </Text>
            </VStack>

            <VStack sx={{ gap: Theme.spacing.md }}>
                {needs.map((need) => {
                    const Icon = ICON_MAP[need.icon] || ICON_MAP.other;
                    const priorityColor = (PRIORITY_COLORS as any)[need.priority] || colors.textTertiary;

                    return (
                        <Box
                            key={need.id}
                            sx={{
                                padding: Theme.spacing.lg,
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.comfortable,
                                borderLeftWidth: 4,
                                borderLeftColor: priorityColor,
                            }}
                        >
                            <HStack sx={{ gap: Theme.spacing.md, alignItems: "center" }}>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 24,
                                        backgroundColor: colors.tertiary,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Icon color={priorityColor} size={24} />
                                </Box>

                                <VStack sx={{ gap: Theme.spacing.xs, flex: 1 }}>
                                    <HStack sx={{ alignItems: "center", gap: Theme.spacing.sm }}>
                                        <Text
                                            color={colors.text}
                                            sx={{ fontWeight: typography.fontWeight.semibold, fontSize: 18 }}
                                        >
                                            {t('principal.resources.needUnit', { count: need.requested_by_count })}
                                        </Text>
                                    </HStack>
                                    <Text color={colors.textSecondary} sx={{ fontSize: 16 }}>
                                        {need.description}
                                    </Text>
                                    {need.priority === 'urgent' && (
                                        <Text
                                            color={Theme.colors.emberRed}
                                            sx={{ fontWeight: typography.fontWeight.medium, fontSize: 12 }}
                                        >
                                            {t('principal.resources.urgent')}
                                        </Text>
                                    )}
                                </VStack>
                            </HStack>
                        </Box>
                    );
                })}
            </VStack>

            <Box
                sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: colors.tertiary,
                    borderRadius: Theme.corners.comfortable,
                    marginTop: Theme.spacing.md,
                }}
            >
                <Text
                    color={colors.textTertiary}
                    textAlign="center"
                    sx={{ fontStyle: 'italic', fontSize: 12 }}
                >
                    {t('principal.resources.philosophy')}
                </Text>
            </Box>
        </VStack>
    );
}
