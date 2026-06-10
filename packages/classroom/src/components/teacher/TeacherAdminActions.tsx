import {
  BookOpen,
  ClipboardList,
  Database,
  type LucideIcon,
  Settings,
  Shield,
  Users,
} from '@repo/ui/icons';
import { Box, Heading, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';

import type React from 'react';

const ICON_MAP: Record<string, LucideIcon> = {
  Settings: Settings,
  Users: Users,
  BookOpen: BookOpen,
  Shield: Shield,
  ClipboardList: ClipboardList,
  Database: Database,
};

interface TeacherAdminButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
}

export const TeacherAdminButton: React.FC<TeacherAdminButtonProps> = ({ label, onClick, icon }) => {
  const IconComponent = ICON_MAP[icon] || Settings;

  return (
    <Pressable
      onPress={onClick}
      className="w-full flex-row items-start justify-start rounded-[32px] border border-phase-border/40 bg-phase-surface-secondary p-7 active:scale-[0.98] transition-all shadow-sm group"
    >
      <VStack className="items-start gap-4 flex-1">
        <HStack className="items-center gap-3">
          <Box className="w-10 h-10 bg-phase-surface rounded-xl items-center justify-center border border-phase-border/20 shadow-sm group-active:bg-phase-surface-secondary">
            <Icon as={IconComponent} size="xs" className="text-sanctuarySaffron" />
          </Box>
          <Text className="text-[10px] font-black uppercase tracking-[0.25em] text-phase-text-tertiary">
            Admin Signal
          </Text>
        </HStack>
        <Heading className="text-xl text-phase-text-primary font-black tracking-tight leading-tight">
          {label}
        </Heading>
      </VStack>
    </Pressable>
  );
};

interface TeacherAdminActionsProps {
  actions: Array<{
    id: string;
    label: string;
    icon: string;
    onClick: () => void;
  }>;
}

export const TeacherAdminActions: React.FC<TeacherAdminActionsProps> = ({ actions }) => {
  return (
    <HStack className="flex-wrap gap-4">
      {actions.map((action) => (
        <Box key={action.id} className="min-w-[170px] flex-1">
          <TeacherAdminButton {...action} />
        </Box>
      ))}
    </HStack>
  );
};
