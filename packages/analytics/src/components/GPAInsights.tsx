import { Card } from '@repo/ui/components/SanctuaryCard';
import { Box, HStack, Text, VStack } from '@repo/ui/primitives';
import { colors } from '@repo/ui/theme';
import { formatGPA, getGradeColor } from '@repo/analytics/utils/analyticsHelpers';

interface GPAInsightsProps {
  studentId: string;
  currentGPA: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  predictedGPA?: number;
  targetGPA?: number;
}

export function GPAInsights({
  studentId,
  currentGPA,
  trendDirection,
  predictedGPA,
  targetGPA = 3.0,
}: GPAInsightsProps) {
  void studentId;

  const gapToTarget = targetGPA - currentGPA;
  const isOnTrack = predictedGPA ? predictedGPA >= targetGPA : currentGPA >= targetGPA;
  const trendColor =
    trendDirection === 'improving'
      ? colors.success
      : trendDirection === 'declining'
        ? colors.error
        : colors.warning;

  return (
    <Card className="rounded-3xl bg-white/70 px-6 py-6">
      <Text className="mb-5 text-xl font-bold" style={{ color: colors.text }}>
        GPA Insights
      </Text>

      <VStack className="gap-5">
        <HStack className="w-full justify-around gap-4">
          <VStack className="flex-1 items-center gap-1">
            <Text className="text-center text-xs" style={{ color: colors.textSecondary }}>
              Current GPA
            </Text>
            <Text
              className="text-center text-[28px] font-bold"
              style={{
                color: getGradeColor(currentGPA >= 3.5 ? 'A' : currentGPA >= 2.5 ? 'B' : 'C'),
              }}
            >
              {formatGPA(currentGPA)}
            </Text>
          </VStack>

          {predictedGPA !== undefined ? (
            <VStack className="flex-1 items-center gap-1">
              <Text className="text-center text-xs" style={{ color: colors.textSecondary }}>
                Predicted GPA
              </Text>
              <Text
                className="text-center text-[28px] font-bold"
                style={{
                  color: getGradeColor(predictedGPA >= 3.5 ? 'A' : predictedGPA >= 2.5 ? 'B' : 'C'),
                }}
              >
                {formatGPA(predictedGPA)}
              </Text>
            </VStack>
          ) : null}
        </HStack>

        <Box className="items-center gap-1">
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            Performance Trend
          </Text>
          <Text className="text-base font-semibold" style={{ color: trendColor }}>
            {trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)}
          </Text>
        </Box>

        <VStack className="gap-2">
          <Text className="text-sm" style={{ color: colors.text }}>
            Target: {formatGPA(targetGPA)}
          </Text>
          <Box
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: colors.border }}
          >
            <Box
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, Math.max(0, (currentGPA / 4.0) * 100))}%`,
                backgroundColor: isOnTrack ? colors.success : colors.warning,
              }}
            />
          </Box>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {gapToTarget > 0 ? `${formatGPA(gapToTarget)} to target` : 'Target achieved!'}
          </Text>
        </VStack>

        <VStack className="gap-2 pt-2">
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            Recommendations
          </Text>
          <VStack className="gap-2">
            {generateRecommendations(currentGPA, trendDirection, gapToTarget).map(
              (recommendation) => (
                <Text
                  key={recommendation}
                  className="text-sm leading-5"
                  style={{ color: colors.text }}
                >
                  • {recommendation}
                </Text>
              ),
            )}
          </VStack>
        </VStack>
      </VStack>
    </Card>
  );
}

function generateRecommendations(
  currentGPA: number,
  trendDirection: string,
  gapToTarget: number,
): string[] {
  const recommendations: string[] = [];

  if (trendDirection === 'declining') {
    recommendations.push('Focus on recent assignments to reverse declining trend');
    recommendations.push('Consider additional study support or tutoring');
  } else if (trendDirection === 'improving') {
    recommendations.push('Maintain current study habits and momentum');
  }

  if (gapToTarget > 0.5) {
    recommendations.push('Significant improvement needed to reach target GPA');
    recommendations.push('Focus on high-impact assignments and exams');
  } else if (gapToTarget > 0) {
    recommendations.push('Close to target - maintain consistent performance');
  }

  if (currentGPA < 2.0) {
    recommendations.push('Academic probation risk - seek immediate support');
  }

  return recommendations;
}
