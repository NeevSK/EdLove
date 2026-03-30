import React from 'react';
import { Box, HStack, Text, VStack, Theme, useThemedColors } from '@repo/ui';
import {
  BookCopy,
  BriefcaseBusiness,
  ClipboardCheck,
  FileSpreadsheet,
  Files,
  Landmark,
  Package,
} from 'lucide-react-native';
import {
  PRINCIPAL_CAPABILITY_REGISTRY,
  type PrincipalCapabilityId,
  type PrincipalCapabilityMeta,
} from '../../principal/workspace';

interface PrincipalModuleAtlasProps {
  capabilityIds?: PrincipalCapabilityId[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_ATLAS_CAPABILITIES: PrincipalCapabilityId[] = [
  'inventory',
  'finance',
  'accounting',
  'reporting',
  'circulars',
  'documents',
  'compliance',
];

const CAPABILITY_ICONS: Record<PrincipalCapabilityId, any> = {
  morning_brief: Landmark,
  faculty_overview: BriefcaseBusiness,
  student_pulse: Landmark,
  pending_approvals: ClipboardCheck,
  institutional_calendar: ClipboardCheck,
  observations: ClipboardCheck,
  relief: ClipboardCheck,
  hierarchy: Landmark,
  invites: BriefcaseBusiness,
  log: Files,
  notes: Files,
  cycles: ClipboardCheck,
  school_profile: Landmark,
  resource_needs: Package,
  ecosystem_resonance: Landmark,
  open_commons: BriefcaseBusiness,
  inventory: Package,
  finance: Landmark,
  accounting: FileSpreadsheet,
  reporting: ClipboardCheck,
  circulars: BookCopy,
  documents: Files,
  compliance: ClipboardCheck,
  curriculum_pulse: BriefcaseBusiness,
  timetable: ClipboardCheck,
};

function CapabilityCard({
  capability,
}: {
  capability: PrincipalCapabilityMeta;
}) {
  const colors = useThemedColors();
  const Icon = CAPABILITY_ICONS[capability.id] ?? Files;

  return (
    <Box>
      sx={{
        width: '100%',
        backgroundColor: colors.secondary,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        borderColor: colors.border,
        padding: Theme.spacing.md,
        gap: Theme.spacing.sm,
      }}
          <HStack sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: Theme.spacing.sm }}        <HStack sx={{ alignItems: 'center', gap: Theme.spacing.sm, flex: 1 }}          <Box>
            sx={{
              width: 36,
              height: 36,
              borderRadius: Theme.corners.medium,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                capability.zone === 'today'
                  ? `${Theme.colors.sanctuarySaffron}22`
                  : capability.zone === 'institution'
                    ? `${Theme.colors.gurudeviBlue}22`
                    : `${Theme.colors.gurudeviViolet}22`,
            }}
                      <Icon>
              size={18}
              color={
                capability.zone === 'today'
                  ? Theme.colors.sanctuarySaffron
                  : capability.zone === 'institution'
                    ? Theme.colors.gurudeviBlue
                    : Theme.colors.gurudeviViolet
              }
            /          </Box          <VStack sx={{ gap: 2, flex: 1 }}            <Text sx={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{capability.title}</Text            ><Text sx={{ fontSize: 11, color: colors.textSecondary }}              {capability.atlasFamily ?? 'Principal ERP'}
            </Text          </VStack        </HStack
        <Box>
          sx={{
            paddingHorizontal: Theme.spacing.sm,
            paddingVertical: 4,
            borderRadius: Theme.corners.full,
            backgroundColor: `${Theme.colors.gurudeviViolet}20`,
          }}
                  <Text sx={{ fontSize: 10, fontWeight: '800', color: Theme.colors.gurudeviViolet, textTransform: 'uppercase' }}            {capability.status}>
          </Text        </Box      </HStack
      <Text sx={{ fontSize: 12, lineHeight: 18, color: colors.textSecondary }}        {capability.description}>
      </Text    </Box  );
}

export default function PrincipalModuleAtlas({
  capabilityIds = DEFAULT_ATLAS_CAPABILITIES,
  title = 'Module Atlas',
  subtitle = 'Planned ERP families that will slot into this principal workspace without reshaping the home cockpit.',
}: PrincipalModuleAtlasProps) {
  const colors = useThemedColors();
  const capabilities = capabilityIds
    .map((capabilityId) => PRINCIPAL_CAPABILITY_REGISTRY[capabilityId])
    .filter(Boolean);

  return (
    <VStack sx={{ gap: Theme.spacing.md }}      <VStack sx={{ gap: Theme.spacing.xs }}        <Text sx={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{title}</Text        ><Text sx={{ fontSize: 13, lineHeight: 20, color: colors.textSecondary }}>{subtitle}</Text      ></VStack
      <VStack sx={{ gap: Theme.spacing.sm }}        {capabilities.map((capability) => (
          <CapabilityCard key={capability.id} capability={capability} /        >))}>
      </VStack    </VStack  );
}
