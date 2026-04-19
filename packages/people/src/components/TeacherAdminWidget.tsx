import React from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Pressable,
  hapticLight,
  Icon,
} from '@repo/ui';
import {
  FileText,
  Calendar,
  ClipboardList,
  ArrowRightLeft,
  DollarSign,
  CheckSquare,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@repo/core';

interface TeacherAdminWidgetProps {
  onAction?: (action: string) => void;
}

export default function TeacherAdminWidget({ onAction }: TeacherAdminWidgetProps) {
  const { t } = useTranslation();
  const { flags } = usePermissions();

  const AdminAction = ({ icon: LucideIcon, label, variant = 'primary', onPress }: any) => {
    const colorClasses = {
      primary: 'text-primary bg-primary/10',
      warning: 'text-warning bg-warning/10',
      success: 'text-success bg-success/10',
      error: 'text-error bg-error/10',
    };
    
    const activeColor = colorClasses[variant as keyof typeof colorClasses] || colorClasses.primary;
    const [textColor, bgColor] = activeColor.split(' ');

    return (
      <Pressable
        onPress={() => {
          hapticLight();
          if (onPress) onPress();
          if (onAction) onAction(label);
        }}
        className="flex-1 bg-silk p-4 rounded-2xl border border-border items-center justify-center gap-2 min-h-[100px]"
      >
        <Box className={`p-2 rounded-xl ${bgColor}`}>
          <Icon as={LucideIcon} size="md" className={textColor} />
        </Box>
        <Text className="text-[11px] font-bold text-center text-textPrimary">
          {label}
        </Text>
      </Pressable>
    );
  };

  // Define actions with their visibility conditions
  const actions = [
    {
      icon: Calendar,
      label: t('teacher.admin.myLeaves') || 'My Leaves',
      variant: 'warning',
      visible: flags.isStaffManagementEnabled,
    },
    {
      icon: ArrowRightLeft,
      label: t('teacher.admin.substitutions') || 'Substitutions',
      variant: 'primary',
      visible: flags.isStaffManagementEnabled,
    },
    {
      icon: FileText,
      label: t('teacher.admin.reportGen') || 'Student Reports',
      variant: 'success',
      visible: flags.isStudentReportingEnabled,
    },
    {
      icon: ClipboardList,
      label: t('teacher.admin.templates') || 'Letter Templates',
      variant: 'error',
      visible: flags.isTemplateManagementEnabled,
    },
    {
      icon: DollarSign,
      label: t('teacher.admin.financials') || 'Financials',
      variant: 'success',
      visible: flags.isAccountingEnabled,
    },
    {
      icon: CheckSquare,
      label: t('teacher.admin.approvals') || 'Approvals',
      variant: 'error',
      visible: flags.isStaffManagementEnabled,
    },
  ].filter(action => action.visible);

  // Group actions into rows of 2
  const rows = [];
  for (let i = 0; i < actions.length; i += 2) {
    rows.push(actions.slice(i, i + 2));
  }

  if (actions.length === 0) return null;

  return (
    <VStack className="gap-4 mt-2">
      <HStack className="justify-between items-center">
        <Text className="text-[13px] font-bold uppercase tracking-widest text-bark">
          {t('teacher.admin.title') || 'Administrative Portal'}
        </Text>
      </HStack>
      <VStack className="gap-2">
        {rows.map((row, rowIndex) => (
          <HStack key={rowIndex} className="gap-2">
            {row.map((action, actionIndex) => (
              <AdminAction
                key={actionIndex}
                icon={action.icon}
                label={action.label}
                variant={action.variant}
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
