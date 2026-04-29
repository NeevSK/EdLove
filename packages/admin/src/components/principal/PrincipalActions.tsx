import { Banknote, CalendarDays, ChevronRight, TrendingUp, UserCheck } from '@repo/ui/icons';
import { Box } from '@repo/ui/primitives';
import { HStack, Heading, Icon, Text, VStack } from '@repo/ui/primitives';
import { Pressable } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import type React from 'react';
import { useTranslation } from 'react-i18next';

interface PrincipalActionsProps {
  onAction?: (action: string) => void;
}

export default function PrincipalActions({ onAction }: PrincipalActionsProps) {
  const { t } = useTranslation();

  interface ActionCardProps {
    icon: React.ElementType;
    label: string;
    description: string;
    iconBgClass?: string;
    iconTextClass?: string;
    onPress?: () => void;
  }

  const ActionCard = ({
    icon: LucideIcon,
    label,
    description,
    iconBgClass,
    iconTextClass,
    onPress,
  }: ActionCardProps) => (
    <Pressable
      onPress={() => {
        hapticLight();
        if (onPress) onPress();
        if (onAction) onAction(label);
      }}
      accessibilityRole="button"
      className="flex-1 bg-phase-surface p-5 rounded-[28px] border border-phase-border active:scale-[0.98] transition-all shadow-sm"
    >
      <VStack className="gap-4">
        <HStack className="justify-between items-start">
          <Box className={`p-3 rounded-2xl ${iconBgClass || 'bg-phase-interactive/10'}`}>
            <Icon as={LucideIcon} size={20} className={iconTextClass || 'text-phase-interactive'} />
          </Box>
          <Icon as={TrendingUp} size="xs" className="text-phaseText-muted opacity-10" />
        </HStack>
        <VStack className="gap-0.5">
          <Text className="text-[15px] font-black text-phaseText-primary tracking-tight">
            {label}
          </Text>
          <Text className="text-[10px] font-bold text-phaseText-muted uppercase tracking-widest leading-tight">
            {description}
          </Text>
        </VStack>
      </VStack>
    </Pressable>
  );

  return (
    <VStack className="gap-5">
      <VStack className="gap-1 px-1">
        <Heading className="text-[20px] font-black text-phaseText-primary tracking-tight">
          {t('principal.admin.title') || 'Governing Actions'}
        </Heading>
        <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[2px]">
          Administrative Control
        </Text>
      </VStack>

      <VStack className="gap-4">
        <HStack className="gap-4">
          <ActionCard
            icon={Banknote}
            label={t('principal.admin.finance') || 'Financials'}
            description={t('principal.admin.financeDesc') || 'Resource Flow'}
            iconBgClass="bg-phase-success/10"
            iconTextClass="text-phase-success"
          />
          <ActionCard
            icon={CalendarDays}
            label={t('principal.admin.events') || 'Approvals'}
            description={t('principal.admin.eventsDesc') || 'Event Flow'}
            iconBgClass="bg-phase-interactive/10"
            iconTextClass="text-phase-interactive"
          />
        </HStack>

        {/* Staff Leave Requests Wide Card */}
        <Pressable
          onPress={() => {
            hapticLight();
            if (onAction) onAction('Leaves');
          }}
          className="active:scale-[0.99] transition-all"
        >
          <Box className="bg-phase-surface p-6 rounded-[28px] border border-phase-border shadow-md">
            <HStack className="justify-between items-center">
              <HStack className="gap-5 items-center flex-1">
                <Box className="p-3.5 rounded-[18px] bg-phase-interactive/10 border border-phase-interactive/10">
                  <Icon as={UserCheck} size="sm" className="text-phase-interactive" />
                </Box>
                <VStack className="flex-1 gap-0.5">
                  <Text className="text-[16px] font-black text-phaseText-primary tracking-tight">
                    {t('principal.admin.leaves') || 'Human Resources'}
                  </Text>
                  <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-widest">
                    {t('principal.admin.leavesDesc') || 'Absence Governance'}
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-center gap-2 bg-phase-interactive/5 px-4 py-2 rounded-full border border-phase-interactive/10">
                <Text className="text-[10px] font-black text-phase-interactive uppercase tracking-wider">
                  Review
                </Text>
                <Icon as={ChevronRight} size="xs" className="text-phase-interactive" />
              </HStack>
            </HStack>
          </Box>
        </Pressable>
      </VStack>
    </VStack>
  );
}
