import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    useThemedColors
} from '@repo/ui';
import { Package, Lightbulb, Users, BookOpen, Wifi, AlertCircle } from 'lucide-react-native';
import { api } from '@repo/core';
import { useTranslation } from 'react-i18next';

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

const ICON_MAP: Record<string, any> = {
    'projector': Lightbulb,
    'books': BookOpen,
    'internet': Wifi,
    'supplies': Package,
    'support': Users,
    'other': AlertCircle
};

export default function ResourceNeedsDashboard({ schoolId }: ResourceNeedsDashboardProps) {
    const { t } = useTranslation();
    const theme = useThemedColors();
    const [needs, setNeeds] = useState<ResourceNeed[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const PRIORITY_COLORS: Record<string, string> = {
        low: theme.text.tertiary,
        medium: theme.status.warning,
        high: theme.status.warning,
        urgent: theme.status.error
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
            <Box style={{ padding: theme.spacing.xl, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color={theme.status.info} />
            </Box>
        );
    }

    if (needs.length === 0) {
        return (
            <Box
                style={{
                    padding: theme.spacing.xl,
                    backgroundColor: theme.scene.backgroundSecondary,
                    borderRadius: theme.corners.md,
                    alignItems: 'center'
                }}>
                <Text
                    style={{ 
                        fontWeight: '600', 
                        fontSize: 18, 
                        color: theme.status.success,
                        textAlign: 'center'
                    }}>
                    {t('principal.resources.emptyState') || 'Sanctuary is Well-Equipped'}
                </Text>
                <Text
                    style={{ 
                        marginTop: theme.spacing.sm, 
                        fontSize: 14, 
                        color: theme.text.secondary,
                        textAlign: 'center'
                    }}>
                    {t('principal.resources.emptyStateDesc') || 'No resource requests or damaged items reported.'}
                </Text>
            </Box>
        );
    }

    return (
        <VStack style={{ gap: theme.spacing.lg }}>
            <VStack style={{ gap: theme.spacing.xs }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: theme.text.primary }}>
                    {t('principal.resources.title') || 'Resource Vistas'}
                </Text>
                <Text style={{ fontSize: 14, color: theme.text.secondary }}>
                    {t('principal.resources.subtitle') || 'Aggregated needs from your teachers'}
                </Text>
            </VStack>

            <VStack style={{ gap: theme.spacing.md }}>
                {needs.map((need) => {
                    const Icon = ICON_MAP[need.icon] || ICON_MAP.other;
                    const priorityColor = PRIORITY_COLORS[need.priority] || theme.text.tertiary;

                    return (
                        <Box
                            key={need.id}
                            style={{
                                padding: theme.spacing.lg,
                                backgroundColor: theme.scene.backgroundSecondary,
                                borderRadius: theme.corners.md,
                                borderLeftWidth: 4,
                                borderLeftColor: priorityColor
                            }}>
                            <HStack style={{ alignItems: "center", gap: theme.spacing.md }}>
                                <Box
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 24,
                                        backgroundColor: theme.scene.backgroundTertiary,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                    <Icon color={priorityColor} size={24} />
                                </Box>

                                <VStack style={{ flex: 1, gap: 2 }}>
                                    <Text
                                        style={{ 
                                            fontWeight: '600', 
                                            fontSize: 18, 
                                            color: theme.text.primary 
                                        }}>
                                        {t('principal.resources.needUnit', { count: need.requested_by_count }) || ${need.requested_by_count} requests}
                                    </Text>
                                    <Text style={{ fontSize: 15, color: theme.text.secondary }}>
                                        {need.description}
                                    </Text>
                                    {need.priority === 'urgent' && (
                                        <Text
                                            style={{ 
                                                fontWeight: '600', 
                                                fontSize: 12, 
                                                color: theme.status.error,
                                                marginTop: 4
                                            }}>
                                            {t('principal.resources.urgent') || 'Urgent Priority'}
                                        </Text>
                                    )}
                                </VStack>
                            </HStack>
                        </Box>
                    );
                })}
            </VStack>

            <Box
                style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.scene.backgroundTertiary,
                    borderRadius: theme.corners.md,
                    marginTop: theme.spacing.md
                }}>
                <Text
                    style={{ 
                        fontStyle: 'italic', 
                        fontSize: 12, 
                        color: theme.text.tertiary,
                        textAlign: 'center' 
                    }}>
                    {t('principal.resources.philosophy') || 'Infrastructure is the scaffolding of possibility.'}
                </Text>
            </Box>
        </VStack>
    );
}
