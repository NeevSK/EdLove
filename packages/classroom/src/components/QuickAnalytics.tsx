import { View, Text, Pressable, ScrollView } from 'react-native';
import { marksToGPA } from '@repo/analytics/stats';
import { ProgressRing } from '@repo/graphics/charts';
import { Surface } from '@repo/ui/components/native';
import {
  ArrowRight,
  ChartLine as ChartIcon,
  CircleCheck,
  FileText,
  GraduationCap,
  Lightbulb,
  Minus,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from '@repo/ui/icons';
import { Theme } from '@repo/ui/theme/Theme';

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
  const IconComp = icon;
  return (
    <Surface tone="raised" className="p-6 rounded-[32px]">
      <View className="gap-4">
        <View className="flex-row items-center justify-between items-center">
          <View className="flex-row items-center items-center gap-2">
            {IconComp && <IconComp size={12} className="text-phase-text-tertiary" />}
            <Text className="text-xs font-bold text-phase-text-secondary uppercase tracking-widest">
              {title}
            </Text>
          </View>
          {trend && (
            <View className="flex-row items-center items-center gap-1">
              <TrendIcon size={12} className={trendColor} />
            </View>
          )}
        </View>

        <View className="gap-1">
          <Text className="text-4xl font-black tracking-tighter" style={{ color: color }}>
            {value}
          </Text>
          {subtitle && (
            <Text className="text-sm font-medium text-phase-text-tertiary">{subtitle}</Text>
          )}
        </View>

        {gradeInfo && (
          <View className="flex-row items-center bg-phase-surface p-3 rounded-[20px] justify-between items-center border border-phase-border/50">
            <View className="flex-row items-center items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-sanctuarySaffron" />
              <Text className="text-sm font-bold text-phase-text-primary">
                Grade: {gradeInfo.grade}
              </Text>
            </View>
            <Text className="text-xs font-black text-phase-text-tertiary uppercase">
              GPA: {gradeInfo.gpa.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    </Surface>
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
      <View className="p-6 gap-8 pb-32">
        <View className="flex-row items-center items-center gap-4 mt-2">
          <View className="p-3.5 bg-sanctuarySaffron rounded-[24px] shadow-lg shadow-sanctuarySaffron/20">
            <ChartIcon size={20} className="text-sanctuary-ink" />
          </View>
          <View>
            <Text className="text-3xl font-black text-phase-text-primary tracking-tighter leading-none">
              Quick Analytics
            </Text>
            <Text className="text-base font-medium text-phase-text-tertiary">
              Academic Performance & Engagement
            </Text>
          </View>
        </View>

        <View className="gap-4">
          <AnalyticsWidget
            title="Current Grade"
            value={currentGrade ? `${currentGrade.grade} (${marks}%)` : 'N/A'}
            showGrade={true}
            marks={marks}
            color={currentGrade ? getGradeColor(currentGrade.grade) : undefined}
            icon={GraduationCap}
          />
          <View className="flex-row items-center gap-4">
            <View className="flex-1">
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
            </View>
            <View className="flex-1">
              <AnalyticsWidget
                title="Class Rank"
                value={`#${rank || 'N/A'}`}
                subtitle={`of ${rank ? rank + 20 : 'N/A'} students`}
                color={Theme.colors.sacredWhite}
                icon={Trophy}
              />
            </View>
          </View>
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
        </View>

        <Card className="p-8 bg-phase-surface-secondary rounded-[40px] border border-phase-border shadow-md">
          <View className="flex-row items-center items-center gap-2 mb-8">
            <TrendingUp size={16} className="text-sanctuarySaffron" />
            <Text className="text-xl font-black text-phase-text-primary tracking-tighter uppercase">
              Progress Overview
            </Text>
          </View>
          <View className="gap-8 items-center">
            <View className="p-4 bg-phase-surface rounded-full shadow-inner border border-phase-border/30">
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
            </View>
            <View className="items-center gap-1">
              <Text className="text-4xl font-black text-phase-text-primary tracking-tight">
                {((averageGPA / 4.0) * 100).toFixed(0)}%
              </Text>
              <Text className="text-sm font-bold text-phase-text-tertiary uppercase tracking-widest">
                GPA Progress
              </Text>
            </View>
          </View>
        </Card>

        <View className="gap-4">
          <View className="flex-row items-center items-center gap-2 px-2">
            <Zap size={16} className="text-sanctuarySaffron" />
            <Text className="text-xl font-black text-phase-text-primary tracking-tighter uppercase">
              Quick Actions
            </Text>
          </View>
          <View className="gap-3">
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
                <View className="flex-row items-center items-center gap-4">
                  <View className="p-2 bg-phase-surface rounded-xl">
                    <action.icon size={12} className="text-sanctuarySaffron" />
                  </View>
                  <Text className="text-base font-bold text-phase-text-primary">
                    {action.label}
                  </Text>
                </View>
                <ArrowRight size={12} className="text-phase-text-tertiary" />
              </Pressable>
            ))}
          </View>
        </View>

        <Card className="p-8 bg-phase-surface-secondary rounded-[40px] border border-phase-border relative overflow-hidden">
          <View className="absolute -top-10 -right-10 w-40 h-40 bg-sanctuarySaffron/5 rounded-full" />
          <View className="flex-row items-center items-center gap-2 mb-6">
            <Lightbulb size={16} className="text-sanctuarySaffron" />
            <Text className="text-xl font-black text-phase-text-primary tracking-tighter uppercase">
              Performance Tips
            </Text>
          </View>
          <View className="gap-4">
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
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
function Tip({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-4 items-start p-4 bg-phase-surface rounded-[20px] border border-phase-border/30">
      <View className="w-2 h-2 rounded-full bg-sanctuarySaffron mt-2" />
      <Text className="flex-1 text-sm font-bold text-phase-text-secondary leading-relaxed">
        {text}
      </Text>
    </View>
  );
}
function getGradeColor(grade: string): string {
  const gradeColors: {
    [key: string]: string;
  } = {
    A: '#F6BF8C', // sanctuarySaffron
    B: '#B8A9E0', // Aurora Violet
    C: '#FDD925', // Temple Gold
    S: '#C8BFB0', // Starlight Gray
    F: '#FF6347', // emberRed
  };
  return gradeColors[grade] || '#968E80';
}
