import React from 'react';
import { SanctuaryStatsCard } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import type { AuthorityTier } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users, Clock, Star, Activity, Database, Globe } from 'lucide-react-native';

interface UserStatsCardProps {
    role: AuthorityTier;
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
    const { t } = useTranslation();
    const colors = useThemedColors();

    // Dynamic content based on role
    const getRoleBasedContent = () => {
        switch (role) {
            case 'teacher':
            case 'sectionHead':
            case 'gradeHead':
            case 'principal':
                return {
                    title: t('profile.impact.teacher', 'Teaching Impact'),
                    items: [
                        { label: t('classroom.title', 'Classes'), value: stats?.classesTaught ?? 0, icon: BookOpen, color: colors.action },
                        { label: t('role.student', 'Students'), value: stats?.studentsCount ?? 0, icon: Users, color: colors.success },
                        { label: t('profile.stats.points', 'Points'), value: stats?.guruPoints ?? 0, icon: Star, color: colors.warning },
                    ],
                    progressLabel: t('profile.stats.level', { level: 1 }) || 'Level 1 Guru',
                    progressValue: stats?.guruPoints ? Math.min(Math.floor(stats.guruPoints / 10), 100) : 0
                };
            case 'student':
                return {
                    title: t('profile.impact.student', 'Learning Journey'),
                    items: [
                        { label: t('profile.stats.learningStreaks', 'Streaks'), value: t('profile.stats.streak', { count: stats?.attendanceStreak ?? 0 }), icon: Clock, color: colors.success },
                        { label: t('profile.stats.assignmentsDone', 'Assignments'), value: stats?.assignmentsCompleted ?? 0, icon: BookOpen, color: colors.action },
                        { label: t('profile.stats.points', 'Points'), value: stats?.guruPoints ?? 0, icon: Star, color: colors.warning },
                    ],
                    progressLabel: t('profile.stats.scholarLevel', { level: 1 }) || 'Level 1 Scholar',
                    progressValue: stats?.guruPoints ? Math.min(Math.floor(stats.guruPoints / 5), 100) : 0
                };
            case 'founder':
                return {
                    title: t('profile.impact.founder', 'Founding Impact'),
                    items: [
                        { label: t('profile.stats.ecology', 'Ecology'), value: stats?.attendanceStreak ? t('common.yes', 'Yes') : t('common.no', 'No'), icon: Globe, color: colors.action },
                        { label: t('profile.stats.platformVision', 'Vision'), value: 'Global', icon: Users, color: colors.success },
                        { label: t('profile.stats.guardianImpact', 'Guardian'), value: stats?.guruPoints || 0, icon: Star, color: colors.warning },
                    ],
                    progressLabel: t('profile.stats.foundingSpirit', 'Founding Spirit'),
                    progressValue: 100
                };
            case 'admin':
            case 'developer':
                return {
                    title: t('profile.impact.admin', 'System Status'),
                    items: [
                        { label: t('profile.stats.coreUptime', 'Uptime'), value: '99.9%', icon: Activity, color: colors.success },
                        { label: t('profile.stats.securityAudit', 'Security'), value: 'Healthy', icon: Database, color: colors.action },
                        { label: t('profile.stats.apiLatency', 'Latency'), value: '42ms', icon: Clock, color: colors.warning },
                    ],
                    progressLabel: t('profile.stats.systemArchon', 'System Archon'),
                    progressValue: 95
                };
            default:
                return {
                    title: t('profile.impact.default', 'Journey'),
                    items: [],
                    progressLabel: t('profile.stats.beginner', 'Beginner'),
                    progressValue: 0
                };
        }
    };

    const content = getRoleBasedContent();

    return (
        <SanctuaryStatsCard
            title={content.title}
            items={content.items}
            progressLabel={content.progressLabel}
            progressValue={content.progressValue}
        />
    );
}
