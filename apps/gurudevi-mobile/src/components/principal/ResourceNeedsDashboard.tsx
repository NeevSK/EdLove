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
} from '@/ui';
import { Package, Lightbulb, Users, BookOpen, Wifi, AlertCircle } from 'lucide-react-native';
import { Theme, typography } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';

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

// Color mapping based on priority
const PRIORITY_COLORS = {
    low: Theme.colors.mistGray,
    medium: Theme.colors.amberGlow,
    high: Theme.colors.sanctuarySaffron,
    urgent: Theme.colors.emberRed,
};

export default function ResourceNeedsDashboard({ schoolId }: ResourceNeedsDashboardProps) {
    const [needs, setNeeds] = useState<ResourceNeed[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchResourceNeeds();
    }, [schoolId]);

    const fetchResourceNeeds = async () => {
        try {
            // Query for resource needs
            // This would be a real table in production
            const { data, error } = await supabase
                .from('resource_needs')
                .select('*')
                .eq('school_id', schoolId)
                .order('priority', { ascending: false })
                .order('requested_by_count', { ascending: false });

            if (error) {
                console.error('Error fetching resource needs:', error);
                // Set mock data for demonstration
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
        // Mock data for demonstration
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
                <Spinner color={Theme.colors.sanctuarySaffron} />
            </Box>
        );
    }

    if (needs.length === 0) {
        return (
            <Box
                sx={{
                    padding: Theme.spacing.xl,
                    backgroundColor: Theme.colors.deepIndigo,
                    borderRadius: Theme.corners.comfortable,
                    alignItems: 'center',
                }}
            >
                <Text
                    color={Theme.colors.sageGreen}
                    size="lg"
                    sx={{ fontWeight: typography.fontWeight.medium }}
                >
                    ✨ All resource needs are currently met!
                </Text>
                <Text
                    color={Theme.colors.mistGray}
                    size="sm"
                    sx={{ marginTop: Theme.spacing.sm }}
                >
                    Your teachers have what they need to succeed
                </Text>
            </Box>
        );
    }

    return (
        <VStack space="lg">
            {/* Header */}
            <VStack space="xs">
                <Heading color={Theme.colors.sacredWhite} size="xl">
                    Resource Needs
                </Heading>
                <Text color={Theme.colors.mistGray} size="sm">
                    Support your teachers with what they need
                </Text>
            </VStack>

            {/* Resource Cards */}
            <VStack space="md">
                {needs.map((need) => {
                    const Icon = ICON_MAP[need.icon] || ICON_MAP.other;
                    const priorityColor = PRIORITY_COLORS[need.priority];

                    return (
                        <Box
                            key={need.id}
                            sx={{
                                padding: Theme.spacing.lg,
                                backgroundColor: Theme.colors.deepIndigo,
                                borderRadius: Theme.corners.comfortable,
                                borderLeftWidth: 4,
                                borderLeftColor: priorityColor,
                            }}
                        >
                            <HStack space="md" alignItems="center">
                                {/* Icon */}
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 24,
                                        backgroundColor: Theme.colors.midnightBlue,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Icon color={priorityColor} size={24} />
                                </Box>

                                {/* Content */}
                                <VStack space="xs" sx={{ flex: 1 }}>
                                    <HStack alignItems="center" space="sm">
                                        <Text
                                            color={Theme.colors.sacredWhite}
                                            size="lg"
                                            sx={{ fontWeight: typography.fontWeight.semibold }}
                                        >
                                            {need.requested_by_count} teachers
                                        </Text>
                                        <Text color={Theme.colors.mistGray} size="sm">
                                            need
                                        </Text>
                                    </HStack>
                                    <Text color={Theme.colors.pearlGray} size="md">
                                        {need.description}
                                    </Text>
                                    {need.priority === 'urgent' && (
                                        <Text
                                            color={Theme.colors.emberRed}
                                            size="xs"
                                            sx={{ fontWeight: typography.fontWeight.medium }}
                                        >
                                            🔥 Urgent priority
                                        </Text>
                                    )}
                                </VStack>
                            </HStack>
                        </Box>
                    );
                })}
            </VStack>

            {/* Philosophy Note */}
            <Box
                sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: Theme.colors.midnightBlue,
                    borderRadius: Theme.corners.comfortable,
                    marginTop: Theme.spacing.md,
                }}
            >
                <Text
                    color={Theme.colors.mistGray}
                    size="xs"
                    textAlign="center"
                    sx={{ fontStyle: 'italic' }}
                >
                    💡 This dashboard focuses on empowering teachers, not monitoring performance
                </Text>
            </Box>
        </VStack>
    );
}
