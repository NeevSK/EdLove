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
            className="w-full h-auto flex-row items-start justify-start rounded-[32px] border border-sanctuary-border bg-sanctuary-surface-secondary/20 p-6 active:opacity-80"
        >
            <VStack className="items-start gap-4">
                <HStack className="items-center gap-2.5">
                    <Box className="w-8 h-8 bg-sanctuarySaffron/10 rounded-xl items-center justify-center border border-sanctuarySaffron/20">
                        <Icon as={IconComponent} size="xs" className="text-sanctuarySaffron" />
                    </Box>
                    <Text className="text-[10px] font-black uppercase tracking-[0.25em] text-sanctuary-text-tertiary">
                        Admin Signal
                    </Text>
                </HStack>
                <Heading className="text-sm text-sanctuary-text font-black tracking-tight uppercase leading-tight">
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

