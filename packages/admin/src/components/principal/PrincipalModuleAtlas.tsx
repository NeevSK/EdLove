import { ArrowRight, BookCopy, BriefcaseBusiness, ClipboardCheck, FileSpreadsheet, Files, Landmark, Package } from '@repo/ui/icons';
import { Box } from '@repo/ui/primitives';
import { HStack, Heading, Icon, Text, VStack } from '@repo/ui/primitives';

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

const CAPABILITY_ICONS: Record<string, any> = {
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

function CapabilityCard({ capability }: { capability: PrincipalCapabilityMeta }) {
  const LucideIcon = CAPABILITY_ICONS[capability.id] ?? Files;

  const getZoneStyles = (zone: string) => {
    switch (zone) {
      case 'today':
        return {
          bg: 'bg-phase-interactive/10',
          text: 'text-phase-interactive',
          border: 'border-phase-interactive/20',
        };
      case 'institution':
        return {
          bg: 'bg-phase-success/10',
          text: 'text-phase-success',
          border: 'border-phase-success/20',
        };
      default:
        return {
          bg: 'bg-phase-canvas',
          text: 'text-phaseText-muted',
          border: 'border-phase-border',
        };
    }
  };

  const styles = getZoneStyles(capability.zone || '');

  return (
    <Box className="w-full bg-phase-surface rounded-[32px] border border-phase-border p-6 shadow-sm">
      <VStack className="gap-5">
        <HStack className="justify-between items-start">
          <HStack className="items-center gap-4 flex-1">
            <Box
              className={`w-14 h-14 rounded-[20px] items-center justify-center ${styles.bg} border ${styles.border}`}
            >
              <Icon as={LucideIcon} size={24} className={styles.text} />
            </Box>
            <VStack className="gap-0.5 flex-1">
              <Heading className="text-[17px] font-black text-phaseText-primary tracking-tight">
                {capability.title}
              </Heading>
              <Text className="text-[10px] font-bold text-phaseText-muted uppercase tracking-[2px]">
                {capability.atlasFamily ?? 'Principal ERP'}
              </Text>
            </VStack>
          </HStack>
          <Box className="px-3 py-1 rounded-full bg-phase-interactive/10 border border-phase-interactive/20">
            <Text className="text-[9px] font-black text-phase-interactive uppercase tracking-widest leading-none">
              {capability.status}
            </Text>
          </Box>
        </HStack>

        <Text className="text-[13px] leading-[20px] text-phaseText-secondary font-bold opacity-90">
          {capability.description}
        </Text>

        <HStack className="pt-4 border-t border-phase-border/50 justify-between items-center">
          <HStack className="gap-2 items-center">
            <Box className="w-1.5 h-1.5 rounded-full bg-phaseText-muted/20" />
            <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest opacity-60">
              Management Workspace
            </Text>
          </HStack>
          <Icon as={ArrowRight} size="xs" className="text-phaseText-muted opacity-30" />
        </HStack>
      </VStack>
    </Box>
  );
}

export default function PrincipalModuleAtlas({
  capabilityIds = DEFAULT_ATLAS_CAPABILITIES,
  title = 'Institutional Atlas',
  subtitle = 'Extensible ERP infrastructure for governing institutional growth and compliance.',
}: PrincipalModuleAtlasProps) {
  const capabilities = capabilityIds.map((id) => PRINCIPAL_CAPABILITY_REGISTRY[id]).filter(Boolean);

  return (
    <VStack className="gap-6">
      <VStack className="gap-1.5 px-1">
        <Heading className="text-[24px] font-black text-phaseText-primary tracking-tight">
          {title}
        </Heading>
        <Text className="text-[13px] leading-[18px] text-phaseText-secondary font-bold opacity-80">
          {subtitle}
        </Text>
      </VStack>
      <VStack className="gap-4">
        {capabilities.map((capability) => (
          <CapabilityCard key={capability.id} capability={capability} />
        ))}
        {capabilities.length === 0 && (
          <Box className="p-16 items-center justify-center bg-phase-canvas rounded-[40px] border border-dashed border-phase-border opacity-60">
            <Text className="text-[14px] font-black text-phaseText-muted italic tracking-widest uppercase text-center">
              Atlas Mapping Incomplete
            </Text>
          </Box>
        )}
      </VStack>
    </VStack>
  );
}
