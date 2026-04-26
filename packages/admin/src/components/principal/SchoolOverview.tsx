import type { School } from '@repo/core';
import { Box, HStack, Icon, Text, VStack } from '@repo/ui';
import { Building2, MapPin } from 'lucide-react-native';
import React from 'react';

interface SchoolOverviewProps {
  school: School;
}

export default function SchoolOverview({ school }: SchoolOverviewProps) {
  if (!school) return null;

  return (
    <VStack className="gap-4 p-6 bg-phase-surface rounded-[32px] border border-phase-border shadow-sm">
      <HStack className="gap-5 items-center">
        <Box className="w-14 h-14 rounded-[20px] bg-phase-interactive/10 items-center justify-center">
          <Icon as={Building2} size="md" className="text-phase-interactive" />
        </Box>
        <VStack className="flex-1 gap-1">
          <Text className="text-[18px] font-black text-phaseText-primary tracking-tight">
            {school.name}
          </Text>
          <HStack className="gap-1.5 items-center">
            <Icon as={MapPin} size="xs" className="text-phaseText-muted" />
            <Text className="text-[13px] font-bold text-phaseText-secondary">
              {school.address || 'Sanctuary Address Unset'}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </VStack>
  );
}
