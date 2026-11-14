import { View, Text, Pressable } from 'react-native';
import { ArrowRight, LayoutGrid, Milestone, NotebookPen, UserPlus } from '@repo/ui/icons';
import { hapticLight } from '@repo/ui/utils/haptics';

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
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={`Opens ${description}`}
      className="flex-1 bg-phase-surface p-5 rounded-[24px] border border-phase-border active:scale-[0.98] transition-all shadow-sm"
    >
      <View className="flex-row items-center justify-between items-center">
        <View className="flex-row items-center gap-4 items-center">
          <View className="p-3 rounded-xl bg-phase-interactive/10 border border-phase-interactive/10">
            <LucideIcon size={20} className="text-phase-interactive" />
          </View>
          <View className="gap-0.5">
            <Text className="text-[14px] font-black text-phaseText-primary tracking-tight">
              {label}
            </Text>
            <Text className="text-[10px] font-bold text-phaseText-secondary uppercase tracking-widest opacity-60">
              {description}
            </Text>
          </View>
        </View>
        <ArrowRight size={12} className="text-phaseText-muted/20" />
      </View>
    </Pressable>
  );

  return (
    <View className="bg-phase-interactive rounded-[40px] p-2 shadow-xl">
      <View className="p-6 bg-phase-interactive rounded-[38px] border border-dashed border-white/20">
        <View className="gap-6">
          <View className="flex-row items-center justify-between items-center px-2">
            <Text className="text-[11px] font-black text-white uppercase tracking-[2px]">
              {t('principal.management.station') || 'Management Station'}
            </Text>
            <View className="w-2 h-2 rounded-full bg-white opacity-40" />
          </View>

          <View className="gap-3">
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
          </View>
        </View>
      </View>
    </View>
  );
}
