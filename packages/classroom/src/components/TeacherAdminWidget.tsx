import React from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Pressable,
    Theme,
    useThemedColors,
    hapticLight
} from '@repo/ui';
import {
    FileText,
    Calendar,
    ClipboardList,
    UserCheck,
    ArrowRightLeft,
    DollarSign,
    CheckSquare
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface TeacherAdminWidgetProps {
    onAction?: (action: string) => void;
}

export default function TeacherAdminWidget({ onAction }: TeacherAdminWidgetProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();

    const AdminAction = ({ icon: LucideIcon, label, color, onPress }: any) => (
        <Pressable
            onPress={() => {
                hapticLight();
                if (onPress) onPress();
                if (onAction) onAction(label);
            }}
            sx={{
                flex: 1,
                backgroundColor: colors.secondary,
                padding: Theme.spacing.md,
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                gap: Theme.spacing.xs,
                minHeight: 100
            }}
        >
            <Box sx={{
                padding: Theme.spacing.sm,
                borderRadius: Theme.corners.medium,
                backgroundColor: (color || Theme.colors.sanctuarySaffron) + '22'
            }}>
                <LucideIcon size={20} color={color || Theme.colors.sanctuarySaffron} />
            </Box>
            <Text
                color={colors.text}
                sx={{
                    fontSize: 11,
                    fontWeight: '700',
                    textAlign: 'center'
                }}
            >
                {label}
            </Text>
        </Pressable>
    );

    return (
        <VStack sx={{ gap: Theme.spacing.md, marginTop: Theme.spacing.sm }}>
            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text color={colors.textSecondary} sx={{ fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t('teacher.admin.title') || 'Administrative Portal'} 🏛️
                </Text>
            </HStack>

            <VStack sx={{ gap: Theme.spacing.sm }}>
                <HStack sx={{ gap: Theme.spacing.sm }}>
                    <AdminAction
                        icon={Calendar}
                        label={t('teacher.admin.myLeaves') || 'My Leaves'}
                        color={Theme.colors.amberGlow}
                    />
                    <AdminAction
                        icon={ArrowRightLeft}
                        label={t('teacher.admin.substitutions') || 'Substitutions'}
                        color={colors.action}
                    />
                </HStack>
                <HStack sx={{ gap: Theme.spacing.sm }}>
                    <AdminAction
                        icon={FileText}
                        label={t('teacher.admin.reportGen') || 'Student Reports'}
                        color={Theme.colors.sageGreen}
                    />
                    <AdminAction
                        icon={ClipboardList}
                        label={t('teacher.admin.templates') || 'Letter Templates'}
                        color={Theme.colors.emberRed}
                    />
                </HStack>
                <HStack sx={{ gap: Theme.spacing.sm }}>
                    <AdminAction
                        icon={DollarSign}
                        label={t('teacher.admin.financials') || 'Financials'}
                        color={Theme.colors.sageGreen}
                    />
                    <AdminAction
                        icon={CheckSquare}
                        label={t('teacher.admin.approvals') || 'Approvals'}
                        color={Theme.colors.emberRed}
                    />
                </HStack>
            </VStack>
        </VStack>
    );
}
