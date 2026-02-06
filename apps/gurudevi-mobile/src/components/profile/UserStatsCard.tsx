import React from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Progress,
    ProgressFilledTrack,
} from '@gluestack-ui/themed';
import { Theme } from '../../constants/Theme';
import { UserRole } from '../../types/User';
import { Trophy, Users, BookOpen, Clock, Star } from 'lucide-react-native';

interface UserStatsCardProps {
    role: UserRole;
    stats?: {
        classesTaught?: number;
        studentsCount?: number;
        assignmentsGraded?: number;
        attendanceStreak?: number; // Days
        assignmentsCompleted?: number;
        guruPoints?: number;
    };
}

export default function UserStatsCard({ role, stats }: UserStatsCardProps) {
    // Dynamic content based on role
    const getRoleBasedContent = () => {
        switch (role) {
            case 'teacher':
            case 'section_head':
            case 'grade_head':
            case 'principal':
            case 'developer':
                return {
                    title: 'Teacher Impact',
                    items: [
                        { label: 'Classes', value: stats?.classesTaught || 12, icon: BookOpen, color: Theme.colors.sanctuarySaffron },
                        { label: 'Students', value: stats?.studentsCount || 145, icon: Users, color: Theme.colors.sageGreen },
                        { label: 'Guru Pts', value: stats?.guruPoints || 850, icon: Star, color: '#FFD700' },
                    ],
                    progressLabel: 'Level 5 Guru',
                    progressValue: 70
                };
            case 'student':
                return {
                    title: 'Learning Journey',
                    items: [
                        { label: 'Streak', value: `${stats?.attendanceStreak || 5} Days`, icon: Clock, color: Theme.colors.sageGreen },
                        { label: 'Done', value: stats?.assignmentsCompleted || 24, icon: BookOpen, color: Theme.colors.sanctuarySaffron },
                        { label: 'Points', value: stats?.guruPoints || 320, icon: Star, color: '#FFD700' },
                    ],
                    progressLabel: 'Level 3 Scholar',
                    progressValue: 45
                };
            default:
                return {
                    title: 'Journey',
                    items: [],
                    progressLabel: 'Beginner',
                    progressValue: 0
                };
        }
    };

    const content = getRoleBasedContent();

    return (
        <Box
            sx={{
                backgroundColor: Theme.colors.deepIndigo,
                borderRadius: Theme.corners.generous,
                padding: Theme.spacing.lg,
                marginBottom: Theme.spacing.lg
            }}
        >
            <HStack space="sm" alignItems="center" mb={Theme.spacing.md}>
                <Trophy size={18} color={'#FFD700'} />
                <Text color={Theme.colors.sacredWhite} bold size="md">
                    {content.title}
                </Text>
            </HStack>

            <HStack justifyContent="space-between" mb={Theme.spacing.lg}>
                {content.items.map((item, index) => (
                    <VStack key={index} alignItems="center" space="xs" sx={{ flex: 1 }}>
                        <Box
                            sx={{
                                backgroundColor: `${item.color}20`,
                                padding: 10,
                                borderRadius: 12,
                                marginBottom: 4
                            }}
                        >
                            <item.icon size={20} color={item.color} />
                        </Box>
                        <Text color={Theme.colors.sacredWhite} bold size="lg">
                            {item.value}
                        </Text>
                        <Text color={Theme.colors.mistGray} size="xs">
                            {item.label}
                        </Text>
                    </VStack>
                ))}
            </HStack>

            {/* Gamification Progress */}
            <VStack space="xs">
                <HStack justifyContent="space-between">
                    <Text color={Theme.colors.mistGray} size="xs">
                        {content.progressLabel}
                    </Text>
                    <Text color={Theme.colors.sanctuarySaffron} size="xs" bold>
                        {content.progressValue}%
                    </Text>
                </HStack>
                <Progress value={content.progressValue} w="100%" h={6} bg={Theme.colors.midnightBlue}>
                    <ProgressFilledTrack bg={Theme.colors.sanctuarySaffron} />
                </Progress>
            </VStack>
        </Box>
    );
}
