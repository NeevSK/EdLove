import React from 'react';
import { Box, Text, VStack, HStack, Heading } from '@repo/ui';

interface TeacherStatCardProps {
    label: string;
    value: string | number;
    accentColorClass?: string;
}

export const TeacherStatCard: React.FC<TeacherStatCardProps> = ({ label, value, accentColorClass = 'bg-sanctuarySaffron' }) => {
    return (
        <Box className="rounded-[32px] border border-sanctuary-border/10 bg-sanctuary-surface p-7 shadow-sm overflow-hidden relative">
            {/* Decorative glow */}
            <Box className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-5 ${accentColorClass}`} />
            
            <VStack className="gap-5">
                <HStack className="items-center justify-between">
                    <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-sanctuary-text-muted">
                        {label}
                    </Text>
                    <Box className={`h-2.5 w-2.5 rounded-full ${accentColorClass} shadow-sm`} />
                </HStack>
                <Heading size="xl" className="text-sanctuary-text font-bold tracking-tight">
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
        { label: 'Attendance', value: `${stats.averageAttendance}%`, accentColorClass: 'bg-sageGreen' },
        { label: 'Assignments', value: stats.pendingAssignments, accentColorClass: 'bg-emberRed' },
        { label: 'Classrooms', value: stats.activeClassrooms, accentColorClass: 'bg-gurudeviBlue' },
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

