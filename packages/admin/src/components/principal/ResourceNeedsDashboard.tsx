import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Icon as UIIcon,
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
    const [needs, setNeeds] = useState<ResourceNeed[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getPriorityColorClasses = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 border-red-600 bg-red-500/10';
            case 'high': return 'text-amber-600 border-amber-600 bg-amber-500/10';
            case 'medium': return 'text-blue-600 border-blue-600 bg-blue-500/10';
            default: return 'text-ink/40 border-border bg-ink/5';
        }
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
            <Box className="p-12 items-center justify-center">
                <ActivityIndicator color="#6366f1" />
            </Box>
        );
    }

    if (needs.length === 0) {
        return (
            <Box className="p-8 bg-silk rounded-3xl items-center border border-border">
                <Heading className="text-xl font-black text-green-600 text-center">
                    {t('principal.resources.emptyState') || 'Sanctuary is Well-Equipped'}
                </Heading>
                <Text className="mt-2 text-sm text-ink/40 font-bold text-center">
                    {t('principal.resources.emptyStateDesc') || 'No resource requests or damaged items reported.'}
                </Text>
            </Box>
        );
    }

    return (
        <VStack className="gap-6">
            <VStack className="gap-1">
                <Heading className="text-2xl font-black text-ink">
                    {t('principal.resources.title') || 'Resource Vistas'}
                </Heading>
                <Text className="text-sm font-bold text-ink/40">
                    {t('principal.resources.subtitle') || 'Aggregated needs from your teachers'}
                </Text>
            </VStack>

            <VStack className="gap-4">
                {needs.map((need) => {
                    const Icon = ICON_MAP[need.icon] || ICON_MAP.other;
                    const priorityClasses = getPriorityColorClasses(need.priority);
                    const colorParts = priorityClasses.split(' ');
                    const textColorClass = colorParts[0];
                    const borderColorClass = colorParts[1];
                    const bgColorClass = colorParts[2];

                    return (
                        <Box
                            key={need.id}
                            className={`p-5 bg-white rounded-3xl border-l-4 border-y border-r border-border ${borderColorClass.replace('border-', 'border-l-')}`}>
                            <HStack className="items-center gap-4">
                                <Box className={`w-12 h-12 rounded-2xl items-center justify-center ${bgColorClass}`}>
                                    <UIIcon as={Icon} className={textColorClass} size="md" />
                                </Box>

                                <VStack className="flex-1 gap-0.5">
                                    <Text className="text-lg font-black text-ink">
                                        {t('principal.resources.needUnit', { count: need.requested_by_count }) || `${need.requested_by_count} requests`}
                                    </Text>
                                    <Text className="text-sm text-ink/60 font-bold">
                                        {need.description}
                                    </Text>
                                    {need.priority === 'urgent' && (
                                        <Text className="text-[10px] font-black uppercase tracking-widest text-red-600 mt-1">
                                            {t('principal.resources.urgent') || 'Urgent Priority'}
                                        </Text>
                                    )}
                                </VStack>
                            </HStack>
                        </Box>
                    );
                })}
            </VStack>

            <Box className="p-4 bg-silk rounded-2xl mt-4 border border-border">
                <Text className="italic text-xs text-ink/40 font-bold text-center">
                    {t('principal.resources.philosophy') || 'Infrastructure is the scaffolding of possibility.'}
                </Text>
            </Box>
        </VStack>
    );
}

