import type { SchoolStats as ISchoolStats } from '@repo/core';
import { Box, Building, GraduationCap, HStack, Icon, Text, Users, VStack } from '@repo/ui';

interface SchoolStatsProps {
  stats: ISchoolStats;
}

export default function SchoolStats({ stats }: SchoolStatsProps) {
  if (!stats) return null;

  const StatItem = ({ label, value, icon: StatIcon, colorClass, bgClass }: any) => (
    <Box className="flex-1 p-5 rounded-[24px] bg-phase-surface border border-phase-border shadow-sm">
      <VStack className="gap-3">
        <HStack className="items-center gap-2">
          <Box className={`p-1.5 rounded-lg ${bgClass}`}>
            <Icon as={StatIcon} size="xs" className={colorClass} />
          </Box>
          <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest">
            {label}
          </Text>
        </HStack>
        <Text className="text-[24px] font-black text-phaseText-primary tracking-tighter">
          {value}
        </Text>
      </VStack>
    </Box>
  );

  return (
    <HStack className="w-full gap-4">
      <StatItem
        label="Learners"
        value={stats?.total_students?.toString() || '0'}
        icon={Users}
        colorClass="text-phase-interactive"
        bgClass="bg-phase-interactive/10"
      />
      <StatItem
        label="Guides"
        value={stats?.total_teachers?.toString() || '0'}
        icon={GraduationCap}
        colorClass="text-phase-success"
        bgClass="bg-phase-success/10"
      />
      <StatItem
        label="Spaces"
        value={stats?.total_classrooms?.toString() || '0'}
        icon={Building}
        colorClass="text-phase-warning"
        bgClass="bg-phase-warning/10"
      />
    </HStack>
  );
}
