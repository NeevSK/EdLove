import React from 'react';
import { Box, Text, Theme, useTheme } from '@repo/ui';

interface TeacherStatCardProps {
  label: string;
  value: string | number;
  accent?: string;
}

export const TeacherStatCard: React.FC<TeacherStatCardProps> = ({ label, value, accent }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        padding: Theme.spacing.lg,
        borderRadius: 24,
        background: 'linear-gradient(180deg, rgba(250, 247, 237, 0.94) 0%, rgba(245, 237, 214, 0.9) 100%)',
        border: `1px solid ${theme.glass.surface.border}`,
        boxShadow: '0 16px 30px rgba(107, 100, 128, 0.08)',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <Text
          sx={{
            fontSize: 11,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: theme.text.secondary,
          }}
        >
          {label}
        </Text>
        <Box
          sx={{
            height: 10,
            width: 10,
            borderRadius: Theme.corners.full,
            backgroundColor: accent || theme.accent.action,
            opacity: 0.9,
          }}
        />
      </Box>
      <Text
        sx={{
          marginTop: Theme.spacing.md,
          fontSize: Theme.typography.fontSize['3xl'],
          fontWeight: '700',
          color: theme.text.primary,
          lineHeight: 1,
        }}
      >
        {value}
      </Text>
    </Box>
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
    { label: 'Students', value: stats.totalStudents, accent: Theme.colors.gurudeviBlue },
    { label: 'Attendance', value: `${stats.averageAttendance}%`, accent: Theme.colors.sageGreen },
    { label: 'Assignments', value: stats.pendingAssignments, accent: Theme.colors.sanctuarySaffron },
    { label: 'Classrooms', value: stats.activeClassrooms, accent: Theme.colors.gurudeviViolet },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          base: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
          xl: 'repeat(4, 1fr)',
        },
        gap: 16,
      }}
    >
      {statItems.map((item) => (
        <TeacherStatCard key={item.label} {...item} />
      ))}
    </Box>
  );
};
