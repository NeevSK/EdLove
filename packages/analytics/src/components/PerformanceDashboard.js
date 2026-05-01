import { SimpleBarChart } from "@repo/graphics/charts";
import { Card } from '@repo/ui/components/SanctuaryCard';
import { useThemedColors } from '@repo/ui/hooks';
import { Box } from '@repo/ui/primitives';
import { HStack, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { colors } from '@repo/ui/theme';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { formatGPA, getGradeColor, getPerformanceLevel } from '../utils/analyticsHelpers';
export function PerformanceDashboard({ metrics, insights = [], recommendations = [] }) {
    const themeColors = useThemedColors();
    const performanceLevel = getPerformanceLevel(metrics.averageMarks);
    const subjectData = Object.entries(metrics.subjectPerformance).map(([subject, score]) => ({
        label: subject,
        value: score,
        color: getGradeColor(score >= 80 ? 'A' : score >= 70 ? 'B' : 'C'),
    }));
    return _jsx(ScrollView, {
        className: 'flex-1',
        contentContainerStyle: { padding: 16 },
        style: { backgroundColor: colors.silk },
        children: _jsxs(VStack, {
            className: 'gap-4',
            children: [
                _jsxs(Card, {
                    className: 'rounded-3xl bg-white/75 px-6 py-6',
                    children: [
                        _jsx(Text, {
                            className: 'text-xl font-bold',
                            style: { color: themeColors.text },
                            children: 'Student Performance',
                        }),
                        _jsxs(Text, {
                            className: 'mb-4 mt-1 text-sm',
                            style: { color: themeColors.textSecondary },
                            children: ['ID: ', metrics.studentId],
                        }),
                        _jsxs(HStack, {
                            className: 'mb-4 w-full justify-around gap-3',
                            children: [
                                _jsxs(VStack, {
                                    className: 'flex-1 items-center gap-1',
                                    children: [
                                        _jsx(Text, {
                                            className: 'text-lg font-bold',
                                            style: { color: themeColors.text },
                                            children: formatGPA(metrics.currentGPA),
                                        }),
                                        _jsx(Text, {
                                            className: 'text-xs',
                                            style: { color: themeColors.textSecondary },
                                            children: 'Current GPA',
                                        }),
                                    ],
                                }),
                                _jsxs(VStack, {
                                    className: 'flex-1 items-center gap-1',
                                    children: [
                                        _jsxs(Text, {
                                            className: 'text-lg font-bold',
                                            style: { color: themeColors.text },
                                            children: [metrics.averageMarks.toFixed(1), '%'],
                                        }),
                                        _jsx(Text, {
                                            className: 'text-xs',
                                            style: { color: themeColors.textSecondary },
                                            children: 'Average Marks',
                                        }),
                                    ],
                                }),
                                _jsxs(VStack, {
                                    className: 'flex-1 items-center gap-1',
                                    children: [
                                        _jsxs(Text, {
                                            className: 'text-lg font-bold',
                                            style: { color: themeColors.text },
                                            children: ['#', metrics.rankInClass],
                                        }),
                                        _jsx(Text, {
                                            className: 'text-xs',
                                            style: { color: themeColors.textSecondary },
                                            children: 'Class Rank',
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        _jsx(Box, {
                            className: 'items-center border-t pt-3',
                            style: { borderTopColor: 'rgba(42,35,24,0.08)' },
                            children: _jsxs(Text, {
                                className: 'text-sm font-semibold',
                                style: {
                                    color: metrics.trendDirection === 'improving'
                                        ? themeColors.success
                                        : metrics.trendDirection === 'declining'
                                            ? themeColors.error
                                            : themeColors.warning,
                                },
                                children: [
                                    'Trend:',
                                    ' ',
                                    metrics.trendDirection.charAt(0).toUpperCase() + metrics.trendDirection.slice(1),
                                    ' (',
                                    performanceLevel,
                                    ')',
                                ],
                            }),
                        }),
                    ],
                }),
                _jsx(Card, {
                    className: 'rounded-3xl bg-white/70 px-4 py-4',
                    children: _jsx(SimpleBarChart, {
                        title: 'Performance Overview',
                        data: [
                            { label: 'GPA', value: metrics.currentGPA, color: themeColors.primary },
                            { label: 'Avg Marks', value: metrics.averageMarks, color: themeColors.secondary },
                            { label: 'Rank', value: metrics.rankInClass, color: themeColors.action },
                        ],
                        height: 180,
                    }),
                }),
                _jsx(Card, {
                    className: 'rounded-3xl bg-white/70 px-4 py-4',
                    children: _jsx(SimpleBarChart, {
                        title: 'Subject Performance',
                        data: subjectData,
                        height: 150,
                    }),
                }),
                insights.length > 0
                    ? _jsxs(Card, {
                        className: 'rounded-3xl bg-white/70 px-4 py-4',
                        children: [
                            _jsx(Text, {
                                className: 'mb-2 text-base font-semibold',
                                style: { color: themeColors.text },
                                children: 'Insights',
                            }),
                            _jsx(VStack, {
                                className: 'gap-2',
                                children: insights.map((insight, index) => _jsxs(Text, {
                                    className: 'text-sm leading-5',
                                    style: { color: themeColors.text },
                                    children: ['\u2022 ', insight],
                                }, index)),
                            }),
                        ],
                    })
                    : null,
                recommendations.length > 0
                    ? _jsxs(Card, {
                        className: 'rounded-3xl bg-white/70 px-4 py-4',
                        children: [
                            _jsx(Text, {
                                className: 'mb-2 text-base font-semibold',
                                style: { color: themeColors.text },
                                children: 'Recommendations',
                            }),
                            _jsx(VStack, {
                                className: 'gap-2',
                                children: recommendations.map((recommendation, index) => _jsxs(Text, {
                                    className: 'text-sm leading-5',
                                    style: { color: themeColors.text },
                                    children: [index + 1, '. ', recommendation],
                                }, index)),
                            }),
                        ],
                    })
                    : null,
            ],
        }),
    });
}
