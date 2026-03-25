import React from 'react';
import { useTheme } from '@repo/ui';

interface TeacherStatCardProps {
  label: string;
  value: string | number;
  icon: string;
}

export const TeacherStatCard: React.FC<TeacherStatCardProps> = ({ label, value, icon }) => {
  const theme = useTheme();
  return (
    <div 
      className="p-4 rounded-xl flex flex-col items-center justify-center text-center"
      style={{ 
        backgroundColor: theme.glass.surface.bg,
        border: `1px solid ${theme.glass.surface.border}`,
        backdropFilter: 'blur(10px)',
        minWidth: '140px'
      }}
    >
      <span 
        className="text-2xl font-bold mb-1"
        style={{ color: theme.text.primary }}
      >
        {value}
      </span>
      <span 
        className="text-xs uppercase tracking-wider opacity-60"
        style={{ color: theme.text.secondary }}
      >
        {label}
      </span>
    </div>
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
    { label: 'Students', value: stats.totalStudents, icon: 'Users' },
    { label: 'Attendance', value: `${stats.averageAttendance}%`, icon: 'BarChart' },
    { label: 'Assignments', value: stats.pendingAssignments, icon: 'FileText' },
    { label: 'Classrooms', value: stats.activeClassrooms, icon: 'Home' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <TeacherStatCard key={index} {...item} />
      ))}
    </div>
  );
};
