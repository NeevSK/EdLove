import {
  ArrowRight,
  Box,
  HStack,
  hapticLight,
  Icon,
  LayoutGrid,
  Milestone,
  NotebookPen,
  Pressable,
  Text,
  UserPlus,
  VStack,
} from '@repo/ui';

import { useTranslation } from 'react-i18next';

interface ManagementStationProps {
  onAction: (action: 'hierarchy' | 'invites' | 'notes' | 'cycles') => void;
}

export default function ManagementStation({ onAction }: ManagementStationProps) {
  const { t } = useTranslation();

  const ActionItem = ({ icon: LucideIcon, label, description, target }: any) => (
    <Pressable
      onPress={() => {
        hapticLight();
        onAction(target);
      }}
      className="flex-1 bg-phase-surface p-5 rounded-[24px] border border-phase-border active:scale-[0.98] transition-all shadow-sm"
    >
      <HStack className="justify-between items-center">
        <HStack className="gap-4 items-center">
          <Box className="p-3 rounded-xl bg-phase-interactive/10 border border-phase-interactive/10">
            <Icon as={LucideIcon} size="md" className="text-phase-interactive" />
          </Box>
          <VStack className="gap-0.5">
            <Text className="text-[14px] font-black text-phaseText-primary tracking-tight">
              {label}
            </Text>
            <Text className="text-[10px] font-bold text-phaseText-secondary uppercase tracking-widest opacity-60">
              {description}
            </Text>
          </VStack>
        </HStack>
        <Icon as={ArrowRight} size="xs" className="text-phaseText-muted/20" />
      </HStack>
    </Pressable>
  );

  return (
    <Box className="bg-phase-interactive rounded-[40px] p-2 shadow-xl">
      <Box className="p-6 bg-phase-interactive rounded-[38px] border border-dashed border-white/20">
        <VStack className="gap-6">
          <HStack className="justify-between items-center px-2">
            <Text className="text-[11px] font-black text-white uppercase tracking-[2px]">
              {t('principal.management.station') || 'Management Station'}
            </Text>
            <Box className="w-2 h-2 rounded-full bg-white opacity-40" />
          </HStack>

          <VStack className="gap-3">
            <ActionItem
              icon={LayoutGrid}
              label={t('principal.management.hierarchy') || 'System Hierarchy'}
              description={t('principal.management.hierarchyDesc') || 'Core Structure'}
              target="hierarchy"
            />
            <ActionItem
              icon={UserPlus}
              label={t('principal.management.invites') || 'Governance Invites'}
              description={t('principal.management.invitesDesc') || 'Identity Keys'}
              target="invites"
            />
            <ActionItem
              icon={NotebookPen}
              label={t('principal.management.notes') || 'Institutional Log'}
              description={t('principal.management.notesDesc') || 'Operational View'}
              target="notes"
            />
            <ActionItem
              icon={Milestone}
              label={t('principal.management.cycles') || 'Academic Cycles'}
              description={t('principal.management.cyclesDesc') || 'Governed Terms'}
              target="cycles"
            />
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}
