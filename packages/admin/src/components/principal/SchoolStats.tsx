import React from 'react';
import { HStack, VStack, Text, SanctuaryCard,  useThemedColors } from '@repo/ui';
import { Users, GraduationCap, Building } from 'lucide-react-native';
import { type SchoolStats as ISchoolStats } from '@repo/core';

interface SchoolStatsProps {
    stats: ISchoolStats;
}

export default function SchoolStats({ stats }: SchoolStatsProps) {
    const colors = useTheme().scene;
    if (!stats) return null;

    const StatItem = ({ label, value, icon: Icon, color }: any) => (
        <SanctuaryCard style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
            <VStack space="xs">
                <HStack space="xs" alignItems="center">
                    <Icon size={14} color={color || colors.textSecondary} />
                    <Text size="xs" color={colors.textSecondary} bold uppercase letterSpacing={0.5}>{label}</Text>
                </HStack>
                <Text size="xl" bold color={colors.text}>{value}</Text>
            </VStack>
        </SanctuaryCard>
    );

    return (
        <HStack space="md" width="100%">
            <StatItem 
                label="Students" 
                value={stats?.total_students?.toString() || '0'} 
                icon={Users} 
                color={gurudeviBlue}
            />
            <StatItem 
                label="Staff" 
                value={stats?.total_teachers?.toString() || '0'} 
                icon={GraduationCap} 
                color={gurudeviViolet}
            />
            <StatItem 
                label="Classrooms" 
                value={stats?.total_classrooms?.toString() || '0'} 
                icon={Building} 
                color={sanctuarySaffron}
            />
        </HStack>
    );
}
