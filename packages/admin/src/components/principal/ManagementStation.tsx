import React from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Pressable,
  Theme,
  useThemedColors,
  hapticLight,
  Heading
} from '@repo/ui';
import {
  ArrowRight,
  LayoutGrid,
  Milestone,
  NotebookPen,
  UserPlus,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface ManagementStationProps {
  onAction: (action: 'hierarchy' | 'invites' | 'notes' | 'cycles') => void;
}

function StationAction({
  icon: LucideIcon,
  label,
  description,
  target,
  onAction,
}: {
  icon: any;
  label: string;
  description: string;
  target: 'hierarchy' | 'invites' | 'notes' | 'cycles';
  onAction: ManagementStationProps['onAction'];
}) {
  const colors = useThemedColors();

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onAction(target);
      }}
      sx={{
        backgroundColor: colors.primary,
        padding: Theme.spacing.md,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', gap: Theme.spacing.md }}>
        <HStack space="md" sx={{ flex: 1, alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: Theme.corners.medium,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${colors.action}14`,
            }}
          >
            <LucideIcon size={20} color={colors.action} />
          </Box>
          <VStack sx={{ flex: 1 }}>
            <Text sx={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
              {label}
            </Text>
            <Text sx={{ color: colors.textSecondary, fontSize: 11, lineHeight: 16 }}>
              {description}
            </Text>
          </VStack>
        </HStack>
        <ArrowRight size={14} color={colors.textTertiary} />
      </HStack>
    </Pressable>
  );
}

export default function ManagementStation({ onAction }: ManagementStationProps) {
  const { t } = useTranslation();
  const colors = useThemedColors();

  return (
    <Box
      sx={{
        padding: Theme.spacing.lg,
        backgroundColor: colors.secondary,
        borderRadius: Theme.corners.generous,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <VStack space="md">
        <VStack sx={{ gap: Theme.spacing.xs }}>
          <Text
            sx={{ color: Theme.colors.gurudeviViolet, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 }}
          >
            {t('principal.management.station') || 'Institution Workspace'}
          </Text>
          <Heading sx={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
            Governance and structure
          </Heading>
          <Text sx={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
            Move from the live school day into the official work of shaping the institution.
          </Text>
        </VStack>
        
        <VStack space="sm">
          <StationAction
            icon={LayoutGrid}
            label={t('principal.management.hierarchy') || 'System Hierarchy'}
            description={t('principal.management.hierarchyDesc') || 'Grades, sections, and institutional structure'}
            target="hierarchy"
            onAction={onAction}
          />
          <StationAction
            icon={UserPlus}
            label={t('principal.management.invites') || 'Governance Invites'}
            description={t('principal.management.invitesDesc') || 'Invite principals, teachers, and school roles'}
            target="invites"
            onAction={onAction}
          />
          <StationAction
            icon={NotebookPen}
            label={t('principal.management.notes') || 'Institutional Log'}
            description={t('principal.management.notesDesc') || 'Leadership notes, decisions, and official memory'}
            target="notes"
            onAction={onAction}
          />
          <StationAction
            icon={Milestone}
            label={t('principal.management.cycles') || 'Academic Cycles'}
            description={t('principal.management.cyclesDesc') || 'Terms, semesters, and year structure'}
            target="cycles"
            onAction={onAction}
          />
        </VStack>
      </VStack>
    </Box>
  );
}
