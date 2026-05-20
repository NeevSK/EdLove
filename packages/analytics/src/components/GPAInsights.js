import { Card } from '@repo/ui/components/SanctuaryCard';
import { Box, HStack, Text, VStack } from '@repo/ui/primitives';
import { colors } from '@repo/ui/theme';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { formatGPA, getGradeColor } from '../utils/analyticsHelpers';
export function GPAInsights({
  studentId,
  currentGPA,
  trendDirection,
  predictedGPA,
  targetGPA = 3.0,
}) {
  void studentId;
  const gapToTarget = targetGPA - currentGPA;
  const isOnTrack = predictedGPA ? predictedGPA >= targetGPA : currentGPA >= targetGPA;
  const trendColor =
    trendDirection === 'improving'
      ? colors.success
      : trendDirection === 'declining'
        ? colors.error
        : colors.warning;
  return _jsxs(Card, {
    className: 'rounded-3xl bg-white/70 px-6 py-6',
    children: [
      _jsx(Text, {
        className: 'mb-5 text-xl font-bold',
        style: { color: colors.text },
        children: 'GPA Insights',
      }),
      _jsxs(VStack, {
        className: 'gap-5',
        children: [
          _jsxs(HStack, {
            className: 'w-full justify-around gap-4',
            children: [
              _jsxs(VStack, {
                className: 'flex-1 items-center gap-1',
                children: [
                  _jsx(Text, {
                    className: 'text-center text-xs',
                    style: { color: colors.textSecondary },
                    children: 'Current GPA',
                  }),
                  _jsx(Text, {
                    className: 'text-center text-[28px] font-bold',
                    style: {
                      color: getGradeColor(currentGPA >= 3.5 ? 'A' : currentGPA >= 2.5 ? 'B' : 'C'),
                    },
                    children: formatGPA(currentGPA),
                  }),
                ],
              }),
              predictedGPA !== undefined
                ? _jsxs(VStack, {
                    className: 'flex-1 items-center gap-1',
                    children: [
                      _jsx(Text, {
                        className: 'text-center text-xs',
                        style: { color: colors.textSecondary },
                        children: 'Predicted GPA',
                      }),
                      _jsx(Text, {
                        className: 'text-center text-[28px] font-bold',
                        style: {
                          color: getGradeColor(
                            predictedGPA >= 3.5 ? 'A' : predictedGPA >= 2.5 ? 'B' : 'C',
                          ),
                        },
                        children: formatGPA(predictedGPA),
                      }),
                    ],
                  })
                : null,
            ],
          }),
          _jsxs(Box, {
            className: 'items-center gap-1',
            children: [
              _jsx(Text, {
                className: 'text-sm',
                style: { color: colors.textSecondary },
                children: 'Performance Trend',
              }),
              _jsx(Text, {
                className: 'text-base font-semibold',
                style: { color: trendColor },
                children: trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1),
              }),
            ],
          }),
          _jsxs(VStack, {
            className: 'gap-2',
            children: [
              _jsxs(Text, {
                className: 'text-sm',
                style: { color: colors.text },
                children: ['Target: ', formatGPA(targetGPA)],
              }),
              _jsx(Box, {
                className: 'h-2 w-full overflow-hidden rounded-full',
                style: { backgroundColor: colors.border },
                children: _jsx(Box, {
                  className: 'h-full rounded-full',
                  style: {
                    width: `${Math.min(100, Math.max(0, (currentGPA / 4.0) * 100))}%`,
                    backgroundColor: isOnTrack ? colors.success : colors.warning,
                  },
                }),
              }),
              _jsx(Text, {
                className: 'text-xs',
                style: { color: colors.textSecondary },
                children:
                  gapToTarget > 0 ? `${formatGPA(gapToTarget)} to target` : 'Target achieved!',
              }),
            ],
          }),
          _jsxs(VStack, {
            className: 'gap-2 pt-2',
            children: [
              _jsx(Text, {
                className: 'text-base font-semibold',
                style: { color: colors.text },
                children: 'Recommendations',
              }),
              _jsx(VStack, {
                className: 'gap-2',
                children: generateRecommendations(currentGPA, trendDirection, gapToTarget).map(
                  (recommendation, index) =>
                    _jsxs(
                      Text,
                      {
                        className: 'text-sm leading-5',
                        style: { color: colors.text },
                        children: ['\u2022 ', recommendation],
                      },
                      index,
                    ),
                ),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function generateRecommendations(currentGPA, trendDirection, gapToTarget) {
  const recommendations = [];
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
