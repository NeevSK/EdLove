import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Users, FileText, CalendarCheck, NotebookPen } from 'lucide-react-native';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Theme, 
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
            color: Theme.colors.lotusDeepPink || '#9b59b6', 
            featureId: 'hierarchy', 
            view: 'hierarchy' as PrincipalWorkspaceView 
        },
        { 
            icon: FileText, 
            label: t('principal.ia.actions.invites') || t('principal.actions.invites') || 'Role Invites', 
            color: Theme.colors.mossGreen || '#27ae60', 
            featureId: 'invites', 
            view: 'invites' as PrincipalWorkspaceView 
        },
        { 
            icon: CalendarCheck, 
            label: t('principal.ia.actions.timetable') || 'Timetable Planning', 
            color: Theme.colors.skyBlue || '#3498db', 
            featureId: 'timetable', 
            isAgentic: true, 
            view: 'main' as PrincipalWorkspaceView 
        },
        { 
            icon: NotebookPen, 
            label: t('principal.ia.actions.logbook') || t('principal.actions.notes') || 'Leadership Logbook', 
            color: Theme.colors.sanctuarySaffron || '#f1c40f', 
            featureId: 'log', 
            view: 'log' as PrincipalWorkspaceView 
        },
    ];

    return (
        <VStack sx={{ padding: Theme.spacing.md, gap: Theme.spacing.md }}>
            <Heading sx={{ 
                fontSize: 14, 
                fontWeight: '800', 
                textTransform: 'uppercase', 
                color: Theme.colors.willow || '#7f8c8d', 
                letterSpacing: 1 
            }}>
                {t('principal.commandCenter') || 'Command Center'} \uD83C\uDFDB\uFE0F
            </Heading>
            
            <HStack sx={{ flexWrap: 'wrap', gap: Theme.spacing.md }}>
                {actions.map((action, i) => {
                    const scopeMeta = getPrincipalFeatureScopeMeta(action.featureId);
                    
                    return (
                        <TouchableOpacity
                            key={i}
                            activeOpacity={0.7}
                            onPress={() => !action.isAgentic && onNavigate(action.view)}
                            disabled={action.isAgentic}
                            accessibilityRole="button"
                            accessibilityLabel={action.label}
                            accessibilityHint={t('common.accessibility.navigate_to', { label: action.label }) || `Navigate to ${action.label}`}
                            style={{
                                width: '47%', // Approximate for 2 columns
                                marginBottom: Theme.spacing.sm
                            }}
                        >
                            <Box sx={{
                                padding: Theme.spacing.lg,
                                borderRadius: Theme.corners.generous,
                                backgroundColor: Theme.colors.silk || '#f9f9f9',
                                borderWidth: 1,
                                borderColor: Theme.colors.border || '#eeeeee',
                                alignItems: 'center',
                                gap: Theme.spacing.sm,
                                opacity: action.isAgentic ? 0.6 : 1,
                                ...Theme.shadows.sm
                            }}>
                                <Box sx={{ 
                                    backgroundColor: (action.color as string) + '22', 
                                    padding: Theme.spacing.md, 
                                    borderRadius: Theme.corners.comfortable 
                                }}>
                                    <action.icon size={24} color={action.color} />
                                </Box>
                                
                                <Text sx={{ 
                                    fontSize: 13, 
                                    fontWeight: '700', 
                                    color: Theme.colors.ink || '#2c3e50',
                                    textAlign: 'center'
                                }}>
                                    {action.label}
                                </Text>

                                {scopeMeta && (
                                    <Box sx={{
                                        backgroundColor: Theme.colors.background || '#ffffff',
                                        paddingVertical: 2,
                                        paddingHorizontal: 8,
                                        borderRadius: 999,
                                        marginTop: 4
                                    }}>
                                        <Text sx={{
                                            fontSize: 10,
                                            fontWeight: '800', 
                                            textTransform: 'uppercase', 
                                            letterSpacing: 0.4, 
                                            color: Theme.colors.willow || '#7f8c8d', 
                                        }}>
                                            {t(scopeMeta.scopeBadgeLabelKey)}
                                        </Text>
                                    </Box>
                                )}

                                {action.isAgentic && (
                                    <Text sx={{ 
                                        fontSize: 10, 
                                        color: Theme.colors.willow || '#7f8c8d', 
                                        textTransform: 'uppercase',
                                        fontWeight: '600'
                                    }}>
                                        {t('common.comingSoon') || 'Coming Soon'}
                                    </Text>
                                )}
                            </Box>
                        </TouchableOpacity>
                    );
                })}
            </HStack>
        </VStack>
    );
};

export type { CommandCenterProps };
