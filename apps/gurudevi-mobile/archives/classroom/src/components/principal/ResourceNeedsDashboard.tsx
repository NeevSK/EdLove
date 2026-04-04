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
import { api } from '@repo/core';
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
        if (schoolId) {
            fetchResourceNeeds();
        }
    }, [schoolId]);

    const fetchResourceNeeds = async () => {
        try {
            setIsLoading(true);
            const data = await api.inventory.getSchoolResourceNeeds(schoolId);
            setNeeds(data || []);
        } catch (error) {
            console.error('Failed to fetch resource needs:', error);
        } finally {
            setIsLoading(false);
        }
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
                    {t('principal.resources.emptyState') || 'Sanctuary is Well-Equipped'}
                </Text>
                <Text
                    color={colors.textSecondary}
                    sx={{ marginTop: Theme.spacing.sm, fontSize: 14 }}
                >
                    {t('principal.resources.emptyStateDesc') || 'No resource requests or damaged items reported.'}
                </Text>
            </Box>
        );
    }

    return (
        <VStack space="lg">
            <VStack space="xs">
                <Heading color={colors.text} sx={{ fontSize: 24 }}>
                    {t('principal.resources.title') || 'Resource Vistas'}
                </Heading>
                <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>
                    {t('principal.resources.subtitle') || 'Aggregated needs from your teachers'}
                </Text>
            </VStack>

            <VStack space="md">
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
                            <HStack space="md" sx={{ alignItems: "center" }}>
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

                                <VStack space="xs" sx={{ flex: 1 }}>
                                    <HStack space="sm" sx={{ alignItems: "center" }}>
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
