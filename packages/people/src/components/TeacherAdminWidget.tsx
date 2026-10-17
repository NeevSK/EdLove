import { useDomainRollout } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import {
  ArrowRightLeft,
  Calendar,
  ClipboardList,
  DollarSign,
  FileText,
  type LucideIcon,
  Send,
  SquareCheckBig,
} from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useTranslation } from 'react-i18next';

interface TeacherAdminWidgetProps {
  onAction?: (action: string) => void;
}

type ActionVariant = 'primary' | 'warning' | 'success' | 'error';

interface AdminActionProps {
  icon: LucideIcon;
  label: string;
  /** Stable id passed to onAction (labels are translated). Falls back to label. */
  actionId?: string;
  variant?: ActionVariant;
  onPress?: () => void;
  onAction?: (action: string) => void;
}

interface AdminActionDef {
  icon: LucideIcon;
  label: string;
  actionId?: string;
  variant: ActionVariant;
  visible: boolean;
}

const ACTION_VARIANT_CLASSES: Record<ActionVariant, string> = {
  primary: 'text-phase-interactive bg-phase-interactive/5 border-phase-interactive/20',
  warning: 'text-phase-warning bg-phase-warning/5 border-phase-warning/20',
  success: 'text-phase-success bg-phase-success/5 border-phase-success/20',
  error: 'text-phase-error bg-phase-error/5 border-phase-error/20',
};

function AdminAction({
  icon: LucideIcon,
  label,
  actionId,
  variant = 'primary',
  onPress,
  onAction,
}: AdminActionProps) {
  const [textColor, bgColor, borderColor] = ACTION_VARIANT_CLASSES[variant].split(' ');

  return (
    <Pressable
      onPress={() => {
        void hapticLight();
        if (onPress) onPress();
        if (onAction) onAction(actionId ?? label);
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-1 bg-phase-canvas p-4 rounded-3xl border ${borderColor} items-center justify-center gap-3 min-h-[110px] shadow-sm`}
    >
      <Box className={`p-3 rounded-2xl ${bgColor}`}>
        <Icon as={LucideIcon} size="md" className={textColor} />
      </Box>
      <Text className="text-[12px] font-bold text-center text-phase-text-primary uppercase tracking-tight">
        {label}
      </Text>
    </Pressable>
  );
}

export default function TeacherAdminWidget({ onAction }: TeacherAdminWidgetProps) {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const isStaffManagementEnabled = useDomainRollout('staff-management');
  const isAccountingEnabled = useDomainRollout('accounting');

  // Define actions with their visibility conditions
  const allActions: AdminActionDef[] = [
    {
      icon: Send,
      label: t('planBridge.title', 'Plan & notices'),
      actionId: 'plan-and-notices',
      variant: 'primary',
      visible: can('create', 'Announcement'),
    },
    {
      icon: Calendar,
      label: t('teacher.admin.myLeaves') || 'My Leaves',
      variant: 'warning',
      visible: isStaffManagementEnabled,
    },
    {
      icon: ArrowRightLeft,
      label: t('teacher.admin.substitutions') || 'Substitutions',
      variant: 'primary',
      visible: isStaffManagementEnabled,
    },
    {
      icon: FileText,
      label: t('teacher.admin.reportGen') || 'Student Reports',
      variant: 'success',
      visible: can('read', 'Report'),
    },
    {
      icon: ClipboardList,
      label: t('teacher.admin.templates') || 'Letter Templates',
      variant: 'error',
      visible: can('read', 'ClassroomResource'),
    },
    {
      icon: DollarSign,
      label: t('teacher.admin.financials') || 'Financials',
      variant: 'success',
      visible: isAccountingEnabled,
    },
    {
      icon: SquareCheckBig,
      label: t('teacher.admin.approvals') || 'Approvals',
      variant: 'error',
      visible: isStaffManagementEnabled,
    },
  ];
  const actions = allActions.filter((action) => action.visible);

  // Group actions into rows of 2
  const rows = [];
  for (let i = 0; i < actions.length; i += 2) {
    rows.push(actions.slice(i, i + 2));
  }

  if (actions.length === 0) return null;

  return (
    <VStack className="gap-6 mt-4 px-1">
      <HStack className="justify-between items-center">
        <Text className="text-[11px] font-black uppercase tracking-[2px] text-phase-text-tertiary">
          {t('teacher.admin.title') || 'Administrative Portal'}
        </Text>
      </HStack>
      <VStack className="gap-2">
        {rows.map((row) => (
          <HStack key={row.map((action) => action.label).join('|')} className="gap-2">
            {row.map((action) => (
              <AdminAction
                key={action.label}
                icon={action.icon}
                label={action.label}
                {...(action.actionId ? { actionId: action.actionId } : {})}
                variant={action.variant}
                {...(onAction ? { onAction } : {})}
              />
            ))}
            {/* Fill space if only one item in row */}
            {row.length === 1 && <Box className="flex-1" />}
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}
