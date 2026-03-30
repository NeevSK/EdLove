import React from 'react';
import { Theme, useTheme } from '@repo/ui';

interface TeacherStatCardProps {
  label: string;
  value: string | number;
  accent?: string;
}

export const TeacherStatCard: React.FC<TeacherStatCardProps> = ({ label, value, accent }) => {
  const theme = useTheme();

  return (
    <div
      className="rounded-[24px] p-5"
      style={{
        background: 'linear-gradient(180deg, rgba(250, 247, 237, 0.94) 0%, rgba(245, 237, 214, 0.9) 100%)',
        border: `1px solid ${theme.glass.surface.border}`,
        boxShadow: '0 16px 30px rgba(107, 100, 128, 0.08)',
      }}
          <div className="flex items-start justify-between gap-3"        <span
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: theme.text.secondary }}
                  {label}
        </span        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: accent || theme.accent.action, opacity: 0.9 }}
        /      </div      <div
        className="mt-5 text-3xl font-bold"
        style={{ color: theme.text.primary, lineHeight: 1 }}
              {value}
      </div    </div  );
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
    { label: 'Students', value: stats.totalStudents, accent: Theme.colors.gurudeviBlue },
    { label: 'Attendance', value: `${stats.averageAttendance}%`, accent: Theme.colors.sageGreen },
    { label: 'Assignments', value: stats.pendingAssignments, accent: Theme.colors.sanctuarySaffron },
    { label: 'Classrooms', value: stats.activeClassrooms, accent: Theme.colors.gurudeviViolet },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"      {statItems.map((item) => (
        <TeacherStatCard key={item.label} {...item} /      ))}
    </div  );
};
