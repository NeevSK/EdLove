import React from 'react';
import { Box, Button, Text, VStack, HStack, Heading, Icon } from '@repo/ui';
import { LucideIcon, Settings, Users, BookOpen, Shield, ClipboardList, Database } from 'lucide-react-native';

const ICON_MAP: Record<string, LucideIcon> = {
    'Settings': Settings,
    'Users': Users,
    'BookOpen': BookOpen,
    'Shield': Shield,
    'ClipboardList': ClipboardList,
    'Database': Database,
};

interface TeacherAdminButtonProps {
    label: string;
    icon: string;
    onClick: () => void;
}

export const TeacherAdminButton: React.FC<TeacherAdminButtonProps> = ({ label, onClick, icon }) => {
    const IconComponent = ICON_MAP[icon] || Settings;

    return (
        <Button
            variant="outline"
            action="secondary"
            onPress={onClick}
            className="w-full flex-row items-start justify-start rounded-[32px] border border-sanctuary-border/10 bg-sanctuary-surface-secondary/80 p-6 shadow-sm active:opacity-70 h-auto"
        >
            <VStack className="items-start gap-2.5">
                <HStack className="items-center gap-2">
                    <Icon as={IconComponent} size="xs" className="text-sanctuarySaffron" />
                    <Text className="text-[10px] font-bold uppercase tracking-[0.25em] text-sanctuary-text-muted/60">
                        Admin Signal
                    </Text>
                </HStack>
                <Heading size="xs" className="text-sanctuary-text font-bold tracking-tight">
                    {label}
                </Heading>
            </VStack>
        </Button>
    );
};

interface TeacherAdminActionsProps {
    actions: Array<{
        id: string;
        label: string;
        icon: string;
        onClick: () => void;
    }>;
}

export const TeacherAdminActions: React.FC<TeacherAdminActionsProps> = ({ actions }) => {
    return (
        <HStack className="flex-wrap gap-4">
            {actions.map((action) => (
                <Box key={action.id} className="min-w-[170px] flex-1">
                    <TeacherAdminButton {...action} />
                </Box>
            ))}
        </HStack>
    );
};

