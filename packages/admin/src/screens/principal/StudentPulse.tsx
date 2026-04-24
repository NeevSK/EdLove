import React from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react-native';
import { StudentAttendancePulse } from '@repo/core';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Pressable,
    Icon,
    hapticLight
} from '@repo/ui';

interface StudentPulseProps {
    pulse: StudentAttendancePulse | null;
    atRiskCount: number;
    onShowAtRisk: () => void;
}

export const StudentPulse: React.FC<StudentPulseProps> = ({ pulse, atRiskCount, onShowAtRisk }) => {
    const { t } = useTranslation();

    const trend = (pulse?.todayRate ?? 0) - (pulse?.yesterdayRate ?? 0);
    const isPositiveTrend = trend >= 0;

    return (
        <Box className="bg-phase-surface p-6 rounded-[32px] border border-phase-border gap-6 shadow-sm">
            <HStack className="justify-between items-center">
                <HStack className="items-center gap-4">
                    <Box className="bg-phase-interactive/10 p-3.5 rounded-2xl shadow-inner">
                        <Icon as={GraduationCap} size="md" className="text-phase-interactive" />
                    </Box>
                    <VStack className="gap-0.5">
                        <Heading className="text-[18px] font-black text-phaseText-primary tracking-tight">Student Pulse</Heading>
                        <Text className="text-[12px] text-phaseText-muted font-bold uppercase tracking-widest">Attendance and Lifecycle Insight</Text>
                    </VStack>
                </HStack>
                <Box className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full ${isPositiveTrend ? 'bg-phase-success/10' : 'bg-phase-danger/10'}`}>
                    <Icon as={isPositiveTrend ? TrendingUp : AlertTriangle} size="xs" className={isPositiveTrend ? 'text-phase-success' : 'text-phase-danger'} />
                    <Text className={`text-[12px] font-black ${isPositiveTrend ? 'text-phase-success' : 'text-phase-danger'}`}>
                        {isPositiveTrend ? '+' : ''}{trend.toFixed(1)}%
                    </Text>
                </Box>
            </HStack>

            <HStack className="gap-4">
                <Box className="flex-1 p-6 rounded-3xl bg-phase-canvas border border-phase-border gap-2.5 shadow-inner">
                    <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-[0.15em]">Daily Adoption</Text>
                    <Text className="text-4xl font-black text-phaseText-primary tracking-tighter">{pulse?.todayRate ?? 0}%</Text>
                </Box>
                <Pressable
                    onPress={() => { hapticLight(); onShowAtRisk(); }}
                    className="flex-1 p-6 rounded-3xl bg-phase-canvas border border-phase-border gap-2.5 shadow-inner active:scale-95 transition-all"
                >
                    <HStack className="items-center gap-2">
                        <Icon as={AlertTriangle} size="xs" className="text-phase-danger" />
                        <Text className="text-[10px] font-black text-phase-danger uppercase tracking-[0.15em]">At Risk</Text>
                    </HStack>
                    <Text className="text-4xl font-black text-phaseText-primary tracking-tighter">{atRiskCount}</Text>
                    <Text className="text-[10px] text-phaseText-muted font-black uppercase tracking-widest leading-relaxed">System Alerts</Text>
                </Pressable>
            </HStack>
        </Box>
    );
};
