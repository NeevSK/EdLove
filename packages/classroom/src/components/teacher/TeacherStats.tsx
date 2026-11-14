import type React from 'react';
import { Text, View } from 'react-native';

interface TeacherStatCardProps {
  label: string;
  value: string | number;
  accentColorClass?: string;
}

export const TeacherStatCard: React.FC<TeacherStatCardProps> = ({
  label,
  value,
  accentColorClass = 'bg-sanctuarySaffron',
}) => {
  const accentDotClass = accentColorClass;

  return (
    <View className="rounded-[32px] border border-sanctuary-border bg-sanctuary-surface p-7 overflow-hidden relative">
      <View
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.03] ${accentColorClass}`}
      />

      <View className="gap-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-sanctuary-text-tertiary">
            {label}
          </Text>
          <View className={`h-2.5 w-2.5 rounded-full ${accentDotClass}`} />
        </View>
        <Text className="text-3xl text-sanctuary-text font-black tracking-tighter">
          {value}
        </Text>
      </View>
    </View>
  );
};

interface TeacherStatsProps {
  stats: {
    totalStudents: number;
    averageAttendance: number;
    pendingAssignments: number;
    activeClassrooms: number;
  };
}

export const TeacherStats: React.FC<TeacherStatsProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Students',
      value: stats.totalStudents,
      accentColorClass: 'bg-sanctuarySaffron',
    },
    {
      label: 'Attendance',
      value: `${stats.averageAttendance}%`,
      accentColorClass: 'bg-sanctuary-success',
    },
    {
      label: 'Assignments',
      value: stats.pendingAssignments,
      accentColorClass: 'bg-sanctuary-error',
    },
    {
      label: 'Sanctuaries',
      value: stats.activeClassrooms,
      accentColorClass: 'bg-sanctuary-info',
    },
  ];

  return (
    <View className="flex-row flex-wrap gap-4">
      {statItems.map((item) => (
        <View key={item.label} className="min-w-[160px] flex-1">
          <TeacherStatCard {...item} />
        </View>
      ))}
    </View>
  );
};

export default TeacherStats;
