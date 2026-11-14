import { View, Text } from 'react-native';
import type { SchoolStats as ISchoolStats } from '@repo/core/types';
import { Building, GraduationCap, Users } from '@repo/ui/icons';

interface SchoolStatsProps {
  stats: ISchoolStats;
}
export default function SchoolStats({ stats }: SchoolStatsProps) {
  if (!stats) return null;
  const StatItem = ({ label, value, icon: StatIcon, colorClass, bgClass }: any) => (
    <View className="flex-1 p-5 rounded-[24px] bg-phase-surface border border-phase-border shadow-sm">
      <View className="gap-3">
        <View className="flex-row items-center items-center gap-2">
          <View className={`p-1.5 rounded-lg ${bgClass}`}>
            <StatIcon size={12} className={colorClass} />
          </View>
          <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest">
            {label}
          </Text>
        </View>
        <Text className="text-[24px] font-black text-phaseText-primary tracking-tighter">
          {value}
        </Text>
      </View>
    </View>
  );
  return (
    <View className="flex-row items-center w-full gap-4">
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
    </View>
  );
}
