import { marksToGPA } from '@repo/analytics';
import { ProgressRing } from '@repo/graphics';
import {
  ArrowRight,
  Box,
  CalendarCheck,
  Card,
  LineChart as ChartIcon,
  CircleCheck,
  FileText,
  GraduationCap,
  HStack,
  Icon,
  Lightbulb,
  Minus,
  Text,
  TrendingDown,
  TrendingUp,
  Trophy,
  VStack,
  Zap,
} from '@repo/ui';
import { Pressable, ScrollView } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';

import React from 'react';

interface AnalyticsWidgetProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  showGrade?: boolean;
  marks?: number;
  icon?: any;
}

function AnalyticsWidget({
  title,
  value,
  subtitle,
  trend,
  color = '#F6BF8C', // sanctuarySaffron
  showGrade = false,
  marks,
  icon,
}: AnalyticsWidgetProps) {
  const gradeInfo = showGrade && marks !== undefined ? marksToGPA(marks) : null;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-sageGreen'
      : trend === 'down'
        ? 'text-emberRed'
        : 'text-phase-text-tertiary';

  return (
    <Card className="p-6 bg-phase-surface-secondary rounded-[32px] border border-phase-border shadow-sm">
      <VStack className="gap-4">
        <HStack className="justify-between items-center">
          <HStack className="items-center gap-2">
            {icon && <Icon as={icon} size="xs" className="text-phase-text-tertiary" />}
            <Text className="text-xs font-bold text-phase-text-secondary uppercase tracking-widest">
              {title}
            </Text>
          </HStack>
          {trend && (
            <HStack className="items-center gap-1">
              <Icon as={TrendIcon} size="xs" className={trendColor} />
            </HStack>
          )}
        </HStack>

        <VStack className="gap-1">
          <Text className="text-4xl font-black tracking-tighter" style={{ color: color }}>
            {value}
          </Text>
          {subtitle && (
            <Text className="text-sm font-medium text-phase-text-tertiary">{subtitle}</Text>
          )}
        </VStack>

        {gradeInfo && (
          <HStack className="bg-phase-surface p-3 rounded-[20px] justify-between items-center border border-phase-border/50">
            <HStack className="items-center gap-2">
              <Box className="w-2 h-2 rounded-full bg-sanctuarySaffron" />
              <Text className="text-sm font-bold text-phase-text-primary">
                Grade: {gradeInfo.grade}
              </Text>
            </HStack>
            <Text className="text-xs font-black text-phase-text-tertiary uppercase">
              GPA: {gradeInfo.gpa.toFixed(2)}
            </Text>
          </HStack>
        )}
      </VStack>
    </Card>
  );
}

interface QuickAnalyticsProps {
  studentId?: string;
  classId?: string;
  marks?: number;
  averageGPA?: number;
  attendanceRate?: number;
  rank?: number;
}

export default function QuickAnalytics({
  studentId,
  classId,
  marks,
  averageGPA = 0,
  attendanceRate = 0,
  rank = 0,
}: QuickAnalyticsProps) {
  const currentGrade = marks !== undefined ? marksToGPA(marks) : null;

  return (
    <ScrollView className="flex-1 bg-phase-surface" showsVerticalScrollIndicator={false}>
      <VStack className="p-6 gap-8 pb-32">
        <HStack className="items-center gap-4 mt-2">
          <Box className="p-3.5 bg-sanctuarySaffron rounded-[24px] shadow-lg shadow-sanctuarySaffron/20">
            <Icon as={ChartIcon} size="md" className="text-sanctuary-ink" />
          </Box>
          <VStack>
            <Text className="text-3xl font-black text-phase-text-primary tracking-tighter leading-none">
              Quick Analytics
            </Text>
            <Text className="text-base font-medium text-phase-text-tertiary">
              Academic Performance & Engagement
            </Text>
          </VStack>
        </HStack>

        <VStack className="gap-4">
          <AnalyticsWidget
            title="Current Grade"
            value={currentGrade ? `${currentGrade.grade} (${marks}%)` : 'N/A'}
            showGrade={true}
            marks={marks}
            color={currentGrade ? getGradeColor(currentGrade.grade) : undefined}
            icon={GraduationCap}
          />
          <HStack className="gap-4">
            <Box className="flex-1">
              <AnalyticsWidget
                title="Average GPA"
                value={averageGPA.toFixed(2)}
                subtitle="This semester"
                trend={averageGPA > 3.0 ? 'up' : averageGPA < 2.0 ? 'down' : 'stable'}
                color={
                  averageGPA >= 3.0
                    ? Theme.colors.sanctuarySaffron
                    : averageGPA < 2.0
                      ? Theme.colors.emberRed
                      : Theme.colors.templeGold
                }
                icon={ChartIcon}
              />
            </Box>
            <Box className="flex-1">
              <AnalyticsWidget
                title="Class Rank"
                value={`#${rank || 'N/A'}`}
                subtitle={`of ${rank ? rank + 20 : 'N/A'} students`}
                color={Theme.colors.sacredWhite}
                icon={Trophy}
              />
            </Box>
          </HStack>
          <AnalyticsWidget
            title="Attendance Rate"
            value={`${(attendanceRate * 100).toFixed(1)}%`}
            subtitle="This month"
            trend={attendanceRate > 0.9 ? 'up' : attendanceRate < 0.7 ? 'down' : 'stable'}
            color={
              attendanceRate > 0.9
                ? Theme.colors.sageGreen
                : attendanceRate < 0.7
                  ? Theme.colors.emberRed
                  : Theme.colors.templeGold
            }
            icon={CircleCheck}
          />
        </VStack>

        <Card className="p-8 bg-phase-surface-secondary rounded-[40px] border border-phase-border shadow-md">
          <HStack className="items-center gap-2 mb-8">
            <Icon as={TrendingUp} size="sm" className="text-sanctuarySaffron" />
            <Text className="text-xl font-black text-phase-text-primary tracking-tighter uppercase">
              Progress Overview
            </Text>
          </HStack>
          <VStack className="gap-8 items-center">
            <Box className="p-4 bg-phase-surface rounded-full shadow-inner border border-phase-border/30">
              <ProgressRing
                value={averageGPA}
                max={4.0}
                size={180}
                color={
                  averageGPA >= 3.0
                    ? Theme.colors.sanctuarySaffron
                    : averageGPA < 2.0
                      ? Theme.colors.emberRed
                      : Theme.colors.templeGold
                }
              />
            </Box>
            <VStack className="items-center gap-1">
              <Text className="text-4xl font-black text-phase-text-primary tracking-tight">
                {((averageGPA / 4.0) * 100).toFixed(0)}%
              </Text>
              <Text className="text-sm font-bold text-phase-text-tertiary uppercase tracking-widest">
                GPA Progress
              </Text>
            </VStack>
          </VStack>
        </Card>

        <VStack className="gap-4">
          <HStack className="items-center gap-2 px-2">
            <Icon as={Zap} size="sm" className="text-sanctuarySaffron" />
            <Text className="text-xl font-black text-phase-text-primary tracking-tighter uppercase">
              Quick Actions
            </Text>
          </HStack>
          <VStack className="gap-3">
            {[
              { icon: FileText, label: 'View detailed gradebook' },
              { icon: ChartIcon, label: 'Track performance trends' },
              { icon: GraduationCap, label: 'Set GPA goals' },
              { icon: FileText, label: 'Download progress report' },
            ].map((action, i) => (
              <Pressable
                key={i}
                className="flex-row items-center justify-between p-5 bg-phase-surface-secondary rounded-[24px] border border-phase-border active:bg-phase-border/10 transition-colors"
              >
                <HStack className="items-center gap-4">
                  <Box className="p-2 bg-phase-surface rounded-xl">
                    <Icon as={action.icon} size="xs" className="text-sanctuarySaffron" />
                  </Box>
                  <Text className="text-base font-bold text-phase-text-primary">
                    {action.label}
                  </Text>
                </HStack>
                <Icon as={ArrowRight} size="xs" className="text-phase-text-tertiary" />
              </Pressable>
            ))}
          </VStack>
        </VStack>

        <Card className="p-8 bg-phase-surface-secondary rounded-[40px] border border-phase-border relative overflow-hidden">
          <Box className="absolute -top-10 -right-10 w-40 h-40 bg-sanctuarySaffron/5 rounded-full" />
          <HStack className="items-center gap-2 mb-6">
            <Icon as={Lightbulb} size="sm" className="text-sanctuarySaffron" />
            <Text className="text-xl font-black text-phase-text-primary tracking-tighter uppercase">
              Performance Tips
            </Text>
          </HStack>
          <VStack className="gap-4">
            {averageGPA < 2.0 && (
              <Tip text="Focus on improving attendance and assignment completion to build a stronger foundation." />
            )}
            {attendanceRate < 0.8 && (
              <Tip text="Regular attendance is the strongest predictor of academic success. Try to minimize absences." />
            )}
            {rank > 0 && rank <= 5 && (
              <Tip text="Elite performance! You are currently among the top students in your class. Keep it up!" />
            )}
            {averageGPA >= 3.5 && (
              <Tip text="Outstanding scholarship. This is the perfect time to explore advanced coursework or research topics." />
            )}
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <HStack className="gap-4 items-start p-4 bg-phase-surface rounded-[20px] border border-phase-border/30">
      <Box className="w-2 h-2 rounded-full bg-sanctuarySaffron mt-2" />
      <Text className="flex-1 text-sm font-bold text-phase-text-secondary leading-relaxed">
        {text}
      </Text>
    </HStack>
  );
}

function getGradeColor(grade: string): string {
  const gradeColors: { [key: string]: string } = {
    A: '#F6BF8C', // sanctuarySaffron
    B: '#B8A9E0', // Aurora Violet
    C: '#FDD925', // Temple Gold
    S: '#C8BFB0', // Starlight Gray
    F: '#FF6347', // emberRed
  };

  return gradeColors[grade] || '#968E80';
}
