import type { Capacity } from '@repo/core/types';
import { Activity, BookOpen, Clock, Database, Globe, Star, Users } from '@repo/ui/icons';
import {
  Box,
  Heading,
  HStack,
  Progress,
  ProgressFilledTrack,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useTranslation } from 'react-i18next';

interface UserStatsCardProps {
  capacity: Capacity;
  stats?: {
    classesTaught?: number;
    studentsCount?: number;
    assignmentsGraded?: number;
    attendanceStreak?: number; // Days
    assignmentsCompleted?: number;
    guruPoints?: number;
  };
}

/**
 * USER STATS CARD
 * Sanctuary V3 standard for displaying capacity-based statistics.
 */
export default function UserStatsCard({ capacity, stats }: UserStatsCardProps) {
  const { t } = useTranslation();

  // Sanctuary V3 Standard Colors
  const colors = {
    action: '#4A90E2',
    success: '#00C853',
    warning: '#FFAB00',
  };

  // Dynamic content based on capacity
  const getCapacityBasedContent = () => {
    switch (capacity) {
      case 'teacher':
      case 'sectionHead':
      case 'gradeHead':
      case 'principal':
        return {
          title: t('profile.impact.teacher', 'Teaching Impact'),
          items: [
            {
              label: t('classroom.title', 'Classes'),
              value: stats?.classesTaught ?? 0,
              icon: BookOpen,
              color: colors.action,
            },
            {
              label: t('role.student', 'Students'),
              value: stats?.studentsCount ?? 0,
              icon: Users,
              color: colors.success,
            },
            {
              label: t('profile.stats.points', 'Points'),
              value: stats?.guruPoints ?? 0,
              icon: Star,
              color: colors.warning,
            },
          ],
          progressLabel: t('profile.stats.level', { level: 1 }) || 'Level 1 Guru',
          progressValue: stats?.guruPoints ? Math.min(Math.floor(stats.guruPoints / 10), 100) : 0,
        };
      case 'student':
        return {
          title: t('profile.impact.student', 'Learning Journey'),
          items: [
            {
              label: t('profile.stats.learningStreaks', 'Streaks'),
              value: t('profile.stats.streak', {
                count: stats?.attendanceStreak ?? 0,
              }),
              icon: Clock,
              color: colors.success,
            },
            {
              label: t('profile.stats.assignmentsDone', 'Assignments'),
              value: stats?.assignmentsCompleted ?? 0,
              icon: BookOpen,
              color: colors.action,
            },
            {
              label: t('profile.stats.points', 'Points'),
              value: stats?.guruPoints ?? 0,
              icon: Star,
              color: colors.warning,
            },
          ],
          progressLabel: t('profile.stats.scholarLevel', { level: 1 }) || 'Level 1 Scholar',
          progressValue: stats?.guruPoints ? Math.min(Math.floor(stats.guruPoints / 5), 100) : 0,
        };
      case 'founder':
        return {
          title: t('profile.impact.founder', 'Founding Impact'),
          items: [
            {
              label: t('profile.stats.ecology', 'Ecology'),
              value: stats?.attendanceStreak ? t('common.yes', 'Yes') : t('common.no', 'No'),
              icon: Globe,
              color: colors.action,
            },
            {
              label: t('profile.stats.platformVision', 'Vision'),
              value: 'Global',
              icon: Users,
              color: colors.success,
            },
            {
              label: t('profile.stats.guardianImpact', 'Guardian'),
              value: stats?.guruPoints || 0,
              icon: Star,
              color: colors.warning,
            },
          ],
          progressLabel: t('profile.stats.foundingSpirit', 'Founding Spirit'),
          progressValue: 100,
        };
      case 'admin':
      case 'developer':
        return {
          title: t('profile.impact.admin', 'System Status'),
          items: [
            {
              label: t('profile.stats.coreUptime', 'Uptime'),
              value: '99.9%',
              icon: Activity,
              color: colors.success,
            },
            {
              label: t('profile.stats.securityAudit', 'Security'),
              value: 'Healthy',
              icon: Database,
              color: colors.action,
            },
            {
              label: t('profile.stats.apiLatency', 'Latency'),
              value: '42ms',
              icon: Clock,
              color: colors.warning,
            },
          ],
          progressLabel: t('profile.stats.systemArchon', 'System Archon'),
          progressValue: 95,
        };
      default:
        return {
          title: t('profile.impact.default', 'Journey'),
          items: [],
          progressLabel: t('profile.stats.beginner', 'Beginner'),
          progressValue: 0,
        };
    }
  };

  const content = getCapacityBasedContent();

  return (
    <Box className="bg-phase-canvas border border-phase-surface rounded-[32px] overflow-hidden shadow-lg mb-6">
      <VStack space="lg" className="p-8">
        <Heading size="sm" className="text-phase-text-primary tracking-tight">
          {content.title}
        </Heading>

        <HStack className="justify-between items-center" space="md">
          {content.items.map((item, index) => (
            <VStack key={index} className="items-center flex-1" space="xs">
              <Box className="w-12 h-12 rounded-2xl bg-phase-surface/40 items-center justify-center border border-phase-surface/20">
                <item.icon size={22} color={item.color} />
              </Box>
              <Text className="text-[11px] font-bold text-phase-text-tertiary uppercase tracking-wider mt-1">
                {item.label}
              </Text>
              <Text className="text-lg font-bold text-phase-text-primary">{item.value}</Text>
            </VStack>
          ))}
        </HStack>

        <VStack space="xs" className="mt-2">
          <HStack className="justify-between items-center mb-1">
            <Text className="text-xs font-bold text-phase-text-secondary uppercase tracking-widest">
              {content.progressLabel}
            </Text>
            <Text className="text-xs font-bold text-phase-interactive">
              {content.progressValue}%
            </Text>
          </HStack>
          <Progress value={content.progressValue} className="h-2 rounded-full bg-phase-surface/30">
            <ProgressFilledTrack className="bg-phase-interactive rounded-full" />
          </Progress>
        </VStack>
      </VStack>
    </Box>
  );
}
