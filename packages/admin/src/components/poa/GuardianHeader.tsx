import React from 'react';
import { Box, Text } from '@repo/ui';

interface GuardianHeaderProps {
  studentCount: number;
}

export const GuardianHeader: React.FC<GuardianHeaderProps> = ({ studentCount }) => {
  return (
    <Box className="px-5 py-5 border-b border-border bg-white/50">
      <Text className="text-primary font-bold text-2xl md:text-3xl mb-1">
        Guardian Dashboard
      </Text>
      <Text className="text-secondary text-sm md:text-base opacity-70">
        {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
      </Text>
    </Box>
  );
};
