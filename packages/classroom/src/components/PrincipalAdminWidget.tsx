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
    Banknote,
    CalendarDays,
    UserCheck,
    FileCheck,
    TrendingUp
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface PrincipalAdminWidgetProps {
    onAction?: (action: string) => void;
}

export default function PrincipalAdminWidget({ onAction }: PrincipalAdminWidgetProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();

    const ActionCard = ({ icon: LucideIcon, label, description, color, onPress }: any) => (
        <Pressable
            onPress={() => {
                hapticLight();
                if (onPress) onPress();
                if (onAction) onAction(label);
            }}
            sx={{
                flex: 1,
                backgroundColor: colors.secondary,
                padding: Theme.spacing.lg,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
                gap: Theme.spacing.sm
            }}
        >
            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{
                    padding: Theme.spacing.sm,
                    borderRadius: Theme.corners.medium,
                    backgroundColor: (color || Theme.colors.sanctuarySaffron) + '22'
                }}>
                    <LucideIcon size={24} color={color || Theme.colors.sanctuarySaffron} />
                </Box>
                <TrendingUp size={16} color={colors.textTertiary} opacity={0.3} />
            </HStack>

            <VStack>
                <Text color={colors.text} sx={{ fontSize: 14, fontWeight: '700' }}>
                    {label}
                </Text>
                <Text color={colors.textSecondary} sx={{ fontSize: 11 }}>
                    {description}
                </Text>
            </VStack>
        </Pressable>
    );

    return (
        <VStack sx={{ gap: Theme.spacing.md }}>
            <Text color={colors.textSecondary} sx={{ fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                {t('principal.admin.title') || 'Governance Dashboard'} 🏛️
            </Text>

            <VStack sx={{ gap: Theme.spacing.md }}>
                <HStack sx={{ gap: Theme.spacing.md }}>
                    <ActionCard
                        icon={Banknote}
                        label={t('principal.admin.finance') || 'Financials'}
                        description={t('principal.admin.financeDesc') || 'Fees & Dues Summary'}
                        color={Theme.colors.sageGreen}
                    />
                    <ActionCard
                        icon={CalendarDays}
                        label={t('principal.admin.events') || 'Event Approvals'}
                        description={t('principal.admin.eventsDesc') || 'Approve school events'}
                        color={Theme.colors.amberGlow}
                    />
                </HStack>

                <Box
                    sx={{
                        backgroundColor: colors.secondary,
                        padding: Theme.spacing.lg,
                        borderRadius: Theme.corners.generous,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center' }}>
                            <Box sx={{
                                padding: Theme.spacing.sm,
                                borderRadius: Theme.corners.medium,
                                backgroundColor: colors.action + '22'
                            }}>
                                <UserCheck size={24} color={colors.action} />
                            </Box>
                            <VStack>
                                <Text color={colors.text} sx={{ fontSize: 14, fontWeight: '700' }}>
                                    {t('principal.admin.leaves') || 'Staff Leave Requests'}
                                </Text>
                                <Text color={colors.textSecondary} sx={{ fontSize: 11 }}>
                                    {t('principal.admin.leavesDesc') || 'Review and approve staff absences'}
                                </Text>
                            </VStack>
                        </HStack>
                        <Pressable
                            onPress={() => onAction && onAction('Leaves')}
                            sx={{
                                backgroundColor: colors.tertiary,
                                paddingHorizontal: Theme.spacing.md,
                                paddingVertical: Theme.spacing.xs,
                                borderRadius: Theme.corners.full
                            }}
                        >
                            <Text color={colors.action} sx={{ fontSize: 12, fontWeight: '700' }}>View All</Text>
                        </Pressable>
                    </HStack>
                </Box>
            </VStack>
        </VStack>
    );
}
