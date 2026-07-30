import { SimpleBarChart } from '@repo/graphics/charts';
import { Card } from '@repo/ui/components/SanctuaryCard';
import { useThemedColors } from '@repo/ui/hooks';
import { Box, HStack, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { colors } from '@repo/ui/theme';
import type { StudentPerformanceMetrics } from '@repo/analytics/types/AnalyticsTypes';
import { formatGPA, getGradeColor, getPerformanceLevel } from '@repo/analytics/utils/analyticsHelpers';

interface PerformanceDashboardProps {
  metrics: StudentPerformanceMetrics;
  insights?: string[];
  recommendations?: string[];
}
export function PerformanceDashboard({
  metrics,
  insights = [],
  recommendations = [],
}: PerformanceDashboardProps) {
  const themeColors = useThemedColors();
  const performanceLevel = getPerformanceLevel(metrics.averageMarks);
  const subjectData = Object.entries(metrics.subjectPerformance).map(([subject, score]) => ({
    label: subject,
    value: score as number,
    color: getGradeColor((score as number) >= 80 ? 'A' : (score as number) >= 70 ? 'B' : 'C'),
  }));
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16 }}
      style={{ backgroundColor: colors.silk }}
    >
      <VStack className="gap-4">
        <Card className="rounded-3xl bg-white/75 px-6 py-6">
          <Text className="text-xl font-bold" style={{ color: themeColors.text }}>
            Student Performance
          </Text>
          <Text className="mb-4 mt-1 text-sm" style={{ color: themeColors.textSecondary }}>
            ID: {metrics.studentId}
          </Text>

          <HStack className="mb-4 w-full justify-around gap-3">
            <VStack className="flex-1 items-center gap-1">
              <Text className="text-lg font-bold" style={{ color: themeColors.text }}>
                {formatGPA(metrics.currentGPA)}
              </Text>
              <Text className="text-xs" style={{ color: themeColors.textSecondary }}>
                Current GPA
              </Text>
            </VStack>
            <VStack className="flex-1 items-center gap-1">
              <Text className="text-lg font-bold" style={{ color: themeColors.text }}>
                {metrics.averageMarks.toFixed(1)}%
              </Text>
              <Text className="text-xs" style={{ color: themeColors.textSecondary }}>
                Average Marks
              </Text>
            </VStack>
            <VStack className="flex-1 items-center gap-1">
              <Text className="text-lg font-bold" style={{ color: themeColors.text }}>
                #{metrics.rankInClass}
              </Text>
              <Text className="text-xs" style={{ color: themeColors.textSecondary }}>
                Class Rank
              </Text>
            </VStack>
          </HStack>

          <Box
            className="items-center border-t pt-3"
            style={{ borderTopColor: 'rgba(42,35,24,0.08)' }}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color:
                  metrics.trendDirection === 'improving'
                    ? themeColors.success
                    : metrics.trendDirection === 'declining'
                      ? themeColors.error
                      : themeColors.warning,
              }}
            >
              Trend:{' '}
              {metrics.trendDirection.charAt(0).toUpperCase() + metrics.trendDirection.slice(1)} (
              {performanceLevel})
            </Text>
          </Box>
        </Card>

        <Card className="rounded-3xl bg-white/70 px-4 py-4">
          <SimpleBarChart
            title="Performance Overview"
            data={[
              {
                label: 'GPA',
                value: metrics.currentGPA,
                color: themeColors.primary,
              },
              {
                label: 'Avg Marks',
                value: metrics.averageMarks,
                color: themeColors.secondary,
              },
              {
                label: 'Rank',
                value: metrics.rankInClass,
                color: themeColors.action,
              },
            ]}
            height={180}
          />
        </Card>

        <Card className="rounded-3xl bg-white/70 px-4 py-4">
          <SimpleBarChart title="Subject Performance" data={subjectData} height={150} />
        </Card>

        {insights.length > 0 ? (
          <Card className="rounded-3xl bg-white/70 px-4 py-4">
            <Text className="mb-2 text-base font-semibold" style={{ color: themeColors.text }}>
              Insights
            </Text>
            <VStack className="gap-2">
              {insights.map((insight) => (
                <Text
                  key={insight}
                  className="text-sm leading-5"
                  style={{ color: themeColors.text }}
                >
                  • {insight}
                </Text>
              ))}
            </VStack>
          </Card>
        ) : null}

        {recommendations.length > 0 ? (
          <Card className="rounded-3xl bg-white/70 px-4 py-4">
            <Text className="mb-2 text-base font-semibold" style={{ color: themeColors.text }}>
              Recommendations
            </Text>
            <VStack className="gap-2">
              {recommendations.map((recommendation, index) => (
                <Text
                  key={recommendation}
                  className="text-sm leading-5"
                  style={{ color: themeColors.text }}
                >
                  {index + 1}. {recommendation}
                </Text>
              ))}
            </VStack>
          </Card>
        ) : null}
      </VStack>
    </ScrollView>
  );
}
