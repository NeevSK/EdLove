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
    Icon
} from '@repo/ui';

interface StudentPulseProps {
    pulse: StudentAttendancePulse | null;
    atRiskCount: number;
    onShowAtRisk: () => void;
}

export const StudentPulse: React.FC<StudentPulseProps> = ({ pulse, atRiskCount, onShowAtRisk }) => {
    const { t } = useTranslation();

    return (
        <Box className="bg-silk p-6 rounded-3xl border border-border gap-5">
            <HStack className="justify-between items-center">
                <HStack className="items-center gap-3">
                    <Box className="bg-primary/10 p-3 rounded-2xl">
                        <Icon as={GraduationCap} size="md" className="text-primary" />
                    </Box>
                    <VStack>
                        <Heading className="text-lg font-black text-ink">Student Pulse</Heading>
                        <Text className="text-[13px] text-ink/40 font-bold">Attendance and engagement trends</Text>
                    </VStack>
                </HStack>
                <Box className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10">
                    <Icon as={TrendingUp} size="xs" className="text-green-600" />
                    <Text className="text-xs font-black text-green-600">
                        +{((pulse?.todayRate ?? 0) - (pulse?.yesterdayRate ?? 0)).toFixed(1)}%
                    </Text>
                </Box>
            </HStack>

            <HStack className="gap-4">
                <Box className="flex-1 p-5 rounded-2xl bg-white border border-border/50 gap-2 shadow-sm">
                    <Text className="text-[11px] font-black text-ink/40 uppercase tracking-widest">Current Attendance</Text>
                    <Text className="text-3xl font-black text-ink">{pulse?.todayRate ?? 0}%</Text>
                </Box>
                <Pressable
                    onPress={onShowAtRisk}
                    className="flex-1 p-5 rounded-2xl bg-white border border-border/50 gap-2 shadow-sm active:scale-95 transition-all"
                >
                    <HStack className="items-center gap-1">
                        <Icon as={AlertTriangle} size="xs" className="text-red-500" />
                        <Text className="text-[11px] font-black text-red-500 uppercase tracking-widest">At Risk</Text>
                    </HStack>
                    <Text className="text-3xl font-black text-ink">{atRiskCount}</Text>
                    <Text className="text-[11px] text-ink/40 font-bold">Frequent absentees</Text>
                </Pressable>
            </HStack>
        </Box>
    );
};
