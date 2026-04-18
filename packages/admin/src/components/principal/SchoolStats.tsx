import React from 'react';
import { HStack, VStack, Text, SanctuaryCard, useTheme, Theme } from '@repo/ui';
import { Users, GraduationCap, Building } from 'lucide-react-native';
import { type SchoolStats as ISchoolStats } from '@repo/core';

interface SchoolStatsProps {
    stats: ISchoolStats;
}

export default function SchoolStats({ stats }: SchoolStatsProps) {
    const { scene: colors } = useTheme();
    if (!stats) return null;

    const StatItem = ({ label, value, icon: Icon, color }: any) => (
        <SanctuaryCard style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
            <VStack space="xs">
                <HStack space="xs" className="items-center">
                    <Icon size={14} color={color || colors.text.secondary} />
                    <Text size="xs" className="text-phase-text-secondary font-bold uppercase tracking-wider">{label}</Text>
                </HStack>
                <Text size="xl" className="font-bold text-phase-text-primary">{value}</Text>
            </VStack>
        </SanctuaryCard>
    );

    return (
        <HStack space="md" className="w-full">
            <StatItem 
                label="Students" 
                value={stats?.total_students?.toString() || '0'} 
                icon={Users} 
                color={Theme.colors.gurudeviBlue}
            />
            <StatItem 
                label="Staff" 
                value={stats?.total_teachers?.toString() || '0'} 
                icon={GraduationCap} 
                color={Theme.colors.gurudeviViolet}
            />
            <StatItem 
                label="Classrooms" 
                value={stats?.total_classrooms?.toString() || '0'} 
                icon={Building} 
                color={Theme.colors.sanctuarySaffron}
            />
        </HStack>
    );
}
