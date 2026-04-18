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

interface TeacherAdminWidgetProps {
  onAction?: (action: string) => void;
}

export default function TeacherAdminWidget({ onAction }: TeacherAdminWidgetProps) {
  const { t } = useTranslation();

  const AdminAction = ({ icon: LucideIcon, label, variant = 'primary', onPress }: any) => {
    // Map variant to Tailwind classes
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

  return (
    <VStack className="gap-4 mt-2">
      <HStack className="justify-between items-center">
        <Text className="text-[13px] font-bold uppercase tracking-widest text-bark">
          {t('teacher.admin.title') || 'Administrative Portal'}
        </Text>
      </HStack>
      <VStack className="gap-2">
        <HStack className="gap-2">
          <AdminAction
            icon={Calendar}
            label={t('teacher.admin.myLeaves') || 'My Leaves'}
            variant="warning"
          />
          <AdminAction
            icon={ArrowRightLeft}
            label={t('teacher.admin.substitutions') || 'Substitutions'}
            variant="primary"
          />
        </HStack>
        <HStack className="gap-2">
          <AdminAction
            icon={FileText}
            label={t('teacher.admin.reportGen') || 'Student Reports'}
            variant="success"
          />
          <AdminAction
            icon={ClipboardList}
            label={t('teacher.admin.templates') || 'Letter Templates'}
            variant="error"
          />
        </HStack>
        <HStack className="gap-2">
          <AdminAction
            icon={DollarSign}
            label={t('teacher.admin.financials') || 'Financials'}
            variant="success"
          />
          <AdminAction
            icon={CheckSquare}
            label={t('teacher.admin.approvals') || 'Approvals'}
            variant="error"
          />
        </HStack>
      </VStack>
    </VStack>
  );
}
