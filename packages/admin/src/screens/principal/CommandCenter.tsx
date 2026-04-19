import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, FileText, CalendarCheck, NotebookPen } from 'lucide-react-native';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Icon,
    Pressable
} from '@repo/ui';
import type { PrincipalWorkspaceView } from '../../principal/workspace';
import { getPrincipalFeatureScopeMeta } from './PrincipalIAScope';

interface CommandCenterProps {
    onNavigate: (view: PrincipalWorkspaceView) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    const actions = [
        { 
            icon: Users, 
            label: t('principal.ia.actions.hierarchy') || t('principal.actions.hierarchy') || 'School Structure', 
            color: '#9b59b6', 
            featureId: 'hierarchy', 
            view: 'hierarchy' as PrincipalWorkspaceView 
        },
        { 
            icon: FileText, 
            label: t('principal.ia.actions.invites') || t('principal.actions.invites') || 'Role Invites', 
            color: '#27ae60', 
            featureId: 'invites', 
            view: 'invites' as PrincipalWorkspaceView 
        },
        { 
            icon: CalendarCheck, 
            label: t('principal.ia.actions.timetable') || 'Timetable Planning', 
            color: '#3498db', 
            featureId: 'timetable', 
            isAgentic: true, 
            view: 'main' as PrincipalWorkspaceView 
        },
        { 
            icon: NotebookPen, 
            label: t('principal.ia.actions.logbook') || t('principal.actions.notes') || 'Leadership Logbook', 
            color: '#f1c40f', 
            featureId: 'log', 
            view: 'log' as PrincipalWorkspaceView 
        }];

    return (
        <VStack className="gap-4 p-4">
            <Heading className="text-[14px] font-black uppercase tracking-widest text-ink/40">
                {t('principal.commandCenter') || 'Command Center'} 🏛️
            </Heading>
            
            <HStack className="flex-wrap gap-4">
                {actions.map((action, i) => {
                    const scopeMeta = getPrincipalFeatureScopeMeta(action.featureId);
                    
                    return (
                        <Pressable
                            key={i}
                            onPress={() => !action.isAgentic && onNavigate(action.view)}
                            disabled={action.isAgentic}
                            accessibilityRole="button"
                            accessibilityLabel={action.label}
                            className={`bg-silk rounded-3xl border border-border items-center p-6 gap-3 shadow-sm active:scale-95 ${action.isAgentic ? 'opacity-60' : 'opacity-100'}`}
                            style={{
                                width: '47%', // Fixed width for 2 columns layout on mobile
                            }}
                        >
                            <Box 
                                className="p-4 rounded-2xl"
                                style={{ backgroundColor: `${action.color}22` }}
                            >
                                <Icon as={action.icon} size={24} color={action.color} />
                            </Box>
                            
                            <Text className="text-[13px] font-bold text-ink text-center">
                                {action.label}
                            </Text>

                            {scopeMeta && (
                                <Box className="bg-white/50 px-2 py-0.5 rounded-full mt-1 border border-border/50">
                                    <Text className="text-[10px] font-black uppercase tracking-wider text-ink/40">
                                        {t(scopeMeta.scopeBadgeLabelKey)}
                                    </Text>
                                </Box>
                            )}

                            {action.isAgentic && (
                                <Text className="text-[10px] text-ink/40 uppercase font-black tracking-widest">
                                    {t('common.comingSoon') || 'Coming Soon'}
                                </Text>
                            )}
                        </Pressable>
                    );
                })}
            </HStack>
        </VStack>
    );
};

export type { CommandCenterProps };

