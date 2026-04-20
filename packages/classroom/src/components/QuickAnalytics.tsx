import React from 'react';
import { ScrollView } from 'react-native';
import { VStack, HStack, Card, Text, Box, Icon, Theme, Pressable } from '@repo/ui';
import { marksToGPA } from '@repo/analytics';
import { ProgressRing } from '@repo/graphics';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowRight,
    Trophy,
    GraduationCap,
    CalendarCheck,
    LineChart as ChartIcon,
    Zap,
    Lightbulb,
    FileText
} from 'lucide-react-native';

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
    color = '#F4B400', // sanctuarySaffron
    showGrade = false,
    marks,
    icon
}: AnalyticsWidgetProps) {
    const gradeInfo = showGrade && marks !== undefined ? marksToGPA(marks) : null;

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-sanctuary-success' : trend === 'down' ? 'text-sanctuary-error' : 'text-sanctuary-text-tertiary';

    return (
        <Card className="p-5 bg-sanctuary-surface-secondary rounded-[32px] border border-sanctuary-border shadow-sm">
            <VStack className="gap-3">
                <HStack className="justify-between items-center">
                    <HStack className="items-center gap-2">
                        {icon && <Icon as={icon} size="xs" className="text-sanctuary-text-tertiary" />}
                        <Text className="text-sm font-bold text-sanctuary-text-secondary uppercase tracking-tighter">
                            {title}
                        </Text>
                    </HStack>
                    {trend && (
                        <HStack className="items-center gap-1">
                            <Icon as={TrendIcon} size="xs" className={trendColor} />
                        </HStack>
                    )}
                </HStack>

                <VStack className="gap-0.5">
                    <Text className="text-3xl font-black text-sanctuary-text tracking-tighter" style={{ color }}>
                        {value}
                    </Text>
                    {subtitle && (
                        <Text className="text-xs font-medium text-sanctuary-text-tertiary">
                            {subtitle}
                        </Text>
                    )}
                </VStack>

                {gradeInfo && (
                    <HStack className="bg-white/5 p-3 rounded-2xl justify-between items-center border border-white/5">
                        <HStack className="items-center gap-2">
                            <Box className="w-2 h-2 rounded-full bg-sanctuarySaffron" />
                            <Text className="text-sm font-bold text-sanctuary-text">
                                Grade: {gradeInfo.grade}
                            </Text>
                        </HStack>
                        <Text className="text-xs font-black text-sanctuary-text-tertiary uppercase">
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
    rank = 0
}: QuickAnalyticsProps) {
    const currentGrade = marks !== undefined ? marksToGPA(marks) : null;

    return (
        <ScrollView className="flex-1 bg-sanctuary-surface" showsVerticalScrollIndicator={false}>
            <VStack className="p-6 gap-6 pb-32">
                <HStack className="items-center gap-3 mb-2">
                    <Box className="p-3 bg-sanctuarySaffron rounded-2xl">
                        <ChartIcon size={24} color="#000" />
                    </Box>
                    <VStack>
                        <Text className="text-2xl font-black text-sanctuary-text tracking-tighter">
                            Quick Analytics
                        </Text>
                        <Text className="text-sm font-medium text-sanctuary-text-tertiary">
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
                                color={averageGPA >= 3.0 ? Theme.colors.sanctuarySaffron : averageGPA < 2.0 ? Theme.colors.emberRed : Theme.colors.templeGold}
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
                        color={attendanceRate > 0.9 ? '#10B981' : attendanceRate < 0.7 ? '#EF4444' : '#F4B400'}
                        icon={CalendarCheck}
                    />
                </VStack>

                <Card className="p-6 bg-sanctuary-surface-secondary rounded-[32px] border border-sanctuary-border">
                    <HStack className="items-center gap-2 mb-6">
                        <Icon as={TrendingUp} size="sm" className="text-sanctuarySaffron" />
                        <Text className="text-lg font-black text-sanctuary-text tracking-tighter uppercase">
                            Progress Overview
                        </Text>
                    </HStack>
                    <VStack className="gap-6 items-center">
                        <ProgressRing
                            value={averageGPA}
                            max={4.0}
                            size={160}
                            color={averageGPA >= 3.0 ? '#F4B400' : averageGPA < 2.0 ? '#EF4444' : '#F4B400'}
                        />
                        <VStack className="items-center gap-1">
                            <Text className="text-3xl font-black text-sanctuary-text">
                                {((averageGPA / 4.0) * 100).toFixed(0)}%
                            </Text>
                            <Text className="text-sm font-bold text-sanctuary-text-tertiary uppercase tracking-wider">
                                GPA Progress
                            </Text>
                        </VStack>
                    </VStack>
                </Card>

                <Card className="p-6 bg-sanctuary-surface-secondary rounded-[32px] border border-sanctuary-border">
                    <HStack className="items-center gap-2 mb-4">
                        <Icon as={Zap} size="sm" className="text-sanctuarySaffron" />
                        <Text className="text-lg font-black text-sanctuary-text tracking-tighter uppercase">
                            Quick Actions
                        </Text>
                    </HStack>
                    <VStack className="gap-3">
                        {[
                            { icon: FileText, label: "View detailed gradebook" },
                            { icon: ChartIcon, label: "Track performance trends" },
                            { icon: GraduationCap, label: "Set GPA goals" },
                            { icon: FileText, label: "Download progress report" }
                        ].map((action, i) => (
                            <Pressable key={i} className="flex-row items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <HStack className="items-center gap-3">
                                    <Icon as={action.icon} size="xs" className="text-sanctuarySaffron" />
                                    <Text className="text-base font-bold text-sanctuary-text-secondary">
                                        {action.label}
                                    </Text>
                                </HStack>
                                <Icon as={ArrowRight} size="xs" className="text-sanctuary-text-tertiary" />
                            </Pressable>
                        ))}
                    </VStack>
                </Card>

                <Card className="p-6 bg-sanctuarySaffron/5 rounded-[32px] border border-sanctuarySaffron/20">
                    <HStack className="items-center gap-2 mb-4">
                        <Icon as={Lightbulb} size="sm" className="text-sanctuarySaffron" />
                        <Text className="text-lg font-black text-sanctuarySaffron tracking-tighter uppercase">
                            Performance Tips
                        </Text>
                    </HStack>
                    <VStack className="gap-3">
                        {averageGPA < 2.0 && (
                            <Tip text="Focus on improving attendance and assignment completion" />
                        )}
                        {attendanceRate < 0.8 && (
                            <Tip text="Better attendance strongly correlates with higher grades" />
                        )}
                        {rank > 0 && rank <= 5 && (
                            <Tip text="Great job! You're in top 5 of the class" />
                        )}
                        {averageGPA >= 3.5 && (
                            <Tip text="Excellent performance! Consider advanced coursework" />
                        )}
                    </VStack>
                </Card>
            </VStack>
        </ScrollView>
    );
}

function Tip({ text }: { text: string }) {
    return (
        <HStack className="gap-3 items-start">
            <Box className="w-1.5 h-1.5 rounded-full bg-sanctuarySaffron mt-2" />
            <Text className="flex-1 text-sm font-medium text-sanctuary-text leading-snug">
                {text}
            </Text>
        </HStack>
    );
}

function getGradeColor(grade: string): string {
    const colors: { [key: string]: string } = {
        'A': '#F4B400', // sanctuarySaffron
        'B': '#60A5FA', // Blue
        'C': '#F59E0B', // Gold
        'S': '#9CA3AF', // Gray
        'F': '#EF4444', // Red
    };

    return colors[grade] || '#9CA3AF';
}
