import React from 'react';
import {
    Icon,
    VStack,
    HStack,
    Box,
    Text,
    Pressable,
    useTheme,
    hapticLight,
    Theme
} from '@repo/ui';
import {
    LayoutGrid,
    UserPlus,
    NotebookPen,
    ArrowRight,
    Milestone
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface ManagementStationProps {
    onAction: (action: 'hierarchy' | 'invites' | 'notes' | 'cycles') => void;
}

export default function ManagementStation({ onAction }: ManagementStationProps) {
    const { t } = useTranslation();
    const theme = useTheme();

    const ActionItem = ({ icon: LucideIcon, label, description, target }: any) => (
        <Pressable
            onPress={() => {
                hapticLight();
                onAction(target);
            }}
            className="flex-1 bg-phase-surface p-md rounded-2xl border border-phase-border"
        >
            <HStack className="justify-between items-center">
                <HStack className="gap-3 items-center">
                    <Box
                        className="p-2 rounded-xl"
                        style={{ backgroundColor: `${theme.accent.action}11` }}
                    >
                        <LucideIcon size={20} color={theme.accent.action} />
                    </Box>
                    <VStack className="gap-0.5">
                        <Text className="text-[13px] font-bold text-phaseText-primary">
                            {label}
                        </Text>
                        <Text className="text-[10px] text-phaseText-secondary">
                            {description}
                        </Text>
                    </VStack>
                </HStack>
                <Icon as={ArrowRight} size="xs" className="text-phaseText-muted" />
            </HStack>
        </Pressable>
    );

    return (
        <Box className="p-lg bg-phase-interactive rounded-3xl border border-phase-border border-dashed">
            <VStack className="gap-4">
                <HStack className="justify-between items-center">
                    <Text className="text-[11px] font-extrabold text-phase-accent uppercase tracking-[1.5px]">
                        {t('principal.management.station') || "Principal's Management Station"} 👔
                    </Text>
                </HStack>

                <VStack className="gap-2.5">
                    <ActionItem
                        icon={LayoutGrid}
                        label={t('principal.management.hierarchy') || 'System Hierarchy'}
                        description={t('principal.management.hierarchyDesc') || 'Grades, Sections & Structure'}
                        target="hierarchy"
                    />
                    <ActionItem
                        icon={UserPlus}
                        label={t('principal.management.invites') || 'Governance Invites'}
                        description={t('principal.management.invitesDesc') || 'Invite Principals & Teachers'}
                        target="invites"
                    />
                    <ActionItem
                        icon={NotebookPen}
                        label={t('principal.management.notes') || 'Institutional Log'}
                        description={t('principal.management.notesDesc') || 'Daily operational observations'}
                        target="notes"
                    />
                    <ActionItem
                        icon={Milestone}
                        label={t('principal.management.cycles') || 'Academic Cycles'}
                        description={t('principal.management.cyclesDesc') || 'Define terms & semesters'}
                        target="cycles"
                    />
                </VStack>
            </VStack>
        </Box>
    );
}
