import React from 'react';
import { Box, Text, VStack, HStack, Heading } from '@repo/ui';

interface TeacherStatCardProps {
    label: string;
    value: string | number;
    accentColorClass?: string;
}

export const TeacherStatCard: React.FC<TeacherStatCardProps> = ({ label, value, accentColorClass = 'bg-sanctuarySaffron' }) => {
    return (
        <Box className="rounded-[32px] border border-sanctuary-border bg-sanctuary-surface p-7 overflow-hidden relative">
            <Box className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.03] ${accentColorClass}`} />
            
            <VStack className="gap-5">
                <HStack className="items-center justify-between">
                    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-sanctuary-text-tertiary">
                        {label}
                    </Text>
                    <Box className={`h-2.5 w-2.5 rounded-full ${accentColorClass.replace('bg-', 'bg-')}`} />
                </HStack>
                <Heading className="text-3xl text-sanctuary-text font-black tracking-tighter">
                    {value}
                </Heading>
            </VStack>
        </Box>
    );
};

interface TeacherStatsProps {
    stats: {
        totalStudents: number;
        averageAttendance: number;
        pendingAssignments: number;
        activeClassrooms: number;
    };
}

export const TeacherStats: React.FC<TeacherStatsProps> = ({ stats }) => {
    const statItems = [
        { label: 'Students', value: stats.totalStudents, accentColorClass: 'bg-sanctuarySaffron' },
        { label: 'Attendance', value: `${stats.averageAttendance}%`, accentColorClass: 'bg-sanctuary-success' },
        { label: 'Assignments', value: stats.pendingAssignments, accentColorClass: 'bg-sanctuary-error' },
        { label: 'Sanctuaries', value: stats.activeClassrooms, accentColorClass: 'bg-sanctuary-info' },
    ];

    return (
        <HStack className="flex-wrap gap-4">
            {statItems.map((item) => (
                <Box key={item.label} className="min-w-[160px] flex-1">
                    <TeacherStatCard {...item} />
                </Box>
            ))}
        </HStack>
    );
};

