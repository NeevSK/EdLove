import React from 'react';
import { SanctuaryStatsCard } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { AuthorityTier } from '@repo/core';
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
            case 'developer':
                return {
                    title: t('profile.impact.teacher'),
                    items: [
                        { label: t('classroom.title'), value: stats?.classesTaught ?? 0, icon: BookOpen, color: colors.action },
                        { label: t('role.student'), value: stats?.studentsCount ?? 0, icon: Users, color: colors.success },
                        { label: t('profile.stats.points'), value: stats?.guruPoints ?? 0, icon: Star, color: colors.warning },
                    ],
                    progressLabel: t('profile.stats.level', { level: 1 }) || 'Level 1 Guru',
                    progressValue: stats?.guruPoints ? Math.min(Math.floor(stats.guruPoints / 10), 100) : 0
                };
            case 'student':
                return {
                    title: t('profile.impact.student'),
                    items: [
                        { label: t('profile.stats.learningStreaks'), value: t('profile.stats.streak', { count: stats?.attendanceStreak ?? 0 }), icon: Clock, color: colors.success },
                        { label: t('profile.stats.assignmentsDone'), value: stats?.assignmentsCompleted ?? 0, icon: BookOpen, color: colors.action },
                        { label: t('profile.stats.points'), value: stats?.guruPoints ?? 0, icon: Star, color: colors.warning },
                    ],
                    progressLabel: t('profile.stats.scholarLevel', { level: 1 }) || 'Level 1 Scholar',
                    progressValue: stats?.guruPoints ? Math.min(Math.floor(stats.guruPoints / 5), 100) : 0
                };
            case 'founder':
                return {
                    title: t('profile.impact.founder'),
                    items: [
                        { label: t('profile.stats.ecology'), value: stats?.attendanceStreak ? t('common.yes') : t('common.no'), icon: Globe, color: colors.action },
                        { label: t('profile.stats.platformVision'), value: 'Global', icon: Users, color: colors.success },
                        { label: t('profile.stats.guardianImpact'), value: stats?.guruPoints || '', icon: Star, color: colors.warning },
                    ],
                    progressLabel: t('profile.stats.foundingSpirit'),
                    progressValue: 100
                };
            case 'admin':
                return {
                    title: t('profile.impact.admin'),
                    items: [
                        { label: t('profile.stats.coreUptime'), value: '99.9%', icon: Activity, color: colors.success },
                        { label: t('profile.stats.securityAudit'), value: 'Healthy', icon: Database, color: colors.action },
                        { label: t('profile.stats.apiLatency'), value: '42ms', icon: Clock, color: colors.warning },
                    ],
                    progressLabel: t('profile.stats.systemArchon'),
                    progressValue: 95
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
        <SanctuaryStatsCard
            title={content.title}
            items={content.items}
            progressLabel={content.progressLabel}
            progressValue={content.progressValue}
        /
    );
}
