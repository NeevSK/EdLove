import { Box, Heading, HStack, Icon, Pressable, Text, VStack } from '@repo/ui';
import { CalendarCheck, FileText, NotebookPen, Users } from 'lucide-react-native';
import type React from 'react';
import { useTranslation } from 'react-i18next';
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
      label: t('principal.ia.actions.hierarchy') || t('principal.actions.hierarchy') || 'Structure',
      tokenClass: 'text-phase-interactive',
      bgClass: 'bg-phase-interactive/10',
      featureId: 'hierarchy',
      view: 'hierarchy' as PrincipalWorkspaceView,
    },
    {
      icon: FileText,
      label: t('principal.ia.actions.invites') || t('principal.actions.invites') || 'Invites',
      tokenClass: 'text-phase-success',
      bgClass: 'bg-phase-success/10',
      featureId: 'invites',
      view: 'invites' as PrincipalWorkspaceView,
    },
    {
      icon: CalendarCheck,
      label: t('principal.ia.actions.timetable') || 'Timetable',
      tokenClass: 'text-phase-interactive',
      bgClass: 'bg-phase-interactive/10',
      featureId: 'timetable',
      isAgentic: true,
      view: 'main' as PrincipalWorkspaceView,
    },
    {
      icon: NotebookPen,
      label: t('principal.ia.actions.logbook') || t('principal.actions.notes') || 'Logbook',
      tokenClass: 'text-phase-warning',
      bgClass: 'bg-phase-warning/10',
      featureId: 'log',
      view: 'log' as PrincipalWorkspaceView,
    },
  ];

  return (
    <VStack className="gap-6 p-5">
      <Heading className="text-[12px] font-black uppercase tracking-[0.2em] text-phaseText-muted">
        {t('principal.commandCenter') || 'Command Center'} 🏛️
      </Heading>

      <HStack className="flex-wrap gap-4">
        {actions.map((action, i) => {
          const scopeMeta = getPrincipalFeatureScopeMeta(action.featureId);
          const isDisabled = action.isAgentic;

          return (
            <Pressable
              key={i}
              onPress={() => !isDisabled && onNavigate(action.view)}
              disabled={isDisabled}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              className={`flex-[1_1_45%] min-w-[140px] bg-phase-surface rounded-[32px] border border-phase-border items-center p-6 gap-4 shadow-sm active:scale-95 transition-all ${isDisabled ? 'opacity-50' : 'opacity-100'}`}
            >
              <Box className={`p-4 rounded-2xl ${action.bgClass}`}>
                <Icon as={action.icon} size="md" className={action.tokenClass} />
              </Box>

              <VStack className="items-center gap-1.5">
                <Text className="text-[14px] font-black text-phaseText-primary text-center tracking-tight">
                  {action.label}
                </Text>

                {scopeMeta && (
                  <Box className="bg-phase-canvas px-2.5 py-0.5 rounded-full border border-phase-border">
                    <Text className="text-[9px] font-black uppercase tracking-widest text-phaseText-muted">
                      {t(scopeMeta.scopeBadgeLabelKey)}
                    </Text>
                  </Box>
                )}
              </VStack>

              {isDisabled && (
                <Box className="bg-phase-canvas px-2 py-0.5 rounded-lg border border-phase-border mt-1">
                  <Text className="text-[9px] text-phaseText-muted uppercase font-black tracking-widest">
                    {t('common.comingSoon') || 'Soon'}
                  </Text>
                </Box>
              )}
            </Pressable>
          );
        })}
      </HStack>
    </VStack>
  );
};

export type { CommandCenterProps };
