import React from 'react';
import {
    Icon,
    VStack,
    HStack,
    Box,
    Text,
    Pressable,
    useTheme,
    hapticLight
} from '@repo/ui';
import { Banknote, CalendarDays, UserCheck, TrendingUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface PrincipalActionsProps {
    onAction?: (action: string) => void;
}

export default function PrincipalActions({ onAction }: PrincipalActionsProps) {
    const { t } = useTranslation();
    const theme = useTheme();

    interface ActionCardProps {
        icon: React.ElementType;
        label: string;
        description: string;
        color?: string;
        onPress?: () => void;
    }

    const ActionCard = ({ icon: LucideIcon, label, description, color, onPress }: ActionCardProps) => (
        <Pressable
            onPress={() => {
                hapticLight();
                if (onPress) onPress();
                if (onAction) onAction(label);
            }}
            accessibilityRole="button"
            className="flex-1 bg-phase-surface p-md rounded-3xl border border-phase-border"
        >
            <VStack className="gap-2">
                <HStack className="justify-between items-center">
                    <Box
                        className="p-sm rounded-xl"
                        style={{ backgroundColor: (color || theme.accent.action) + '22' }}
                    >
                        <LucideIcon size={24} color={color || theme.accent.action} />
                    </Box>
                    <Icon as={TrendingUp} size="xs" className="text-phaseText-muted opacity-30" />
                </HStack>
                <VStack>
                    <Text className="text-sm font-bold text-phaseText-primary">
                        {label}
                    </Text>
                    <Text className="text-[11px] text-phaseText-secondary">
                        {description}
                    </Text>
                </VStack>
            </VStack>
        </Pressable>
    );

    return (
        <VStack className="gap-4">
            <Text className="text-[13px] font-bold text-phaseText-secondary uppercase tracking-wider">
                {t('principal.admin.title') || 'Governance Dashboard'}
            </Text>

            <VStack className="gap-4">
                <HStack className="gap-4">
                    <ActionCard
                        icon={Banknote}
                        label={t('principal.admin.finance') || 'Financials'}
                        description={t('principal.admin.financeDesc') || 'Fees & Dues Summary'}
                        color={theme.accent.sageGreen}
                    />
                    <ActionCard
                        icon={CalendarDays}
                        label={t('principal.admin.events') || 'Event Approvals'}
                        description={t('principal.admin.eventsDesc') || 'Approve school events'}
                        color={theme.accent.action}
                    />
                </HStack>

                {/* Staff Leave Requests Wide Card */}
                <Box className="bg-phase-surface p-md rounded-3xl border border-phase-border">
                    <HStack className="justify-between items-center">
                        <HStack className="gap-4 items-center flex-1">
                            <Box className="p-sm rounded-xl bg-phase-accent/10">
                                <Icon as={UserCheck} size="md" className="text-phase-accent" />
                            </Box>
                            <VStack className="flex-1">
                                <Text className="text-sm font-bold text-phaseText-primary">
                                    {t('principal.admin.leaves') || 'Staff Leave Requests'}
                                </Text>
                                <Text className="text-[11px] text-phaseText-secondary">
                                    {t('principal.admin.leavesDesc') || 'Review and approve staff absences'}
                                </Text>
                            </VStack>
                        </HStack>

                        <Pressable
                            onPress={() => {
                                hapticLight();
                                if (onAction) onAction('Leaves');
                            }}
                            className="bg-phase-interactive px-4 py-1.5 rounded-full border border-phase-border"
                        >
                            <Text className="text-xs font-bold text-phase-accent">
                                View All
                            </Text>
                        </Pressable>
                    </HStack>
                </Box>
            </VStack>
        </VStack>
    );
}
